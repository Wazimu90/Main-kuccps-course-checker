"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock, Server, Search, CheckSquare, GraduationCap, CheckCircle } from "lucide-react"
import { fetchDiplomaCourses, type DiplomaCourse } from "@/lib/diploma-course-eligibility"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

interface DiplomaProcessingAnimationProps {
  userData: {
    meanGrade: string
    subjects: Record<string, string>
    courseCategories: string[]
  }
  onComplete: (courses: DiplomaCourse[]) => void
}

const steps = [
  {
    id: 1,
    label: "Preparing Application Data",
    icon: Clock,
    mainStatus: "Preparing Your Application Data...",
    miniProcesses: ["Reading submitted results...", "Parsing data for analysis...", "Structuring student profile..."],
    duration: 6000,
  },
  {
    id: 2,
    label: "Connecting to KUCCPS",
    icon: Server,
    mainStatus: "Connecting to KUCCPS Database...",
    miniProcesses: ["Establishing secure connection...", "Verifying database access..."],
    duration: 4000,
  },
  {
    id: 3,
    label: "Querying Categories",
    icon: Search,
    mainStatus: "Querying Course Categories...",
    miniProcesses: [], // Will be populated dynamically
    duration: 18000,
  },
  {
    id: 4,
    label: "Checking Subject Requirements",
    icon: CheckSquare,
    mainStatus: "Checking Subject Requirements...",
    miniProcesses: ["Cross-referencing minimum grades...", "Validating essential subjects..."],
    duration: 12000,
  },
  {
    id: 5,
    label: "Final Matches",
    icon: GraduationCap,
    mainStatus: "Compiling Final Course Matches...",
    miniProcesses: ["Arranging qualified programs...", "Generating personalized report..."],
    duration: 6000,
  },
]

const humorMessages = [
  "Our algorithms are working harder than a student cramming for CATs!",
  "Please do not exit or refresh this page. Your results are being processed.",
  "Patience is a virtue, especially when finding your perfect course match.",
  "Ensure your internet connection is stable for uninterrupted processing.",
  "We're calculating faster than you calculated your cluster points!",
  "Almost done! Don't miss out on your personalized course list.",
  "Your future is loading... and it looks bright!",
  "Thinking... just like you did during your KCSE exams (but faster).",
]

