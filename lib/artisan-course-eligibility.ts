import { supabase } from "./supabase"
import { compareMeanGrades } from "./grade-utils"
import { resolveInstitutionTypes } from "./institution-utils"

export interface ArtisanCourse {
  programme_name: string
  programme_code: string
  institution: string
  institution_name: string
  institution_type: string
  county: string
  cluster_group: string
}

export async function fetchArtisanCourses(
  userMeanGrade: string,
  courseCategories: string[],
  counties: string[],
  institutionType: string,
): Promise<ArtisanCourse[]> {
  console.log("🚀 Starting artisan course qualification process...")
  console.log("📊 User Mean Grade:", userMeanGrade)
  console.log("📋 Selected Categories:", courseCategories)
  console.log("🏛️ Selected Counties:", counties)
  console.log("🏢 Selected Institution Type:", institutionType)

  try {
    // Resolve institution types (handles 'All')
    const institutionTypes = resolveInstitutionTypes(institutionType as any)

    // Build base query
    let query = supabase.from("artisan_programmes").select("*").in("cluster_group", courseCategories).in("county", counties)

    // Apply institution type filter: eq for single, in for multiple
    if (institutionTypes.length === 1) {
      query = query.eq("institution_type", institutionTypes[0])
    } else {
      query = query.in("institution_type", institutionTypes)
    }

    const { data: programmes, error } = await query

    if (error) {
      console.error("❌ Error fetching artisan programmes:", error)
      return []
    }

    if (!programmes || programmes.length === 0) {
      console.log("⚠️ No artisan programmes found for selected criteria")
      return []
    }

    console.log(`📚 Found ${programmes.length} artisan programmes matching criteria`)

    // Filter programmes based on mean grade requirement
    const qualifiedCourses: ArtisanCourse[] = []

    for (const programme of programmes) {
      // Check if user's mean grade meets or exceeds the programme requirement
      if (compareMeanGrades(userMeanGrade, programme.mean_grade)) {
        qualifiedCourses.push({
          programme_name: programme.programme_name,
          programme_code: programme.programme_code,
          institution: programme.institution,
          institution_name: programme.institution_name,
          institution_type: programme.institution_type,
          county: programme.county,
          cluster_group: programme.cluster_group,
        })
      }
    }

    console.log(`✅ Found ${qualifiedCourses.length} qualified artisan courses`)
    return qualifiedCourses
  } catch (error) {
    console.error("❌ Error in artisan course qualification:", error)
    return []
  }
}
