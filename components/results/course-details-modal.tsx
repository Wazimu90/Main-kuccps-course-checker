"use client"
import { ExternalLink, Building2, Clock, Hash, MapPin, Users, Globe, GraduationCap, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Course {
  programme_name: string
  programme_code: string
  institution_name?: string
  campus?: string
  type?: string
  location?: string
  cutoff?: number
  cluster?: number
  duration?: string
  institution_type?: string
  course_name?: string
}

interface CourseDetailsModalProps {
  course: Course | null
  isOpen: boolean
  onClose: () => void
}

export default function CourseDetailsModal({ course, isOpen, onClose }: CourseDetailsModalProps) {
  if (!course) return null

  const institutionName = course.institution_name || course.campus || "Unknown Institution"
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(institutionName + " official website")}`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <GraduationCap className="h-6 w-6 text-primary" />
            Course Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Course Header */}
          <Card className="border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-primary">{course.programme_name || course.course_name}</CardTitle>
            </CardHeader>
          </Card>

          {/* Institution Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5" />
                Institution Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-white">Institution Name</label>
                  <p className="text-sm font-semibold">{institutionName}</p>
                </div>

                {course.institution_type && (
                  <div>
                    <label className="text-sm font-medium text-white">Institution Type</label>
                    <Badge variant="outline" className="ml-2">
                      {course.institution_type}
                    </Badge>
                  </div>
                )}

                {course.location && (
                  <div>
                    <label className="text-sm font-medium text-white">Location</label>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-white" />
                      <p className="text-sm">{course.location}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-white">Official Website</label>
                  <Button variant="outline" size="sm" className="ml-2 h-8 bg-transparent" asChild>
                    <a
                      href={googleSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <Globe className="h-3 w-3" />
                      Find Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5" />
                Course Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-white">Programme Code</label>
                  <div className="flex items-center gap-1">
                    <Hash className="h-4 w-4 text-white" />
                    <p className="text-sm font-semibold">{course.programme_code}</p>
                  </div>
                </div>

                {course.cutoff && (
                  <div>
                    <label className="text-sm font-medium text-white">Cutoff Points</label>
                    <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200">
                      {course.cutoff.toFixed(3)} points
                    </Badge>
                  </div>
                )}

                {course.cluster && (
                  <div>
                    <label className="text-sm font-medium text-white">Cluster</label>
                    <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                      <Users className="h-3 w-3 mr-1" />
                      Cluster {course.cluster}
                    </Badge>
                  </div>
                )}

                {course.duration && (
                  <div>
                    <label className="text-sm font-medium text-white">Duration</label>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-white" />
                      <p className="text-sm font-semibold">{course.duration}</p>
                    </div>
                  </div>
                )}

                {course.type && (
                  <div>
                    <label className="text-sm font-medium text-white">Course Type</label>
                    <Badge variant="outline" className="ml-2">
                      {course.type}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Qualification Status */}
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  ✓ You qualify for this course based on your KCSE results
                </span>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1" asChild>
              <a
                href="https://students.kuccps.net"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Apply on KUCCPS Portal
              </a>
            </Button>

            <Button variant="outline" className="flex-1 bg-transparent" asChild>
              <a
                href={googleSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <Globe className="h-4 w-4" />
                Learn More About Institution
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
