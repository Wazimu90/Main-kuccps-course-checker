"use client"

import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { fetchEligibleCourses } from "@/lib/course-eligibility"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface LoadingAnimationProps {
  userData?: any
  onComplete?: (eligibleCourses: any) => void
}

export default function LoadingAnimation({ userData, onComplete }: LoadingAnimationProps) {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!userData) return

    const runProcessing = async () => {
      setIsProcessing(true)
      try {
        console.log("🚀 Starting degree course eligibility check in parallel")

        // Start both animation and course processing in parallel
        const animationPromise = new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve()
          }, 3000) // 3 second animation
        })

        // Start course eligibility check immediately
        const courseProcessingPromise = (async () => {
          const eligibleCourses = await fetchEligibleCourses(
            userData.category,
            userData.meanGrade,
            userData.subjectGrades,
            userData.clusterWeights,
          )
          return eligibleCourses
        })()

        // Wait for both to complete
        const [, eligibleCourses] = await Promise.all([animationPromise, courseProcessingPromise])

        console.log(`✅ Found ${eligibleCourses.length} eligible courses`)

        // Store results in Supabase
        const resultId = `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        const { error: insertError } = await supabase.from("results_cache").insert({
          result_id: resultId,
          category: userData.category,
          eligible_courses: eligibleCourses,
          name: userData.name,
          email: userData.email,
          phone_number: userData.phone,
        })

        if (insertError) {
          console.error("❌ Error storing results in cache:", insertError)
          throw insertError
        }

        localStorage.setItem("resultId", resultId)
        console.log("✅ Results stored successfully with ID:", resultId)

        if (onComplete) {
          onComplete(eligibleCourses)
        }
      } catch (error) {
        console.error("❌ Error during processing:", error)
        toast({
          title: "Error",
          description: "Failed to process your request. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsProcessing(false)
      }
    }

    runProcessing()
  }, [userData, onComplete, toast])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </motion.div>

        <h2 className="mb-2 text-2xl font-bold">Matching Your Best-Fit Courses...</h2>
        <p className="text-white">We're analyzing your grades to find the perfect courses for you</p>

        <motion.div className="mx-auto mt-8 h-2 w-64 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3 }}
          />
        </motion.div>
      </motion.div>
    </div>
  )
}
