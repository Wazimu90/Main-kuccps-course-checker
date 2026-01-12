"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { X, ChevronRight, GraduationCap, Calculator, FileText, CreditCard, Search, Menu, Mail, Award, HelpCircle, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

interface TutorialStep {
    id: string
    title: string
    description: string
    icon: React.ReactNode
}

// Tutorial configurations for each page/section
const TUTORIALS_CONFIG: Record<string, TutorialStep[]> = {
    // Home Page Tutorial
    "/": [
        {
            id: "home-welcome",
            title: "Welcome to KUCCPS Course Checker! 🎓",
            description: "We're here to help you discover which courses you qualify for based on your KCSE results. Let's show you around!",
            icon: <GraduationCap className="w-6 h-6" />,
        },
        {
            id: "home-header",
            title: "Navigation Menu (☰) 📋",
            description: "Tap the menu icon at the top right to access Student Tools, Cluster Calculator, News & updates, FAQs, About, and more!",
            icon: <Menu className="w-6 h-6" />,
        },
        {
            id: "home-categories",
            title: "Choose Your Course Category 🎯",
            description: "Scroll down to see course categories! Pick from Degrees, Diplomas, Certificates, KMTC courses, or Artisan programs. Each category has thousands of courses waiting for you.",
            icon: <Award className="w-6 h-6" />,
        },
        {
            id: "home-process",
            title: "Simple 3-Step Process ✨",
            description: "It's easy! Select a category → Enter your KCSE grades → Get your personalized course matches. That's it!",
            icon: <Sparkles className="w-6 h-6" />,
        },
        {
            id: "home-footer",
            title: "Need Help? We're Here! 💬",
            description: "Scroll to the bottom to find our contact button. Call us, WhatsApp us, or send an email. Also check Privacy Policy, Terms, and FAQs",
            icon: <HelpCircle className="w-6 h-6" />,
        },
    ],

    // Grade Entry Pages (Degree, Diploma, Certificate, KMTC, Artisan)
    "/input/degree": [
        {
            id: "grade-welcome",
            title: "Let's Enter Your KCSE Grades! 📝",
            description: "This is where the magic happens! Enter your grades accurately to get the most precise course matches.",
            icon: <FileText className="w-6 h-6" />,
        },
        {
            id: "grade-mean",
            title: "Your Mean Grade Matters 🎯",
            description: "Select your overall KCSE mean grade (A, A-, B+, etc.). This is usually on the right side of your result slip.",
            icon: <GraduationCap className="w-6 h-6" />,
        },
        {
            id: "grade-subjects",
            title: "Expandable Subject Sections 📚",
            description: "Notice the bouncing arrows? Click any section (Core Subjects, Sciences, Humanities) to expand and enter your subject grades. Each subject counts!",
            icon: <ChevronRight className="w-6 h-6" />,
        },
        {
            id: "grade-categories",
            title: "Select Course Categories 🔍",
            description: "Choose one or more course categories you're interested in (e.g., Business, Engineering, Health Sciences). This helps us find the perfect matches!",
            icon: <Search className="w-6 h-6" />,
        },
        {
            id: "grade-next",
            title: "Ready to See Your Matches? ✅",
            description: "Once you've entered your grades, hit the 'Continue' button. You'll proceed to payment (only Ksh 200!) to unlock your personalized course list.",
            icon: <Sparkles className="w-6 h-6" />,
        },
    ],

    "/input/diploma": [
        {
            id: "diploma-welcome",
            title: "Diploma Courses Await! 🎓",
            description: "Let's find diploma courses perfect for your KCSE results. These are technical and professional programs from colleges.",
            icon: <Award className="w-6 h-6" />,
        },
        {
            id: "diploma-subjects",
            title: "Click to Expand Subject Groups 📖",
            description: "See those bouncing arrows? They show you can click to expand each subject section. Enter at least 7 subject grades for accurate matching.",
            icon: <ChevronRight className="w-6 h-6" />,
        },
        {
            id: "diploma-categories",
            title: "Pick Your Interest Areas 🎯",
            description: "Select diploma categories that interest you - Business, Engineering, Health Sciences, Agriculture, and more. You can choose multiple!",
            icon: <Search className="w-6 h-6" />,
        },
        {
            id: "diploma-proceed",
            title: "Next Step: Payment 💳",
            description: "After entering your grades, you'll make a small payment (Ksh 200) via M-Pesa to unlock hundreds of diploma courses you qualify for!",
            icon: <CreditCard className="w-6 h-6" />,
        },
    ],

    "/input/certificate": [
        {
            id: "cert-welcome",
            title: "Certificate Programs for You! 📜",
            description: "Certificate courses are shorter programs that give you practical skills. Let's find the ones you qualify for!",
            icon: <FileText className="w-6 h-6" />,
        },
        {
            id: "cert-expand",
            title: "Expandable Sections (See the Bounce?) ⬇️",
            description: "The bouncing arrows show sections you can click to expand! Click each subject group to enter your grades - you need at least 7 subjects.",
            icon: <ChevronRight className="w-6 h-6" />,
        },
        {
            id: "cert-selection",
            title: "Choose Program Areas 🔧",
            description: "Select certificate categories you want (Technical, Business, Health, etc.). The more you select, the more options you'll see!",
            icon: <Search className="w-6 h-6" />,
        },
    ],

    "/input/kmtc": [
        {
            id: "kmtc-welcome",
            title: "KMTC Courses - Medical Training! 🏥",
            description: "Kenya Medical Training College offers healthcare courses. Let's see which medical programs match your qualifications!",
            icon: <GraduationCap className="w-6 h-6" />,
        },
        {
            id: "kmtc-subjects",
            title: "Enter Your Subject Grades 📋",
            description: "Click the sections with bouncing arrows to expand and enter your grades. Science subjects (Biology, Chemistry, Physics) are especially important for KMTC!",
            icon: <ChevronRight className="w-6 h-6" />,
        },
        {
            id: "kmtc-complete",
            title: "Complete & View Results 🎯",
            description: "Fill in all required fields and continue to payment. You'll then see all KMTC courses you qualify for with detailed requirements!",
            icon: <Sparkles className="w-6 h-6" />,
        },
    ],

    "/input/artisan": [
        {
            id: "artisan-welcome",
            title: "Hands-On Artisan Programs! 🔨",
            description: "Artisan courses teach practical, vocational skills. These programs lead to technical certifications and immediate job opportunities!",
            icon: <Award className="w-6 h-6" />,
        },
        {
            id: "artisan-mean",
            title: "Mean Grade & Categories 🎯",
            description: "For artisan courses, your mean grade is key! Select it, then choose the type of artisan training you're interested in (Construction, Automotive, Beauty, etc.).",
            icon: <FileText className="w-6 h-6" />,
        },
        {
            id: "artisan-county",
            title: "Choose Your Preferred Counties 📍",
            description: "Select one or more counties where you'd like to study. This helps us show you courses in institutions near you!",
            icon: <Search className="w-6 h-6" />,
        },
    ],

    // Payment Page
    "/payment": [
        {
            id: "payment-welcome",
            title: "Secure M-Pesa Payment 💳",
            description: "You're almost there! A small fee of Ksh 200 unlocks your personalized course results. Payment is 100% secure through M-Pesa.",
            icon: <CreditCard className="w-6 h-6" />,
        },
        {
            id: "payment-details",
            title: "Enter Your Details ✍️",
            description: "Fill in your name, M-Pesa phone number, and email. We'll send your results to this email, so make sure it's correct!",
            icon: <FileText className="w-6 h-6" />,
        },
        {
            id: "payment-robot",
            title: "Quick Verification ✅",
            description: "Check the 'I'm not a robot' box to verify you're human. This protects our system and ensures you get genuine results!",
            icon: <Sparkles className="w-6 h-6" />,
        },
        {
            id: "payment-process",
            title: "M-Pesa Prompt on Your Phone 📱",
            description: "After clicking 'Pay with M-Pesa', check your phone! Enter your M-Pesa PIN when prompted. Your results will load automatically after payment!",
            icon: <CreditCard className="w-6 h-6" />,
        },
        {
            id: "payment-help",
            title: "Need Help? Contact Us! 💬",
            description: "Scroll down to the footer and click the Contact button. We offer phone, WhatsApp, and email support if you have any payment issues!",
            icon: <HelpCircle className="w-6 h-6" />,
        },
    ],

    // Results Page
    "/results": [
        {
            id: "results-congrats",
            title: "Congratulations! Your Results Are Ready! 🎉",
            description: "Amazing! Here are ALL the courses you qualify for based on your KCSE grades. Let's explore your options together!",
            icon: <Award className="w-6 h-6" />,
        },
        {
            id: "results-summary",
            title: "Your Results Summary 📊",
            description: "Look at the top! You'll see how many courses you qualify for, number of institutions, and your highest cluster points. Impressive!",
            icon: <FileText className="w-6 h-6" />,
        },
        {
            id: "results-download",
            title: "Download as PDF 📥",
            description: "Click 'Download PDF' to save your results! Share it with parents, teachers, or friends. You can access it anytime, even offline!",
            icon: <FileText className="w-6 h-6" />,
        },
        {
            id: "results-search",
            title: "Search & Filter Your Courses 🔍",
            description: "Use the search bar to find specific courses or institutions. Filter by location, institution, and sort by cutoff points. Find your perfect match!",
            icon: <Search className="w-6 h-6" />,
        },
        {
            id: "results-details",
            title: "Course Details & Requirements 📋",
            description: "Click any course to see full details: institution name, location, program code, cutoff points, and specific requirements. Everything you need to know!",
            icon: <Sparkles className="w-6 h-6" />,
        },
        {
            id: "results-apply",
            title: "Ready to Apply? 🎓",
            description: "Found your dream course? Click 'Apply on KUCCPS' button (top right) to go directly to the official KUCCPS portal and submit your application!",
            icon: <GraduationCap className="w-6 h-6" />,
        },
    ],

    // Student Tools Page
    "/student-tools": [
        {
            id: "tools-welcome",
            title: "Essential Student Resources! 🛠️",
            description: "Welcome to your one-stop hub for all important student portals and services. Everything you need is right here!",
            icon: <Award className="w-6 h-6" />,
        },
        {
            id: "tools-cluster",
            title: "Free Cluster Calculator! 🧮",
            description: "Try our Cluster Calculator! Get estimated cluster points using the public KUCCPS formula, plus AI-powered insights to understand your results. Great for testing!",
            icon: <Calculator className="w-6 h-6" />,
        },
        {
            id: "tools-kuccps",
            title: "Official KUCCPS Portal 🎓",
            description: "Click for direct access to the Kenya Universities and Colleges placement portal. This is where you'll officially apply for your courses!",
            icon: <GraduationCap className="w-6 h-6" />,
        },
        {
            id: "tools-helb",
            title: "HELB - Education Loans 💰",
            description: "Higher Education Loans Board offers student loans and scholarships. Click to visit their portal and apply for financial aid!",
            icon: <CreditCard className="w-6 h-6" />,
        },
        {
            id: "tools-videos",
            title: "Video Tutorials Below! 📺",
            description: "Scroll down to watch helpful video guides! Learn how to navigate KUCCPS, apply for loans, check results, and more. Visual step-by-step tutorials!",
            icon: <Sparkles className="w-6 h-6" />,
        },
    ],

    // Cluster Calculator Page
    "/cluster-calculator": [
        {
            id: "cluster-welcome",
            title: "Cluster Points Calculator! 🧮",
            description: "Calculate your estimated KUCCPS cluster points here! This uses the public formula - great for guidance and understanding how cluster points work!",
            icon: <Calculator className="w-6 h-6" />,
        },
        {
            id: "cluster-subjects",
            title: "Select Your 7 Subjects 📚",
            description: "Choose exactly 7 subjects from your KCSE - the ones that give you the best cluster points. Click subjects and enter grades to see calculations in real-time!",
            icon: <GraduationCap className="w-6 h-6" />,
        },
        {
            id: "cluster-ai",
            title: "AI Explains Your Results! 🤖",
            description: "After calculating, you'll get AI-powered explanations! Understand what your cluster points mean and which courses you might qualify for. Super helpful!",
            icon: <Sparkles className="w-6 h-6" />,
        },
        {
            id: "cluster-disclaimer",
            title: "For Guidance Only ⚠️",
            description: "Remember: This calculator is for testing and understanding. Official cluster points come from KUCCPS after you apply. Use this as a helpful guide!",
            icon: <HelpCircle className="w-6 h-6" />,
        },
    ],
}

