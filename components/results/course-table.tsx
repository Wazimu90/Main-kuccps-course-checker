"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ExternalLink, MapPin, Building2, Users, Clock, GraduationCap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import CourseDetailsModal from "./course-details-modal"

interface Course {
  programme_name: string
  programme_code: string
  institution_name?: string
  institution?: string
  campus?: string
  type?: string
  location?: string
  county?: string
  cutoff?: number
  cluster?: number
  duration?: string
  institution_type?: string
  course_name?: string
}

interface CourseTableProps {
  courses: Course[]
  category: string
  isLoading: boolean
}

export default function CourseTable({ courses, category, isLoading }: CourseTableProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const handleCourseClick = (course: Course) => {
    const normalizedCourse = {
      ...course,
      institution_name: course.institution || course.institution_name,
    }
    setSelectedCourse(normalizedCourse)
    setShowDetailsModal(true)
  }

  const handleCloseModal = () => {
    setShowDetailsModal(false)
    setSelectedCourse(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="text-white">
            <Building2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Courses Found</h3>
            <p>No {category} courses match your current filters and qualifications.</p>
            <p className="text-sm mt-2">Try adjusting your search criteria or filters.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {courses.map((course, index) => (
          <motion.div
            key={`${course.programme_code}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onHoverStart={() => setHoveredIndex(index)}
            onHoverEnd={() => setHoveredIndex(null)}
          >
            <Card
              className={`transition-all duration-200 hover:shadow-lg rounded-xl shadow-sm cursor-pointer ${
                index % 2 === 0 ? "bg-slate-50/50 dark:bg-slate-800/50" : "bg-white dark:bg-slate-900"
              } ${hoveredIndex === index ? "scale-[1.02] shadow-xl" : ""}`}
              onClick={() => handleCourseClick(course)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4">
                  {/* Course Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      {/* Programme Name */}
                      <h3 className="text-xl font-bold text-light mb-2 leading-tight">
                        {course.programme_name || course.course_name}
                      </h3>

                      {/* Institution Name */}
                      {(course.institution_name || course.institution) && (
                        <h4 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mb-3">
                          {course.institution_name || course.institution}
                        </h4>
                      )}

                      {/* Programme Code, Institution Type, and County */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-light mb-3">
                        {/* Programme Code */}
                        <div className="flex items-center gap-1">
                          <span className="text-white">Code:</span>
                          <span className="font-mono text-primary font-semibold bg-primary/10 px-2 py-1 rounded">
                            {course.programme_code}
                          </span>
                        </div>

                        {/* Institution Type */}
                        {course.institution_type && (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300"
                          >
                            <Building2 className="h-3 w-3 mr-1" />
                            {course.institution_type}
                          </Badge>
                        )}

                        {/* County/Location */}
                        {(course.location || course.county) && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{course.location || course.county}</span>
                          </div>
                        )}

                        {/* Campus if available */}
                        {course.campus && (
                          <div className="flex items-center gap-1 text-white">
                            <span>Campus: {course.campus}</span>
                          </div>
                        )}
                      </div>

                      {/* Additional Details */}
                      {(course.cluster || course.type || course.duration) && (
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          {course.cluster && (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 px-3 py-1 rounded-full"
                            >
                              <Users className="h-3 w-3 mr-1" />
                              Cluster {course.cluster}
                            </Badge>
                          )}

                          {course.type && (
                            <Badge variant="outline" className="px-3 py-1 rounded-full">
                              {course.type}
                            </Badge>
                          )}

                          {course.duration && (
                            <div className="flex items-center gap-1 text-white">
                              <Clock className="h-3 w-3" />
                              <span className="text-xs">{course.duration}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full font-medium"
                      >
                        ✓ Qualified
                      </Badge>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-between items-center pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 text-primary hover:text-primary-foreground hover:bg-primary"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCourseClick(course)
                      }}
                    >
                      <GraduationCap className="h-4 w-4" />
                      View Details
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 bg-transparent"
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a
                        href="https://students.kuccps.net"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Apply on KUCCPS
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Course Details Modal */}
      <CourseDetailsModal course={selectedCourse} isOpen={showDetailsModal} onClose={handleCloseModal} />
    </>
  )
}
