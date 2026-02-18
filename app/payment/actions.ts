"use server"

import { log } from "@/lib/logger"
import { supabaseServer } from "@/lib/supabaseServer"

/**
 * Initiate payment via Paystack
 * 
 * This server action calls our backend API route to initialize
 * a Paystack transaction and returns the accessCode for the popup.
 */
export async function initiatePayment(data: {
  email: string
  name: string
  amount: number
  phone?: string | null
  courseCategory?: string | null
  resultId?: string | null
}) {
  try {
    // CRITICAL: Warn if resultId is missing
    if (!data.resultId) {
      log("payment:init", "⚠️ CRITICAL WARNING: initiatePayment called WITHOUT resultId", "warn", {
        email: data.email,
        amount: data.amount,
        courseCategory: data.courseCategory,
        hint: "This payment will not have a result_id, which may cause lookup issues"
      })
    }

    log("payment:init", "Starting Paystack payment initiation", "info", {
      email: data.email,
      amount: data.amount,
      courseCategory: data.courseCategory,
      resultId: data.resultId || "⚠️ MISSING",
      hasPhone: !!data.phone,
    })

    // Build the site URL for the API call
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    // Call our backend initialize endpoint
    const response = await fetch(`${siteUrl}/api/paystack/initialize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        amount: data.amount,
        name: data.name,
        phone: data.phone || "",
        courseCategory: data.courseCategory || "",
        resultId: data.resultId || "",
      }),
    })

    const result = await response.json()

    if (result.success) {
      log("payment:init", "✅ Paystack transaction initialized", "success", {
        reference: result.reference,
        hasAccessCode: !!result.accessCode,
      })

      return {
        success: true,
        reference: result.reference,
        accessCode: result.accessCode,
        authorizationUrl: result.authorizationUrl,
        message: "Payment initialized successfully",
      }
    } else {
      log("payment:init", "Paystack initialization failed", "error", {
        error: result.error,
      })
      return {
        success: false,
        message: result.error || "Failed to initiate payment",
      }
    }
  } catch (error: any) {
    log("payment:init", "Payment initiation exception", "error", {
      message: error.message,
      stack: error.stack,
    })
    return {
      success: false,
      message: "Failed to initiate payment. Please try again.",
    }
  }
}

/**
 * Check payment status from database (updated by webhook or verify endpoint)
 */
export async function checkPaymentStatus(paymentReference: string) {
  try {
    log("payment:status", "🔍 Checking status in database", "debug", { paymentReference })

    // Query database for payment status
    const { data: transaction, error } = await supabaseServer
      .from("payment_transactions")
      .select("status, updated_at, webhook_data, paystack_reference, email, phone_number")
      .eq("reference", paymentReference)
      .single()

    if (error) {
      log("payment:status", "⚠️ Database query error", "warn", {
        paymentReference,
        error: error.message,
        errorCode: error.code,
      })
      return {
        status: "PENDING",
        message: "Awaiting payment confirmation",
      }
    }

    if (!transaction) {
      log("payment:status", "❌ Transaction not found in database", "warn", {
        paymentReference,
      })
      return {
        status: "PENDING",
        message: "Awaiting payment confirmation",
      }
    }

    log("payment:status", "📊 Transaction found", "debug", {
      paymentReference,
      status: transaction.status,
      hasWebhookData: !!transaction.webhook_data,
      paystackRef: transaction.paystack_reference || "none",
      lastUpdated: transaction.updated_at
    })

    // Map database status to frontend status
    const status = transaction.status.toUpperCase()

    if (status === "COMPLETED" || status === "SUCCESS") {
      log("payment:status", "✅ Payment COMPLETED!", "success", {
        paymentReference,
        paystackRef: transaction.paystack_reference,
      })
      return {
        status: "COMPLETED",
        message: "Payment completed successfully",
      }
    } else if (status === "FAILED" || status === "CANCELLED") {
      log("payment:status", "❌ Payment FAILED", "error", { paymentReference, status })
      return {
        status: "FAILED",
        message: "Payment failed or was cancelled",
      }
    } else {
      // Check if payment has been pending for too long (10 minutes for Paystack)
      const updatedAt = new Date(transaction.updated_at)
      const ageMinutes = (Date.now() - updatedAt.getTime()) / 1000 / 60

      log("payment:status", "⏳ Payment still PENDING", "debug", {
        paymentReference,
        ageMinutes: ageMinutes.toFixed(2),
      })

      if (ageMinutes > 10) {
        log("payment:status", "⏰ Payment TIMEOUT - pending for > 10 minutes", "warn", {
          paymentReference,
          ageMinutes,
        })
        return {
          status: "FAILED",
          message: "Payment timed out. Please try again.",
        }
      }

      return {
        status: "PENDING",
        message: "Awaiting payment confirmation",
      }
    }
  } catch (error: any) {
    log("payment:status", "💥 Status check exception", "error", {
      error: error.message,
    })

    return {
      status: "PENDING",
      message: "Checking payment status...",
    }
  }
}
