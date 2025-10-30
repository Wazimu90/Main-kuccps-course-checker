"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, MapPin, Building2, GraduationCap, TrendingUp, Award, Users } from "lucide-react"
import AnimatedBackground from "./animated-background"
import type { ArtisanCourse } from "@/lib/artisan-course-eligibility"

interface ArtisanResultsPreviewProps {
  courses: ArtisanCourse[]
  onProceed: () => void
}

export default function ArtisanResultsPreview({ courses, onProceed }: ArtisanResultsPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Get top locations by course count
  const locationStats = courses.reduce(
    (acc, course) => {
      acc[course.county] = (acc[course.county] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topLocations = Object.entries(locationStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([county, count]) => ({ county, count }))

  // Get cluster group distribution
  const clusterStats = courses.reduce(
    (acc, course) => {
      acc[course.cluster_group] = (acc[course.cluster_group] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topClusters = Object.entries(clusterStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([cluster, count]) => ({ cluster, count }))

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const CountingNumber = ({ end, duration = 2000 }: { end: number; duration?: number }) => {
    const [count, setCount] = useState(0)

    useState(() => {
      let startTime: number
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / duration, 1)
        setCount(Math.floor(progress * end))
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      requestAnimationFrame(animate)
    })

    return <span>{count}</span>
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div className="max-w-6xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🎯 Your Artisan Programme Results</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              {"We've found your qualified artisan programmes! Here's a preview of what awaits you."}
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-200/30">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 bg-orange-500/20 rounded-full">
                      <GraduationCap className="h-8 w-8 text-orange-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    <CountingNumber end={courses.length} />
                  </div>
                  <p className="text-orange-200">Qualified Programmes</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-200/30">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 bg-orange-500/20 rounded-full">
                      <MapPin className="h-8 w-8 text-orange-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    <CountingNumber end={topLocations.length} />
                  </div>
                  <p className="text-orange-200">Available Counties</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-200/30">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 bg-orange-500/20 rounded-full">
                      <Award className="h-8 w-8 text-orange-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    <CountingNumber end={topClusters.length} />
                  </div>
                  <p className="text-orange-200">Programme Categories</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sample Courses Preview */}
          {courses.length > 0 && (
            <motion.div variants={itemVariants} className="mb-12">
              <div className="text-center">
                <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-200/30">
                  <CardContent className="p-8">
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold text-white mb-6 text-center">Sample Qualified Programmes</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {courses.slice(0, 3).map((course, index) => {
                          const institutionsInCounty = courses.filter((c) => c.county === course.county).length
                          return (
                            <div
                              key={index}
                              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                            >
                              <h4 className="font-semibold text-white mb-2">{course.programme_name}</h4>
                              <div className="flex items-center gap-2 text-orange-200 text-sm mb-1">
                                <MapPin className="h-4 w-4" />
                                <span>{course.county}</span>
                              </div>
                              <div className="flex items-center gap-2 text-orange-200 text-sm">
                                <Building2 className="h-4 w-4" />
                                <span>{institutionsInCounty} institutions</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center">
                      <Button
                        onClick={() => (window.location.href = "/payment")}
                        size="lg"
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-4 text-lg font-semibold mb-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      >
                        View All Courses
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                        <div className="flex items-center gap-3 text-white/90">
                          <div className="p-2 bg-orange-500/20 rounded-full">
                            <GraduationCap className="h-4 w-4 text-orange-400" />
                          </div>
                          <span className="text-sm">Full detailed PDF for every qualified course</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90">
                          <div className="p-2 bg-orange-500/20 rounded-full">
                            <Users className="h-4 w-4 text-orange-400" />
                          </div>
                          <span className="text-sm">Access to AI Chatbot</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90">
                          <div className="p-2 bg-orange-500/20 rounded-full">
                            <Building2 className="h-4 w-4 text-orange-400" />
                          </div>
                          <span className="text-sm">Direct instituion links</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90">
                          <div className="p-2 bg-orange-500/20 rounded-full">
                            <Award className="h-4 w-4 text-orange-400" />
                          </div>
                          <span className="text-sm">Institution types (Govt/Private)</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90">
                          <div className="p-2 bg-orange-500/20 rounded-full">
                            <TrendingUp className="h-4 w-4 text-orange-400" />
                          </div>
                          <span className="text-sm">Strategic course selection help</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90">
                          <div className="p-2 bg-orange-500/20 rounded-full">
                            <MapPin className="h-4 w-4 text-orange-400" />
                          </div>
                          <span className="text-sm">Career path guidance</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
