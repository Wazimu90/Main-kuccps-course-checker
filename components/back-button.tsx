"use client"

import { useState, useMemo } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function BackButton() {
  const router = useRouter()
  const pathname = usePathname()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const isSensitivePage = useMemo(() => {
    return pathname?.startsWith("/input") || pathname?.startsWith("/payment")
  }, [pathname])

  if (pathname?.startsWith("/admin")) return null
  if (pathname === "/") return null
  if (pathname === "/maintenance") return null

  const handleBack = () => {
    if (isSensitivePage) {
      setConfirmOpen(true)
      return
    }
    history.back()
  }

  const handleConfirm = () => {
    try {
      localStorage.removeItem("gradeData")
      localStorage.removeItem("selectedCategory")
      localStorage.removeItem("clusterWeights")
      localStorage.removeItem("paymentInfo")
    } catch {}
    setConfirmOpen(false)
    router.back()
  }

  const handleCancel = () => setConfirmOpen(false)

  return (
    <div className="fixed top-4 left-4 z-[60]">
      <button
        type="button"
        onClick={handleBack}
        aria-label="Go back"
        className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border border-white/20 text-light hover:bg-white/15 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Back</span>
      </button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to go back?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-white">
            Are you sure you want to go back? All unsaved changes will be lost.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} aria-label="Cancel back navigation">Cancel</Button>
            <Button onClick={handleConfirm} aria-label="Confirm back navigation">Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
