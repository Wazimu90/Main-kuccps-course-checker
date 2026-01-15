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
import MobileTutorial from "@/components/mobile-tutorial"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KUCCPS Course Checker 2026 | Check Courses You Qualify For Using KCSE Grades",
  description:
    "Use our free KUCCPS Course Checker to see degree and diploma courses you qualify for based on your KCSE results. Accurate cluster point calculations using official KUCCPS formulas.",
  keywords: [
    "KUCCPS course checker",
    "course checker",
    "KCSE course checker",
    "KUCCPS cluster points",
    "courses I qualify for",
    "KUCCPS 2026",
    "degree courses KUCCPS",
    "diploma courses KUCCPS",
    "certificate courses KUCCPS",
    "artican courses KUCCPS",
    "kmtc courses KUCCPS"
  ],
  openGraph: {
    title: "KUCCPS Course Checker 2026",
    description:
      "Check KUCCPS courses you qualify for using your KCSE grades and official cluster point formulas.",
    type: "website"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-77JHPKF3VZ"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-77JHPKF3VZ');
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-base text-light relative`}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <BackgroundProvider />
            <BackButton />
            <Header />
            <ReferrerTracker />
            <MobileTutorial />
            <main className="min-h-screen">{children}</main>
            <Toaster />
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
