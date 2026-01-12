"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

/**
 * TutorialReset Component
 * A developer/testing utility to reset the mobile tutorial for the current page
 * This allows you to test the tutorial multiple times on any page
 * 
 * Usage: Add this component temporarily to any page you want to test with
 * Example: <TutorialReset />
 */
export default function TutorialReset() {
    const pathname = usePathname()

    const handleReset = () => {
        if (!pathname) return

        // Determine the tutorial key based on current path
        let tutorialKey = pathname
        if (pathname.startsWith("/input/")) {
            tutorialKey = pathname // Keep full path like /input/degree
        }

        const storageKey = `kuccps_tutorial_completed_${tutorialKey}`
        localStorage.removeItem(storageKey)
        window.location.reload()
    }

    const handleResetAll = () => {
        // Clear all tutorial completion flags
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
            if (key.startsWith("kuccps_tutorial_completed_")) {
                localStorage.removeItem(key)
            }
        })
        window.location.reload()
    }

    return (
        <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
            <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className=" bg-accent/10 border-accent/20 hover:bg-accent/20 text-accent"
            >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset This Page Tutorial
            </Button>
            <Button
                onClick={handleResetAll}
                variant="outline"
                size="sm"
                className="bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-400"
            >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset All Tutorials
            </Button>
        </div>
    )
}
