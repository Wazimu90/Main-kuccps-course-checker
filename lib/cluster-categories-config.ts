/**
 * KUCCPS OFFICIAL 20 CLUSTER CATEGORIES
 * 
 * Each category represents a family of degree programs.
 * Each has a predefined 4-subject pattern.
 * The same formula is applied to each, but with different subject combinations.
 */

export interface SubjectSlot {
    alternatives: string[]  // Pick highest scoring from these alternatives
}

export interface ClusterCategory {
    id: string
    name: string
    description: string
    examplePrograms: string[]
    subjectSlots: SubjectSlot[]  // Exactly 4 slots
}

export const CLUSTER_CATEGORIES: ClusterCategory[] = [
    {
        id: "CL01",
        name: "Law",
        description: "Legal studies and related programs",
        examplePrograms: [
            "Bachelor of Laws (LLB)",
            "Bachelor of Arts in Law",
            "Legal Studies"
        ],
        subjectSlots: [
            { alternatives: ["English"] },
            { alternatives: ["Kiswahili"] },
            { alternatives: ["History", "Geography"] },
            { alternatives: ["Mathematics", "Physics", "Chemistry", "Biology", "Business Studies", "Economics", "CRE", "IRE", "HRE"] }  // Any
        ]
    },
    {
        id: "CL02",
        name: "Business, Hospitality & Related",
        description: "Business administration, commerce, hospitality",
        examplePrograms: [
            "Bachelor of Commerce",
            "Bachelor of Business Administration",
            "Hotel & Hospitality Management",
            "Tourism Management"
        ],
        subjectSlots: [
            { alternatives: ["Mathematics"] },
            { alternatives: ["Business Studies", "Economics", "Geography"] },
            { alternatives: ["English"] },
            { alternatives: ["Kiswahili", "Physics", "Chemistry", "Biology", "History", "CRE", "IRE", "HRE"] }  // Any
        ]
    },
    {
        id: "CL03",
        name: "Social Sciences, Media, Fine Arts & Related",
        description: "Sociology, psychology, journalism, communication",
        examplePrograms: [
            "Bachelor of Arts in Sociology",
            "Mass Communication",
            "Journalism",
            "Psychology",
            "Fine Arts"
        ],
        subjectSlots: [
            { alternatives: ["English"] },
            { alternatives: ["Kiswahili"] },
            { alternatives: ["History", "Geography"] },
            { alternatives: ["Mathematics", "Physics", "Chemistry", "Biology", "Business Studies", "Economics"] }  // Any
        ]
    },
    {
        id: "CL04",
        name: "Geosciences & Related",
        description: "Geology, meteorology, earth sciences",
        examplePrograms: [
            "Bachelor of Science in Geology",
            "Meteorology",
            "Environmental Geoscience",
            "Geospatial Engineering"
        ],
        subjectSlots: [
            { alternatives: ["Geography"] },
            { alternatives: ["Mathematics"] },
            { alternatives: ["Physics", "Chemistry"] },
            { alternatives: ["Biology", "English", "Kiswahili"] }  // Any
        ]
    },
    {
        id: "CL05",
        name: "Engineering & Related",
        description: "All engineering disciplines",
        examplePrograms: [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Chemical Engineering"
        ],
        subjectSlots: [
            { alternatives: ["Mathematics"] },
            { alternatives: ["Physics"] },
            { alternatives: ["Chemistry"] },
            { alternatives: ["English", "Kiswahili"] }
        ]
    },
    {
        id: "CL06",
        name: "Architecture & Related",
        description: "Architecture, urban planning, construction",
        examplePrograms: [
            "Bachelor of Architecture",
            "Urban & Regional Planning",
            "Quantity Surveying",
            "Construction Management"
        ],
        subjectSlots: [
            { alternatives: ["Mathematics"] },
            { alternatives: ["Physics"] },
            { alternatives: ["Geography"] },
            { alternatives: ["English", "Kiswahili"] }
        ]
    },
    {
        id: "CL07",
        name: "Computing, IT & Related",
        description: "Computer science, information technology",
        examplePrograms: [
            "Computer Science",
            "Information Technology",
            "Software Engineering",
            "Data Science"
        ],
        subjectSlots: [
            { alternatives: ["Mathematics"] },
            { alternatives: ["Physics"] },
            { alternatives: ["Chemistry", "Biology", "Geography"] },
            { alternatives: ["English", "Kiswahili"] }
        ]
    },
    {
        id: "CL08",
        name: "Agribusiness & Related",
        description: "Agricultural economics, agribusiness management",
        examplePrograms: [
            "Agribusiness Management",
            "Agricultural Economics",
            "Food Science & Technology"
        ],
        subjectSlots: [
            { alternatives: ["Biology"] },
            { alternatives: ["Chemistry"] },
            { alternatives: ["Agriculture", "Geography"] },
            { alternatives: ["Mathematics"] }
        ]
    },
    {
        id: "CL09",
        name: "General Sciences & Related",
        description: "Pure sciences - biology, chemistry, physics",
        examplePrograms: [
            "Bachelor of Science (General)",
            "Biochemistry",
            "Microbiology",
            "Biotechnology"
        ],
        subjectSlots: [
            { alternatives: ["Mathematics"] },
            { alternatives: ["Biology"] },
            { alternatives: ["Chemistry", "Physics"] },
            { alternatives: ["Geography"] }
        ]
    },
    {
        id: "CL10",
        name: "Actuarial Science & Related",
        description: "Actuarial science, statistics, financial mathematics",
        examplePrograms: [
            "Actuarial Science",
            "Statistics",
            "Financial Mathematics",
            "Quantitative Economics"
        ],
        subjectSlots: [
            { alternatives: ["Mathematics"] },
            { alternatives: ["Physics", "Chemistry"] },  // Best quantitative science
            { alternatives: ["Economics", "Geography"] },
            { alternatives: ["English"] }
        ]
    },
    {
        id: "CL11",
        name: "Interior Design & Related",
        description: "Interior design, spatial design",
        examplePrograms: [
            "Interior Design",
            "Spatial Planning",
            "Design & Creative Media"
        ],
        subjectSlots: [
            { alternatives: ["Mathematics"] },
            { alternatives: ["Physics"] },
            { alternatives: ["Art & Design"] },
            { alternatives: ["English", "Kiswahili"] }
        ]
    },
    {
        id: "CL12",
        name: "Sports Science & Related",
        description: "Sports science, physical education, recreation",
        examplePrograms: [
            "Sports Science",
            "Physical Education",
            "Recreation Management"
        ],
        subjectSlots: [
            { alternatives: ["Biology"] },
            { alternatives: ["Chemistry"] },
            { alternatives: ["English"] },
            { alternatives: ["Mathematics", "Physics", "Geography", "History"] }  // Any
        ]
    },
    {
        id: "CL13",
        name: "Medicine, Health & Related",
        description: "Medicine, nursing, pharmacy, clinical medicine",
        examplePrograms: [
            "Medicine & Surgery (MBChB)",
            "Bachelor of Pharmacy",
            "Nursing",
            "Clinical Medicine",
            "Dental Surgery"
        ],
        subjectSlots: [
            { alternatives: ["Biology"] },
            { alternatives: ["Chemistry"] },
            { alternatives: ["Mathematics", "Physics"] },
            { alternatives: ["English", "Kiswahili"] }
        ]
    },
    {
        id: "CL14",
        name: "History & Archeology",
        description: "Historical studies, archeology, heritage",
        examplePrograms: [
            "Bachelor of Arts in History",
            "Archeology",
            "Museum & Heritage Studies"
        ],
        subjectSlots: [
            { alternatives: ["History"] },
            { alternatives: ["Geography"] },
            { alternatives: ["English", "Kiswahili"] },
            { alternatives: ["Mathematics", "CRE", "IRE", "HRE"] }  // Any
        ]
    },
    {
        id: "CL15",
        name: "Environmental Science & Related",
        description: "Environmental science, conservation, ecology",
        examplePrograms: [
            "Environmental Science",
            "Wildlife Management",
            "Conservation Biology",
            "Environmental Health"
        ],
        subjectSlots: [
            { alternatives: ["Geography"] },
            { alternatives: ["Biology"] },
            { alternatives: ["Chemistry"] },
            { alternatives: ["Mathematics", "Physics"] }
        ]
    },
    {
        id: "CL16",
        name: "Geography & Related",
        description: "Geography, GIS, spatial analysis",
        examplePrograms: [
            "Bachelor of Arts in Geography",
            "GIS & Remote Sensing",
            "Surveying"
        ],
        subjectSlots: [
            { alternatives: ["Geography"] },
            { alternatives: ["Mathematics"] },
            { alternatives: ["Biology", "Chemistry"] },
            { alternatives: ["English"] }
        ]
    },
    {
        id: "CL17",
        name: "French & German",
        description: "Foreign languages - French and German",
        examplePrograms: [
            "Bachelor of Arts in French",
            "Bachelor of Arts in German",
            "Foreign Languages & Linguistics"
        ],
        subjectSlots: [
            { alternatives: ["French", "German"] },
            { alternatives: ["English"] },
            { alternatives: ["Kiswahili"] },
            { alternatives: ["History", "Geography", "CRE", "IRE", "HRE"] }  // Any
        ]
    },
    {
        id: "CL18",
        name: "Music & Related",
        description: "Music, performing arts",
        examplePrograms: [
            "Bachelor of Music",
            "Music Education",
            "Performing Arts"
        ],
        subjectSlots: [
            { alternatives: ["Music"] },
            { alternatives: ["English"] },
            { alternatives: ["Kiswahili", "History", "Geography"] },  // Any
            { alternatives: ["Mathematics", "Physics", "Chemistry", "Biology"] }  // Any
        ]
    },
    {
        id: "CL19",
        name: "Education & Related",
        description: "Education (Arts & Sciences)",
        examplePrograms: [
            "Bachelor of Education (Arts)",
            "Bachelor of Education (Science)",
            "Early Childhood Education"
        ],
        subjectSlots: [
            { alternatives: ["Mathematics", "English", "Kiswahili", "Biology", "Chemistry", "Physics", "Geography", "History", "CRE", "IRE", "HRE"] },  // Teaching Subject 1
            { alternatives: ["Mathematics", "English", "Kiswahili", "Biology", "Chemistry", "Physics", "Geography", "History", "CRE", "IRE", "HRE"] },  // Teaching Subject 2
            { alternatives: ["English"] },
            { alternatives: ["Kiswahili", "Mathematics", "Physics", "Chemistry", "Biology", "Geography", "History"] }  // Any
        ]
    },
    {
        id: "CL20",
        name: "Religious Studies, Theology & Related",
        description: "Religious education, theology, Islamic studies",
        examplePrograms: [
            "Bachelor of Arts in Religious Studies",
            "Theology",
            "Islamic Studies",
            "Philosophy & Religious Studies"
        ],
        subjectSlots: [
            { alternatives: ["CRE", "IRE", "HRE"] },
            { alternatives: ["History", "Geography"] },
            { alternatives: ["English", "Kiswahili"] },
            { alternatives: ["Mathematics", "Physics", "Chemistry", "Biology"] }  // Any
        ]
    }
]

/**
 * Get all cluster categories
 */
export function getAllClusterCategories(): ClusterCategory[] {
    return CLUSTER_CATEGORIES
}

/**
 * Get cluster category by ID
 */
export function getClusterCategoryById(id: string): ClusterCategory | undefined {
    return CLUSTER_CATEGORIES.find(cat => cat.id === id)
}
