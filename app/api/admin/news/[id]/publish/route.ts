import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action") || "toggle"
  const now = new Date().toISOString()

  const { data: row, error: getErr } = await supabaseServer
    .from("news")
    .select("id,title,tags,status")
    .eq("id", id)
    .limit(1)
    .maybeSingle()
  if (getErr || !row) {
    return NextResponse.json({ error: getErr?.message || "Not found" }, { status: 404 })
  }

  const tags: string[] = Array.isArray(row.tags) ? row.tags : []
  const isPublished = (row.status === "published") || tags.includes("published")
  let nextTags = tags.slice()
  let publishedNow = isPublished

  if (action === "publish") {
    if (!isPublished) nextTags.push("published")
    publishedNow = true
  } else if (action === "unpublish") {
    nextTags = nextTags.filter((t) => t !== "published")
    publishedNow = false
  } else {
    if (isPublished) nextTags = nextTags.filter((t) => t !== "published")
    else nextTags.push("published")
    publishedNow = !isPublished
  }

  const { error: updErr } = await supabaseServer
    .from("news")
    .update({ tags: nextTags, status: publishedNow ? "published" : "draft", updated_at: now })
    .eq("id", id)
  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 })
  }

  await supabaseServer.from("activity_logs").insert({
    event_type: publishedNow ? "admin.news.publish" : "admin.news.unpublish",
    description: `${publishedNow ? "Published" : "Unpublished"} news '${row.title}'`,
    email: null,
    phone_number: null,
    actor_role: "admin",
    created_at: now,
  })

  return NextResponse.json({ ok: true, tags: nextTags })
}
