"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calculator, AlertTriangle, CheckCircle, Info, X, Plus, Trash2, Sparkles, TrendingUp, Award, Smartphone, ExternalLink, Brain, BookOpen, Copy, Download, Check } from "lucide-react"
import IntroWarning from "@/components/IntroWarning"
import PreCalculationWarning from "@/components/PreCalculationWarning"
import AIChatModal from "@/components/AIChatModal"
import Footer from "@/components/footer"
import { getAllClusterCategories } from "@/lib/cluster-categories-config"
import {
    calculateAllClusters,
    roundToOneDecimal,
    calculateMeanGradeFromPoints,
    GRADE_POINTS,
    type CalculationSummary,
    type ClusterResult,
} from "@/lib/cluster-calculator-utils"

const COMMON_SUBJECTS = [
    "Mathematics",
    "English",
    "Kiswahili",
    "Biology",
    "Chemistry",
    "Physics",
    "Geography",
    "History",
    "CRE",
    "IRE",
    "HRE",
    "Agriculture",
    "Computer Studies",
    "Art and Design",
    "Business Studies",
    "Home Science",
    "Music",
    "Building and Construction",
    "Electricity and Electronics",
    "Woodwork",
    "Metalwork",
    "French",
    "German",
    "Aviation",
]

const GRADES = Object.keys(GRADE_POINTS)

