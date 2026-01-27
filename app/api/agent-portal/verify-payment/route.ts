import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"
import { log } from "@/lib/logger"
import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

/**
 * Verify payment for agent PDF download
 * POST: Verify result_id, phone, mpesa_receipt match a valid payment
 */

export async function POST(request: Request) {
    const ip = getClientIp(request)

    // Rate limit: 10 attempts per minute per IP
    const rateCheck = checkRateLimit(`agent-verify-payment:${ip}`, {
        maxRequests: 10,
        windowSeconds: 60,
    })

    if (!rateCheck.allowed) {
        log("agent-portal:verify-payment", "Rate limited", "warn", { ip })
        return NextResponse.json(
            { error: "Too many attempts. Try again later.", retryAfter: rateCheck.retryAfterSeconds },
            { status: 429, headers: rateLimitHeaders(rateCheck) }
        )
    }

    try {
        const body = await request.json()
        const { result_id, phone_number, mpesa_receipt, agent_code } = body

        if (!result_id || !phone_number) {
            return NextResponse.json(
                { error: "result_id and phone_number are required" },
                { status: 400, headers: rateLimitHeaders(rateCheck) }
            )
        }

        // Normalize phone number
        let normalizedPhone = String(phone_number).replace(/\s+/g, "")
        if (normalizedPhone.startsWith("0") && normalizedPhone.length === 10) {
            normalizedPhone = "254" + normalizedPhone.substring(1)
        }
        if (normalizedPhone.startsWith("+254")) {
            normalizedPhone = normalizedPhone.substring(1)
        }

        log("agent-portal:verify-payment", "Verifying payment", "info", {
            result_id,
            phone: normalizedPhone,
            mpesa_receipt: mpesa_receipt || "not provided",
            agent_code,
        })

        // Step 1: Find result in results_cache
        const { data: resultRecord, error: resultError } = await supabaseServer
            .from("results_cache")
            .select("result_id, agent_code, email, phone_number, name, category, eligible_courses")
            .eq("result_id", result_id)
            .single()

        if (resultError || !resultRecord) {
            log("agent-portal:verify-payment", "Result not found", "warn", { result_id })
            return NextResponse.json(
                { error: "Result not found. Check the Result ID." },
                { status: 404, headers: rateLimitHeaders(rateCheck) }
            )
        }

        // Step 2: Verify agent ownership (if agent_code provided)
        if (agent_code && resultRecord.agent_code) {
            if (resultRecord.agent_code !== agent_code) {
                log("agent-portal:verify-payment", "Agent mismatch", "warn", {
                    result_id,
                    expected: resultRecord.agent_code,
                    provided: agent_code,
                })
                return NextResponse.json(
                    { error: "This result belongs to a different agent" },
                    { status: 403, headers: rateLimitHeaders(rateCheck) }
                )
            }
        }

        // Step 3: Find matching payment - check payments table or payment_transactions
        // Try payments table first (by result_id or phone_number)
        let paymentFound = false
        let paymentInfo = null

        // Check by result_id in payments table
        if (!paymentFound) {
            const { data: payment } = await supabaseServer
                .from("payments")
                .select("id, name, email, phone_number, amount, paid_at, result_id")
                .eq("result_id", result_id)
                .limit(1)
                .single()

            if (payment) {
                paymentFound = true
                paymentInfo = payment
            }
        }

        // Check by phone number if not found
        if (!paymentFound) {
            const { data: payments } = await supabaseServer
                .from("payments")
                .select("id, name, email, phone_number, amount, paid_at, result_id")
                .or(`phone_number.eq.${normalizedPhone},phone_number.eq.0${normalizedPhone.substring(3)}`)
                .order("paid_at", { ascending: false })
                .limit(1)

            if (payments && payments.length > 0) {
                paymentFound = true
                paymentInfo = payments[0]
            }
        }

        // Also check payment_transactions
        if (!paymentFound && mpesa_receipt) {
            const { data: transaction } = await supabaseServer
                .from("payment_transactions")
                .select("id, name, email, phone_number, amount, completed_at, mpesa_receipt_number, status")
                .eq("mpesa_receipt_number", mpesa_receipt)
                .eq("status", "COMPLETED")
                .single()

            if (transaction) {
                paymentFound = true
                paymentInfo = {
                    id: transaction.id,
                    name: transaction.name,
                    email: transaction.email,
                    phone_number: transaction.phone_number,
                    amount: transaction.amount,
                    paid_at: transaction.completed_at,
                    mpesa_receipt: transaction.mpesa_receipt_number,
                }
            }
        }

        if (!paymentFound) {
            log("agent-portal:verify-payment", "Payment not found", "warn", {
                result_id,
                phone: normalizedPhone,
                mpesa_receipt,
            })
            return NextResponse.json(
                { error: "No payment found for this Result ID. Verify the details." },
                { status: 404, headers: rateLimitHeaders(rateCheck) }
            )
        }

        // Step 4: Check per-result download limit
        const { data: resultDownloads } = await supabaseServer
            .from("result_download_counts")
            .select("download_count")
            .eq("result_id", result_id)
            .single()

        const downloadCount = resultDownloads?.download_count || 0
        const perResultLimit = 3

        if (downloadCount >= perResultLimit) {
            log("agent-portal:verify-payment", "Per-result limit reached", "warn", {
                result_id,
                download_count: downloadCount,
                limit: perResultLimit,
            })
            return NextResponse.json(
                {
                    error: "Download limit reached for this Result ID (max 3 downloads)",
                    limit_reached: true,
                },
                { status: 429, headers: rateLimitHeaders(rateCheck) }
            )
        }

        log("agent-portal:verify-payment", "Payment verified successfully", "success", {
            result_id,
            payment_id: paymentInfo?.id,
            downloads_used: downloadCount,
            downloads_remaining: perResultLimit - downloadCount,
        })

        return NextResponse.json(
            {
                success: true,
                result: {
                    result_id: resultRecord.result_id,
                    category: resultRecord.category,
                    name: resultRecord.name || paymentInfo?.name,
                    email: resultRecord.email || paymentInfo?.email,
                    phone_number: resultRecord.phone_number || paymentInfo?.phone_number,
                    courses_count: Array.isArray(resultRecord.eligible_courses)
                        ? resultRecord.eligible_courses.length
                        : 0,
                },
                payment: {
                    paid_at: paymentInfo?.paid_at,
                    amount: paymentInfo?.amount,
                },
                download_quota: {
                    per_result_limit: perResultLimit,
                    downloads_used: downloadCount,
                    downloads_remaining: perResultLimit - downloadCount,
                },
            },
            { headers: rateLimitHeaders(rateCheck) }
        )
    } catch (error: any) {
        log("agent-portal:verify-payment", "Unexpected error", "error", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
