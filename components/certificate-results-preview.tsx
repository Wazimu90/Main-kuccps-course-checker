"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  GraduationCap,
  MapPin,
  Building2,
  ArrowRight,
  Star,
  Download,
  MessageCircle,
  Globe,
  Shield,
  Target,
  TrendingUp,
  AlertCircle,
} from "lucide-react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"

interface CertificateResultsPreviewProps {
  courses: any[]
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

export default function CertificateResultsPreview({ courses, onProceed }: CertificateResultsPreviewProps) {
  // Count-up animation states
  const [actualCourses, setActualCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const qualifyingCoursesCount = useCountUp(actualCourses.length, 2000, 500)
  const [uniqueCountiesCount, setUniqueCountiesCount] = useState(0)
  const countiesCount = useCountUp(uniqueCountiesCount, 1500, 800)
  const [topCounties, setTopCounties] = useState<Array<{ name: string; courseCount: number }>>([])

  // Load actual certificate results from Supabase
  useEffect(() => {
    const loadCertificateResults = async () => {
      try {
        const resultId = localStorage.getItem("resultId")

        if (!resultId) {
          console.error("No result ID found")
          setActualCourses(courses || [])
          processResults(courses || [])
          setIsLoading(false)
          setTimeout(() => {
            qualifyingCoursesCount.startAnimation()
          }, 500)
          setTimeout(() => {
            countiesCount.startAnimation()
          }, 800)
          return
        }

        // Fetch results from Supabase using result_id
        const { data: resultData, error } = await supabase
          .from("results_cache")
          .select("*")
          .eq("result_id", resultId)
          .eq("category", "certificate")
          .maybeSingle()

        if (error || !resultData) {
          console.error("Error fetching certificate results from cache:", error)
          setActualCourses(courses || [])
          processResults(courses || [])
          setIsLoading(false)
          setTimeout(() => {
            qualifyingCoursesCount.startAnimation()
          }, 500)
          setTimeout(() => {
            countiesCount.startAnimation()
          }, 800)
          return
        }

        const eligibleCourses = resultData.eligible_courses || []
        setActualCourses(eligibleCourses)
        processResults(eligibleCourses)
        setIsLoading(false)

        // Start count-up animations after data is loaded
        setTimeout(() => {
          qualifyingCoursesCount.startAnimation()
        }, 500)

        setTimeout(() => {
          countiesCount.startAnimation()
        }, 800)
      } catch (error) {
        console.error("Error loading certificate results:", error)
        setActualCourses(courses || [])
        processResults(courses || [])
        setIsLoading(false)
        setTimeout(() => {
          qualifyingCoursesCount.startAnimation()
        }, 500)
        setTimeout(() => {
          countiesCount.startAnimation()
        }, 800)
      }
    }

    const processResults = (coursesData: any[]) => {
      // Calculate unique counties count
      const uniqueCounties = new Set<string>()
      coursesData.forEach((course: any) => {
        if (course.county) {
          uniqueCounties.add(course.county)
        }
      })
      setUniqueCountiesCount(uniqueCounties.size)

      // Calculate top counties by course count
      const countiesData: Record<string, { courseCount: number }> = {}

      coursesData.forEach((course: any) => {
        if (course.county) {
          if (!countiesData[course.county]) {
            countiesData[course.county] = { courseCount: 0 }
          }
          countiesData[course.county].courseCount++
        }
      })

      // Convert to array and sort by course count
      const sortedCounties = Object.keys(countiesData)
        .map((countyName) => ({
          name: countyName,
          courseCount: countiesData[countyName].courseCount,
        }))
        .sort((a, b) => b.courseCount - a.courseCount) // Sort by course count DESC
        .slice(0, 3)

      setTopCounties(sortedCounties)
    }

    loadCertificateResults()
  }, [courses, qualifyingCoursesCount, countiesCount])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-900 p-4">
        <div className="max-w-4xl mx-auto bg-emerald-800/70 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 border border-emerald-700/50">
          <div className="text-center py-8 space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600/20"
            >
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent"></div>
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-emerald-100"
            >
              Loading Your Certificate Results
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-emerald-300 max-w-md mx-auto text-lg"
            >
              We're preparing your personalized certificate course results...
            </motion.p>
          </div>
        </div>
      </div>
    )
  }

