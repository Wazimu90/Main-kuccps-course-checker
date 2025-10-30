import { supabase, testSupabaseConnection } from "./supabase"
import { compareMeanGrades } from "./grade-utils"

export interface DiplomaCourse {
  programme_name: string
  programme_code: string
  institution: string
  institution_type: string
  institution_name: string
  county: string
  cluster_group: string
}

// Subject code to abbreviation mapping for diploma programmes
const subjectCodeMap: Record<string, string> = {
  "101": "ENG",
  "102": "KIS",
  "121": "MAT A",
  "122": "MAT B",
  "231": "BIO",
  "232": "CHEM",
  "233": "PHY",
  "311": "HAG",
  "312": "GEO",
  "313": "HSC",
  "314": "CRE",
  "315": "IRE",
  "316": "HRE",
  "317": "PHIL",
  "443": "ART",
  "444": "MUS",
  "445": "GER",
  "446": "FRE",
  "447": "ARA",
  "565": "AGR",
  "571": "WOO",
  "572": "MET",
  "573": "BLD",
  "574": "ELE",
  "575": "POW",
  "576": "AUT",
  "581": "HOM",
  "582": "FAS",
  "583": "FOO",
  "584": "LAU",
}

function parseDiplomaSubjectRequirement(subjectField: string): { subjects: string[]; requiredGrade: string } | null {
  if (!subjectField || subjectField.trim() === "") {
    return null
  }

  // Split on ':' to get subject abbreviations vs required grade
  const parts = subjectField.split(":")
  if (parts.length !== 2) {
    console.warn(`❌ Invalid diploma subject format. Missing colon: "${subjectField}"`)
    return null
  }

  const subjectPart = parts[0].trim()
  const requiredGrade = parts[1].trim()

  // Split subject abbreviations by '/' and clean them
  const subjects = subjectPart
    .split("/")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  if (subjects.length === 0) {
    console.warn(`❌ No subject abbreviations found in: "${subjectField}"`)
    return null
  }

  return { subjects, requiredGrade }
}

function checkDiplomaSubjectRequirements(
  subjectFields: (string | null | undefined)[],
  userSubjectGrades: Record<string, string>,
): boolean {
  // Skip empty fields early
  const validFields = subjectFields.filter((field) => field && field.trim() !== "")

  if (validFields.length === 0) {
    return true // No requirements to check
  }

  console.log(`🔍 Checking ${validFields.length} diploma subject requirements`)

  for (const field of validFields) {
    const parsed = parseDiplomaSubjectRequirement(field)
    if (!parsed) {
      continue // Skip invalid fields instead of failing
    }

    const { subjects, requiredGrade } = parsed
    let hasMatchingSubject = false

    console.log(`📝 Checking requirement: ${subjects.join(" / ")} : ${requiredGrade}`)

    // Check if user has any of the required subjects with sufficient grade
    for (const subjectAbbr of subjects) {
      // Find matching subject codes for this abbreviation
      const matchingCodes = Object.entries(subjectCodeMap)
        .filter(([code, abbr]) => abbr === subjectAbbr)
        .map(([code]) => code)

      for (const code of matchingCodes) {
        const userGrade = userSubjectGrades[code]
        if (userGrade && compareMeanGrades(userGrade, requiredGrade)) {
          console.log(`✅ Found matching subject: ${subjectAbbr} (${code}) with grade ${userGrade} >= ${requiredGrade}`)
          hasMatchingSubject = true
          break
        }
      }

      if (hasMatchingSubject) break
    }

    // If no matching subject found with sufficient grade, fail this requirement
    if (!hasMatchingSubject) {
      console.log(`❌ No matching subject found for requirement: ${subjects.join(" / ")} : ${requiredGrade}`)
      return false
    }
  }

  console.log(`✅ All diploma subject requirements met`)
  return true
}

export async function fetchDiplomaCourses(
  meanGrade: string,
  subjectGrades: Record<string, string>,
  selectedCategories: string[],
): Promise<DiplomaCourse[]> {
  console.log("🎓 Processing diploma courses")
  console.log(`📋 Selected categories: ${selectedCategories.join(", ")}`)

  const connectionOk = await testSupabaseConnection()
  if (!connectionOk) {
    console.error("❌ Supabase connection failed")
    return []
  }

  try {
    // Build query for diploma programmes
    let query = supabase
      .from("diploma_programmes")
      .select(
        "programme_name, programme_code, institution, institution_type, county, cluster_group, mean_grade, subject_1, subject_2, subject_3, subject_4",
      )

    // Filter by selected categories if provided
    if (selectedCategories.length > 0) {
      query = query.in("cluster_group", selectedCategories)
    }

    const { data: programmes, error: progError } = await query

    if (progError || !programmes) {
      console.error("❌ Error fetching diploma programmes:", progError)
      return []
    }

    console.log(`📊 Found ${programmes.length} programmes in selected categories`)

    const eligibleCourses: DiplomaCourse[] = []

    for (const programme of programmes) {
      // Check mean grade requirement
      if (!compareMeanGrades(meanGrade, programme.mean_grade)) {
        continue
      }

      // Check subject requirements using the diploma-specific logic
      const subjectFields = [programme.subject_1, programme.subject_2, programme.subject_3, programme.subject_4].filter(
        (field) => field && field.trim() !== "",
      )

      if (subjectFields.length > 0 && !checkDiplomaSubjectRequirements(subjectFields, subjectGrades)) {
        continue
      }

      eligibleCourses.push({
        programme_name: programme.programme_name,
        programme_code: programme.programme_code,
        institution: programme.institution,
        institution_type: programme.institution_type,
        county: programme.county,
        cluster_group: programme.cluster_group,
      })
    }

    console.log(`✅ Found ${eligibleCourses.length} eligible diploma courses`)
    return eligibleCourses
  } catch (error) {
    console.error("❌ Error in fetchDiplomaCourses:", error)
    return []
  }
}
