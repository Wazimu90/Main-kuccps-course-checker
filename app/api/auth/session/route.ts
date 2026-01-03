import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"
import { z } from "zod"

const schema = z.object({
  access_token: z.string().min(10),
  refresh_token: z.string().min(10),
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }
  const { access_token, refresh_token } = parsed.data
  try {
    const { data, error } = await supabaseServer.auth.getUser(access_token)
    if (error || !data?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const email = data.user.email
    if (email !== "wazimuautomate@gmail.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const res = NextResponse.json({ ok: true })
    res.cookies.set("sb-access-token", access_token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      maxAge: 60 * 60,
    })
    res.cookies.set("sb-refresh-token", refresh_token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      maxAge: 60 * 60 * 24 * 7,
    })
    res.cookies.set("user_email", email, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      maxAge: 60 * 60 * 24 * 7,
    })
    return res
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

