"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { adminNavItems } from "@/components/admin/admin-nav-items"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LogOut, User as UserIcon } from "lucide-react"

export default function AdminTabs() {
  const pathname = usePathname()
  const router = useRouter()
  const tabRefs = useRef<Array<HTMLAnchorElement | null>>([])
  const [confirmOpen, setConfirmOpen] = useState(false)

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = adminNavItems.findIndex((item) => item.href === pathname)
    if (e.key === "ArrowRight") {
      const nextIndex = (currentIndex + 1) % adminNavItems.length
      tabRefs.current[nextIndex]?.focus()
    }
    if (e.key === "ArrowLeft") {
      const prevIndex = (currentIndex - 1 + adminNavItems.length) % adminNavItems.length
      tabRefs.current[prevIndex]?.focus()
    }
  }

  const handleLogoutConfirm = () => {
    try {
      localStorage.removeItem("adminToken")
    } catch { }
    setConfirmOpen(false)
    router.replace("/admin/login")
  }

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6">
      <nav
        role="tablist"
        aria-label="Admin sections"
        className="flex items-center w-full md:justify-between gap-2 overflow-x-auto py-3 no-scrollbar"
        onKeyDown={onKeyDown}
      >
        {adminNavItems.map((item, idx) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              ref={(el) => { tabRefs.current[idx] = el }}
              className="focus:outline-none shrink-0"
            >
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`h-9 px-4 has-[>svg]:px-3 inline-flex items-center justify-center gap-2 whitespace-nowrap ${isActive ? "bg-primary/10 text-primary border-b-2 border-primary" : ""
                  }`}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          )
        })}
      </nav>
      <div className="hidden md:flex items-center gap-2 py-3">
        <Link href="/" aria-label="Go to user interface">
          <Button variant="ghost" size="icon" className="hover:bg-surface">
            <UserIcon className="h-5 w-5" />
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Logout"
          className="hover:bg-surface"
          onClick={() => setConfirmOpen(true)}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm logout</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-white">Are you sure you want to logout from the admin session?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogoutConfirm}>Logout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
