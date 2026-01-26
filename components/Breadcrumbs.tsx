"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

// Base URL for absolute URLs in structured data (SEO)
const BASE_URL = "https://kuccpscoursechecker.co.ke"

interface BreadcrumbItem {
    label: string
    href: string
}

export default function Breadcrumbs() {
    const pathname = usePathname()

    // Don't show breadcrumbs on homepage or admin pages
    if (!pathname || pathname === "/" || pathname.startsWith("/admin")) {
        return null
    }

    const pathSegments = pathname.split("/").filter(Boolean)

    // Build breadcrumb items
    const breadcrumbs: BreadcrumbItem[] = [
        { label: "Home", href: "/" }
    ]

    let currentPath = ""
    pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`

        // Format segment for display
        const label = segment
            .split("-")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")

        breadcrumbs.push({
            label,
            href: currentPath
        })
    })

    return (
        <nav aria-label="Breadcrumb" className="py-3 px-4 md:px-0">
            <ol
                className="flex items-center gap-2 text-sm overflow-x-auto"
                itemScope
                itemType="https://schema.org/BreadcrumbList"
            >
                {breadcrumbs.map((item, index) => {
                    const isLast = index === breadcrumbs.length - 1
                    const isFirst = index === 0

                    return (
                        <li
                            key={item.href}
                            className="flex items-center gap-2 whitespace-nowrap"
                            itemProp="itemListElement"
                            itemScope
                            itemType="https://schema.org/ListItem"
                        >
                            {isFirst ? (
                                <Link
                                    href={item.href}
                                    className="flex items-center gap-1.5 text-dim hover:text-accent transition-colors"
                                    itemProp="item"
                                    itemID={`${BASE_URL}${item.href}`}
                                >
                                    <Home className="w-4 h-4" />
                                    <span itemProp="name" className="sr-only md:not-sr-only">{item.label}</span>
                                    <meta itemProp="position" content={String(index + 1)} />
                                </Link>
                            ) : isLast ? (
                                <span
                                    className="text-light font-medium"
                                    itemProp="item"
                                    itemID={`${BASE_URL}${item.href}`}
                                >
                                    <span itemProp="name">{item.label}</span>
                                    <meta itemProp="position" content={String(index + 1)} />
                                </span>
                            ) : (
                                <Link
                                    href={item.href}
                                    className="text-dim hover:text-accent transition-colors"
                                    itemProp="item"
                                    itemID={`${BASE_URL}${item.href}`}
                                >
                                    <span itemProp="name">{item.label}</span>
                                    <meta itemProp="position" content={String(index + 1)} />
                                </Link>
                            )}

                            {!isLast && (
                                <ChevronRight className="w-4 h-4 text-dim flex-shrink-0" aria-hidden="true" />
                            )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}
