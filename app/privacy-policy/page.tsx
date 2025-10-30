"use client"

import { motion } from "framer-motion"
import { Shield, Lock, Database, Eye, UserCheck, Mail } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AnimatedBackground from "@/components/animated-background"

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: [
        "Full Name",
        "Email Address",
        "Phone Number",
        "KCSE Index Number",
        "Subject Grades and Cluster Data",
        "Payment Details (M-Pesa code, transaction ID, status)",
      ],
    },
    {
      icon: UserCheck,
      title: "How We Use Your Information",
      content: [
        "Generate personalized course eligibility results",
        "Deliver a downloadable PDF report",
        "Process and verify payments",
        "Improve our services and ensure system security",
      ],
    },
    {
      icon: Lock,
      title: "Data Storage and Security",
      content: [
        "All data is stored securely on Database, a GDPR-compliant backend platform",
        "We implement appropriate encryption, access control, and monitoring",
        "We do not sell, rent, or share your data with third parties",
      ],
    },
    {
      icon: Eye,
      title: "Cookies and Tracking",
      content: [
        "We may use cookies and analytics tools to improve user experience",
        "These tools do not access your private data",
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
            <div className="mb-6 inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Privacy Policy
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              At KUCCPS Course Checker, we are committed to protecting your personal information and your right to
              privacy.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <p className="text-muted-foreground leading-relaxed">
                  At KUCCPS Course Checker, accessible from <strong>https://kuccpscoursechecker.co.ke</strong>, we are
                  committed to protecting your personal information and your right to privacy. This Privacy Policy
                  explains how we collect, use, store, and protect your information when you use our platform.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid gap-8">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-3">
                        <section.icon className="h-5 w-5 text-white" />
                      </div>
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <div className="h-2 w-2 rounded-full bg-purple-500 mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
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
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Mail className="h-6 w-6 mr-3 text-purple-600" />
                  Your Rights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">You have the right to:</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-purple-500 mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Request deletion of your personal data</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-purple-500 mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Correct inaccuracies in your data</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-purple-500 mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Withdraw consent to use your data</span>
                  </li>
                </ul>
                <p className="text-muted-foreground">
                  To exercise your rights, contact us at <strong>kuccpscoursechecker1@gmail.com</strong>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  )
}
