import GradeEntryPageContent from "@/components/GradeEntryPageContent"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "KUCCPS Certificate Courses 2026 | Courses You Can Do With D+ and Below",
  description: "See KUCCPS certificate courses available for students with D+, D or below. Check eligibility instantly and avoid missing placement chances.",
}

export default function CertificatePage() {
  return <GradeEntryPageContent category="certificate" />
}
