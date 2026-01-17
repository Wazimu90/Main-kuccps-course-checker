"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HelpCircle, ChevronDown, ChevronUp, Search, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [openItems, setOpenItems] = useState<number[]>([])

  const faqs = [
    {
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
      question: "How do I know which KUCCPS courses I qualify for with my KCSE grades?",
      answer: (
        <>
          You need to compare your KCSE grades with official KUCCPS requirements such as mean grade, subject combinations, and cluster points. Our KUCCPS Course Checker does this automatically and shows eligible{" "}
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
          ,{" "}
          <Link href="/certificate" className="text-accent hover:underline">
            Certificate
          </Link>
          , and{" "}
          <Link href="/artisan" className="text-accent hover:underline">
            Artisan
          </Link>{" "}
          courses instantly.
        </>
      ),
    },
    {
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
      question: "What courses can I apply for if I got C+, C, C-, or D+?",
      answer: (
        <>
          <p className="mb-3">Your KCSE mean grade determines the category of courses you can apply for:</p>
          <ul className="list-disc pl-5 space-y-2 mb-3">
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
          <p>The tool automatically filters courses based on your grade so you don't waste choices.</p>
        </>
      ),
    },
    {
      question: "Can this tool help me choose the best course, not just any course?",
      answer:
        "Yes. After showing eligible courses, the AI assistant explains your options, strengths, and common mistakes students with similar grades make. This helps you make smarter decisions, not random ones.",
    },
    {
      question: "Does this tool work for competitive courses like Medicine, Engineering, Nursing, or Teaching?",
      answer:
        "Yes. The checker includes competitive courses and shows whether you meet minimum requirements. However, final placement depends on competition, cutoff points, and applicant volume. The tool helps you avoid applying blindly.",
    },
    {
      question: "Does the system show cutoff points?",
      answer:
        "Where available, the system displays previous cutoff points and explains how they affect selection. Cutoff points change yearly, so they are used for guidance, not guarantees.",
    },
    {
      question: "Can I use this tool during KUCCPS revision periods?",
      answer:
        "Yes. The tool is designed specifically to help during first application, second revision, and subsequent revisions. Many students use it to adjust choices after being unplaced.",
    },
    {
      question: "Does the tool show universities and colleges offering each course?",
      answer:
        "Yes. For each eligible course, the system shows institutions offering it, helping you compare options instead of guessing.",
    },
    {
      question: "What if I already applied but I'm not sure I did it correctly?",
      answer:
        "You can still use the checker to review your eligibility and confirm whether your selected courses make sense. This is especially useful before revision windows close.",
    },
    {
      question: "Do I need to create an account to use the tool?",
      answer:
        "No. You can use the course checker, cluster calculator, and guidance tools without creating an account. The system is designed for one-time use by many students, even on shared devices.",
    },
    {
      question: "Is this tool officially owned by KUCCPS?",
      answer: (
        <>
          No. This is an independent student support platform designed to help you understand KUCCPS requirements and avoid mistakes. All final applications are done on the{" "}
          <a
            href="https://students.kuccps.net"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline font-semibold inline-flex items-center gap-1"
          >
            official KUCCPS portal
            <ExternalLink className="w-3 h-3" />
          </a>
          .
        </>
      ),
    },
    {
      question: "Is my KCSE data safe?",
      answer:
        "Yes. Your grades are processed temporarily for eligibility checking and are not publicly shared. The system is designed to respect student privacy.",
    },
    {
      question: "What if my school used different subject names or I repeated a subject?",
      answer:
        "KCSE subject variations and repeats are accounted for. The system follows standard KUCCPS subject groupings. If something looks unclear, the AI assistant explains it in simple terms.",
    },
    {
      question: "Can I download or print my results?",
      answer:
        "Yes. You can download or export your results for reference when applying or revising your KUCCPS choices.",
    },
    {
      question: "What if I paid and my results did not load?",
      answer:
        "In rare cases of network or session issues, the system allows recovery of your results. If a problem persists, support assistance is available.",
    },
    {
      question: "Can I use someone else's M-Pesa number to pay?",
      answer:
        "Yes. Payment can be made using any M-Pesa number as long as it is active and approved.",
    },
    {
      question: "Will I get a refund if I make a mistake?",
      answer:
        "Because this is a digital service that processes results instantly, refunds are generally not available. However, genuine technical issues are handled case-by-case.",
    },
    {
      question: "Where do I apply after checking my courses?",
      answer: (
        <>
          After confirming your eligibility, you apply directly on the{" "}
          <a
            href="https://students.kuccps.net"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline font-semibold inline-flex items-center gap-1"
          >
            official KUCCPS portal
            <ExternalLink className="w-3 h-3" />
          </a>
          . This site also provides direct links to government portals on our{" "}
          <Link href="/student-tools" className="text-accent hover:underline font-semibold">
            Student Tools page
          </Link>
          {" "}to make the process easier.
        </>
      ),
    },
  ]

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof faq.answer === "string" && faq.answer.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const toggleItem = (index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]))
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="mb-6 inline-flex items-center justify-center h-16 w-16 rounded-full bg-accent/10 border border-accent/20">
            <HelpCircle className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 text-light">
            KUCCPS Course Checker – 2026 Student FAQ
          </h1>
          <p className="text-base md:text-lg text-dim max-w-2xl mx-auto">
            Get answers to common questions about KUCCPS course checking, cluster points, eligibility, and applications.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dim" />
            <Input
              type="text"
              placeholder="Search FAQs (e.g., cluster points, eligibility, payment)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-6 text-base md:text-lg bg-surface border-white/10 focus:border-accent/40"
            />
          </div>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {filteredFAQs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.03 }}
            >
              <Card className="bg-surface border-white/10 hover:border-accent/30 transition-all duration-300">
                <CardHeader className="cursor-pointer p-4 md:p-6" onClick={() => toggleItem(index)}>
                  <CardTitle className="flex items-start justify-between text-base md:text-lg gap-4">
                    <span className="text-light leading-relaxed">{faq.question}</span>
                    <div className="flex-shrink-0 mt-1">
                      {openItems.includes(index) ? (
                        <ChevronUp className="h-5 w-5 text-accent" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-dim" />
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <AnimatePresence>
                  {openItems.includes(index) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="pt-0 px-4 md:px-6 pb-4 md:pb-6">
                        <div className="text-dim leading-relaxed text-sm md:text-base">{faq.answer}</div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredFAQs.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <p className="text-dim text-lg">No FAQs found matching "{searchTerm}". Try a different search term.</p>
          </motion.div>
        )}

        {/* Related Links Section - SEO Internal Linking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 pt-8 border-t border-white/10"
        >
          <h2 className="text-2xl font-bold text-light mb-6 text-center">Helpful Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/cluster-calculator"
              className="p-4 bg-surface border border-white/10 rounded-xl hover:border-accent/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all group"
            >
              <h3 className="font-bold text-light mb-2 group-hover:text-accent transition-colors">
                Calculate Cluster Points
              </h3>
              <p className="text-sm text-dim">Estimate your cluster weights for all 20 KUCCPS categories</p>
            </Link>

            <Link
              href="/student-tools"
              className="p-4 bg-surface border border-white/10 rounded-xl hover:border-accent/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all group"
            >
              <h3 className="font-bold text-light mb-2 group-hover:text-accent transition-colors">
                Student Portals & Tools
              </h3>
              <p className="text-sm text-dim">Access KUCCPS, HELB, and other official government portals</p>
            </Link>

            <Link
              href="/degree"
              className="p-4 bg-surface border border-white/10 rounded-xl hover:border-accent/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all group"
            >
              <h3 className="font-bold text-light mb-2 group-hover:text-accent transition-colors">
                Check Degree Courses
              </h3>
              <p className="text-sm text-dim">Find degree programs you qualify for with your KCSE grades</p>
            </Link>

            <Link
              href="/news"
              className="p-4 bg-surface border border-white/10 rounded-xl hover:border-accent/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all group"
            >
              <h3 className="font-bold text-light mb-2 group-hover:text-accent transition-colors">
                Latest KUCCPS News
              </h3>
              <p className="text-sm text-dim">Stay updated with KUCCPS announcements and education news</p>
            </Link>
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-12"
        >
          <Card className="bg-surface/80 backdrop-blur-xl border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.25)] rounded-2xl">
            <CardContent className="p-6 md:p-8 text-center">
              <h3 className="text-xl md:text-2xl font-bold mb-3 text-light">Still have questions?</h3>
              <p className="text-dim mb-6 text-sm md:text-base">
                Can't find what you're looking for? Contact our support team and we'll get back to you within 24 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="mailto:kuccpscoursechecker1@gmail.com"
                  className="inline-flex items-center justify-center px-6 py-3 bg-accent text-dark font-semibold rounded-lg hover:bg-accent/90 transition-all duration-300 text-sm md:text-base"
                >
                  Send Email
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 border border-dim text-light rounded-lg hover:bg-surface transition-all duration-300 text-sm md:text-base"
                >
                  Contact Us
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
