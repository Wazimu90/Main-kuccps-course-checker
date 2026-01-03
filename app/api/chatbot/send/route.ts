import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"
import { getDecryptedApiKey, sendWithProvider } from "@/lib/chatbot/providers"
import { isInScope, refusalMessage } from "@/lib/chatbot/domain-guard"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const user_message: string = String(body.user_message || "")
    const user_email: string | null = body.user_email || null
    const user_phone: string | null = body.user_phone || null
    const user_ip: string | null = body.user_ip || null
    const student_context: any = body.student_context || null
    const now = new Date().toISOString()

    const settings = await getDecryptedApiKey()
    if (!settings) {
      return NextResponse.json({ error: "Chatbot not configured" }, { status: 500 })
    }
    if (settings.status !== "enabled") {
      return NextResponse.json({ assistant_response: "The Course Assistant is currently disabled. Please try again later." })
    }

    if (!isInScope(user_message)) {
      const assistant_response = refusalMessage()
      await supabaseServer.from("chatbot_conversations").insert({
        user_email,
        user_phone,
        user_ip,
        conversation: {
          messages: [
            { role: "system", content: (settings.system_prompt || "") },
            { role: "system", content: `StudentContext: ${JSON.stringify(student_context || {}, null, 2)}` },
            { role: "user", content: user_message },
            { role: "assistant", content: assistant_response },
          ],
          meta: {
            provider: settings.provider,
            created_at: now,
            result_id: student_context?.result_id || null,
          },
        },
      })
      return NextResponse.json({ assistant_response })
    }

    const systemPrompt = (settings.system_prompt || "").trim()
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "system", content: `StudentContext:\n${JSON.stringify(student_context || {}, null, 2)}` },
      { role: "user", content: user_message },
    ]

    const assistant_response = await sendWithProvider(settings.provider, settings.apiKey, {
      systemPrompt,
      messages,
      temperature: 0.4,
      maxTokens: 600,
    })

    await supabaseServer.from("chatbot_conversations").insert({
      user_email,
      user_phone,
      user_ip,
      conversation: {
        messages,
        meta: {
          provider: settings.provider,
          created_at: now,
          result_id: student_context?.result_id || null,
        },
      },
    })

    return NextResponse.json({ assistant_response })
  } catch (e: any) {
    console.error("Chatbot Send Error:", e)
    return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 })
  }
}

