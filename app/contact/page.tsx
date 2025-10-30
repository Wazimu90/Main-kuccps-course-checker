"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Phone, Mail, MessageCircle, Clock, Send, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function ContactPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setIsSubmitted(true)

    toast({
      title: "Message Sent!",
      description: "We'll get back to you within minutes.",
    })

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: "", email: "", subject: "", message: "" })
    }, 3000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us directly for immediate assistance",
      action: () => window.open("tel:+254748776354"),
      gradient: "from-purple-500 to-purple-600",
      hoverGradient: "hover:from-purple-600 hover:to-purple-700",
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us an email and we'll respond quickly",
      action: () => window.open("mailto:kuccpscoursechecker1@gmail.com"),
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "hover:from-blue-600 hover:to-blue-700",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Chat",
      description: "Chat with us on WhatsApp for quick help",
      action: () => window.open("https://wa.me/254748776354"),
      gradient: "from-green-500 to-green-600",
      hoverGradient: "hover:from-green-600 hover:to-green-700",
    },
    {
      icon: Clock,
      title: "Response Time",
      description: "We typically respond within 5 - 30 minutes",
      action: () => {},
      gradient: "from-orange-500 to-orange-600",
      hoverGradient: "hover:from-orange-600 hover:to-orange-700",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#7e22ce] to-[#f472b6] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl animate-bounce"></div>
      </div>

      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-white/20 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 4 + i,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Get in{" "}
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Touch</span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Have questions about your course eligibility? Need help with our platform? We're here to help you succeed.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-white mb-8">Contact Information</h2>

            <div className="grid gap-6">
              {contactMethods.map((method, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="bg-white/10 backdrop-blur-xl shadow-xl rounded-xl border border-white/20 hover:shadow-2xl hover:border-cyan-400/50 transition-all duration-300 cursor-pointer group"
                    onClick={method.action}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-r ${method.gradient} ${method.hoverGradient} transition-all duration-300 group-hover:scale-110`}
                        >
                          <method.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-lg">{method.title}</h3>
                          <p className="text-white/70 text-sm">{method.description}</p>
                          {method.title === "Phone Support" && (
                            <p className="text-white/60 text-xs mt-1">Tap to call:</p>
                          )}
                          {method.title === "Email Support" && (
                            <p className="text-white/60 text-xs mt-1">Tap to email: </p>
                          )}
                          {method.title === "WhatsApp Chat" && (
                            <p className="text-white/60 text-xs mt-1">Tap to chat:</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="bg-white/10 backdrop-blur-xl shadow-xl rounded-xl border border-white/20">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white/90">
                        Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/60 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 h-12"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white/90">
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/60 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 h-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-white/90">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="What's this about?"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/60 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-white/90">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us how we can help you..."
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/60 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 min-h-[120px] resize-none"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || isSubmitted}
                    className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending Message...
                      </>
                    ) : isSubmitted ? (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Message Sent!
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Diagonal Divider */}
        <div className="absolute left-0 top-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-y-1"></div>
      </div>
    </div>
  )
}
