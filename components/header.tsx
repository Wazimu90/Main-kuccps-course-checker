"use client"

import React, { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { GraduationCap, Menu, X } from "lucide-react"

interface NavItem {
  label: string
  href: string
  external?: boolean
  ariaLabel?: string
}

const NAV_ITEMS: NavItem[] = [
  { label: "Courses", href: "/#courses", ariaLabel: "Go to course categories" },
  { label: "Student Tools", href: "/student-tools", ariaLabel: "Access essential student resources" },
  { label: "Cluster Calculator", href: "/cluster-calculator", ariaLabel: "Calculate KUCCPS cluster points" },
  { label: "FAQ", href: "/faq", ariaLabel: "View frequently asked questions" },
  { label: "Buy Data", href: "/buy-data", ariaLabel: "Get affordable student data bundles" },
  { label: "About", href: "/about", ariaLabel: "Learn about this site" },
]

export const Header: React.FC = () => {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isOpeningBuyData, setIsOpeningBuyData] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (pathname?.startsWith("/admin") || pathname === "/maintenance") {
    return null
  }

  return (
    <>
      <div
        className={`fixed top-0 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-300 ${isScrolled ? "py-3" : "py-5"
          }`}
      >
        <header
          className={`
            relative flex items-center justify-between 
            w-full max-w-5xl
            transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
            backdrop-blur-xl border border-dim/20
            ${isScrolled || isMobileMenuOpen
              ? "bg-base/80 py-3 px-5 rounded-2xl shadow-premium"
              : "bg-surface/80 py-4 px-8 rounded-full shadow-[0_4px_20px_rgba(34,211,238,0.08)]"
            }
          `}
        >
          <div className="absolute inset-0 rounded-[inherit] pointer-events-none border border-accent/10 shadow-[inset_0_0_15px_rgba(34,211,238,0.03)]" />

          <a href="/" className="flex items-center gap-3 z-10 group select-none">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 group-hover:bg-accent/20 transition-all duration-300 shadow-[0_0_10px_rgba(34,211,238,0.15)]">
              <GraduationCap className="w-5 h-5 text-accent group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-light font-bold text-base leading-none tracking-wide group-hover:text-accent transition-colors duration-300">
                KUCCPS
              </span>
              <span className="text-dim text-[10px] font-semibold uppercase tracking-[0.2em] group-hover:text-light transition-colors duration-300 mt-0.5">
                Course Checker
              </span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-1 z-10">
            {NAV_ITEMS.map((item) => {
              const isBuyData = item.label === "Buy Data"
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  aria-label={item.ariaLabel}
                  className="relative px-5 py-2 group overflow-visible rounded-full transition-all duration-300"
                  onClick={(e) => {
                    if (item.external) {
                      setIsOpeningBuyData(true)
                      setTimeout(() => setIsOpeningBuyData(false), 1200)
                    }
                  }}
                >
                  <span className={`relative z-10 text-sm font-medium tracking-wide transition-colors duration-300 ${isBuyData
                    ? "text-green-500 group-hover:text-green-400"
                    : "text-dim group-hover:text-light"
                    }`} aria-hidden="true">
                    {isBuyData && isOpeningBuyData ? "Opening…" : item.label}
                  </span>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-accent group-hover:w-1/2 transition-all duration-300 ease-out opacity-0 group-hover:opacity-100 shadow-glow"></div>
                </a>
              )
            })}
          </nav>

          <button
            className="md:hidden relative z-20 p-2 text-light hover:bg-white/5 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div
            className={`
              absolute top-full left-0 right-0 mt-3 p-3
              bg-base/95 border border-dim/20 rounded-2xl backdrop-blur-xl
              flex flex-col gap-1 overflow-x-auto overflow-y-auto
              origin-top transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
              shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-0
              ${isMobileMenuOpen
                ? "opacity-100 scale-100 translate-y-0 max-h-[70vh]"
                : "opacity-0 scale-95 -translate-y-4 max-h-0 pointer-events-none"
              }
              md:hidden
            `}
          >
            {NAV_ITEMS.map((item) => {
              const isBuyData = item.label === "Buy Data"
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  aria-label={item.ariaLabel}
                  onClick={() => {
                    if (item.external) setIsOpeningBuyData(true)
                    setTimeout(() => setIsOpeningBuyData(false), 1200)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`relative p-3 text-center rounded-xl text-sm font-medium transition-all duration-200 overflow-visible ${isBuyData
                    ? "text-green-500 hover:bg-green-500/10 hover:text-green-400"
                    : "text-light hover:bg-accent/10 hover:text-accent"
                    }`}
                >
                  {item.label === "Buy Data" && isOpeningBuyData ? "Opening…" : item.label}
                </a>
              )
            })}
          </div>
        </header>
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}

export default Header
