/**
 * Simple in-memory rate limiter for API routes
 * Uses a sliding window approach
 */

interface RateLimitEntry {
    count: number
    resetAt: number
}

// Global in-memory store (resets on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries periodically
setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetAt < now) {
            rateLimitStore.delete(key)
        }
    }
}, 60000) // Cleanup every minute

export interface RateLimitConfig {
    /** Maximum number of requests allowed in the window */
    maxRequests: number
    /** Window size in seconds */
    windowSeconds: number
}

export interface RateLimitResult {
    allowed: boolean
    remaining: number
    resetAt: number
    retryAfterSeconds?: number
}

/**
 * Check if a request should be rate limited
 * @param key - Unique identifier for the rate limit (usually IP or IP + route)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now()
    const windowMs = config.windowSeconds * 1000

    const entry = rateLimitStore.get(key)

    // No existing entry or window expired - create new entry
    if (!entry || entry.resetAt < now) {
        rateLimitStore.set(key, {
            count: 1,
            resetAt: now + windowMs,
        })
        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetAt: now + windowMs,
        }
    }

    // Within window - check count
    if (entry.count >= config.maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetAt: entry.resetAt,
            retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
        }
    }

    // Increment count
    entry.count++
    rateLimitStore.set(key, entry)

    return {
        allowed: true,
        remaining: config.maxRequests - entry.count,
        resetAt: entry.resetAt,
    }
}

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
    const forwardedFor = request.headers.get("x-forwarded-for")
    if (forwardedFor) {
        return forwardedFor.split(",")[0].trim()
    }
    const realIp = request.headers.get("x-real-ip")
    if (realIp) {
        return realIp
    }
    return "0.0.0.0"
}

/**
 * Create rate limit headers for response
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
    return {
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
        ...(result.retryAfterSeconds ? { "Retry-After": String(result.retryAfterSeconds) } : {}),
    }
}
