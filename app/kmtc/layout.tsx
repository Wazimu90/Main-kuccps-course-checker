import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "KMTC Courses via KUCCPS 2026 | Requirements & Course List",
    description: "Check KMTC courses offered through KUCCPS, their requirements and cutoff points. Find out if you qualify before making your application.",
    openGraph: {
        title: "KMTC Courses via KUCCPS 2026 | Requirements & Course List",
        description: "Check KMTC courses offered through KUCCPS, their requirements and cutoff points. Find out if you qualify before making your application.",
        type: "website"
    }
}

export default function KmtcLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
