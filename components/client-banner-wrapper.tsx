"use client"

import { usePathname } from "next/navigation"

export default function ClientBannerWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    // Don't add padding on admin pages
    if (pathname?.startsWith("/admin")) {
        return null
    }

    // Add padding for non-admin pages to account for fixed header
    return <div className="pt-20 md:pt-24">{children}</div>
}
