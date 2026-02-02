import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"
import { log } from "@/lib/logger"
import { sendToN8nWebhook } from "@/lib/n8n-webhook"

// Force dynamic rendering to prevent caching of webhook endpoint
export const dynamic = "force-dynamic"

/**
 * PesaFlux Webhook Handler
 * 
 * This endpoint receives payment status callbacks from PesaFlux
 * Configure this URL in your PesaFlux dashboard: https://yourdomain.com/api/payments/webhook
 * 
 * Expected webhook payload (from PesaFlux docs):
 * {
 *   "ResponseCode": 0,
 *   "ResponseDescription": "Success. Request accepted for processing",
 *   "MerchantRequestID": "...",
 *   "CheckoutRequestID": "...",
 *   "TransactionID": "SOFTPID...",
 *   "TransactionAmount": 2,
 *   "TransactionReceipt": "SIS88JC7AM",
 *   "TransactionDate": "20240928222012",
 *   "TransactionReference": "8803416",
 *   "Msisdn": "254769290734"
 * }
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()

        log("webhook:pesaflux", "📥 Received PesaFlux webhook - RAW PAYLOAD", "info", body)

        // Extract fields from PesaFlux callback (per official docs)
        const responseCode = body.ResponseCode
        const transactionId = body.TransactionID
        const mpesaReceiptNumber = body.TransactionReceipt
        const amount = body.TransactionAmount
        const phone = body.Msisdn
        const transactionReference = body.TransactionReference

        // Validate we have transaction ID (required for matching)
        if (!transactionId && !phone) {
            log("webhook:pesaflux", "❌ Missing TransactionID and Msisdn in webhook", "error", body)
            return NextResponse.json({
                received: true,
                error: "Missing TransactionID and Msisdn"
            })
        }

        // Map PesaFlux ResponseCode to our internal status
        // Per PesaFlux docs: ResponseCode 0 = Success
        let internalStatus = "PENDING"
        let statusReason = body.ResponseDescription || "Unknown"

        // ResponseCode values from PesaFlux docs:
        // 0 = Success
        // 1032 = Cancelled by user
        // 1037 = Timeout
        // 1019 = Transaction expired
        // 1025/9999 = Error sending push
        if (responseCode === 0 || responseCode === "0") {
            internalStatus = "COMPLETED"
            log("webhook:pesaflux", "✅ Payment SUCCESS detected", "info", { responseCode })
        } else if (responseCode === 1032 || responseCode === "1032") {
            internalStatus = "CANCELLED"
        } else if (responseCode === 1037 || responseCode === "1037" ||
            responseCode === 1019 || responseCode === "1019") {
            internalStatus = "FAILED"
            statusReason = "Timeout or expired"
        } else if (responseCode !== undefined && responseCode !== null) {
            internalStatus = "FAILED"
        }

        log("webhook:pesaflux", "📊 Processing webhook", "info", {
            transactionId,
            responseCode,
            internalStatus,
            statusReason,
            mpesaReceiptNumber,
            amount,
            phone
        })

        // Find and update the matching transaction
        // Strategy 1: Match by transaction_id (stored during STK init as transaction_request_id)
        let transaction: any = null
        let updateError: any = null

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

        // Strategy 2: Match by phone number (Msisdn) for recent PENDING transactions
        if (!transaction && phone) {
            log("webhook:pesaflux", "🔍 Looking up by phone number", "debug", { phone })
            const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()

            // Normalize phone to 254xxx format
            let normalizedPhone = phone
            if (phone.startsWith("0") && phone.length === 10) {
                normalizedPhone = "254" + phone.substring(1)
            }

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
                .eq("phone_number", normalizedPhone)
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
                    phone: normalizedPhone
                })
            }
        }

        if (!transaction) {
            log("webhook:pesaflux", "⚠️ Transaction not found", "warn", {
                transactionId,
                phone,
                error: updateError,
            })

            // Return 200 to prevent retries - log for manual review
            await supabaseServer.from("activity_logs").insert({
                event_type: "payment.webhook.orphan",
                description: `Webhook received but no matching transaction: ${transactionId || phone}`,
                actor_role: "system",
                metadata: { transactionId, phone, responseCode, amount, mpesaReceiptNumber },
            })

            return NextResponse.json({
                received: true,
                error: "Transaction not found"
            })
        }

        log("webhook:pesaflux", "Transaction updated successfully", "success", {
            reference: transaction.reference,
            status: internalStatus,
        })

        // If payment is completed, record it in the payments table
        if (internalStatus === "COMPLETED") {
            // Get IP address from request headers (needed for both RPC and logging)
            const ipAddress =
                request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                request.headers.get("x-real-ip") ||
                "0.0.0.0"

            // Use actual paid amount from webhook
            const actualAmount = amount ? Number(amount) : Number(transaction.amount) || 200
            const courseCategory = transaction.course_category || 'degree'

            // ============================================================
            // STEP 1: Record Payment via RPC (may fail, but we continue)
            // ============================================================
            let rpcSucceeded = false
            try {
                log("webhook:pesaflux", "Recording payment to payments table", "info", {
                    reference: transaction.reference,
                    email: transaction.email,
                    amount: actualAmount,
                    courseCategory,
                })

                const { error: rpcError } = await supabaseServer.rpc("fn_record_payment_and_update_user", {
                    p_name: transaction.name,
                    p_email: transaction.email,
                    p_phone: transaction.phone_number,
                    p_amount: actualAmount,
                    p_ip: ipAddress,
                    p_course_category: courseCategory,
                    p_agent_id: null,
                    p_paid_at: transaction.completed_at || new Date().toISOString(),
                    p_metadata: {
                        reference: transaction.reference,
                        mpesa_receipt_number: mpesaReceiptNumber,
                        transaction_id: transactionId,
                    },
                })

                if (rpcError) {
                    log("webhook:pesaflux", "⚠️ RPC error recording payment (continuing to n8n webhook anyway)", "error", {
                        reference: transaction.reference,
                        error: rpcError,
                    })
                    // Don't throw! We still want to send the n8n webhook
                } else {
                    rpcSucceeded = true
                    log("webhook:pesaflux", "✅ Payment recorded successfully via RPC", "success", {
                        reference: transaction.reference,
                        email: transaction.email,
                    })
                }
            } catch (rpcException: any) {
                log("webhook:pesaflux", "❌ RPC exception (continuing to n8n webhook anyway)", "error", {
                    reference: transaction.reference,
                    error: rpcException?.message || String(rpcException),
                })
            }

            // ============================================================
            // STEP 2: Send n8n Webhook (ALWAYS runs for COMPLETED payments)
            // ============================================================
            log("webhook:pesaflux", "🚀 Starting n8n webhook process (independent of RPC)", "info", {
                email: transaction.email,
                reference: transaction.reference,
                rpcSucceeded
            })

            try {
                // 1. Attempt to fetch result_id from payments table
                let resultIdToUse = transaction.result_id || transaction.reference;

                if (transaction.email && transaction.phone_number) {
                    const { data: paymentRecord } = await supabaseServer
                        .from("payments")
                        .select("result_id")
                        .eq("email", transaction.email)
                        .eq("phone_number", transaction.phone_number)
                        .not("result_id", "is", null)
                        .order("created_at", { ascending: false })
                        .limit(1)
                        .maybeSingle();

                    if (paymentRecord?.result_id) {
                        resultIdToUse = paymentRecord.result_id;
                        log("webhook:pesaflux", "🔹 ResultID found in payments table", "info", { resultId: resultIdToUse });
                    } else {
                        log("webhook:pesaflux", "🔹 No result_id in payments table, using fallback", "info", { fallback: resultIdToUse });
                    }
                }

                log("webhook:pesaflux", "📤 Calling n8n webhook NOW", "info", {
                    email: transaction.email,
                    resultId: resultIdToUse,
                    phone: transaction.phone_number,
                    name: transaction.name
                });

                // 2. Prepare payload and send
                const webhookResult = await sendToN8nWebhook({
                    name: transaction.name || "Valued Customer",
                    phone: transaction.phone_number || phone || "",
                    mpesaCode: mpesaReceiptNumber || transaction.mpesa_receipt_number || "PENDING",
                    email: transaction.email || "",
                    resultId: resultIdToUse || ""
                })

                if (webhookResult.success) {
                    log("webhook:pesaflux", "✅ n8n webhook sent successfully!", "success", {
                        email: transaction.email,
                        resultId: resultIdToUse
                    })

                    await supabaseServer.from("activity_logs").insert({
                        event_type: "webhook.n8n.success",
                        description: `Successfully sent user details to n8n for ${transaction.email}`,
                        actor_role: "system",
                        email: transaction.email,
                        metadata: {
                            resultId: resultIdToUse,
                            reference: transaction.reference,
                            rpcSucceeded
                        },
                    })
                } else {
                    log("webhook:pesaflux", "⚠️ n8n webhook FAILED", "warn", {
                        reason: webhookResult.error,
                        email: transaction.email
                    })

                    await supabaseServer.from("activity_logs").insert({
                        event_type: "webhook.n8n.failed",
                        description: `N8N Webhook failed: ${webhookResult.error}`,
                        actor_role: "system",
                        email: transaction.email,
                        metadata: {
                            error: webhookResult.error,
                            reference: transaction.reference,
                            rpcSucceeded
                        },
                    })
                }
            } catch (webhookError: any) {
                log("webhook:pesaflux", "❌ n8n webhook exception", "error", {
                    error: webhookError?.message || String(webhookError),
                    email: transaction.email
                })

                await supabaseServer.from("activity_logs").insert({
                    event_type: "webhook.n8n.exception",
                    description: `N8N Webhook threw exception: ${webhookError?.message}`,
                    actor_role: "system",
                    email: transaction.email,
                    metadata: {
                        error: webhookError?.message || String(webhookError),
                        reference: transaction.reference
                    },
                }).catch(() => { }) // Ignore insert errors
            }

            // ============================================================
            // STEP 3: Log overall activity
            // ============================================================
            await supabaseServer.from("activity_logs").insert({
                event_type: rpcSucceeded ? "payment.webhook.success" : "payment.webhook.partial",
                description: `Payment COMPLETED via webhook: ${transaction.reference}${rpcSucceeded ? "" : " (RPC failed but n8n attempted)"}`,
                actor_role: "system",
                email: transaction.email,
                phone_number: transaction.phone_number,
                ip_address: ipAddress,
                metadata: {
                    reference: transaction.reference,
                    amount: actualAmount,
                    mpesa_receipt_number: mpesaReceiptNumber,
                    rpcSucceeded
                },
            }).catch((logError) => {
                log("webhook:pesaflux", "Failed to insert activity log", "warn", { logError })
            })
        } else if (internalStatus === "FAILED" || internalStatus === "CANCELLED") {
            // Log failed/cancelled payment
            await supabaseServer.from("activity_logs").insert({
                event_type: "payment.webhook.failed",
                description: `Payment ${internalStatus.toLowerCase()} via webhook: ${transaction.reference}`,
                actor_role: "system",
                email: transaction.email,
                phone_number: transaction.phone_number,
                metadata: {
                    reference: transaction.reference,
                    responseCode,
                    reason: statusReason,
                },
            })
        }

        // Always return 200 OK to acknowledge receipt
        return NextResponse.json({
            received: true,
            reference: transaction.reference,
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
