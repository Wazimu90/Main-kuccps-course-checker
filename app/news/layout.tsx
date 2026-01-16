import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "KUCCPS Application Guide 2026 | Courses, Cutoff Points & Tips",
    description: "Complete KUCCPS application guide for 2026. Learn how course selection works, cutoff points, common mistakes and how to improve your chances.",
}

export default function NewsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
