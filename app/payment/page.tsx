"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Phone, Mail, User, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import PaymentStatus from "@/components/payment-status"
import PaymentSummary from "@/components/payment-summary"
import { initiatePayment, checkPaymentStatus } from "@/app/payment/actions"
import Footer from "@/components/footer"
import { supabase } from "@/lib/supabase"
import { log } from "@/lib/logger"

enum PaymentState {
  INITIAL = "initial",
  PROCESSING = "processing",
  SUCCESS = "success",
  FAILED = "failed",
}

export default function PaymentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [paymentState, setPaymentState] = useState<PaymentState>(PaymentState.INITIAL)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false)
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [adminKey, setAdminKey] = useState("")
  const [courseCategory, setCourseCategory] = useState<string | null>(null)
  const [resultId, setResultId] = useState<string | null>(null)  // CRITICAL: Store result_id for n8n
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null) // Will be fetched from database
  const [isLoadingAmount, setIsLoadingAmount] = useState(true)
  const [currentChargeAmount, setCurrentChargeAmount] = useState<number>(200) // Track current charge amount
  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "wazimuautomate@gmail.com"

  // Load payment amount from admin settings
  useEffect(() => {
    const fetchPaymentAmount = async () => {
      try {
        setIsLoadingAmount(true)
        // Use the dedicated public settings endpoint with cache-busting
        const res = await fetch(`/api/settings?t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          }
        })
        if (res.ok) {
          const data = await res.json()
          // payment_amount is returned directly, not nested in settings
          if (data?.payment_amount !== undefined && data?.payment_amount !== null) {
            setPaymentAmount(Number(data.payment_amount))
            log("payment:settings", "Payment amount loaded from database", "debug", { amount: data.payment_amount })
          } else {
            // Fallback if no setting exists
            setPaymentAmount(200)
            log("payment:settings", "No payment_amount in response, using fallback of 200", "warn", data)
          }
        } else {
          // API error fallback
          setPaymentAmount(200)
          log("payment:settings", "Failed to fetch settings, using fallback of 200", "warn", { status: res.status })
        }
      } catch (e) {
        setPaymentAmount(200)
        log("payment:settings", "Exception loading payment amount, using fallback of 200", "warn", e)
      } finally {
        setIsLoadingAmount(false)
      }
    }
    fetchPaymentAmount()
  }, [])

  // Load saved grade data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("gradeData")
    if (!savedData) {
      toast({
        title: "No grade data found",
        description: "Please complete the grade entry form first.",
        variant: "destructive",
      })
      router.push("/")
    }
    try {
      const category = localStorage.getItem("selectedCategory")
      const storedResultId = localStorage.getItem("resultId")  // CRITICAL: Get result_id for n8n
      const parsed = savedData ? JSON.parse(savedData) : null
      const resolved = (category || parsed?.category || "").toString()
      setCourseCategory(resolved || null)
      setResultId(storedResultId || null)

      // CRITICAL: Warn if resultId is missing - this will cause issues with M-Pesa lookups
      if (!storedResultId) {
        log("payment:init", "⚠️ WARNING: resultId is missing from localStorage", "warn", {
          category: resolved || null,
          hasGradeData: !!savedData,
          hint: "User may have navigated directly to payment or results_cache insert failed"
        })
        toast({
          title: "⚠️ Result ID Missing",
          description: "Your result ID could not be found. You can still pay, but contact support if you need result regeneration later.",
          variant: "destructive",
        })
      } else {
        log("payment:init", "Loaded grade data and category", "debug", {
          category: resolved || null,
          resultId: storedResultId
        })
      }
    } catch { }
  }, [router, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    if (name === "email") {
      const detected = value.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()
      setIsAdminMode(detected)
      if (detected) {
        setFormData((prev) => ({ ...prev, name: "Admin", phone: "" }))
        setIsVerified(true)
        toast({
          title: "Admin Detected",
          description: "Enter Admin Access Key to proceed without payment.",
        })
      }
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!isAdminMode) {
      if (!formData.name.trim()) {
        newErrors.name = "Name is required"
      }

      const phoneRegex = /^(07|01)[0-9]{8}$/
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required"
      } else if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = "Enter a valid Kenyan phone number (e.g., 0712345678)"
      }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email address"
    }

    if (!isAdminMode) {
      if (!isVerified) {
        newErrors.captcha = "Please complete the CAPTCHA verification"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form before proceeding.",
        variant: "destructive",
      })
      return
    }

    log("payment:submit", "Submitting payment form", "info", {
      adminMode: isAdminMode,
      email: formData.email,
      courseCategory
    })
    if (isAdminMode) {
      if (!adminKey.trim()) {
        toast({ title: "Admin Key Required", description: "Please enter the admin access key.", variant: "destructive" })
        return
      }
      try {
        const resp = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name || "Admin",
            email: formData.email.trim(),
            phone_number: "",
            amount: 0,
            course_category: courseCategory,
            admin_access_code: adminKey.trim(),
          }),
        })
        const json = await resp.json()
        if (!resp.ok) {
          toast({
            title: "Admin Verification Failed",
            description: json?.error || "Invalid admin access code or inactive.",
            variant: "destructive",
          })
          return
        }
        localStorage.setItem(
          "paymentInfo",
          JSON.stringify({
            id: `admin-${Date.now()}`,
            amount: 0,
            phone: "",
            email: formData.email,
            name: formData.name || "Admin",
            timestamp: new Date().toISOString(),
            admin: true,
          }),
        )
        try {
          document.cookie = `user_email=${encodeURIComponent(formData.email)}; path=/; max-age=${60 * 60 * 24 * 365}`
        } catch { }
        toast({ title: "Admin Access Granted", description: "Redirecting to results..." })
        log("payment:admin", "Admin access granted; redirecting to results", "success")
        try {
          await fetch("/api/activity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event_type: "admin.bypass",
              actor_role: "admin",
              email: formData.email,
              description: "Admin bypassed payment",
              metadata: { course_category: courseCategory },
            }),
          })
        } catch { }
        setTimeout(() => router.push("/results"), 1200)
        return
      } catch (err) {
        toast({
          title: "Admin Verification Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
        log("payment:admin", "Admin verification error", "error", err)
        return
      }
    }

    try {
      setPaymentState(PaymentState.PROCESSING)

      // Use paymentAmount from settings, fallback to 200 if not loaded
      const amountToCharge = paymentAmount || 200
      setCurrentChargeAmount(amountToCharge) // Store in state for use in polling

      log("payment:init", "Calling initiatePayment action", "debug", {
        amount: amountToCharge,
        category: courseCategory
      })

      const response = await initiatePayment({
        phone: formData.phone,
        email: formData.email,
        name: formData.name,
        courseCategory: courseCategory,
        resultId: resultId,  // CRITICAL: Pass result_id for n8n webhook
      })

      if (response.success && response.paymentId) {
        setPaymentId(response.paymentId)

        // Start polling for payment status
        log("payment:init", "Payment initiated", "success", { paymentId: response.paymentId })
        try {
          await fetch("/api/activity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event_type: "payment.initiated.client",
              actor_role: "user",
              email: formData.email,
              phone_number: formData.phone,
              description: "Client initiated payment",
              metadata: { paymentId: response.paymentId, amount: amountToCharge, category: courseCategory },
            }),
          })
        } catch { }
        pollPaymentStatus(response.paymentId)
      } else {
        setPaymentState(PaymentState.FAILED)
        toast({
          title: "Payment Initiation Failed",
          description: response.message || "Failed to initiate payment. Please try again.",
          variant: "destructive",
        })
        log("payment:init", "Payment initiation failed", "error", response)
        try {
          await fetch("/api/activity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event_type: "payment.failed.initiation",
              actor_role: "user",
              email: formData.email,
              phone_number: formData.phone,
              description: "Payment initiation failed",
              metadata: { amount: amountToCharge, category: courseCategory },
            }),
          })
        } catch { }
      }
    } catch (error) {
      log("payment:error", "Unhandled payment error", "error", error)
      setPaymentState(PaymentState.FAILED)
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const pollPaymentStatus = async (id: string) => {
    try {
      log("payment:poll", "Polling for status", "debug", { paymentId: id })
      const statusResponse = await checkPaymentStatus(id)

      if (statusResponse.status === "COMPLETED") {
        setPaymentState(PaymentState.SUCCESS)
        log("payment:status", "Payment completed", "success", { paymentId: id })

        try {
          await fetch("/api/activity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event_type: "payment.completed",
              actor_role: "user",
              email: formData.email,
              phone_number: formData.phone,
              description: "Payment completed",
              metadata: { paymentId: id, amount: currentChargeAmount, category: courseCategory },
            }),
          })
        } catch { }

        // Save payment info to localStorage
        localStorage.setItem(
          "paymentInfo",
          JSON.stringify({
            id,
            amount: currentChargeAmount,
            phone: formData.phone,
            email: formData.email,
            name: formData.name,
            timestamp: new Date().toISOString(),
          }),
        )

        try {
          log("payment:record", "Recording finished transaction to /api/payments", "info", {
            email: formData.email,
            reference: id,
            courseCategory: courseCategory || "degree"
          })

          // CRITICAL: course_category must be a valid value for payments table constraint
          // If null/empty, default to 'degree' to ensure payment is recorded
          const validCategory = courseCategory &&
            ['degree', 'diploma', 'certificate', 'artisan', 'kmtc'].includes(courseCategory.toLowerCase())
            ? courseCategory.toLowerCase()
            : 'degree'

          const recordResponse = await fetch("/api/payments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formData.name,
              email: formData.email,
              phone_number: formData.phone,
              amount: currentChargeAmount,
              course_category: validCategory,
              result_id: localStorage.getItem("resultId") || null,
            }),
          })

          if (!recordResponse.ok) {
            const errorData = await recordResponse.json()
            log("payment:record", "Failed to record payment to payments table", "error", {
              status: recordResponse.status,
              error: errorData,
              category: validCategory
            })
          } else {
            log("payment:record", "✅ Payment successfully recorded to payments table", "success", {
              category: validCategory
            })
          }

          try {
            sessionStorage.setItem("referral_cleared", "true")
            sessionStorage.removeItem("referral_code")
            document.cookie = "referral_code=; path=/; max-age=0"
            document.cookie = "referral_sticky=; path=/; max-age=0"
          } catch { }
        } catch { }

        try {
          document.cookie = `user_email=${encodeURIComponent(formData.email)}; path=/; max-age=${60 * 60 * 24 * 365}`
        } catch { }

        // Redirect to results page after 2 seconds
        setTimeout(() => {
          router.push("/results")
        }, 2000)

      } else if (statusResponse.status === "FAILED") {
        setPaymentState(PaymentState.FAILED)
        log("payment:status", "Payment failed", "warn", { paymentId: id })
        try {
          await fetch("/api/activity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event_type: "payment.failed",
              actor_role: "user",
              email: formData.email,
              phone_number: formData.phone,
              description: "Payment failed",
              metadata: { paymentId: id, amount: currentChargeAmount, category: courseCategory },
            }),
          })
        } catch { }
      } else {
        // Continue polling if still pending
        log("payment:status", "Payment pending; continue polling", "debug", { paymentId: id })
        setTimeout(() => pollPaymentStatus(id), 3000)
      }
    } catch (error) {
      log("payment:status", "Status check error", "error", error)
      setPaymentState(PaymentState.FAILED)
    }
  }

  const handleRetry = () => {
    log("payment:retry", "User initiated payment retry", "info", { previousPaymentId: paymentId })
    setPaymentState(PaymentState.INITIAL)
    setPaymentId(null)
  }

  const handleCaptchaVerify = () => {
    setIsVerified(true)
    if (errors.captcha) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.captcha
        return newErrors
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mx-auto max-w-2xl">
          <div className="">
            <Card className="rounded-2xl border border-border shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 pb-8 pt-6">
                <CardTitle className="text-center text-2xl">Complete Your Payment</CardTitle>
                <CardDescription className="text-center">
                  Unlock all courses you qualify for based on your KCSE grades
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                {paymentState === PaymentState.INITIAL && (
                  <>
                    <PaymentSummary />

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      {!isAdminMode && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <User className="h-4 w-4 text-white" />
                              </div>
                              <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`pl-10 ${errors.name ? "border-destructive" : ""}`}
                                placeholder="Enter your full name"
                              />
                            </div>
                            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone">M-Pesa Phone Number</Label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Phone className="h-4 w-4 text-white" />
                              </div>
                              <Input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className={`pl-10 ${errors.phone ? "border-destructive" : ""}`}
                                placeholder="07XXXXXXXX"
                              />
                            </div>
                            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                          </div>
                        </>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Mail className="h-4 w-4 text-white" />
                          </div>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                            placeholder="your.email@example.com"
                            aria-describedby={isAdminMode ? "admin-detected" : undefined}
                          />
                        </div>
                        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                        {isAdminMode && (
                          <p id="admin-detected" className="text-xs font-medium text-primary">
                            Admin detected — enter Admin Access Key to proceed.
                          </p>
                        )}
                      </div>

                      {!isAdminMode && (
                        <div className="mt-6">
                          <div className="flex justify-center">
                            <div
                              className={`border rounded-md p-4 w-full flex justify-center ${errors.captcha ? "border-destructive" : "border-border"
                                }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id="captcha-checkbox"
                                  onChange={() => handleCaptchaVerify()}
                                  className="h-4 w-4"
                                />
                                <label htmlFor="captcha-checkbox" className="text-sm">
                                  I'm not a robot
                                </label>
                              </div>
                            </div>
                          </div>
                          {errors.captcha && <p className="text-xs text-destructive mt-1">{errors.captcha}</p>}
                        </div>
                      )}

                      {isAdminMode && (
                        <div className="space-y-2">
                          <Label htmlFor="adminKey">Admin Access Key</Label>
                          <Input
                            id="adminKey"
                            name="adminKey"
                            value={adminKey}
                            onChange={(e) => setAdminKey(e.target.value)}
                            placeholder="Enter admin key"
                            aria-label="Admin Access Key"
                          />
                        </div>
                      )}

                      {!isAdminMode && (
                        <div className="flex items-center gap-2 text-xs text-white mt-4">
                          <Shield className="h-3 w-3" />
                          <p>Your payment information is secure. Protected by M-Pesa.</p>
                        </div>
                      )}

                      <Button type="submit" className="w-full mt-6" size="lg" disabled={isLoadingAmount}>
                        {isLoadingAmount
                          ? "Loading..."
                          : isAdminMode
                            ? "Continue as Admin"
                            : `Pay KES ${paymentAmount} with M-Pesa`}
                      </Button>
                    </form>
                  </>
                )}

                {paymentState !== PaymentState.INITIAL && (
                  <PaymentStatus
                    state={paymentState}
                    onRetry={handleRetry}
                    phone={formData.phone}
                    paymentAmount={paymentAmount || 200}
                  />
                )}
              </CardContent>

              <CardFooter className="bg-muted/30 flex flex-col space-y-4 px-6 py-4">
                <div className="text-center text-sm text-white">Need help? Use the contact options in the footer below.</div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      <Footer showOnHomepage={true} />
    </div>
  )
}
