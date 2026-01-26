import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"
import { getKenyaTodayStartISO } from "@/lib/timezone"

export async function GET() {
  try {
    // Use Kenya timezone for "today" calculations
    const todayStartISO = getKenyaTodayStartISO()

    // Revenue: sum of payments.amount
    const [{ data: todayPayments, error: todayErr }, { data: allPayments, error: allErr }] = await Promise.all([
      supabaseServer
        .from("payments")
        .select("amount,paid_at")
        .gte("paid_at", todayStartISO),
      supabaseServer.from("payments").select("amount"),
    ])
    if (todayErr) return NextResponse.json({ error: todayErr.message }, { status: 500 })
    if (allErr) return NextResponse.json({ error: allErr.message }, { status: 500 })
    const revenueToday = (todayPayments || []).reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0)
    const revenueTotal = (allPayments || []).reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0)

    // Users: count today and total
    const [{ count: usersTotal }, { count: usersToday }] = await Promise.all([
      supabaseServer.from("users").select("id", { count: "exact", head: true }),
      supabaseServer.from("users").select("id", { count: "exact", head: true }).gte("created_at", todayStartISO),
    ])

    // Referrals: agents with today and total users calculated from payments
    const { data: refRows, error: refErr } = await supabaseServer
      .from("referrals")
      .select("id,name,code,status")
      .order("created_at", { ascending: false })
    if (refErr) return NextResponse.json({ error: refErr.message }, { status: 500 })

    // Calculate users_today from payments (same logic as /api/admin/referrals)
    const { data: todayReferralPayments } = await supabaseServer
      .from("payments")
      .select("agent_id")
      .gte("paid_at", todayStartISO)
      .not("agent_id", "is", null)

    const todayMap = new Map<string, number>()
    if (todayReferralPayments) {
      for (const p of todayReferralPayments) {
        const aid = String(p.agent_id)
        todayMap.set(aid, (todayMap.get(aid) || 0) + 1)
      }
    }

    // Calculate total_users from all payments
    const { data: allReferralPayments } = await supabaseServer
      .from("payments")
      .select("agent_id")
      .not("agent_id", "is", null)

    const totalMap = new Map<string, number>()
    if (allReferralPayments) {
      for (const p of allReferralPayments) {
        const aid = String(p.agent_id)
        totalMap.set(aid, (totalMap.get(aid) || 0) + 1)
      }
    }

    const agents = (refRows || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      code: r.code,
      today: todayMap.get(r.id) || 0,
      total: totalMap.get(r.id) || 0,
    }))

    // Video Tutorials: total count (replaces News)
    const { count: videoTutorialsTotal, error: videoErr } = await supabaseServer
      .from("video_tutorials")
      .select("id", { count: "exact", head: true })
    // Don't fail if table doesn't exist, just return 0
    const videoCount = videoErr ? 0 : (videoTutorialsTotal || 0)

    return NextResponse.json({
      revenue: { today: revenueToday, total: revenueTotal },
      users: { today: usersToday || 0, total: usersTotal || 0 },
      referrals: { agents },
      videoTutorials: { total: videoCount },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to load metrics" }, { status: 500 })
  }
}
