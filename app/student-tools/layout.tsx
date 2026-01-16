import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Student Tools & Resources | KUCCPS, HELB, KNEC Portal Links",
    description: "Quick access to essential government services and platforms for Kenyan students. All official portals including KUCCPS, HELB, KNEC in one place.",
}

export default function StudentToolsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
