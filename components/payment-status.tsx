"use client"

import { motion } from "framer-motion"
import { CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaymentStatusProps {
  state: "initial" | "processing" | "success" | "failed"
  onRetry: () => void
  phone: string
}

export default function PaymentStatus({ state, onRetry, phone }: PaymentStatusProps) {
  const renderContent = () => {
    switch (state) {
      case "processing":
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
            >
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </motion.div>
            <h3 className="mb-2 text-xl font-semibold">Processing Payment</h3>
            <p className="mb-6 text-center text-white">
              We've sent an M-Pesa payment request to <span className="font-medium">{phone}</span>
            </p>
            <div className="space-y-4 text-center">
              <p className="text-sm">Please check your phone and enter your M-Pesa PIN to complete the payment</p>
              <div className="flex items-center justify-center space-x-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
                <div className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: "0.2s" }}></div>
                <div className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )

      case "success":
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
            >
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-500" />
            </motion.div>
            <h3 className="mb-2 text-xl font-semibold">Payment Successful!</h3>
            <p className="mb-6 text-center text-white">
              Your payment of KES 200 has been received. Thank you!
            </p>
            <p className="text-sm text-white">Redirecting to your results...</p>
            <div className="mt-4 flex items-center justify-center">
              <div className="h-1 w-32 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2 }}
                />
              </div>
            </div>
          </div>
        )

      case "failed":
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
            >
              <XCircle className="h-10 w-10 text-red-600 dark:text-red-500" />
            </motion.div>
            <h3 className="mb-2 text-xl font-semibold">Payment Failed</h3>
            <p className="mb-6 text-center text-white">
              We couldn't process your payment. This could be due to:
            </p>
            <ul className="mb-6 space-y-2 text-sm text-white">
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-500" />
                <span>Insufficient funds in your M-Pesa account</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-500" />
                <span>Incorrect phone number format</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-500" />
                <span>M-Pesa request timed out or was cancelled</span>
              </li>
            </ul>
            <Button onClick={onRetry} className="w-full">
              Try Again
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return <div className="w-full">{renderContent()}</div>
}
