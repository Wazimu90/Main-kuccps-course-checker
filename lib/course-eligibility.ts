import { supabase, testSupabaseConnection } from "./supabase"
import { compareMeanGrades, checkSubjectRequirements } from "./grade-utils"
import { deduplicateCourses } from "./utils"

export interface EligibleCourse {
  programme_name?: string
  course_name: string
  programme_code: string
  institution_name: string
  institution_type?: string
  location?: string
  campus?: string
  type?: string
  cutoff?: number
  cluster?: number
}

export async function fetchEligibleCourses(
  selectedCategory: string,
  meanGrade: string,
  subjectGrades: Record<string, string>,
  clusterWeights?: Record<string, number>,
): Promise<EligibleCourse[]> {
  console.log(`🚀 Starting ${selectedCategory} course eligibility check`)

  const connectionOk = await testSupabaseConnection()
  if (!connectionOk) {
    console.error("❌ Supabase connection failed")
    return []
  }

  try {
    let courses: EligibleCourse[] = []
    switch (selectedCategory.toLowerCase()) {
      case "degree":
        courses = await fetchDegreeCourses(meanGrade, subjectGrades, clusterWeights || {})
        break
      case "diploma":
        courses = await fetchDiplomaCourses(meanGrade, subjectGrades)
        break
      case "certificate":
        courses = await fetchCertificateCourses(meanGrade, subjectGrades)
        break
      case "kmtc":
        courses = await fetchKMTCCourses(meanGrade, subjectGrades)
        break
      default:
        console.error(`❌ Unknown category: ${selectedCategory}`)
        return []
    }

    // Deduplicate courses based on programme_code
    const deduplicatedCourses = deduplicateCourses(courses)

    console.log(`✅ Deduplicated from ${courses.length} to ${deduplicatedCourses.length} courses`)
    return deduplicatedCourses

  } catch (error) {
    console.error("❌ Error fetching eligible courses:", error)
    return []
  }
}

async function fetchDegreeCourses(
  meanGrade: string,
  subjectGrades: Record<string, string>,
  clusterWeights: Record<string, number>,
): Promise<EligibleCourse[]> {
  console.log(`🎓 Processing ${Object.keys(clusterWeights).length} clusters in parallel`)

  // Process all clusters in parallel
  const clusterPromises = Object.entries(clusterWeights).map(async ([clusterNumber, userClusterWeight]) => {
    try {
      // Step 1: Query degree_programme_clusters by cluster number
      const { data: clusterCourses, error: clusterError } = await supabase
        .from("degree_programme_clusters")
        .select("programme_code, course_name, institution_name, institution_type, county")
        .eq("cluster_number", Number.parseInt(clusterNumber))

      if (clusterError || !clusterCourses || clusterCourses.length === 0) {
        return []
      }

      // Step 2: Process courses in this cluster
      const coursePromises = clusterCourses.map(async (course) => {
        try {
          // Step 3: Get programme details using programme_code
          const { data: programmeList, error: progError } = await supabase
            .from("degree_programmes")
            .select("programme_name, cutoff_2023, subject_1, subject_2, subject_3, subject_4")
            .eq("programme_code", course.programme_code)
            .limit(1)

          if (progError || !programmeList || programmeList.length === 0) {
            return null
          }

          const programmeData = programmeList[0]

          // Step 4: Check cutoff points
          const cutoff = programmeData.cutoff_2023
          if (cutoff !== null && cutoff !== undefined && cutoff !== "" && userClusterWeight < cutoff) {
            return null
          }

          // Step 5: Check subject requirements (skip empty fields)
          const subjectFields = [
            programmeData.subject_1,
            programmeData.subject_2,
            programmeData.subject_3,
            programmeData.subject_4,
          ].filter((field) => field && field.trim() !== "")

          if (subjectFields.length > 0 && !checkSubjectRequirements(subjectFields, subjectGrades)) {
            return null
          }

          // Step 6: Return eligible course
          return {
            course_name: course.course_name,
            programme_code: course.programme_code,
            institution_name: course.institution_name,
            institution_type: course.institution_type,
            location: course.county,
            cutoff: programmeData.cutoff_2023,
            cluster: Number.parseInt(clusterNumber),
          }
        } catch (error) {
          return null
        }
      })

      const clusterResults = await Promise.all(coursePromises)
      return clusterResults.filter((course) => course !== null)
    } catch (error) {
      console.error(`❌ Error processing cluster ${clusterNumber}:`, error)
      return []
    }
  })

  // Wait for all clusters to complete
  const allClusterResults = await Promise.all(clusterPromises)
  const eligibleCourses = allClusterResults.flat()

  console.log(`✅ Found ${eligibleCourses.length} eligible degree courses`)
  return eligibleCourses
}

