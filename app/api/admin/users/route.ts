import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get("page") || 1)
  const pageSize = Number(searchParams.get("pageSize") || 10)
  const q = String(searchParams.get("q") || "").trim()
  const status = String(searchParams.get("status") || "").trim()
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  let query = supabaseServer
    .from("users")
    .select(
      "id,name,email,phone_number,course_category,agent,status,created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,email.ilike.%${q}%,phone_number.ilike.%${q}%`
    )
  }
  if (status) {
    query = query.eq("status", status)
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

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const { count: todayCount } = await supabaseServer
    .from("users")
    .select("id", { count: "exact", head: true })
    .gte("created_at", todayStart.toISOString())

  return NextResponse.json({
    page,
    pageSize,
    total: count || 0,
    today: todayCount || 0,
    items: data || [],
  })
}

