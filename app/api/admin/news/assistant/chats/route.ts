import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get("page") || 1)
  const pageSize = Number(searchParams.get("pageSize") || 10)
  const q = String(searchParams.get("q") || "").trim()
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const used = searchParams.get("used")
  const sort = (searchParams.get("sort") || "desc").toLowerCase() === "asc" ? "asc" : "desc"

  let query = supabaseServer
    .from("news_assistant_chats")
    .select(
      "id,user_ip,user_email,user_phone,user_message,assistant_response,used_news_context,created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: sort === "asc" })

  if (q) {
    query = query.or(
      `user_email.ilike.%${q}%,user_phone.ilike.%${q}%,user_ip.ilike.%${q}%,user_message.ilike.%${q}%`
    )
  }
  if (from) query = query.gte("created_at", from)
  if (to) query = query.lte("created_at", to)
  if (used === "true") query = query.eq("used_news_context", true)
  if (used === "false") query = query.eq("used_news_context", false)

  const start = (page - 1) * pageSize
  const end = start + pageSize - 1
  const { data, error, count } = await query.range(start, end)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({
    page,
    pageSize,
    total: count || 0,
    items: data || [],
  })
}
