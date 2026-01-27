import { NextResponse } from "next/server"
import { cookies, headers } from "next/headers"
import { supabaseServer } from "@/lib/supabaseServer"
import bcrypt from "bcryptjs"
import { log } from "@/lib/logger"
import crypto from "crypto"

// Force dynamic rendering
export const dynamic = "force-dynamic"

/**
 * Generate Agent Regeneration Token (ART)
 * POST: Generate new token for an agent
 * GET: List tokens for an agent
 */

// Generate a secure random token
function generateToken(): string {
    return crypto.randomBytes(32).toString("hex")
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()
        const hdrs = await headers()
        const csrfCookie = cookieStore.get("csrf_token")?.value
        const csrfHeader = hdrs.get("x-csrf-token")

        if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
            return NextResponse.json({ error: "Missing or invalid CSRF token" }, { status: 403 })
        }

        const body = await request.json()
        const { agent_id, expires_in_days = 7, created_by } = body

        if (!agent_id) {
            return NextResponse.json({ error: "agent_id is required" }, { status: 400 })
        }

        // Verify agent exists
        const { data: agent, error: agentError } = await supabaseServer
            .from("referrals")
            .select("id, name, code, status")
            .eq("id", agent_id)
            .single()

        if (agentError || !agent) {
            log("admin:agent-tokens", "Agent not found", "error", { agent_id, error: agentError })
            return NextResponse.json({ error: "Agent not found" }, { status: 404 })
        }

        if (agent.status === "disabled") {
            return NextResponse.json({ error: "Cannot generate token for disabled agent" }, { status: 400 })
        }

        // Deactivate any existing active tokens for this agent
        await supabaseServer
            .from("agent_tokens")
            .update({ is_active: false })
            .eq("agent_id", agent_id)
            .eq("is_active", true)

        // Generate new token
        const rawToken = generateToken()
        const tokenPrefix = rawToken.substring(0, 8)
        const tokenHash = await bcrypt.hash(rawToken, 10)
        const expiresAt = new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000).toISOString()

        // Store token
        const { data: newToken, error: insertError } = await supabaseServer
            .from("agent_tokens")
            .insert({
                agent_id,
                token_hash: tokenHash,
                token_prefix: tokenPrefix,
                expires_at: expiresAt,
                is_active: true,
                created_by: created_by || null,
            })
            .select()
            .single()

        if (insertError) {
            log("admin:agent-tokens", "Failed to create token", "error", insertError)
            return NextResponse.json({ error: "Failed to create token" }, { status: 500 })
        }

        log("admin:agent-tokens", "Token created successfully", "success", {
            agent_id,
            agent_name: agent.name,
            token_id: newToken.id,
            expires_at: expiresAt,
        })

        // Return token (only shown once!)
        return NextResponse.json({
            success: true,
            token: rawToken,
            token_id: newToken.id,
            agent_name: agent.name,
            expires_at: expiresAt,
            message: "Token generated. Copy it now - it will not be shown again!",
        })
    } catch (error: any) {
        log("admin:agent-tokens", "Unexpected error", "error", error)
        return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 })
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const agent_id = searchParams.get("agent_id")

        if (!agent_id) {
            return NextResponse.json({ error: "agent_id is required" }, { status: 400 })
        }

        const { data: tokens, error } = await supabaseServer
            .from("agent_tokens")
            .select("id, token_prefix, expires_at, is_active, created_at, created_by")
            .eq("agent_id", agent_id)
            .order("created_at", { ascending: false })

        if (error) {
            log("admin:agent-tokens", "Failed to fetch tokens", "error", error)
            return NextResponse.json({ error: "Failed to fetch tokens" }, { status: 500 })
        }

        // Mark expired tokens
        const now = new Date()
        const tokensWithStatus = tokens.map((t) => ({
            ...t,
            is_expired: new Date(t.expires_at) < now,
        }))

        return NextResponse.json({ tokens: tokensWithStatus })
    } catch (error: any) {
        log("admin:agent-tokens", "Unexpected error", "error", error)
        return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const cookieStore = await cookies()
        const hdrs = await headers()
        const csrfCookie = cookieStore.get("csrf_token")?.value
        const csrfHeader = hdrs.get("x-csrf-token")

        if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
            return NextResponse.json({ error: "Missing or invalid CSRF token" }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const token_id = searchParams.get("token_id")

        if (!token_id) {
            return NextResponse.json({ error: "token_id is required" }, { status: 400 })
        }

        const { error } = await supabaseServer
            .from("agent_tokens")
            .update({ is_active: false })
            .eq("id", token_id)

        if (error) {
            log("admin:agent-tokens", "Failed to deactivate token", "error", error)
            return NextResponse.json({ error: "Failed to deactivate token" }, { status: 500 })
        }

        log("admin:agent-tokens", "Token deactivated", "success", { token_id })

        return NextResponse.json({ success: true, message: "Token deactivated" })
    } catch (error: any) {
        log("admin:agent-tokens", "Unexpected error", "error", error)
        return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 })
    }
}
