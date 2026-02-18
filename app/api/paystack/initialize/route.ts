import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { initializeTransaction } from "@/lib/paystack"
import { log } from "@/lib/logger"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/paystack/initialize
 * 
 * Initializes a Paystack transaction and creates a payment_transactions record.
 * Body: { email, amount, name, courseCategory, resultId, phone }
 * Returns: { success, accessCode, reference, authorizationUrl }
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, amount, name, courseCategory, resultId, phone } = body

        log("api:paystack:init", "Payment initialization request", "info", {
            email,
            amount,
            courseCategory,
            hasResultId: !!resultId,
            hasPhone: !!phone,
        })

        // Validate required fields
        if (!email || !amount) {
            return NextResponse.json(
                { success: false, error: "Email and amount are required" },
                { status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, error: "Invalid email format" },
                { status: 400 }
            )
        }

        // Validate amount
        const numericAmount = Number(amount)
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return NextResponse.json(
                { success: false, error: "Invalid payment amount" },
                { status: 400 }
            )
        }

        // Generate unique reference
        const timestamp = Date.now()
        const random = Math.random().toString(36).substring(2, 8).toUpperCase()
        const reference = `PAY-${timestamp}-${random}`

        // Build callback URL for Paystack redirect after payment
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
        const callbackUrl = `${siteUrl}/payment/callback?reference=${reference}`

        // Initialize transaction with Paystack
        const paystackResult = await initializeTransaction({
            email,
            amountKES: numericAmount,
            reference,
            callbackUrl,
            metadata: {
                name: name || "",
                phone: phone || "",
                courseCategory: courseCategory || "",
                resultId: resultId || "",
            },
        })

        if (!paystackResult.success) {
            log("api:paystack:init", "Paystack initialization failed", "error", {
                error: paystackResult.error,
            })
            return NextResponse.json(
                { success: false, error: paystackResult.error || "Payment initialization failed" },
                { status: 500 }
            )
        }

        // CRITICAL: Create payment_transactions record BEFORE returning to frontend
        // This ensures we track every payment attempt
        const { error: dbError } = await supabase.from("payment_transactions").insert({
            reference,
            transaction_id: reference, // Paystack reference (was M-Pesa CheckoutRequestID)
            phone_number: phone || null,
            email,
            name: name || null,
            amount: numericAmount,
            status: "PENDING",
            course_category: courseCategory || null,
            result_id: resultId || null,
            paystack_access_code: paystackResult.accessCode || null,
        })

        if (dbError) {
            log("api:paystack:init", "Failed to create payment_transactions record", "error", {
                error: dbError.message,
                reference,
            })
            // Still return success to frontend — webhook will handle the payment record
            // But log this as a serious issue
            log("api:paystack:init", "⚠️ Payment initiated WITHOUT DB tracking!", "error", {
                reference,
                email,
            })
        } else {
            log("api:paystack:init", "Payment transaction record created", "success", {
                reference,
                email,
                amount: numericAmount,
                resultId: resultId || "none",
            })
        }

        // Log result_id warning (same as the old M-Pesa flow did)
        if (!resultId) {
            log("api:paystack:init", "⚠️ Payment initiated without resultId!", "warn", {
                reference,
                email,
            })
        }

        return NextResponse.json({
            success: true,
            accessCode: paystackResult.accessCode,
            authorizationUrl: paystackResult.authorizationUrl,
            reference,
        })
    } catch (error: any) {
        log("api:paystack:init", "Unhandled error in payment initialization", "error", {
            message: error.message,
            stack: error.stack,
        })
        return NextResponse.json(
            { success: false, error: "An unexpected error occurred" },
            { status: 500 }
        )
    }
}