// Storage key for completed tutorials per page
const TUTORIAL_STORAGE_PREFIX = "kuccps_tutorial_completed_"

export default function MobileTutorial() {
    const pathname = usePathname()
    const [showTutorial, setShowTutorial] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [isMobile, setIsMobile] = useState(false)
    const [currentTutorialSteps, setCurrentTutorialSteps] = useState<TutorialStep[]>([])

    useEffect(() => {
        // Check if it's a mobile device
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkMobile()
        window.addEventListener("resize", checkMobile)

        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    useEffect(() => {
        if (!isMobile || !pathname) return

        // Determine which tutorial to show based on current path
        let tutorialKey = pathname

        // Match input category pages (degree, diploma, certificate, kmtc, artisan)
        if (pathname.startsWith("/input/")) {
            tutorialKey = pathname // Keep full path like /input/degree
        }

        const tutorialSteps = TUTORIALS_CONFIG[tutorialKey]

        if (!tutorialSteps) {
            // No tutorial configured for this page
            setShowTutorial(false)
            return
        }

        // Check if tutorial for this page has been completed
        const storageKey = TUTORIAL_STORAGE_PREFIX + tutorialKey
        const tutorialCompleted = localStorage.getItem(storageKey)

        if (!tutorialCompleted) {
            setCurrentTutorialSteps(tutorialSteps)
            setCurrentStep(0)
            // Show tutorial after a short delay to let the page load
            setTimeout(() => setShowTutorial(true), 1500)
        }
    }, [pathname, isMobile])

    const handleNext = () => {
        if (currentStep < currentTutorialSteps.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            completeTutorial()
        }
    }

    const handleSkip = () => {
        completeTutorial()
    }

    const completeTutorial = () => {
        if (pathname) {
            let tutorialKey = pathname
            if (pathname.startsWith("/input/")) {
                tutorialKey = pathname
            }
            const storageKey = TUTORIAL_STORAGE_PREFIX + tutorialKey
            localStorage.setItem(storageKey, "true")
        }
        setShowTutorial(false)
    }

    if (!isMobile || !showTutorial || currentTutorialSteps.length === 0) {
        return null
    }

    const currentTutorialStep = currentTutorialSteps[currentStep]
    const progress = ((currentStep + 1) / currentTutorialSteps.length) * 100

    return (
        <AnimatePresence>
            {showTutorial && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
                        onClick={handleSkip}
                    />

                    {/* Tutorial Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[101] max-w-md mx-auto"
                    >
                        <div className="bg-gradient-to-br from-surface/95 to-base/95 backdrop-blur-xl border border-accent/20 rounded-3xl shadow-2xl overflow-hidden">
                            {/* Close Button */}
                            <button
                                onClick={handleSkip}
                                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                                aria-label="Close tutorial"
                            >
                                <X className="w-5 h-5 text-white/80" />
                            </button>

                            {/* Progress Bar */}
                            <div className="h-1.5 bg-white/5">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-accent to-accent/60"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>

                            {/* Content */}
                            <div className="p-8 pt-12">
                                {/* Icon */}
                                <motion.div
                                    key={currentStep}
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", damping: 15, stiffness: 200 }}
                                    className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-2xl bg-accent/10 border border-accent/20 text-accent"
                                >
                                    {currentTutorialStep.icon}
                                </motion.div>

                                {/* Text Content */}
                                <motion.div
                                    key={`content-${currentStep}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <h2 className="text-2xl font-bold text-white text-center mb-4">
                                        {currentTutorialStep.title}
                                    </h2>
                                    <p className="text-dim text-center leading-relaxed mb-8">
                                        {currentTutorialStep.description}
                                    </p>
                                </motion.div>

                                {/* Step Indicators */}
                                <div className="flex justify-center gap-2 mb-8">
                                    {currentTutorialSteps.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`h-2 rounded-full transition-all duration-300 ${index === currentStep
                                                    ? "w-8 bg-accent"
                                                    : index < currentStep
                                                        ? "w-2 bg-accent/50"
                                                        : "w-2 bg-white/10"
                                                }`}
                                        />
                                    ))}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    {currentStep < currentTutorialSteps.length - 1 ? (
                                        <>
                                            <Button
                                                onClick={handleSkip}
                                                variant="outline"
                                                className="flex-1 bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                                            >
                                                Skip Tour
                                            </Button>
                                            <Button
                                                onClick={handleNext}
                                                className="flex-1 bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20"
                                            >
                                                Next
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            onClick={completeTutorial}
                                            className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-white shadow-lg shadow-accent/20"
                                        >
                                            Got It! Let's Go! 🚀
                                        </Button>
                                    )}
                                </div>

                                {/* Step Counter */}
                                <p className="text-center text-white/40 text-sm mt-6">
                                    Step {currentStep + 1} of {currentTutorialSteps.length}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
