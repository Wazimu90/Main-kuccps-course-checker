import GradeEntryPageContent from "@/components/GradeEntryPageContent"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "KUCCPS Degree Courses 2026 | Check Eligibility & Cutoff Points",
  description: "Explore KUCCPS degree courses and check if you meet the cutoff points. Use our free KUCCPS eligibility checker to avoid wrong course choices.",
}

export default function DegreePage() {
  return <GradeEntryPageContent category="degree" />
}
