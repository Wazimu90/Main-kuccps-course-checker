"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import AdminTabs from "@/components/admin/admin-tabs"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/admin/login"

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-base text-light">
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTabs />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-surface p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
