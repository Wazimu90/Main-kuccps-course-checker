import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "KUCCPS Diploma Courses 2026 | Requirements & Eligible Courses",
    description: "View KUCCPS diploma courses and minimum requirements. Find out which diploma courses you qualify for using your KCSE results.",
    openGraph: {
        title: "KUCCPS Diploma Courses 2026 | Requirements & Eligible Courses",
        description: "View KUCCPS diploma courses and minimum requirements. Find out which diploma courses you qualify for using your KCSE results.",
        type: "website"
    }
}

export default function DiplomaLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
