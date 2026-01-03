"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Clock, Database, Search, FileCheck, Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { fetchCertificateCourses, type CertificateCourse } from "@/lib/certificate-course-eligibility"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"
import { log } from "@/lib/logger"

interface CertificateProcessingAnimationProps {
  userData: {
    meanGrade: string
    subjects: Record<string, string>
    courseCategories: string[]
  }
  onComplete: (courses: CertificateCourse[]) => void
}

const processingSteps = [
  {
    id: "preparation",
    title: "Preparation",
    description: "Validating your KCSE results and selected categories",
    icon: FileCheck,
    duration: 2000,
  },
  {
    id: "kuccps_connection",
    title: "KUCCPS Connection",
    description: "Connecting to KUCCPS database for certificate programmes",
    icon: Database,
    duration: 2500,
  },
  {
    id: "querying_categories",
    title: "Querying Categories",
    description: "Searching certificate programmes in your selected categories",
    icon: Search,
    duration: 3000,
  },
  {
    id: "checking_requirements",
    title: "Checking Subject Requirements",
    description: "Matching your grades against programme requirements",
    icon: CheckCircle,
    duration: 3500,
  },
  {
    id: "total_eligible",
    title: "Total Eligible Courses",
    description: "Compiling your qualified certificate programmes",
    icon: Trophy,
    duration: 2000,
  },
]

export default function CertificateProcessingAnimation({ userData, onComplete }: CertificateProcessingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(true)
  const [qualifiedCourses, setQualifiedCourses] = useState<CertificateCourse[] | null>(null)

  useEffect(() => {
    // Start processing immediately
    processQualification()
  }, [])

  const processQualification = async () => {
    log("certificate:processing", "Starting parallel animation + backend", "info", { userData })

    try {
      // Start backend processing immediately and run step animations concurrently
      const fetchPromise = fetchCertificateCourses(userData.meanGrade, userData.subjects, userData.courseCategories)

      // Process each step with timing (sequential animations)
      for (let i = 0; i < processingSteps.length; i++) {
        setCurrentStep(i)
        setProgress(((i + 1) / processingSteps.length) * 100)
        await new Promise((resolve) => setTimeout(resolve, processingSteps[i].duration))
      }

      // Await backend processing and finalize results
      const finalCourses = (await fetchPromise) || []
      setIsProcessing(false)
      log("certificate:processing", "Animation and backend complete", "success", { count: finalCourses.length })
      try {
        await fetch("/api/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_type: "user.course.generate",
            actor_role: "user",
            description: `Generated ${finalCourses.length} certificate courses`,
            metadata: { category: "certificate", count: finalCourses.length },
          }),
        })
      } catch {}
      try {
        const resultId = uuidv4()
        const paymentInfo = JSON.parse(localStorage.getItem("paymentInfo") || "{}")
        const { error: insertError } = await supabase.from("results_cache").insert({
          result_id: resultId,
          phone_number: paymentInfo.phone || "",
          email: paymentInfo.email || "",
          name: paymentInfo.name || "",
          category: "certificate",
          eligible_courses: finalCourses,
        })
        if (!insertError) {
          localStorage.setItem("resultId", resultId)
          try {
            await fetch("/api/activity", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                event_type: "user.course.generate",
                actor_role: "user",
                email: paymentInfo.email || null,
                phone_number: paymentInfo.phone || null,
                description: `Cached ${finalCourses.length} certificate courses`,
                metadata: { category: "certificate", resultId, count: finalCourses.length },
              }),
            })
          } catch {}
        } else {
          log("certificate:cache", "Error storing results in cache", "error", insertError)
        }
      } catch (e) {
        log("certificate:cache", "Unhandled error during caching", "error", e)
      }
      onComplete(finalCourses)
    } catch (error) {
      log("certificate:processing", "Unhandled error during processing", "error", error)
      setIsProcessing(false)
      onComplete([])
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto rounded-2xl backdrop-blur-sm bg-card/80 border border-border shadow-xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Processing Certificate Eligibility
            </h2>
            <p className="text-white">
              Analyzing your KCSE results against certificate programme requirements...
            </p>
          </div>

          <div className="mb-8">
            <Progress value={progress} className="h-3 rounded-full" />
            <p className="text-sm text-white mt-2 text-center">{Math.round(progress)}% Complete</p>
          </div>

          <div className="space-y-4">
            {processingSteps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep
              const isPending = index > currentStep

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 p-4 rounded-xl border transition-all duration-300 ${
                    isActive
                      ? "bg-primary/10 border-primary shadow-md"
                      : isCompleted
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : "bg-muted/50 border-border"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? "bg-primary text-primary-foreground animate-pulse"
                        : isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-muted text-white"
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {isActive ? (
                        <motion.div
                          key="active"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="flex items-center justify-center"
                        >
                          <Clock className="w-6 h-6 animate-spin" />
                        </motion.div>
                      ) : isCompleted ? (
                        <motion.div key="completed" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <CheckCircle className="w-6 h-6" />
                        </motion.div>
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex-1">
                    <p className="text-sm text-light hidden sm:block">{step.title}</p>
                    <p className="text-sm text-white">{step.description}</p>
                  </div>

                  {isActive && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-shrink-0">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-white">
              Please wait while we process your certificate programme eligibility...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
