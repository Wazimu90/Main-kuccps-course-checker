import { supabase, testSupabaseConnection } from "./supabase"
import { compareMeanGrades } from "./grade-utils"

export interface CertificateCourse {
  programme_name: string
  programme_code: string
  programme_name: string
  institution: string
  institution_type?: string
  county?: string
  cluster_group: string
}

export async function fetchCertificateCourses(
  meanGrade: string,
  subjectGrades: Record<string, string>,
  courseCategories: string[],
): Promise<CertificateCourse[]> {
  console.log(`🚀 Starting certificate course eligibility check`)
  console.log(`📊 Mean Grade: ${meanGrade}`)
  console.log(`📚 Subject Grades:`, subjectGrades)
  console.log(`🎯 Selected Categories:`, courseCategories)

  const connectionOk = await testSupabaseConnection()
  if (!connectionOk) {
    console.error("❌ Supabase connection failed")
    return []
  }

  try {
    const eligibleCourses: CertificateCourse[] = []

    // ✅ Fetch subject code mappings (code → abbreviation)
    const { data: subjectCodeMap, error: subjectCodeError } = await supabase
      .from("subject_codes")
      .select("code, abbreviation")

    if (subjectCodeError || !subjectCodeMap) {
      console.error("❌ Failed to fetch subject codes:", subjectCodeError)
      return []
    }

    // Create map of code → abbreviation
    const codeToAbbr: Record<string, string> = {}
    subjectCodeMap.forEach((row) => {
      const code = String(row.code).trim()
      const abbr = String(row.abbreviation).trim().toUpperCase()
      if (code && abbr) {
        codeToAbbr[code] = abbr
      }
    })

    // Query certificate programmes
    const { data: programmes, error: progError } = await supabase
      .from("certificate_programmes")
      .select(
        "programme_name, programme_code, institution, institution_type, county, cluster_group, mean_grade, subject_1, subject_2, subject_3, subject_4",
      )
      .in("cluster_group", courseCategories)

    if (progError || !programmes) {
      console.error(`❌ Error fetching certificate programmes:`, progError)
      return []
    }

    console.log(`📋 Found ${programmes.length} programmes across selected categories`)

    for (const programme of programmes) {
      try {
        const requiredMean = programme.mean_grade?.trim().toUpperCase()
        if (!compareMeanGrades(meanGrade, requiredMean)) {
          console.log(
            `❌ Mean grade check failed for ${programme.programme_code}: user ${meanGrade} vs required ${requiredMean}`,
          )
          continue
        }

        // Collect all subject requirement fields
        const subjectFields = [
          programme.subject_1?.trim(),
          programme.subject_2?.trim(),
          programme.subject_3?.trim(),
          programme.subject_4?.trim(),
        ].filter((field) => field && field !== "")

        let subjectRequirementsMet = true

        if (subjectFields.length > 0) {
          subjectRequirementsMet = checkSubjectRequirements(subjectFields, subjectGrades, codeToAbbr)
          if (!subjectRequirementsMet) {
            console.log(`❌ Subject requirements not met for ${programme.programme_code}`)
            continue
          }
        }

        // Programme qualifies
        eligibleCourses.push({
          programme_name: programme.programme_name,
          programme_code: programme.programme_code,
          institution: programme.institution,
          institution_type: programme.institution_type,
          county: programme.county,
          cluster_group: programme.cluster_group,
        })
      } catch (error) {
        console.error(`❌ Error processing programme ${programme.programme_code}:`, error)
        continue
      }
    }

    console.log(`✅ Certificate qualification complete: ${eligibleCourses.length} courses found`)
    return eligibleCourses
  } catch (error) {
    console.error("❌ Error in certificate course eligibility check:", error)
    return []
  }
}

// Function to check subject requirements
export function checkSubjectRequirements(
  subjectRequirements: string[],
  subjectGrades: Record<string, string>,
  codeToAbbr: Record<string, string>,
): boolean {
  // Convert user subject codes → abbreviations → grades
  const userSubjectsAbbrMap: Record<string, string> = {}
  for (const [code, grade] of Object.entries(subjectGrades)) {
    const abbr = codeToAbbr[code]?.toUpperCase().trim()
    if (abbr) {
      userSubjectsAbbrMap[abbr] = grade.toUpperCase().trim()
    }
  }

  // Evaluate each subject requirement field
  for (const requirement of subjectRequirements) {
    const trimmedRequirement = requirement.trim()
    if (!trimmedRequirement.includes(":")) continue // skip invalid format

    const [subjectGroupRaw, requiredGradeRaw] = trimmedRequirement.split(":")
    const subjectGroup = subjectGroupRaw
      .split("/")
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s !== "")
    const requiredGrade = requiredGradeRaw.trim().toUpperCase()

    // ✅ Check if user has at least one subject in the group that meets or exceeds the grade
    const matched = subjectGroup.some((abbr) => {
      const userGrade = userSubjectsAbbrMap[abbr]
      return userGrade && compareMeanGrades(userGrade, requiredGrade)
    })

    // ❌ If none matched, fail the requirement
    if (!matched) return false
  }

  // ✅ All requirements passed
  return true
}
