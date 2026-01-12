/**
 * Fetch count of unread news articles (published within last 7 days)
 */
export async function fetchUnreadNewsCount(): Promise<number> {
    try {
        const response = await fetch("/api/news/unread-count", { cache: "no-store" })

        if (!response.ok) {
            console.error("Failed to fetch unread news count:", response.statusText)
            return 0
        }

        const data = await response.json()
        return data.count ?? 0
    } catch (error) {
        console.error("Error in fetchUnreadNewsCount:", error)
        return 0
    }
}
