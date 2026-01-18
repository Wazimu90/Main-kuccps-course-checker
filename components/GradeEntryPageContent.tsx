"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import RealTimeProgressBar from "@/components/real-time-progress-bar"
import GradeEntryForm from "@/components/grade-entry-form"
import ClusterWeightsForm from "@/components/cluster-weights-form"
import LoadingAnimation from "@/components/loading-animation"
import DiplomaProcessingAnimation from "@/components/diploma-processing-animation"
import ResultsPreview from "@/components/results-preview"
import DiplomaResultsPreview from "@/components/diploma-results-preview"
import CertificateProcessingAnimation from "@/components/certificate-processing-animation"
import CertificateResultsPreview from "@/components/certificate-results-preview"
import ArtisanProcessingAnimation from "@/components/artisan-processing-animation"
import ArtisanResultsPreview from "@/components/artisan-results-preview"
import KmtcProcessingAnimation from "@/components/kmtc-processing-animation"
import KmtcResultsPreview from "@/components/kmtc-results-preview"
import { log } from "@/lib/logger"

import type { DiplomaCourse } from "@/lib/diploma-course-eligibility"
import type { CertificateCourse } from "@/lib/certificate-course-eligibility"
import type { ArtisanCourse } from "@/lib/artisan-course-eligibility"
import type { KmtcCourse } from "@/lib/kmtc-course-eligibility"

interface GradeEntryPageContentProps {
  category: string
}

