"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Loader2, Database, Search, FileCheck, Award, Users, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { fetchKmtcCourses, type KmtcCourse } from "@/lib/kmtc-course-eligibility"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"
import { log } from "@/lib/logger"

interface KmtcProcessingAnimationProps {
  userData: {
    meanGrade: string
    subjects: Record<string, string>
  }
  onComplete: (courses: KmtcCourse[]) => void
}

interface ProcessStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  status: "pending" | "processing" | "completed" | "error"
  progress: number
}

export default function KmtcProcessingAnimation({ userData, onComplete }: KmtcProcessingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<ProcessStep[]>([
    {
      id: "preparation",
      title: "Preparation",
      description: "Preparing your academic data for KMTC analysis",
      icon: FileCheck,
      status: "pending",
      progress: 0,
    },
    {
      id: "database",
      title: "KMTC Database Connection",
      description: "Connecting to KMTC programmes database",
      icon: Database,
      status: "pending",
      progress: 0,
    },
    {
      id: "analysis",
      title: "Programme Analysis",
      description: "Analyzing KMTC programme requirements",
      icon: Search,
      status: "pending",
      progress: 0,
    },
    {
      id: "matching",
      title: "Grade Matching",
      description: "Matching your grades with programme requirements",
      icon: Users,
      status: "pending",
      progress: 0,
    },
    {
      id: "results",
      title: "Qualified Programmes",
      description: "Compiling your eligible KMTC programmes",
      icon: Award,
      status: "pending",
      progress: 0,
    },
  ])

  const updateStepStatus = (stepIndex: number, status: ProcessStep["status"], progress = 0) => {
    setSteps((prev) => prev.map((step, index) => (index === stepIndex ? { ...step, status, progress } : step)))
  }

  const processSteps = async () => {
    try {
      log("kmtc:processing", "Starting step processing", "info", { userData })
      // Step 1: Preparation
      setCurrentStep(0)
      updateStepStatus(0, "processing", 0)

      await new Promise((resolve) => setTimeout(resolve, 1000))

      for (let i = 0; i <= 100; i += 20) {
        updateStepStatus(0, "processing", i)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      updateStepStatus(0, "completed", 100)

      // Step 2: KMTC Database Connection
      setCurrentStep(1)
      updateStepStatus(1, "processing", 0)

      await new Promise((resolve) => setTimeout(resolve, 800))

      for (let i = 0; i <= 100; i += 25) {
        updateStepStatus(1, "processing", i)
        await new Promise((resolve) => setTimeout(resolve, 150))
      }
      updateStepStatus(1, "completed", 100)

      // Step 3: Programme Analysis
      setCurrentStep(2)
      updateStepStatus(2, "processing", 0)

      await new Promise((resolve) => setTimeout(resolve, 1200))

      for (let i = 0; i <= 100; i += 10) {
        updateStepStatus(2, "processing", i)
        await new Promise((resolve) => setTimeout(resolve, 80))
      }
      updateStepStatus(2, "completed", 100)

      // Step 4: Grade Matching
      setCurrentStep(3)
      updateStepStatus(3, "processing", 0)

      // Run course fetching and progress animation in parallel
      const [qualifiedCourses] = await Promise.all([
        fetchKmtcCourses(userData.meanGrade, userData.subjects),
        (async () => {
          for (let i = 0; i <= 100; i += 15) {
            updateStepStatus(3, "processing", i)
            await new Promise((resolve) => setTimeout(resolve, 100))
          }
        })(),
      ])

      updateStepStatus(3, "completed", 100)
      log("kmtc:processing", "Parallel step complete", "success", { count: qualifiedCourses.length })

      // Step 5: Results Compilation
      setCurrentStep(4)
      updateStepStatus(4, "processing", 0)

      // Store results in cache
      const resultId = uuidv4()

      // Get user info from localStorage
      const paymentInfo = localStorage.getItem("paymentInfo")
      let userInfo = { name: "Student", email: "student@example.com", phone: "" }

      if (paymentInfo) {
        try {
          userInfo = JSON.parse(paymentInfo)
        } catch (e) {
          console.error("Error parsing payment info:", e)
        }
      }

      const { error: cacheError } = await supabase.from("results_cache").insert({
        result_id: resultId,
        name: userInfo.name,
        email: userInfo.email,
        phone_number: userInfo.phone,
        category: "kmtc",
        eligible_courses: qualifiedCourses,
      })

      if (cacheError) {
        log("kmtc:cache", "Error storing results in cache", "error", cacheError)
        throw cacheError
      }

      // Store result ID for later retrieval
      localStorage.setItem("resultId", resultId)
      log("kmtc:cache", "Results cached successfully", "success", { resultId })
      try {
        await fetch("/api/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_type: "user.course.generate",
            actor_role: "user",
            description: `Generated ${qualifiedCourses.length} KMTC programmes`,
            metadata: { category: "kmtc", resultId, count: qualifiedCourses.length },
          }),
        })
      } catch {}

      for (let i = 0; i <= 100; i += 20) {
        updateStepStatus(4, "processing", i)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      updateStepStatus(4, "completed", 100)

      // Complete processing
      await new Promise((resolve) => setTimeout(resolve, 500))
      onComplete(qualifiedCourses)
    } catch (error) {
      log("kmtc:processing", "Unhandled error during processing", "error", error)
      updateStepStatus(currentStep, "error", 0)
    }
  }

  useEffect(() => {
    processSteps()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto backdrop-blur-sm bg-card/80 border border-border shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Processing Your KMTC Eligibility</h2>
            <p className="text-white">
              {"We're analyzing your grades against KMTC programme requirements..."}
            </p>
          </div>

          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = step.status === "completed"
              const isError = step.status === "error"

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-x-4 p-4 rounded-lg transition-all duration-300 ${
                    isActive
                      ? "bg-primary/10 border border-primary/20"
                      : isCompleted
                        ? "bg-green-50 dark:bg-green-900/20"
                        : isError
                          ? "bg-red-50 dark:bg-red-900/20"
                          : "bg-muted/50"
                  }`}
                >
                  <div className="flex-shrink-0">
                    <AnimatePresence mode="wait">
                      {isCompleted ? (
                        <motion.div
                          key="completed"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center"
                        >
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </motion.div>
                      ) : isError ? (
                        <motion.div
                          key="error"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center"
                        >
                          <X className="w-6 h-6 text-white" />
                        </motion.div>
                      ) : step.status === "processing" ? (
                        <motion.div
                          key="processing"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
                        >
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="pending"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex-1 min-w-0 max-w-full overflow-hidden">
                    <p className="text-sm text-light hidden sm:block">{step.title}</p>
                    <p className="text-xs text-white mt-1">{step.description}</p>

                    {step.status === "processing" && (
                      <div className="mt-2">
                        <Progress value={step.progress} className="h-2" />
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 text-sm text-white">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing your KMTC programme eligibility...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
