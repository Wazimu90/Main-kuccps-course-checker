"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
    label: string
    href: string
}

const pageTitles: Record<string, string> = {
    "": "Home",
    "degree": "Degree Courses",
    "diploma": "Diploma Courses",
    "kmtc": "KMTC Courses",
    "certificate": "Certificate Courses",
    "artisan": "Artisan Courses",
    "cluster-calculator": "Cluster Calculator",
    "student-tools": "Student Tools",
    "results": "Results",
    "news": "News & Updates",
    "about": "About Us",
    "contact": "Contact",
    "faq": "FAQs",
    "privacy-policy": "Privacy Policy",
    "terms": "Terms of Service",
    "input": "Enter Grades",
    "payment": "Payment",
    "learn-skills": "Learn Skills"
}

export default function Breadcrumbs() {
    const pathname = usePathname()

    // Don't show breadcrumbs on homepage or admin pages
    if (pathname === "/" || pathname?.startsWith("/admin") || pathname === "/maintenance" || pathname === "/banned") {
        return null
    }

    const pathSegments = pathname?.split("/").filter(Boolean) || []

    const breadcrumbs: BreadcrumbItem[] = [
        { label: "Home", href: "/" }
    ]

    let currentPath = ""
    pathSegments.forEach((segment) => {
        currentPath += `/${segment}`
        const label = pageTitles[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
        breadcrumbs.push({
            label,
            href: currentPath
        })
    })

    return (
        <nav
            aria-label="Breadcrumb"
            className="container mx-auto px-4 pt-20 md:pt-24 pb-2"
        >
            <ol
                className="flex items-center flex-wrap gap-2 text-sm"
                itemScope
                itemType="https://schema.org/BreadcrumbList"
            >
                {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1

                    return (
                        <li
                            key={crumb.href}
                            className="flex items-center gap-2"
                            itemProp="itemListElement"
                            itemScope
                            itemType="https://schema.org/ListItem"
                        >
                            {index === 0 ? (
                                <Link
                                    href={crumb.href}
                                    className="flex items-center gap-1.5 text-accent hover:text-accent/80 transition-colors"
                                    itemProp="item"
                                    aria-label="Return to homepage"
                                >
                                    <Home className="w-3.5 h-3.5" />
                                    <span itemProp="name" className="hidden sm:inline">Home</span>
                                </Link>
                            ) : (
                                <>
                                    <ChevronRight className="w-3.5 h-3.5 text-dim flex-shrink-0" />
                                    {isLast ? (
                                        <span
                                            className="text-light font-medium truncate max-w-[200px] sm:max-w-none"
                                            aria-current="page"
                                            itemProp="name"
                                        >
                                            {crumb.label}
                                        </span>
                                    ) : (
                                        <Link
                                            href={crumb.href}
                                            className="text-dim hover:text-light transition-colors truncate max-w-[150px] sm:max-w-none"
                                            itemProp="item"
                                        >
                                            <span itemProp="name">{crumb.label}</span>
                                        </Link>
                                    )}
                                </>
                            )}
                            <meta itemProp="position" content={String(index + 1)} />
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}
