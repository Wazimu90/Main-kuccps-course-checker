export function getInitials(name?: string): string {
  const n = (name || "").trim()
  if (!n) return "U"
  const parts = n.split(/\s+/)
  const first = parts[0]?.[0] || "U"
  const second = parts[1]?.[0] || ""
  return (first + second).toUpperCase()
}

export function isValidCommentPayload(name?: string, comment?: string): boolean {
  const n = (name || "").trim()
  const c = (comment || "").trim()
  if (!n || !c) return false
  if (n.length > 120) return false
  if (c.length > 2000) return false
  return true
}

