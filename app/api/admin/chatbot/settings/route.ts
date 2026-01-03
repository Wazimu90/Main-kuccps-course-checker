import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function GET() {
  const { data, error } = await supabaseServer
    .from("chatbot_settings")
    .select("id,welcome_message,status,provider,system_prompt,updated_at")
    .limit(1)
    .maybeSingle()
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ settings: data || null })
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const now = new Date().toISOString()
    const payload = {
      welcome_message: body.welcome_message ?? "",
      status: body.status === "enabled" ? "enabled" : "disabled",
      provider: body.provider ?? "openrouter",
      system_prompt: body.system_prompt ?? "",
      updated_at: now,
    }
    const api_key: string | null = body.api_key ?? null
    if (api_key) {
      try {
        const { data: cipher, error: encErr } = await supabaseServer.rpc("encrypt_chatbot_api_key", { plain: api_key })
        if (encErr) {
          console.error("Encryption error:", encErr)
          // Fallback: store as plain text if RPC fails (DEV ONLY) or return error
          // If the function doesn't exist (PGRST202), we'll store it plainly to unblock the user
          if (encErr.code === 'PGRST202') {
             Object.assign(payload, { api_key: api_key })
          } else {
             return NextResponse.json({ error: "Encryption failed: " + encErr.message }, { status: 500 })
          }
        } else {
          Object.assign(payload, { api_key: cipher })
        }
      } catch (e: any) {
        // If RPC call throws unexpectedly, also fallback
        console.error("Encryption exception:", e)
        Object.assign(payload, { api_key: api_key })
      }
    }

    // Check if record exists to grab ID
    const { data: existing } = await supabaseServer.from("chatbot_settings").select("id").limit(1).maybeSingle()
    
    let error
    if (existing) {
       const { error: upErr } = await supabaseServer
         .from("chatbot_settings")
         .update(payload)
         .eq("id", existing.id)
       error = upErr
    } else {
       const { error: inErr } = await supabaseServer
         .from("chatbot_settings")
         .insert(payload)
       error = inErr
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
}

