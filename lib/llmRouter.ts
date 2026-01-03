type Provider = "openrouter" | "openai" | "gemini" | "qwen"

function trimCourses(courses: any[], max = 30) {
  return (Array.isArray(courses) ? courses : []).slice(0, max)
}

function buildUserContent(message: string, context: { selectedCategory?: string; qualifiedCourses?: any[] }) {
  const summary = {
    selectedCategory: context.selectedCategory || null,
    qualifiedCourses: trimCourses(context.qualifiedCourses || [], 30),
  }
  return `User message:\n${message}\n\nContext (JSON):\n${JSON.stringify(summary)}`
}

export async function callLLM(opts: {
  provider: Provider
  apiKey: string
  systemPrompt: string
  message: string
  context: { selectedCategory?: string; qualifiedCourses?: any[] }
}) {
  const { provider, apiKey, systemPrompt, message, context } = opts
  const userContent = buildUserContent(message, context)
  try {
    if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
          temperature: 0.4,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.message || "LLM error")
      return String(json.choices?.[0]?.message?.content || "").trim()
    }
    if (provider === "openrouter") {
      const res = await fetch("https://api.openrouter.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "openrouter/auto",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
          temperature: 0.4,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.message || "LLM error")
      return String(json.choices?.[0]?.message?.content || "").trim()
    }
    if (provider === "gemini") {
      // Gemini REST
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\n${userContent}` }],
            },
          ],
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.message || "LLM error")
      return String(json.candidates?.[0]?.content?.parts?.[0]?.text || "").trim()
    }
    if (provider === "qwen") {
      const res = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "qwen-plus",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
          temperature: 0.4,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.message || "LLM error")
      return String(json.choices?.[0]?.message?.content || "").trim()
    }
    throw new Error("Unsupported provider")
  } catch (e: any) {
    throw e
  }
}

