import GradeEntryPageContent from "@/components/GradeEntryPageContent"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "KUCCPS Artisan Courses 2026 | Requirements & Eligible Trades",
  description: "Discover KUCCPS artisan courses and technical trades you can apply for. Check requirements and confirm eligibility using your KCSE results.",
}

export default function ArtisanPage() {
  return <GradeEntryPageContent category="artisan" />
}
