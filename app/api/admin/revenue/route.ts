import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "day"

  try {
    const now = new Date()
    const startOfWeek = new Date(now)
    const day = startOfWeek.getDay() === 0 ? 7 : startOfWeek.getDay()
    // set to Monday
    startOfWeek.setDate(startOfWeek.getDate() - (day - 1))
    startOfWeek.setHours(0, 0, 0, 0)

    const addDays = (date: Date, days: number) => {
      const d = new Date(date)
      d.setDate(d.getDate() + days)
      return d
    }
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfPrevMonths = (n: number) => {
      const d = new Date(now.getFullYear(), now.getMonth() - n, 1)
      d.setHours(0, 0, 0, 0)
      return d
    }

    let data: Array<{ date: string; revenue: number }> = []

    if (period === "week") {
      // Last 4 weeks revenue totals
      for (let w = 3; w >= 0; w--) {
        const start = new Date(startOfWeek)
        start.setDate(start.getDate() - w * 7)
        const end = addDays(start, 7)
        const { data: rows, error } = await supabaseServer
          .from("payments")
          .select("amount,paid_at")
          .gte("paid_at", start.toISOString())
          .lt("paid_at", end.toISOString())
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        const sum = (rows || []).reduce((acc: number, r: any) => acc + Number(r.amount || 0), 0)
        const labelIdx = 3 - w + 1
        data.push({ date: `Week ${labelIdx}`, revenue: sum })
      }
    } else if (period === "month") {
      // Last 12 months revenue totals
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ]
      for (let m = 11; m >= 0; m--) {
        const start = startOfPrevMonths(m)
        const end = startOfPrevMonths(m - 1)
        const { data: rows, error } = await supabaseServer
          .from("payments")
          .select("amount,paid_at")
          .gte("paid_at", start.toISOString())
          .lt("paid_at", end.toISOString())
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        const sum = (rows || []).reduce((acc: number, r: any) => acc + Number(r.amount || 0), 0)
        data.push({ date: monthNames[start.getMonth()], revenue: sum })
      }
    } else {
      // Current week: Monday..Sunday
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
      for (let i = 0; i < 7; i++) {
        const start = addDays(startOfWeek, i)
        const end = addDays(start, 1)
        const { data: rows, error } = await supabaseServer
          .from("payments")
          .select("amount,paid_at")
          .gte("paid_at", start.toISOString())
          .lt("paid_at", end.toISOString())
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        const sum = (rows || []).reduce((acc: number, r: any) => acc + Number(r.amount || 0), 0)
        data.push({ date: days[i], revenue: sum })
      }
    }

    return NextResponse.json({ period, data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to load revenue data" }, { status: 500 })
  }
}
