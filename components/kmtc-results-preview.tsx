"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight, MapPin, Building2, Award, Users, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { KmtcCourse } from "@/lib/kmtc-course-eligibility"

interface KmtcResultsPreviewProps {
  courses: KmtcCourse[]
  onProceed: () => void
}

export default function KmtcResultsPreview({ courses, onProceed }: KmtcResultsPreviewProps) {
  const [animatedCount, setAnimatedCount] = useState(0)
  const [topLocations, setTopLocations] = useState<Array<{ county: string; count: number }>>([])
  const [topInstitutions, setTopInstitutions] = useState<Array<{ institution: string; count: number }>>([])

  // Animate the course count
  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = courses.length / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= courses.length) {
        setAnimatedCount(courses.length)
        clearInterval(timer)
      } else {
        setAnimatedCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [courses.length])

  // Calculate top locations and institutions
  useEffect(() => {
    // Top locations by course count
    const locationCounts = courses.reduce(
      (acc, course) => {
        const county = course.county || "Unknown"
        acc[county] = (acc[county] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const sortedLocations = Object.entries(locationCounts)
      .map(([county, count]) => ({ county, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)

    setTopLocations(sortedLocations)

    // Top institutions by course count
    const institutionCounts = courses.reduce(
      (acc, course) => {
        const institution = course.institution || "Unknown"
        acc[institution] = (acc[institution] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const sortedInstitutions = Object.entries(institutionCounts)
      .map(([institution, count]) => ({ institution, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)

    setTopInstitutions(sortedInstitutions)
  }, [courses])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Your KMTC Results Are Ready!
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {
              "We've analyzed your grades and found all the KMTC programmes you qualify for. Here's your personalized summary."
            }
          </p>
        </motion.div>

        {/* Main Results Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="backdrop-blur-sm bg-gradient-to-br from-card/80 to-card/60 border border-border/50 shadow-xl">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Total Courses */}
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4, type: "spring", bounce: 0.4 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4"
                  >
                    <Award className="w-10 h-10 text-primary" />
                  </motion.div>
                  <motion.div
                    key={animatedCount}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-4xl font-bold text-primary mb-2"
                  >
                    {animatedCount}
                  </motion.div>
                  <p className="text-muted-foreground font-medium">Qualified KMTC Programmes</p>
                </div>

                {/* Unique Institutions */}
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.6, type: "spring", bounce: 0.4 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/10 mb-4"
                  >
                    <Building2 className="w-10 h-10 text-blue-500" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="text-4xl font-bold text-blue-500 mb-2"
                  >
                    {topInstitutions.length}
                  </motion.div>
                  <p className="text-muted-foreground font-medium">KMTC Institutions</p>
                </div>

                {/* Unique Locations */}
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.8, type: "spring", bounce: 0.4 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-4"
                  >
                    <MapPin className="w-10 h-10 text-green-500" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                    className="text-4xl font-bold text-green-500 mb-2"
                  >
                    {topLocations.length}
                  </motion.div>
                  <p className="text-muted-foreground font-medium">Counties Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Locations and Institutions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Locations */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="backdrop-blur-sm bg-card/80 border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Top Counties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topLocations.map((location, index) => (
                    <motion.div
                      key={location.county}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-green-500">#{index + 1}</span>
                        </div>
                        <span className="font-medium">{location.county}</span>
                      </div>
                      <Badge variant="secondary">{location.count} programmes</Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Institutions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="backdrop-blur-sm bg-card/80 border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Top Institutions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topInstitutions.map((institution, index) => (
                    <motion.div
                      key={institution.institution}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-500">#{index + 1}</span>
                        </div>
                        <span className="font-medium text-sm">
                          {institution.institution || institution.institution_name}
                        </span>
                      </div>
                      <Badge variant="secondary">{institution.count} programmes</Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-center"
        >
          <Card className="backdrop-blur-sm bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-4">Ready to Explore Your Options?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Get detailed information about each programme, including requirements, duration, and career prospects.
                Complete your payment to access the full results.
              </p>

              {/* CTA Section */}
              <div className="text-center">
                <Button
                  onClick={() => (window.location.href = "/payment")}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold mb-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  View All Courses & PDF Download
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="p-2 bg-blue-500/20 rounded-full">
                      <Award className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-sm">Full detailed PDF for every qualified course</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="p-2 bg-blue-500/20 rounded-full">
                      <Users className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-sm">Access to AI Chatbot</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="p-2 bg-blue-500/20 rounded-full">
                      <Building2 className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-sm">Direct institution links</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="p-2 bg-blue-500/20 rounded-full">
                      <Award className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-sm">Institution types (Govt/Private)</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="p-2 bg-blue-500/20 rounded-full">
                      <TrendingUp className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-sm">Strategic course selection help</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="p-2 bg-blue-500/20 rounded-full">
                      <MapPin className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-sm">Career path guidance</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
