import GradeEntryPageContent from "@/components/GradeEntryPageContent"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "KUCCPS Diploma Courses 2026 | Requirements & Eligible Courses",
  description: "View KUCCPS diploma courses and minimum requirements. Find out which diploma courses you qualify for using your KCSE results.",
}

export default function DiplomaPage() {
  return <GradeEntryPageContent category="diploma" />
}
