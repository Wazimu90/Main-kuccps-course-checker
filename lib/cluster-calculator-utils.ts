/**
 * KUCCPS CLUSTER CALCULATOR - CORRECT IMPLEMENTATION
 * 
 * This calculator computes cluster weights for ALL 20 official KUCCPS cluster categories.
 * Each category uses the SAME formula but with DIFFERENT 4-subject combinations.
 * 
 * Formula: C = √((r/48) × (t/84)) × 48
 * Where:
 * - r = sum of 4 cluster subjects (varies per category)
 * - t = total KCSE points (best 7 subjects, same for all categories)
 * - C = weighted cluster score
 */

import type { ClusterCategory } from "./cluster-categories-config"

// ==================== CONSTANTS ====================

/** Maximum points for 4 cluster subjects */
export const R = 48

/** Maximum points for 7 KCSE subjects */
export const T = 84

// ==================== GRADE → POINTS MAPPING (FIXED) ====================

export const GRADE_POINTS: Record<string, number> = {
    "A": 12,
    "A-": 11,
    "B+": 10,
    "B": 9,
    "B-": 8,
    "C+": 7,
    "C": 6,
    "C-": 5,
    "D+": 4,
    "D": 3,
    "D-": 2,
    "E": 1,
}

//==================== TYPE DEFINITIONS ====================

export interface SubjectGrade {
    subject: string
    grade: string
    points: number
}

export interface ClusterResult {
    categoryId: string
    categoryName: string
    qualified: boolean
    rawClusterTotal?: number  // r value
    clusterWeight?: number  // C value
    selectedSubjects?: SubjectGrade[]
    missingSubject?: string
    tier?: "A" | "B" | "C"
}

