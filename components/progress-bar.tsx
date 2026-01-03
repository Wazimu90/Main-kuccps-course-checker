"use client"

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1)

  return (
    <div className="relative">
      <div className="absolute top-1/2 left-0 h-1 w-full -translate-y-1/2 bg-muted"></div>

      <div className="relative flex justify-between">
        {steps.map((step) => {
          const isCompleted = currentStep > step
          const isActive = currentStep === step

          return (
            <motion.div
              key={step}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: step * 0.1 }}
              className="relative z-10 flex flex-col items-center"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : isActive
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-white/30 bg-background text-white"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{step}</span>
                )}
              </div>

              <span
                className={`mt-2 text-xs font-medium ${
                  isCompleted || isActive ? "text-foreground" : "text-white"
                }`}
              >
                {step === 1 ? "Subject Grades" : "Cluster Weights"}
              </span>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        className="absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-primary"
        initial={{ width: "0%" }}
        animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  )
}
