import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = String(searchParams.get("email") || "").trim()
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 })
  }
  const { data, error } = await supabaseServer.from("users").select("status").eq("email", email).limit(1)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  const status = data && data.length > 0 ? data[0].status : "active"
  return NextResponse.json({ status })
}

