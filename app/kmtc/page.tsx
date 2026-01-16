import GradeEntryPageContent from "@/components/GradeEntryPageContent"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "KMTC Courses via KUCCPS 2026 | Requirements & Course List",
  description: "Check KMTC courses offered through KUCCPS, their requirements and cutoff points. Find out if you qualify before making your application.",
}

export default function KmtcPage() {
  return <GradeEntryPageContent category="kmtc" />
}
