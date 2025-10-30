// Grade ranking from highest to lowest
const gradeRanks: Record<string, number> = {
  A: 12,
  "A-": 11,
  "B+": 10,
  B: 9,
  "B-": 8,
  "C+": 7,
  C: 6,
  "C-": 5,
  "D+": 4,
  D: 3,
  "D-": 2,
  E: 1,
}

export function compareMeanGrades(studentGrade: string, requiredGrade: string): boolean {
  if (!requiredGrade || requiredGrade.trim() === "") {
    return true
  }

  const studentRank = gradeRanks[studentGrade?.trim().toUpperCase()]
  const requiredRank = gradeRanks[requiredGrade?.trim().toUpperCase()]

  if (!studentRank || !requiredRank) {
    return true // Unknown grades pass by default
  }

  return studentRank >= requiredRank
}

function cleanSubjectString(rawStr: string): string {
  // 1. Flatten the string - remove line breaks
  let cleaned = rawStr.replace(/\n/g, " ").replace(/\r/g, " ").trim()

  // 2. Fix codes like (3 13) → (313), (5 62) → (562)
  cleaned = cleaned.replace(/\((\d{1})\s+(\d{2})\)/g, (_, p1, p2) => `(${p1}${p2})`)

  // 3. Fix subject codes like SEE (316) → SEE(316)
  cleaned = cleaned.replace(/\s+\((\d{3})\)/g, "($1)")

  // 4. Remove spaces after slashes: / MAT → /MAT
  cleaned = cleaned.replace(/\/\s+/g, "/")

  // 5. Remove spaces before slashes: ARD(442) /CMP → ARD(442)/CMP
  cleaned = cleaned.replace(/\s+\//g, "/")

  // 6. Combine subject name and code: MAT A(121) → MATA(121)
  cleaned = cleaned.replace(/([A-Z]{2,})\s+\((\d{3})\)/g, "$1($2)")

  // 7. Remove any remaining multiple spaces
  cleaned = cleaned.replace(/\s+/g, " ")

  console.log("✅ Cleaned string:", cleaned)
  return cleaned
}

export function parseSubjectRequirement(subjectField: string): { codes: string[]; requiredGrade: string } | null {
  if (!subjectField || subjectField.trim() === "" || subjectField.length < 5) {
    return null
  }

  // Clean the subject string to fix spacing issues
  const cleaned = cleanSubjectString(subjectField)

  // Split on ':' to get subject codes vs required grade
  const parts = cleaned.split(":")
  if (parts.length !== 2) {
    console.warn(`❌ Invalid format. Missing colon. First 60 chars: "${cleaned.slice(0, 60)}"`)
    return null
  }

  const subjectPart = parts[0].trim()
  const requiredGrade = parts[1].trim()

  // Extract all subject codes using regex that matches 3-digit codes inside parentheses
  const matches = [...subjectPart.matchAll(/\((\d{3})\)/g)]

  if (!matches || matches.length === 0) {
    console.warn(`❌ No subject codes found in: "${subjectField}" (cleaned: "${cleaned}")`)
    return null
  }

  // Extract the captured groups (the 3-digit codes inside parentheses)
  const codes = matches.map((match) => match[1]).filter((code) => code && code.length === 3)

  if (codes.length === 0) {
    console.warn(`❌ No valid subject codes extracted from: "${subjectField}"`)
    return null
  }

  return { codes, requiredGrade }
}

export function checkSubjectRequirements(
  subjectFields: (string | null | undefined)[],
  userSubjectGrades: Record<string, string>,
): boolean {
  // Skip empty fields early
  const validFields = subjectFields.filter((field) => field && field.trim() !== "" && field.length >= 5)

  if (validFields.length === 0) {
    return true // No requirements to check
  }

  for (const field of validFields) {
    const parsed = parseSubjectRequirement(field)
    if (!parsed) {
      continue // Skip invalid fields instead of failing
    }

    const { codes, requiredGrade } = parsed
    let bestGrade: string | null = null

    // Find the best grade among all subject codes for this requirement
    for (const code of codes) {
      const grade = userSubjectGrades[code]
      if (grade && (!bestGrade || gradeRanks[grade] > gradeRanks[bestGrade])) {
        bestGrade = grade
      }
    }

    // If no matching subject found or grade doesn't meet requirement, fail
    if (!bestGrade || !compareMeanGrades(bestGrade, requiredGrade)) {
      return false
    }
  }

  return true
}

export function analyzeUserGrades(subjectGrades: Record<string, string>): void {
  console.log(`📊 User has ${Object.keys(subjectGrades).length} subjects`)
}
