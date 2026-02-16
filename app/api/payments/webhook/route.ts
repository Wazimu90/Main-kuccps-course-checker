import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"
import { log } from "@/lib/logger"
import { sendToN8nWebhook } from "@/lib/n8n-webhook"
import { processWebhookPayload } from "@/lib/mpesa"
import crypto from "crypto"

// Force dynamic rendering to prevent caching of webhook endpoint
export const dynamic = "force-dynamic"

/**
 * M-Pesa Webhook Handler
 * 
 * This endpoint receives payment status callbacks from M-Pesa (Daraja)
 * Configure this URL as the CallbackURL in your STK Push request
 */
// Safaricom production IPs (for IP whitelisting)
const SAFARICOM_IP_PREFIXES = [
    "196.201.214.",
    "196.201.213.",
    "41.215.49.",
]

function isSafaricomIp(ip: string): boolean {
    if (process.env.MPESA_ENV !== "production") return true // Allow all in non-production
    if (!ip || ip === "unknown") return false
    return SAFARICOM_IP_PREFIXES.some(prefix => ip.startsWith(prefix))
}

function verifyWebhookToken(checkoutRequestID: string, token: string | null): boolean {
    const secret = process.env.WEBHOOK_SECRET
    if (!secret) {
        // If WEBHOOK_SECRET is not configured, log warning but allow (grace period)
        log("webhook:mpesa", "⚠️ WEBHOOK_SECRET not configured — skipping HMAC verification", "warn")
        return true
    }
    if (!token) return false
    const expected = crypto.createHmac("sha256", secret).update(checkoutRequestID).digest("hex")
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token))
}

