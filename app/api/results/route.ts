

import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"
import { log } from "@/lib/logger"

export const dynamic = "force-dynamic"

/**
 * Secure results API — verifies payment before returning results.
 * This replaces the direct client-side Supabase query to results_cache.
 * Fixes B3 (results accessible without payment) and B4 (anon key data leak).
 */
export async function GET(request: Request) {
    try {
        const url = new URL(request.url)
        const resultId = url.searchParams.get("result_id")

        if (!resultId || resultId.trim() === "") {
            return NextResponse.json({ error: "Missing result_id" }, { status: 400 })
        }

        const cleanResultId = resultId.trim()

        log("api:results", "Results requested", "info", { resultId: cleanResultId })

        // Check for admin session (admin can bypass payment check)
        const cookieHeader = request.headers.get("cookie") || ""
        let isAdmin = false
        try {
            const tokenMatch = cookieHeader.match(/sb-access-token=([^;]+)/)
            if (tokenMatch?.[1]) {
                const { data: userData } = await supabaseServer.auth.getUser(tokenMatch[1])
                const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || ""
                if (userData?.user?.email && userData.user.email === adminEmail) {
                    isAdmin = true
                }
            }
        } catch {
            // Not admin, continue
        }

        if (!isAdmin) {
            // SECURITY: Verify payment exists before returning results
            // Check payment_transactions for COMPLETED status with this result_id
            let paymentVerified = false

            // Check 1: payment_transactions table
            const { data: txn } = await supabaseServer
                .from("payment_transactions")
                .select("id, status")
                .eq("result_id", cleanResultId)
                .eq("status", "COMPLETED")
                .limit(1)
                .maybeSingle()

            if (txn) {
                paymentVerified = true
            }

            // Check 2: payments table (fallback — may have been recorded via RPC)
            if (!paymentVerified) {
                const { data: payment } = await supabaseServer
                    .from("payments")
                    .select("id")
                    .eq("result_id", cleanResultId)
                    .limit(1)
                    .maybeSingle()

                if (payment) {
                    paymentVerified = true
                }
            }

            // Check 3: results_cache has user details filled in (indicates payment was processed)
            if (!paymentVerified) {
                const { data: cacheCheck } = await supabaseServer
                    .from("results_cache")
                    .select("email, phone_number")
                    .eq("result_id", cleanResultId)
                    .maybeSingle()

                if (cacheCheck?.email && cacheCheck.email !== "" && cacheCheck.email !== "student@example.com") {
                    paymentVerified = true
                }
            }

            if (!paymentVerified) {
                log("api:results", "❌ Payment not verified for result_id", "warn", { resultId: cleanResultId })
                return NextResponse.json(
                    { error: "Payment required. Please complete payment to view your results." },
                    { status: 403 }
                )
            }
        }

        // Payment verified (or admin) — fetch results
        const { data: resultData, error } = await supabaseServer
            .from("results_cache")
            .select("*")
            .eq("result_id", cleanResultId)
            .single()

        if (error || !resultData) {
            log("api:results", "Results not found in cache", "warn", { resultId: cleanResultId, error: error?.message })
            return NextResponse.json({ error: "Results not found" }, { status: 404 })
        }

        log("api:results", "✅ Results returned securely", "success", {
            resultId: cleanResultId,
            courseCount: resultData.eligible_courses?.length || 0,
            isAdmin,
        })

        return NextResponse.json({ data: resultData })
    } catch (e: any) {
        log("api:results", "Exception in results API", "error", { error: e?.message })
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
