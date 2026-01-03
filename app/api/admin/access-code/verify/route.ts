import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"
import { verifyCsrfToken } from "@/lib/csrf"
import { z } from "zod"
import bcrypt from "bcryptjs"

const payloadSchema = z.object({
  email: z.string().email(),
  access_code: z.string().min(6).max(64),
})

export async function POST(req: Request) {
  const csrfHeader = req.headers.get("x-csrf-token")
  if (!verifyCsrfToken(csrfHeader)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
  const parsed = payloadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }
  const { email, access_code } = parsed.data
  try {
    const { data: attempts } = await supabaseServer
      .from("admin_access_attempts")
      .select("id")
      .eq("email", email)
      .gte("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString())
    if ((attempts || []).length >= 5) {
      await supabaseServer.from("activity_logs").insert({
        event_type: "admin_access_code_rate_limited",
        description: "Rate limit exceeded for access code",
        email,
        actor_role: "admin",
        created_at: new Date().toISOString(),
      })
      return NextResponse.json({ error: "Too many attempts" }, { status: 429 })
    }
  } catch {}
  try {
    await supabaseServer.from("admin_access_attempts").insert({
      email,
      created_at: new Date().toISOString(),
      success: false,
    })
  } catch {}
  const { data: row } = await supabaseServer
    .from("admin_access_codes")
    .select("access_code_hash,is_active")
    .eq("email", email)
    .limit(1)
    .maybeSingle()
  let ok = false
  if (row?.is_active && row?.access_code_hash) {
    try {
      ok = await bcrypt.compare(access_code, row.access_code_hash)
    } catch {
      ok = false
    }
  }
  if (!ok) {
    await supabaseServer
      .from("activity_logs")
      .insert({
        event_type: "admin_access_code_invalid",
        description: "Invalid access code",
        email,
        actor_role: "admin",
        created_at: new Date().toISOString(),
      })
      .catch(() => {})
    return NextResponse.json({ error: "Invalid access code" }, { status: 401 })
  }
  try {
    await supabaseServer.from("activity_logs").insert({
      event_type: "admin_access_code_valid",
      description: "Access code verified",
      email,
      actor_role: "admin",
      created_at: new Date().toISOString(),
    })
    await supabaseServer
      .from("admin_access_attempts")
      .update({ success: true })
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
    await supabaseServer
      .from("admin_access_codes")
      .update({ last_used: new Date().toISOString() })
      .eq("email", email)
  } catch {}
  const res = NextResponse.json({ ok: true })
  res.cookies.set("admin_session_exp", String(Date.now() + 30 * 60 * 1000), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 30 * 60,
  })
  return res
}
