"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { X, AlertCircle, CheckCircle, Clock, Info } from "lucide-react"

interface ApplicationStatus {
    id: string
    application_type: string
    is_open: boolean
    status_message: string
    start_date: string | null
    end_date: string | null
}

export default function ApplicationStatusBanner() {
    const pathname = usePathname()
    const [activeStatuses, setActiveStatuses] = useState<ApplicationStatus[]>([])
    const [isVisible, setIsVisible] = useState(false)
    const [isDismissed, setIsDismissed] = useState(false)

    useEffect(() => {
        // Check if user has dismissed the banner
        const dismissed = localStorage.getItem("applicationBannerDismissed")
        if (dismissed) {
            setIsDismissed(true)
            return
        }

        // Fetch active application statuses
        const fetchActiveStatuses = async () => {
            try {
                const response = await fetch("/api/application-status/active")
                const data = await response.json()

                if (data.activeStatuses && data.activeStatuses.length > 0) {
                    setActiveStatuses(data.activeStatuses)
                    setIsVisible(true)
                }
            } catch (error) {
                console.error("Error fetching active statuses:", error)
            }
        }

        fetchActiveStatuses()
    }, [])

    const handleDismiss = () => {
        setIsVisible(false)
        localStorage.setItem("applicationBannerDismissed", "true")
        // Auto-clear after 24 hours
        setTimeout(() => {
            localStorage.removeItem("applicationBannerDismissed")
        }, 24 * 60 * 60 * 1000)
    }

    if (isDismissed || activeStatuses.length === 0 || pathname !== "/") {
        return null
    }

    const getApplicationIcon = (type: string) => {
        switch (type) {
            case "degree":
                return "🎓"
            case "diploma":
                return "📚"
            case "kmtc":
                return "⚕️"
            case "certificate":
                return "📜"
            case "artisan":
                return "🔧"
            default:
                return "📋"
        }
    }

    const getApplicationColor = (type: string) => {
        switch (type) {
            case "degree":
                return "from-purple-500/20 to-purple-600/10 border-purple-500/30"
            case "diploma":
                return "from-blue-500/20 to-blue-600/10 border-blue-500/30"
            case "kmtc":
                return "from-orange-500/20 to-orange-600/10 border-orange-500/30"
            case "certificate":
                return "from-green-500/20 to-green-600/10 border-green-500/30"
            case "artisan":
                return "from-pink-500/20 to-pink-600/10 border-pink-500/30"
            default:
                return "from-accent/20 to-accent/10 border-accent/30"
        }
    }

    const formatApplicationType = (type: string) => {
        return type.charAt(0).toUpperCase() + type.slice(1)
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="relative w-full bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10 border-b border-accent/20 backdrop-blur-sm"
                >
                    <div className="container mx-auto px-4 py-3 md:py-4">
                        <div className="flex items-start md:items-center justify-between gap-3">
                            {/* Content */}
                            <div className="flex-1 flex flex-col md:flex-row md:items-center gap-3">
                                {/* Icon and Title */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                                    </div>
                                    <h3 className="text-sm md:text-base font-bold text-light">
                                        Applications Open Now!
                                    </h3>
                                </div>

                                {/* Active Applications */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {activeStatuses.map((status) => (
                                        <motion.div
                                            key={status.id}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${getApplicationColor(
                                                status.application_type
                                            )} border backdrop-blur-sm`}
                                        >
                                            <span className="text-base">{getApplicationIcon(status.application_type)}</span>
                                            <span className="text-xs md:text-sm font-semibold text-light">
                                                {formatApplicationType(status.application_type)}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* CTA Buttons - One for each open application */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {activeStatuses.map((status) => (
                                        <a
                                            key={status.id}
                                            href={`/input/${status.application_type}`}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-accent hover:bg-accent/90 text-dark font-semibold rounded-lg transition-all hover:scale-105 text-xs md:text-sm whitespace-nowrap shadow-md"
                                        >
                                            Check {formatApplicationType(status.application_type)} Courses →
                                        </a>
                                    ))}
                                </div>

                                {/* Message */}
                                {activeStatuses.length === 1 && activeStatuses[0].status_message && (
                                    <p className="text-xs md:text-sm text-dim hidden lg:block">
                                        {activeStatuses[0].status_message}
                                    </p>
                                )}
                            </div>

                            {/* Dismiss Button */}
                            <button
                                onClick={handleDismiss}
                                className="flex-shrink-0 p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-all hover:rotate-90 duration-300"
                                aria-label="Dismiss banner"
                            >
                                <X className="w-4 h-4 md:w-5 md:h-5 text-dim hover:text-light" />
                            </button>
                        </div>

                        {/* Mobile Message */}
                        {activeStatuses.length === 1 && activeStatuses[0].status_message && (
                            <p className="text-xs text-dim mt-2 lg:hidden">
                                {activeStatuses[0].status_message}
                            </p>
                        )}
                    </div>

                    {/* Animated Border */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
                </motion.div>
            )}
        </AnimatePresence>
    )
}
