import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { supabaseServer } from "@/lib/supabaseServer"
import { NextRequest } from "next/server"

function getIp(req: NextRequest): string | null {
  const xf = req.headers.get("x-forwarded-for")
  if (xf) return xf.split(",")[0].trim()
  const xr = req.headers.get("x-real-ip")
  if (xr) return xr.trim()
  const cf = req.headers.get("cf-connecting-ip")
  if (cf) return cf.trim()
  return null
}

export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const newsId = params.id
  const res = await supabase
    .from("news_comments")
    .select("id,name,comment,created_at")
    .eq("news_id", newsId)
    .order("created_at", { ascending: false })
  if (res.error) return NextResponse.json({ error: res.error.message }, { status: 500 })
  return NextResponse.json(res.data ?? [])
}

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const newsId = params.id
  const body = await req.json()
  const name = String(body?.name ?? "").trim()
  const comment = String(body?.comment ?? "").trim()
  if (!name || !comment) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })

  const insertRes = await supabase.from("news_comments").insert({ news_id: newsId, name, comment }).select()
  if (insertRes.error) return NextResponse.json({ error: insertRes.error.message }, { status: 500 })

  const countRes = await supabase
    .from("news_comments")
    .select("id", { count: "exact", head: true })
    .eq("news_id", newsId)
  if (countRes.error) return NextResponse.json({ error: countRes.error.message }, { status: 500 })

  const commentsCount = countRes.count ?? 0
  const updateRes = await supabase.from("news").update({ comments_count: commentsCount }).eq("id", newsId)
  if (updateRes.error) return NextResponse.json({ error: updateRes.error.message }, { status: 500 })

  // Activity log insert
  const ip = getIp(req) || "0.0.0.0"
  const now = new Date().toISOString()
  await supabaseServer
    .from("activity_logs")
    .insert({
      event_type: "user.news.comment",
      description: `Commented on news '${newsId}' by '${name}'`,
      ip_address: ip,
      email: null,
      phone_number: null,
      actor_role: "user",
      created_at: now,
      metadata: { length: comment.length },
    })
    .catch(() => {})

  return NextResponse.json({ inserted: insertRes.data?.[0], comments_count: commentsCount })
}
