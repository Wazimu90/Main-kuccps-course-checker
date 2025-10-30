"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HelpCircle, ChevronDown, ChevronUp, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import AnimatedBackground from "@/components/animated-background"

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [openItems, setOpenItems] = useState<number[]>([])

  const faqs = [
    {
      question: "What is KUCCPS Course Checker?",
      answer:
        "KUCCPS Course Checker is a platform that helps you find out which courses you qualify for based on your KCSE subject grades and official cluster points.",
    },
    {
      question: "How does it work?",
      answer:
        "You enter your KCSE subject grades, the system calculates your cluster points, compares your scores with KUCCPS cutoff points, and you get a list of courses, institutions, and a downloadable PDF.",
    },
    {
      question: "How much does it cost?",
      answer:
        "KES 200 (payable via M-Pesa) gives you access to all qualifying courses, institution info and course codes, and a downloadable PDF.",
    },
    {
      question: "What payment methods are accepted?",
      answer: "We use Pesaflux, which supports M-Pesa payments from any Safaricom line.",
    },
    {
      question: "Is the data accurate?",
      answer:
        "Yes. We use official data from KUCCPS PDFs and publicly available cutoff records from 2023. Our system ensures accurate calculation of cluster points and eligibility.",
    },
    {
      question: "Do I need to register or create an account?",
      answer: "No registration is required. You simply enter your data, pay, and receive your results.",
    },
    {
      question: "Can I use someone else's M-Pesa code?",
      answer:
        "No. Each M-Pesa code is valid once and linked to your details. Sharing or reusing codes is a violation and will be blocked.",
    },
    {
      question: "What if my payment fails?",
      answer:
        "If you paid but didn't receive your results: Wait a few minutes, check your payment SMS, or contact our support via email or WhatsApp.",
    },
    {
      question: "Can I get a refund?",
      answer:
        "No. Because the results are customized and delivered instantly, we do not offer refunds. But we will assist you with any technical issues.",
    },
    {
      question: "Who owns this platform?",
      answer:
        "This is an independent project created by Kenyan developers and education researchers. We are not affiliated with KUCCPS but use publicly available data to assist students.",
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
      <AnimatedBackground />

      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="mb-6 inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white">
              <HelpCircle className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
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
                          <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
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
              <p className="text-muted-foreground text-lg">No FAQs found matching your search.</p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16"
          >
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold mb-4">Still have questions?</h3>
                <p className="text-muted-foreground mb-6">
                  Can't find what you're looking for? Contact our support team and we'll get back to you within 24
                  hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="mailto:kuccpscoursechecker1@gmail.com"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                  >
                    Send Email
                  </a>
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
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
