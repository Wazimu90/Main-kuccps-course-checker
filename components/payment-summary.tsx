"use client"

import { motion } from "framer-motion"
import { FileText, CheckCircle, Download } from "lucide-react"

export default function PaymentSummary() {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-5">
      <div className="mb-4 flex justify-between">
        <h3 className="text-lg font-semibold">Payment Summary</h3>
        <span className="font-bold text-primary">KES 200</span>
      </div>

      <div className="space-y-3">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-start gap-3"
        >
          <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <p className="font-medium">Complete Course List</p>
            <p className="text-sm text-muted-foreground">All courses you qualify for based on your grades</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-start gap-3"
        >
          <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <p className="font-medium">Cluster Point Analysis</p>
            <p className="text-sm text-muted-foreground">See how your points match with course requirements</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex items-start gap-3"
        >
          <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
            <Download className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <p className="font-medium">Downloadable PDF Report</p>
            <p className="text-sm text-muted-foreground">Save and share your personalized course report</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
