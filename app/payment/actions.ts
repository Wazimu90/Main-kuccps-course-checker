"use server"

import { log } from "@/lib/logger"
import { initiateStkPush, normalizePhoneNumber } from "@/lib/mpesa"
import { supabaseServer } from "@/lib/supabaseServer"

/**
 * Initiate payment via M-Pesa STK Push
 */
export async function initiatePayment(data: {
  phone: string
  email: string
  name: string
  courseCategory?: string | null
  resultId?: string | null  // CRITICAL: Store result_id for n8n webhook
}) {
  try {
    // Generate a unique reference for this transaction
    const reference = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

    // CRITICAL: Warn if resultId is missing - this will cause M-Pesa lookup failures
    if (!data.resultId) {
      log("payment:init", "⚠️ CRITICAL WARNING: initiatePayment called WITHOUT resultId", "warn", {
        email: data.email,
        amount: data.amount,
        courseCategory: data.courseCategory,
        reference,
        maskedPhone: data.phone.substring(0, 4) + "****",
        hint: "This payment will not have a result_id in payment_transactions, making M-Pesa lookups impossible"
      })
    }

    // SECURITY: Always read amount from database server-side — never trust client
    let paymentAmountFromDb = 200 // Hard fallback
    try {
      const { data: settingsRows } = await supabaseServer
        .from("system_settings")
        .select("value")
        .eq("key", "payment_amount")
        .limit(1)
        .maybeSingle()
      if (settingsRows?.value) {
        const parsed = Number(settingsRows.value)
        if (!isNaN(parsed) && parsed > 0) {
          paymentAmountFromDb = parsed
        }
      }
    } catch (e: any) {
      log("payment:init", "⚠️ Failed to load payment_amount from DB, using fallback 200", "warn", { error: e?.message })
    }

    log("payment:init", "Starting initiatePayment action", "info", {
      email: data.email,
      amount: paymentAmountFromDb,
      courseCategory: data.courseCategory,
      resultId: data.resultId || "⚠️ MISSING",
      reference,
      maskedPhone: data.phone.substring(0, 4) + "****" // Mask phone for logs
    })

    log("payment:init", "Initiating M-Pesa payment", "info", {
      email: data.email,
      amount: paymentAmountFromDb,
      reference,
      phone: data.phone.substring(0, 4) + "****" // Mask phone for logs
    })

    // CRITICAL: Normalize phone to 254xxx format
    const normalizedPhone = normalizePhoneNumber(data.phone)

    // Call M-Pesa STK Push API — amount is ALWAYS from server DB
    const response = await initiateStkPush({
      amount: paymentAmountFromDb,
      phoneNumber: normalizedPhone,
      accountReference: "Kuccps Course Checker",
      transactionDesc: "Course Checking on Kuccps Course Checker"
    })

    if (response.success) {
      log("payment:init", "✅ M-Pesa STK Push successful", "success", {
        reference,
        transaction_id: response.checkoutRequestID,
        message: response.customerMessage || response.responseDescription
      })

      // Store payment initiation in database for tracking
      try {
        const { error: insertError } = await supabaseServer.from("payment_transactions").insert({
          reference,
          transaction_id: response.checkoutRequestID, // Store CheckoutRequestID for webhook matching
          phone_number: normalizedPhone, // Store in 254xxx format for webhook matching
          email: data.email,
          name: data.name,
          amount: paymentAmountFromDb,
          course_category: data.courseCategory || null,
          result_id: data.resultId || null,  // CRITICAL: Store for n8n webhook
          status: "PENDING",
          created_at: new Date().toISOString(),
        })

        if (insertError) {
          log("payment:db", "❌ CRITICAL: Failed to store transaction record", "error", {
            error: insertError.message,
            reference,
            hint: "Database connection may be broken - check SUPABASE_SERVICE_ROLE_KEY"
          })

          // CRITICAL FIX: Fail the payment if we can't record it
          // Better to prevent payment than to take money without tracking
          throw new Error(`Database recording failed: ${insertError.message}`)
        }

        log("payment:db", "✅ Transaction stored in database", "debug", {
          reference,
          transaction_id: response.checkoutRequestID,
          course_category: data.courseCategory
        })
      } catch (dbError: any) {
        log("payment:db", "💥 Database error during payment initiation", "error", {
          error: dbError.message,
          reference,
        })

        // Return error to user - don't proceed with payment
        return {
          success: false,
          message: "Database error. Please contact support if your account was debited.",
        }
      }

      return {
        success: true,
        paymentId: reference, // Use reference as paymentId for tracking
        message: response.customerMessage || "STK Push sent to your phone",
      }
    } else {
      log("payment:init", "M-Pesa STK Push failed", "error", {
        success: response.success,
        message: response.error || response.responseDescription,
        code: response.responseCode
      })
      return {
        success: false,
        message: response.error || response.responseDescription || "Failed to initiate payment",
      }
    }
  } catch (error) {
    log("payment:init", "Payment initiation exception", "error", error)
    return {
      success: false,
      message: "Failed to initiate payment. Please try again.",
    }
  }
}

