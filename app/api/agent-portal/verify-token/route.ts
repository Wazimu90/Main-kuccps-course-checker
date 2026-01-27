import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"
import bcrypt from "bcryptjs"
import { log } from "@/lib/logger"
import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

/**
 * Verify Agent Regeneration Token (ART)
 * POST: Verify token and return agent info + quotas
 */

export async function POST(request: Request) {
    const ip = getClientIp(request)

    // Rate limit: 5 attempts per minute per IP
    const rateCheck = checkRateLimit(`agent-token-verify:${ip}`, {
        maxRequests: 5,
        windowSeconds: 60,
    })

    if (!rateCheck.allowed) {
        log("agent-portal:verify-token", "Rate limited", "warn", { ip })
        return NextResponse.json(
            { error: "Too many attempts. Try again later.", retryAfter: rateCheck.retryAfterSeconds },
            { status: 429, headers: rateLimitHeaders(rateCheck) }
        )
    }

    try {
        const body = await request.json()
        const { token } = body

        if (!token || typeof token !== "string" || token.length < 16) {
            return NextResponse.json(
                { error: "Invalid token format" },
                { status: 400, headers: rateLimitHeaders(rateCheck) }
            )
        }

        const tokenPrefix = token.substring(0, 8)

        // Find token by prefix
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
          phone_number,
          status
        )
      `)
            .eq("token_prefix", tokenPrefix)
            .eq("is_active", true)

        if (tokenError || !tokenRecords || tokenRecords.length === 0) {
            log("agent-portal:verify-token", "Token not found", "warn", { tokenPrefix })
            return NextResponse.json(
                { error: "Invalid or expired token" },
                { status: 401, headers: rateLimitHeaders(rateCheck) }
            )
        }

        // Try to match full token hash
        let matchedToken = null
        for (const record of tokenRecords) {
            const isMatch = await bcrypt.compare(token, record.token_hash)
            if (isMatch) {
                matchedToken = record
                break
            }
        }

        if (!matchedToken) {
            log("agent-portal:verify-token", "Token hash mismatch", "warn", { tokenPrefix })
            return NextResponse.json(
                { error: "Invalid or expired token" },
                { status: 401, headers: rateLimitHeaders(rateCheck) }
            )
        }

        // Check expiry
        if (new Date(matchedToken.expires_at) < new Date()) {
            log("agent-portal:verify-token", "Token expired", "warn", {
                tokenPrefix,
                expires_at: matchedToken.expires_at,
            })
            return NextResponse.json(
                { error: "Token has expired" },
                { status: 401, headers: rateLimitHeaders(rateCheck) }
            )
        }

        // Check agent status
        const agent = matchedToken.referrals as any
        if (!agent || agent.status === "disabled") {
            log("agent-portal:verify-token", "Agent disabled", "warn", { agent_id: matchedToken.agent_id })
            return NextResponse.json(
                { error: "Agent is disabled" },
                { status: 403, headers: rateLimitHeaders(rateCheck) }
            )
        }

        // Get today's download count
        const today = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" })
        const { data: counter } = await supabaseServer
            .from("agent_download_counters")
            .select("downloads_today")
            .eq("agent_id", agent.id)
            .eq("counter_date", today)
            .single()

        const downloadsToday = counter?.downloads_today || 0
        const dailyLimit = 20
        const remainingToday = Math.max(0, dailyLimit - downloadsToday)

        log("agent-portal:verify-token", "Token verified successfully", "success", {
            agent_id: agent.id,
            agent_name: agent.name,
            downloadsToday,
            remainingToday,
        })

        return NextResponse.json(
            {
                success: true,
                agent: {
                    id: agent.id,
                    name: agent.name,
                    code: agent.code,
                },
                token_id: matchedToken.id,
                expires_at: matchedToken.expires_at,
                quota: {
                    daily_limit: dailyLimit,
                    downloads_today: downloadsToday,
                    remaining_today: remainingToday,
                },
            },
            { headers: rateLimitHeaders(rateCheck) }
        )
    } catch (error: any) {
        log("agent-portal:verify-token", "Unexpected error", "error", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
