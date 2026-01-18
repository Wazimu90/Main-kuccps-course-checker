import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "KUCCPS Artisan Courses 2026 | Requirements & Eligible Trades",
    description: "Discover KUCCPS artisan courses and technical trades you can apply for. Check requirements and confirm eligibility using your KCSE results.",
    openGraph: {
        title: "KUCCPS Artisan Courses 2026 | Requirements & Eligible Trades",
        description: "Discover KUCCPS artisan courses and technical trades you can apply for. Check requirements and confirm eligibility using your KCSE results.",
        type: "website"
    }
}

export default function ArtisanLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
