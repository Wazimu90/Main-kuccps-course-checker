"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Loader2, Database, Search, Filter, Award, Users } from "lucide-react"
import { fetchArtisanCourses, type ArtisanCourse } from "@/lib/artisan-course-eligibility"
import { supabase } from "@/lib/supabase"


interface ArtisanProcessingAnimationProps {
  userData: {
    meanGrade: string
    subjects: Record<string, string>
    courseCategories: string[]
    counties: string[]
    institutionType: string
  }
  onComplete: (courses: ArtisanCourse[]) => void
}

const processingSteps = [
  {
    id: 1,
    title: "Preparation",
    description: "Setting up your qualification parameters",
    icon: Database,
    duration: 2000,
  },
  {
    id: 2,
    title: "Database Connection",
    description: "Connecting to artisan programmes database",
    icon: Search,
    duration: 2000,
  },
  {
    id: 3,
    title: "Filtering Programmes",
    description: "Filtering by counties and institution type",
    icon: Filter,
    duration: 3000,
  },
  {
    id: 4,
    title: "Grade Verification",
    description: "Checking mean grade requirements",
    icon: Award,
    duration: 2000,
  },
  {
    id: 5,
    title: "Final Results",
    description: "Compiling your qualified programmes",
    icon: Users,
    duration: 1000,
  },
]

export default function ArtisanProcessingAnimation({ userData, onComplete }: ArtisanProcessingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const processSteps = async () => {
      // Process each step with timing
      for (let i = 0; i < processingSteps.length; i++) {
        setCurrentStep(i)

        // Wait for step duration
        await new Promise((resolve) => setTimeout(resolve, processingSteps[i].duration))

        // Mark step as completed
        setCompletedSteps((prev) => [...prev, i])

        // If this is the last step, fetch actual courses in parallel with timing
        if (i === processingSteps.length - 1) {
          try {
            console.log("🚀 Starting artisan course fetching process...")

            // Run course fetching and timing in parallel
            const [qualifiedCourses] = await Promise.all([
              fetchArtisanCourses(
                userData.meanGrade,
                userData.courseCategories,
                userData.counties,
                userData.institutionType,
              ),
              new Promise((resolve) => setTimeout(resolve, processingSteps[i].duration)),
            ])

            console.log(`✅ Found ${qualifiedCourses.length} qualified artisan courses`)

            // Generate unique result ID
            const resultId = `artisan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

            // Get user info from localStorage (will be set during payment)
            const userPhone = localStorage.getItem("userPhone") || ""
            const userEmail = localStorage.getItem("userEmail") || ""
            const userName = localStorage.getItem("userName") || ""

            // Get agent_code from referral cookie for ART feature
            let agentCode: string | null = null
            try {
              const cookieMatch = document.cookie.match(/(?:^|; )referral_code=([^;]+)/)
              agentCode = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null
            } catch { }

            // Store results in Supabase results_cache table
            const { error: insertError } = await supabase.from("results_cache").insert({
              result_id: resultId,
              category: "artisan",
              eligible_courses: qualifiedCourses,
              phone_number: userPhone,
              email: userEmail,
              name: userName,
              agent_code: agentCode,
            })

            if (insertError) {
              console.error("❌ Error storing results in cache:", insertError)
            } else {
              console.log("✅ Results stored successfully in cache with ID:", resultId)
              // Store result ID in localStorage for results page
              localStorage.setItem("resultId", resultId)
              try {
                await fetch("/api/activity", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    event_type: "user.course.generate",
                    actor_role: "user",
                    description: `Generated ${qualifiedCourses.length} artisan programmes`,
                    metadata: { category: "artisan", resultId, count: qualifiedCourses.length },
                  }),
                })
              } catch { }
            }

            setIsProcessing(false)
            onComplete(qualifiedCourses)
          } catch (error) {
            console.error("❌ Error in artisan processing:", error)
            setIsProcessing(false)
            onComplete([])
          }
        }
      }
    }

    processSteps()
  }, [userData, onComplete])

  return (
    <div className="min-h-screen relative">

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">🔍 Finding Your Artisan Programmes</h1>
            <p className="text-xl text-white/80">
              We're analyzing your qualifications and matching them with available programmes
            </p>
          </motion.div>

          {/* Processing Steps */}
          <div className="space-y-6">
            {processingSteps.map((step, index) => {
              const isActive = currentStep === index
              const isCompleted = completedSteps.includes(index)
              const Icon = step.icon

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={`backdrop-blur-sm border transition-all duration-500 ${isCompleted
                        ? "bg-green-500/20 border-green-400/50"
                        : isActive
                          ? "bg-orange-500/20 border-orange-400/50"
                          : "bg-card/40 border-border/50"
                      }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 max-w-full overflow-hidden">
                        <div
                          className={`p-3 rounded-full transition-all duration-500 ${isCompleted ? "bg-green-500/30" : isActive ? "bg-orange-500/30" : "bg-muted/30"
                            }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-6 w-6 text-green-400" />
                          ) : isActive ? (
                            <Loader2 className="h-6 w-6 text-orange-400" />
                          ) : (
                            <Icon className="h-6 w-6 text-white" />
                          )}
                        </div>

                        <div className="flex-1">
                          <p className="text-sm text-light hidden sm:block">{step.title}</p>
                          <p
                            className={`text-sm transition-colors duration-500 ${isCompleted
                                ? "text-green-300/80"
                                : isActive
                                  ? "text-orange-300/80"
                                  : "text-light"
                              }`}
                          >
                            {step.description}
                          </p>
                        </div>

                        <div
                          className={`text-sm font-medium transition-colors duration-500 ${isCompleted ? "text-green-400" : isActive ? "text-orange-400" : "text-white"
                            }`}
                        >
                          {isCompleted ? "Complete" : isActive ? "Processing..." : "Pending"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Progress Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <Card className="backdrop-blur-sm bg-card/40 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-4 text-light">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Progress:</span>
                    <span className="font-semibold">
                      {completedSteps.length} / {processingSteps.length}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-border"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Status:</span>
                    <span className="font-semibold">{isProcessing ? "Processing..." : "Complete"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
