/**
 * n8n Webhook Integration
 * 
 * Sends user payment details to n8n webhook for automated email notifications.
 * This is a fire-and-forget operation that doesn't block payment processing.
 */

import { log } from "@/lib/logger"

/**
 * Payload structure for n8n webhook
 */
export interface N8nWebhookPayload {
  name: string
  phone: string
  mpesaCode: string
  email: string
  resultId: string
}

/**
 * Result of webhook call
 */
export interface N8nWebhookResult {
  success: boolean
  error?: string
}

/**
 * Formats a phone number to international format (+254xxx)
 * @param phone - Phone number in any format
 * @returns Phone number in +254xxx format
 */
function formatPhoneNumber(phone: string): string {
  if (!phone) return ""

  // Remove any non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, "")

  // If starts with 0, replace with +254
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    cleaned = "+254" + cleaned.substring(1)
  }
  // If starts with 254, add +
  else if (cleaned.startsWith("254") && !cleaned.startsWith("+")) {
    cleaned = "+" + cleaned
  }
  // If doesn't start with +, assume it might need +254
  else if (!cleaned.startsWith("+") && cleaned.length === 9) {
    cleaned = "+254" + cleaned
  }

  return cleaned
}

/**
 * Validates that all required fields are present in the payload
 * @param data - Partial payload to validate
 * @returns True if all required fields are present and non-empty
 */
function validatePayload(data: Partial<N8nWebhookPayload>): data is N8nWebhookPayload {
  const requiredFields: (keyof N8nWebhookPayload)[] = ["name", "phone", "mpesaCode", "email", "resultId"]

  for (const field of requiredFields) {
    if (!data[field] || String(data[field]).trim() === "") {
      log("n8n:webhook", `❌ Validation Failed: Field '${field}' is missing or empty`, "warn", { field, value: data[field], fullPayload: data })
      return false
    }
  }

  return true
}

/**
 * Sends user details to n8n webhook after successful payment.
 * 
 * This function is designed to be non-blocking and fail-safe:
 * - Uses a 10-second timeout to prevent hanging
 * - Logs errors but doesn't throw
 * - Returns a result object indicating success/failure
 * 
 * @param data - User payment details to send
 * @returns Promise<N8nWebhookResult> - Result of the webhook call
 */
export async function sendToN8nWebhook(data: Partial<N8nWebhookPayload>): Promise<N8nWebhookResult> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL

  // Check if webhook URL is configured
  if (!webhookUrl || webhookUrl.trim() === "") {
    log("n8n:webhook", "❌ N8N_WEBHOOK_URL not configured in environment variables", "error")
    return { success: false, error: "Webhook URL not configured" }
  }

  try {
    const urlObj = new URL(webhookUrl);
    log("n8n:webhook", `🔄 Starting webhook process for URL: ${urlObj.hostname}${urlObj.pathname}`, "info", { inputData: data })
  } catch (urlError) {
    log("n8n:webhook", "⚠️ Invalid N8N_WEBHOOK_URL format", "error", { url: webhookUrl });
    return { success: false, error: "Invalid Webhook URL format" }
  }

  // Format phone number
  const formattedData = {
    ...data,
    phone: formatPhoneNumber(data.phone || "")
  }

  // Validate all required fields are present
  if (!validatePayload(formattedData)) {
    log("n8n:webhook", "Payload validation failed, skipping webhook", "warn", formattedData)
    return { success: false, error: "Missing required fields" }
  }

  // Prepare the exact payload structure
  const payload: N8nWebhookPayload = {
    name: formattedData.name.trim(),
    phone: formattedData.phone,
    mpesaCode: formattedData.mpesaCode.trim(),
    email: formattedData.email.trim(),
    resultId: formattedData.resultId.trim()
  }

  log("n8n:webhook", "📤 Sending data to n8n webhook", "info", {
    email: payload.email,
    resultId: payload.resultId,
    hasName: !!payload.name,
    hasPhone: !!payload.phone,
    hasMpesaCode: !!payload.mpesaCode
  })

  try {
    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Could not read error body")
      log("n8n:webhook", "❌ Webhook POST failed", "error", {
        status: response.status,
        statusText: response.statusText,
        url: webhookUrl,
        error: errorText,
        payload
      })
      return { success: false, error: `HTTP ${response.status}: ${errorText}` }
    }

    // Try to parse response
    let responseData: any = null
    try {
      responseData = await response.json()
    } catch {
      // Response might not be JSON, that's okay
    }

    log("n8n:webhook", "✅ Successfully sent data to n8n webhook", "success", {
      email: payload.email,
      resultId: payload.resultId,
      responseStatus: response.status,
      responseData
    })

    return { success: true }

  } catch (error: any) {
    // Handle abort (timeout)
    if (error.name === "AbortError") {
      log("n8n:webhook", "⏱️ Webhook request timed out after 10 seconds", "error", {
        email: payload.email,
        resultId: payload.resultId
      })
      return { success: false, error: "Request timed out" }
    }

    // Handle other errors
    log("n8n:webhook", "❌ Failed to send webhook", "error", {
      email: payload.email,
      resultId: payload.resultId,
      error: error.message || String(error)
    })

    return { success: false, error: error.message || "Unknown error" }
  }
}
