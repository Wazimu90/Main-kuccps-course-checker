import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const { error } = await supabaseServer.from("news_assistant_chats").delete().eq("id", id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const body = await request.json()
    const { assistant_response, used_news_context } = body
    const { error } = await supabaseServer
      .from("news_assistant_chats")
      .update({
        assistant_response: assistant_response ?? null,
        used_news_context: typeof used_news_context === "boolean" ? used_news_context : undefined,
      })
      .eq("id", id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
}

