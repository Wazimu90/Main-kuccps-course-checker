"use client"
import { useEffect } from "react"

function getCookie(name: string) {
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"))
  return m ? decodeURIComponent(m[1]) : ""
}

function setSessionRef(code: string) {
  try {
    sessionStorage.setItem("referral_code", code)
  } catch {}
}

function appendParam(url: string, key: string, value: string) {
  try {
    const u = new URL(url, window.location.origin)
    if (!u.searchParams.get(key)) {
      u.searchParams.set(key, value)
    }
    return u.pathname + u.search + u.hash
  } catch {
    return url
  }
}

export default function ReferrerTracker() {
  useEffect(() => {
    const cleared = (() => {
      try {
        return sessionStorage.getItem("referral_cleared") === "true"
      } catch {
        return false
      }
    })()
    if (cleared) return
    const fromParam = (() => {
      try {
        const u = new URL(window.location.href)
        return u.searchParams.get("rc") || u.searchParams.get("ref") || ""
      } catch {
        return ""
      }
    })()
    const stickyCookie = getCookie("referral_sticky")
    const code = fromParam || stickyCookie
    if (code) {
      setSessionRef(code)
    }
    const key = "rc"
    const isSameOrigin = (href: string) => {
      try {
        const u = new URL(href, window.location.origin)
        return u.origin === window.location.origin
      } catch {
        return false
      }
    }
    const patchLinks = () => {
      const currentCode = sessionStorage.getItem("referral_code") || ""
      if (!currentCode) return
      const anchors = document.querySelectorAll<HTMLAnchorElement>('a[href^="/"]:not([data-skip-ref])')
      anchors.forEach((a) => {
        const href = a.getAttribute("href") || ""
        if (!href || href.startsWith("#")) return
        if (!isSameOrigin(href)) return
        if (href.includes(`${key}=`)) return
        a.setAttribute("href", appendParam(href, key, currentCode))
      })
    }
    patchLinks()
    const mo = new MutationObserver(() => patchLinks())
    mo.observe(document.body, { childList: true, subtree: true })
    return () => mo.disconnect()
  }, [])

  return null
}
