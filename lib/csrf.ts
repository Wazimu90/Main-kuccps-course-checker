import crypto from "crypto"
import { cookies } from "next/headers"

export function generateCsrfToken(): string {
  return crypto.randomBytes(16).toString("hex")
}

export function getOrSetCsrfCookie(): string {
  const c = cookies()
  const current = c.get("csrf_token")?.value
  if (current) return current
  const token = generateCsrfToken()
  c.set("csrf_token", token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 60 * 60,
  })
  return token
}

export function verifyCsrfToken(headerToken: string | null): boolean {
  try {
    if (!headerToken) return false
    const c = cookies()
    const cookieToken = c.get("csrf_token")?.value || ""
    return cookieToken.length > 0 && cookieToken === headerToken
  } catch {
    return false
  }
}

