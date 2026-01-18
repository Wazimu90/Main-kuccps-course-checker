import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "KUCCPS Certificate Courses 2026 | Courses You Can Do With D+ and Below",
    description: "See KUCCPS certificate courses available for students with D+, D or below. Check eligibility instantly and avoid missing placement chances.",
    openGraph: {
        title: "KUCCPS Certificate Courses 2026 | Courses You Can Do With D+ and Below",
        description: "See KUCCPS certificate courses available for students with D+, D or below. Check eligibility instantly and avoid missing placement chances.",
        type: "website"
    }
}

export default function CertificateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
