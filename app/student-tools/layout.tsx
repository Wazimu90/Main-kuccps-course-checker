import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Student Tools & Resources | KUCCPS, HELB, KNEC Portal Links",
    description: "Access official KUCCPS portal, HELB loans, KNEC results and other essential student services. All government portals in one place.",
    openGraph: {
        title: "Student Tools & Resources | KUCCPS, HELB, KNEC Portal Links",
        description: "Access official KUCCPS portal, HELB loans, KNEC results and other essential student services. All government portals in one place.",
        type: "website"
    }
}

export default function StudentToolsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
