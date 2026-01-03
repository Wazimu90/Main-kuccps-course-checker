import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("system_settings")
      .select("*")
      .limit(1)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Default settings if none exist
    const settings = data || {
      site_name: "KUCCPS Course Checker",
      site_description: "Find the perfect courses based on your KCSE results",
      contact_email: "info@kuccpschecker.com",
      contact_phone: null,
      whatsapp_number: null,
      payment_amount: 200,
      maintenance_mode: false,
      payment_status: true,
    }

    return NextResponse.json({ settings })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const {
      site_name,
      site_description,
      contact_email,
      contact_phone,
      whatsapp_number,
      payment_amount,
      maintenance_mode,
      payment_status,
    } = body

    // Check if a row exists
    const { data: existing } = await supabaseServer
      .from("system_settings")
      .select("id")
      .limit(1)
      .maybeSingle()

    let error
    if (existing) {
      const { error: updateError } = await supabaseServer
        .from("system_settings")
        .update({
          site_name,
          site_description,
          contact_email,
          contact_phone,
          whatsapp_number,
          payment_amount,
          maintenance_mode,
          payment_status,
          created_at: new Date().toISOString(), // updating timestamp effectively
        })
        .eq("id", existing.id)
      error = updateError
    } else {
      const { error: insertError } = await supabaseServer.from("system_settings").insert({
        site_name,
        site_description,
        contact_email,
        contact_phone,
        whatsapp_number,
        payment_amount,
        maintenance_mode,
        payment_status,
      })
      error = insertError
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
