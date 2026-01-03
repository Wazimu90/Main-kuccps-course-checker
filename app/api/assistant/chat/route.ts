import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"
import { cookies, headers } from "next/headers"
import { callLLM } from "@/lib/llmRouter"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const message = String(body.message || "").trim()
    const selectedCategory = body.selectedCategory ? String(body.selectedCategory) : ""
    const qualifiedCourses: string[] = Array.isArray(body.qualifiedCourses) ? body.qualifiedCourses : []
    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 })
    }

    const hdrs = await headers()
    const ip =
      hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      hdrs.get("x-real-ip") ||
      "0.0.0.0"

    const cookieStore = await cookies()
    const userEmail = cookieStore.get("user_email")?.value || ""

    // Read chatbot settings
    const { data: settings } = await supabaseServer
      .from("chatbot_settings")
      .select("welcome_message,status,provider,system_prompt,api_key")
      .order("updated_at", { ascending: false })
      .limit(1)
    const cfg = settings && settings.length > 0 ? settings[0] : null
    if (!cfg || cfg.status === "disabled") {
      return NextResponse.json({ reply: "The assistant is currently disabled. Please try again later." })
    }

    const q = message.toLowerCase()
    const tokens = q.split(/\s+/).filter(Boolean)
    const base = Array.isArray(qualifiedCourses) ? qualifiedCourses : []
    const normalize = (c: any) => {
      if (typeof c === "string") {
        return {
          name: c,
          university: "",
          category: "",
          cluster: "",
          text: c.toLowerCase(),
        }
      }
      const name = String(c.name || c.programme_name || c.program_name || c.course || c.title || "").trim()
      const university = String(c.university || c.institution || "").trim()
      const category = String(c.category || c.faculty || c.field || "").trim()
      const cluster = String(c.cluster || c.cluster_points || "").trim()
      const text = [name, university, category, cluster].filter(Boolean).join(" ").toLowerCase()
      return { name, university, category, cluster, text }
    }
    const items = base.map(normalize)
    const matchCategory = (cat: string) => (cat ? (x: any) => x.category.toLowerCase().includes(cat.toLowerCase()) || x.text.includes(cat.toLowerCase()) : () => true)
    const filterByUniversity = (uni: string) => (uni ? (x: any) => x.university.toLowerCase().includes(uni.toLowerCase()) || x.text.includes(uni.toLowerCase()) : () => true)
    const scoreTokens = (x: any, toks: string[]) => toks.reduce((s, t) => (t && x.text.includes(t.toLowerCase()) ? s + 1 : s), 0)
    const toLine = (x: any) => {
      const parts = [x.name, x.university, x.category].filter(Boolean)
      return parts.join(" • ") + (x.cluster ? ` • Cluster: ${x.cluster}` : "")
    }

    // Intent detection
    const mTop = q.match(/(?:top|best)\s*(\d+)?/i)
    const mCount = /(how many|total|number)/i.test(q)
    const mQualify = /(do i qualify|can i do|eligible|qualify)/i.test(q)
    const mExplainCluster = /(cluster points?|explain cluster)/i.test(q)
    const mGreeting = /\b(hi|hello|hey|hujambo|habari|good\s*(morning|afternoon|evening))\b/i.test(q)
    const mAck = /\b(yes|yeah|okay|ok|thanks|thank you|fine|cool|sure)\b/i.test(q)
    const mInUni = q.match(/\b(?:in|at)\s+([a-zA-Z][a-zA-Z\s&'-]+)/i)
    const uniFilter = mInUni ? mInUni[1].trim() : ""

    const catFilter = selectedCategory || ""
    const pool = items.filter(matchCategory(catFilter)).filter(filterByUniversity(uniFilter))

    let content = ""
    let usedLLM = false
    if (cfg?.api_key && cfg?.provider && cfg?.system_prompt) {
      try {
        const llmReply = await callLLM({
          provider: cfg.provider,
          apiKey: cfg.api_key,
          systemPrompt: cfg.system_prompt,
          message,
          context: { selectedCategory, qualifiedCourses },
        })
        if (llmReply) {
          content = llmReply
          usedLLM = true
        }
      } catch {
        usedLLM = false
      }
    }
    if (mExplainCluster) {
      content =
        "Cluster points measure your suitability for course clusters based on subjects and weights. Higher cluster points indicate stronger fit. Focus on improving subject grades in cluster subjects to increase eligibility."
    } else if (!usedLLM && mCount) {
      content = `You have ${pool.length || items.length} qualified courses${catFilter ? ` in ${catFilter}` : ""}${uniFilter ? ` at ${uniFilter}` : ""}.`
    } else if (!usedLLM && mQualify) {
      const relevantTokens = tokens.filter((t) => !["do", "i", "qualify", "can", "eligible", "for"].includes(t))
      const scored = pool
        .map((x, idx) => ({ x, s: scoreTokens(x, relevantTokens), idx }))
        .sort((a, b) => (b.s - a.s) || (a.idx - b.idx))
      if (scored.length && (relevantTokens.length === 0 || scored[0].s > 0)) {
        const top = scored.slice(0, 5)
        content =
          "Yes, you qualify for courses matching your query. Examples:\n" + top.map((e, i) => `${i + 1}. ${toLine(e.x)}`).join("\n")
      } else {
        content = "I couldn't confirm a match. Try mentioning a specific course name, university, or field."
      }
    } else if (!usedLLM && mTop) {
      const limit = mTop[1] ? Math.max(1, Math.min(20, Number(mTop[1]))) : 10
      const scored = pool
        .map((x, idx) => ({ x, s: scoreTokens(x, tokens), idx }))
        .sort((a, b) => (b.s - a.s) || (a.idx - b.idx))
      const top = (tokens.length ? scored.filter((e) => e.s > 0) : scored).slice(0, limit)
      if (top.length) {
        content =
          `Top ${top.length} matches${catFilter ? ` in ${catFilter}` : ""}${uniFilter ? ` at ${uniFilter}` : ""}:\n` +
          top.map((e, i) => `${i + 1}. ${toLine(e.x)}`).join("\n")
      } else {
        content = "No matches found. Try specifying a field (e.g., Engineering) or a university."
      }
    } else if (!usedLLM && mGreeting) {
      const wm = String(cfg.welcome_message || "").trim()
      content = wm
        ? wm
        : "Hello! I’m your KUCCPS Course Assistant. Tell me your interests or preferred universities, and I’ll tailor guidance to your results."
    } else if (!usedLLM && mGreeting) {
      const wm = String(cfg.welcome_message || "").trim()
      content = wm
        ? wm
        : "Hello! I’m your KUCCPS Course Assistant. Tell me your interests or preferred universities, and I’ll tailor guidance to your results."
    } else if (!usedLLM && (mAck || tokens.length <= 1)) {
      const wm = String(cfg.welcome_message || "").trim()
      content =
        wm ||
        "Got it. Share a course, field, or university you’re considering (e.g., “Engineering at UoN”), and I’ll tailor guidance based on your results."
    } else if (!usedLLM) {
      const scored = pool
        .map((x, idx) => ({ x, s: scoreTokens(x, tokens), idx }))
        .sort((a, b) => (b.s - a.s) || (a.idx - b.idx))
      const top = (tokens.length ? scored.filter((e) => e.s > 0) : scored).slice(0, 10)
      if (top.length) {
        content =
          `Here are matches based on your query${catFilter ? ` in ${catFilter}` : ""}${uniFilter ? ` at ${uniFilter}` : ""}:\n` +
          top.map((e, i) => `${i + 1}. ${toLine(e.x)}`).join("\n")
      } else if (pool.length) {
        const any = pool.slice(0, 10)
        content =
          "I couldn’t find a direct match. Here are examples from your qualified list. Tell me your interests or preferred universities to refine:\n" +
          any.map((x, i) => `${i + 1}. ${toLine(x)}`).join("\n")
      } else {
        content = "I couldn’t match that yet. Share a course name, field, or university, and I’ll guide you based on your results."
      }
    }

    if (userEmail) {
      await supabaseServer.rpc("fn_append_user_activity", {
        p_email: userEmail,
        p_ts: new Date().toISOString(),
        p_type: "chat",
        p_metadata: { message },
      })
    }
    await supabaseServer.from("activity_logs").insert({
      event_type: "chat_interaction",
      description: "User sent a chatbot message",
      ip_address: ip,
      email: userEmail || null,
      actor_role: "user",
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ reply: content })
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
}
