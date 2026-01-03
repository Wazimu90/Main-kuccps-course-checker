"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { adminNavItems } from "@/components/admin/admin-nav-items"

export default function AdminSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "relative flex flex-col h-full bg-card border-r transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border bg-background shadow-md"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      {/* Header */}
      <div className="flex h-16 items-center border-b px-4">
        {!isCollapsed && <h2 className="text-lg font-semibold">Admin Panel</h2>}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isCollapsed && "px-2",
                    isActive && "bg-primary/10 text-primary",
                  )}
                >
                  <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                  {!isCollapsed && item.title}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )
}
