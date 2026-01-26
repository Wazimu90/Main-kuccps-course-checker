"use client"

import React, { useState } from "react"
import Link from "next/link"
import { ChevronDown, Search, Calculator, BookOpen, Mail, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface FAQ {
    id: number
    question: string
    answer: string | React.ReactNode
}

const faqs: FAQ[] = [
    {
        id: 1,
        question: "I have my KCSE results. What should I do before applying on KUCCPS?",
        answer: (
            <>
                Before applying on KUCCPS, you should first confirm which courses you actually qualify for based on your KCSE grades and cluster requirements. Many students lose chances by guessing. Use our{" "}
                <Link href="/degree" className="text-accent hover:underline font-semibold">
                    KUCCPS course checker
                </Link>{" "}
                and{" "}
                <Link href="/cluster-calculator" className="text-accent hover:underline font-semibold">
                    cluster calculator
                </Link>{" "}
                to avoid selecting courses you are not eligible for.
            </>
        ),
    },
    {
        id: 2,
        question: "How do I know which KUCCPS courses I qualify for with my KCSE grades?",
        answer: (
            <>
                You need to compare your KCSE grades with official KUCCPS requirements such as mean grade, subject combinations, and cluster points. Our KUCCPS Course Checker does this automatically and shows eligible{" "}
                <Link href="/degree" className="text-accent hover:underline font-semibold">
                    Degree
                </Link>
                ,{" "}
                <Link href="/diploma" className="text-accent hover:underline font-semibold">
                    Diploma
                </Link>
                ,{" "}
                <Link href="/kmtc" className="text-accent hover:underline font-semibold">
                    KMTC
                </Link>
                ,{" "}
                <Link href="/certificate" className="text-accent hover:underline font-semibold">
                    Certificate
                </Link>
                , and{" "}
                <Link href="/artisan" className="text-accent hover:underline font-semibold">
                    Artisan
                </Link>{" "}
                courses instantly.
            </>
        ),
    },
    {
        id: 3,
        question: "What are KUCCPS cluster points and why are they important?",
        answer: (
            <>
                Cluster points are calculated using specific KCSE subjects depending on the course. KUCCPS uses them to rank applicants. Even if you meet the mean grade, low cluster points can make you miss a course. Our{" "}
                <Link href="/cluster-calculator" className="text-accent hover:underline font-semibold">
                    cluster points calculator
                </Link>{" "}
                helps you understand and estimate your chances clearly.
            </>
        ),
    },
    {
        id: 4,
        question: "Can I calculate my cluster points before applying?",
        answer: (
            <>
                Yes. You can use the{" "}
                <Link href="/cluster-calculator" className="text-accent hover:underline font-semibold">
                    cluster calculator
                </Link>{" "}
                on this site to estimate your cluster points and understand how KUCCPS evaluates different subject combinations. This helps you choose realistic courses before the application or revision period.
            </>
        ),
    },
    {
        id: 5,
        question: "What courses can I apply for if I got C+, C, C-, or D+?",
        answer: (
            <>
                Your KCSE mean grade determines the category of courses you can apply for:
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>
                        <strong>C+ and above:</strong>{" "}
                        <Link href="/degree" className="text-accent hover:underline">
                            Degree
                        </Link>
                        ,{" "}
                        <Link href="/diploma" className="text-accent hover:underline">
                            Diploma
                        </Link>
                        ,{" "}
                        <Link href="/kmtc" className="text-accent hover:underline">
                            KMTC
                        </Link>
                    </li>
                    <li>
                        <strong>C to C-:</strong>{" "}
                        <Link href="/diploma" className="text-accent hover:underline">
                            Diploma
                        </Link>
                        ,{" "}
                        <Link href="/certificate" className="text-accent hover:underline">
                            Certificate
                        </Link>
                    </li>
                    <li>
                        <strong>D+ and below:</strong>{" "}
                        <Link href="/certificate" className="text-accent hover:underline">
                            Certificate
                        </Link>{" "}
                        and{" "}
                        <Link href="/artisan" className="text-accent hover:underline">
                            Artisan
                        </Link>
                    </li>
                </ul>
                <p className="mt-2">The tool automatically filters courses based on your grade so you don't waste choices.</p>
            </>
        ),
    },
    {
        id: 6,
        question: "Can this tool help me choose the best course, not just any course?",
        answer: "Yes. After showing eligible courses, the AI assistant explains your options, strengths, and common mistakes students with similar grades make. This helps you make smarter decisions, not random ones.",
    },
    {
        id: 7,
        question: "Does this tool work for competitive courses like Medicine, Engineering, Nursing, or Teaching?",
        answer: "Yes. The checker includes competitive courses and shows whether you meet minimum requirements. However, final placement depends on competition, cutoff points, and applicant volume. The tool helps you avoid applying blindly.",
    },
    {
        id: 8,
        question: "Does the system show cutoff points?",
        answer: "Where available, the system displays previous cutoff points and explains how they affect selection. Cutoff points change yearly, so they are used for guidance, not guarantees.",
    },
    {
        id: 9,
        question: "Can I use this tool during KUCCPS revision periods?",
        answer: "Yes. The tool is designed specifically to help during first application, second revision, and subsequent revisions. Many students use it to adjust choices after being unplaced.",
    },
    {
        id: 10,
        question: "Does the tool show universities and colleges offering each course?",
        answer: "Yes. For each eligible course, the system shows institutions offering it, helping you compare options instead of guessing.",
    },
    {
        id: 11,
        question: "What if I already applied but I'm not sure I did it correctly?",
        answer: "You can still use the checker to review your eligibility and confirm whether your selected courses make sense. This is especially useful before revision windows close.",
    },
    {
        id: 12,
        question: "Do I need to create an account to use the tool?",
        answer: "No. You can use the course checker, cluster calculator, and guidance tools without creating an account. The system is designed for one-time use by many students, even on shared devices.",
    },
    {
        id: 13,
        question: "Is this tool officially owned by KUCCPS?",
        answer: (
            <>
                No. This is an independent student support platform designed to help you understand KUCCPS requirements and avoid mistakes. All final applications are done on the{" "}
                <Link href="/student-tools" className="text-accent hover:underline font-semibold">
                    official KUCCPS portal
                </Link>
                .
            </>
        ),
    },
    {
        id: 14,
        question: "Is my KCSE data safe?",
        answer: "Yes. Your grades are processed temporarily for eligibility checking and are not publicly shared. The system is designed to respect student privacy.",
    },
    {
        id: 15,
        question: "What if my school used different subject names or I repeated a subject?",
        answer: "KCSE subject variations and repeats are accounted for. The system follows standard KUCCPS subject groupings. If something looks unclear, the AI assistant explains it in simple terms.",
    },
    {
        id: 16,
        question: "Can I download or print my results?",
        answer: "Yes. You can download or export your results for reference when applying or revising your KUCCPS choices.",
    },
    {
        id: 17,
        question: "What if I paid and my results did not load?",
        answer: (
            <>
                In rare cases of network or session issues, the system allows recovery of your results. If a problem persists,{" "}
                <Link href="/contact" className="text-accent hover:underline font-semibold">
                    contact support
                </Link>{" "}
                for assistance.
            </>
        ),
    },
    {
        id: 18,
        question: "Can I use someone else's M-Pesa number to pay?",
        answer: "Yes. Payment can be made using any M-Pesa number as long as it is active and approved.",
    },
    {
        id: 19,
        question: "Will I get a refund if I make a mistake?",
        answer: (
            <>
                Because this is a digital service that processes results instantly, refunds are generally not available. However, genuine technical issues are handled case-by-case. Please{" "}
                <Link href="/contact" className="text-accent hover:underline font-semibold">
                    contact us
                </Link>{" "}
                if you experience any issues.
            </>
        ),
    },
    {
        id: 20,
        question: "Where do I apply after checking my courses?",
        answer: (
            <>
                After confirming your eligibility, you apply directly on the{" "}
                <Link href="/student-tools" className="text-accent hover:underline font-semibold">
                    official KUCCPS portal
                </Link>
                . This site also provides direct links to government portals including{" "}
                <Link href="/student-tools" className="text-accent hover:underline">
                    HELB
                </Link>{" "}
                and other{" "}
                <Link href="/student-tools" className="text-accent hover:underline">
                    student services
                </Link>{" "}
                to make the process easier.
            </>
        ),
    },
]

const relatedResources = [
    {
        title: "Cluster Points Calculator",
        description: "Calculate your KUCCPS cluster points and understand how they affect your course selection.",
        href: "/cluster-calculator",
        icon: Calculator,
    },
    {
        title: "Student Tools & Resources",
        description: "Access official KUCCPS, HELB, and KNEC portals. Find video tutorials and application guides.",
        href: "/student-tools",
        icon: BookOpen,
    },
    {
        title: "Contact Support",
        description: "Need help? Get personalized assistance with your KUCCPS application via WhatsApp or email.",
        href: "/contact",
        icon: Mail,
    },
]

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [openId, setOpenId] = useState<number | null>(null)

    const filteredFaqs = faqs.filter(
        (faq) =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (typeof faq.answer === "string" && faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const toggleFaq = (id: number) => {
        setOpenId(openId === id ? null : id)
    }

    return (
        <div className="min-h-screen w-full pt-24 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-light mb-4">
                        KUCCPS Course Checker – 2026 Student FAQ
                    </h1>
                    <p className="text-dim text-lg max-w-2xl mx-auto">
                        Get answers to common questions about checking KUCCPS courses, cluster points, and application requirements.
                    </p>
                </motion.div>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-8"
                >
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dim" />
                        <input
                            type="text"
                            placeholder="Search FAQs (e.g., cluster points, cutoff, payment)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-surface border border-dim/20 rounded-xl text-light placeholder:text-dim focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all"
                        />
                    </div>
                </motion.div>

                {/* FAQ Accordion */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="space-y-3 mb-16"
                >
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((faq, index) => (
                            <motion.div
                                key={faq.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.03 }}
                                className="bg-surface border border-dim/20 rounded-xl overflow-hidden hover:border-accent/30 transition-all"
                            >
                                <button
                                    onClick={() => toggleFaq(faq.id)}
                                    className="w-full flex items-center justify-between p-5 md:p-6 text-left group"
                                    aria-expanded={openId === faq.id}
                                >
                                    <span className="text-light font-semibold text-base md:text-lg pr-4 group-hover:text-accent transition-colors">
                                        {faq.question}
                                    </span>
                                    <ChevronDown
                                        className={`w-5 h-5 text-accent flex-shrink-0 transition-transform duration-300 ${openId === faq.id ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>
                                <AnimatePresence>
                                    {openId === faq.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                        >
                                            <div className="px-5 md:px-6 pb-5 md:pb-6 text-dim leading-relaxed border-t border-dim/10 pt-4">
                                                {typeof faq.answer === "string" ? <p>{faq.answer}</p> : faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-dim text-lg">No FAQs match your search. Try different keywords.</p>
                        </div>
                    )}
                </motion.div>

                {/* Related Resources Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <h2 className="text-2xl md:text-3xl font-bold text-light mb-6 text-center">Helpful Resources</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {relatedResources.map((resource, index) => {
                            const Icon = resource.icon
                            return (
                                <Link
                                    key={index}
                                    href={resource.href}
                                    className="group bg-surface border border-dim/20 rounded-xl p-6 hover:border-accent/50 hover:bg-accent/5 transition-all duration-300"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                                            <Icon className="w-6 h-6 text-accent" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-light font-semibold text-lg mb-2 group-hover:text-accent transition-colors flex items-center gap-2">
                                                {resource.title}
                                                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </h3>
                                            <p className="text-dim text-sm leading-relaxed">{resource.description}</p>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </motion.div>

                {/* Internal Linking Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-16 bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-2xl p-8 text-center"
                >
                    <h2 className="text-2xl font-bold text-light mb-4">Ready to Check Your Eligible Courses?</h2>
                    <p className="text-dim mb-6 max-w-2xl mx-auto">
                        Start by selecting your course category below and enter your KCSE grades to see which courses you qualify for.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link
                            href="/degree"
                            className="px-6 py-3 bg-accent text-dark font-semibold rounded-lg hover:bg-accent/90 transition-all shadow-lg hover:shadow-accent/50"
                        >
                            Degree Courses
                        </Link>
                        <Link
                            href="/diploma"
                            className="px-6 py-3 bg-surface border border-accent/30 text-light font-semibold rounded-lg hover:bg-accent/10 transition-all"
                        >
                            Diploma Courses
                        </Link>
                        <Link
                            href="/kmtc"
                            className="px-6 py-3 bg-surface border border-accent/30 text-light font-semibold rounded-lg hover:bg-accent/10 transition-all"
                        >
                            KMTC Courses
                        </Link>
                        <Link
                            href="/certificate"
                            className="px-6 py-3 bg-surface border border-accent/30 text-light font-semibold rounded-lg hover:bg-accent/10 transition-all"
                        >
                            Certificate Courses
                        </Link>
                        <Link
                            href="/artisan"
                            className="px-6 py-3 bg-surface border border-accent/30 text-light font-semibold rounded-lg hover:bg-accent/10 transition-all"
                        >
                            Artisan Courses
                        </Link>
                    </div>
                </motion.div>

                {/* About and Contact Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mt-12 text-center space-y-4"
                >
                    <p className="text-dim">
                        Want to learn more?{" "}
                        <Link href="/about" className="text-accent hover:underline font-semibold">
                            Read about our mission
                        </Link>{" "}
                        or{" "}
                        <Link href="/contact" className="text-accent hover:underline font-semibold">
                            get in touch with us
                        </Link>
                        .
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
