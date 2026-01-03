import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get("page") || 1)
  const pageSize = Number(searchParams.get("pageSize") || 10)
  const q = String(searchParams.get("q") || "").trim()
  const category = searchParams.get("category")
  const published = searchParams.get("published")

  let query = supabaseServer
    .from("news")
    .select(
      "id,title,slug,thumbnail_url,content,category,tags,created_at,updated_at,likes_count,comments_count",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })

  if (q) {
    query = query.or(`title.ilike.%${q}%,slug.ilike.%${q}%,category.ilike.%${q}%`)
  }
  if (category) {
    query = query.eq("category", category)
  }
  if (published === "true") {
    query = query.contains("tags", ["published"])
  }
  if (published === "false") {
    query = query.not("tags", "cs", ["published"])
  }

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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const now = new Date().toISOString()
    const title: string = body.title
    const slug: string =
      body.slug ||
      String(title || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")

    const { data: existing, error: existsError } = await supabaseServer
      .from("news")
      .select("id")
      .eq("slug", slug)
      .limit(1)
    if (existsError) {
      return NextResponse.json({ error: existsError.message }, { status: 500 })
    }
    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 })
    }

    const insertPayload = {
      title,
      slug,
      thumbnail_url: body.thumbnail_url || null,
      content: String(body.content || ""),
      category: body.category || null,
      tags: Array.isArray(body.tags) ? body.tags : [],
      status: body.status || "draft",
      created_at: now,
      updated_at: now,
      likes_count: 0,
      comments_count: 0,
    }
    const { data, error } = await supabaseServer.from("news").insert(insertPayload).select("*").limit(1)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await supabaseServer.from("activity_logs").insert({
      event_type: "admin.news.create",
      description: `Created news '${title}'`,
      email: null,
      phone_number: null,
      actor_role: "admin",
      created_at: now,
    })

    return NextResponse.json({ item: data?.[0] || null })
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
}