  if (actualCourses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl mx-auto rounded-2xl backdrop-blur-sm bg-card/80 border border-border shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No Qualifying Courses Found</h2>
              <p className="text-white mb-6">
                Unfortunately, we couldn't find any certificate courses that match your current grades and selected
                categories.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-white">This could be because:</p>
              <ul className="text-sm text-white space-y-2 text-left max-w-md mx-auto">
                <li>• Your grades don't meet the minimum requirements</li>
                <li>• The selected course categories have limited options</li>
                <li>• Subject requirements don't match your KCSE subjects</li>
              </ul>
            </div>

            <div className="mt-8 space-y-3">
              <Button onClick={() => window.history.back()} className="w-full">
                Try Different Categories
              </Button>
              <Button variant="outline" onClick={() => (window.location.href = "/")} className="w-full">
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto bg-emerald-800/70 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 border border-emerald-700/50"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-emerald-100 mb-4 flex items-center justify-center gap-4"
          >
            <Star className="h-12 w-12 text-yellow-400" />
            Your Certificate Results Preview
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-emerald-300 text-lg"
          >
            Based on your KCSE grades and selected certificate course categories
          </motion.p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Hero Card - Qualifying Courses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-8 text-center shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:-translate-y-2"
          >
            <div className="text-5xl md:text-6xl font-bold text-white mb-2">{qualifyingCoursesCount.count}</div>
            <div className="text-emerald-100 text-lg font-medium">Qualifying Courses</div>
          </motion.div>

          {/* Available Counties */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl p-8 text-center shadow-2xl shadow-teal-500/30 hover:shadow-teal-500/50 transition-all duration-300 hover:-translate-y-2"
          >
            <div className="text-5xl md:text-6xl font-bold text-white mb-2">{countiesCount.count}</div>
            <div className="text-teal-100 text-lg font-medium">Total Counties</div>
          </motion.div>

          {/* Course Level */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-emerald-700 to-emerald-600 rounded-2xl p-8 text-center shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:-translate-y-2"
          >
            <div className="text-4xl text-emerald-400 mb-4">
              <GraduationCap className="h-16 w-16 mx-auto" />
            </div>
            <div className="text-emerald-100 text-lg font-medium">Certificate Course Level</div>
          </motion.div>
        </div>

        {/* Top Counties by Course Count */}
        {topCounties.length > 0 && (
          <div className="mb-16">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="text-2xl md:text-3xl font-bold text-emerald-100 mb-8 flex items-center gap-3"
            >
              <Building2 className="h-8 w-8 text-emerald-400" />
              Top Counties by Course Availability
            </motion.h2>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
              {topCounties.map((county, index) => (
                <motion.div
                  key={county.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="bg-emerald-700/50 backdrop-blur-sm rounded-2xl p-6 border border-emerald-600/30 hover:border-emerald-400/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-400/20 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-xl font-bold text-emerald-100 group-hover:text-emerald-400 transition-colors">
                          {county.name}
                        </div>
                        <div className="text-emerald-400 flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {county.courseCount} qualifying course{county.courseCount !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-emerald-400">{county.courseCount}</div>
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
          className="bg-emerald-700/30 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-emerald-600/30 text-center"
        >
          <Button
            onClick={onProceed}
            size="lg"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white w-full sm:w-auto max-w-full px-4 sm:px-8 md:px-12 py-3 sm:py-5 md:py-6 text-base sm:text-lg md:text-xl font-bold rounded-full shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 transition-all duration-300 hover:-translate-y-1 mb-8"
          >
            View All Qualified Courses
            <ArrowRight className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6" />
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-4xl mx-auto">
            {[
              { icon: Download, text: "Full detailed PDF for every qualified course" },
              { icon: MessageCircle, text: "Access to our exclusive AI Chatbot for personalized course advice" },
              { icon: Globe, text: "Direct university links and precise course locations" },
              { icon: Shield, text: "Insights into university types (Government/Private)" },
              { icon: Target, text: "Strategic advice for course selection and application" },
              { icon: TrendingUp, text: "Career path guidance for your chosen field" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                className="flex items-center gap-3 text-emerald-300 hover:text-emerald-400 transition-colors"
              >
                <div className="text-emerald-400">
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
