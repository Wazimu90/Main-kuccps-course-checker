import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl

  // --- Maintenance Mode Check ---
  // Skip static assets, admin routes, and the maintenance page itself
  if (
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/static") &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/api/admin") && // Allow admin API
    pathname !== "/maintenance" &&
    pathname !== "/favicon.ico"
  ) {
    try {
      // Call internal API or check DB directly via Edge Functions if possible.
      // Since middleware runs on edge, we fetch the settings via the public API route if feasible,
      // but calling internal API from middleware can be tricky (cold starts, URL construction).
      // A robust way: use a public endpoint or env var.
      // For this implementation, we will fetch from the /api/admin/settings endpoint.
      // Note: In production, consider caching this or using Edge Config/KV for performance.
      const settingsUrl = new URL("/api/admin/settings", req.url)
      const res = await fetch(settingsUrl.toString())
      if (res.ok) {
        const { settings } = await res.json()
        if (settings?.maintenance_mode) {
          return NextResponse.redirect(new URL("/maintenance", req.url))
        }
      }
    } catch (e) {
      // If check fails, proceed (fail open) or log error
    }
  }

  // --- Referral Handling ---
  // Accept rc/ref values or tolerate bare ?ref_XX (key without value)
  let rcParam = searchParams.get("rc") || searchParams.get("ref")
  if (!rcParam) {
    try {
      // Look for a key that itself matches a referral code when no value is provided
      for (const [key, value] of searchParams.entries()) {
        if (!value && /^ref_\d{2,}$/.test(key)) {
          rcParam = key
          break
        }
      }
    } catch {}
  }
  if (rcParam && /^ref_\d{2,}$/.test(rcParam)) {
    const validateUrl = new URL("/api/referral/validate", req.url)
    validateUrl.searchParams.set("code", rcParam)
    try {
      const resp = await fetch(validateUrl.toString())
      if (resp.ok) {
        const json = await resp.json()
        if (json.ok) {
          const res = NextResponse.next()
          res.cookies.set("referral_code", rcParam, {
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
            sameSite: "lax",
            secure: true,
          })
          res.cookies.set("referral_sticky", rcParam, {
            path: "/",
            maxAge: 60 * 60,
            sameSite: "lax",
            secure: true,
          })
          await fetch(new URL("/api/referral/visit", req.url).toString(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: rcParam }),
          })
          return res
        }
      }
    } catch {}
    const res = NextResponse.redirect(new URL("/", req.url))
    res.cookies.set("referral_code", "", { path: "/", maxAge: 0 })
    res.cookies.set("referral_sticky", "", { path: "/", maxAge: 0 })
    return res
  }
  if (pathname.startsWith("/ref_")) {
    const code = pathname.slice(1)
    const validateUrl = new URL("/api/referral/validate", req.url)
    validateUrl.searchParams.set("code", code)
    try {
      const resp = await fetch(validateUrl.toString())
      if (resp.ok) {
        const json = await resp.json()
        if (json.ok) {
          const res = NextResponse.redirect(new URL("/", req.url))
          res.cookies.set("referral_code", code, {
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
            sameSite: "lax",
            secure: true,
          })
          res.cookies.set("referral_sticky", code, {
            path: "/",
            maxAge: 60 * 60,
            sameSite: "lax",
            secure: true,
          })
          await fetch(new URL("/api/referral/visit", req.url).toString(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          })
          return res
        }
      }
    } catch {}
    const res = NextResponse.redirect(new URL("/", req.url))
    res.cookies.set("referral_code", "", { path: "/", maxAge: 0 })
    res.cookies.set("referral_sticky", "", { path: "/", maxAge: 0 })
    return res
  }
  // Support path-style /rc=ref_XX
  if (pathname.startsWith("/rc=")) {
    const code = pathname.slice("/rc=".length)
    if (/^ref_\d{2,}$/.test(code)) {
      const validateUrl = new URL("/api/referral/validate", req.url)
      validateUrl.searchParams.set("code", code)
      try {
        const resp = await fetch(validateUrl.toString())
        if (resp.ok) {
          const json = await resp.json()
          if (json.ok) {
            const res = NextResponse.redirect(new URL("/", req.url))
            res.cookies.set("referral_code", code, {
              path: "/",
              maxAge: 60 * 60 * 24 * 30,
              sameSite: "lax",
              secure: true,
            })
            res.cookies.set("referral_sticky", code, {
              path: "/",
              maxAge: 60 * 60,
              sameSite: "lax",
              secure: true,
            })
            await fetch(new URL("/api/referral/visit", req.url).toString(), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code }),
            })
            return res
          }
        }
      } catch {}
    }
    const res = NextResponse.redirect(new URL("/", req.url))
    res.cookies.set("referral_code", "", { path: "/", maxAge: 0 })
    res.cookies.set("referral_sticky", "", { path: "/", maxAge: 0 })
    return res
  }

  // Sticky referral param injection based on cookie
  try {
    const cookieCode = req.cookies.get("referral_sticky")?.value || ""
    const isValidCookieCode = /^ref_\d{2,}$/.test(cookieCode)
    const hasRc = searchParams.get("rc")
    const hasRef = searchParams.get("ref")
    let hasBare = false
    if (!hasRc && !hasRef) {
      for (const [key, value] of searchParams.entries()) {
        if (!value && /^ref_\d{2,}$/.test(key)) {
          hasBare = true
          break
        }
      }
    }
    const isApi = pathname.startsWith("/api")
    const isAdmin = pathname.startsWith("/admin")
    if (isValidCookieCode && !hasRc && !hasRef && !hasBare && !isApi && !isAdmin) {
      const url = new URL(req.url)
      url.searchParams.set("rc", cookieCode)
      return NextResponse.redirect(url)
    }
  } catch {}

  // --- User Ban Check ---
  const email = req.cookies.get("user_email")?.value
  if (email) {
    try {
      const url = new URL("/api/user/status", req.url)
      url.searchParams.set("email", email)
      const resp = await fetch(url.toString(), { headers: { "x-mw": "1" } })
      if (resp.ok) {
        const json = await resp.json()
        if ((json.status === "banned" || json.status === "inactive") && !pathname.startsWith("/banned")) {
          return NextResponse.redirect(new URL("/banned", req.url))
        }
      }
    } catch {}
  }

  // --- Admin Guard ---
  if ((pathname.startsWith("/admin") && pathname !== "/admin/login") || pathname.startsWith("/api/admin")) {
    try {
      const csrfCookie = req.cookies.get("csrf_token")?.value
      if (!csrfCookie) {
        const res = NextResponse.next()
        const arr = new Uint8Array(16)
        crypto.getRandomValues(arr)
        const token = Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("")
        res.cookies.set("csrf_token", token, {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          secure: true,
          maxAge: 60 * 60,
        })
        return res
      }
    } catch {}
    const token = req.cookies.get("sb-access-token")?.value || ""
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string
      const { createClient } = await import("@supabase/supabase-js")
      const supa = createClient(url, key)
      const { data, error } = await supa.auth.getUser(token)
      if (error || !data?.user?.email) {
        try {
          await fetch(new URL("/api/admin/activity", req.url).toString(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event_type: "admin_access_denied",
              description: "Invalid or missing user email",
              actor_role: "admin",
            }),
          })
        } catch {}
        return NextResponse.redirect(new URL("/admin/login", req.url))
      }
      const userEmail = data.user.email
      if (userEmail !== "wazimuautomate@gmail.com") {
        try {
          await fetch(new URL("/api/admin/activity", req.url).toString(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event_type: "admin_access_denied",
              description: "Non-admin email attempted access",
              email: userEmail,
              actor_role: "admin",
            }),
          })
        } catch {}
        return NextResponse.redirect(new URL("/admin/login", req.url))
      }
    } catch {
      try {
        await fetch(new URL("/api/admin/activity", req.url).toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_type: "admin_access_denied",
            description: "Guard exception",
            actor_role: "admin",
          }),
        })
      } catch {}
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
