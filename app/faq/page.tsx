"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HelpCircle, ChevronDown, ChevronUp, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
 

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [openItems, setOpenItems] = useState<number[]>([])

  const faqs = [
    {
      question: "What is KUCCPS Course Checker and what does it do?",
      answer:
        "KUCCPS Course Checker is a smart tool that instantly shows you all the university, diploma, certificate, KMTC and Artisan courses you qualify for using your KCSE grades, cluster points, and official cutoff points. It removes guesswork and gives you accurate results based on real KUCCPS data.",
    },
    {
      question: "How does KUCCPS Course Checker calculate course eligibility?",
      answer:
        "You simply enter your KCSE grades and cluster points, then we compare your points with the latest cutoffs and generate all courses you qualify for. You also get institution options and course codes.",
    },
    {
      question: "Are the results accurate and updated?",
      answer:
        "Yes. The platform uses verified KUCCPS cutoff points, KUCCPS cluster formulas, and official course requirements from the latest publicly available data. The calculations match what KUCCPS uses during placement.",
    },
    {
      question: "Which courses can I check with this tool?",
      answer:
        "You can check Degree, Diploma, Certificate, Artisan, and KMTC programs across all public and selected private institutions. The tool supports 1000+ programs including Medicine, Nursing, Engineering, Teaching, ICT, Business, Hospitality, and more.",
    },
    {
      question: "Does the tool show cluster points and cutoff points?",
      answer:
        "Yes. Your results include your cluster points, each course’s previous cutoff points, and how your score compares. This helps you understand your chances before applying.",
    },
    {
      question: "How much does it cost to use KUCCPS Course Checker?",
      answer:
        "Access to the full results, course codes, institutions, and downloadable PDF costs KES 200, payable through M-Pesa.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "Payments are processed securely via Pesaflux, which supports all Safaricom M-Pesa lines.",
    },
    {
      question: "Do I need to create an account to use the tool?",
      answer:
        "No account is required. Just enter your grades, pay via M-Pesa, and instantly access your personalized results.",
    },
    {
      question: "Can I use someone’s M-Pesa number to pay?",
      answer:
        "Yes, you can pay with any M-Pesa line, but the code can only be used once. Once redeemed, it is tied to your results.",
    },
    {
      question: "What if I paid but my results didn’t load?",
      answer:
        "If your results don’t appear immediately, wait a few minutes and confirm you received the M-Pesa confirmation SMS. If the issue continues, contact support via WhatsApp or email for instant assistance.",
    },
    {
      question: "Will I get a refund if I made a mistake?",
      answer:
        "Refunds are not available because each result is generated instantly and customized. However, if there is a technical problem, support will fix it for you.",
    },
    {
      question: "Is KUCCPS Course Checker officially owned by KUCCPS?",
      answer:
        "No. This is an independent platform created by Kenyan developers to help students understand their course options using publicly accessible KUCCPS data. It is not affiliated with the KUCCPS organization.",
    },
    {
      question: "Can this tool help me know the best course for my cluster points?",
      answer:
        "Yes. After generating your results, you can filter by your strongest cluster points and see the best courses matched to your performance.",
    },
    {
      question: "Does this system work for all KCSE grades?",
      answer:
        "The tool works for all grades from A to E, including Degree, Diploma, Certificate, Artisan, and KMTC pathways.",
    },
    {
      question: "Can I check courses for Medicine, Engineering, Nursing, or Teaching?",
      answer:
        "Yes. The tool includes full requirements and cutoff points for competitive programs like Medicine and Surgery, Nursing, Pharmacy, Engineering, Law, and Education.",
    },
    {
      question: "Can I use the tool during KUCCPS revision periods?",
      answer:
        "Yes. Most students use it during the first and second revision to avoid applying for courses they don’t qualify for. It helps you pick safe, realistic choices.",
    },
    {
      question: "Does the tool show universities offering each course?",
      answer:
        "Every eligible course comes with a list of institutions, campus options, course codes, and cutoff comparisons.",
    },
    {
      question: "Is my data safe?",
      answer:
        "Yes. Your KCSE grades and payment details are never stored or shared. Payments are handled by Pesaflux, and all results are processed securely.",
    },
    {
      question: "What if my school used different grade names or I repeated a subject?",
      answer:
        "The tool supports all KCSE grading formats and subject combinations. Just enter the grades as they appear on your results slip.",
    },
    {
      question: "Can I download or print my results?",
      answer:
        "Yes. After payment, you can download a clean, organized PDF report showing all your courses, cluster points, and institutions.",
    },
  ]

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const toggleItem = (index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]))
  }

  return (
    <>
      

      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="mb-6 inline-flex items-center justify-center h-16 w-16 rounded-full bg-accent text-dark">
              <HelpCircle className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-white">Frequently Asked Questions</span>
            </h1>
            <p className="text-lg text-white">
              Find answers to common questions about our course checker platform.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white" />
              <Input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-3 text-lg"
              />
            </div>
          </motion.div>

          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.05 }}
              >
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="cursor-pointer" onClick={() => toggleItem(index)}>
                    <CardTitle className="flex items-center justify-between text-lg">
                      <span>{faq.question}</span>
                      {openItems.includes(index) ? (
                        <ChevronUp className="h-5 w-5 text-white" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-white" />
                      )}
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
                        <CardContent className="pt-0">
                          <p className="text-white leading-relaxed">{faq.answer}</p>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <p className="text-white text-lg">No FAQs found matching your search.</p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16"
          >
            <Card className="bg-surface/80 backdrop-blur-xl border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.25)] rounded-2xl">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold mb-4">Still have questions?</h3>
                <p className="text-white mb-6">
                  Can't find what you're looking for? Contact our support team and we'll get back to you within 24
                  hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="mailto:kuccpscoursechecker1@gmail.com"
                    className="premium-btn inline-flex items-center justify-center px-6 py-3"
                  >
                    Send Email
                  </a>
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center px-6 py-3 border border-dim text-accent rounded-lg hover:bg-surface transition-all duration-300"
                  >
                    Contact Form
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  )
}
