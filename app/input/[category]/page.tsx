"use client"

import { useParams } from "next/navigation"
import GradeEntryPageContent from "@/components/GradeEntryPageContent"

export default function GradeEntryPage() {
  const params = useParams()
  const category = params.category as string

  return <GradeEntryPageContent category={category} />
}