export default function GradeEntryPageContent({ category }: GradeEntryPageContentProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [formData, setFormData] = useState({
    meanGrade: "",
    subjects: {},
    clusterWeights: {},
    courseCategories: [],
    counties: [],
    institutionType: "",
  })
  const [diplomaCourses, setDiplomaCourses] = useState<DiplomaCourse[]>([])
  const [certificateCourses, setCertificateCourses] = useState<CertificateCourse[]>([])
  const [artisanCourses, setArtisanCourses] = useState<ArtisanCourse[]>([])
  const [kmtcCourses, setKmtcCourses] = useState<KmtcCourse[]>([])

  const categoryTitle =
    {
      degree: "Degree",
      diploma: "Diploma",
      certificate: "Certificate",
      kmtc: "KMTC",
      artisan: "Artisan",
    }[category] || "Course"

  const totalSteps = category === "degree" ? 2 : 1

  const handleSubjectsSubmit = (subjectData: any) => {
    log(`grade-entry:${category}`, "Subjects submitted", "info", subjectData)
    setFormData((prev) => ({
      ...prev,
      meanGrade: subjectData.meanGrade,
      subjects: subjectData.subjects || {},
      courseCategories: subjectData.courseCategories || [],
      counties: subjectData.counties || [],
      institutionType: subjectData.institutionType || "",
    }))

    if (category === "degree") {
      setStep(2)
      setProgress(50)
    } else {
      setProgress(100)
      handleFinalSubmit(subjectData)
    }
  }

  const handleClusterSubmit = (clusterData: any) => {
    log(`grade-entry:${category}`, "Cluster weights submitted", "info", clusterData)
    const updatedFormData = { ...formData, clusterWeights: clusterData }
    setFormData(updatedFormData)
    setProgress(100)
    handleFinalSubmit(updatedFormData)
  }

  const handleProgressUpdate = (newProgress: number) => {
    if (category === "degree" && step === 1) {
      setProgress(newProgress >= 100 ? 50 : 0)
    } else if (category === "kmtc") {
      setProgress(newProgress >= 100 ? 50 : 0)
    } else {
      setProgress(newProgress >= 100 ? 100 : 0)
    }
  }

  const handleClusterProgressUpdate = (newProgress: number) => {
    if (category === "degree") {
      if (newProgress >= 100) setProgress(100)
    }
  }

  const handleFinalSubmit = (finalData = formData) => {
    setIsLoading(true)

    const dataToStore = {
      ...finalData,
      category: category,
    }

    log(`grade-entry:${category}`, "Final data being stored", "debug", dataToStore)

    localStorage.setItem("gradeData", JSON.stringify(dataToStore))
    localStorage.setItem("selectedCategory", category)

    if (category === "degree" && finalData.clusterWeights) {
      localStorage.setItem("clusterWeights", JSON.stringify(finalData.clusterWeights))
    }

    // For categories that have their own processing animations, return early
    if (category === "diploma" || category === "certificate" || category === "artisan" || category === "kmtc") {
      return
    }

    // For degree category, reveal preview immediately; the component handles parallel processing + animation
    log(`grade-entry:${category}`, "Revealing degree preview", "info")
    setIsLoading(false)
    setShowResults(true)
  }

  const handleDiplomaProcessingComplete = (courses: DiplomaCourse[]) => {
    setDiplomaCourses(courses)
    setIsLoading(false)
    setShowResults(true)
    log("grade-entry:diploma", "Processing complete", "success", { count: courses.length })
  }

  const handleCertificateProcessingComplete = (courses: CertificateCourse[]) => {
    setCertificateCourses(courses)
    setIsLoading(false)
    setShowResults(true)
    log("grade-entry:certificate", "Processing complete", "success", { count: courses.length })
  }

  const handleArtisanProcessingComplete = (courses: ArtisanCourse[]) => {
    setArtisanCourses(courses)
    setIsLoading(false)
    setShowResults(true)
    log("grade-entry:artisan", "Processing complete", "success", { count: courses.length })
  }

  const handleKmtcProcessingComplete = (courses: KmtcCourse[]) => {
    setKmtcCourses(courses)
    setIsLoading(false)
    setShowResults(true)
    log("grade-entry:kmtc", "Processing complete", "success", { count: courses.length })
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
      setProgress(Math.max(progress - 50, 0))
    } else {
      router.back()
    }
  }

  const handleProceedToPayment = () => {
    log(`grade-entry:${category}`, "Proceeding to payment", "info")
    router.push("/payment")
  }

  return (
    <div className="min-h-screen relative">

      <div className="relative z-10 container mx-auto px-4 py-8">
        {!isLoading && !showResults && (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold md:text-3xl text-white">{categoryTitle} Course Eligibility</h1>
              <p className="text-dim mt-2 max-w-2xl mx-auto">
                {category === "degree" && "Enter your KCSE grades to check KUCCPS degree courses you qualify for"}
                {category === "diploma" && "Find KUCCPS diploma courses you qualify for with your KCSE grade"}
                {category === "certificate" && "Check certificate courses available for your KCSE grade"}
                {category === "kmtc" && "Discover KMTC courses offered through KUCCPS that you qualify for"}
                {category === "artisan" && "Explore artisan courses and technical trades available via KUCCPS"}
              </p>
            </div>

            {/* Internal Linking Section - Category Specific Helpful Resources */}
            <div className="mb-6 max-w-4xl mx-auto">
              <div className="bg-surface/50 border border-white/10 rounded-xl p-4">
                <p className="text-sm text-dim mb-3 flex items-center gap-2">
                  <span className="text-accent">💡</span>
                  <span className="font-semibold">Helpful Resources:</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {/* Cluster Calculator - For Degree and KMTC */}
                  {(category === "degree" || category === "kmtc") && (
                    <a
                      href="/cluster-calculator"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 hover:bg-accent/20 border border-accent/20 hover:border-accent/40 rounded-lg text-xs font-medium text-accent transition-all"
                    >
                      <span>Calculate cluster points</span>
                    </a>
                  )}

                  {/* Student Tools - For all categories */}
                  <a
                    href="/student-tools"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-xs font-medium text-light transition-all"
                  >
                    <span>Student tools & resources</span>
                  </a>

                  {/* FAQs - For all categories */}
                  <a
                    href="/faq"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-xs font-medium text-light transition-all"
                  >
                    <span>Frequently asked questions</span>
                  </a>

                  {/* Certificate (fallback for Diploma) */}
                  {category === "diploma" && (
                    <a
                      href="/certificate"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 rounded-lg text-xs font-medium text-amber-300 transition-all"
                    >
                      <span>Certificate courses (fallback)</span>
                    </a>
                  )}

                  {/* Artisan (fallback for Certificate) */}
                  {category === "certificate" && (
                    <a
                      href="/artisan"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 rounded-lg text-xs font-medium text-purple-300 transition-all"
                    >
                      <span>Artisan technical courses</span>
                    </a>
                  )}

                  {/* Learn Skills (for Certificate and Artisan) */}
                  {(category === "certificate" || category === "artisan") && (
                    <a
                      href="/learn-skills"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 hover:border-green-500/40 rounded-lg text-xs font-medium text-green-300 transition-all"
                    >
                      <span>Learn digital skills for free</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            <Card className="mx-auto max-w-4xl rounded-2xl p-6 backdrop-blur-sm bg-card/80 border border-border shadow-sm">
              <div className="mb-8">
                <RealTimeProgressBar progress={progress} currentStep={step} totalSteps={totalSteps} />
              </div>

              {step === 1 && (
                <GradeEntryForm
                  category={category}
                  onSubmit={handleSubjectsSubmit}
                  onProgressUpdate={handleProgressUpdate}
                />
              )}

              {step === 2 && category === "degree" && (
                <ClusterWeightsForm onSubmit={handleClusterSubmit} onProgressUpdate={handleClusterProgressUpdate} />
              )}
            </Card>
          </>
        )}

        {/* Diploma Processing Animation */}
        {isLoading && category === "diploma" && (
          <DiplomaProcessingAnimation
            userData={{
              meanGrade: formData.meanGrade,
              subjects: formData.subjects,
              courseCategories: formData.courseCategories,
            }}
            onComplete={handleDiplomaProcessingComplete}
          />
        )}

        {/* Certificate Processing Animation */}
        {isLoading && category === "certificate" && (
          <CertificateProcessingAnimation
            userData={{
              meanGrade: formData.meanGrade,
              subjects: formData.subjects,
              courseCategories: formData.courseCategories,
            }}
            onComplete={handleCertificateProcessingComplete}
          />
        )}

        {/* Artisan Processing Animation */}
        {isLoading && category === "artisan" && (
          <ArtisanProcessingAnimation
            userData={{
              meanGrade: formData.meanGrade,
              subjects: formData.subjects,
              courseCategories: formData.courseCategories,
              counties: formData.counties,
              institutionType: formData.institutionType,
            }}
            onComplete={handleArtisanProcessingComplete}
          />
        )}

        {/* KMTC Processing Animation */}
        {isLoading && category === "kmtc" && (
          <KmtcProcessingAnimation
            userData={{
              meanGrade: formData.meanGrade,
              subjects: formData.subjects,
            }}
            onComplete={handleKmtcProcessingComplete}
          />
        )}

        {/* Default Loading Animation for Degree */}
        {isLoading && category === "degree" && <LoadingAnimation />}

        {/* Results Preview Components */}
        {showResults && category === "diploma" && (
          <DiplomaResultsPreview courses={diplomaCourses} onProceed={handleProceedToPayment} />
        )}

        {showResults && category === "certificate" && (
          <CertificateResultsPreview courses={certificateCourses} onProceed={handleProceedToPayment} />
        )}

        {showResults && category === "artisan" && (
          <ArtisanResultsPreview courses={artisanCourses} onProceed={handleProceedToPayment} />
        )}

        {showResults && category === "kmtc" && (
          <KmtcResultsPreview courses={kmtcCourses} onProceed={handleProceedToPayment} />
        )}

        {showResults && category === "degree" && (
          <ResultsPreview category={category} userData={formData} onProceed={handleProceedToPayment} />
        )}
      </div>
    </div>
  )
}
