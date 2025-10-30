"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Clock, Database, Search, FileCheck, Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { fetchCertificateCourses, type CertificateCourse } from "@/lib/certificate-course-eligibility"

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
    console.log("🚀 Starting certificate qualification processing...")
    console.log("📊 User Data:", userData)

    try {
      // Process each step with timing
      for (let i = 0; i < processingSteps.length; i++) {
        setCurrentStep(i)
        setProgress(((i + 1) / processingSteps.length) * 100)

        // If this is the actual processing step, run the qualification logic in parallel
        if (i === 3) {
          // "Checking Subject Requirements" step
          console.log("🔍 Running certificate qualification logic...")

          // Run processing and timing in parallel
          const [courses] = await Promise.all([
            fetchCertificateCourses(userData.meanGrade, userData.subjects, userData.courseCategories),
            new Promise((resolve) => setTimeout(resolve, processingSteps[i].duration)),
          ])

          setQualifiedCourses(courses)
          continue
        }

        // Regular step timing
        await new Promise((resolve) => setTimeout(resolve, processingSteps[i].duration))
      }

      // Get the final courses from the processing step
      const finalCourses = qualifiedCourses || []

      setIsProcessing(false)
      onComplete(finalCourses)
    } catch (error) {
      console.error("❌ Error in certificate processing:", error)
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
            <p className="text-muted-foreground">
              Analyzing your KCSE results against certificate programme requirements...
            </p>
          </div>

          <div className="mb-8">
            <Progress value={progress} className="h-3 rounded-full" />
            <p className="text-sm text-muted-foreground mt-2 text-center">{Math.round(progress)}% Complete</p>
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
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
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
                          : "bg-muted text-muted-foreground"
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
                    <h3
                      className={`font-semibold transition-colors duration-300 ${
                        isActive ? "text-primary" : isCompleted ? "text-green-600 dark:text-green-400" : ""
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
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
            <p className="text-sm text-muted-foreground">
              Please wait while we process your certificate programme eligibility...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
