import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

function getIp(req: NextRequest): string {
  const xf = req.headers.get("x-forwarded-for")
  if (xf) return xf.split(",")[0].trim()
  const xr = req.headers.get("x-real-ip")
  if (xr) return xr.trim()
  const cf = req.headers.get("cf-connecting-ip")
  if (cf) return cf.trim()
  return "0.0.0.0"
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const event_type = String(body?.event_type || "").trim()
    const actor_role = String(body?.actor_role || "user").trim()
    const email = body?.email ? String(body.email).trim() : null
    const phone_number = body?.phone_number ? String(body.phone_number).trim() : null
    const description = String(body?.description || "").trim()
    const metadata = body?.metadata ?? null
    const created_at = new Date().toISOString()
    const ip_address = getIp(req)

    if (!event_type) {
      return NextResponse.json({ error: "Missing event_type" }, { status: 400 })
    }

    // De-dup within short window: same event_type + actor_role + email/phone + ip
    const since = new Date(Date.now() - 60_000).toISOString()
    let dedupQuery = supabaseServer
      .from("activity_logs")
      .select("id", { count: "exact" })
      .gte("created_at", since)
      .eq("event_type", event_type)
      .eq("actor_role", actor_role)
      .eq("ip_address", ip_address)
    if (email) dedupQuery = dedupQuery.eq("email", email)
    if (phone_number) dedupQuery = dedupQuery.eq("phone_number", phone_number)
    const { count: existingCount } = await dedupQuery
    if ((existingCount || 0) > 0) {
      return NextResponse.json({ ok: true, deduped: true })
    }

    // Attempt insert with metadata; fallback without if column missing
    const payload: any = {
      event_type,
      description,
      email,
      phone_number,
      actor_role,
      ip_address,
      created_at,
    }
    if (metadata) payload.metadata = metadata

    let { error } = await supabaseServer.from("activity_logs").insert(payload)
    if (error) {
      // Retry without metadata
      const { metadata: _omit, ...fallback } = payload
      const retry = await supabaseServer.from("activity_logs").insert(fallback)
      if (retry.error) {
        return NextResponse.json({ error: retry.error.message }, { status: 500 })
      }
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Invalid payload" }, { status: 400 })
  }
}
