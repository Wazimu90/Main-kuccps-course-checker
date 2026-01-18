import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "KUCCPS Cluster Points Calculator 2026 | How Cluster Points Work",
    description: "Calculate and understand KUCCPS cluster points using our simple calculator. Includes clear explanations and examples for Kenyan students.",
    openGraph: {
        title: "KUCCPS Cluster Points Calculator 2026 | How Cluster Points Work",
        description: "Calculate and understand KUCCPS cluster points using our simple calculator. Includes clear explanations and examples for Kenyan students.",
        type: "website"
    }
}

export default function ClusterCalculatorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
