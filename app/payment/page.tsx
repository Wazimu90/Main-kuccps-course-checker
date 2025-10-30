"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Phone, Mail, User, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import PaymentStatus from "@/components/payment-status"
import PaymentSummary from "@/components/payment-summary"
import { initiatePayment, checkPaymentStatus } from "@/app/payment/actions"

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
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    // Validate phone (Kenyan format)
    const phoneRegex = /^(07|01)[0-9]{8}$/
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Enter a valid Kenyan phone number (e.g., 0712345678)"
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email address"
    }

    // Validate CAPTCHA
    if (!isVerified) {
      newErrors.captcha = "Please complete the CAPTCHA verification"
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

    try {
      setPaymentState(PaymentState.PROCESSING)

      // Initiate payment
      const response = await initiatePayment({
        phone: formData.phone,
        email: formData.email,
        name: formData.name,
        amount: 200, // KES 200 as specified
      })

      if (response.success) {
        setPaymentId(response.paymentId)

        // Start polling for payment status
        pollPaymentStatus(response.paymentId)
      } else {
        setPaymentState(PaymentState.FAILED)
        toast({
          title: "Payment Initiation Failed",
          description: response.message || "Failed to initiate payment. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Payment error:", error)
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
      const statusResponse = await checkPaymentStatus(id)

      if (statusResponse.status === "COMPLETED") {
        setPaymentState(PaymentState.SUCCESS)

        // Save payment info to localStorage
        localStorage.setItem(
          "paymentInfo",
          JSON.stringify({
            id,
            amount: 200,
            phone: formData.phone,
            email: formData.email,
            timestamp: new Date().toISOString(),
          }),
        )

        // Redirect to results page after 2 seconds
        setTimeout(() => {
          router.push("/results")
        }, 2000)
      } else if (statusResponse.status === "FAILED") {
        setPaymentState(PaymentState.FAILED)
      } else {
        // Continue polling if still pending
        setTimeout(() => pollPaymentStatus(id), 3000)
      }
    } catch (error) {
      console.error("Status check error:", error)
      setPaymentState(PaymentState.FAILED)
    }
  }

  const handleRetry = () => {
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

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center">
        <Button variant="ghost" className="flex items-center gap-2" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

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
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <User className="h-4 w-4 text-muted-foreground" />
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
                          <Phone className="h-4 w-4 text-muted-foreground" />
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

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                          placeholder="your.email@example.com"
                        />
                      </div>
                      {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>

                    <div className="mt-6">
                      {/* CAPTCHA Component */}
                      <div className="flex justify-center">
                        <div
                          className={`border rounded-md p-4 w-full flex justify-center ${
                            errors.captcha ? "border-destructive" : "border-border"
                          }`}
                        >
                          {/* This is a placeholder for the actual reCAPTCHA component */}
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

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
                      <Shield className="h-3 w-3" />
                      <p>Your payment information is secure. Protected by M-Pesa.</p>
                    </div>

                    <Button type="submit" className="w-full mt-6" size="lg">
                      Pay KES 200 with M-Pesa
                    </Button>
                  </form>
                </>
              )}

              {paymentState !== PaymentState.INITIAL && (
                <PaymentStatus state={paymentState} onRetry={handleRetry} phone={formData.phone} />
              )}
            </CardContent>

            <CardFooter className="bg-muted/30 flex flex-col space-y-4 px-6 py-4">
              <div className="text-center text-sm text-muted-foreground">Having trouble? Contact our support team</div>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" size="sm" onClick={() => window.open("tel:+254748776354")}>
                  Call us Now
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open("https://wa.me/254748776354")}>
                  WhatsApp
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