export default function ClusterCalculatorPage() {
    const [showIntroWarning, setShowIntroWarning] = useState(true)
    const [meanGrade, setMeanGrade] = useState("")
    const [subjects, setSubjects] = useState<Array<{ subject: string; grade: string }>>([
        { subject: "", grade: "" },
    ])
    const [calculationResult, setCalculationResult] = useState<CalculationSummary | null>(null)
    const [aiExplanation, setAiExplanation] = useState<string>("")
    const [isLoadingAI, setIsLoadingAI] = useState(false)
    const [showPreCalculationWarning, setShowPreCalculationWarning] = useState(false)
    const [showBuyDataModal, setShowBuyDataModal] = useState(false)
    const [showChatModal, setShowChatModal] = useState(false)
    const [copiedClusterId, setCopiedClusterId] = useState<string | null>(null)
    const [copiedAll, setCopiedAll] = useState(false)
    const [showCourseCheckModal, setShowCourseCheckModal] = useState(false)
    const [showCategoryModal, setShowCategoryModal] = useState(false)
    const [isPrefillingForm, setIsPrefillingForm] = useState(false)

    const categories = getAllClusterCategories()

    // Copy individual cluster weight
    const copyClusterWeight = async (cluster: ClusterResult) => {
        if (!cluster.qualified || cluster.clusterWeight === undefined) return

        const text = `${cluster.categoryName}: ${cluster.clusterWeight.toFixed(3)}/48 (Tier ${cluster.tier})`
        await navigator.clipboard.writeText(text)
        setCopiedClusterId(cluster.categoryId)
        setTimeout(() => setCopiedClusterId(null), 2000)
    }

    // Copy all cluster weights
    const copyAllClusters = async () => {
        if (!calculationResult) return

        const qualifiedClusters = calculationResult.clusterResults.filter(c => c.qualified)
        const text = qualifiedClusters
            .map((c, idx) => `${idx + 1}. ${c.categoryName}: ${c.clusterWeight!.toFixed(3)}/48 (Tier ${c.tier})`)
            .join('\n')

        const fullText = `KUCCPS CLUSTER CALCULATOR RESULTS\nTotal KCSE Points: ${calculationResult.totalKCSEPoints}/84\nMean Grade: ${meanGrade}\n\nCLUSTER WEIGHTS:\n${text}`

        await navigator.clipboard.writeText(fullText)
        setCopiedAll(true)
        setTimeout(() => setCopiedAll(false), 2000)
    }

    // Download results as TXT
    const downloadResults = () => {
        if (!calculationResult) return

        const qualifiedClusters = calculationResult.clusterResults.filter(c => c.qualified)
        const unqualifiedClusters = calculationResult.clusterResults.filter(c => !c.qualified)

        let text = `KUCCPS CLUSTER CALCULATOR RESULTS\n`
        text += `=====================================\n\n`
        text += `Student Performance Summary:\n`
        text += `- Total KCSE Points: ${calculationResult.totalKCSEPoints}/84\n`
        text += `- Mean Grade: ${meanGrade}\n`
        text += `- Date: ${new Date().toLocaleDateString()}\n\n`

        text += `QUALIFIED CLUSTER CATEGORIES (${qualifiedClusters.length}):\n`
        text += `=====================================\n`
        qualifiedClusters.forEach((c, idx) => {
            text += `\n${idx + 1}. ${c.categoryName}\n`
            text += `   Cluster Weight: ${c.clusterWeight!.toFixed(3)}/48\n`
            text += `   Tier: ${c.tier} (${getTierLabel(c.tier)})\n`
            text += `   Raw Points: ${c.rawClusterTotal}/48\n`
            text += `   Subjects Used: ${c.selectedSubjects?.map(s => `${s.subject} (${s.grade})`).join(', ')}\n`
        })

        if (unqualifiedClusters.length > 0) {
            text += `\n\nUNQUALIFIED CLUSTERS (${unqualifiedClusters.length}):\n`
            text += `=====================================\n`
            unqualifiedClusters.forEach((c, idx) => {
                text += `\n${idx + 1}. ${c.categoryName}\n`
                text += `   Status: Not Qualified\n`
                text += `   Missing: ${c.missingSubject}\n`
            })
        }

        text += `\n\n=====================================\n`
        text += `DISCLAIMER: These are estimated cluster weights based on the public KUCCPS formula.\n`
        text += `Expected deviation: ±5 points from official results.\n`
        text += `Always rely on the official KUCCPS portal for final placement decisions.\n`

        const blob = new Blob([text], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `KUCCPS_Cluster_Results_${new Date().toISOString().split('T')[0]}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const addSubject = () => {
        setSubjects([...subjects, { subject: "", grade: "" }])
    }

    const removeSubject = (index: number) => {
        if (subjects.length > 1) {
            setSubjects(subjects.filter((_, i) => i !== index))
        }
    }

    const updateSubject = (index: number, field: "subject" | "grade", value: string) => {
        const updated = [...subjects]
        updated[index][field] = value
        setSubjects(updated)
    }

    const handleCalculate = async () => {
        setCalculationResult(null)
        setAiExplanation("")
        setShowPreCalculationWarning(true)

        await new Promise(resolve => setTimeout(resolve, 1500))
        setShowPreCalculationWarning(false)

        if (!meanGrade) {
            alert("Please select your mean grade first")
            return
        }

        // Convert subjects array to grades object
        const subjectGrades: Record<string, string> = {}
        for (const { subject, grade } of subjects) {
            if (subject.trim() && grade.trim()) {
                subjectGrades[subject.trim()] = grade.trim()
            }
        }

        // Calculate cluster weights for ALL categories
        const result = calculateAllClusters(categories, subjectGrades)
        setCalculationResult(result)

        // if (result.success) {
        //     await getAIExplanation(result)
        // }

        setTimeout(() => {
            document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" })
        }, 300)
    }

    const getAIExplanation = async (result: CalculationSummary) => {
        setIsLoadingAI(true)
        try {
            const response = await fetch("/api/cluster-ai-explanation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    meanGrade: meanGrade,
                    totalKCSEPoints: result.totalKCSEPoints,
                    clusterResults: result.clusterResults,
                    allSubjects: result.allSubjectsSorted,
                }),
            })

            if (response.ok) {
                const data = await response.json()
                setAiExplanation(data.explanation || "")
            }
        } catch (error) {
            console.error("Error getting AI explanation:", error)
        } finally {
            setIsLoadingAI(false)
        }
    }

    const handleBuyDataClick = () => {
        setShowBuyDataModal(true)
    }

    const handleCheckCoursesClick = () => {
        setShowCourseCheckModal(true)
    }

    const handleUseCKUCCPSPortal = () => {
        window.open('https://students.kuccps.net', '_blank', 'noopener,noreferrer')
        setShowCourseCheckModal(false)
    }

    const handleUseCalculatedWeights = () => {
        setShowCourseCheckModal(false)
        setShowCategoryModal(true)
    }

    const prefillCourseForm = async (category: string) => {
        setShowCategoryModal(false)
        setIsPrefillingForm(true)

        // Wait to show loading message
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Store data in sessionStorage for the course checker to use
        const formData = {
            meanGrade: meanGrade,
            subjects: subjects.filter(s => s.subject && s.grade),
            clusterWeights: calculationResult?.clusterResults.map(c => ({
                categoryId: c.categoryId,
                categoryName: c.categoryName,
                weight: c.qualified ? c.clusterWeight : null
            })),
            totalKCSEPoints: calculationResult?.totalKCSEPoints
        }

        sessionStorage.setItem('clusterCalculatorData', JSON.stringify(formData))

        // Navigate to the appropriate course category page
        const categoryRoutes: Record<string, string> = {
            'degree': '/degree',
            'diploma': '/diploma',
            'certificate': '/certificate',
            'kmtc': '/kmtc',
            'artisan': '/artisan'
        }

        const route = categoryRoutes[category.toLowerCase()]
        if (route) {
            window.location.href = `${route}?prefill=true`
        }
    }

    const getTierColor = (tier?: "A" | "B" | "C") => {
        switch (tier) {
            case "A": return "text-green-400 bg-green-500/10 border-green-500/30"
            case "B": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30"
            case "C": return "text-orange-400 bg-orange-500/10 border-orange-500/30"
            default: return "text-dim bg-white/5 border-white/10"
        }
    }

    const getTierLabel = (tier?: "A" | "B" | "C") => {
        switch (tier) {
            case "A": return "Strong Fit"
            case "B": return "Competitive"
            case "C": return "Low"
            default: return "N/A"
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-base">
            {/* Intro Warning Modal */}
            <AnimatePresence>
                {showIntroWarning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowIntroWarning(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-lg w-full bg-surface border border-amber-500/30 rounded-2xl p-6 md:p-8 shadow-[0_0_40px_rgba(251,191,36,0.2)]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start gap-4 mb-6">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-light mb-2">Important Notice</h3>
                                    <div className="space-y-3 text-sm text-dim leading-relaxed">
                                        <p>
                                            This tool calculates <strong className="text-amber-400">estimated cluster weights for all 20 KUCCPS categories</strong> using the public formula.
                                        </p>
                                        <p>
                                            Official cluster points are confirmed <strong className="text-light">only on the KUCCPS student portal</strong>.
                                        </p>
                                        <p className="text-accent font-medium">
                                            Expected deviation: ±5 points from official results
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowIntroWarning(false)}
                                className="w-full py-3 px-4 bg-accent hover:bg-accent/90 text-dark font-bold rounded-xl transition-all duration-300 shadow-glow"
                            >
                                I Understand
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pre-calculation Warning */}
            <AnimatePresence>
                {showPreCalculationWarning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="max-w-md w-full bg-surface border border-accent/30 rounded-2xl p-8 text-center shadow-[0_0_40px_rgba(34,211,238,0.2)]"
                        >
                            <Info className="w-16 h-16 text-accent mx-auto mb-4 animate-pulse" />
                            <h3 className="text-xl font-bold text-light mb-3">Calculating...</h3>
                            <p className="text-dim text-sm">
                                Computing cluster weights for <strong className="text-accent">all 20 KUCCPS categories</strong>. This is for practice and comparison only.
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Buy Data Modal */}
            <AnimatePresence>
                {showBuyDataModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowBuyDataModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="max-w-md w-full bg-surface border border-green-500/30 rounded-2xl p-8 text-center shadow-[0_0_40px_rgba(34,197,94,0.3)]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center">
                                    <Smartphone className="w-8 h-8 text-green-400" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-light mb-3">Great News! 🎉</h3>
                            <p className="text-dim text-sm leading-relaxed mb-4">
                                You are now free to buy <strong className="text-green-400">Safaricom data, SMS and minutes</strong> even with unpaid Okoa Jahazi!
                            </p>
                            <div className="flex items-center justify-center gap-2 text-xs text-green-400">
                                <ExternalLink className="w-4 h-4" />
                                <span>Redirecting you to Bfasta...</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Buy Data Modal - Redesigned */}
            <AnimatePresence>
                {showBuyDataModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
                        onClick={() => setShowBuyDataModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 50 }}
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                            className="relative max-w-lg w-full max-h-[90vh] bg-gradient-to-br from-green-900/40 via-surface to-surface border-2 border-green-500/40 rounded-3xl shadow-[0_0_60px_rgba(34,197,94,0.4)] overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Animated background elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-green-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

                            <button
                                onClick={() => setShowBuyDataModal(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-all hover:rotate-90 z-10"
                            >
                                <X className="w-5 h-5 text-dim hover:text-light" />
                            </button>

                            <div className="relative z-10 overflow-y-auto p-6 md:p-8">
                                {/* Header with animated icon */}
                                <div className="text-center mb-4 md:mb-6">
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.1, 1],
                                            rotate: [0, 5, -5, 0]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            repeatType: "reverse"
                                        }}
                                        className="inline-flex w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 items-center justify-center mb-3 md:mb-4 shadow-[0_0_30px_rgba(34,197,94,0.5)]"
                                    >
                                        <Smartphone className="w-8 h-8 md:w-10 md:h-10 text-white" />
                                    </motion.div>

                                    <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-300 to-emerald-400 mb-2">
                                        🎉 Amazing Offer! 🎉
                                    </h3>
                                    <p className="text-sm md:text-base text-green-200 font-semibold">
                                        Buy Data Even with unpaid Okoa Jahazi Debt!
                                    </p>
                                </div>

                                {/* Features with icons */}
                                <div className="bg-gradient-to-br from-green-500/15 to-green-600/10 border border-green-500/30 rounded-2xl p-4 md:p-5 mb-4 md:mb-6 backdrop-blur-sm">
                                    <p className="text-light text-sm md:text-base leading-relaxed mb-4 text-center">
                                        Get <strong className="text-green-400">instant Safaricom data, SMS & minutes</strong> from Bfasta - no matter your Okoa Jahazi debt! 📱✨
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center"
                                        >
                                            <div className="text-2xl mb-1">⚡</div>
                                            <p className="text-xs font-semibold text-green-300">Instant Activation</p>
                                        </motion.div>
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center"
                                        >
                                            <div className="text-2xl mb-1">💰</div>
                                            <p className="text-xs font-semibold text-green-300">Affordable Rates</p>
                                        </motion.div>
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center"
                                        >
                                            <div className="text-2xl mb-1">🌟</div>
                                            <p className="text-xs font-semibold text-green-300">24/7 Available</p>
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Benefits list */}
                                <div className="bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 mb-4 md:mb-6">
                                    <p className="text-xs text-dim mb-3 font-semibold uppercase tracking-wide">Perfect for:</p>
                                    <div className="space-y-2">
                                        {[
                                            '✅ Checking KUCCPS results',
                                            '✅ Using this calculator anytime',
                                            '✅ Staying connected with friends',
                                            '✅ Emergency internet needs'
                                        ].map((item, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="text-xs md:text-sm text-light flex items-center gap-2"
                                            >
                                                <span>{item}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* CTA Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowBuyDataModal(false)}
                                        className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/20 text-dim hover:text-light font-medium rounded-xl transition-all"
                                    >
                                        Maybe Later
                                    </button>
                                    <motion.a
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        href="https://bingwazone.co.ke/app/Bfasta"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => setShowBuyDataModal(false)}
                                        className="flex-[2] py-3 px-6 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 text-white font-black rounded-xl transition-all shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:shadow-[0_0_40px_rgba(34,197,94,0.7)] flex items-center justify-center gap-2 text-base relative overflow-hidden group"
                                    >
                                        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                                        <span className="relative z-10">Buy Now! 🚀</span>
                                        <ExternalLink className="w-5 h-5 relative z-10" />
                                    </motion.a>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Check Courses Modal - Choose between calculated or KUCCPS */}
            <AnimatePresence>
                {showCourseCheckModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowCourseCheckModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-lg w-full bg-surface border border-cyan-500/30 rounded-2xl p-6 md:p-8 shadow-[0_0_40px_rgba(34,211,238,0.3)]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowCourseCheckModal(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-dim" />
                            </button>

                            <div className="text-center mb-6">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                                    <BookOpen className="w-8 h-8 text-cyan-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-light mb-3">Check Qualified Courses</h3>
                                <p className="text-sm text-dim leading-relaxed">
                                    Choose how you want to proceed with checking your qualified courses:
                                </p>
                            </div>

                            <div className="space-y-4">
                                {/* Option 1: Use Calculated Weights */}
                                <button
                                    onClick={handleUseCalculatedWeights}
                                    className="w-full p-4 md:p-5 bg-gradient-to-r from-cyan-500/10 to-cyan-600/10 hover:from-cyan-500/20 hover:to-cyan-600/20 border-2 border-cyan-500/30 hover:border-cyan-500/50 rounded-xl transition-all group text-left"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Calculator className="w-5 h-5 text-cyan-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-light font-bold mb-1 text-sm md:text-base">Use Calculated Cluster Weights</h4>
                                            <p className="text-xs md:text-sm text-dim leading-relaxed mb-2">
                                                Use the cluster weights calculated above to check your eligible courses instantly.
                                            </p>
                                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 mt-2">
                                                <p className="text-xs text-amber-300 flex items-start gap-2">
                                                    <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                                    <span>Warning: These are estimates (±5 points). Results may differ from official KUCCPS data.</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </button>

                                {/* Option 2: KUCCPS Portal */}
                                <button
                                    onClick={handleUseCKUCCPSPortal}
                                    className="w-full p-4 md:p-5 bg-gradient-to-r from-green-500/10 to-green-600/10 hover:from-green-500/20 hover:to-green-600/20 border-2 border-green-500/30 hover:border-green-500/50 rounded-xl transition-all group text-left"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <ExternalLink className="w-5 h-5 text-green-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-light font-bold mb-1 flex items-center gap-2 text-sm md:text-base">
                                                Get from KUCCPS Portal
                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                            </h4>
                                            <p className="text-xs md:text-sm text-dim leading-relaxed mb-2">
                                                Use official cluster weights from the KUCCPS student portal for accurate results.
                                            </p>
                                            <p className="text-xs text-green-300">
                                                ✓ 100% Accurate • ✓ Official Data • ✓ Recommended
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            <button
                                onClick={() => setShowCourseCheckModal(false)}
                                className="w-full mt-4 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-dim hover:text-light font-medium rounded-xl transition-all text-sm"
                            >
                                Cancel
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Category Selection Modal */}
            <AnimatePresence>
                {showCategoryModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowCategoryModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-md w-full bg-surface border border-accent/30 rounded-2xl p-6 md:p-8 shadow-[0_0_40px_rgba(34,211,238,0.3)]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowCategoryModal(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-dim" />
                            </button>

                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-light mb-2">Select Course Category</h3>
                                <p className="text-sm text-dim">
                                    Which type of courses do you want to check?
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { name: 'Degree', value: 'degree', icon: '🎓' },
                                    { name: 'Diploma', value: 'diploma', icon: '📚' },
                                    { name: 'Certificate', value: 'certificate', icon: '📜' },
                                    { name: 'KMTC', value: 'kmtc', icon: '⚕️' },
                                    { name: 'Artisan', value: 'artisan', icon: '🔧' }
                                ].map((category) => (
                                    <button
                                        key={category.value}
                                        onClick={() => prefillCourseForm(category.value)}
                                        className="p-4 bg-white/5 hover:bg-accent/10 border border-white/10 hover:border-accent/30 rounded-xl transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{category.icon}</span>
                                            <span className="text-light font-semibold group-hover:text-accent transition-colors">
                                                {category.name}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setShowCategoryModal(false)}
                                className="w-full mt-4 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-dim hover:text-light font-medium rounded-xl transition-all text-sm"
                            >
                                Cancel
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Prefilling Form Loading Modal */}
            <AnimatePresence>
                {isPrefillingForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="max-w-md w-full bg-surface border border-accent/30 rounded-2xl p-8 text-center shadow-[0_0_40px_rgba(34,211,238,0.3)]"
                        >
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 border-2 border-accent/50 flex items-center justify-center animate-pulse">
                                <Calculator className="w-8 h-8 text-accent" />
                            </div>
                            <h3 className="text-xl font-bold text-light mb-3">Entering Your Grades...</h3>
                            <p className="text-sm text-dim mb-4">
                                We're prefilling the course checker with your calculated cluster weights and subject grades.
                            </p>
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Buy Data Button */}
            <motion.button
                onClick={handleBuyDataClick}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-[0_0_25px_rgba(34,197,94,0.6)] hover:shadow-[0_0_35px_rgba(34,197,94,0.8)] border-2 border-green-400/30 flex items-center justify-center transition-all duration-300 group"
                aria-label="Buy Safaricom Data"
            >
                <Smartphone className="w-6 h-6 md:w-8 md:h-8 text-white group-hover:scale-110 transition-transform" />
                {/* Pulse animation */}
                <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30"></span>
            </motion.button>

            {/* Hero Section */}
            <section className="relative py-12 md:py-20 overflow-hidden">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="mb-6 mt-20 md:mt-8 inline-flex items-center px-4 py-2 rounded-full bg-accent/10 backdrop-blur-sm border border-accent/30"
                        >
                            <Calculator className="h-4 w-4 text-accent mr-2" />
                            <span className="text-sm font-medium text-accent">KUCCPS Cluster Calculator</span>
                        </motion.div>

                        <h1 className="mb-4 text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-light">
                            KUCCPS Cluster Calculator + AI
                        </h1>

                        <p className="mb-6 text-base md:text-lg text-dim max-w-2xl mx-auto leading-relaxed">
                            Calculate your cluster weights for all 20 official KUCCPS categories. Discover which degree programs best match your performance.
                        </p>

                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            <span className="text-xs md:text-sm text-amber-300 font-medium">
                                For guidance only • Not official KUCCPS results
                            </span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Calculator Form */}
            <section className="py-8 md:py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-surface border border-white/10 rounded-2xl p-4 md:p-8 shadow-premium"
                    >
                        {/* Mean Grade Selection */}
                        <div className="mb-8">
                            <label className="block text-light font-bold mb-3 text-sm md:text-base">
                                1. Select Your Mean Grade (for reference)
                            </label>
                            <select
                                value={meanGrade}
                                onChange={(e) => setMeanGrade(e.target.value)}
                                className="w-full px-4 py-3 md:py-4 bg-[#1a1f2e] border border-accent/20 rounded-xl text-light focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all text-sm md:text-base"
                                style={{ color: '#e2e8f0' }}
                            >
                                <option value="" style={{ backgroundColor: '#1a1f2e', color: '#94a3b8' }}>-- Select mean grade --</option>
                                {GRADES.map((grade) => (
                                    <option key={grade} value={grade} style={{ backgroundColor: '#1a1f2e', color: '#e2e8f0' }}>
                                        {grade}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Subject Input */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-light font-bold text-sm md:text-base">
                                    2. Enter Your KCSE Subjects & Grades
                                </label>
                                <span className="text-xs md:text-sm text-dim">
                                    {subjects.filter(s => s.subject && s.grade).length} Subjects Added
                                </span>
                            </div>

                            <div className="space-y-3">
                                {subjects.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex gap-2 md:gap-3"
                                    >
                                        {/* Subject Selection */}
                                        <div className="flex-1">
                                            <select
                                                value={item.subject}
                                                onChange={(e) => updateSubject(index, "subject", e.target.value)}
                                                className="w-full px-3 md:px-4 py-2 md:py-3 bg-[#1a1f2e] border border-accent/20 rounded-xl text-light focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all text-sm md:text-base"
                                                style={{ color: '#e2e8f0' }}
                                            >
                                                <option value="" style={{ backgroundColor: '#1a1f2e', color: '#94a3b8' }}>Select subject</option>
                                                {COMMON_SUBJECTS.map((subject) => (
                                                    <option key={subject} value={subject} style={{ backgroundColor: '#1a1f2e', color: '#e2e8f0' }}>
                                                        {subject}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Grade Selection */}
                                        <select
                                            value={item.grade}
                                            onChange={(e) => updateSubject(index, "grade", e.target.value)}
                                            className="w-20 md:w-24 px-2 md:px-3 py-2 md:py-3 bg-[#1a1f2e] border border-accent/20 rounded-xl text-light focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all text-sm md:text-base"
                                            style={{ color: '#e2e8f0' }}
                                        >
                                            <option value="" style={{ backgroundColor: '#1a1f2e', color: '#94a3b8' }}>Grade</option>
                                            {GRADES.map((grade) => (
                                                <option key={grade} value={grade} style={{ backgroundColor: '#1a1f2e', color: '#e2e8f0' }}>
                                                    {grade}
                                                </option>
                                            ))}
                                        </select>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => removeSubject(index)}
                                            disabled={subjects.length === 1}
                                            className="p-2 md:p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                            aria-label="Remove subject"
                                        >
                                            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Add Subject Button */}
                            <button
                                onClick={addSubject}
                                className="mt-4 w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent/30 rounded-xl text-dim hover:text-accent font-medium transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base"
                            >
                                <Plus className="w-4 h-4" />
                                Add Subject ({subjects.length + 1})
                            </button>
                        </div>

                        {/* Calculate Button */}
                        <button
                            onClick={handleCalculate}
                            disabled={!meanGrade || subjects.filter(s => s.subject && s.grade).length < 7}
                            className="group relative w-full py-5 px-8 bg-gradient-to-r from-cyan-500 via-cyan-600 to-blue-600 hover:from-cyan-600 hover:via-cyan-700 hover:to-blue-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-[0_8px_30px_rgba(34,211,238,0.4)] hover:shadow-[0_12px_40px_rgba(34,211,238,0.6)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 text-base md:text-lg overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            <Calculator className="w-6 h-6 relative z-10" />
                            <span className="relative z-10">Calculate All Cluster Weights</span>
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Results Section */}
            {calculationResult && (
                <section id="results-section" className="py-8 md:py-12">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <AnimatePresence mode="wait">
                            {calculationResult.success ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -30 }}
                                    className="space-y-6"
                                >
                                    {/* Results Warning Banner */}
                                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 md:p-6">
                                        <div className="flex items-start gap-3 md:gap-4">
                                            <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="text-amber-300 font-bold mb-1 text-sm md:text-base">Estimated Cluster Weights</h4>
                                                <p className="text-amber-200/80 text-xs md:text-sm leading-relaxed">
                                                    These are estimated cluster weights for all 20 KUCCPS categories. Actual cutoffs vary by university and program. Always check the KUCCPS portal for final results.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* KCSE Summary */}
                                    <div className="bg-gradient-to-br from-accent/20 via-accent/10 to-accent/5 border border-accent/30 rounded-2xl p-6 md:p-10 text-center shadow-[0_0_40px_rgba(34,211,238,0.15)]">
                                        <div className="mb-4">
                                            <span className="text-dim text-xs md:text-sm uppercase tracking-wider">Total KCSE Points</span>
                                        </div>
                                        <div className="mb-2">
                                            <span className="text-6xl md:text-8xl font-black text-accent">
                                                {calculationResult.totalKCSEPoints}
                                            </span>
                                            <span className="text-2xl md:text-4xl text-dim ml-2">/84</span>
                                        </div>
                                        <div className="text-dim text-xs md:text-sm">
                                            Mean Grade: <strong className="text-light">{meanGrade}</strong>
                                            <span className="text-xs ml-2">(Calculated: {calculateMeanGradeFromPoints(calculationResult.totalKCSEPoints)})</span>
                                        </div>
                                    </div>

                                    {/* Cluster Results Table */}
                                    <div className="bg-surface border border-white/10 rounded-2xl p-4 md:p-6">
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
                                            <h3 className="text-light font-bold flex items-center gap-2 text-sm md:text-base">
                                                <TrendingUp className="w-5 h-5 text-accent" />
                                                All 20 Cluster Categories (Ranked)
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={copyAllClusters}
                                                    className="px-3 md:px-4 py-2 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg text-accent font-medium transition-all text-xs md:text-sm flex items-center gap-2"
                                                >
                                                    {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                    <span className="hidden sm:inline">{copiedAll ? "Copied!" : "Copy All"}</span>
                                                </button>
                                                <button
                                                    onClick={downloadResults}
                                                    className="px-3 md:px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 font-medium transition-all text-xs md:text-sm flex items-center gap-2"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Download TXT</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2 md:space-y-3">
                                            {calculationResult.clusterResults.map((cluster, idx) => (
                                                <motion.div
                                                    key={cluster.categoryId}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className={`rounded-xl p-3 md:p-4 border transition-all ${cluster.qualified
                                                        ? 'bg-base/50 border-accent/20 hover:border-accent/40'
                                                        : 'bg-base/20 border-white/5 opacity-60'
                                                        }`}
                                                >
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-dim text-xs font-bold bg-white/5 px-2 py-0.5 rounded">#{idx + 1}</span>
                                                                <h4 className="text-light text-sm md:text-base font-semibold">{cluster.categoryName}</h4>
                                                            </div>
                                                            {cluster.qualified && cluster.selectedSubjects && (
                                                                <div className="text-xs text-dim mt-1">
                                                                    Subjects: {cluster.selectedSubjects.map(s => `${s.subject} (${s.grade})`).join(", ")}
                                                                </div>
                                                            )}
                                                            {!cluster.qualified && cluster.missingSubject && (
                                                                <div className="text-xs text-red-400 mt-1">
                                                                    Missing: {cluster.missingSubject}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {cluster.qualified && cluster.clusterWeight !== undefined && (
                                                                <>
                                                                    <button
                                                                        onClick={() => copyClusterWeight(cluster)}
                                                                        className="p-2 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg text-accent transition-all"
                                                                        title="Copy cluster weight"
                                                                    >
                                                                        {copiedClusterId === cluster.categoryId ? (
                                                                            <Check className="w-4 h-4" />
                                                                        ) : (
                                                                            <Copy className="w-4 h-4" />
                                                                        )}
                                                                    </button>
                                                                    <div className="text-right">
                                                                        <div className="text-lg md:text-2xl font-black text-accent">
                                                                            {cluster.clusterWeight.toFixed(3)}
                                                                        </div>
                                                                        <div className="text-xs text-dim">out of 48</div>
                                                                    </div>
                                                                    <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${getTierColor(cluster.tier)}`}>
                                                                        {getTierLabel(cluster.tier)}
                                                                    </div>
                                                                </>
                                                            )}
                                                            {!cluster.qualified && (
                                                                <div className="text-xs text-dim px-3 py-1.5">
                                                                    Not Qualified
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-6">
                                        {/* Button 1: Ask AI for More Analysis */}
                                        <motion.button
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                            onClick={() => setShowChatModal(true)}
                                            className="w-full py-3 md:py-4 px-4 md:px-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] flex items-center justify-center gap-2 text-sm md:text-base"
                                        >
                                            <Brain className="w-4 h-4 md:w-5 md:h-5" />
                                            <span className="hidden sm:inline">Chat with Bingwa AI</span>
                                            <span className="sm:hidden">Chat AI</span>
                                        </motion.button>


                                        {/* Button 2: Check Qualified Courses */}
                                        <motion.button
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            onClick={handleCheckCoursesClick}
                                            className="w-full py-3 md:py-4 px-4 md:px-6 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-dark font-bold rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] flex items-center justify-center gap-2 text-sm md:text-base"
                                        >
                                            <BookOpen className="w-4 h-4 md:w-5 md:h-5" />
                                            <span className="hidden sm:inline">Check Qualified Courses</span>
                                            <span className="sm:hidden">Courses</span>
                                        </motion.button>

                                        {/* Button 3: Learn a Skill */}
                                        <motion.button
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            onClick={() => window.location.href = "/learn-skills"}
                                            className="w-full py-3 md:py-4 px-4 md:px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] flex items-center justify-center gap-2 text-sm md:text-base"
                                        >
                                            <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                                            <span className="hidden sm:inline">Learn a Digital Skill (Free)</span>
                                            <span className="sm:hidden">Learn Skills</span>
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -30 }}
                                    className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 md:p-8"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                                            <X className="w-5 h-5 md:w-6 md:h-6 text-red-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-red-300 font-bold mb-2 text-sm md:text-base">Calculation Error</h3>
                                            <p className="text-red-200/80 text-xs md:text-sm leading-relaxed">
                                                {calculationResult.errorMessage}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>
            )
            }

            {/* Info Section */}
            <section className="py-12 md:py-16 pb-20">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                        <h3 className="text-light font-bold mb-4 text-base md:text-lg">About This Calculator</h3>
                        <div className="space-y-3 text-xs md:text-sm text-dim leading-relaxed">
                            <p>
                                This calculator computes <strong className="text-light">cluster weights for all 20 official KUCCPS categories</strong> using the public formula.</p>
                            <p>
                                <strong className="text-accent">How it works:</strong> For each category, the calculator selects the best 4 subjects based on that category's requirements, then applies the formula using your total KCSE points.</p>
                            <p>
                                <strong className="text-accent">Tier System:</strong> <span className="text-green-400">Tier A (≥40)</span> = Strong fit, <span className="text-yellow-400">Tier B (35-39)</span> = Competitive, <span className="text-orange-400">Tier C (&lt;35)</span> = Low competitiveness</p>
                            <p>
                                <strong className="text-amber-400">Important:</strong> These are estimates (±5 points accuracy). Actual cutoffs vary by university. Always rely on the KUCCPS portal for official results.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <AIChatModal
                isOpen={showChatModal}
                onClose={() => setShowChatModal(false)}
                contextData={{
                    meanGrade,
                    totalKCSEPoints: calculationResult?.totalKCSEPoints,
                    clusterResults: calculationResult?.clusterResults,
                    allSubjects: calculationResult?.allSubjectsSorted
                }}
            />

            <Footer showOnHomepage={false} />
        </div >
    )
}