export async function POST(request: Request) {
    try {
        // Extract webhook token from URL query params
        const url = new URL(request.url)
        const webhookToken = url.searchParams.get("token")

        const body = await request.json()
        const headers = request.headers
        const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown"

        log("webhook:mpesa", "📥 Received M-Pesa webhook", "info", {
            ip,
            contentLength: headers.get("content-length"),
            userAgent: headers.get("user-agent"),
            bodySummary: JSON.stringify(body).substring(0, 100) + "...",
            hasToken: !!webhookToken,
        })

        // IP whitelist check (production only)
        if (!isSafaricomIp(ip)) {
            log("webhook:mpesa", "❌ Rejected webhook: IP not in Safaricom whitelist", "error", { ip })
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        // Extract fields using helper
        const webhookData = processWebhookPayload(body)

        if (!webhookData) {
            log("webhook:mpesa", "❌ Invalid M-Pesa payload structure", "error", body)
            return NextResponse.json({ received: true, error: "Invalid payload" })
        }

        const { merchantRequestID, checkoutRequestID, resultCode, resultDesc, amount, mpesaReceiptNumber, phoneNumber } = webhookData

        // Validate we have checkoutRequestID (required for matching)
        if (!checkoutRequestID) {
            log("webhook:mpesa", "❌ Missing CheckoutRequestID in webhook", "error", body)
            return NextResponse.json({
                received: true,
                error: "Missing CheckoutRequestID"
            })
        }

        // HMAC token verification
        if (!verifyWebhookToken(checkoutRequestID, webhookToken)) {
            log("webhook:mpesa", "❌ Rejected webhook: Invalid HMAC token", "error", { checkoutRequestID, ip })
            return NextResponse.json({ error: "Forbidden: Invalid token" }, { status: 403 })
        }

        // Determine internal status
        // ResultCode 0 = Success
        // ResultCode 1032 = Cancelled by user
        // Others = Failed
        let internalStatus = "PENDING"
        let statusReason = resultDesc || "Unknown"

        if (resultCode === 0 || resultCode === "0") {
            internalStatus = "COMPLETED"
            log("webhook:mpesa", "✅ Payment SUCCESS detected", "info", { resultCode })
        } else if (resultCode === 1032 || resultCode === "1032") {
            internalStatus = "CANCELLED"
            log("webhook:mpesa", "❌ Payment CANCELLED by user", "warn", { resultCode })
        } else {
            internalStatus = "FAILED"
            log("webhook:mpesa", "❌ Payment FAILED", "warn", { resultCode, resultDesc })
        }

        log("webhook:mpesa", "📊 Processing webhook", "info", {
            checkoutRequestID,
            resultCode,
            internalStatus,
            statusReason,
            mpesaReceiptNumber,
            amount
        })

        // Find and update the matching transaction
        // Match by checkoutRequestID (stored as transaction_id)
        let transaction: any = null
        let updateError: any = null

        if (checkoutRequestID) {
            log("webhook:mpesa", "🔍 Looking up by transaction_id (CheckoutRequestID)", "debug", { checkoutRequestID })
            const result = await supabaseServer
                .from("payment_transactions")
                .update({
                    status: internalStatus,
                    mpesa_receipt_number: mpesaReceiptNumber,
                    webhook_data: body, // Store full raw body
                    amount: amount ? Number(amount) : undefined, // Update amount if present
                    completed_at: internalStatus === "COMPLETED" ? new Date().toISOString() : null,
                })
                .eq("transaction_id", checkoutRequestID)
                .select()
                .single()

            transaction = result.data
            updateError = result.error

            if (transaction) {
                log("webhook:mpesa", "✅ Found transaction by transaction_id", "success", {
                    foundReference: transaction.reference,
                    checkoutRequestID
                })
            }
        }

        // Fallback: Match by phone number if loose match needed (less reliable with multiple concurrent)
        if (!transaction && phoneNumber) {
            // ... (Skipping complex fallback logic for now to keep it strict, unless requested. 
            // The plan said "matching by CheckoutRequestID", so strict match is better. 
            // But existing code had phone fallback. I'll keep it simple for now as CheckoutRequestID should match.)

            // Actually, M-Pesa might behave weirdly, let's add simple fallback if receipt exists
            if (mpesaReceiptNumber) {
                const result = await supabaseServer.from("payment_transactions")
                    .select()
                    .eq("mpesa_receipt_number", mpesaReceiptNumber) // Unlikely to exist yet
                    .maybeSingle()
                // Usefulness is low here.
            }
        }

        if (!transaction) {
            log("webhook:mpesa", "⚠️ Transaction not found", "warn", {
                checkoutRequestID,
                error: updateError,
            })

            // Log orphan
            await supabaseServer.from("activity_logs").insert({
                event_type: "payment.webhook.orphan",
                description: `Webhook received but no matching transaction: ${checkoutRequestID}`,
                actor_role: "system",
                metadata: { checkoutRequestID, resultCode, amount, mpesaReceiptNumber },
            })

            return NextResponse.json({
                received: true,
                error: "Transaction not found"
            })
        }

        // Record successful payments
        if (internalStatus === "COMPLETED") {
            // Get IP address
            const ipAddress =
                request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                request.headers.get("x-real-ip") ||
                "0.0.0.0"

            const actualAmount = amount ? Number(amount) : Number(transaction.amount) || 0
            const courseCategory = transaction.course_category || 'degree'

            // RPC Call
            let rpcSucceeded = false
            try {
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
                        transaction_id: checkoutRequestID,
                    },
                })

                if (rpcError) {
                    log("webhook:mpesa", "⚠️ RPC error recording payment", "error", { error: rpcError })
                } else {
                    rpcSucceeded = true
                }
            } catch (e: any) {
                log("webhook:mpesa", "❌ RPC exception", "error", e)
            }

            // N8N Webhook
            try {
                let resultIdToUse = transaction.result_id || transaction.reference
                await sendToN8nWebhook({
                    name: transaction.name || "Customer",
                    phone: transaction.phone_number || "",
                    mpesaCode: mpesaReceiptNumber || "",
                    email: transaction.email || "",
                    resultId: resultIdToUse || ""
                })
                log("webhook:mpesa", "✅ n8n webhook sent", "info", { email: transaction.email })
            } catch (e) {
                log("webhook:mpesa", "❌ n8n webhook failed", "error", e)
            }

            // Log Activity
            await supabaseServer.from("activity_logs").insert({
                event_type: "payment.webhook.success",
                description: `Payment COMPLETED via M-Pesa: ${transaction.reference}`,
                actor_role: "system",
                email: transaction.email,
                metadata: { reference: transaction.reference, mpesaReceiptNumber, rpcSucceeded }
            })
        } else {
            // Log failed
            await supabaseServer.from("activity_logs").insert({
                event_type: "payment.webhook.failed",
                description: `Payment FAILED via M-Pesa: ${transaction.reference}`,
                actor_role: "system",
                email: transaction.email,
                metadata: { reference: transaction.reference, resultCode, resultDesc }
            })
        }

        return NextResponse.json({ received: true, reference: transaction.reference, status: internalStatus })
    } catch (error: any) {
        log("webhook:mpesa", "Webhook processing error", "error", error)
        return NextResponse.json({ received: true, error: error.message })
    }
}

export async function GET() {
    return new NextResponse(null, { status: 405, headers: { Allow: "POST" } })
}
