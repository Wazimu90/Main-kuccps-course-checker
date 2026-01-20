import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"
import { log } from "@/lib/logger"

// Force dynamic rendering to prevent caching of webhook endpoint
export const dynamic = "force-dynamic"

/**
 * PesaFlux Webhook Handler
 * 
 * This endpoint receives payment status callbacks from PesaFlux
 * Configure this URL in your PesaFlux dashboard: https://yourdomain.com/api/payments/webhook
 * 
 * Expected webhook payload (based on PesaFlux documentation):
 * {
 *   "status": "success" | "failed" | "cancelled" | "timeout",
 *   "reference": "PAY-1234567890-ABC12",
 *   "transaction_id": "PF1234567890",
 *   "mpesa_receipt_number": "QAB1CD2EFG",
 *   "amount": 200,
 *   "phone": "254712345678",
 *   "timestamp": "2024-01-01T12:00:00Z"
 * }
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()

        log("webhook:pesaflux", "📥 Received PesaFlux webhook - RAW PAYLOAD", "info", body)

        // PesaFlux ACTUAL payload format (confirmed from real webhook data):
        // {
        //   "ResultCode": "200",
        //   "ResultDesc": "Success. Request accepted for processing",
        //   "TransactionID": "SOFTPID...",
        //   "TransactionStatus": "Completed",
        //   "TransactionCode": "0",
        //   "TransactionReceipt": "SIS...",
        //   "TransactionAmount": "10",
        //   "Msisdn": "254...",
        //   "TransactionDate": "...",
        //   "TransactionReference": "..."
        // }

        const reference = body.TransactionReference || body.reference
        // CRITICAL FIX: PesaFlux sends "ResultCode" NOT "ResponseCode"
        const resultCode = body.ResultCode || body.ResponseCode
        const transactionCode = body.TransactionCode
        const transactionStatus = body.TransactionStatus
        const transactionId = body.TransactionID
        const mpesaReceiptNumber = body.TransactionReceipt
        const amount = body.TransactionAmount
        const phone = body.Msisdn

        // Validate required fields
        if (!reference) {
            log("webhook:pesaflux", "❌ Missing TransactionReference in webhook", "error", body)
            // Still return 200 to prevent retries
            return NextResponse.json({
                received: true,
                error: "Missing TransactionReference"
            })
        }

        // Map PesaFlux response to our internal status
        // CRITICAL FIX: Support multiple ways to detect success:
        // 1. TransactionStatus === "Completed" (most reliable)
        // 2. TransactionCode === "0" (also indicates success)
        // 3. ResultCode === "200" (success response code)
        let internalStatus = "PENDING"
        let statusReason = body.ResultDesc || body.ResponseDescription || "Unknown"

        // Check for SUCCESS - multiple indicators
        const isSuccess =
            transactionStatus === "Completed" ||
            transactionCode === "0" || transactionCode === 0 ||
            resultCode === "200" || resultCode === 200 ||
            resultCode === "0" || resultCode === 0

        // Check for CANCELLED
        const isCancelled =
            transactionStatus === "Cancelled" ||
            resultCode === "1032" || resultCode === 1032

        // Check for TIMEOUT/FAILED
        const isTimeout =
            transactionStatus === "Timeout" ||
            resultCode === "1037" || resultCode === 1037 ||
            resultCode === "1019" || resultCode === 1019

        if (isSuccess) {
            internalStatus = "COMPLETED"
            log("webhook:pesaflux", "✅ Payment SUCCESS detected", "info", {
                transactionStatus,
                transactionCode,
                resultCode,
            })
        } else if (isCancelled) {
            internalStatus = "CANCELLED"
        } else if (isTimeout) {
            internalStatus = "FAILED"
            statusReason = "Timeout or expired"
        } else if (resultCode && resultCode !== "200") {
            // Any other non-success code
            internalStatus = "FAILED"
        }

        log("webhook:pesaflux", "📊 Processing webhook", "info", {
            reference,
            resultCode,
            transactionCode,
            transactionStatus,
            internalStatus,
            statusReason,
            mpesaReceiptNumber,
            transactionId,
            amount,
            phone
        })

        // CRITICAL FIX: PesaFlux sends its own TransactionReference (like "8803416")
        // but our database stores our own reference format (like "PAY-xxx").
        // We need to find the transaction by:
        // 1. First try: Match by transaction_id (stored during STK init)
        // 2. Second try: Match by phone number + recent PENDING status
        // 3. Third try: Match by reference (in case they match)

        let transaction: any = null
        let updateError: any = null

        // Strategy 1: Try to find by transaction_id (most reliable if stored)
        if (transactionId) {
            log("webhook:pesaflux", "🔍 Looking up by transaction_id", "debug", { transactionId })
            const result = await supabaseServer
                .from("payment_transactions")
                .update({
                    status: internalStatus,
                    mpesa_receipt_number: mpesaReceiptNumber,
                    webhook_data: body,
                    amount: amount,
                    completed_at: internalStatus === "COMPLETED" ? new Date().toISOString() : null,
                })
                .eq("transaction_id", transactionId)
                .eq("status", "PENDING")
                .select()
                .single()

            transaction = result.data
            updateError = result.error

            if (transaction) {
                log("webhook:pesaflux", "✅ Found transaction by transaction_id", "success", {
                    foundReference: transaction.reference,
                    transactionId
                })
            }
        }

        // Strategy 2: Find by phone number + recent PENDING transaction (within last 10 minutes)
        // CRITICAL: Normalize phone numbers - PesaFlux sends 254xxx, but DB might store 07xxx or 254xxx
        if (!transaction && phone) {
            log("webhook:pesaflux", "🔍 Looking up by phone number", "debug", { phone })
            const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()

            // Generate both phone formats to try
            let phoneVariants: string[] = [phone]

            // If phone is 254xxx format, also try 0xxx format
            if (phone.startsWith("254") && phone.length === 12) {
                phoneVariants.push("0" + phone.substring(3)) // 254768xxx -> 0768xxx
            }
            // If phone is 0xxx format, also try 254xxx format
            if (phone.startsWith("0") && phone.length === 10) {
                phoneVariants.push("254" + phone.substring(1)) // 0768xxx -> 254768xxx
            }

            log("webhook:pesaflux", "🔍 Trying phone variants", "debug", { phoneVariants })

            // Try each phone format
            for (const phoneVariant of phoneVariants) {
                if (transaction) break // Already found

                const result = await supabaseServer
                    .from("payment_transactions")
                    .update({
                        status: internalStatus,
                        mpesa_receipt_number: mpesaReceiptNumber,
                        transaction_id: transactionId,
                        webhook_data: body,
                        amount: amount,
                        completed_at: internalStatus === "COMPLETED" ? new Date().toISOString() : null,
                    })
                    .eq("phone_number", phoneVariant)
                    .eq("status", "PENDING")
                    .gte("created_at", tenMinutesAgo)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .select()
                    .single()

                transaction = result.data
                updateError = result.error

                if (transaction) {
                    log("webhook:pesaflux", "✅ Found transaction by phone number", "success", {
                        foundReference: transaction.reference,
                        phone
                    })
                }
            }
        }

        // Strategy 3: Try by reference as fallback (in case PesaFlux sends our reference back)
        if (!transaction && reference) {
            log("webhook:pesaflux", "🔍 Looking up by reference (fallback)", "debug", { reference })
            const result = await supabaseServer
                .from("payment_transactions")
                .update({
                    status: internalStatus,
                    mpesa_receipt_number: mpesaReceiptNumber,
                    transaction_id: transactionId,
                    webhook_data: body,
                    amount: amount,
                    completed_at: internalStatus === "COMPLETED" ? new Date().toISOString() : null,
                })
                .eq("reference", reference)
                .select()
                .single()

            transaction = result.data
            updateError = result.error

            if (transaction) {
                log("webhook:pesaflux", "✅ Found transaction by reference", "success", { reference })
            }
        }

        if (!transaction) {
            log("webhook:pesaflux", "⚠️ Transaction not found with any lookup strategy, attempting recovery", "warn", {
                reference,
                transactionId,
                phone,
                error: updateError,
            })

            // CRITICAL FIX: If transaction doesn't exist (initiation failed but payment succeeded),
            // create a recovery record with available data from webhook
            if (internalStatus === "COMPLETED") {
                try {
                    const { data: recoveryTransaction, error: insertError } = await supabaseServer
                        .from("payment_transactions")
                        .insert({
                            reference,
                            transaction_id: transactionId,
                            phone_number: phone || "UNKNOWN",
                            email: "recovery@kuccpschecker.com", // Placeholder - will be updated if user contacts support
                            name: "Payment Recovery",
                            amount: amount || 200,
                            course_category: null,
                            status: internalStatus,
                            mpesa_receipt_number: mpesaReceiptNumber,
                            webhook_data: body,
                            completed_at: new Date().toISOString(),
                            created_at: new Date().toISOString(),
                        })
                        .select()
                        .single()

                    if (insertError || !recoveryTransaction) {
                        log("webhook:pesaflux", "❌ Recovery record creation failed", "error", {
                            reference,
                            error: insertError,
                        })

                        // Return 200 to prevent retries, but log critical error
                        await supabaseServer.from("activity_logs").insert({
                            event_type: "payment.webhook.critical_error",
                            description: `CRITICAL: Payment succeeded but record creation failed: ${reference}`,
                            actor_role: "system",
                            metadata: { reference, amount, phone, mpesaReceiptNumber, error: String(insertError) },
                        })

                        return NextResponse.json({
                            received: true,
                            error: "Recovery failed - manual intervention required"
                        })
                    }

                    log("webhook:pesaflux", "✅ Recovery record created successfully", "success", {
                        reference,
                        amount,
                    })

                    // Use recovery transaction for further processing
                    transaction = recoveryTransaction
                } catch (recoveryError) {
                    log("webhook:pesaflux", "💥 Recovery process exception", "error", recoveryError)
                    return NextResponse.json({
                        received: true,
                        error: "Recovery exception"
                    })
                }
            } else {
                // Not a completed payment, safe to ignore
                return NextResponse.json({
                    received: true,
                    error: "Transaction not found (non-completed payment)"
                })
            }
        }

        log("webhook:pesaflux", "Transaction updated successfully", "success", {
            reference,
            status: internalStatus,
        })

        // If payment is completed, record it in the payments table
        if (internalStatus === "COMPLETED") {
            try {
                // Get course category from the payment transaction
                // CRITICAL: Ensure valid category for payments table constraint
                const rawCategory = transaction.course_category || null
                const validCategories = ['degree', 'diploma', 'certificate', 'artisan', 'kmtc']
                const courseCategory = rawCategory && validCategories.includes(rawCategory.toLowerCase())
                    ? rawCategory.toLowerCase()
                    : 'degree' // Default to degree if missing/invalid

                log("webhook:pesaflux", "Recording payment to payments table", "info", {
                    reference,
                    email: transaction.email,
                    amount: transaction.amount,
                    amountType: typeof transaction.amount,
                    amountNumber: Number(transaction.amount),
                    courseCategory,
                    rawCategory: transaction.course_category,
                })

                // Get IP address from request headers
                const ipAddress =
                    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                    request.headers.get("x-real-ip") ||
                    "0.0.0.0"

                // CRITICAL: Ensure we're using the actual paid amount from transaction
                const actualAmount = Number(transaction.amount)

                log("webhook:pesaflux", "Calling RPC function with parameters", "debug", {
                    p_name: transaction.name,
                    p_email: transaction.email,
                    p_phone: transaction.phone_number,
                    p_amount: actualAmount,
                    p_ip: ipAddress,
                    p_course_category: courseCategory,
                })

                // Record payment using the existing RPC function
                const { error: rpcError } = await supabaseServer.rpc("fn_record_payment_and_update_user", {
                    p_name: transaction.name,
                    p_email: transaction.email,
                    p_phone: transaction.phone_number,
                    p_amount: actualAmount, // Use the actual paid amount
                    p_ip: ipAddress,
                    p_course_category: courseCategory, // Now guaranteed to be valid
                    p_agent_id: null, // Could be extracted from transaction metadata if stored
                    p_paid_at: transaction.completed_at || new Date().toISOString(),
                    p_metadata: {
                        reference,
                        mpesa_receipt_number: mpesaReceiptNumber,
                        transaction_id: transactionId,
                    },
                })

                if (rpcError) {
                    log("webhook:pesaflux", "RPC error recording payment", "error", {
                        reference,
                        error: rpcError,
                        attemptedAmount: actualAmount,
                    })
                    throw rpcError
                }

                log("webhook:pesaflux", "Payment recorded successfully", "success", {
                    reference,
                    email: transaction.email,
                })

                // Log activity
                await supabaseServer.from("activity_logs").insert({
                    event_type: "payment.webhook.success",
                    description: `Payment completed via webhook: ${reference}`,
                    actor_role: "system",
                    email: transaction.email,
                    phone_number: transaction.phone_number,
                    ip_address: ipAddress,
                    metadata: {
                        reference,
                        amount: transaction.amount,
                        mpesa_receipt_number: mpesaReceiptNumber,
                    },
                })
            } catch (error) {
                log("webhook:pesaflux", "Failed to record payment", "error", error)

                // Log the error but still return 200 to PesaFlux
                await supabaseServer.from("activity_logs").insert({
                    event_type: "payment.webhook.error",
                    description: `Failed to record payment: ${reference}`,
                    actor_role: "system",
                    email: transaction.email,
                    metadata: { reference, error: String(error) },
                })
            }
        } else if (internalStatus === "FAILED") {
            // Log failed payment
            await supabaseServer.from("activity_logs").insert({
                event_type: "payment.webhook.failed",
                description: `Payment failed via webhook: ${reference}`,
                actor_role: "system",
                email: transaction.email,
                phone_number: transaction.phone_number,
                metadata: {
                    reference,
                    status: body.status,
                    reason: body.reason || body.message,
                },
            })
        }

        // Always return 200 OK to acknowledge receipt
        // This prevents PesaFlux from retrying the webhook
        return NextResponse.json({
            received: true,
            reference,
            status: internalStatus,
        })
    } catch (error: any) {
        log("webhook:pesaflux", "Webhook processing error", "error", error)

        // Return 200 anyway to prevent retries
        return NextResponse.json({
            received: true,
            error: error.message || "Internal error"
        })
    }
}

// Handle GET requests (for webhook verification/testing)
export async function GET(request: Request) {
    return NextResponse.json({
        service: "PesaFlux Webhook Handler",
        status: "active",
        timestamp: new Date().toISOString(),
    })
}
