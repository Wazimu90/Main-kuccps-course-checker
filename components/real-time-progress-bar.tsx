"use client"

import { motion } from "framer-motion"

interface RealTimeProgressBarProps {
  progress: number
  currentStep: number
  totalSteps: number
}

export default function RealTimeProgressBar({ progress, currentStep, totalSteps }: RealTimeProgressBarProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1)

  return (
    <div className="mb-10">
      {/* Progress percentage display */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm font-medium">
          <span className="text-primary">{progress}%</span> Complete
        </span>
      </div>

      {/* Main progress bar */}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/50 backdrop-blur-sm">
        <motion.div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary/80 to-primary"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />

        {/* Animated pulse effect */}
        {progress < 100 && (
          <motion.div
            className="absolute right-0 h-full w-4 bg-gradient-to-r from-transparent to-primary/20"
            initial={{ x: 0 }}
            animate={{ x: [0, 20, 0] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          />
        )}
      </div>

      {/* Step indicators */}
      <div className="mt-4 flex justify-between">
        {steps.map((step) => {
          const isCompleted = currentStep > step
          const isActive = currentStep === step

          return (
            <div key={step} className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: step * 0.1 }}
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : isActive
                      ? "border-2 border-primary bg-primary/10 text-primary"
                      : "border border-muted-foreground/30 bg-background text-muted-foreground"
                }`}
              >
                <span className="text-xs font-medium">{step}</span>
              </motion.div>

              <span className={`mt-1 text-xs ${isCompleted || isActive ? "text-foreground" : "text-muted-foreground"}`}>
                {step === 1 ? "Grades" : "Clusters"}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