export interface CalculationSummary {
    success: boolean
    totalKCSEPoints: number  // t value
    allSubjectsSorted: SubjectGrade[]
    clusterResults: ClusterResult[]
    errorMessage?: string
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Convert grade to points
 */
export function gradeToPoints(grade: string): number {
    const normalized = grade.trim().toUpperCase()
    return GRADE_POINTS[normalized] || 0
}

/**
 * Validate if a grade is valid
 */
export function isValidGrade(grade: string): boolean {
    const normalized = grade.trim().toUpperCase()
    return normalized in GRADE_POINTS
}

/**
 * Convert all subject grades to points and sort them
 */
export function convertAndSortSubjects(
    subjectGrades: Record<string, string>
): SubjectGrade[] {
    const subjects: SubjectGrade[] = []

    for (const [subject, grade] of Object.entries(subjectGrades)) {
        const points = gradeToPoints(grade)
        if (points > 0) {
            subjects.push({ subject, grade, points })
        }
    }

    return subjects.sort((a, b) => b.points - a.points)
}

/**
 * Calculate total KCSE points (t) - best 7 subjects
 * This value is used for ALL cluster categories
 */
export function calculateTotalKCSEPoints(
    subjectGrades: Record<string, string>
): number {
    const sorted = convertAndSortSubjects(subjectGrades)
    const best7 = sorted.slice(0, 7)
    return best7.reduce((sum, subject) => sum + subject.points, 0)
}

/**
 * Find subject grade in user's grades (case-insensitive)
 */
function findSubjectGrade(
    subjectGrades: Record<string, string>,
    subjectName: string
): { grade: string; points: number } | null {
    // Try exact match first
    if (subjectGrades[subjectName]) {
        const grade = subjectGrades[subjectName]
        return { grade, points: gradeToPoints(grade) }
    }

    // Try case-insensitive match
    const normalizedName = subjectName.toLowerCase().trim()
    for (const [userSubject, grade] of Object.entries(subjectGrades)) {
        if (userSubject.toLowerCase().trim() === normalizedName) {
            return { grade, points: gradeToPoints(grade) }
        }
    }

    return null
}

/**
 * Select the best subject from a slot's alternatives
 */
function selectBestFromSlot(
    alternatives: string[],
    subjectGrades: Record<string, string>
): { subject: string; grade: string; points: number } | null {
    let best: { subject: string; grade: string; points: number } | null = null
    let bestPoints = 0

    for (const alternative of alternatives) {
        const result = findSubjectGrade(subjectGrades, alternative)
        if (result && result.points > bestPoints) {
            bestPoints = result.points
            best = {
                subject: alternative,
                grade: result.grade,
                points: result.points
            }
        }
    }

    return best
}

/**
 * Calculate cluster weight for a specific category
 */
function calculateClusterForCategory(
    category: ClusterCategory,
    subjectGrades: Record<string, string>,
    totalKCSEPoints: number
): ClusterResult {
    const selectedSubjects: SubjectGrade[] = []

    // Try to fill all 4 subject slots
    for (let i = 0; i < 4; i++) {
        const slot = category.subjectSlots[i]
        const best = selectBestFromSlot(slot.alternatives, subjectGrades)

        if (!best) {
            // Cannot qualify for this cluster - missing required subject
            return {
                categoryId: category.id,
                categoryName: category.name,
                qualified: false,
                missingSubject: slot.alternatives.join(" OR ")
            }
        }

        selectedSubjects.push(best)
    }

    // Calculate raw cluster total (r)
    const rawClusterTotal = selectedSubjects.reduce((sum, s) => sum + s.points, 0)

    // Apply formula: C = √((r/48) × (t/84)) × 48
    const clusterWeight = Math.sqrt((rawClusterTotal / R) * (totalKCSEPoints / T)) * 48

    return {
        categoryId: category.id,
        categoryName: category.name,
        qualified: true,
        rawClusterTotal,
        clusterWeight: Math.min(clusterWeight, 48.0),  // Cap at 48
        selectedSubjects
    }
}

/**
 * Assign tier based on cluster weight
 */
function assignTier(weight: number): "A" | "B" | "C" {
    if (weight >= 40) return "A"
    if (weight >= 35) return "B"
    return "C"
}

/**
 * Calculate cluster weights for ALL 20 categories
 */
export function calculateAllClusters(
    categories: ClusterCategory[],
    subjectGrades: Record<string, string>
): CalculationSummary {
    // Validation: Check minimum subjects
    const subjectCount = Object.keys(subjectGrades).length
    if (subjectCount < 7) {
        return {
            success: false,
            totalKCSEPoints: 0,
            allSubjectsSorted: [],
            clusterResults: [],
            errorMessage: `You must enter at least 7 subjects. You entered ${subjectCount} subject${subjectCount === 1 ? '' : 's'}.`
        }
    }

    // Validation: Check valid grades
    const invalidGrades: string[] = []
    for (const [subject, grade] of Object.entries(subjectGrades)) {
        if (!isValidGrade(grade)) {
            invalidGrades.push(`${subject}: ${grade}`)
        }
    }

    if (invalidGrades.length > 0) {
        return {
            success: false,
            totalKCSEPoints: 0,
            allSubjectsSorted: [],
            clusterResults: [],
            errorMessage: `Invalid grades: ${invalidGrades.join(", ")}`
        }
    }

    // Calculate total KCSE points (same for all clusters)
    const totalKCSEPoints = calculateTotalKCSEPoints(subjectGrades)
    const allSubjectsSorted = convertAndSortSubjects(subjectGrades)

    // Calculate cluster weight for EACH category
    const clusterResults: ClusterResult[] = []

    for (const category of categories) {
        const result = calculateClusterForCategory(category, subjectGrades, totalKCSEPoints)

        // Assign tier if qualified
        if (result.qualified && result.clusterWeight !== undefined) {
            result.tier = assignTier(result.clusterWeight)
        }

        clusterResults.push(result)
    }

    // Sort results by cluster ID (CL01, CL02, ..., CL20)
    clusterResults.sort((a, b) => {
        return a.categoryId.localeCompare(b.categoryId)
    })

    return {
        success: true,
        totalKCSEPoints,
        allSubjectsSorted,
        clusterResults
    }
}

/**
 * Round to 1 decimal place
 */
export function roundToOneDecimal(value: number): number {
    return Math.round(value * 10) / 10
}

/**
 * Calculate mean grade from points (for display only)
 */
export function calculateMeanGradeFromPoints(totalPoints: number): string {
    const avgPoints = totalPoints / 7

    // Find closest grade
    let closestGrade = "E"
    let closestDiff = Math.abs(avgPoints - 1)

    for (const [grade, points] of Object.entries(GRADE_POINTS)) {
        const diff = Math.abs(avgPoints - points)
        if (diff < closestDiff) {
            closestDiff = diff
            closestGrade = grade
        }
    }

    return closestGrade
}
