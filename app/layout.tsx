import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Header from "@/components/header"
import ApplicationStatusBanner from "@/components/application-status-banner"
import BackButton from "@/components/back-button"
import BackgroundProvider from "@/components/background/BackgroundProvider"
import ReferrerTracker from "@/components/referrer-tracker"
import MobileTutorial from "@/components/mobile-tutorial"
import ClientBannerWrapper from "@/components/client-banner-wrapper"
import Breadcrumbs from "@/components/Breadcrumbs"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KUCCPS Course Checker 2026 | Check Degree, Diploma & KMTC Courses",
  description:
    "Check KUCCPS course eligibility instantly for Degree, Diploma, KMTC, Certificate and Artisan courses. Smart AI explanations based on your KCSE results.",
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
    "artisan courses KUCCPS",
    "kmtc courses KUCCPS"
  ],
  openGraph: {
    title: "KUCCPS Course Checker 2026 | Check Degree, Diploma & KMTC Courses",
    description:
      "Check KUCCPS course eligibility instantly for Degree, Diploma, KMTC, Certificate and Artisan courses. Smart AI explanations based on your KCSE results.",
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
            {/* Skip to Main Content Link for Accessibility */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:bg-accent focus:text-dark focus:rounded-lg focus:font-bold focus:shadow-glow"
            >
              Skip to main content
            </a>

            <BackgroundProvider />
            <BackButton />
            <Header />
            {/* Application Status Banner - only on homepage, with padding for non-admin pages */}
            <ClientBannerWrapper>
              <ApplicationStatusBanner />
            </ClientBannerWrapper>
            <ReferrerTracker />
            <MobileTutorial />
            <div className="container mx-auto max-w-7xl">
              <Breadcrumbs />
            </div>
            <main id="main-content" className="min-h-screen">{children}</main>
            <Toaster />
            <Analytics />
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
