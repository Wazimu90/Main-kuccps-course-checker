import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Affordable Student Data Bundles - Buy Safaricom Data | KUCCPS Course Checker",
    description: "Get affordable Safaricom data bundles for students. Buy data even if you have unpaid Okoa Jahazi debt. Perfect for checking KUCCPS results and staying connected.",
    keywords: ["student data bundles", "affordable data Kenya", "Safaricom data bundles", "buy data with debt", "student internet", "KUCCPS data bundles"],
    openGraph: {
        title: "Affordable Student Data Bundles | KUCCPS Course Checker",
        description: "Buy Safaricom data bundles even with unpaid Okoa Jahazi. Stay connected while checking your KUCCPS courses.",
        type: "website",
    },
}

export default function BuyDataLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
