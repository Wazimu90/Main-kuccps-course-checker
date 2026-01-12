/**
 * PesaFlux Payment Gateway Integration
 * Documentation: https://pesaflux.co.ke
 */

import { log } from "@/lib/logger"

const PESAFLUX_API_BASE = process.env.PESAFLUX_API_BASE || "https://api.pesaflux.co.ke/v1"
const PESAFLUX_API_KEY = process.env.PESAFLUX_API_KEY || ""
const PESAFLUX_EMAIL = process.env.PESAFLUX_EMAIL || ""

export interface StkPushRequest {
    amount: number
    msisdn: string // Phone number (e.g., 254768783443 or 0768783443)
    reference: string // Unique transaction reference
}

export interface StkPushResponse {
    success: boolean
    message: string
    reference?: string
    transaction_id?: string
    error?: string
}

/**
 * Normalize Kenyan phone number to format accepted by PesaFlux
 * Accepts: 07XXXXXXXX, 01XXXXXXXX, +254XXXXXXXXX, 254XXXXXXXXX
 * Returns: 254XXXXXXXXX
 */
export function normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, "")

    // Handle different formats
    if (cleaned.startsWith("254")) {
        return cleaned // Already in correct format
    } else if (cleaned.startsWith("0")) {
        return "254" + cleaned.substring(1) // Remove leading 0, add 254
    } else if (cleaned.length === 9) {
        return "254" + cleaned // Assume it's missing country code
    }

    return cleaned
}

/**
 * Initiate STK Push payment via PesaFlux API
 */
export async function initiateStkPush(request: StkPushRequest): Promise<StkPushResponse> {
    try {
        // Validate environment variables
        if (!PESAFLUX_API_KEY || !PESAFLUX_EMAIL) {
            log("pesaflux:config", "Missing PesaFlux API credentials", "error")
            return {
                success: false,
                message: "Payment service configuration error",
                error: "Missing API credentials",
            }
        }

        // Normalize phone number
        const normalizedPhone = normalizePhoneNumber(request.msisdn)

        log("pesaflux:stk_push", "Initiating STK Push", "info", {
            amount: request.amount,
            phone: normalizedPhone,
            reference: request.reference,
        })

        // Make API call to PesaFlux
        const response = await fetch(`${PESAFLUX_API_BASE}/initiatestk`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                api_key: PESAFLUX_API_KEY,
                email: PESAFLUX_EMAIL,
                amount: request.amount,
                msisdn: normalizedPhone,
                reference: request.reference,
            }),
        })

        const data = await response.json()

        log("pesaflux:stk_push", "STK Push response received", "debug", {
            status: response.status,
            data,
        })

        // Handle response
        // PesaFlux returns success as string "200" and message as "massage" (their API typo)
        // Successful response: { success: "200", massage: "Request sent sucessfully.", transaction_request_id: "..." }
        const isSuccess = response.ok && (data.success === "200" || data.success === 200 || data.success === true)

        if (isSuccess) {
            return {
                success: true,
                message: data.massage || data.message || "STK Push sent successfully",
                reference: request.reference,
                // PesaFlux returns "transaction_request_id" in initiate response
                transaction_id: data.transaction_request_id || data.transaction_id || data.transactionId || data.id,
            }
        } else {
            log("pesaflux:stk_push", "STK Push API error", "error", {
                status: response.status,
                statusText: response.statusText,
                data,
            })

            // Provide helpful error messages
            // Handle both "massage" (PesaFlux typo) and "message"
            let errorMessage = data.massage || data.message || data.error || "Failed to initiate payment"

            if (response.status === 401 || response.status === 403) {
                errorMessage = "Invalid API credentials. Please check your PESAFLUX_API_KEY and PESAFLUX_EMAIL in .env.local"
            } else if (response.status === 400) {
                errorMessage = data.massage || data.message || "Invalid request. Please check phone number and amount."
            } else if (response.status >= 500) {
                errorMessage = "PesaFlux server error. Please try again later."
            }

            return {
                success: false,
                message: errorMessage,
                error: data.error || `API error (${response.status})`,
            }
        }
    } catch (error: any) {
        log("pesaflux:stk_push", "STK Push exception", "error", error)

        // Provide helpful error messages for network issues
        let errorMessage = "Network error. Please try again."
        let errorDetails = error.message || "Unknown error"

        if (error.cause?.code === "ENOTFOUND") {
            errorMessage = `Cannot reach PesaFlux API. Please check PESAFLUX_API_BASE in .env.local (current: ${PESAFLUX_API_BASE})`
            errorDetails = `DNS lookup failed for: ${error.cause.hostname}`
        } else if (error.cause?.code === "ECONNREFUSED") {
            errorMessage = "Connection refused. PesaFlux API may be down or URL is incorrect."
        } else if (error.cause?.code === "ETIMEDOUT") {
            errorMessage = "Connection timeout. Please check your internet connection."
        } else if (error.message?.includes("fetch failed")) {
            errorMessage = "Failed to connect to PesaFlux. Please verify:\n1. PESAFLUX_API_BASE is correct in .env.local\n2. Your internet connection is working\n3. PesaFlux API is accessible"
        }

        return {
            success: false,
            message: errorMessage,
            error: errorDetails,
        }
    }
}

/**
 * Verify payment status (optional - mainly used for fallback)
 * Note: PesaFlux primarily uses webhooks for real-time status updates
 */
export async function verifyPaymentStatus(reference: string): Promise<{
    status: "COMPLETED" | "PENDING" | "FAILED" | "UNKNOWN"
    message: string
}> {
    try {
        // Note: PesaFlux doesn't have a dedicated status check endpoint in the docs
        // Status updates are primarily handled via webhooks
        // This is a placeholder for potential future API or database check

        log("pesaflux:verify", "Payment verification requested", "debug", { reference })

        // In production, this would check the database for webhook-updated status
        // For now, return PENDING to continue polling
        return {
            status: "PENDING",
            message: "Awaiting payment confirmation",
        }
    } catch (error) {
        log("pesaflux:verify", "Verification error", "error", error)
        return {
            status: "UNKNOWN",
            message: "Unable to verify payment status",
        }
    }
}
