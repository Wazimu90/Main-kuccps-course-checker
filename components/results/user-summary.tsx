"use client"

import { motion } from "framer-motion"
import { User, Mail, Phone, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PaymentInfo {
  name: string
  email: string
  phone: string
  amount: number
  reference: string
  timestamp: string
}

interface UserSummaryProps {
  paymentInfo: PaymentInfo | null
}

export default function UserSummary({ paymentInfo }: UserSummaryProps) {
  if (!paymentInfo) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-white shadow-md rounded-xl">
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="bg-white shadow-md rounded-xl">
        <CardContent className="p-6 bg-[#F8FAFC] text-light dark:bg-gray-800 dark:text-light">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-light">Student Information</h2>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              ✓ Payment Verified
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-light">Full Name</p>
                <p className="font-semibold text-light">{paymentInfo.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-light">Email Address</p>
                <p className="font-semibold text-sm text-light">{paymentInfo.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-light">Phone Number</p>
                <p className="font-semibold text-light">{paymentInfo.phone}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/20">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-light" />
                <span className="text-light">
                  Results generated on {new Date(paymentInfo.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
