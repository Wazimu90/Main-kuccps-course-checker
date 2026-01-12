import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"
import { log } from "@/lib/logger"

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

        // PesaFlux sends: ResponseCode, TransactionReference, TransactionID, TransactionReceipt, etc.
        // Our reference is stored in TransactionReference
        const reference = body.TransactionReference || body.reference
        const responseCode = body.ResponseCode
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

        // Map PesaFlux ResponseCode to our internal status
        // ResponseCode: 0 = Success, 1032 = Cancelled, 1037 = Timeout, etc.
        let internalStatus = "PENDING"
        let statusReason = body.ResponseDescription || "Unknown"

        if (responseCode === 0 || responseCode === "0") {
            internalStatus = "COMPLETED"
        } else if (responseCode === 1032 || responseCode === "1032") {
            internalStatus = "CANCELLED"
        } else if (responseCode === 1037 || responseCode === "1037" || responseCode === 1019 || responseCode === "1019") {
            internalStatus = "FAILED"
            statusReason = "Timeout or expired"
        } else if (responseCode) {
            internalStatus = "FAILED"
        }

        log("webhook:pesaflux", "📊 Processing webhook", "info", {
            reference,
            responseCode,
            internalStatus,
            statusReason,
            mpesaReceiptNumber,
            transactionId,
            amount,
            phone
        })

        // Update payment transaction in database
        const { data: transaction, error: updateError } = await supabaseServer
            .from("payment_transactions")
            .update({
                status: internalStatus,
                mpesa_receipt_number: mpesaReceiptNumber,
                transaction_id: transactionId || transaction?.transaction_id,
                webhook_data: body, // Store full payload for debugging
                amount: amount, // Update amount with actual paid amount
                completed_at: internalStatus === "COMPLETED" ? new Date().toISOString() : null,
            })
            .eq("reference", reference)
            .select()
            .single()

        if (updateError || !transaction) {
            log("webhook:pesaflux", "Failed to update transaction", "error", {
                reference,
                error: updateError,
            })

            // Return 200 anyway to prevent PesaFlux retries
            return NextResponse.json({
                received: true,
                error: "Transaction not found"
            })
        }

        log("webhook:pesaflux", "Transaction updated successfully", "success", {
            reference,
            status: internalStatus,
        })

        // If payment is completed, record it in the payments table
        if (internalStatus === "COMPLETED") {
            try {
                // Get course category from the payment transaction
                const courseCategory = transaction.course_category || null

                log("webhook:pesaflux", "Recording payment to payments table", "info", {
                    reference,
                    email: transaction.email,
                    amount: transaction.amount,
                    courseCategory,
                })

                // Get IP address from request headers
                const ipAddress =
                    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                    request.headers.get("x-real-ip") ||
                    "0.0.0.0"

                // Record payment using the existing RPC function
                const { error: rpcError } = await supabaseServer.rpc("fn_record_payment_and_update_user", {
                    p_name: transaction.name,
                    p_email: transaction.email,
                    p_phone: transaction.phone_number,
                    p_amount: Number(transaction.amount),
                    p_ip: ipAddress,
                    p_course_category: courseCategory,
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
