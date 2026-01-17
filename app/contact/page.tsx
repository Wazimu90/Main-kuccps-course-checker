"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
    Phone,
    Mail,
    MessageCircle,
    MapPin,
    Send,
    CheckCircle,
    Clock,
    HeadphonesIcon,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function ContactPage() {
    const { toast } = useToast()
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate form submission
        setTimeout(() => {
            toast({
                title: "Message Sent!",
                description: "We'll get back to you within 24 hours.",
            })
            setIsSubmitting(false)
            setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
        }, 1500)
    }

    const contactMethods = [
        {
            icon: <Phone className="w-6 h-6 text-accent" />,
            title: "Call Us",
            value: "0713 111 921",
            link: "tel:+254713111921",
            description: "Monday - Friday, 8AM - 6PM EAT",
        },
        {
            icon: <MessageCircle className="w-6 h-6 text-accent" />,
            title: "WhatsApp",
            value: "0790 295 408",
            link: "https://wa.me/254790295408",
            description: "24/7 Quick Response",
        },
        {
            icon: <Mail className="w-6 h-6 text-accent" />,
            title: "Email Us",
            value: "kuccpscoursechecker1@gmail.com",
            link: "mailto:kuccpscoursechecker1@gmail.com",
            description: "Response within 24 hours",
        },
    ]

    return (
        <div className="min-h-screen py-16 md:py-24">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12 md:mb-16"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-accent/10 border border-accent/20 mb-6">
                        <HeadphonesIcon className="w-8 h-8 md:w-10 md:h-10 text-accent" />
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 text-light">Get in Touch</h1>
                    <p className="text-base md:text-lg text-dim max-w-2xl mx-auto">
                        Have questions about KUCCPS course eligibility? We're here to help you make the right choice.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Methods */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="lg:col-span-1 space-y-6"
                    >
                        <div>
                            <h2 className="text-2xl font-bold text-light mb-6">Contact Information</h2>
                            <div className="space-y-4">
                                {contactMethods.map((method, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                                    >
                                        <a
                                            href={method.link}
                                            target={method.link.startsWith("http") ? "_blank" : undefined}
                                            rel={method.link.startsWith("http") ? "noopener noreferrer" : undefined}
                                            className="block"
                                        >
                                            <Card className="bg-surface border-white/10 hover:border-accent/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all duration-300 group">
                                                <CardContent className="p-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                                                            {method.icon}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-light mb-1 text-sm md:text-base">
                                                                {method.title}
                                                            </h3>
                                                            <p className="text-accent font-medium text-sm md:text-base break-all">
                                                                {method.value}
                                                            </p>
                                                            <p className="text-xs text-dim mt-1">{method.description}</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </a>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Office Hours */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                        >
                            <Card className="bg-accent/5 border-accent/20">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <Clock className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="font-semibold text-light mb-2 text-sm md:text-base">Support Hours</h3>
                                            <div className="space-y-1 text-xs md:text-sm text-dim">
                                                <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                                                <p>Saturday: 9:00 AM - 3:00 PM</p>
                                                <p>Sunday: Closed</p>
                                                <p className="text-accent mt-2">WhatsApp available 24/7</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* AI Assistant Placeholder */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.7 }}
                        >
                            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                                <CardContent className="p-4 text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 border border-accent/20 mb-3">
                                        <MessageCircle className="w-6 h-6 text-accent" />
                                    </div>
                                    <h3 className="font-semibold text-light mb-2 text-sm md:text-base">AI Support Assistant</h3>
                                    <p className="text-xs text-dim mb-3">
                                        Get instant answers to common questions about KUCCPS courses and eligibility
                                    </p>
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-xs text-accent font-medium">
                                        <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                                        Coming Soon
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="lg:col-span-2"
                    >
                        <Card className="bg-surface border-white/10">
                            <CardContent className="p-6 md:p-8">
                                <h2 className="text-2xl font-bold text-light mb-6">Send us a Message</h2>
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-light mb-2">
                                                Your Name *
                                            </label>
                                            <Input
                                                id="name"
                                                type="text"
                                                required
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="bg-base border-white/10 focus:border-accent/40"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-light mb-2">
                                                Email Address *
                                            </label>
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                placeholder="john@example.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="bg-base border-white/10 focus:border-accent/40"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-light mb-2">
                                                Phone Number
                                            </label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="07XX XXX XXX"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="bg-base border-white/10 focus:border-accent/40"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="subject" className="block text-sm font-medium text-light mb-2">
                                                Subject *
                                            </label>
                                            <Input
                                                id="subject"
                                                type="text"
                                                required
                                                placeholder="How can we help?"
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                className="bg-base border-white/10 focus:border-accent/40"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-light mb-2">
                                            Your Message *
                                        </label>
                                        <Textarea
                                            id="message"
                                            required
                                            rows={6}
                                            placeholder="Tell us more about your question or concern..."
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="bg-base border-white/10 focus:border-accent/40 resize-none"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-accent hover:bg-accent/90 text-dark font-semibold py-6 text-base"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin mr-2" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5 mr-2" />
                                                Send Message
                                            </>
                                        )}
                                    </Button>

                                    <p className="text-xs text-dim text-center">
                                        We typically respond within 24 hours during business days
                                    </p>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Quick Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="mt-12 pt-8 border-t border-white/10"
                >
                    <h3 className="text-xl md:text-2xl font-bold text-light mb-6 text-center">Looking for Something Else?</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link
                            href="/faq"
                            className="p-4 bg-surface border border-white/10 rounded-xl hover:border-accent/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all group text-center"
                        >
                            <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/20 transition-colors">
                                <CheckCircle className="w-5 h-5 text-accent" />
                            </div>
                            <h4 className="font-semibold text-light mb-1 group-hover:text-accent transition-colors text-sm md:text-base">
                                FAQs
                            </h4>
                            <p className="text-xs text-dim">Find quick answers</p>
                        </Link>

                        <Link
                            href="/student-tools"
                            className="p-4 bg-surface border border-white/10 rounded-xl hover:border-accent/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all group text-center"
                        >
                            <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/20 transition-colors">
                                <MapPin className="w-5 h-5 text-accent" />
                            </div>
                            <h4 className="font-semibold text-light mb-1 group-hover:text-accent transition-colors text-sm md:text-base">
                                Student Tools
                            </h4>
                            <p className="text-xs text-dim">Government portals</p>
                        </Link>

                        <Link
                            href="/cluster-calculator"
                            className="p-4 bg-surface border border-white/10 rounded-xl hover:border-accent/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all group text-center"
                        >
                            <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/20 transition-colors">
                                <CheckCircle className="w-5 h-5 text-accent" />
                            </div>
                            <h4 className="font-semibold text-light mb-1 group-hover:text-accent transition-colors text-sm md:text-base">
                                Cluster Calculator
                            </h4>
                            <p className="text-xs text-dim">Estimate your points</p>
                        </Link>

                        <Link
                            href="/about"
                            className="p-4 bg-surface border border-white/10 rounded-xl hover:border-accent/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all group text-center"
                        >
                            <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/20 transition-colors">
                                <HeadphonesIcon className="w-5 h-5 text-accent" />
                            </div>
                            <h4 className="font-semibold text-light mb-1 group-hover:text-accent transition-colors text-sm md:text-base">
                                About Us
                            </h4>
                            <p className="text-xs text-dim">Learn our mission</p>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
