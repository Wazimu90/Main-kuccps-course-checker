import { Metadata } from "next"

export const metadata: Metadata = {
    title: "KUCCPS FAQ 2026 | Common Questions About Course Eligibility & Applications",
    description: "Get answers to common KUCCPS questions: course eligibility, cluster points, cutoff points, application process, payment, and more. Essential guide for 2026 KUCCPS applicants.",
    keywords: [
        "KUCCPS FAQ",
        "KUCCPS frequently asked questions",
        "KUCCPS course eligibility",
        "KUCCPS cluster points explained",
        "KUCCPS application help",
        "KUCCPS cutoff points",
        "KUCCPS payment issues",
        "KUCCPS revision period",
        "KUCCPS 2026 questions",
        "how to apply KUCCPS",
    ],
    openGraph: {
        title: "KUCCPS FAQ 2026 | Common Questions About Course Eligibility",
        description: "Essential answers for KUCCPS applicants: eligibility, cluster points, applications, payments, and more.",
        type: "website",
    },
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
