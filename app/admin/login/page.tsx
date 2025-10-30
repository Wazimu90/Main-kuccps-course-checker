"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, Shield, ArrowLeft, Loader2, Mail, Lock, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function AdminLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const [twoFACode, setTwoFACode] = useState("")
  const [is2FALoading, setIs2FALoading] = useState(false)
  const [error, setError] = useState("")
  const [failedAttempts, setFailedAttempts] = useState(0)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError("")
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields")
      return false
    }
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address")
      return false
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return false
    }
    return true
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setError("")

    try {
      // Simulate API call for login
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Check credentials (mock validation)
      if (formData.email === "admin@kuccps.com" && formData.password === "admin123") {
        // Success - show 2FA
        setShow2FA(true)
        toast({
          title: "Login Successful",
          description: "Please enter the 2FA code sent to your email",
        })
      } else {
        setFailedAttempts((prev) => prev + 1)
        setError("Invalid email or password")
      }
    } catch (error) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!twoFACode || twoFACode.length !== 6) {
      setError("Please enter a valid 6-digit code")
      return
    }

    setIs2FALoading(true)
    setError("")

    try {
      // Simulate 2FA verification
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (twoFACode === "123456") {
        // Success - redirect to dashboard
        localStorage.setItem("adminToken", "mock-admin-token")
        toast({
          title: "Authentication Successful",
          description: "Welcome to the admin dashboard",
        })
        router.push("/admin/dashboard")
      } else {
        setError("Invalid 2FA code. Please try again.")
      }
    } catch (error) {
      setError("2FA verification failed. Please try again.")
    } finally {
      setIs2FALoading(false)
    }
  }

  const resend2FA = () => {
    toast({
      title: "2FA Code Sent",
      description: "A new verification code has been sent to your email",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
            >
              <Shield className="h-8 w-8 text-primary" />
            </motion.div>
            <h1 className="text-2xl font-bold">KUCCPS Admin</h1>
            <p className="text-muted-foreground">Authorized access only</p>
          </div>

          {/* Login Form */}
          <Card className="border border-border bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Admin Login</CardTitle>
              <CardDescription>Enter your credentials to access the admin dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {failedAttempts >= 3 && (
                  <Alert>
                    <AlertDescription>
                      Multiple failed attempts detected. Please contact support if you continue to have issues.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="admin@kuccps.com"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10"
                      placeholder="Enter your password"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Return to User Side
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>KUCCPS Course Checker Admin v1.0</p>
          </div>
        </motion.div>
      </div>

      {/* 2FA Modal */}
      <Dialog open={show2FA} onOpenChange={setShow2FA}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>Enter the 6-digit verification code sent to your email address</DialogDescription>
          </DialogHeader>

          <form onSubmit={handle2FA} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="twoFACode">Verification Code</Label>
              <Input
                id="twoFACode"
                value={twoFACode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                  setTwoFACode(value)
                  if (error) setError("")
                }}
                className="text-center text-lg tracking-widest"
                placeholder="000000"
                maxLength={6}
                disabled={is2FALoading}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={is2FALoading || twoFACode.length !== 6}>
                {is2FALoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={resend2FA} disabled={is2FALoading}>
                Resend
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
