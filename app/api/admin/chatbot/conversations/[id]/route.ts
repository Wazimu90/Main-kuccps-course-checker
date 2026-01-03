import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { data, error } = await supabaseServer
    .from("chatbot_conversations")
    .select("id,user_email,user_phone,user_ip,conversation,created_at")
    .eq("id", params.id)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ conversation: data || null })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { error } = await supabaseServer.from("chatbot_conversations").delete().eq("id", params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

