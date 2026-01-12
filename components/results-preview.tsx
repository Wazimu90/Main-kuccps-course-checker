"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  GraduationCap,
  MapPin,
  Building2,
  ArrowRight,
  Clock,
  Database,
  Search,
  BookOpen,
  FileText,
  CheckCircle,
  Star,
  Download,
  MessageCircle,
  Globe,
  Shield,
  Target,
  TrendingUp,
} from "lucide-react"
import { fetchEligibleCourses, type EligibleCourse } from "@/lib/course-eligibility"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"
import { log } from "@/lib/logger"

interface ResultsPreviewProps {
  category: string
  userData: {
    meanGrade: string
    subjects: Record<string, string>
    clusterWeights?: Record<string, number>
  }
  onProceed: () => void
}

// Count-up animation hook
function useCountUp(target: number, duration = 2000, delay = 0) {
  const [count, setCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (!isAnimating) return

    const startTime = performance.now() + delay
    let animationFrame: number

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      if (elapsed < 0) {
        animationFrame = requestAnimationFrame(animate)
        return
      }

      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic function for deceleration
      const easedProgress = 1 - Math.pow(1 - progress, 3)
      const currentCount = Math.ceil(target * easedProgress)

      setCount(currentCount)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(target)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [target, duration, delay, isAnimating])

  const startAnimation = () => setIsAnimating(true)

  return { count, startAnimation }
}

