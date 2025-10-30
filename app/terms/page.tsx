"use client"

import { motion } from "framer-motion"
import { FileText, Users, CreditCard, Shield, AlertTriangle, Gavel } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AnimatedBackground from "@/components/animated-background"

export default function TermsPage() {
  const sections = [
    {
      icon: Users,
      title: "Eligibility",
      content:
        "You must be at least 13 years old and capable of entering into a binding agreement to use this service.",
    },
    {
      icon: FileText,
      title: "Service Description",
      content:
        "We offer a digital platform that helps students determine which university, diploma, certificate, KMTC, or artisan courses they qualify for based on KCSE subject grades and historical cutoff points.",
    },
    {
      icon: Shield,
      title: "User Responsibilities",
      content: [
        "Provide accurate KCSE subject data",
        "Use your own M-Pesa number for payment",
        "Avoid sharing or reusing other people's M-Pesa codes",
        "Any attempt to falsify data, manipulate results, or bypass payment systems is strictly prohibited",
      ],
    },
    {
      icon: CreditCard,
      title: "Payments",
      content:
        "A one-time payment (KES 200) is required to access full results and downloadable PDF reports. Payments are processed via Pesaflux and verified in real time.",
    },
    {
      icon: AlertTriangle,
      title: "Limitation of Liability",
      content: [
        "We do not guarantee admission into any course or institution",
        "Our results are based on available historical data from KUCCPS and are for informational purposes only",
        "We are not liable for inaccurate input data from users, M-Pesa delays or third-party gateway issues, or misuse of information by users",
      ],
    },
  ]

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
            <div className="mb-6 inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-green-500 text-white">
              <Gavel className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Terms of Service
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              By using KUCCPS Course Checker, you agree to the following terms and conditions.
            </p>
          </motion.div>

          <div className="grid gap-8">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              >
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center mr-3">
                        <section.icon className="h-5 w-5 text-white" />
                      </div>
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Array.isArray(section.content) ? (
                      <ul className="space-y-2">
                        {section.content.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start">
                            <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></div>
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12"
          >
            <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-red-700 dark:text-red-400">
                  <AlertTriangle className="h-6 w-6 mr-3" />
                  Refund Policy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Due to the digital and personalized nature of the service, we do not offer refunds. If you experience
                  issues, contact us for support at <strong>kuccpscoursechecker1@gmail.com</strong>.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mt-8"
          >
            <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <p className="text-muted-foreground text-center">
                  We may update these Terms at any time. Continued use of the platform after changes means you agree to
                  the new terms.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  )
}
