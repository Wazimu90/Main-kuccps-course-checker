"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight, MapPin, Building2, Award, Users, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { KmtcCourse } from "@/lib/kmtc-course-eligibility"
import PaymentWarningModal from "@/components/payment-warning-modal"

interface KmtcResultsPreviewProps {
  courses: KmtcCourse[]
  onProceed: () => void
}

export default function KmtcResultsPreview({ courses, onProceed }: KmtcResultsPreviewProps) {
  const [animatedCount, setAnimatedCount] = useState(0)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [topLocations, setTopLocations] = useState<Array<{ county: string; count: number }>>([])
  const [topInstitutions, setTopInstitutions] = useState<Array<{ institution: string; count: number }>>([])
  const [uniqueInstitutionsCount, setUniqueInstitutionsCount] = useState(0)
  const [uniqueCountiesCount, setUniqueCountiesCount] = useState(0)

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
    setUniqueCountiesCount(Object.keys(locationCounts).length)

    // Top institutions by course count
    const institutionCounts = courses.reduce(
      (acc, course) => {
        const institution = course.institution_name || course.institution || "Unknown"
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
    setUniqueInstitutionsCount(Object.keys(institutionCounts).length)
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
          <h1 className="text-4xl font-bold mb-4 text-light">
            Your KMTC Results Are Ready!
          </h1>
          <p className="text-lg text-white max-w-2xl mx-auto">
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
          <Card className="bg-surface/80 backdrop-blur-xl border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.25)] rounded-2xl">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Total Courses */}
                <div className="text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-4"
                  >
                    <Award className="w-10 h-10 text-accent" />
                  </motion.div>
                  <motion.div
                    key={animatedCount}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-4xl font-bold text-accent mb-2"
                  >
                    {animatedCount}
                  </motion.div>
                  <p className="text-white font-medium">Qualified Programmes</p>
                  <div className="mt-2">
                    <Badge variant="secondary">KMTC</Badge>
                  </div>
                </div>

                {/* Unique Institutions */}
                <div className="text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-4"
                  >
                    <Building2 className="w-10 h-10 text-accent" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="text-4xl font-bold text-accent mb-2"
                  >
                    {uniqueInstitutionsCount}
                  </motion.div>
                  <p className="text-white font-medium">KMTC Institutions</p>
                </div>

                {/* Unique Locations */}
                <div className="text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-4"
                  >
                    <MapPin className="w-10 h-10 text-accent" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                    className="text-4xl font-bold text-accent mb-2"
                  >
                    {uniqueCountiesCount}
                  </motion.div>
                  <p className="text-white font-medium">Counties Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Counties centered */}
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full max-w-2xl"
          >
            <Card className="bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.25)]">
              <CardHeader className="text-center">
                <CardTitle className="inline-flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  Top Counties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topLocations.map((location, index) => (
                    <motion.div
                      key={location.county}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-surface/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-accent">#{index + 1}</span>
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
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-center"
        >
          <Card className="bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.25)]">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-4">Ready to Explore Your Options?</h3>
              <p className="text-white mb-6 max-w-2xl mx-auto">
                Get detailed information about each programme, including requirements, duration, and career prospects.
                Complete your payment to access the full results.
              </p>

              {/* CTA Section */}
              <div className="text-center">
                <Button
                  onClick={() => setShowPaymentModal(true)}
                  size="lg"
                  className="premium-btn w-full sm:w-auto max-w-full px-4 sm:px-8 md:px-12 py-3 sm:py-5 md:py-6 text-base sm:text-lg md:text-xl font-semibold mb-6 whitespace-normal break-words leading-tight"
                >
                  View Your {courses.length} Courses
                  <ArrowRight className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                  <div className="flex items-center gap-3 text-dim">
                    <div className="p-2 bg-accent/10 rounded-full">
                      <Award className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-sm">Full detailed PDF for every qualified course</span>
                  </div>
                  <div className="flex items-center gap-3 text-dim">
                    <div className="p-2 bg-accent/10 rounded-full">
                      <Users className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-sm">Access to AI Chatbot</span>
                  </div>
                  <div className="flex items-center gap-3 text-dim">
                    <div className="p-2 bg-accent/10 rounded-full">
                      <Building2 className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-sm">Direct institution links</span>
                  </div>
                  <div className="flex items-center gap-3 text-dim">
                    <div className="p-2 bg-accent/10 rounded-full">
                      <Award className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-sm">Institution types (Govt/Private)</span>
                  </div>
                  <div className="flex items-center gap-3 text-dim">
                    <div className="p-2 bg-accent/10 rounded-full">
                      <TrendingUp className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-sm">Strategic course selection help</span>
                  </div>
                  <div className="flex items-center gap-3 text-dim">
                    <div className="p-2 bg-accent/10 rounded-full">
                      <MapPin className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-sm">Career path guidance</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Payment Warning Modal */}
      <PaymentWarningModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        onProceed={onProceed}
        courseCount={courses.length}
      />
    </div>
  )
}
