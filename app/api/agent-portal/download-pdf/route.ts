import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"
import bcrypt from "bcryptjs"
import { log } from "@/lib/logger"
import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rate-limit"
import { generateResultsPDF } from "@/lib/pdf-generator"

export const dynamic = "force-dynamic"

const DAILY_LIMIT = 20
const PER_RESULT_LIMIT = 3

/**
 * Download PDF for agent portal
 * POST: Full verification flow + PDF generation + audit logging
 */

export async function POST(request: Request) {
    const ip = getClientIp(request)
    const userAgent = request.headers.get("user-agent") || ""

    // Rate limit: 5 downloads per minute per IP
    const rateCheck = checkRateLimit(`agent-download-pdf:${ip}`, {
        maxRequests: 5,
        windowSeconds: 60,
    })

    if (!rateCheck.allowed) {
        log("agent-portal:download-pdf", "Rate limited", "warn", { ip })
        return NextResponse.json(
            { error: "Too many requests. Try again later.", retryAfter: rateCheck.retryAfterSeconds },
            { status: 429, headers: rateLimitHeaders(rateCheck) }
        )
    }

    try {
        const body = await request.json()
        const { token, result_id, phone_number, paystack_reference } = body

        // Validation: require token AND (result_id OR (paystack_reference AND phone_number))
        if (!token) {
            return NextResponse.json(
                { error: "Token is required" },
                { status: 400, headers: rateLimitHeaders(rateCheck) }
            )
        }

        const hasResultId = result_id && String(result_id).trim()
        const hasPaystackLookup = paystack_reference && phone_number && String(paystack_reference).trim() && String(phone_number).trim()

        if (!hasResultId && !hasPaystackLookup) {
            return NextResponse.json(
                { error: "Either Result ID, or Paystack Reference + Phone Number are required" },
                { status: 400, headers: rateLimitHeaders(rateCheck) }
            )
        }

        // Normalize phone number (if provided)
        let normalizedPhone = ""
        if (phone_number) {
            normalizedPhone = String(phone_number).replace(/\s+/g, "")
            if (normalizedPhone.startsWith("0") && normalizedPhone.length === 10) {
                normalizedPhone = "254" + normalizedPhone.substring(1)
            }
            if (normalizedPhone.startsWith("+254")) {
                normalizedPhone = normalizedPhone.substring(1)
            }
        }

        let resolvedResultId = result_id

        // Step 1: Verify token
        const tokenPrefix = token.substring(0, 8)

        const { data: tokenRecords, error: tokenError } = await supabaseServer
            .from("agent_tokens")
            .select(`
        id,
        agent_id,
        token_hash,
        expires_at,
        is_active,
        referrals (
          id,
          name,
          code,
          status
        )
      `)
            .eq("token_prefix", tokenPrefix)
            .eq("is_active", true)

        if (tokenError || !tokenRecords || tokenRecords.length === 0) {
            await logDownloadAttempt(null, null, resolvedResultId || "unknown", "failure", "Token not found", ip, userAgent)
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
        }

        let matchedToken = null
        for (const record of tokenRecords) {
            const isMatch = await bcrypt.compare(token, record.token_hash)
            if (isMatch) {
                matchedToken = record
                break
            }
        }

        if (!matchedToken) {
            await logDownloadAttempt(null, null, resolvedResultId || "unknown", "failure", "Token hash mismatch", ip, userAgent)
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
        }

        if (new Date(matchedToken.expires_at) < new Date()) {
            await logDownloadAttempt(matchedToken.agent_id, matchedToken.id, resolvedResultId || "unknown", "failure", "Token expired", ip, userAgent)
            return NextResponse.json({ error: "Token has expired" }, { status: 401 })
        }

        const agent = matchedToken.referrals as any
        if (!agent || agent.status === "disabled") {
            await logDownloadAttempt(matchedToken.agent_id, matchedToken.id, resolvedResultId || "unknown", "failure", "Agent disabled", ip, userAgent)
            return NextResponse.json({ error: "Agent is disabled" }, { status: 403 })
        }

        // Step 2: Check daily limit
        const today = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" })

        // Upsert counter for today
        const { data: counter } = await supabaseServer
            .from("agent_download_counters")
            .upsert(
                { agent_id: agent.id, counter_date: today, downloads_today: 0 },
                { onConflict: "agent_id,counter_date", ignoreDuplicates: true }
            )
            .select("downloads_today")
            .single()

        // Get actual count
        const { data: actualCounter } = await supabaseServer
            .from("agent_download_counters")
            .select("downloads_today")
            .eq("agent_id", agent.id)
            .eq("counter_date", today)
            .single()

        const downloadsToday = actualCounter?.downloads_today || 0

        if (downloadsToday >= DAILY_LIMIT) {
            await logDownloadAttempt(agent.id, matchedToken.id, resolvedResultId || "unknown", "failure", "Daily limit reached", ip, userAgent)
            return NextResponse.json(
                { error: `Daily download limit reached (${DAILY_LIMIT}/day). Try again tomorrow.` },
                { status: 429 }
            )
        }

        // Step 3: Get result - either by result_id or by M-Pesa lookup
        let resultRecord = null

        if (hasResultId) {
            // Direct lookup by result_id
            const { data: record, error: resultError } = await supabaseServer
                .from("results_cache")
                .select("result_id, agent_code, email, phone_number, name, category, eligible_courses")
                .eq("result_id", result_id)
                .single()

            if (resultError || !record) {
                await logDownloadAttempt(agent.id, matchedToken.id, result_id, "failure", "Result not found", ip, userAgent)
                return NextResponse.json({ error: "Result not found" }, { status: 404 })
            }
            resultRecord = record
            resolvedResultId = record.result_id
        } else if (hasPaystackLookup) {
            // Paystack-based lookup - CRITICAL: Include result_id in query
            const { data: transaction } = await supabaseServer
                .from("payment_transactions")
                .select("id, phone_number, paystack_reference, status, result_id")
                .eq("paystack_reference", paystack_reference.toUpperCase().trim())
                .eq("status", "COMPLETED")
                .single()

            if (transaction) {
                // FIRST: Try to use result_id directly from payment_transactions
                if (transaction.result_id) {
                    resolvedResultId = transaction.result_id
                    log("agent-portal:download-pdf", "Using result_id from payment_transactions", "debug", {
                        result_id: resolvedResultId,
                        paystack_reference
                    })

                    // Fetch result record by ID
                    const { data: record } = await supabaseServer
                        .from("results_cache")
                        .select("result_id, agent_code, email, phone_number, name, category, eligible_courses")
                        .eq("result_id", resolvedResultId)
                        .single()

                    if (record) {
                        resultRecord = record
                    }
                } else {
                    // FALLBACK: Find result by transaction phone
                    log("agent-portal:download-pdf", "⚠️ result_id missing in payment_transactions, using phone fallback", "warn", {
                        paystack_reference,
                        phone: transaction.phone_number,
                        hint: "This transaction was likely created before result_id was stored"
                    })

                    const txPhone = transaction.phone_number || ""
                    let txNormalizedPhone = txPhone.replace(/\s+/g, "")
                    if (txNormalizedPhone.startsWith("0") && txNormalizedPhone.length === 10) {
                        txNormalizedPhone = "254" + txNormalizedPhone.substring(1)
                    }
                    if (txNormalizedPhone.startsWith("+254")) {
                        txNormalizedPhone = txNormalizedPhone.substring(1)
                    }

                    const { data: results } = await supabaseServer
                        .from("results_cache")
                        .select("result_id, agent_code, email, phone_number, name, category, eligible_courses")
                        .or(`phone_number.eq.${txNormalizedPhone},phone_number.eq.0${txNormalizedPhone.substring(3)},phone_number.eq.${normalizedPhone},phone_number.eq.0${normalizedPhone.substring(3)}`)
                        .order("created_at", { ascending: false })
                        .limit(1)

                    if (results && results.length > 0) {
                        resultRecord = results[0]
                        resolvedResultId = resultRecord.result_id
                    }
                }
            }

            // Fallback: try to find by phone in payments table
            if (!resultRecord) {
                const { data: payment } = await supabaseServer
                    .from("payments")
                    .select("result_id")
                    .or(`phone_number.eq.${normalizedPhone},phone_number.eq.0${normalizedPhone.substring(3)}`)
                    .order("paid_at", { ascending: false })
                    .limit(1)
                    .single()

                if (payment?.result_id) {
                    const { data: record } = await supabaseServer
                        .from("results_cache")
                        .select("result_id, agent_code, email, phone_number, name, category, eligible_courses")
                        .eq("result_id", payment.result_id)
                        .single()

                    if (record) {
                        resultRecord = record
                        resolvedResultId = record.result_id
                    }
                }
            }

            if (!resultRecord) {
                await logDownloadAttempt(agent.id, matchedToken.id, "paystack:" + paystack_reference, "failure", "Result not found via Paystack lookup", ip, userAgent)
                return NextResponse.json({ error: "Could not find result for this Paystack payment" }, { status: 404 })
            }
        }

        if (!resultRecord) {
            await logDownloadAttempt(agent.id, matchedToken.id, "unknown", "failure", "Result record missing", ip, userAgent)
            return NextResponse.json({ error: "Result not found" }, { status: 404 })
        }

        // Step 4: Verify agent ownership (if agent_code set)
        if (resultRecord.agent_code && resultRecord.agent_code !== agent.code) {
            await logDownloadAttempt(agent.id, matchedToken.id, resolvedResultId, "failure", "Agent mismatch", ip, userAgent)
            return NextResponse.json({ error: "This result belongs to a different agent" }, { status: 403 })
        }

        // Step 5: Check per-result limit
        // Upsert result download count
        await supabaseServer
            .from("result_download_counts")
            .upsert(
                { result_id: resolvedResultId, download_count: 0 },
                { onConflict: "result_id", ignoreDuplicates: true }
            )

        const { data: resultCount } = await supabaseServer
            .from("result_download_counts")
            .select("download_count")
            .eq("result_id", resolvedResultId)
            .single()

        const downloadCount = resultCount?.download_count || 0

        if (downloadCount >= PER_RESULT_LIMIT) {
            await logDownloadAttempt(agent.id, matchedToken.id, resolvedResultId, "failure", "Per-result limit reached", ip, userAgent)
            return NextResponse.json(
                { error: `Download limit reached for this result (max ${PER_RESULT_LIMIT})` },
                { status: 429 }
            )
        }

        // Step 6: Generate PDF
        const courses = resultRecord.eligible_courses || []

        if (!Array.isArray(courses) || courses.length === 0) {
            await logDownloadAttempt(agent.id, matchedToken.id, resolvedResultId, "failure", "No courses in result", ip, userAgent)
            return NextResponse.json({ error: "No courses found in this result" }, { status: 400 })
        }

        const pdfBuffer = generateResultsPDF({
            courses,
            category: resultRecord.category || "unknown",
            userInfo: {
                name: resultRecord.name || "Student",
                email: resultRecord.email || "",
                phone: resultRecord.phone_number || "",
            },
            resultId: resolvedResultId,
        })

        // Step 7: Increment counters atomically
        await supabaseServer
            .from("agent_download_counters")
            .update({ downloads_today: downloadsToday + 1 })
            .eq("agent_id", agent.id)
            .eq("counter_date", today)

        await supabaseServer
            .from("result_download_counts")
            .update({
                download_count: downloadCount + 1,
                last_download_at: new Date().toISOString(),
            })
            .eq("result_id", resolvedResultId)

        // Step 8: Log success
        await logDownloadAttempt(agent.id, matchedToken.id, resolvedResultId, "success", null, ip, userAgent)

        log("agent-portal:download-pdf", "PDF generated successfully", "success", {
            agent_id: agent.id,
            agent_name: agent.name,
            result_id: resolvedResultId,
            courses_count: courses.length,
            category: resultRecord.category,
        })

        // Return PDF
        const filename = `KUCCPS_${resultRecord.category || "results"}_${resolvedResultId.substring(0, 8)}.pdf`

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Content-Length": String(pdfBuffer.byteLength),
                ...rateLimitHeaders(rateCheck),
            },
        })
    } catch (error: any) {
        log("agent-portal:download-pdf", "Unexpected error", "error", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}

async function logDownloadAttempt(
    agentId: string | null,
    tokenId: string | null,
    resultId: string,
    outcome: "success" | "failure",
    failureReason: string | null,
    ipAddress: string,
    userAgent: string
) {
    try {
        if (agentId) {
            await supabaseServer.from("agent_download_logs").insert({
                agent_id: agentId,
                token_id: tokenId,
                result_id: resultId,
                outcome,
                failure_reason: failureReason,
                ip_address: ipAddress,
                user_agent: userAgent,
            })
        }
    } catch (e) {
        log("agent-portal:download-pdf", "Failed to log attempt", "warn", e)
    }
}
