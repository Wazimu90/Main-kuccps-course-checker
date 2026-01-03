import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"
import { cookies, headers } from "next/headers"

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const cookieStore = await cookies()
  const csrfCookie = cookieStore.get("csrf_token")?.value || ""
  const hdrs = await headers()
  const csrfHeader = hdrs.get("x-csrf-token") || ""
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return NextResponse.json({ error: "csrf_failed" }, { status: 403 })
  }
  const { data: existing, error: exErr } = await supabaseServer
    .from("referrals")
    .select("id,code")
    .or(`id.eq.${id},code.eq.${id}`)
    .limit(1)
  if (exErr) {
    return NextResponse.json({ error: exErr.message }, { status: 500 })
  }
  if (!existing || existing.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  const refId = existing[0].id
  const { error } = await supabaseServer.from("referrals").delete().eq("id", refId)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  await supabaseServer.from("activity_logs").insert({
    event_type: "referral_removed",
    description: `Referral ${existing[0].code} removed`,
    actor_role: "admin",
    created_at: new Date().toISOString(),
  })
  return NextResponse.json({ ok: true })
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const cookieStore = await cookies()
  const csrfCookie = cookieStore.get("csrf_token")?.value || ""
  const hdrs = await headers()
  const csrfHeader = hdrs.get("x-csrf-token") || ""
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return NextResponse.json({ error: "csrf_failed" }, { status: 403 })
  }
  try {
    const body = await request.json()
    const status = String(body.status || "").trim()
    if (!["active", "disabled"].includes(status)) {
      return NextResponse.json({ error: "invalid_status" }, { status: 400 })
    }
    const { data, error } = await supabaseServer
      .from("referrals")
      .update({ status })
      .or(`id.eq.${id},code.eq.${id}`)
      .select("id,code")
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    await supabaseServer.from("activity_logs").insert({
      event_type: status === "disabled" ? "referral_suspended" : "referral_activated",
      description: `Referral ${data.code} ${status === "disabled" ? "suspended" : "activated"}`,
      actor_role: "admin",
      created_at: new Date().toISOString(),
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 })
  }
}
