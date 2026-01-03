import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const { data, error } = await supabaseServer
    .from("news")
    .select(
      "id,title,slug,thumbnail_url,content,category,tags,created_at,updated_at,likes_count,comments_count"
    )
    .eq("id", id)
    .limit(1)
    .maybeSingle()
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ item: data || null })
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const body = await request.json()
    const now = new Date().toISOString()
    const updatePayload: any = {
      title: body.title,
      slug:
        body.slug ||
        String(body.title || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
      thumbnail_url: body.thumbnail_url ?? null,
      content: String(body.content ?? ""),
      category: body.category ?? null,
      tags: Array.isArray(body.tags) ? body.tags : [],
      status: body.status ?? null,
      updated_at: now,
    }
    const { data, error } = await supabaseServer
      .from("news")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .limit(1)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await supabaseServer.from("activity_logs").insert({
      event_type: "admin.news.update",
      description: `Updated news '${updatePayload.title}'`,
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

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const now = new Date().toISOString()
  const { data: row } = await supabaseServer.from("news").select("title").eq("id", id).limit(1).maybeSingle()
  const { error } = await supabaseServer.from("news").delete().eq("id", id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  await supabaseServer.from("activity_logs").insert({
    event_type: "admin.news.delete",
    description: `Deleted news '${row?.title || id}'`,
    email: null,
    phone_number: null,
    actor_role: "admin",
    created_at: now,
  })
  return NextResponse.json({ ok: true })
}
