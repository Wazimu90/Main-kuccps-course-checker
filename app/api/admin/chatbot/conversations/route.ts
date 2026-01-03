import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const today = url.searchParams.get("today")
  const total = url.searchParams.get("total")
  const page = Number(url.searchParams.get("page") || 1)
  const limit = Number(url.searchParams.get("limit") || 20)

  if (today === "true") {
    const { count, error } = await supabaseServer
      .from("chatbot_conversations")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date().toISOString().slice(0, 10)) // crude day prefix match
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ today: count || 0 })
  }

  if (total === "true") {
    const { count, error } = await supabaseServer
      .from("chatbot_conversations")
      .select("*", { count: "exact", head: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ total: count || 0 })
  }

  const { data, error } = await supabaseServer
    .from("chatbot_conversations")
    .select("id,user_email,user_phone,user_ip,conversation,created_at")
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ conversations: data || [] })
}

