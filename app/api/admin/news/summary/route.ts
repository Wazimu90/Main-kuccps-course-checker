import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function GET() {
  try {
    // Count total news posts
    const { count: totalPosts } = await supabaseServer
      .from("news")
      .select("*", { count: "exact", head: true })

    // Count published news posts (by status = 'published')
    const { count: publishedPosts } = await supabaseServer
      .from("news")
      .select("*", { count: "exact", head: true })
      .eq("status", "published")

    // Count KUCCPS Expert assistant chats
    const { count: expertUses } = await supabaseServer
      .from("news_assistant_chats")
      .select("*", { count: "exact", head: true })

    // Count video tutorials
    const { count: videoTutorialsCount } = await supabaseServer
      .from("video_tutorials")
      .select("*", { count: "exact", head: true })

    // Get engagement metrics (likes, comments, views) from news table
    const { data: newsRows, error: newsError } = await supabaseServer
      .from("news")
      .select("likes_count, comments_count, views_count")

    if (newsError) {
      console.error("Error fetching news engagement:", newsError)
    }

    const likes = (newsRows || []).reduce((acc, r: any) => acc + (r.likes_count || 0), 0)
    const comments = (newsRows || []).reduce((acc, r: any) => acc + (r.comments_count || 0), 0)
    const views = (newsRows || []).reduce((acc, r: any) => acc + (r.views_count || 0), 0)

    return NextResponse.json({
      totalPosts: totalPosts || 0,
      publishedPosts: publishedPosts || 0,
      videoTutorialsCount: videoTutorialsCount || 0,
      expertUses: expertUses || 0,
      engagement: { likes, comments, views },
    })
  } catch (e: any) {
    console.error("Summary endpoint error:", e)
    return NextResponse.json({ error: e?.message || "Failed to load summary" }, { status: 500 })
  }
}
