"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import FloatingLines from "./FloatingLines"

export default function BackgroundProvider() {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")
  const isMaintenance = pathname === "/maintenance"
  const isStudentTools = pathname === "/student-tools"
  const isClusterCalculator = pathname === "/cluster-calculator"
  const isLearnSkills = pathname === "/learn-skills"
  const isNews = pathname === "/news" || pathname?.startsWith("/news/")
  const isPayment = pathname === "/payment"
  const isResults = pathname === "/results" || pathname?.startsWith("/results")
  const isGradeEntry =
    pathname === "/degree" ||
    pathname === "/diploma" ||
    pathname === "/certificate" ||
    pathname === "/artisan" ||
    pathname === "/kmtc"

  useEffect(() => {
    if (isAdmin || isMaintenance || isStudentTools || isClusterCalculator || isLearnSkills || isNews || isPayment || isResults || isGradeEntry) {
      document.body.classList.add("admin-no-bg")
    } else {
      document.body.classList.remove("admin-no-bg")
    }
    return () => {
      document.body.classList.remove("admin-no-bg")
    }
  }, [isAdmin, isMaintenance, isStudentTools, isClusterCalculator, isLearnSkills, isNews, isPayment, isResults, isGradeEntry])

  if (isAdmin || isMaintenance || isStudentTools || isClusterCalculator || isLearnSkills || isNews || isPayment || isResults || isGradeEntry) {
    return <div className="floating-lines-overlay hidden" />
  }

  return (
    <div className="pointer-events-none">
      <div className="fixed inset-0 -z-10">
        <FloatingLines
          enabledWaves={["top", "middle", "bottom"]}
          lineCount={[10, 15, 20]}
          lineDistance={[8, 6, 4]}
          bendRadius={5.0}
          bendStrength={-0.5}
          interactive={true}
          parallax={true}
        />
      </div>
      <div className="floating-lines-overlay" />
    </div>
  )
}
