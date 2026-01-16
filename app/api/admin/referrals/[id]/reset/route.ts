import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"
import { cookies, headers } from "next/headers"

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params
        const cookieStore = await cookies()
        const hdrs = await headers()

        const csrfCookie = cookieStore.get("csrf_token")?.value || ""
        const csrfHeader = hdrs.get("x-csrf-token") || ""

        // Helper to safely log token (show first/last 4 chars only)
        const safeLog = (token: string) => {
            if (!token) return "EMPTY"
            if (token.length < 8) return `***${token.slice(-2)}`
            return `${token.slice(0, 4)}...${token.slice(-4)}`
        }

        console.log("=== CSRF DEBUG - Backend ===")
        console.log("Cookie token:", safeLog(csrfCookie))
        console.log("Header token:", safeLog(csrfHeader))
        console.log("Cookie length:", csrfCookie.length)
        console.log("Header length:", csrfHeader.length)
        console.log("Exact match:", csrfCookie === csrfHeader)
        console.log("===========================")

        if (!csrfCookie || !csrfHeader) {
            console.error("CSRF validation failed: token missing")
            return NextResponse.json({
                error: "csrf_failed",
                details: "CSRF token missing"
            }, { status: 403 })
        }

        if (csrfCookie !== csrfHeader) {
            console.error("CSRF validation failed: token mismatch")
            return NextResponse.json({
                error: "csrf_failed",
                details: "CSRF token mismatch"
            }, { status: 403 })
        }

        // Find the referral agent
        const { data: existing, error: exErr } = await supabaseServer
            .from("referrals")
            .select("id,code,name")
            .or(`id.eq.${id},code.eq.${id}`)
            .limit(1)

        if (exErr) {
            console.error("Error finding agent:", exErr)
            return NextResponse.json({ error: exErr.message }, { status: 500 })
        }

        if (!existing || existing.length === 0) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 })
        }

        const agent = existing[0]
        console.log("Resetting count for agent:", agent.name, agent.id)

        // Reset both users_today and total_users to 0
        const { data: updatedData, error: updateErr } = await supabaseServer
            .from("referrals")
            .update({
                users_today: 0,
                total_users: 0
            })
            .eq("id", agent.id)
            .select()

        if (updateErr) {
            console.error("Error updating agent:", updateErr)
            return NextResponse.json({ error: updateErr.message }, { status: 500 })
        }

        console.log("Agent count reset successfully:", updatedData)

        // Log the activity
        await supabaseServer.from("activity_logs").insert({
            event_type: "referral_count_reset",
            description: `Referral count reset for ${agent.name} (${agent.code})`,
            actor_role: "admin",
            created_at: new Date().toISOString(),
        })

        return NextResponse.json({
            ok: true,
            message: "Referral count reset successfully",
            agent: updatedData?.[0] || null
        })
    } catch (err) {
        console.error("Error resetting referral count:", err)
        return NextResponse.json({
            error: "Failed to reset count",
            details: err instanceof Error ? err.message : "Unknown error"
        }, { status: 500 })
    }
}
