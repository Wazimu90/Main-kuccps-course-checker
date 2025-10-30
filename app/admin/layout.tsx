"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminTopBar from "@/components/admin/admin-topbar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/admin/login"

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopBar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
