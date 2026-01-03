import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function deduplicateCourses<T extends { programme_code?: string }>(courses: T[]): T[] {
  const seen = new Set<string>()
  return courses.filter((course) => {
    if (!course.programme_code) return true
    if (seen.has(course.programme_code)) {
      return false
    }
    seen.add(course.programme_code)
    return true
  })
}
