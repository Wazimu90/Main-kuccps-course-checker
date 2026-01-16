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

    // Build update object based on what's provided
    const updates: any = {}

    if (body.status !== undefined) {
      const status = String(body.status || "").trim()
      if (!["active", "disabled"].includes(status)) {
        return NextResponse.json({ error: "invalid_status" }, { status: 400 })
      }
      updates.status = status
    }

    if (body.name !== undefined) {
      const name = String(body.name || "").trim()
      if (!name) {
        return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 })
      }
      updates.name = name
    }

    if (body.phone_number !== undefined) {
      updates.phone_number = String(body.phone_number || "").trim()
    }

    if (body.code !== undefined) {
      const code = String(body.code || "").trim()
      if (!code) {
        return NextResponse.json({ error: "Code cannot be empty" }, { status: 400 })
      }
      updates.code = code
    }

    if (body.link !== undefined) {
      updates.link = String(body.link || "").trim() || null
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from("referrals")
      .update(updates)
      .or(`id.eq.${id},code.eq.${id}`)
      .select("id,code,name")
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log the activity
    let eventType = "referral_updated"
    let description = `Referral ${data.code} updated`

    if (updates.status === "disabled") {
      eventType = "referral_suspended"
      description = `Referral ${data.code} suspended`
    } else if (updates.status === "active") {
      eventType = "referral_activated"
      description = `Referral ${data.code} activated`
    }

    await supabaseServer.from("activity_logs").insert({
      event_type: eventType,
      description,
      actor_role: "admin",
      created_at: new Date().toISOString(),
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 })
  }
}
