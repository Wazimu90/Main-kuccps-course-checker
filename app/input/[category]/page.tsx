"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import RealTimeProgressBar from "@/components/real-time-progress-bar"
import GradeEntryForm from "@/components/grade-entry-form"
import ClusterWeightsForm from "@/components/cluster-weights-form"
import LoadingAnimation from "@/components/loading-animation"
import DiplomaProcessingAnimation from "@/components/diploma-processing-animation"
import ResultsPreview from "@/components/results-preview"
import DiplomaResultsPreview from "@/components/diploma-results-preview"
import AnimatedBackground from "@/components/animated-background"
import type { DiplomaCourse } from "@/lib/diploma-course-eligibility"
import CertificateProcessingAnimation from "@/components/certificate-processing-animation"
import CertificateResultsPreview from "@/components/certificate-results-preview"
import type { CertificateCourse } from "@/lib/certificate-course-eligibility"
import ArtisanProcessingAnimation from "@/components/artisan-processing-animation"
import ArtisanResultsPreview from "@/components/artisan-results-preview"
import type { ArtisanCourse } from "@/lib/artisan-course-eligibility"
import KmtcProcessingAnimation from "@/components/kmtc-processing-animation"
import KmtcResultsPreview from "@/components/kmtc-results-preview"
import type { KmtcCourse } from "@/lib/kmtc-course-eligibility"

export default function GradeEntryPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const category = params.category as string

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

  const handleSubjectsSubmit = (subjectData) => {
    console.log("Subjects submitted:", subjectData)
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
      handleFinalSubmit(subjectData)
    }
  }

  const handleClusterSubmit = (clusterData) => {
    console.log("Cluster weights submitted:", clusterData)
    const updatedFormData = { ...formData, clusterWeights: clusterData }
    setFormData(updatedFormData)
    handleFinalSubmit(updatedFormData)
  }

  const handleProgressUpdate = (newProgress) => {
    if (category === "degree" && step === 1) {
      setProgress(Math.floor(newProgress / 2))
    } else {
      setProgress(newProgress)
    }
  }

  const handleClusterProgressUpdate = (newProgress) => {
    if (category === "degree") {
      setProgress(50 + Math.floor(newProgress / 2))
    }
  }

  const handleFinalSubmit = (finalData = formData) => {
    setIsLoading(true)

    const dataToStore = {
      ...finalData,
      category: category,
    }

    console.log("Final data being stored:", dataToStore)

    localStorage.setItem("gradeData", JSON.stringify(dataToStore))
    localStorage.setItem("selectedCategory", category)

    if (category === "degree" && finalData.clusterWeights) {
      localStorage.setItem("clusterWeights", JSON.stringify(finalData.clusterWeights))
    }

    // For categories that have their own processing animations, return early
    if (category === "diploma" || category === "certificate" || category === "artisan" || category === "kmtc") {
      return
    }

    // For degree category, use the old loading animation
    setTimeout(() => {
      setIsLoading(false)
      setShowResults(true)
    }, 2000)
  }

  const handleDiplomaProcessingComplete = (courses: DiplomaCourse[]) => {
    setDiplomaCourses(courses)
    setIsLoading(false)
    setShowResults(true)
  }

  const handleCertificateProcessingComplete = (courses: CertificateCourse[]) => {
    setCertificateCourses(courses)
    setIsLoading(false)
    setShowResults(true)
  }

  const handleArtisanProcessingComplete = (courses: ArtisanCourse[]) => {
    setArtisanCourses(courses)
    setIsLoading(false)
    setShowResults(true)
  }

  const handleKmtcProcessingComplete = (courses: KmtcCourse[]) => {
    setKmtcCourses(courses)
    setIsLoading(false)
    setShowResults(true)
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
    router.push("/payment")
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {!isLoading && !showResults && (
          <>
            <div className="mb-8 flex items-center justify-between">
              <Button variant="ghost" className="flex items-center gap-2" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <h1 className="text-2xl font-bold md:text-3xl text-white">{categoryTitle} Course Eligibility</h1>
              <div className="w-20"></div>
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
