import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "About KUCCPS Course Checker | Our Mission & Team",
    description:
        "Learn about our mission to help Kenyan students make informed KUCCPS course choices. Built by educators and developers to simplify course eligibility checking.",
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return children
}
