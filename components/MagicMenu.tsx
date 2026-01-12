"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GraduationCap, Award, BookOpen, Stethoscope, Hammer, Briefcase, X, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

interface MenuItem {
  name: string
  icon: React.ElementType
  path: string
}

const menuItems: MenuItem[] = [
  { name: "Degree", icon: GraduationCap, path: "/degree" },
  { name: "Diploma", icon: Award, path: "/diploma" },
  { name: "Certificate", icon: BookOpen, path: "/certificate" },
  { name: "KMTC", icon: Stethoscope, path: "/kmtc" },
  { name: "Artisan", icon: Hammer, path: "/artisan" },
  { name: "Short Courses", icon: Briefcase, path: "/learn-skills" },
]

const MagicMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsOpen(false)
  }

  return (
    <div className="relative flex flex-col items-center justify-end">
      <AnimatePresence>
        {isOpen && (
          <div className="absolute bottom-full mb-6 flex flex-col-reverse md:flex-row md:flex-wrap items-center justify-center gap-3 w-max left-1/2 -translate-x-1/2 z-40">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.name}
                initial={{ opacity: 0, y: 20, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20, delay: index * 0.05 } }}
                exit={{ opacity: 0, y: 20, scale: 0.5, transition: { duration: 0.2, delay: (menuItems.length - 1 - index) * 0.03 } }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavigation(item.path)}
                className="group relative flex items-center justify-between w-full md:w-auto md:min-w-[140px] pl-3 pr-4 py-2 rounded-xl backdrop-blur-md bg-accent/10 border border-white/5 hover:bg-accent/15 transition-colors shadow-glow hover:shadow-premium whitespace-nowrap"
              >
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 rounded-r-full bg-accent" />
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent text-dark shadow-inner">
                    <item.icon size={18} />
                  </div>
                  <span className="text-light font-medium text-sm tracking-wide">{item.name}</span>
                </div>
                <motion.div initial={{ opacity: 0, x: -5 }} whileHover={{ opacity: 1, x: 0 }} className="ml-4 text-light/70">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </motion.div>
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.button
        layout
        onClick={toggleMenu}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative z-50 flex items-center gap-2 px-6 py-3 rounded-full premium-btn border border-white/5 text-light font-semibold tracking-wider uppercase text-sm overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-light/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
        <div className="relative flex items-center gap-2">
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <X size={20} className="text-white" />
              </motion.div>
            ) : (
              <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Sparkles size={20} className="text-white" />
              </motion.div>
            )}
          </AnimatePresence>
          <span className="text-white">{isOpen ? "Close" : "Check courses"}</span>
        </div>
      </motion.button>
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}

export default MagicMenu