/**
 * Check payment status from database (updated by webhook)
 */
export async function checkPaymentStatus(paymentId: string) {
  try {
    log("payment:status", "🔍 Checking status in database", "debug", { paymentId })

    // Query database for payment status (updated by webhook)
    const { data: transaction, error } = await supabaseServer
      .from("payment_transactions")
      .select("status, updated_at, webhook_data, mpesa_receipt_number, email, phone_number")
      .eq("reference", paymentId)
      .single()

    if (error) {
      // If table doesn't exist or other DB error, return pending to continue polling
      log("payment:status", "⚠️ Database query error - table may not exist yet", "warn", {
        paymentId,
        error: error.message,
        errorCode: error.code,
        hint: "Run migration: supabase/migrations/2026-01-11_pesaflux_transactions.sql"
      })
      return {
        status: "PENDING",
        message: "Awaiting payment confirmation",
      }
    }

    if (!transaction) {
      log("payment:status", "❌ Transaction not found in database", "warn", {
        paymentId,
        hint: "Payment may not have been initiated"
      })
      return {
        status: "PENDING",
        message: "Awaiting payment confirmation",
      }
    }

    log("payment:status", "📊 Transaction found - current status", "debug", {
      paymentId,
      status: transaction.status,
      hasWebhookData: !!transaction.webhook_data,
      mpesaReceipt: transaction.mpesa_receipt_number || "none",
      lastUpdated: transaction.updated_at
    })

    // Map database status to frontend status
    const status = transaction.status.toUpperCase()

    if (status === "COMPLETED" || status === "SUCCESS") {
      log("payment:status", "✅ Payment COMPLETED!", "success", {
        paymentId,
        mpesaReceipt: transaction.mpesa_receipt_number
      })
      return {
        status: "COMPLETED",
        message: "Payment completed successfully",
      }
    } else if (status === "FAILED" || status === "CANCELLED") {
      log("payment:status", "❌ Payment FAILED", "error", { paymentId, status })
      return {
        status: "FAILED",
        message: "Payment failed or was cancelled",
      }
    } else {
      // Check if payment has been pending for too long (5 minutes)
      const updatedAt = new Date(transaction.updated_at)
      const ageMinutes = (Date.now() - updatedAt.getTime()) / 1000 / 60

      log("payment:status", "⏳ Payment still PENDING", "debug", {
        paymentId,
        ageMinutes: ageMinutes.toFixed(2),
        willTimeoutIn: (5 - ageMinutes).toFixed(2) + " minutes"
      })

      if (ageMinutes > 5) {
        log("payment:status", "⏰ Payment TIMEOUT - stuck for > 5 minutes", "warn", {
          paymentId,
          ageMinutes,
          hint: "Webhook likely didn't receive callback. Check PAYMENT_FLOW_DEBUG.md"
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
      stack: error.stack,
      hint: "Ensure payment_transactions table exists"
    })

    // Return PENDING on any error to allow polling to continue
    return {
      status: "PENDING",
      message: "Checking payment status...",
    }
  }
}
