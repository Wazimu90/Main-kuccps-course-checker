"use client"

import { motion } from "framer-motion"
import { Quote } from "lucide-react"

interface TestimonialCardProps {
  name: string
  text: string
  delay?: number
}

export default function TestimonialCard({ name, text, delay = 0 }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className="rounded-2xl bg-card p-6 shadow-sm border border-border"
    >
      <Quote className="mb-4 h-6 w-6 text-primary" />
      <p className="mb-4 text-muted-foreground">{text}</p>
      <p className="font-semibold">{name}</p>
    </motion.div>
  )
}
