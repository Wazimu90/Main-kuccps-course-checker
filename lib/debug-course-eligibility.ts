import { supabase } from "./supabase"

// Debug function to inspect database structure and sample data
export async function debugDatabaseStructure() {
  console.log("\n🔍 === DATABASE STRUCTURE DEBUG ===")

  try {
    // Check degree programmes structure
    console.log("📊 Checking degree_programmes table...")
    const { data: degreeData, error: degreeError } = await supabase.from("degree_programmes").select("*").limit(3)

    if (degreeError) {
      console.error("❌ Error fetching degree programmes:", degreeError)
    } else {
      console.log(`✅ Degree programmes sample (${degreeData?.length || 0} records):`)
      degreeData?.forEach((prog, i) => {
        console.log(`  ${i + 1}. ${prog.programme_name}`)
        console.log(`     Code: ${prog.programme_code}`)
        console.log(`     Institution: ${prog.institution_name}`)
        console.log(`     Cutoff 2023: ${prog.cutoff_2023}`)
        console.log(`     Subjects: ${prog.subject_1} | ${prog.subject_2} | ${prog.subject_3} | ${prog.subject_4}`)
      })
    }

    // Check programme clusters structure
    console.log("\n📊 Checking programme_clusters table...")
    const { data: clusterData, error: clusterError } = await supabase.from("programme_clusters").select("*").limit(3)

    if (clusterError) {
      console.error("❌ Error fetching programme clusters:", clusterError)
    } else {
      console.log(`✅ Programme clusters sample (${clusterData?.length || 0} records):`)
      clusterData?.forEach((cluster, i) => {
        console.log(`  ${i + 1}. ${cluster.programme_name}`)
        console.log(`     Cluster: ${cluster.cluster_number}`)
      })
    }

    // Check institutions structure
    console.log("\n📊 Checking institutions table...")
    const { data: instData, error: instError } = await supabase.from("institutions").select("*").limit(3)

    if (instError) {
      console.error("❌ Error fetching institutions:", instError)
    } else {
      console.log(`✅ Institutions sample (${instData?.length || 0} records):`)
      instData?.forEach((inst, i) => {
        console.log(`  ${i + 1}. ${inst.institution_name}`)
        console.log(`     Type: ${inst.institution_type}`)
        console.log(`     Location: ${inst.location}`)
      })
    }

    // Check diploma programmes structure
    console.log("\n📊 Checking diploma_programmes table...")
    const { data: diplomaData, error: diplomaError } = await supabase.from("diploma_programmes").select("*").limit(3)

    if (diplomaError) {
      console.error("❌ Error fetching diploma programmes:", diplomaError)
    } else {
      console.log(`✅ Diploma programmes sample (${diplomaData?.length || 0} records):`)
      diplomaData?.forEach((prog, i) => {
        console.log(`  ${i + 1}. ${prog.programme_name}`)
        console.log(`     Code: ${prog.programme_code}`)
        console.log(`     Institution: ${prog.institution_name}`)
        console.log(`     Mean Grade: ${prog.mean_grade}`)
        console.log(`     Subjects: ${prog.subject_1} | ${prog.subject_2} | ${prog.subject_3} | ${prog.subject_4}`)
      })
    }
  } catch (error) {
    console.error("❌ Database debug error:", error)
  }

  console.log("=== END DATABASE DEBUG ===\n")
}

// Function to test specific programme matching
export async function testProgrammeMatching(
  programmeName: string,
  userMeanGrade: string,
  userSubjects: Record<string, string>,
  userClusterWeights?: Record<string, number>,
) {
  console.log(`\n🧪 === TESTING PROGRAMME MATCHING: ${programmeName} ===`)

  try {
    // Find the specific programme
    const { data: programme, error } = await supabase
      .from("degree_programmes")
      .select("*")
      .eq("programme_name", programmeName)
      .single()

    if (error || !programme) {
      console.error("❌ Programme not found:", error)
      return
    }

    console.log("📋 Programme details:", programme)

    // Find cluster
    const { data: cluster } = await supabase
      .from("programme_clusters")
      .select("*")
      .eq("programme_name", programmeName)
      .single()

    if (cluster) {
      console.log("🎯 Cluster details:", cluster)

      if (userClusterWeights) {
        const userWeight = userClusterWeights[cluster.cluster_number.toString()]
        console.log(`👤 User cluster weight: ${userWeight}`)
        console.log(`📊 Required cutoff: ${programme.cutoff_2023}`)
        console.log(
          `${userWeight >= programme.cutoff_2023 ? "✅" : "❌"} Cluster weight check: ${userWeight >= programme.cutoff_2023}`,
        )
      }
    }

    console.log("📚 Subject requirements analysis:")
    const subjects = [programme.subject_1, programme.subject_2, programme.subject_3, programme.subject_4]
    subjects.forEach((subject, i) => {
      if (subject) {
        console.log(`  Subject ${i + 1}: ${subject}`)
      }
    })

    console.log("👤 User subjects:", userSubjects)
  } catch (error) {
    console.error("❌ Test error:", error)
  }

  console.log("=== END PROGRAMME TEST ===\n")
}
