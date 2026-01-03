import { supabaseServer } from "../supabaseServer"

export type ProviderName = "openrouter" | "openai" | "gemini" | "qwen"

export interface ChatRequest {
  systemPrompt: string
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>
  temperature?: number
  maxTokens?: number
}

export async function getDecryptedApiKey(): Promise<{ provider: ProviderName; apiKey: string; status: "enabled" | "disabled"; welcome_message?: string; system_prompt?: string } | null> {
  const { data, error } = await supabaseServer.from("chatbot_settings").select("provider,api_key,status,welcome_message,system_prompt").limit(1).maybeSingle()
  if (error || !data) return null
  
  // Try decrypting. If RPC fails or returns error (e.g. function missing), fallback to raw value
  let apiKey = ""
  try {
    const { data: decrypted, error: decErr } = await supabaseServer.rpc("decrypt_chatbot_api_key", { cipher: data.api_key })
    if (decErr) {
       // If decrypt fails (e.g. PGRST202 or key mismatch), assume it's plain text (dev mode fallback)
       console.warn("Decrypt RPC failed/missing, using raw key:", decErr.message)
       apiKey = data.api_key || ""
    } else {
       apiKey = decrypted || ""
    }
  } catch (e) {
    // RPC call threw exception
    apiKey = data.api_key || ""
  }

  return {
    provider: (data.provider as ProviderName) || "openrouter",
    apiKey: apiKey,
    status: (data.status as "enabled" | "disabled") || "disabled",
    welcome_message: data.welcome_message || "",
    system_prompt: data.system_prompt || "",
  }
}

export async function sendWithProvider(provider: ProviderName, apiKey: string, req: ChatRequest): Promise<string> {
  switch (provider) {
    case "openrouter":
      return sendOpenRouter(apiKey, req)
    case "openai":
      return sendOpenAI(apiKey, req)
    case "gemini":
      return sendGemini(apiKey, req)
    case "qwen":
      return sendQwen(apiKey, req)
    default:
      throw new Error("Unsupported provider")
  }
}

async function sendOpenRouter(apiKey: string, req: ChatRequest): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "KUCCPS Course Checker",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: req.messages,
      temperature: req.temperature ?? 0.4,
      max_tokens: req.maxTokens ?? 500,
    }),
  })
  if (!response.ok) throw new Error(`openrouter ${response.status}`)
  const json = await response.json()
  return json.choices?.[0]?.message?.content ?? ""
}

async function sendOpenAI(apiKey: string, req: ChatRequest): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: req.messages,
      temperature: req.temperature ?? 0.4,
      max_tokens: req.maxTokens ?? 500,
    }),
  })
  if (!response.ok) throw new Error(`openai ${response.status}`)
  const json = await response.json()
  return json.choices?.[0]?.message?.content ?? ""
}

async function sendGemini(apiKey: string, req: ChatRequest): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`
  const parts = req.messages.map((m) => ({ role: m.role, parts: [{ text: m.content }] }))
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: parts }),
  })
  if (!response.ok) throw new Error(`gemini ${response.status}`)
  const json = await response.json()
  return json?.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
}

async function sendQwen(apiKey: string, req: ChatRequest): Promise<string> {
  const response = await fetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen2.5-7b-instruct",
      input: {
        messages: req.messages,
      },
      parameters: {
        temperature: req.temperature ?? 0.4,
        max_tokens: req.maxTokens ?? 500,
      },
    }),
  })
  if (!response.ok) throw new Error(`qwen ${response.status}`)
  const json = await response.json()
  return json.output_text ?? json.choices?.[0]?.message?.content ?? ""
}

