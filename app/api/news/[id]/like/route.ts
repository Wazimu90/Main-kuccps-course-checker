import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { supabaseServer } from "@/lib/supabaseServer"

function getIp(req: NextRequest): string | null {
  const xf = req.headers.get("x-forwarded-for")
  if (xf) return xf.split(",")[0].trim()
  const xr = req.headers.get("x-real-ip")
  if (xr) return xr.trim()
  const cf = req.headers.get("cf-connecting-ip")
  if (cf) return cf.trim()
  return null
}

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const newsId = params.id
  const ip = getIp(req)
  if (!ip) return NextResponse.json({ error: "IP not found" }, { status: 400 })

  const existing = await supabase
    .from("news_likes")
    .select("id")
    .eq("news_id", newsId)
    .eq("user_ip", ip)
    .limit(1)
    .maybeSingle()

  if (existing.data) {
    return NextResponse.json({ message: "Already liked" }, { status: 409 })
  }
  if (existing.error) {
    return NextResponse.json({ error: existing.error.message }, { status: 500 })
  }

  const insertRes = await supabase.from("news_likes").insert({ news_id: newsId, user_ip: ip })
  if (insertRes.error) {
    return NextResponse.json({ error: insertRes.error.message }, { status: 500 })
  }

  const countRes = await supabase
    .from("news_likes")
    .select("id", { count: "exact", head: true })
    .eq("news_id", newsId)
  if (countRes.error) {
    return NextResponse.json({ error: countRes.error.message }, { status: 500 })
  }

  const likesCount = countRes.count ?? 0
  const updateRes = await supabase.from("news").update({ likes_count: likesCount }).eq("id", newsId)
  if (updateRes.error) {
    return NextResponse.json({ error: updateRes.error.message }, { status: 500 })
  }

  // Activity log insert
  const now = new Date().toISOString()
  await supabaseServer
    .from("activity_logs")
    .insert({
      event_type: "user.news.like",
      description: `Liked news '${newsId}'`,
      ip_address: ip,
      email: null,
      phone_number: null,
      actor_role: "user",
      created_at: now,
    })
    .catch(() => {})

  return NextResponse.json({ likes_count: likesCount })
}
