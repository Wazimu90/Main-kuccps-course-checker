"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

interface HowItWorksStepProps {
  step: number
  title: string
  description: string
  icon: LucideIcon
  delay?: number
}

export default function HowItWorksStep({ step, title, description, icon: Icon, delay = 0 }: HowItWorksStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className="flex flex-col items-center text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-8 w-8" />
      </div>
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <span className="text-lg font-bold">{step}</span>
      </div>
      <h3 className="mb-2 mt-4 text-xl font-semibold">{title}</h3>
      <p className="text-white">{description}</p>
    </motion.div>
  )
}
