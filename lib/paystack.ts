import { log } from "@/lib/logger"
import crypto from "crypto"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || ""
const PAYSTACK_API_BASE_URL = "https://api.paystack.co"

// ─── Types ───────────────────────────────────────────────────────────

export interface PaystackInitializeRequest {
    email: string
    amountKES: number
    reference: string
    callbackUrl: string
    metadata?: Record<string, any>
}

export interface PaystackInitializeResponse {
    success: boolean
    accessCode?: string
    authorizationUrl?: string
    reference?: string
    error?: string
}

export interface PaystackVerifyResponse {
    success: boolean
    status?: string // "success" | "failed" | "abandoned"
    amount?: number // in kobo/cents
    reference?: string
    channel?: string
    currency?: string
    paidAt?: string
    rawData?: any
    error?: string
}

// ─── Initialize Transaction ──────────────────────────────────────────

/**
 * Initialize a Paystack transaction (server-side only).
 * Calls POST https://api.paystack.co/transaction/initialize
 * with the secret key.
 */
export async function initializeTransaction(
    request: PaystackInitializeRequest
): Promise<PaystackInitializeResponse> {
    try {
        if (!PAYSTACK_SECRET_KEY) {
            log("paystack:init", "Missing PAYSTACK_SECRET_KEY", "error")
            return { success: false, error: "Server configuration error" }
        }

        // Paystack amount must be in the smallest currency subunit (cents for KES)
        const amountSubunit = Math.round(request.amountKES * 100)

        const payload = {
            email: request.email,
            amount: amountSubunit,
            reference: request.reference,
            callback_url: request.callbackUrl,
            currency: "KES",
            metadata: request.metadata || {},
        }

        log("paystack:init", "Initializing transaction", "info", {
            email: request.email,
            amountKES: request.amountKES,
            amountSubunit,
            reference: request.reference,
            callbackUrl: request.callbackUrl,
        })

        const response = await fetch(`${PAYSTACK_API_BASE_URL}/transaction/initialize`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })

        const data = await response.json()

        if (data.status === true && data.data) {
            log("paystack:init", "Transaction initialized successfully", "success", {
                reference: data.data.reference,
                accessCode: data.data.access_code ? "present" : "missing",
            })
            return {
                success: true,
                accessCode: data.data.access_code,
                authorizationUrl: data.data.authorization_url,
                reference: data.data.reference,
            }
        } else {
            log("paystack:init", "Paystack initialization failed", "error", {
                message: data.message,
                status: data.status,
            })
            return {
                success: false,
                error: data.message || "Failed to initialize transaction",
            }
        }
    } catch (error: any) {
        log("paystack:init", "Exception initializing transaction", "error", {
            message: error.message,
            stack: error.stack,
        })
        return { success: false, error: "System error initializing payment" }
    }
}

// ─── Verify Transaction ──────────────────────────────────────────────

/**
 * Verify a Paystack transaction (server-side only).
 * Calls GET https://api.paystack.co/transaction/verify/{reference}
 * with the secret key.
 */
export async function verifyTransaction(
    reference: string
): Promise<PaystackVerifyResponse> {
    try {
        if (!PAYSTACK_SECRET_KEY) {
            log("paystack:verify", "Missing PAYSTACK_SECRET_KEY", "error")
            return { success: false, error: "Server configuration error" }
        }

        log("paystack:verify", "Verifying transaction", "info", { reference })

        const response = await fetch(
            `${PAYSTACK_API_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                },
            }
        )

        const data = await response.json()

        if (data.status === true && data.data) {
            const txData = data.data
            log("paystack:verify", "Transaction verification result", "info", {
                reference: txData.reference,
                status: txData.status,
                amount: txData.amount,
                currency: txData.currency,
                channel: txData.channel,
            })
            return {
                success: true,
                status: txData.status, // "success", "failed", "abandoned"
                amount: txData.amount, // in subunit (cents)
                reference: txData.reference,
                channel: txData.channel,
                currency: txData.currency,
                paidAt: txData.paid_at,
                rawData: txData,
            }
        } else {
            log("paystack:verify", "Transaction verification failed", "error", {
                message: data.message,
            })
            return {
                success: false,
                error: data.message || "Failed to verify transaction",
            }
        }
    } catch (error: any) {
        log("paystack:verify", "Exception verifying transaction", "error", {
            message: error.message,
        })
        return { success: false, error: "System error verifying payment" }
    }
}

// ─── Webhook Signature Verification ──────────────────────────────────

/**
 * Verify Paystack webhook signature.
 * Paystack signs webhooks using HMAC SHA512 with your secret key.
 */
export function verifyWebhookSignature(
    rawBody: string,
    signature: string | null
): boolean {
    if (!signature || !PAYSTACK_SECRET_KEY) {
        log("paystack:webhook", "Missing signature or secret key", "error")
        return false
    }

    const hash = crypto
        .createHmac("sha512", PAYSTACK_SECRET_KEY)
        .update(rawBody)
        .digest("hex")

    const isValid = hash === signature

    if (!isValid) {
        log("paystack:webhook", "Webhook signature mismatch", "error", {
            expected: hash.substring(0, 16) + "...",
            received: signature.substring(0, 16) + "...",
        })
    }

    return isValid
}
