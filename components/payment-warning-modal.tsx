"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogOverlay,
} from "@/components/ui/dialog"
import { CheckCircle, ArrowRight } from "lucide-react"
import { log } from "@/lib/logger"

interface PaymentWarningModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onProceed: () => void
    courseCount: number
}

export default function PaymentWarningModal({
    open,
    onOpenChange,
    onProceed,
    courseCount,
}: PaymentWarningModalProps) {
    const [paymentAmount, setPaymentAmount] = useState<number>(200)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchPaymentAmount = async () => {
            try {
                setIsLoading(true)
                // Use the dedicated public settings endpoint with cache-busting
                const res = await fetch(`/api/settings?t=${Date.now()}`, {
                    cache: "no-store",
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                    }
                })
                if (res.ok) {
                    const data = await res.json()
                    // payment_amount is returned directly, not nested in settings
                    if (data?.payment_amount !== undefined && data?.payment_amount !== null) {
                        setPaymentAmount(Number(data.payment_amount))
                        log("modal:payment", "Payment amount loaded", "debug", { amount: data.payment_amount })
                    } else {
                        setPaymentAmount(200)
                    }
                } else {
                    setPaymentAmount(200)
                }
            } catch (e) {
                setPaymentAmount(200)
                log("modal:payment", "Error loading payment amount", "warn", e)
            } finally {
                setIsLoading(false)
            }
        }

        if (open) {
            fetchPaymentAmount()
        }
    }, [open])

    const handleProceed = () => {
        log("modal:payment", "User proceeded to payment", "info", { courseCount, amount: paymentAmount })
        onOpenChange(false)
        onProceed()
    }

    const handleCancel = () => {
        log("modal:payment", "User cancelled payment modal", "info", { courseCount })
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogOverlay className="bg-black/80 backdrop-blur-sm" />
            <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto p-0 bg-slate-900 border-2 border-purple-500/40 shadow-2xl">
                <div className="p-6 sm:p-8">
                    <DialogHeader className="space-y-4">
                        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                            <CheckCircle className="h-10 w-10 text-white" />
                        </div>
                        <DialogTitle className="text-2xl sm:text-3xl font-bold text-center text-white">
                            {courseCount} Courses Found!
                        </DialogTitle>
                        <DialogDescription className="text-center text-base sm:text-lg text-gray-300">
                            We've saved you ~3 hours of searching
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-6 space-y-4">
                        {/* What You Get */}
                        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                            <h4 className="font-semibold text-white mb-3 text-sm">What's included:</h4>
                            <div className="space-y-2">
                                {[
                                    "Complete course list with details",
                                    "PDF reports for each course",
                                    "Institution info & websites",
                                    "AI guidance chatbot access"
                                ].map((benefit, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-gray-300">
                                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Amount */}
                        <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-2 border-purple-500/50 rounded-xl p-5 text-center">
                            <p className="text-gray-300 text-sm mb-1">One-time payment</p>
                            <p className="text-4xl sm:text-5xl font-bold text-white">
                                KES {isLoading ? "..." : paymentAmount}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Via M-Pesa</p>
                        </div>

                        {/* Main CTA */}
                        <Button
                            onClick={handleProceed}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-6 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                        >
                            Proceed to Payment
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>

                        {/* Maybe Later Link */}
                        <button
                            onClick={handleCancel}
                            className="w-full text-center text-sm text-gray-400 hover:text-gray-300 transition-colors py-2"
                        >
                            Maybe later
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
