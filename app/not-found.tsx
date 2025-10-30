"use client"
import { motion } from "framer-motion"
import { Home, Search, Mail, BookOpen, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import AnimatedBackground from "@/components/animated-background"
import Link from "next/link"

export default function NotFound() {
  return (
    <>
      <AnimatedBackground />

      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            {/* Large 404 */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                404
              </h1>
            </motion.div>

            {/* Main Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-8"
            >
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">This Page Doesn't Exist</h2>
                  <p className="text-xl text-muted-foreground mb-6">
                    But it <em>almost</em> did.
                  </p>

                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 mb-6">
                    <p className="text-lg">
                      You've wandered off the syllabus. The page you're looking for has either graduated or never
                      enrolled.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mb-8"
            >
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-6">Here's what you can do instead:</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/">
                      <Button
                        variant="outline"
                        className="w-full h-auto p-4 bg-white/5 border-white/20 hover:bg-white/10 text-left flex flex-col items-start space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <Search className="h-5 w-5 text-purple-600" />
                          <span className="font-medium">Check Course Eligibility</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Find out what courses you qualify for</span>
                      </Button>
                    </Link>

                    <Link href="/input/degree">
                      <Button
                        variant="outline"
                        className="w-full h-auto p-4 bg-white/5 border-white/20 hover:bg-white/10 text-left flex flex-col items-start space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">Input KCSE Grades</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Enter your grades to get started</span>
                      </Button>
                    </Link>

                    <Link href="/">
                      <Button
                        variant="outline"
                        className="w-full h-auto p-4 bg-white/5 border-white/20 hover:bg-white/10 text-left flex flex-col items-start space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <Home className="h-5 w-5 text-green-600" />
                          <span className="font-medium">Go to Homepage</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Start from the beginning</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quote */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200/20 shadow-xl rounded-2xl">
                <CardContent className="p-6">
                  <blockquote className="text-lg italic text-center">
                    "Not all those who wander are lost — but this page is."
                  </blockquote>
                </CardContent>
              </Card>
            </motion.div>

            {/* Support Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl rounded-2xl">
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-4">If this keeps happening, let us know:</p>
                  <Button
                    onClick={() => window.open("mailto:kuccpscoursechecker1@gmail.com", "_blank")}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    kuccpscoursechecker1@gmail.com
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="mt-8"
            >
              <Button
                onClick={() => window.history.back()}
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
