import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"
import { headers } from "next/headers"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const code = String(body.code || "").trim()
    if (!code) {
      return NextResponse.json({ error: "code_required" }, { status: 400 })
    }
    const hdrs = await headers()
    const ip =
      hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      hdrs.get("x-real-ip") ||
      "0.0.0.0"
    await supabaseServer.from("activity_logs").insert({
      event_type: "referral_visit",
      description: `Referral link visited: ${code}`,
      ip_address: ip,
      actor_role: "user",
      created_at: new Date().toISOString(),
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 })
  }
}
