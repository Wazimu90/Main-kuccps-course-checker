import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function GET() {
  try {
    const [{ count: totalPosts }, { count: publishedPosts }] = await Promise.all([
      supabaseServer.from("news").select("*", { count: "exact", head: true }),
      supabaseServer.from("news").select("*", { count: "exact", head: true }).eq("status", "published"),
    ])

    const { count: expertUses } = await supabaseServer
      .from("news_assistant_chats")
      .select("*", { count: "exact", head: true })

    const { data: rows, error: sumErr } = await supabaseServer
      .from("news")
      .select("likes_count,comments_count,views_count")

    if (sumErr) {
      return NextResponse.json({ error: sumErr.message }, { status: 500 })
    }
    const likes = (rows || []).reduce((acc, r: any) => acc + (r.likes_count || 0), 0)
    const comments = (rows || []).reduce((acc, r: any) => acc + (r.comments_count || 0), 0)
    const views = (rows || []).reduce((acc, r: any) => acc + (r.views_count || 0), 0)
    const engagementTotal = (rows || []).reduce(
      (acc, r: any) => acc + ((r.likes_count || 0) + (r.comments_count || 0) + (r.views_count || 0)),
      0,
    )

    return NextResponse.json({
      totalPosts: totalPosts || 0,
      publishedPosts: publishedPosts || 0,
      expertUses: expertUses || 0,
      engagement: { likes, comments, views },
      likesTotal: likes,
      commentsTotal: comments,
      viewsTotal: views,
      engagementTotal,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to load summary" }, { status: 500 })
  }
}
