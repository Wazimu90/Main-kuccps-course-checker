"use client"
import { motion } from "framer-motion"
import { Users, Lightbulb, Mail, ExternalLink, CheckCircle, Heart, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AnimatedBackground from "@/components/animated-background"
import Link from "next/link"

export default function AboutPage() {
  return (
    <>
      <AnimatedBackground />

      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                About Us
              </span>
            </h1>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-12">
            {/* Main Introduction */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl rounded-2xl">
                <CardContent className="p-8">
                  <p className="text-lg text-muted-foreground mb-6">
                    We are not KUCCPS. But we exist because KUCCPS exists — and because too many students are left
                    guessing their futures.
                  </p>

                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 mb-6">
                    <blockquote className="text-xl font-medium text-center italic">
                      "I have my KCSE results. Now what exactly do I qualify for?"
                    </blockquote>
                  </div>

                  <p className="text-muted-foreground mb-4">
                    Built by Kenyan educators, developers (
                    <Link
                      href="https://www.dynadot.com"
                      target="_blank"
                      className="text-purple-600 hover:text-purple-700 underline inline-flex items-center gap-1"
                    >
                      Tricre8 <ExternalLink className="h-3 w-3" />
                    </Link>
                    ), and data engineers, this platform simplifies the complex — no jargon, no confusion.
                  </p>

                  <p className="text-lg font-semibold">Just results. Verified against real cutoffs. Instant. Honest.</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Mission Statement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200/20 shadow-2xl rounded-2xl">
                <CardContent className="p-8 text-center">
                  <Heart className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">
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
              <h2 className="text-3xl font-bold text-center mb-8">
                <Lightbulb className="inline-block h-8 w-8 mr-2 text-yellow-500" />
                What We Offer
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-2">Real-time Course Eligibility</h3>
                        <p className="text-muted-foreground text-sm">
                          Instant checks based on your KCSE grades with verified accuracy.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-2">Verified Data</h3>
                        <p className="text-muted-foreground text-sm">
                          Information extracted from KUCCPS and MOE records for reliability.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-2">Smart Calculator</h3>
                        <p className="text-muted-foreground text-sm">
                          Cluster point calculator and comprehensive result summaries.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-2">Instant Support</h3>
                        <p className="text-muted-foreground text-sm">
                          PDF downloads, chatbot assistance, and immediate feedback.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Independence Statement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Card className="bg-gradient-to-br from-blue-500/10 to-teal-500/10 border-blue-200/20 shadow-2xl rounded-2xl">
                <CardContent className="p-8 text-center">
                  <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground mb-4">
                    We are proudly independent — no fake promises, no upselling, no bias.
                  </p>
                  <p className="text-xl font-semibold">Your future is yours. We just make it clearer.</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Impact Statement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="text-center"
            >
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl rounded-2xl">
                <CardContent className="p-8">
                  <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <blockquote className="text-2xl font-bold text-center">
                    "Thousands of students, one mission: clarity."
                  </blockquote>
                </CardContent>
              </Card>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="text-center"
            >
              <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200/20 shadow-2xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Want to build with us, partner, or contribute?</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => window.open("mailto:kuccpscoursechecker1@gmail.com", "_blank")}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 group"
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    Email us directly
                  </Button>
                  <p className="text-sm text-muted-foreground mt-4">kuccpscoursechecker1@gmail.com</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
