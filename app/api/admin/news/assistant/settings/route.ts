import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function GET() {
  const { data, error } = await supabaseServer
    .from("news_assistant_settings")
    .select("id,api_key,system_prompt,news_access_enabled,updated_at")
    .limit(1)
    .maybeSingle()
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ settings: data || null })
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const now = new Date().toISOString()
    const payload = {
      api_key: body.api_key ?? null,
      system_prompt: body.system_prompt ?? "",
      news_access_enabled: !!body.news_access_enabled,
      updated_at: now,
    }
    const { error } = await supabaseServer.from("news_assistant_settings").upsert(payload, { onConflict: "id" })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    await supabaseServer.from("activity_logs").insert({
      event_type: "admin.newsAssistant.settings",
      description: "Updated news assistant settings",
      email: null,
      phone_number: null,
      actor_role: "admin",
      created_at: now,
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
}

