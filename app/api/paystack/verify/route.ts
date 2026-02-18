import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { verifyTransaction } from "@/lib/paystack"
import { log } from "@/lib/logger"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/paystack/verify?reference=xxx
 * 
 * Verifies a Paystack transaction by reference.
 * Also validates amount against our payment_transactions record.
 * Returns: { success, status, verified, amount, reference }
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const reference = searchParams.get("reference")

        if (!reference) {
            return NextResponse.json(
                { success: false, error: "Reference is required" },
                { status: 400 }
            )
        }

        log("api:paystack:verify", "Verification request", "info", { reference })

        // Get our payment_transactions record to validate amount
        const { data: txRecord, error: txError } = await supabase
            .from("payment_transactions")
            .select("amount, status, email, result_id, course_category, name, phone_number")
            .eq("reference", reference)
            .single()

        if (txError || !txRecord) {
            log("api:paystack:verify", "No payment_transactions record found", "error", {
                reference,
                error: txError?.message,
            })
            return NextResponse.json(
                { success: false, error: "Transaction not found" },
                { status: 404 }
            )
        }

        // If already completed, return cached result without hitting Paystack API
        if (txRecord.status === "COMPLETED") {
            log("api:paystack:verify", "Transaction already completed", "info", { reference })
            return NextResponse.json({
                success: true,
                status: "success",
                verified: true,
                amount: txRecord.amount,
                reference,
                email: txRecord.email,
                resultId: txRecord.result_id,
            })
        }

        // Verify with Paystack API
        const paystackResult = await verifyTransaction(reference)

        if (!paystackResult.success) {
            log("api:paystack:verify", "Paystack verification failed", "error", {
                reference,
                error: paystackResult.error,
            })
            return NextResponse.json({
                success: true, // The API call succeeded; the tx just isn't verified
                status: "pending",
                verified: false,
                reference,
            })
        }

        const verified = paystackResult.status === "success"
        const paystackAmountKES = (paystackResult.amount || 0) / 100 // Convert from subunit

        // SECURITY: Verify payment amount matches what we expected
        if (verified && Math.abs(paystackAmountKES - txRecord.amount) > 1) {
            log("api:paystack:verify", "⚠️ Amount mismatch!", "error", {
                reference,
                expectedKES: txRecord.amount,
                receivedKES: paystackAmountKES,
            })
            return NextResponse.json(
                { success: false, error: "Payment amount mismatch", verified: false },
                { status: 400 }
            )
        }

        // If verified success, update payment_transactions status
        if (verified) {
            const { error: updateError } = await supabase
                .from("payment_transactions")
                .update({
                    status: "COMPLETED",
                    paystack_reference: paystackResult.reference || reference,
                    webhook_data: paystackResult.rawData,
                    completed_at: new Date().toISOString(),
                })
                .eq("reference", reference)

            if (updateError) {
                log("api:paystack:verify", "Failed to update transaction status", "error", {
                    reference,
                    error: updateError.message,
                })
            } else {
                log("api:paystack:verify", "Transaction marked as COMPLETED", "success", { reference })
            }
        } else if (paystackResult.status === "failed" || paystackResult.status === "abandoned") {
            // Update to FAILED
            await supabase
                .from("payment_transactions")
                .update({
                    status: "FAILED",
                    webhook_data: paystackResult.rawData,
                })
                .eq("reference", reference)
        }

        return NextResponse.json({
            success: true,
            status: paystackResult.status,
            verified,
            amount: txRecord.amount,
            reference,
            email: txRecord.email,
            resultId: txRecord.result_id,
            channel: paystackResult.channel,
        })
    } catch (error: any) {
        log("api:paystack:verify", "Unhandled error in verification", "error", {
            message: error.message,
        })
        return NextResponse.json(
            { success: false, error: "An unexpected error occurred" },
            { status: 500 }
        )
    }
}
