"use client"

import { useState } from "react"
import { Sparkles, ExternalLink, X, MessageSquare, LogIn } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const CHATGPT_URL = "https://chatgpt.com/g/g-697a18934aac8191a33c3c51e8a9b52b-kuccps-course-checker-assistant"

export default function FloatingAIAssistant() {
    const [isExpanded, setIsExpanded] = useState(false)

    const openChatGPT = () => {
        // Open ChatGPT in a new popup window
        const width = 420
        const height = 700
        const left = window.screenX + (window.outerWidth - width) / 2
        const top = window.screenY + (window.outerHeight - height) / 2

        window.open(
            CHATGPT_URL,
            "KUCCPS AI Assistant",
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        )
        setIsExpanded(false)
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="mb-3 w-80 p-5 bg-gradient-to-br from-purple-600/95 to-indigo-700/95 backdrop-blur-md rounded-2xl shadow-2xl border border-purple-400/30"
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/20 transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4 text-white/80" />
                        </button>

                        {/* Header */}
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-white/20">
                                <Sparkles className="w-6 h-6 text-yellow-300" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg mb-1">
                                    AI Course Assistant
                                </h3>
                                <p className="text-white/80 text-sm leading-relaxed">
                                    Get instant answers about KUCCPS courses, cluster points, and applications.
                                </p>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-white/10 rounded-xl p-3 mb-4 space-y-2">
                            <h4 className="text-white/90 font-semibold text-sm flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                How to Use
                            </h4>
                            <ul className="text-white/80 text-xs space-y-1.5 list-disc pl-4">
                                <li>Click the button below to open our AI assistant</li>
                                <li>Ask any question about courses, grades, or applications</li>
                                <li>Get personalized guidance based on our website data</li>
                            </ul>
                        </div>

                        {/* ChatGPT Account Notice */}
                        <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-3 mb-4">
                            <div className="flex items-start gap-2">
                                <LogIn className="w-4 h-4 text-yellow-300 mt-0.5 flex-shrink-0" />
                                <p className="text-white/90 text-xs">
                                    <span className="font-semibold">Note:</span> You&apos;ll need a free ChatGPT account.
                                    If you don&apos;t have one, you can{" "}
                                    <a
                                        href="https://chat.openai.com/auth/login"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline hover:text-yellow-300 transition-colors"
                                    >
                                        sign up for free
                                    </a>{" "}
                                    in seconds.
                                </p>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={openChatGPT}
                            className="w-full px-4 py-3 bg-white hover:bg-white/90 text-purple-700 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg"
                        >
                            <Sparkles className="w-5 h-5" />
                            Open AI Assistant
                            <ExternalLink className="w-4 h-4" />
                        </button>

                        <p className="text-center text-white/60 text-[10px] mt-3">
                            Powered by ChatGPT • Free to use • No cost to you
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main floating button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsExpanded(!isExpanded)}
                title="AI Course Assistant"
                aria-label="Open AI Course Assistant"
                className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full shadow-lg transition-all duration-300 hover:shadow-purple-500/40"
            >
                <Sparkles className="w-6 h-6" />

                {/* Animated ring effect */}
                <span className="absolute inset-0 rounded-full border-2 border-purple-400 opacity-0 group-hover:opacity-100 animate-ping" />

                {/* Pulse effect */}
                <span className="absolute -inset-1 rounded-full bg-purple-400/30 animate-pulse" />

                {/* Badge label */}
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-yellow-400 text-purple-900 text-[9px] font-bold rounded-full shadow-md">
                    AI
                </span>
            </motion.button>

            {/* Tooltip on hover (when not expanded) */}
            {!isExpanded && (
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute right-16 bottom-3 hidden group-hover:block"
                >
                    <div className="px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
                        Ask AI about courses
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
                    </div>
                </motion.div>
            )}
        </div>
    )
}
