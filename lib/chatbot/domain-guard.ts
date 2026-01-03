const inScopeKeywords = [
  "kuccps",
  "course",
  "institution",
  "cluster",
  "points",
  "grade",
  "placement",
  "university",
  "college",
  "polytechnic",
  "eligible",
  "cutoff",
  "campus",
  "application",
  "student",
  "kcse",
  "constraint",
  "health",
  "location",
]

export function isInScope(message: string): boolean {
  const q = message.toLowerCase()
  return inScopeKeywords.some((k) => q.includes(k))
}

export function refusalMessage(): string {
  return "I can only answer KUCCPS course and institution-related questions. Please ask about courses, institutions, cluster points, grades, or placement."
}

