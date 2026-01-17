"use client"

import { motion } from "framer-motion"
import {
  Users,
  Lightbulb,
  Mail,
  ExternalLink,
  CheckCircle,
  Heart,
  Zap,
  Target,
  Award,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function AboutPage() {
  const features = [
    {
      icon: <CheckCircle className="w-6 h-6 text-accent" />,
      title: "Real-time Course Eligibility",
      description: "Instant checks based on your KCSE grades with verified accuracy against official KUCCPS data.",
    },
    {
      icon: <Shield className="w-6 h-6 text-accent" />,
      title: "Verified Data",
      description: "Information extracted from KUCCPS and Ministry of Education records for reliability.",
    },
    {
      icon: <Target className="w-6 h-6 text-accent" />,
      title: "Smart Cluster Calculator",
      description:
        "AI-powered cluster point calculator with comprehensive result summaries and explanations.",
    },
    {
      icon: <Award className="w-6 h-6 text-accent" />,
      title: "Instant Support",
      description: "PDF downloads, AI chatbot assistance, and immediate feedback to guide your choices.",
    },
  ]

  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <Users className="w-8 h-8 md:w-10 md:h-10 text-accent" />
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 text-light">About Us</h1>
          <p className="text-base md:text-lg text-dim max-w-2xl mx-auto">
            Helping Kenyan students make informed KUCCPS course choices with confidence and clarity.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">
          {/* Main Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-surface border-white/10">
              <CardContent className="p-6 md:p-8 space-y-6">
                <p className="text-base md:text-lg text-light leading-relaxed">
                  We are not KUCCPS. But we exist because KUCCPS exists — and because too many students are left
                  guessing their futures. We help those who ask themselves:
                </p>

                <div className="bg-accent/5 border-l-4 border-accent rounded-lg p-4 md:p-6">
                  <blockquote className="text-lg md:text-xl font-medium text-light italic">
                    "I have my KCSE results. Now what exactly do I qualify for?"
                  </blockquote>
                </div>

                <p className="text-sm md:text-base text-dim leading-relaxed">
                  Built by Kenyan educators, developers (
                  <Link
                    href="https://wa.me/+254790295408"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:text-accent/80 underline inline-flex items-center gap-1 font-semibold"
                  >
                    Tricre8
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                  ), and data engineers, this platform simplifies the complex — no jargon, no confusion.
                </p>

                <div className="pt-4 border-t border-white/10">
                  <p className="text-base md:text-lg font-semibold text-light text-center">
                    Just results. Verified against real cutoffs. Instant. Honest.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Mission Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-6 md:p-8 text-center">
                <Heart className="w-12 h-12 md:w-14 md:h-14 text-accent mx-auto mb-4" />
                <h2 className="text-xl md:text-2xl font-bold text-light mb-4">Our Mission</h2>
                <p className="text-base md:text-lg text-dim leading-relaxed max-w-3xl mx-auto">
                  We believe that the choice of a course should never be based on guesswork, peer pressure, or panic.
                  It should be informed. And now, it can be.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* What We Offer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center gap-2 mb-4">
                <Lightbulb className="w-6 h-6 md:w-8 md:h-8 text-accent" />
                <h2 className="text-2xl md:text-3xl font-bold text-light">What We Offer</h2>
              </div>
              <p className="text-sm md:text-base text-dim max-w-2xl mx-auto">
                Comprehensive tools and verified data to help you make the right course choices
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                >
                  <Card className="bg-surface border-white/10 hover:border-accent/30 transition-all duration-300 h-full">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                          {feature.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-light mb-2 text-base md:text-lg">{feature.title}</h3>
                          <p className="text-sm text-dim leading-relaxed">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Independence Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-6 md:p-8 text-center">
                <Zap className="w-12 h-12 md:w-14 md:h-14 text-accent mx-auto mb-4" />
                <p className="text-base md:text-lg text-dim mb-4 leading-relaxed">
                  We are proudly independent — no fake promises, no upselling, no bias.
                </p>
                <p className="text-xl md:text-2xl font-bold text-light">
                  Your future is yours. We just make it clearer.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Impact Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <Card className="bg-surface border-white/10">
              <CardContent className="p-6 md:p-8 text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 md:w-10 md:h-10 text-accent" />
                </div>
                <blockquote className="text-xl md:text-3xl font-bold text-light">
                  "Thousands of students, one mission: clarity."
                </blockquote>
                <p className="text-sm md:text-base text-dim mt-4">
                  Join thousands of Kenyan students who have successfully used our platform to find their perfect
                  course
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Related Links - SEO Internal Linking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="pt-8 border-t border-white/10"
          >
            <h3 className="text-xl md:text-2xl font-bold text-light mb-6 text-center">Explore Our Tools</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/cluster-calculator"
                className="p-4 bg-surface border border-white/10 rounded-xl hover:border-accent/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all group"
              >
                <h4 className="font-semibold text-light mb-2 group-hover:text-accent transition-colors">
                  Cluster Calculator
                </h4>
                <p className="text-sm text-dim">Calculate your KUCCPS cluster points instantly</p>
              </Link>

              <Link
                href="/student-tools"
                className="p-4 bg-surface border border-white/10 rounded-xl hover:border-accent/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all group"
              >
                <h4 className="font-semibold text-light mb-2 group-hover:text-accent transition-colors">
                  Student Tools
                </h4>
                <p className="text-sm text-dim">Access KUCCPS, HELB, and official portals</p>
              </Link>

              <Link
                href="/faq"
                className="p-4 bg-surface border border-white/10 rounded-xl hover:border-accent/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all group"
              >
                <h4 className="font-semibold text-light mb-2 group-hover:text-accent transition-colors">FAQs</h4>
                <p className="text-sm text-dim">Get answers to common questions</p>
              </Link>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
          >
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-6 md:p-8 text-center">
                <Mail className="w-12 h-12 md:w-14 md:h-14 text-accent mx-auto mb-4" />
                <h3 className="text-xl md:text-2xl font-bold text-light mb-3">
                  Want to build with us, partner, or contribute?
                </h3>
                <p className="text-sm md:text-base text-dim mb-6 max-w-2xl mx-auto">
                  We're always looking for passionate individuals and organizations who share our mission to help
                  Kenyan students.
                </p>
                <Button
                  onClick={() => window.open("mailto:kuccpscoursechecker1@gmail.com", "_blank")}
                  className="bg-accent hover:bg-accent/90 text-dark font-semibold py-3 px-6 md:px-8 rounded-lg transition-all duration-300"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Email us directly
                </Button>
                <p className="text-xs md:text-sm text-dim mt-4">kuccpscoursechecker1@gmail.com</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
