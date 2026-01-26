/**
 * Timezone utilities for Kenya (EAT = UTC+3)
 * 
 * This ensures all "today" calculations use Kenya time, not server time (UTC).
 * Critical for dashboard metrics that need to reset at midnight Kenya time.
 */

const KENYA_OFFSET_HOURS = 3 // EAT = UTC+3

/**
 * Get the start of today in Kenya timezone as a UTC Date object.
 * 
 * Example:
 * - If it's 2026-01-27 00:30 in Kenya (EAT)
 * - This returns 2026-01-26T21:00:00.000Z (midnight Kenya = 21:00 UTC previous day)
 */
export function getKenyaTodayStart(): Date {
    const now = new Date()

    // Calculate current Kenya time
    const kenyaTime = new Date(now.getTime() + (KENYA_OFFSET_HOURS * 60 * 60 * 1000))

    // Get Kenya date components
    const kenyaYear = kenyaTime.getUTCFullYear()
    const kenyaMonth = kenyaTime.getUTCMonth()
    const kenyaDay = kenyaTime.getUTCDate()

    // Create midnight Kenya time in UTC
    // Midnight in Kenya (00:00 EAT) = 21:00 UTC previous day
    const midnightKenyaUTC = new Date(Date.UTC(kenyaYear, kenyaMonth, kenyaDay, 0, 0, 0, 0))
    midnightKenyaUTC.setUTCHours(midnightKenyaUTC.getUTCHours() - KENYA_OFFSET_HOURS)

    return midnightKenyaUTC
}

/**
 * Get the start of today in Kenya timezone as an ISO string.
 * Use this for Supabase queries.
 */
export function getKenyaTodayStartISO(): string {
    return getKenyaTodayStart().toISOString()
}

/**
 * Get current Kenya date as YYYY-MM-DD string
 */
export function getKenyaDateString(): string {
    const now = new Date()
    const kenyaTime = new Date(now.getTime() + (KENYA_OFFSET_HOURS * 60 * 60 * 1000))
    return kenyaTime.toISOString().split('T')[0]
}
