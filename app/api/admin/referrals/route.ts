import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"
import { cookies, headers } from "next/headers"
import { getKenyaTodayStartISO } from "@/lib/timezone"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = String(searchParams.get("q") || "").trim()

  // select agents
  let query = supabaseServer
    .from("referrals")
    .select("id,name,code,total_users,link,phone_number,status")
    .order("created_at", { ascending: false })
  if (q) {
    query = query.or(`name.ilike.%${q}%,code.ilike.%${q}%`)
  }
  const { data: agentsData, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // calculate users_today from payments using Kenya timezone
  const todayStartISO = getKenyaTodayStartISO()

  const { data: todayPayments } = await supabaseServer
    .from("payments")
    .select("agent_id")
    .gte("paid_at", todayStartISO)
    .not("agent_id", "is", null)

  const todayMap = new Map<string, number>()
  if (todayPayments) {
    for (const p of todayPayments) {
      const aid = String(p.agent_id)
      todayMap.set(aid, (todayMap.get(aid) || 0) + 1)
    }
  }

  const agents = (agentsData || []).map((r: any) => ({
    id: r.id,
    name: r.name,
    code: r.code,
    today: todayMap.get(r.id) || 0,
    total: r.total_users || 0,
    link: r.link || null,
    phone_number: r.phone_number || null,
    status: r.status || "active",
  }))
  return NextResponse.json({ agents })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = String(body.name || "").trim()
    const phone_number = String(body.phone_number || "").trim()
    if (!name) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 })
    }
    const cookieStore = await cookies()
    const csrfCookie = cookieStore.get("csrf_token")?.value || ""
    const hdrs = await headers()
    const csrfHeader = hdrs.get("x-csrf-token") || ""
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      return NextResponse.json({ error: "csrf_failed" }, { status: 403 })
    }
    // Generate next sequential code like ref_01, ref_02 ...
    const { data: existing } = await supabaseServer.from("referrals").select("code")
    const nextNum =
      (existing || [])
        .map((r: any) => {
          const m = String(r.code || "").match(/^ref_(\d+)$/)
          return m ? Number(m[1]) : 0
        })
        .reduce((max: number, n: number) => (n > max ? n : max), 0) + 1
    let code = `ref_${String(nextNum).padStart(2, "0")}`
    let link = `/rc=${code}`

    // Try insert; if unique violation, bump and retry a couple times
    let data: any = null
    let lastErr: any = null
    for (let attempt = 0; attempt < 3; attempt++) {
      const ins = await supabaseServer
        .from("referrals")
        .insert({ name, phone_number, code, link, users_today: 0, total_users: 0, status: "active" })
        .select("id,name,code,users_today,total_users,link,phone_number")
        .single()
      if (!ins.error) {
        data = ins.data
        break
      }
      lastErr = ins.error
      // If code collision, bump number and retry
      code = `ref_${String(nextNum + attempt + 1).padStart(2, "0")}`
      link = `/rc=${code}`
    }
    if (!data) {
      return NextResponse.json({ error: lastErr?.message || "Failed to add referral" }, { status: 500 })
    }
    const agent = {
      id: data.id,
      name: data.name,
      code: data.code,
      today: data.users_today || 0,
      total: data.total_users || 0,
      link: data.link || `/rc=${data.code}`,
      phone_number: data.phone_number || null,
    }
    await supabaseServer.from("activity_logs").insert({
      event_type: "referral_added",
      description: `Referral ${agent.code} created`,
      actor_role: "admin",
      created_at: new Date().toISOString(),
    })
    return NextResponse.json({ agent }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
}
