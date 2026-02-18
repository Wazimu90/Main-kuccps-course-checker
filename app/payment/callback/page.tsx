"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

type VerifyState = "verifying" | "success" | "failed" | "error"

export default function PaymentCallbackPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const reference = searchParams.get("reference") || searchParams.get("trxref") || ""
    const [state, setState] = useState<VerifyState>("verifying")
    const [errorMessage, setErrorMessage] = useState("")
    const hasVerified = useRef(false)

    const verifyPayment = useCallback(async () => {
        if (!reference) {
            setState("error")
            setErrorMessage("No payment reference found")
            return
        }

        try {
            const res = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`)
            const data = await res.json()

            if (data.verified && data.status === "success") {
                setState("success")

                // Save payment info to localStorage (same as old M-Pesa flow)
                try {
                    localStorage.setItem("paymentVerified", "true")
                    localStorage.setItem("paymentReference", reference)
                    if (data.email) localStorage.setItem("userEmail", data.email)
                    if (data.resultId) localStorage.setItem("resultId", data.resultId)
                } catch { }

                // Set cookies (same as old flow)
                try {
                    const maxAge = 30 * 24 * 60 * 60 // 30 days
                    document.cookie = `payment_verified=true; path=/; max-age=${maxAge}`
                    if (data.email) document.cookie = `user_email=${encodeURIComponent(data.email)}; path=/; max-age=${maxAge}`
                    if (data.resultId) document.cookie = `result_id=${encodeURIComponent(data.resultId)}; path=/; max-age=${maxAge}`
                } catch { }

                // Also call /api/payments to record the full payment (same as old flow)
                try {
                    const paymentInfo = localStorage.getItem("pendingPaymentInfo")
                    if (paymentInfo) {
                        const info = JSON.parse(paymentInfo)
                        await fetch("/api/payments", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                name: info.name || "",
                                email: data.email || info.email || "",
                                phone_number: info.phone || "",
                                amount: info.amount || data.amount || 200,
                                transaction_id: reference,
                                payment_method: "paystack",
                                result_id: data.resultId || info.resultId || "",
                                course_category: info.courseCategory || "",
                            }),
                        })
                        localStorage.removeItem("pendingPaymentInfo")
                    }
                } catch (e) {
                    console.error("Failed to record payment details:", e)
                }

                // Redirect to results after 2.5 seconds
                setTimeout(() => {
                    router.push("/results")
                }, 2500)
            } else if (data.status === "failed" || data.status === "abandoned") {
                setState("failed")
                setErrorMessage("Payment was not completed. Please try again.")
            } else {
                // Still pending — try again after a delay
                setState("verifying")
                setTimeout(verifyPayment, 3000)
            }
        } catch (err: any) {
            setState("error")
            setErrorMessage(err.message || "An error occurred while verifying your payment")
        }
    }, [reference, router])

    useEffect(() => {
        if (!hasVerified.current) {
            hasVerified.current = true
            verifyPayment()
        }
    }, [verifyPayment])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="rounded-2xl border border-white/10 bg-slate-800/80 backdrop-blur-lg p-8 text-center">
                    {state === "verifying" && (
                        <div className="space-y-4">
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500/20"
                            >
                                <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-white">Verifying Payment</h2>
                            <p className="text-slate-300">Please wait while we confirm your payment...</p>
                            <div className="flex items-center justify-center gap-2">
                                <div className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
                                <div className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" style={{ animationDelay: "0.2s" }} />
                                <div className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" style={{ animationDelay: "0.4s" }} />
                            </div>
                        </div>
                    )}

                    {state === "success" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4"
                        >
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
                                <CheckCircle className="h-10 w-10 text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
                            <p className="text-slate-300">Your payment has been verified. Redirecting to your results...</p>
                            <div className="mx-auto h-1 w-32 overflow-hidden rounded-full bg-slate-700">
                                <motion.div
                                    className="h-full bg-green-500"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 2.5 }}
                                />
                            </div>
                        </motion.div>
                    )}

                    {(state === "failed" || state === "error") && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4"
                        >
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
                                <XCircle className="h-10 w-10 text-red-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">
                                {state === "failed" ? "Payment Not Completed" : "Verification Error"}
                            </h2>
                            <p className="text-slate-300">{errorMessage}</p>
                            <div className="flex flex-col gap-2 pt-2">
                                <Button
                                    onClick={() => router.push("/payment")}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Try Again
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => router.push("/")}
                                    className="w-full text-slate-400 hover:text-white"
                                >
                                    Go Home
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </div>

                <p className="text-center text-xs text-slate-500 mt-4">
                    Reference: {reference || "N/A"}
                </p>
            </motion.div>
        </div>
    )
}
