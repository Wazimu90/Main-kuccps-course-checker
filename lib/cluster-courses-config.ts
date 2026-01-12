/**
 * KUCCPS Cluster Calculator - Course Configuration
 * 
 * Each course defines which subjects are required for each cluster group (G1-G4).
 * The calculator will automatically select the best scoring subject from each group.
 */

export interface ClusterGroup {
    group: "G1" | "G2" | "G3" | "G4"
    required: string[]  // Subject names - exact match required
}

export interface CourseCluster {
    id: string
    name: string
    clusters: ClusterGroup[]
}

/**
 * IMPORTANT: Subject names must match EXACTLY with user input
 * Common KCSE subject names:
 * - Mathematics, English, Kiswahili
 * - Physics, Chemistry, Biology
 * - Geography, History, CRE, IRE, HRE
 * - Business Studies, Agriculture, Home Science
 * - Computer Studies, Art & Design, Music
 * - French, German, Arabic, Kenyan Sign Language
 */

export const CLUSTER_COURSES: CourseCluster[] = [
    // ==================== ENGINEERING & TECHNOLOGY ====================
    {
        id: "eng-001",
        name: "Bachelor of Science in Computer Science",
        clusters: [
            { group: "G1", required: ["Mathematics"] },
            { group: "G2", required: ["Physics"] },
            { group: "G3", required: ["Biology", "Chemistry", "Geography", "Computer Studies"] },
            { group: "G4", required: ["English", "Kiswahili", "French", "German", "Arabic"] }
        ]
    },
    {
        id: "eng-002",
        name: "Bachelor of Science in Electrical & Electronic Engineering",
        clusters: [
            { group: "G1", required: ["Mathematics"] },
            { group: "G2", required: ["Physics"] },
            { group: "G3", required: ["Chemistry"] },
            { group: "G4", required: ["English", "Kiswahili", "Biology", "Geography"] }
        ]
    },
    {
        id: "eng-003",
        name: "Bachelor of Science in Mechanical Engineering",
        clusters: [
            { group: "G1", required: ["Mathematics"] },
            { group: "G2", required: ["Physics"] },
            { group: "G3", required: ["Chemistry"] },
            { group: "G4", required: ["English", "Kiswahili", "Biology", "Geography"] }
        ]
    },
    {
        id: "eng-004",
        name: "Bachelor of Science in Civil Engineering",
        clusters: [
            { group: "G1", required: ["Mathematics"] },
            { group: "G2", required: ["Physics"] },
            { group: "G3", required: ["Chemistry", "Geography"] },
            { group: "G4", required: ["English", "Kiswahili", "Biology"] }
        ]
    },
    {
        id: "eng-005",
        name: "Bachelor of Science in Information Technology",
        clusters: [
            { group: "G1", required: ["Mathematics"] },
            { group: "G2", required: ["Physics", "Chemistry"] },
            { group: "G3", required: ["Biology", "Geography", "Computer Studies"] },
            { group: "G4", required: ["English", "Kiswahili"] }
        ]
    },

    // ==================== HEALTH SCIENCES ====================
    {
        id: "med-001",
        name: "Bachelor of Medicine and Bachelor of Surgery (MBChB)",
        clusters: [
            { group: "G1", required: ["Mathematics", "Physics"] },
            { group: "G2", required: ["Chemistry"] },
            { group: "G3", required: ["Biology"] },
            { group: "G4", required: ["English", "Kiswahili"] }
        ]
    },
    {
        id: "med-002",
        name: "Bachelor of Dental Surgery",
        clusters: [
            { group: "G1", required: ["Mathematics", "Physics"] },
            { group: "G2", required: ["Chemistry"] },
            { group: "G3", required: ["Biology"] },
            { group: "G4", required: ["English", "Kiswahili"] }
        ]
    },
    {
        id: "med-003",
        name: "Bachelor of Pharmacy",
        clusters: [
            { group: "G1", required: ["Mathematics", "Physics"] },
            { group: "G2", required: ["Chemistry"] },
            { group: "G3", required: ["Biology"] },
            { group: "G4", required: ["English", "Kiswahili"] }
        ]
    },
    {
        id: "med-004",
        name: "Bachelor of Science in Nursing",
        clusters: [
            { group: "G1", required: ["Mathematics", "Physics"] },
            { group: "G2", required: ["Chemistry", "Biology"] },
            { group: "G3", required: ["English", "Kiswahili"] },
            { group: "G4", required: ["Geography", "CRE", "IRE", "HRE", "History"] }
        ]
    },
    {
        id: "med-005",
        name: "Bachelor of Science in Clinical Medicine",
        clusters: [
            { group: "G1", required: ["Mathematics", "Physics"] },
            { group: "G2", required: ["Chemistry"] },
            { group: "G3", required: ["Biology"] },
            { group: "G4", required: ["English", "Kiswahili"] }
        ]
    },

    // ==================== PURE SCIENCES ====================
    {
        id: "sci-001",
        name: "Bachelor of Science in Mathematics",
        clusters: [
            { group: "G1", required: ["Mathematics"] },
            { group: "G2", required: ["Physics", "Chemistry"] },
            { group: "G3", required: ["Biology", "Geography", "Computer Studies"] },
            { group: "G4", required: ["English", "Kiswahili"] }
        ]
    },
    {
        id: "sci-002",
        name: "Bachelor of Science in Physics",
        clusters: [
            { group: "G1", required: ["Mathematics"] },
            { group: "G2", required: ["Physics"] },
            { group: "G3", required: ["Chemistry"] },
            { group: "G4", required: ["English", "Kiswahili", "Biology", "Geography"] }
        ]
    },
    {
        id: "sci-003",
        name: "Bachelor of Science in Chemistry",
        clusters: [
            { group: "G1", required: ["Mathematics"] },
            { group: "G2", required: ["Chemistry"] },
            { group: "G3", required: ["Physics", "Biology"] },
            { group: "G4", required: ["English", "Kiswahili"] }
        ]
    },
    {
        id: "sci-004",
        name: "Bachelor of Science in Biological Sciences",
        clusters: [
            { group: "G1", required: ["Mathematics", "Physics"] },
            { group: "G2", required: ["Biology"] },
            { group: "G3", required: ["Chemistry"] },
            { group: "G4", required: ["English", "Kiswahili", "Geography", "Agriculture"] }
        ]
    },

    // ==================== BUSINESS & ECONOMICS ====================
    {
        id: "bus-001",
        name: "Bachelor of Commerce",
        clusters: [
            { group: "G1", required: ["Mathematics"] },
            { group: "G2", required: ["English", "Kiswahili"] },
            { group: "G3", required: ["Business Studies", "Economics", "Geography", "CRE", "IRE", "HRE"] },
            { group: "G4", required: ["Physics", "Chemistry", "Biology", "History"] }
        ]
    },
    {
        id: "bus-002",
        name: "Bachelor of Business Administration",
        clusters: [
            { group: "G1", required: ["Mathematics"] },
            { group: "G2", required: ["English", "Kiswahili"] },
            { group: "G3", required: ["Business Studies", "Economics", "Geography"] },
            { group: "G4", required: ["Physics", "Chemistry", "Biology", "History", "CRE", "IRE", "HRE"] }
        ]
    },
    {
        id: "bus-003",
        name: "Bachelor of Economics",
        clusters: [
            { group: "G1", required: ["Mathematics"] },
            { group: "G2", required: ["English", "Kiswahili"] },
            { group: "G3", required: ["Business Studies", "Economics", "Geography", "History"] },
            { group: "G4", required: ["Physics", "Chemistry", "Biology"] }
        ]
    },
    {
        id: "bus-004",
        name: "Bachelor of Science in Actuarial Science",
        clusters: [
            { group: "G1", required: ["Mathematics"] },
            { group: "G2", required: ["Physics", "Chemistry"] },
            { group: "G3", required: ["Business Studies", "Economics", "Geography"] },
            { group: "G4", required: ["English", "Kiswahili"] }
        ]
    },

    // ==================== EDUCATION ====================
    {
        id: "edu-001",
        name: "Bachelor of Education (Science)",
        clusters: [
            { group: "G1", required: ["Mathematics"] },
            { group: "G2", required: ["Physics", "Chemistry", "Biology"] },
            { group: "G3", required: ["English", "Kiswahili"] },
            { group: "G4", required: ["Geography", "CRE", "IRE", "HRE", "History"] }
        ]
    },
    {
        id: "edu-002",
        name: "Bachelor of Education (Arts)",
        clusters: [
            { group: "G1", required: ["English", "Kiswahili"] },
            { group: "G2", required: ["History", "Geography", "CRE", "IRE", "HRE"] },
            { group: "G3", required: ["Mathematics"] },
            { group: "G4", required: ["Physics", "Chemistry", "Biology", "Business Studies"] }
        ]
    },

    // ==================== AGRICULTURE ====================
    {
        id: "agr-001",
        name: "Bachelor of Science in Agriculture",
        clusters: [
            { group: "G1", required: ["Mathematics", "Physics"] },
            { group: "G2", required: ["Chemistry", "Biology"] },
            { group: "G3", required: ["Agriculture", "Geography"] },
            { group: "G4", required: ["English", "Kiswahili"] }
        ]
    },
    {
        id: "agr-002",
        name: "Bachelor of Science in Agricultural Economics",
        clusters: [
            { group: "G1", required: ["Mathematics"] },
            { group: "G2", required: ["Agriculture", "Biology", "Chemistry"] },
            { group: "G3", required: ["Business Studies", "Economics", "Geography"] },
            { group: "G4", required: ["English", "Kiswahili"] }
        ]
    },

    // ==================== LAW & SOCIAL SCIENCES ====================
    {
        id: "law-001",
        name: "Bachelor of Laws (LLB)",
        clusters: [
            { group: "G1", required: ["English", "Kiswahili"] },
            { group: "G2", required: ["History", "Geography", "CRE", "IRE", "HRE"] },
            { group: "G3", required: ["Mathematics"] },
            { group: "G4", required: ["Business Studies", "Economics", "Physics", "Chemistry", "Biology"] }
        ]
    },
    {
        id: "soc-001",
        name: "Bachelor of Arts in Sociology",
        clusters: [
            { group: "G1", required: ["English", "Kiswahili"] },
            { group: "G2", required: ["History", "Geography", "CRE", "IRE", "HRE"] },
            { group: "G3", required: ["Mathematics"] },
            { group: "G4", required: ["Business Studies", "Economics", "Physics", "Chemistry", "Biology"] }
        ]
    },

    // ==================== ARCHITECTURE & DESIGN ====================
    {
        id: "arc-001",
        name: "Bachelor of Architecture",
        clusters: [
            { group: "G1", required: ["Mathematics"] },
            { group: "G2", required: ["Physics"] },
            { group: "G3", required: ["Geography", "Art & Design"] },
            { group: "G4", required: ["English", "Kiswahili", "Chemistry"] }
        ]
    },
]

/**
 * Get course by ID
 */
export function getCourseById(courseId: string): CourseCluster | undefined {
    return CLUSTER_COURSES.find(course => course.id === courseId)
}

/**
 * Get course by name (case-insensitive partial match)
 */
export function getCourseByName(courseName: string): CourseCluster | undefined {
    const searchTerm = courseName.toLowerCase().trim()
    return CLUSTER_COURSES.find(course =>
        course.name.toLowerCase().includes(searchTerm)
    )
}

/**
 * Get all available courses sorted by name
 */
export function getAllCourses(): CourseCluster[] {
    return [...CLUSTER_COURSES].sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Get courses by category
 */
export function getCoursesByCategory(category: string): CourseCluster[] {
    const prefix = category.toLowerCase().substring(0, 3)
    return CLUSTER_COURSES.filter(course => course.id.startsWith(prefix))
}
