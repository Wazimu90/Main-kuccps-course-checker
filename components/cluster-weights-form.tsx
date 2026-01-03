"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, Info, X, Lightbulb, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface ClusterWeightsFormProps {
  onSubmit: (data: any) => void
  onProgressUpdate?: (progress: number) => void
}

const clusters = [
  { id: 1, name: "Law" },
  { id: 2, name: "Business, Hospitality & Related" },
  { id: 3, name: "Social Sciences, Media, Fine Arts & Related" },
  { id: 4, name: "Geosciences & Related" },
  { id: 5, name: "Engineering & Related" },
  { id: 6, name: "Architecture & Related" },
  { id: 7, name: "Computing, IT & Related" },
  { id: 8, name: "Agribusiness & Related" },
  { id: 9, name: "General Sciences & Related" },
  { id: 10, name: "Actuarial Science & Related" },
  { id: 11, name: "Interior Design & Related" },
  { id: 12, name: "Sports Science & Related" },
  { id: 13, name: "Medicine, Health & Related" },
  { id: 14, name: "History & Archeology" },
  { id: 15, name: "Environmental Science & Related" },
  { id: 16, name: "Geography and Related" },
  { id: 17, name: "French and German" },
  { id: 18, name: "Music and Related" },
  { id: 19, name: "Education and Related" },
  { id: 20, name: "Religious Studies, Theology, Islamic Studies and Related" },
]

export default function ClusterWeightsForm({ onSubmit, onProgressUpdate }: ClusterWeightsFormProps) {
  const { toast } = useToast()
  const [weights, setWeights] = useState<Record<number, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showInstructions, setShowInstructions] = useState(true)
  const [isInstructionsCollapsed, setIsInstructionsCollapsed] = useState(false)

  // Check if user has seen instructions before
  useEffect(() => {
    const hasSeenInstructions = localStorage.getItem("hasSeenClusterInstructions")
    if (hasSeenInstructions) {
      setIsInstructionsCollapsed(true)
    }
  }, [])

  const handleWeightChange = (clusterId: number, value: string) => {
    // Only allow numbers and decimal point
    if (value === "" || /^\d{0,2}(\.\d{0,3})?$/.test(value)) {
      setWeights((prev) => ({
        ...prev,
        [clusterId]: value,
      }))

      // Clear error for this cluster if it exists
      if (errors[`cluster-${clusterId}`]) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[`cluster-${clusterId}`]
          return newErrors
        })
      }
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    let hasAtLeastOne = false

    // Check if at least one cluster weight is entered
    Object.entries(weights).forEach(([clusterId, value]) => {
      if (value && Number.parseFloat(value) > 0) {
        hasAtLeastOne = true
      }

      // Check if value is within range (max 48.000)
      if (value && Number.parseFloat(value) > 48) {
        newErrors[`cluster-${clusterId}`] = "Maximum value is 48.000"
      }
    })

    if (!hasAtLeastOne) {
      newErrors.general = "At least one cluster weight must be entered"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      // Convert string values to numbers
      const numericWeights = Object.entries(weights)
        .filter(([_, value]) => value && Number.parseFloat(value) > 0)
        .reduce(
          (acc, [key, value]) => ({
            ...acc,
            [key]: Number.parseFloat(value),
          }),
          {},
        )

      onSubmit(numericWeights)
    } else {
      // Show toast for validation errors
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form before proceeding.",
        variant: "destructive",
      })
    }
  }

  const handleDismissInstructions = () => {
    setShowInstructions(false)
    localStorage.setItem("hasSeenClusterInstructions", "true")
  }

  const toggleInstructions = () => {
    setIsInstructionsCollapsed(!isInstructionsCollapsed)
  }

  // Calculate form completion progress
  useEffect(() => {
    if (onProgressUpdate) {
      // We just need at least one valid cluster weight
      const hasValidWeight = Object.values(weights).some(
        (value) => value && Number.parseFloat(value) > 0 && Number.parseFloat(value) <= 48,
      )

      const progress = hasValidWeight ? 100 : 0
      onProgressUpdate(progress)
    }
  }, [weights, onProgressUpdate])

  const instructionSteps = [
    {
      step: 1,
      title: "Login to KUCCPS Student Portal",
      description: "Access your student account",
      link: "https://students.kuccps.net/",
      linkText: "Kuccps portal",
    },
    {
      step: 2,
      title: "Navigate to Dashboard",
      description: "On the Dashboard scroll to the Cluster weights section",
    },
    {
      step: 3,
      title: "Copy Your Values",
      description: "Copy your values and paste them into the form below",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Animated Instructions Section */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-md lg:max-w-2xl mx-auto"
          >
            <Card variant="outline" className="bg-blue-50/80 border-blue-200 shadow-lg backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatDelay: 3,
                      }}
                    >
                      <Lightbulb className="h-6 w-6 text-blue-600" />
                    </motion.div>
                    <CardTitle className="text-blue-900 text-lg font-semibold">
                      How to Get Your Cluster Weights
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleInstructions}
                      className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
                    >
                      {isInstructionsCollapsed ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronUp className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDismissInstructions}
                      className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <AnimatePresence>
                {!isInstructionsCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {instructionSteps.map((step, index) => (
                          <motion.div
                            key={step.step}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3"
                          >
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-blue-800 font-semibold min-w-[24px] h-6 flex items-center justify-center"
                            >
                              {step.step}
                            </Badge>
                            <div className="flex-1">
                              <h4 className="font-medium text-blue-900 mb-1">{step.title}</h4>
                              <p className="text-blue-700 text-sm mb-2">{step.description}</p>
                              {step.link && (
                                <a
                                  href={step.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-colors"
                                >
                                  {step.linkText}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing Cluster Weights Form */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Enter Your Cluster Weights</h2>
        <p className="mt-2 text-white">
          Enter your cluster weights for the degree programs
        </p>
      </div>

      {errors.general && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {clusters.map((cluster) => (
          <motion.div
            key={cluster.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: cluster.id * 0.03 }}
            className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {cluster.id}
                  </span>
                  <h3 className="font-medium">{cluster.name}</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-white" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-xs">
                          Enter your cluster weight for {cluster.name} programs. Format: 00.000 (max 48.000)
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {errors[`cluster-${cluster.id}`] && (
                  <p className="mt-1 text-xs text-destructive">{errors[`cluster-${cluster.id}`]}</p>
                )}
              </div>

              <div className="w-24">
                <Input
                  type="text"
                  placeholder="00.000"
                  value={weights[cluster.id] || ""}
                  onChange={(e) => handleWeightChange(cluster.id, e.target.value)}
                  className={`text-right ${errors[`cluster-${cluster.id}`] ? "border-destructive" : ""}`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button size="lg" className="rounded-full px-8" onClick={handleSubmit}>
          Get Your Courses
        </Button>
      </div>
    </div>
  )
}
