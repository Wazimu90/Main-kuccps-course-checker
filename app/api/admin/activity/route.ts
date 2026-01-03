import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get("page") || 1)
  const pageSize = Number(searchParams.get("pageSize") || 10)
  const type = String(searchParams.get("type") || "all")
  const q = String(searchParams.get("q") || "").trim()
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  let query = supabaseServer
    .from("activity_logs")
    .select("id,event_type,description,email,phone_number,actor_role,created_at", { count: "exact" })
    .order("created_at", { ascending: false })

  if (type && type !== "all") {
    query = query.eq("actor_role", type)
  }
  if (q) {
    query = query.or(
      `description.ilike.%${q}%,email.ilike.%${q}%,phone_number.ilike.%${q}%`
    )
  }
  if (from) {
    query = query.gte("created_at", from)
  }
  if (to) {
    query = query.lte("created_at", to)
  }

  const start = (page - 1) * pageSize
  const end = start + pageSize - 1
  query = query.range(start, end)

  const { data, error, count } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const mapped =
    (data || []).map((d: any) => ({
      id: d.id,
      type: d.actor_role,
      action: d.description || d.event_type,
      user: d.email || d.phone_number || "N/A",
      timestamp: d.created_at,
    })) || []

  return NextResponse.json({
    page,
    pageSize,
    total: count || 0,
    data: mapped,
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { event_type, description, email, phone_number, actor_role } = body
    const { error } = await supabaseServer.from("activity_logs").insert({
      event_type: event_type || "event",
      description: description || "",
      email: email || null,
      phone_number: phone_number || null,
      actor_role: actor_role || "admin",
      created_at: new Date().toISOString(),
    })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
}
