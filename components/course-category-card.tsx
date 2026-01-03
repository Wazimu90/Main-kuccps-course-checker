"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"

interface CourseCategoryCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  onClick?: () => void
  delay?: number
  colorScheme?: string
}

const colorSchemes = {
  purple: {
    bg: "from-purple-500/20 to-purple-600/20",
    border: "border-purple-500/30",
    icon: "from-purple-500 to-purple-600",
    hover: "hover:from-purple-500/30 hover:to-purple-600/30",
  },
  blue: {
    bg: "from-blue-500/20 to-blue-600/20",
    border: "border-blue-500/30",
    icon: "from-blue-500 to-blue-600",
    hover: "hover:from-blue-500/30 hover:to-blue-600/30",
  },
  green: {
    bg: "from-green-500/20 to-green-600/20",
    border: "border-green-500/30",
    icon: "from-green-500 to-green-600",
    hover: "hover:from-green-500/30 hover:to-green-600/30",
  },
  orange: {
    bg: "from-orange-500/20 to-orange-600/20",
    border: "border-orange-500/30",
    icon: "from-orange-500 to-orange-600",
    hover: "hover:from-orange-500/30 hover:to-orange-600/30",
  },
  pink: {
    bg: "from-pink-500/20 to-pink-600/20",
    border: "border-pink-500/30",
    icon: "from-pink-500 to-pink-600",
    hover: "hover:from-pink-500/30 hover:to-pink-600/30",
  },
  indigo: {
    bg: "from-indigo-500/20 to-indigo-600/20",
    border: "border-indigo-500/30",
    icon: "from-indigo-500 to-indigo-600",
    hover: "hover:from-indigo-500/30 hover:to-indigo-600/30",
  },
  teal: {
    bg: "from-teal-500/20 to-teal-600/20",
    border: "border-teal-500/30",
    icon: "from-teal-500 to-teal-600",
    hover: "hover:from-teal-500/30 hover:to-teal-600/30",
  },
}

export default function CourseCategoryCard({
  title,
  description,
  icon: Icon,
  href,
  onClick,
  delay = 0,
  colorScheme = "purple",
}: CourseCategoryCardProps) {
  const colors = colorSchemes[colorScheme as keyof typeof colorSchemes] || colorSchemes.purple

  const CardContent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group h-full"
    >
      <div
        className={`h-full rounded-2xl bg-gradient-to-br ${colors.bg} ${colors.hover} backdrop-blur-sm p-6 shadow-lg border ${colors.border} hover:shadow-2xl transition-all duration-300 cursor-pointer`}
      >
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colors.icon} text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-light group-hover:text-light transition-colors">{title}</h3>
        <p className="text-light group-hover:text-light transition-colors leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )

  if (onClick) {
    return <div onClick={onClick}>{CardContent}</div>
  }

  return <Link href={href}>{CardContent}</Link>
}
