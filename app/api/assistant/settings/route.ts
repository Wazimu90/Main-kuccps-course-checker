import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function GET() {
  const { data, error } = await supabaseServer
    .from("chatbot_settings")
    .select("welcome_message,status,provider,system_prompt,updated_at")
    .order("updated_at", { ascending: false })
    .limit(1)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  const cfg = data && data.length > 0 ? data[0] : null
  return NextResponse.json({ settings: cfg })
}

