import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Header from "@/components/header"
import BackButton from "@/components/back-button"
import BackgroundProvider from "@/components/background/BackgroundProvider"
import ReferrerTracker from "@/components/referrer-tracker"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KUCCPS Course Checker - Find Your Perfect Course Match",
  description:
    "Check which KUCCPS courses you qualify for based on your KCSE grades. Get instant, accurate results using official data and cluster formulas."
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-base text-light relative`}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <BackgroundProvider />
            <BackButton />
            <Header />
            <ReferrerTracker />
            <main className="min-h-screen">{children}</main>
            <Toaster />
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
