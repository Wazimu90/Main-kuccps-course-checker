import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"
import { headers } from "next/headers"

const rateLimitMap = new Map<string, { count: number; ts: number }>()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = String(searchParams.get("code") || "").trim()
  if (!code) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  if (!/^ref_\d{2,}$/.test(code)) {
    return NextResponse.json({ ok: false, error: "invalid_format" }, { status: 400 })
  }

  const hdrs = await headers()
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    "0.0.0.0"

  const now = Date.now()
  const rl = rateLimitMap.get(ip) || { count: 0, ts: now }
  if (now - rl.ts > 60_000) {
    rl.count = 0
    rl.ts = now
  }
  rl.count += 1
  rateLimitMap.set(ip, rl)
  if (rl.count > 60) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 })
  }

  const { data, error } = await supabaseServer
    .from("referrals")
    .select("id,code,status")
    .eq("code", code)
    .eq("status", "active")
    .limit(1)
  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
  const found = data && data.length > 0
  return NextResponse.json({ ok: found, id: found ? data![0].id : null })
}
