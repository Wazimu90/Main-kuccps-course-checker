import { log } from "@/lib/logger"

const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || ""
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || ""
const MPESA_PASSKEY = process.env.MPESA_PASSKEY || ""
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE || "" // Business Shortcode (Paybill/Till)
const MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL || ""
const MPESA_API_BASE_URL = process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke"

export interface StkPushRequest {
    phoneNumber: string // Format: 254...
    amount: number
    accountReference: string
    transactionDesc?: string
}

export interface StkPushResponse {
    success: boolean
    merchantRequestID?: string
    checkoutRequestID?: string
    responseCode?: string
    responseDescription?: string
    customerMessage?: string
    error?: string
}

/**
 * Normalize Kenyan phone number to 254 format
 */
export function normalizePhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, "")
    if (cleaned.startsWith("0")) cleaned = "254" + cleaned.slice(1)
    if (cleaned.length === 9) cleaned = "254" + cleaned
    return cleaned
}

/**
 * Generate M-Pesa Access Token
 */
async function getAccessToken(): Promise<string | null> {
    try {
        if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) {
            log("mpesa:auth", "Missing Consumer Key or Secret", "error")
            return null
        }

        const key = MPESA_CONSUMER_KEY.trim()
        const secret = MPESA_CONSUMER_SECRET.trim()

        log("mpesa:auth", "Generating token with credentials", "debug", {
            keyLength: key.length,
            secretLength: secret.length,
            keyStart: key.substring(0, 4) + "****"
        })

        const credentials = Buffer.from(`${key}:${secret}`).toString("base64")
        const response = await fetch(`${MPESA_API_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
            method: "GET",
            headers: {
                Authorization: `Basic ${credentials}`,
            },
        })

        // M-Pesa API sometimes returns text/plain error messages or HTML on bad gateway
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
            const textHTML = await response.text()
            log("mpesa:auth", "M-Pesa auth returned non-JSON response", "error", {
                status: response.status,
                body: textHTML.substring(0, 200) // Log first 200 chars
            })
            return null
        }

        const data = await response.json()
        if (data.access_token) {
            return data.access_token
        } else {
            log("mpesa:auth", "Failed to retrieve access token", "error", data)
            return null
        }
    } catch (error: any) {
        log("mpesa:auth", "Exception generating access token", "error", error)
        return null
    }
}

/**
 * Generate Password for STK Push
 */
function generatePassword(timestamp: string): string {
    const passkey = MPESA_PASSKEY.trim()
    const shortcode = MPESA_SHORTCODE.trim()
    return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64")
}

/**
 * Initiate STK Push
 */
export async function initiateStkPush(request: StkPushRequest): Promise<StkPushResponse> {
    try {
        const token = await getAccessToken()
        if (!token) {
            return { success: false, error: "Failed to authenticate with M-Pesa" }
        }

        // Use EAT time (UTC+3) for timestamp if possible, but local usually works if synced.
        // For robustness, generating local timestamp:
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14)

        const password = generatePassword(timestamp)
        const shortcode = MPESA_SHORTCODE.trim()

        // Normalize phone number (ensure 254 prefix)
        let phone = request.phoneNumber.replace(/\D/g, "")
        if (phone.startsWith("0")) phone = "254" + phone.slice(1)
        if (phone.length === 9) phone = "254" + phone // default to 254 if 9 digits

        const payload = {
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: Math.ceil(request.amount),
            PartyA: phone,
            PartyB: shortcode,
            PhoneNumber: phone,
            CallBackURL: MPESA_CALLBACK_URL.trim(),
            AccountReference: request.accountReference,
            TransactionDesc: request.transactionDesc || "Payment",
        }

        log("mpesa:stk_push", "Sending STK Push Request", "info", {
            phone,
            amount: payload.Amount,
            shortcode: MPESA_SHORTCODE,
            callbackUrl: MPESA_CALLBACK_URL
        })

        const response = await fetch(`${MPESA_API_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })

        const data = await response.json()
        log("mpesa:stk_push", "Received STK Push Response", "info", {
            responseCode: data.ResponseCode,
            checkoutRequestID: data.CheckoutRequestID,
            customerMessage: data.CustomerMessage,
            rawLink: JSON.stringify(data)
        })

        if (data.ResponseCode === "0") {
            log("mpesa:stk_push", "STK Push Initiated Successfully", "success", {
                checkoutRequestID: data.CheckoutRequestID
            })
            return {
                success: true,
                merchantRequestID: data.MerchantRequestID,
                checkoutRequestID: data.CheckoutRequestID,
                responseCode: data.ResponseCode,
                responseDescription: data.ResponseDescription,
                customerMessage: data.CustomerMessage,
            }
        } else {
            log("mpesa:stk_push", "STK Push Failed", "error", data)
            return {
                success: false,
                error: data.errorMessage || data.ResponseDescription || "STK Push failed",
                responseCode: data.ResponseCode
            }
        }
    } catch (error: any) {
        log("mpesa:stk_push", "Exception initiating STK Push", "error", error)
        return { success: false, error: "System error initiating payment" }
    }
}

/**
 * Process M-Pesa Webhook Payload
 * Returns structured data or null if invalid
 */
export function processWebhookPayload(body: any) {
    try {
        if (!body?.Body?.stkCallback) {
            return null
        }

        const callback = body.Body.stkCallback
        const result: any = {
            merchantRequestID: callback.MerchantRequestID,
            checkoutRequestID: callback.CheckoutRequestID,
            resultCode: callback.ResultCode,
            resultDesc: callback.ResultDesc,
        }

        if (callback.CallbackMetadata?.Item) {
            const items = callback.CallbackMetadata.Item
            for (const item of items) {
                if (item.Name === "Amount") result.amount = item.Value
                if (item.Name === "MpesaReceiptNumber") result.mpesaReceiptNumber = item.Value
                if (item.Name === "PhoneNumber") result.phoneNumber = item.Value
                if (item.Name === "TransactionDate") result.transactionDate = item.Value
            }
        }

        return result
    } catch (error: any) {
        log("mpesa:webhook", "Error processing webhook payload", "error", { message: error.message, stack: error.stack })
        return null
    }
}
