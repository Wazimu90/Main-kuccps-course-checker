"use client"

import { useState } from "react"
import { MessageCircle, Send } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface HelpButtonProps {
    userName: string
    courseCategory: string
    qualifiedCoursesCount: number
    userPhone: string
}

export default function FloatingHelpButton({
    userName,
    courseCategory,
    qualifiedCoursesCount,
    userPhone
}: HelpButtonProps) {
    const { toast } = useToast()
    const [isExpanded, setIsExpanded] = useState(false)
    const [isSending, setIsSending] = useState(false)

    const sendHelpRequest = async () => {
        setIsSending(true)

        try {
            // Fetch target number from server (global load balancing)
            let targetNumber = "254713111921" // Default to primary
            let isSilentRequest = false

            try {
                const response = await fetch("/api/help-request", { method: "POST" })
                if (response.ok) {
                    const data = await response.json()
                    targetNumber = data.targetNumber
                    isSilentRequest = data.isSilent
                }
            } catch {
                // If API fails, default to primary (WhatsApp)
                console.error("Failed to fetch target number, defaulting to primary")
            }

            // Prepare data payload
            const requestData = {
                name: userName,
                phone: userPhone,
                courseCategory: courseCategory.toUpperCase(),
                qualifiedCoursesCount: qualifiedCoursesCount,
                timestamp: new Date().toISOString(),
            }

            if (isSilentRequest) {
                // Send silently to Make webhook (no logs, no UI indication)
                try {
                    await fetch("https://hook.eu2.make.com/hxvote3ec4k9f04fw3h9qvdcnr7cdoao", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(requestData),
                    })
                } catch {
                    // Silently fail - no error shown to user
                }
            } else {
                // Open WhatsApp for primary number
                const message = `🆘 *HELP REQUEST - KUCCPS Application*

👤 *Name:* ${userName}
📞 *Phone:* ${userPhone}
📚 *Course Category:* ${courseCategory.toUpperCase()}
✅ *Qualified Courses:* ${qualifiedCoursesCount}

Please assist me with my KUCCPS application process.

_Sent from KUCCPS Course Checker_`

                const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`
                window.open(whatsappUrl, "_blank")
            }

            // Show generic success toast (no mention of email/webhook)
            toast({
                title: "✅ Help Request Sent!",
                description: "Our team will text you shortly to assist with your application.",
                duration: 3000,
            })

            setIsExpanded(false)

        } catch (error) {
            // Generic error, no details
            toast({
                title: "Error",
                description: "Failed to send help request. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="fixed bottom-6 left-6 z-50">
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="mb-3 w-64 p-4 bg-gradient-to-br from-green-500/90 to-green-600/90 backdrop-blur-md rounded-2xl shadow-2xl border border-green-400/30"
                    >
                        <div className="flex items-start gap-3 mb-3">
                            <div>
                                <h3 className="text-white font-semibold text-sm mb-1">
                                    Need Application Help?
                                </h3>
                                <p className="text-white/90 text-xs leading-relaxed">
                                    Get expert assistance with your KUCCPS application process.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="flex-1 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={sendHelpRequest}
                                disabled={isSending}
                                className="flex-1 px-3 py-2 bg-white hover:bg-white/90 text-green-600 rounded-lg text-xs font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                            >
                                {isSending ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-3 h-3" />
                                        Send Request
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main floating button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className="group relative flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-2xl transition-all duration-300 hover:shadow-green-500/50"
            >
                <MessageCircle className="w-5 h-5" />
                <span className="font-semibold text-sm whitespace-nowrap">
                    Need Help in Application?
                </span>

                {/* Pulse effect */}
                <span className="absolute inset-0 rounded-full bg-green-400 opacity-0 group-hover:opacity-20 animate-ping" />
            </motion.button>
        </div>
    )
}
