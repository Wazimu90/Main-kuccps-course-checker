import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { verifyWebhookSignature } from "@/lib/paystack"
import { sendToN8nWebhook } from "@/lib/n8n-webhook"
import { log } from "@/lib/logger"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/paystack/webhook
 * 
 * Handles Paystack webhook events.
 * Verifies signature, processes charge.success events,
 * updates payment_transactions, calls RPC, sends n8n webhook.
 * 
 * MUST return 200 OK quickly — Paystack retries on non-200.
 */
export async function POST(request: Request) {
    try {
        // Read raw body for signature verification
        const rawBody = await request.text()
        const signature = request.headers.get("x-paystack-signature")

        // Verify webhook signature (HMAC SHA512)
        if (!verifyWebhookSignature(rawBody, signature)) {
            log("paystack:webhook", "Invalid webhook signature", "error")
            return NextResponse.json({ status: "error", message: "Invalid signature" }, { status: 401 })
        }

        const event = JSON.parse(rawBody)
        const eventType = event.event

        log("paystack:webhook", `Received event: ${eventType}`, "info", {
            reference: event.data?.reference,
        })

        // We only handle charge.success for now
        if (eventType !== "charge.success") {
            log("paystack:webhook", `Ignoring event type: ${eventType}`, "info")
            return NextResponse.json({ status: "ok", message: "Event ignored" })
        }

        const txData = event.data
        const reference = txData.reference
        const amountSubunit = txData.amount // in cents/kobo
        const amountKES = amountSubunit / 100
        const customerEmail = txData.customer?.email || ""
        const paystackReference = txData.reference
        const channel = txData.channel || "unknown"
        const paidAt = txData.paid_at

        log("paystack:webhook", "Processing charge.success", "info", {
            reference,
            amountKES,
            email: customerEmail,
            channel,
        })

        // Find the payment_transactions record by reference
        const { data: transaction, error: findError } = await supabase
            .from("payment_transactions")
            .select("*")
            .eq("reference", reference)
            .single()

        if (findError || !transaction) {
            log("paystack:webhook", "No payment_transactions record found for reference", "error", {
                reference,
                error: findError?.message,
            })
            // Still return 200 to avoid Paystack retries for unknown references
            return NextResponse.json({ status: "ok", message: "Transaction not found" })
        }

        // Idempotency: skip if already completed
        if (transaction.status === "COMPLETED") {
            log("paystack:webhook", "Transaction already COMPLETED, skipping", "info", { reference })
            return NextResponse.json({ status: "ok", message: "Already processed" })
        }

        // SECURITY: Verify amount matches
        if (Math.abs(amountKES - transaction.amount) > 1) {
            log("paystack:webhook", "⚠️ Amount mismatch in webhook!", "error", {
                reference,
                expectedKES: transaction.amount,
                webhookKES: amountKES,
            })
            return NextResponse.json({ status: "ok", message: "Amount mismatch" })
        }

        // Update transaction to COMPLETED
        const { error: updateError } = await supabase
            .from("payment_transactions")
            .update({
                status: "COMPLETED",
                paystack_reference: paystackReference,
                webhook_data: txData,
                completed_at: paidAt || new Date().toISOString(),
            })
            .eq("reference", reference)

        if (updateError) {
            log("paystack:webhook", "Failed to update transaction status", "error", {
                reference,
                error: updateError.message,
            })
        } else {
            log("paystack:webhook", "Transaction updated to COMPLETED", "success", { reference })
        }

        // Call RPC to record payment and update user (same as old M-Pesa webhook)
        const name = transaction.name || txData.metadata?.name || ""
        const phone = transaction.phone_number || txData.metadata?.phone || ""
        const email = transaction.email || customerEmail
        const resultId = transaction.result_id || txData.metadata?.resultId || ""
        const courseCategory = transaction.course_category || txData.metadata?.courseCategory || ""

        try {
            const { error: rpcError } = await supabase.rpc("fn_record_payment_and_update_user", {
                p_name: name,
                p_email: email,
                p_phone: phone,
                p_amount: amountKES,
                p_transaction_id: reference,
                p_payment_method: `paystack_${channel}`,
                p_result_id: resultId,
                p_course_category: courseCategory,
            })

            if (rpcError) {
                log("paystack:webhook", "RPC fn_record_payment_and_update_user failed", "error", {
                    reference,
                    error: rpcError.message,
                })
            } else {
                log("paystack:webhook", "RPC fn_record_payment_and_update_user succeeded", "success", {
                    reference,
                    email,
                })
            }
        } catch (rpcEx: any) {
            log("paystack:webhook", "RPC exception", "error", {
                reference,
                message: rpcEx.message,
            })
        }

        // Send to n8n webhook (non-blocking)
        try {
            await sendToN8nWebhook({
                name,
                phone,
                paystackReference: paystackReference || "",
                email,
                amount: amountKES,
                resultId: resultId || "",
                courseCategory,
            })
        } catch (n8nError: any) {
            log("paystack:webhook", "n8n webhook send failed (non-fatal)", "warn", {
                reference,
                error: n8nError.message,
            })
        }

        // Log activity
        try {
            await supabase.from("activity_logs").insert({
                event_type: "payment_completed",
                description: `Payment of KES ${amountKES} received via Paystack (${channel})`,
                metadata: {
                    reference,
                    email,
                    amount: amountKES,
                    channel,
                    resultId,
                },
            })
        } catch (logError: any) {
            log("paystack:webhook", "Activity log insert failed (non-fatal)", "warn", {
                error: logError.message,
            })
        }

        return NextResponse.json({ status: "ok", message: "Webhook processed" })
    } catch (error: any) {
        log("paystack:webhook", "Unhandled webhook error", "error", {
            message: error.message,
            stack: error.stack,
        })
        // Return 200 even on error to prevent Paystack retries for broken handlers
        return NextResponse.json({ status: "ok", message: "Error processing webhook" })
    }
}
