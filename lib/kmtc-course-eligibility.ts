import { supabase } from "./supabase"
import { compareMeanGrades } from "./grade-utils"

export interface KmtcCourse {
  programme_name: string
  programme_code: string
  institution: string
  institution_name: string
  county: string
}

export async function fetchKmtcCourses(
  meanGrade: string,
  subjectGrades: Record<string, string>,
): Promise<KmtcCourse[]> {
  try {
    console.log("🎯 Starting KMTC course eligibility check...")
    console.log("📊 User mean grade:", meanGrade)
    console.log("📚 User subjects:", Object.keys(subjectGrades).length)

    // Fetch all KMTC programmes
    const { data: programmes, error: programmesError } = await supabase.from("kmtc_programmes").select("*")

    if (programmesError) {
      console.error("❌ Error fetching KMTC programmes:", programmesError)
      throw programmesError
    }

    if (!programmes || programmes.length === 0) {
      console.log("⚠️ No KMTC programmes found")
      return []
    }

    console.log(`📋 Found ${programmes.length} KMTC programmes to check`)

    // Fetch subject codes for abbreviation mapping
    const { data: subjectCodes, error: subjectCodesError } = await supabase
      .from("subject_codes")
      .select("code, abbreviation")

    if (subjectCodesError) {
      console.error("❌ Error fetching subject codes:", subjectCodesError)
      throw subjectCodesError
    }

    // Create mapping from code to abbreviation
    const codeToAbbreviation: Record<string, string> = {}
    if (subjectCodes) {
      subjectCodes.forEach((subject) => {
        if (subject.code && subject.abbreviation) {
          codeToAbbreviation[subject.code] = subject.abbreviation
        }
      })
    }

    console.log(`🔤 Loaded ${Object.keys(codeToAbbreviation).length} subject abbreviations`)

    const qualifiedCourses: KmtcCourse[] = []

    for (const programme of programmes) {
      try {
        // Check mean grade requirement
        if (!compareMeanGrades(meanGrade, programme.mean_grade)) {
          continue
        }

        // Check subject requirements
        const subjectFields = [
          programme.subject_1,
          programme.subject_2,
          programme.subject_3,
          programme.subject_4,
        ].filter((field) => field && field.trim() !== "")

        if (subjectFields.length > 0) {
          // Convert subject codes to abbreviations in user grades
          const userGradesWithAbbreviations: Record<string, string> = {}

          // Add original grades
          Object.entries(subjectGrades).forEach(([code, grade]) => {
            userGradesWithAbbreviations[code] = grade

            // Also add by abbreviation if available
            const abbreviation = codeToAbbreviation[code]
            if (abbreviation) {
              userGradesWithAbbreviations[abbreviation] = grade
            }
          })

          // Check if user meets subject requirements
          if (!checkKmtcSubjectRequirements(subjectFields, userGradesWithAbbreviations)) {
            continue
          }
        }

        // If we reach here, the course is qualified
        qualifiedCourses.push({
          programme_name: programme.programme_name,
          programme_code: programme.programme_code,
          institution: programme.institution,
          institution_name: programme.institution_name,
          county: programme.county,
        })
      } catch (error) {
        console.error(`❌ Error processing programme ${programme.programme_code}:`, error)
        continue
      }
    }

    console.log(`✅ Found ${qualifiedCourses.length} qualified KMTC courses`)
    return qualifiedCourses
  } catch (error) {
    console.error("❌ Error in fetchKmtcCourses:", error)
    throw error
  }
}

function checkKmtcSubjectRequirements(subjectFields: string[], userSubjectGrades: Record<string, string>): boolean {
  for (const field of subjectFields) {
    if (!field || field.trim() === "") continue

    try {
      // Parse KMTC subject format: "MAT A / BIO / ENG : B+"
      const parts = field.split(":")
      if (parts.length !== 2) {
        console.warn(`⚠️ Invalid KMTC subject format: ${field}`)
        continue
      }

      const subjectPart = parts[0].trim()
      const requiredGrade = parts[1].trim()

      // Split subjects by '/'
      const subjects = subjectPart.split("/").map((s) => s.trim())

      let hasQualifyingGrade = false

      for (const subject of subjects) {
        // Try to find user's grade for this subject
        const userGrade = userSubjectGrades[subject] || userSubjectGrades[subject.toUpperCase()]

        if (userGrade && compareMeanGrades(userGrade, requiredGrade)) {
          hasQualifyingGrade = true
          break
        }
      }

      if (!hasQualifyingGrade) {
        return false
      }
    } catch (error) {
      console.error(`❌ Error parsing subject requirement: ${field}`, error)
      return false
    }
  }

  return true
}
