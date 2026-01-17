"use client"

import Link from "next/link"
import { Calculator, ExternalLink, HelpCircle, BookOpen, GraduationCap, Award } from "lucide-react"

interface RelatedLink {
    href: string
    title: string
    description: string
    icon: React.ReactNode
}

interface InternalLinksSectionProps {
    title?: string
    links: RelatedLink[]
    className?: string
}

export function InternalLinksSection({
    title = "Related Resources",
    links,
    className = ""
}: InternalLinksSectionProps) {
    return (
        <section className={`py-12 border-t border-white/10 ${className}`}>
            <div className="container mx-auto px-4">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-light">
                    {title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {links.map((link, index) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="group block p-6 bg-surface border border-white/10 rounded-xl hover:border-accent/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all duration-300"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                                    {link.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-light mb-2 group-hover:text-accent transition-colors">
                                        {link.title}
                                    </h3>
                                    <p className="text-sm text-dim leading-relaxed">
                                        {link.description}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}

// Predefined link sets for different pages
export const courseCategoryLinks: RelatedLink[] = [
    {
        href: "/cluster-calculator",
        title: "Calculate Cluster Points",
        description: "Not sure about your cluster weights? Use our free calculator to estimate them.",
        icon: <Calculator className="w-5 h-5 text-accent" />
    },
    {
        href: "/student-tools",
        title: "Student Portals & Resources",
        description: "Access KUCCPS, HELB, and other essential government portals.",
        icon: <ExternalLink className="w-5 h-5 text-accent" />
    },
    {
        href: "/faq",
        title: "Frequently Asked Questions",
        description: "Get answers to common questions about course selection and applications.",
        icon: <HelpCircle className="w-5 h-5 text-accent" />
    }
]

export const calculatorPageLinks: RelatedLink[] = [
    {
        href: "/degree",
        title: "Check Degree Courses",
        description: "Use your calculated cluster weights to find degree courses you qualify for.",
        icon: <GraduationCap className="w-5 h-5 text-accent" />
    },
    {
        href: "/diploma",
        title: "Check Diploma Courses",
        description: "Explore diploma programs based on your KCSE performance.",
        icon: <Award className="w-5 h-5 text-accent" />
    },
    {
        href: "/student-tools",
        title: "Official Student Portals",
        description: "Access KUCCPS portal to apply with your official cluster points.",
        icon: <ExternalLink className="w-5 h-5 text-accent" />
    }
]

export const resultsPageLinks: RelatedLink[] = [
    {
        href: "/student-tools",
        title: "Apply Through KUCCPS",
        description: "Ready to apply? Access the official KUCCPS student portal.",
        icon: <ExternalLink className="w-5 h-5 text-accent" />
    },
    {
        href: "/faq",
        title: "Application FAQs",
        description: "Learn more about the KUCCPS application process and course selection.",
        icon: <HelpCircle className="w-5 h-5 text-accent" />
    },
    {
        href: "/news",
        title: "Latest Updates",
        description: "Stay informed with the latest KUCCPS news and announcements.",
        icon: <BookOpen className="w-5 h-5 text-accent" />
    }
]

// Cross-category navigation component
interface CrossCategoryLinksProps {
    currentCategory: string
}

const allCategories = [
    { name: "Degree", href: "/degree" },
    { name: "Diploma", href: "/diploma" },
    { name: "KMTC", href: "/kmtc" },
    { name: "Certificate", href: "/certificate" },
    { name: "Artisan", href: "/artisan" },
]

export function CrossCategoryLinks({ currentCategory }: CrossCategoryLinksProps) {
    const otherCategories = allCategories.filter(
        cat => cat.href !== currentCategory
    )

    return (
        <section className="mt-8 pt-6 border-t border-white/10">
            <p className="text-dim mb-4 text-sm">
                Also explore other KUCCPS course categories:
            </p>
            <div className="flex flex-wrap gap-3">
                {otherCategories.map(cat => (
                    <Link
                        key={cat.href}
                        href={cat.href}
                        className="inline-flex items-center px-4 py-2 bg-white/5 hover:bg-accent/10 border border-white/10 hover:border-accent/30 rounded-lg text-sm text-light hover:text-accent transition-all"
                    >
                        {cat.name} Courses
                    </Link>
                ))}
            </div>
        </section>
    )
}