export default function ResultsPreview({ category, userData, onProceed }: ResultsPreviewProps) {
  const [eligibleCourses, setEligibleCourses] = useState<EligibleCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Progress tracking states
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [currentMiniProcessIndex, setCurrentMiniProcessIndex] = useState(0)
  const [humorTextIndex, setHumorTextIndex] = useState(0)

  // Count-up animation states
  const qualifyingCoursesCount = useCountUp(eligibleCourses.length, 2000, 500)
  const [uniqueLocationsCount, setUniqueLocationsCount] = useState(0)
  const locationsCount = useCountUp(uniqueLocationsCount, 1500, 800)
  const [topLocations, setTopLocations] = useState<
    Array<{ name: string; averageCutoff: number; qualifyingCoursesCount: number }>
  >([])

  // Progress steps configuration
  const steps = [
    {
      label: "Preparation",
      icon: Clock,
      mainStatus: "Preparing Your Application Data...",
      miniProcesses: ["Reading submitted results...", "Parsing data for analysis...", "Structuring student profile..."],
      duration: 10000,
    },
    {
      label: "KUCCPS Connection",
      icon: Database,
      mainStatus: "Connecting to KUCCPS Database...",
      miniProcesses: ["Establishing secure connection...", "Verifying database access..."],
      duration: 6000,
    },
    {
      label: "Cluster Analysis",
      icon: Search,
      mainStatus: "Analyzing Cluster Weights & Cut-offs...",
      miniProcesses: [
        "Processing clusters in parallel...",
        "Checking cutoff requirements...",
        "Filtering qualified programmes...",
      ],
      duration: 20000,
    },
    {
      label: "Subject Requirements",
      icon: BookOpen,
      mainStatus: "Verifying Subject Requirements...",
      miniProcesses: ["Cross-referencing minimum grades...", "Validating essential subjects..."],
      duration: 6000,
    },
    {
      label: "Results Compilation",
      icon: FileText,
      mainStatus: "Compiling Final Course Matches...",
      miniProcesses: ["Arranging qualified programs...", "Generating personalized report..."],
      duration: 20000,
    },
  ]

  const humorCautionTexts = [
    "Our algorithms are working harder than a student cramming for CATs!",
    "Please do not exit or refresh this page. Your results are being processed.",
    "Patience is a virtue, especially when finding your perfect course match.",
    "Ensure your internet connection is stable for uninterrupted processing.",
    "We're calculating faster than you calculated your cluster points!",
    "Almost done! Don't miss out on your personalized course list.",
    "Your future is loading... and it looks bright!",
    "Thinking... just like you did during your KCSE exams (but faster).",
  ]

  // Rotate humor/caution texts
  useEffect(() => {
    if (!isLoading) return

    const interval = setInterval(() => {
      setHumorTextIndex((prev) => (prev + 1) % humorCautionTexts.length)
    }, 7000)

    return () => clearInterval(interval)
  }, [isLoading, humorCautionTexts.length])

  // Main processing effect
  useEffect(() => {
    async function processResults() {
      try {
        setIsLoading(true)
        setError(null)

        log(`degree:processing`, "Starting parallel animation + backend", "info", { category, userData })

        // Run UI animation and backend processing in parallel
        const [courses] = await Promise.all([
          fetchEligibleCourses(category, userData.meanGrade, userData.subjects, userData.clusterWeights),
          runProgressAnimation(),
        ])

        log(`degree:processing`, "Animation and backend complete", "success", { count: courses.length })
        setEligibleCourses(courses)

        // Calculate unique locations count
        const uniqueLocations = new Set<string>()
        courses.forEach((course) => {
          if (course.location) {
            uniqueLocations.add(course.location)
          }
        })
        setUniqueLocationsCount(uniqueLocations.size)

        // Calculate top locations by average cutoff
        const locationsData: Record<string, { totalCutoff: number; courseCount: number; courses: EligibleCourse[] }> =
          {}

        courses.forEach((course) => {
          if (course.location && course.cutoff) {
            if (!locationsData[course.location]) {
              locationsData[course.location] = {
                totalCutoff: 0,
                courseCount: 0,
                courses: [],
              }
            }
            locationsData[course.location].totalCutoff += course.cutoff
            locationsData[course.location].courseCount++
            locationsData[course.location].courses.push(course)
          }
        })

        // Convert to array and calculate average cutoff
        const sortedLocations = Object.keys(locationsData)
          .map((locationName) => {
            const data = locationsData[locationName]
            return {
              name: locationName,
              averageCutoff: data.totalCutoff / data.courseCount,
              qualifyingCoursesCount: data.courseCount,
            }
          })
          .sort((a, b) => b.averageCutoff - a.averageCutoff) // Sort by average cutoff DESC
          .slice(0, 3)

        setTopLocations(sortedLocations)

        // Store results in Supabase results_cache table
        const resultId = uuidv4()
        const paymentInfo = JSON.parse(localStorage.getItem("paymentInfo") || "{}")

        const { error: insertError } = await supabase.from("results_cache").insert({
          result_id: resultId,
          phone_number: paymentInfo.phone || "",
          email: paymentInfo.email || "",
          category: category,
          eligible_courses: courses,
        })

        if (insertError) {
          log("degree:cache", "Error storing results in cache", "error", insertError)
        } else {
          localStorage.setItem("resultId", resultId)
          log("degree:cache", "Results cached successfully", "success", { resultId })
          try {
            await fetch("/api/activity", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                event_type: "user.course.generate",
                actor_role: "user",
                email: paymentInfo.email || null,
                phone_number: paymentInfo.phone || null,
                description: `Generated ${courses.length} courses for ${category}`,
                metadata: { category, resultId, count: courses.length },
              }),
            })
          } catch { }
        }

        // Start count-up animations
        setTimeout(() => {
          qualifyingCoursesCount.startAnimation()
        }, 500)

        setTimeout(() => {
          locationsCount.startAnimation()
        }, 800)
      } catch (err) {
        log("degree:processing", "Unhandled error during processing", "error", err)
        setError("Failed to process your results. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (userData.meanGrade && userData.subjects) {
      processResults()
    }
  }, [category, userData])

  // Update locations count when uniqueLocationsCount changes
  useEffect(() => {
    if (uniqueLocationsCount > 0) {
      locationsCount.startAnimation()
    }
  }, [uniqueLocationsCount])

  // Progress animation function
  const runProgressAnimation = async () => {
    for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
      setCurrentStepIndex(stepIndex)
      const currentStep = steps[stepIndex]
      const miniProcessDuration = currentStep.duration / currentStep.miniProcesses.length

      for (let miniIndex = 0; miniIndex < currentStep.miniProcesses.length; miniIndex++) {
        setCurrentMiniProcessIndex(miniIndex)
        await new Promise((resolve) => setTimeout(resolve, miniProcessDuration))
      }

      setCurrentMiniProcessIndex(currentStep.miniProcesses.length)
    }
  }

  if (isLoading) {
    const currentStep = steps[currentStepIndex]
    const progressPercentage = (currentStepIndex / (steps.length - 1)) * 100

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="w-full max-w-4xl bg-slate-800/70 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 border border-slate-700/50">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-center text-light mb-12 flex items-center justify-center gap-3"
          >
            <GraduationCap className="h-10 w-10 text-teal-400" />
            Finding Your Future Pathways...
          </motion.h1>

          <div className="relative mb-16">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-700 rounded-full transform -translate-y-1/2 z-10">
              <motion.div
                className="h-full bg-gradient-to-r from-teal-400 to-purple-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                style={{ transition: "width 300ms ease-in-out" }}
              />
            </div>

            <div className="flex flex-wrap sm:flex-nowrap justify-center sm:justify-between items-center gap-3 relative z-20 max-w-full overflow-hidden">
              {steps.map((step, index) => {
                const StepIcon = step.icon
                const isCompleted = index < currentStepIndex
                const isActive = index === currentStepIndex
                const isPending = index > currentStepIndex

                return (
                  <motion.div
                    key={step.label}
                    className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left mx-1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div
                      className={`
                      w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-full border-2 flex items-center justify-center text-lg md:text-xl
                      transition-all duration-500 relative
                      ${isCompleted ? "bg-teal-500 border-teal-500 text-white" : ""}
                      ${isActive ? "bg-teal-500 border-teal-500 text-white shadow-lg shadow-teal-500/40" : ""}
                      ${isPending ? "bg-slate-700 border-slate-600 text-light" : ""}
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

                    <p className="text-sm text-light hidden sm:block">{step.label}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-6 md:p-8 mb-8 min-h-[200px] border border-slate-700/30">
            <motion.h2
              key={currentStep.mainStatus}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl md:text-2xl font-semibold text-light mb-6"
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
                    className="flex items-center space-x-3 text-light"
                  >
                    {isCompleted ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-teal-400">
                        <CheckCircle className="w-4 h-4" />
                      </motion.div>
                    ) : isActive ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-slate-600" />
                    )}
                    <span className={`text-sm md:text-base ${isActive ? "font-medium text-light" : ""}`}>
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
              <h3 className="text-lg font-semibold text-light mb-2">KUCCPS Course Matching Insights</h3>
              <p className="text-light text-sm md:text-base">{humorCautionTexts[humorTextIndex]}</p>
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <Card className="max-w-2xl mx-auto bg-slate-800/90 backdrop-blur-lg border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-red-400 text-lg font-medium">Error</div>
              <p className="text-light">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-white/20 text-light hover:bg-surface"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (eligibleCourses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto bg-slate-800/70 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 border border-slate-700/50">
          <div className="text-center py-8 space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-8xl"
            >
              😔
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-light"
            >
              No Qualifying Courses Found
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-light max-w-md mx-auto text-lg"
            >
              Based on your current grades, you don't meet the requirements for {category.toLowerCase()} courses.
              Consider checking other course categories or improving your grades.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex gap-4 justify-center mt-8"
            >
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="border-white/20 text-light hover:bg-surface px-8 py-3"
              >
                Try Different Category
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto bg-slate-800/70 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 border border-slate-700/50"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-light mb-4 flex items-center justify-center gap-4"
          >
            <Star className="h-12 w-12 text-yellow-400" />
            Your Results Preview
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-light text-lg"
          >
            Based on your KCSE grades and {category.toLowerCase()} course requirements
          </motion.p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Hero Card - Qualifying Courses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 text-center shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:-translate-y-2"
          >
            <div className="text-5xl md:text-6xl font-bold text-white mb-2">{qualifyingCoursesCount.count}</div>
            <div className="text-purple-100 text-lg font-medium">Qualifying Courses</div>
          </motion.div>

          {/* Available Locations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 text-center shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:-translate-y-2"
          >
            <div className="text-5xl md:text-6xl font-bold text-white mb-2">{locationsCount.count}</div>
            <div className="text-blue-100 text-lg font-medium">Available Locations</div>
          </motion.div>

          {/* Course Level */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-slate-700 to-slate-600 rounded-2xl p-8 text-center shadow-2xl hover:shadow-slate-500/50 transition-all duration-300 hover:-translate-y-2"
          >
            <div className="text-4xl text-teal-400 mb-4">
              <GraduationCap className="h-16 w-16 mx-auto" />
            </div>
            <div className="text-light text-lg font-medium">{category} Course Level</div>
          </motion.div>
        </div>

        {/* Top Institutions by Location */}
        {topLocations.length > 0 && (
          <div className="mb-16">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="text-2xl md:text-3xl font-bold text-light mb-8 flex items-center gap-3"
            >
              <Building2 className="h-8 w-8 text-teal-400" />
              Top Institutions by Location
            </motion.h2>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
              {topLocations.map((location, index) => (
                <motion.div
                  key={location.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="bg-slate-700/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30 hover:border-teal-400/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-400/20 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-lg">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-xl font-bold text-light group-hover:text-teal-400 transition-colors">
                          {location.name}
                        </div>
                        <div className="text-light flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {location.qualifyingCoursesCount} qualifying course
                          {location.qualifyingCoursesCount !== 1 ? "s" : ""}
                        </div>

                      </div>
                    </div>
                    <div className="text-4xl font-bold text-teal-400">{location.qualifyingCoursesCount}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-slate-700/30 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-slate-600/30 text-center"
        >
          <Button
            onClick={onProceed}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white w-full sm:w-auto max-w-full px-4 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg md:text-xl font-extrabold rounded-full shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:shadow-[0_0_50px_rgba(168,85,247,0.8)] transition-all duration-300 hover:scale-105 hover:-translate-y-1 mb-8 border-2 border-white/20 whitespace-normal h-auto break-words flex flex-col sm:flex-row items-center justify-center gap-2"
          >
            View All {eligibleCourses.length} Qualified Courses
            <ArrowRight className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-4xl mx-auto">
            {[
              { icon: Download, text: "Full detailed PDF for every qualified course" },
              { icon: MessageCircle, text: "Access to our exclusive AI Chatbot for personalized course advice" },
              { icon: Globe, text: "Precise course locations and direct university websites" },
              { icon: Shield, text: "Insights into university types (public, private)" },
              { icon: Target, text: "Strategic advice for course selection and application" },
              { icon: TrendingUp, text: "A comprehensive report to guide your career path" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                className="flex items-center gap-3 text-light hover:text-teal-400 transition-colors"
              >
                <div className="text-teal-400">
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-lg">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
