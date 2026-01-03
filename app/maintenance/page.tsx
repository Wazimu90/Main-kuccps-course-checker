"use client"

import { motion } from "framer-motion"
import { Construction, Coffee, Sparkles } from "lucide-react"

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 px-4 text-center text-white overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-2xl mx-auto"
      >
        <div className="mb-8 flex justify-center gap-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
          >
            <Construction className="h-10 w-10 text-yellow-400" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1 }}
            className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
          >
            <Coffee className="h-10 w-10 text-orange-400" />
          </motion.div>
        </div>

        <h1 className="mb-6 text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white/80">
          Polishing the Pixels
        </h1>
        
        <div className="space-y-4 text-lg text-slate-300 mb-10">
          <p>
            Our code monkeys are working hard behind the scenes! 🐒
          </p>
          <p>
            We're currently giving the system a spa day to make it faster, shinier, and more awesome for you. 
            Grab a coffee, take a deep breath, and we'll be back before you can say "Cluster Points".
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-400"
        >
          <Sparkles className="h-4 w-4 text-yellow-300" />
          <span>Estimated return: Soon™</span>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-8 text-sm text-slate-500">
        &copy; {new Date().getFullYear()} KUCCPS Course Checker • Making things better
      </div>
    </div>
  )
}
