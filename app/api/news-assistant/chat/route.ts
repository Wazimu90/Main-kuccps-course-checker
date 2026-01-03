import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const user_ip: string | null = body.user_ip || null
    const user_email: string | null = body.user_email || null
    const user_phone: string | null = body.user_phone || null
    const user_message: string = String(body.user_message || "")
    const now = new Date().toISOString()

    const { data: settings } = await supabaseServer
      .from("news_assistant_settings")
      .select("api_key,system_prompt,news_access_enabled")
      .limit(1)
      .maybeSingle()

    let assistant_response = ""
    let used_news_context = false
    if (!settings || !settings.news_access_enabled) {
      assistant_response =
        "The KUCCPS Expert cannot reference news content at the moment. Please try again later or contact support."
      used_news_context = false
    } else {
      assistant_response = "Your request has been received. The KUCCPS Expert will use approved news context as needed."
      used_news_context = true
    }

    const { error: insertErr } = await supabaseServer.from("news_assistant_chats").insert({
      user_ip,
      user_email,
      user_phone,
      user_message,
      assistant_response,
      used_news_context,
      created_at: now,
    })
    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    await supabaseServer.from("activity_logs").insert({
      event_type: "user.newsAssistant.chat",
      description: "User sent a message to KUCCPS Expert",
      email: user_email,
      phone_number: user_phone,
      actor_role: "user",
      created_at: now,
    })

    return NextResponse.json({ assistant_response, used_news_context })
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
}

