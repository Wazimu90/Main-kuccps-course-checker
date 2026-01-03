export const MINISTRY_TYPES = ["Ministry of Education", "In other ministries"] as const
export type MinistryType = typeof MINISTRY_TYPES[number] | "All"

export function resolveInstitutionTypes(selected: MinistryType): string[] {
  if (selected === "All" || !selected) return [...MINISTRY_TYPES]
  return [selected]
}
