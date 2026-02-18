"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Key, Search, Download, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface AgentInfo {
    id: string
    name: string
    code: string
}

interface Quota {
    daily_limit: number
    downloads_today: number
    remaining_today: number
}

interface VerifiedResult {
    result_id: string
    category: string
    name: string
    email: string
    phone_number: string
    courses_count: number
}

interface DownloadQuota {
    per_result_limit: number
    downloads_used: number
    downloads_remaining: number
}

type Step = "token" | "verify" | "downloading"

export default function AgentPortalPage() {
    const { toast } = useToast()
    const [step, setStep] = useState<Step>("token")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Token verification state
    const [token, setToken] = useState("")
    const [tokenId, setTokenId] = useState("")
    const [agent, setAgent] = useState<AgentInfo | null>(null)
    const [quota, setQuota] = useState<Quota | null>(null)

    // Payment verification state
    const [resultId, setResultId] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [paystackRef, setPaystackRef] = useState("")
    const [verifiedResult, setVerifiedResult] = useState<VerifiedResult | null>(null)
    const [downloadQuota, setDownloadQuota] = useState<DownloadQuota | null>(null)

    const handleVerifyToken = async () => {
        if (!token.trim()) {
            setError("Please enter your token")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const res = await fetch("/api/agent-portal/verify-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: token.trim() }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Token verification failed")
                return
            }

            setAgent(data.agent)
            setQuota(data.quota)
            setTokenId(data.token_id)
            setStep("verify")

            toast({
                title: "Token Verified",
                description: `Welcome, ${data.agent.name}!`,
            })
        } catch (e: any) {
            setError(e.message || "Network error")
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyPayment = async () => {
        // Validate: need either Result ID OR (Paystack Reference + Phone Number)
        const hasResultId = resultId.trim()
        const hasPaystackLookup = paystackRef.trim() && phoneNumber.trim()

        if (!hasResultId && !hasPaystackLookup) {
            setError("Please enter Result ID, or Paystack Reference + Phone Number")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const res = await fetch("/api/agent-portal/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    result_id: resultId.trim() || undefined,
                    phone_number: phoneNumber.trim() || undefined,
                    paystack_reference: paystackRef.trim() || undefined,
                    agent_code: agent?.code,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                if (data.limit_reached) {
                    setError("Download limit reached for this Result ID (max 3 downloads)")
                } else {
                    setError(data.error || "Payment verification failed")
                }
                return
            }

            setVerifiedResult(data.result)
            setDownloadQuota(data.download_quota)

            // Store the resolved result_id (important for Paystack lookups)
            if (data.result?.result_id && !resultId.trim()) {
                setResultId(data.result.result_id)
            }

            toast({
                title: "Payment Verified",
                description: `Found ${data.result.courses_count} courses. Ready to download!`,
            })
        } catch (e: any) {
            setError(e.message || "Network error")
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadPDF = async () => {
        if (!verifiedResult) return

        setLoading(true)
        setStep("downloading")
        setError(null)

        // Use the result_id from verification (handles M-Pesa lookups)
        const downloadResultId = verifiedResult.result_id

        try {
            const res = await fetch("/api/agent-portal/download-pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: token.trim(),
                    result_id: downloadResultId,
                    phone_number: phoneNumber.trim() || undefined,
                    paystack_reference: paystackRef.trim() || undefined,
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                setError(data.error || "Download failed")
                setStep("verify")
                return
            }

            // Download the PDF
            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `KUCCPS_${verifiedResult.category}_${downloadResultId.substring(0, 8)}.pdf`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)

            // Update quotas
            if (quota) {
                setQuota({
                    ...quota,
                    downloads_today: quota.downloads_today + 1,
                    remaining_today: quota.remaining_today - 1,
                })
            }
            if (downloadQuota) {
                setDownloadQuota({
                    ...downloadQuota,
                    downloads_used: downloadQuota.downloads_used + 1,
                    downloads_remaining: downloadQuota.downloads_remaining - 1,
                })
            }

            toast({
                title: "Download Complete",
                description: "PDF downloaded successfully!",
            })

            // Reset for next download
            setVerifiedResult(null)
            setResultId("")
            setPhoneNumber("")
            setPaystackRef("")
            setStep("verify")
        } catch (e: any) {
            setError(e.message || "Download failed")
            setStep("verify")
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        setStep("token")
        setToken("")
        setTokenId("")
        setAgent(null)
        setQuota(null)
        setVerifiedResult(null)
        setResultId("")
        setPhoneNumber("")
        setPaystackRef("")
        setError(null)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-3xl font-bold text-white mb-2">Agent Portal</h1>
                    <p className="text-indigo-200">Re-download PDF results for your students</p>
                </motion.div>

                <AnimatePresence mode="wait">
                    {step === "token" && (
                        <motion.div
                            key="token"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <Card className="bg-slate-800/80 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-white">
                                        <Key className="h-5 w-5 text-indigo-400" />
                                        Enter Your Token
                                    </CardTitle>
                                    <CardDescription className="text-slate-300">
                                        Enter the Agent Regeneration Token (ART) provided by admin
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="token" className="text-slate-200">Token</Label>
                                        <Input
                                            id="token"
                                            type="password"
                                            value={token}
                                            onChange={(e) => setToken(e.target.value)}
                                            placeholder="Enter your ART token"
                                            className="bg-slate-700 border-slate-600 text-white"
                                        />
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-2 text-red-400 text-sm">
                                            <AlertCircle className="h-4 w-4" />
                                            {error}
                                        </div>
                                    )}

                                    <Button
                                        onClick={handleVerifyToken}
                                        disabled={loading || !token.trim()}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Verifying...
                                            </>
                                        ) : (
                                            "Verify Token"
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {step === "verify" && agent && (
                        <motion.div
                            key="verify"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            {/* Agent Info Card */}
                            <Card className="bg-indigo-900/50 border-indigo-700">
                                <CardContent className="py-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-indigo-200 text-sm">Logged in as</p>
                                            <p className="text-white font-semibold">{agent.name}</p>
                                            <p className="text-indigo-300 text-sm">Code: {agent.code}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-indigo-200 text-sm">Today's Downloads</p>
                                            <p className="text-white font-semibold">
                                                {quota?.downloads_today || 0} / {quota?.daily_limit || 20}
                                            </p>
                                            <p className="text-indigo-300 text-sm">
                                                {quota?.remaining_today || 0} remaining
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleLogout}
                                        className="mt-2 text-indigo-300 hover:text-white"
                                    >
                                        Change Token
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Verification Form */}
                            <Card className="bg-slate-800/80 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-white">
                                        <Search className="h-5 w-5 text-indigo-400" />
                                        Verify Student Payment
                                    </CardTitle>
                                    <CardDescription className="text-slate-300">
                                        Enter <strong>Result ID</strong> OR <strong>Paystack Reference + Phone Number</strong>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Helper text explaining lookup options */}
                                    <div className="bg-slate-700/50 rounded-lg p-3 text-sm text-slate-300">
                                        <p className="font-medium text-indigo-300 mb-1">💡 Two ways to find results:</p>
                                        <ul className="list-disc list-inside space-y-1 text-xs">
                                            <li><strong>Option A:</strong> Enter the Result ID directly</li>
                                            <li><strong>Option B:</strong> Enter Paystack Reference + Phone Number</li>
                                        </ul>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="resultId" className="text-slate-200">Result ID (optional if using Paystack Reference)</Label>
                                        <Input
                                            id="resultId"
                                            value={resultId}
                                            onChange={(e) => setResultId(e.target.value)}
                                            placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000"
                                            className="bg-slate-700 border-slate-600 text-white font-mono text-sm"
                                        />
                                    </div>

                                    <div className="relative flex items-center py-2">
                                        <div className="flex-grow border-t border-slate-600"></div>
                                        <span className="flex-shrink mx-3 text-slate-400 text-xs">OR use Paystack Reference</span>
                                        <div className="flex-grow border-t border-slate-600"></div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="paystackRef" className="text-slate-200">Paystack Reference</Label>
                                        <Input
                                            id="paystackRef"
                                            value={paystackRef}
                                            onChange={(e) => setPaystackRef(e.target.value.toUpperCase())}
                                            placeholder="e.g., PAY-1708567890-ABC123"
                                            className="bg-slate-700 border-slate-600 text-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phoneNumber" className="text-slate-200">Phone Number {!resultId.trim() && "(required for Paystack lookup)"}</Label>
                                        <Input
                                            id="phoneNumber"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="0712345678"
                                            className="bg-slate-700 border-slate-600 text-white"
                                        />
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-2 text-red-400 text-sm">
                                            <AlertCircle className="h-4 w-4" />
                                            {error}
                                        </div>
                                    )}

                                    {!verifiedResult && (
                                        <Button
                                            onClick={handleVerifyPayment}
                                            disabled={loading || (!resultId.trim() && (!paystackRef.trim() || !phoneNumber.trim()))}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Verifying...
                                                </>
                                            ) : (
                                                "Verify Payment"
                                            )}
                                        </Button>
                                    )}

                                    {verifiedResult && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-4"
                                        >
                                            <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                                                <div className="flex items-center gap-2 text-green-400 mb-2">
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span className="font-semibold">Payment Verified</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <p className="text-slate-400">Student</p>
                                                        <p className="text-white">{verifiedResult.name || "N/A"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-400">Category</p>
                                                        <p className="text-white capitalize">{verifiedResult.category}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-400">Courses</p>
                                                        <p className="text-white">{verifiedResult.courses_count}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-400">Downloads Left</p>
                                                        <p className="text-white">{downloadQuota?.downloads_remaining || 0}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={handleDownloadPDF}
                                                disabled={loading}
                                                className="w-full bg-green-600 hover:bg-green-700"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Generating PDF...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download PDF
                                                    </>
                                                )}
                                            </Button>

                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setVerifiedResult(null)
                                                    setDownloadQuota(null)
                                                    setError(null)
                                                }}
                                                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                                            >
                                                Verify Another Student
                                            </Button>
                                        </motion.div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {step === "downloading" && (
                        <motion.div
                            key="downloading"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <Card className="bg-slate-800/80 border-slate-700">
                                <CardContent className="py-12">
                                    <div className="text-center">
                                        <Loader2 className="h-12 w-12 text-indigo-400 mx-auto animate-spin mb-4" />
                                        <p className="text-white font-semibold text-lg">Generating PDF...</p>
                                        <p className="text-slate-400">This may take a few seconds</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                <p className="text-center text-indigo-300/60 text-sm mt-8">
                    © 2026 KUCCPS Course Checker - Agent Portal
                </p>
            </div>
        </div>
    )
}
