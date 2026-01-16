"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calculator, AlertTriangle, ChevronDown, ChevronUp, Check, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { calculateAllClusters, GRADE_POINTS, type ClusterResult } from "@/lib/cluster-calculator-utils"
import { getAllClusterCategories } from "@/lib/cluster-categories-config"

interface EmbeddedClusterCalculatorProps {
    onUseWeights?: (weights: Record<number, number>) => void
}

// Hardcoded subjects in order - students just enter grades
const PREDEFINED_SUBJECTS = [
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

export default function EmbeddedClusterCalculator({ onUseWeights }: EmbeddedClusterCalculatorProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [showDisclaimer, setShowDisclaimer] = useState(true)
    const [meanGrade, setMeanGrade] = useState("")
    // Initialize with all subjects, empty grades
    const [subjectGrades, setSubjectGrades] = useState<Record<string, string>>(
        PREDEFINED_SUBJECTS.reduce((acc, subject) => ({ ...acc, [subject]: "" }), {})
    )
    const [calculationResult, setCalculationResult] = useState<any>(null)
    const [showResults, setShowResults] = useState(false)
    const [showAllResults, setShowAllResults] = useState(false)
    const [error, setError] = useState("")

    const categories = getAllClusterCategories()

    const updateGrade = (subject: string, grade: string) => {
        setSubjectGrades((prev) => ({
            ...prev,
            [subject]: grade,
        }))
        setError("")
    }

    const handleCalculate = () => {
        setError("")
        setCalculationResult(null)
        setShowResults(false)

        // Validation
        if (!meanGrade) {
            setError("Please select your mean grade")
            return
        }

        // Count filled subjects
        const filledSubjects = Object.entries(subjectGrades).filter(([_, grade]) => grade !== "")
        if (filledSubjects.length < 7) {
            setError(`Please enter grades for at least 7 subjects (you have ${filledSubjects.length})`)
            return
        }

        // Convert to grades object (only filled subjects)
        const gradesForCalculation: Record<string, string> = {}
        filledSubjects.forEach(([subject, grade]) => {
            gradesForCalculation[subject] = grade
        })

        // Calculate
        const result = calculateAllClusters(categories, gradesForCalculation)
        setCalculationResult(result)
        setShowResults(true)
    }

    const handleUseWeights = () => {
        if (!calculationResult || !onUseWeights) return

        // Create weights object mapping cluster ID (as NUMBER) to weight
        // Convert "CL01" → 1, "CL02" → 2, etc.
        const weights: Record<number, number> = {}
        let convertedCount = 0

        calculationResult.clusterResults.forEach((cluster: ClusterResult) => {
            if (cluster.qualified && cluster.clusterWeight !== undefined) {
                // Convert "CL01" to 1, "CL02" to 2, etc.
                const clusterNumber = parseInt(cluster.categoryId.replace("CL", ""), 10)
                weights[clusterNumber] = cluster.clusterWeight
                convertedCount++
                console.log(`Converting ${cluster.categoryId} → ${clusterNumber}: ${cluster.clusterWeight.toFixed(3)}`)
            }
        })

        console.log("Final weights to send:", weights)
        onUseWeights(weights)
    }

    const getTierColor = (tier?: "A" | "B" | "C") => {
        switch (tier) {
            case "A":
                return "text-green-400 bg-green-500/10 border-green-500/30"
            case "B":
                return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30"
            case "C":
                return "text-orange-400 bg-orange-500/10 border-orange-500/30"
            default:
                return "text-dim bg-white/5 border-white/10"
        }
    }

    const getTierLabel = (tier?: "A" | "B" | "C") => {
        switch (tier) {
            case "A":
                return "Strong"
            case "B":
                return "Competitive"
            case "C":
                return "Low"
            default:
                return "N/A"
        }
    }

    const qualifiedClusters = calculationResult?.clusterResults.filter((c: ClusterResult) => c.qualified) || []
    const displayedClusters = showAllResults ? qualifiedClusters : qualifiedClusters.slice(0, 5)

    return (
        <div className="mb-6 border border-amber-500/30 rounded-xl bg-gradient-to-br from-amber-500/5 to-amber-600/5 overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                        <Calculator className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-base md:text-lg font-bold text-light flex items-center gap-2">
                            Don't have your cluster weights yet?
                            <Sparkles className="w-4 h-4 text-amber-400" />
                        </h3>
                        <p className="text-xs md:text-sm text-dim">
                            Use our calculator to estimate them (±5 points accuracy)
                        </p>
                    </div>
                </div>
                <div className="flex-shrink-0">
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-amber-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-amber-400" />
                    )}
                </div>
            </button>

            {/* Disclaimer */}
            <AnimatePresence>
                {isExpanded && showDisclaimer && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-amber-500/20 bg-amber-500/10 px-4 py-3"
                    >
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-xs md:text-sm text-amber-200 leading-relaxed">
                                    <strong>Important:</strong> This calculator provides estimated cluster weights with a possible ±5 point
                                    deviation from official KUCCPS results. For accurate placement decisions, always use official cluster
                                    weights from the KUCCPS portal. Use this for estimation only.
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setShowDisclaimer(false)
                                }}
                                className="flex-shrink-0 p-1 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-amber-300" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Calculator Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-white/10 p-4 space-y-4"
                    >
                        {/* Mean Grade */}
                        <div>
                            <label className="block text-sm font-semibold text-light mb-2">Mean Grade</label>
                            <select
                                value={meanGrade}
                                onChange={(e) => setMeanGrade(e.target.value)}
                                className="w-full px-3 py-2 bg-[#1a1f2e] border border-white/20 rounded-lg text-light text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                            >
                                <option value="">Select mean grade</option>
                                {GRADES.map((grade) => (
                                    <option key={grade} value={grade}>
                                        {grade}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Subjects Grid */}
                        <div>
                            <label className="block text-sm font-semibold text-light mb-2">
                                Select grades for 7 subjects you sat for:
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
                                {PREDEFINED_SUBJECTS.map((subject) => (
                                    <div key={subject} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5">
                                        <label className="flex-1 text-sm text-light cursor-pointer">
                                            {subject}
                                        </label>
                                        <select
                                            value={subjectGrades[subject] || ""}
                                            onChange={(e) => updateGrade(subject, e.target.value)}
                                            className="w-16 px-2 py-1.5 bg-[#1a1f2e] border border-white/20 rounded-lg text-light text-xs focus:border-accent focus:outline-none"
                                        >
                                            <option value="">-</option>
                                            {GRADES.map((grade) => (
                                                <option key={grade} value={grade}>
                                                    {grade}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-dim mt-2">
                                Selected: {Object.values(subjectGrades).filter(g => g !== "").length} of 7 subjects
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                <p className="text-sm text-red-300">{error}</p>
                            </div>
                        )}

                        {/* Calculate Button */}
                        <Button
                            onClick={handleCalculate}
                            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-dark font-bold"
                        >
                            <Calculator className="w-4 h-4 mr-2" />
                            Calculate Cluster Weights
                        </Button>

                        {/* Results */}
                        <AnimatePresence>
                            {showResults && calculationResult && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="space-y-3 pt-4 border-t border-white/10"
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-light">
                                            Estimated Cluster Weights ({qualifiedClusters.length} qualified)
                                        </h4>
                                        {qualifiedClusters.length > 5 && (
                                            <button
                                                onClick={() => setShowAllResults(!showAllResults)}
                                                className="text-xs text-accent hover:underline"
                                            >
                                                {showAllResults ? "Show Less" : "Show All"}
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {displayedClusters.map((cluster: ClusterResult) => (
                                            <div
                                                key={cluster.categoryId}
                                                className="p-3 bg-white/5 border border-white/10 rounded-lg"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-light truncate">
                                                            {cluster.categoryName}
                                                        </p>
                                                        <p className="text-xs text-dim mt-0.5">
                                                            Cluster {cluster.categoryId}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <span
                                                            className={`px-2 py-1 rounded-md text-xs font-bold border ${getTierColor(
                                                                cluster.tier
                                                            )}`}
                                                        >
                                                            {getTierLabel(cluster.tier)}
                                                        </span>
                                                        <span className="text-sm font-bold text-accent">
                                                            {cluster.clusterWeight?.toFixed(3)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Use Weights Button */}
                                    <Button
                                        onClick={handleUseWeights}
                                        className="w-full bg-gradient-to-r from-accent to-cyan-600 hover:from-cyan-600 hover:to-accent text-dark font-bold"
                                    >
                                        <Check className="w-4 h-4 mr-2" />
                                        Use These Weights in Form Below
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
