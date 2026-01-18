import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "KCSE Results Analysis for KUCCPS | AI Course Guidance Tool",
    description: "Get AI-powered analysis of your KCSE results for KUCCPS. Understand your options, strengths and best course choices instantly.",
    openGraph: {
        title: "KCSE Results Analysis for KUCCPS | AI Course Guidance Tool",
        description: "Get AI-powered analysis of your KCSE results for KUCCPS. Understand your options, strengths and best course choices instantly.",
        type: "website"
    }
}

export default function ResultsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
