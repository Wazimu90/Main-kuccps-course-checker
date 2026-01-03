import { supabase } from "./supabase"

export type NewsRow = {
  id: string
  title: string
  slug: string
  thumbnail_url: string | null
  content: string
  category: string | null
  tags: string[] | null
  created_at: string
  updated_at: string | null
  likes_count: number | null
  comments_count: number | null
}

export type CommentRow = {
  id: string
  news_id: string
  name: string
  comment: string
  created_at: string
}

export async function fetchNewsList(): Promise<NewsRow[]> {
  const { data, error } = await supabase
    .from("news")
    .select(
      "id,title,slug,thumbnail_url,content,category,tags,created_at,updated_at,likes_count,comments_count"
    )
    .order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchNewsBySlug(slug: string): Promise<NewsRow | null> {
  const { data, error } = await supabase
    .from("news")
    .select("id,title,slug,thumbnail_url,content,category,tags,created_at,updated_at,likes_count,comments_count")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data ?? null
}

export async function fetchNewsById(id: string): Promise<NewsRow | null> {
  const { data, error } = await supabase
    .from("news")
    .select("id,title,slug,thumbnail_url,content,category,tags,created_at,updated_at,likes_count,comments_count")
    .eq("id", id)
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data ?? null
}

export async function fetchComments(newsId: string): Promise<CommentRow[]> {
  const { data, error } = await supabase
    .from("news_comments")
    .select("id,news_id,name,comment,created_at")
    .eq("news_id", newsId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export function summarizeContent(content: string, max = 160): string {
  const cleaned = content.replace(/\s+/g, " ").trim()
  if (cleaned.length <= max) return cleaned
  const slice = cleaned.slice(0, max)
  const lastSpace = slice.lastIndexOf(" ")
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice) + "…"
}

export function formatDate(dateIso: string): string {
  const d = new Date(dateIso)
  return new Intl.DateTimeFormat("en-KE", { dateStyle: "medium" }).format(d)
}

export function sanitizeHtml(html: string): string {
  try {
    const hasDOM = typeof window !== "undefined" && typeof (window as any).DOMParser !== "undefined"
    if (hasDOM) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(String(html || ""), "text/html")
      const disallowed = new Set(["script", "iframe", "object", "embed", "style"])
      const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT)
      let node = walker.currentNode as Element | null
      while (node) {
        const tag = node.tagName.toLowerCase()
        if (disallowed.has(tag)) {
          const toRemove = node
          const parent = toRemove.parentNode
          if (parent) parent.removeChild(toRemove)
          node = walker.nextNode() as Element | null
          continue
        }
        const attrs = Array.from(node.attributes)
        for (const attr of attrs) {
          const name = attr.name.toLowerCase()
          const value = attr.value || ""
          if (name.startsWith("on")) node.removeAttribute(attr.name)
          if (name === "style") node.removeAttribute(attr.name)
          if ((name === "href" || name === "src") && /^\s*javascript:/i.test(value)) node.removeAttribute(attr.name)
        }
        node = walker.nextNode() as Element | null
      }
      return doc.body.innerHTML
    }
    let safe = String(html || "")
    safe = safe.replace(/<\s*script[\s\S]*?<\s*\/\s*script\s*>/gi, "")
    safe = safe.replace(/on[a-z]+\s*=\s*"[^"]*"/gi, "")
    safe = safe.replace(/on[a-z]+\s*=\s*'[^']*'/gi, "")
    safe = safe.replace(/javascript:/gi, "")
    return safe
  } catch {
    const text = String(html || "")
    return text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string))
  }
}