async function fetchDiplomaCourses(
  meanGrade: string,
  subjectGrades: Record<string, string>,
): Promise<EligibleCourse[]> {
  console.log("🎓 Processing diploma courses")

  const { data: programmes, error: progError } = await supabase
    .from("diploma_programmes")
    .select("programme_name, programme_code, institution_name, mean_grade, subject_1, subject_2, subject_3, subject_4")

  if (progError || !programmes) {
    console.error("❌ Error fetching diploma programmes:", progError)
    return []
  }

  const { data: institutions, error: instError } = await supabase
    .from("institutions")
    .select("institution_name, location")

  const institutionMap = new Map(institutions?.map((inst) => [inst.institution_name, inst.location]) || [])

  const eligibleCourses: EligibleCourse[] = []

  for (const programme of programmes) {
    // Check mean grade
    if (!compareMeanGrades(meanGrade, programme.mean_grade)) {
      continue
    }

    // Check subject requirements (skip empty fields)
    const subjectFields = [programme.subject_1, programme.subject_2, programme.subject_3, programme.subject_4].filter(
      (field) => field && field.trim() !== "",
    )

    if (subjectFields.length > 0 && !checkSubjectRequirements(subjectFields, subjectGrades)) {
      continue
    }

    eligibleCourses.push({
      course_name: programme.programme_name,
      programme_code: programme.programme_code,
      institution_name: programme.institution_name,
      location: institutionMap.get(programme.institution_name),
    })
  }

  console.log(`✅ Found ${eligibleCourses.length} eligible diploma courses`)
  return eligibleCourses
}

async function fetchCertificateCourses(
  meanGrade: string,
  subjectGrades: Record<string, string>,
): Promise<EligibleCourse[]> {
  console.log("🎓 Processing certificate courses")

  const { data: programmes, error: progError } = await supabase
    .from("certificate_programmes")
    .select("programme_name, programme_code, institution_name, mean_grade, subject_1, subject_2, subject_3, subject_4")

  if (progError || !programmes) {
    console.error("❌ Error fetching certificate programmes:", progError)
    return []
  }

  const eligibleCourses: EligibleCourse[] = []

  for (const programme of programmes) {
    if (!compareMeanGrades(meanGrade, programme.mean_grade)) {
      continue
    }

    const subjectFields = [programme.subject_1, programme.subject_2, programme.subject_3, programme.subject_4].filter(
      (field) => field && field.trim() !== "",
    )

    if (subjectFields.length > 0 && !checkSubjectRequirements(subjectFields, subjectGrades)) {
      continue
    }

    eligibleCourses.push({
      course_name: programme.programme_name,
      programme_code: programme.programme_code,
      institution_name: programme.institution_name,
    })
  }

  console.log(`✅ Found ${eligibleCourses.length} eligible certificate courses`)
  return eligibleCourses
}

async function fetchKMTCCourses(meanGrade: string, subjectGrades: Record<string, string>): Promise<EligibleCourse[]> {
  console.log("🎓 Processing KMTC courses")

  const { data: programmes, error: progError } = await supabase
    .from("kmtc_programmes")
    .select("programme_name, programme_code, campus, mean_grade, subject_1, subject_2, subject_3, subject_4")

  if (progError || !programmes) {
    console.error("❌ Error fetching KMTC programmes:", progError)
    return []
  }

  const eligibleCourses: EligibleCourse[] = []

  for (const programme of programmes) {
    if (!compareMeanGrades(meanGrade, programme.mean_grade)) {
      continue
    }

    const subjectFields = [programme.subject_1, programme.subject_2, programme.subject_3, programme.subject_4].filter(
      (field) => field && field.trim() !== "",
    )

    if (subjectFields.length > 0 && !checkSubjectRequirements(subjectFields, subjectGrades)) {
      continue
    }

    eligibleCourses.push({
      course_name: programme.programme_name,
      programme_code: programme.programme_code,
      campus: programme.campus,
    })
  }

  console.log(`✅ Found ${eligibleCourses.length} eligible KMTC courses`)
  return eligibleCourses
}