export default function DiplomaProcessingAnimation({ userData, onComplete }: DiplomaProcessingAnimationProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [currentMiniProcessIndex, setCurrentMiniProcessIndex] = useState(0)
  const [humorTextIndex, setHumorTextIndex] = useState(0)
  const [isProcessing, setIsProcessing] = useState(true)

  console.log("DiplomaProcessingAnimation mounted with userData:", userData)

  // Populate step 3 mini processes based on selected categories
  useEffect(() => {
    if (userData?.courseCategories?.length > 0) {
      const categoryCount = userData.courseCategories.length
      steps[2].miniProcesses = Array.from(
        { length: categoryCount },
        (_, i) => `Querying Category ${i + 1} of ${categoryCount}...`,
      )
    } else {
      steps[2].miniProcesses = ["Querying all available categories..."]
    }
  }, [userData?.courseCategories])

  // Rotate humor messages
  useEffect(() => {
    if (!isProcessing) return

    const interval = setInterval(() => {
      setHumorTextIndex((prev) => (prev + 1) % humorMessages.length)
    }, 7000)

    return () => clearInterval(interval)
  }, [isProcessing])

  // Main processing effect
  useEffect(() => {
    async function runProcessing() {
      try {
        console.log("Starting diploma processing...")

        // Run animation and actual processing in parallel
        const [, courses] = await Promise.all([
          runProgressAnimation(),
          fetchDiplomaCourses(userData.meanGrade, userData.subjects, userData.courseCategories || []),
        ])

        console.log("Animation and processing complete simultaneously...")

        // Store results in Supabase results_cache table
        const resultId = uuidv4()
        const paymentInfo = JSON.parse(localStorage.getItem("paymentInfo") || "{}")

        const { error: insertError } = await supabase.from("results_cache").insert({
          result_id: resultId,
          phone_number: paymentInfo.phone || "",
          email: paymentInfo.email || "",
          name: paymentInfo.name || "",
          category: "diploma",
          eligible_courses: courses,
        })

        if (insertError) {
          console.error("Error storing results in cache:", insertError)
        } else {
          localStorage.setItem("resultId", resultId)
          console.log("Results cached successfully with ID:", resultId)
        }

        setIsProcessing(false)
        onComplete(courses)
      } catch (error) {
        console.error("Error in diploma processing:", error)
        setIsProcessing(false)
        onComplete([])
      }
    }

    if (userData && userData.meanGrade && userData.subjects) {
      runProcessing()
    } else {
      console.error("Invalid userData provided to DiplomaProcessingAnimation:", userData)
      setIsProcessing(false)
      onComplete([])
    }
  }, [userData, onComplete])

  // Progress animation function
  const runProgressAnimation = async () => {
    for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
      setCurrentStepIndex(stepIndex)
      const currentStep = steps[stepIndex]
      const miniProcessDuration = currentStep.duration / Math.max(currentStep.miniProcesses.length, 1)

      for (let miniIndex = 0; miniIndex < currentStep.miniProcesses.length; miniIndex++) {
        setCurrentMiniProcessIndex(miniIndex)
        await new Promise((resolve) => setTimeout(resolve, miniProcessDuration))
      }

      setCurrentMiniProcessIndex(currentStep.miniProcesses.length)
    }
  }

  const currentStep = steps[currentStepIndex]
  const progressPercentage = (currentStepIndex / (steps.length - 1)) * 100

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-900 p-4">
      <div className="w-full max-w-4xl bg-emerald-800/70 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 border border-emerald-700/50">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold text-center text-emerald-100 mb-12 flex items-center justify-center gap-3"
        >
          <GraduationCap className="h-10 w-10 text-emerald-400" />
          Finding Your Diploma Pathways...
        </motion.h1>

        <div className="relative mb-16">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-emerald-700 rounded-full transform -translate-y-1/2 z-10">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>

          <div className="flex justify-between items-center relative z-20">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isCompleted = index < currentStepIndex
              const isActive = index === currentStepIndex
              const isPending = index > currentStepIndex

              return (
                <motion.div
                  key={step.id}
                  className="flex flex-col items-center text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div
                    className={`
                      w-12 h-12 md:w-16 md:h-16 rounded-full border-2 flex items-center justify-center text-lg md:text-xl
                      transition-all duration-500 relative
                      ${isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : ""}
                      ${isActive ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/40" : ""}
                      ${isPending ? "bg-emerald-700 border-emerald-600 text-emerald-400" : ""}
                    `}
                  >
                    {isCompleted ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
                        <CheckCircle className="w-6 h-6" />
                      </motion.div>
                    ) : (
                      <StepIcon className="w-6 h-6" />
                    )}
                  </div>

                  <div
                    className={`
                      mt-3 text-xs md:text-sm font-medium transition-colors duration-500
                      ${isActive ? "text-emerald-400 font-bold" : "text-emerald-400"}
                    `}
                  >
                    {step.label}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        <div className="bg-emerald-800/50 rounded-2xl p-6 md:p-8 mb-8 min-h-[200px] border border-emerald-700/30">
          <motion.h2
            key={currentStep.mainStatus}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl md:text-2xl font-semibold text-emerald-100 mb-6"
          >
            {currentStep.mainStatus}
          </motion.h2>

          <div className="space-y-3">
            {currentStep.miniProcesses.map((process, index) => {
              const isCompleted = index < currentMiniProcessIndex
              const isActive = index === currentMiniProcessIndex
              const isPending = index > currentMiniProcessIndex

              return (
                <motion.div
                  key={`${currentStepIndex}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: isPending ? 0.5 : 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 text-emerald-300"
                >
                  {isCompleted ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-400">
                      <CheckCircle className="w-4 h-4" />
                    </motion.div>
                  ) : isActive ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-emerald-600" />
                  )}
                  <span className={`text-sm md:text-base ${isActive ? "font-medium text-emerald-100" : ""}`}>
                    {process}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>

        <motion.div
          key={humorTextIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-emerald-100 mb-2">KUCCPS Diploma Course Matching</h3>
            <p className="text-emerald-300 text-sm md:text-base">{humorMessages[humorTextIndex]}</p>
          </div>

          <div className="mt-6">
            <h4 className="text-md font-semibold text-red-400 mb-2">Important Reminders:</h4>
            <div className="space-y-1 text-sm text-red-300">
              <p>• Do not refresh or close this page during processing</p>
              <p>• Ensure stable internet connection for best results</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
