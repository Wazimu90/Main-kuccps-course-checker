"use client"

import { motion } from "framer-motion"
import { Smartphone, ExternalLink, MessageSquare, Zap, Shield, Gift, Sparkles } from "lucide-react"
import Link from "next/link"
import Footer from "@/components/footer"

export default function BuyDataPage() {
    return (
        <div className="min-h-screen flex flex-col bg-base relative overflow-hidden">
            {/* Simple Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl" />
            </div>

            {/* Hero Section with Primary CTAs */}
            <section className="relative pt-24 md:pt-32 pb-12 md:pb-20">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-5xl mx-auto"
                    >
                        {/* Animated Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="mb-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-green-500/20 backdrop-blur-lg border border-green-400/30 shadow-lg shadow-green-500/20"
                        >
                            <Sparkles className="h-4 w-4 text-green-400 animate-pulse" />
                            <span className="text-sm font-bold text-green-300 tracking-wide">Affordable Data for Students</span>
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="mb-6 text-5xl md:text-7xl font-black leading-tight"
                        >
                            <span className="bg-gradient-to-r from-white via-green-100 to-white bg-clip-text text-transparent">
                                Stay Connected,
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent">
                                Stay Ahead
                            </span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="mb-12 text-lg md:text-xl text-dim/90 max-w-2xl mx-auto leading-relaxed"
                        >
                            Buy data bundles even with unpaid Okoa Jahazi debt. No limits, no delays.
                        </motion.p>

                        {/* Primary CTA Buttons - Hero Focus */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                        >
                            {/* Buy Data Button - Primary CTA */}
                            <motion.a
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                href="https://bingwazone.co.ke/app/bfasta"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative w-full sm:w-auto"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
                                <div className="relative flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white font-bold text-lg rounded-2xl shadow-2xl border border-green-400/50">
                                    <Smartphone className="w-6 h-6 animate-pulse" />
                                    <span>Buy Data Now</span>
                                    <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </motion.a>

                            {/* Join Group Button - Secondary CTA */}
                            <motion.a
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                href="https://chat.whatsapp.com/JOe71dS1RgxAGLWNEfKxPI"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative w-full sm:w-auto"
                            >
                                <div className="absolute inset-0 bg-[#25D366] rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
                                <div className="relative flex items-center justify-center gap-3 px-10 py-5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-lg rounded-2xl shadow-2xl border border-green-300/30 transition-colors">
                                    <MessageSquare className="w-6 h-6 animate-pulse" />
                                    <span>Join Community</span>
                                    <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </motion.a>
                        </motion.div>

                        {/* Trust Indicator */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="flex items-center justify-center gap-6 text-sm text-dim/60"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span>Instant Activation</span>
                            </div>
                            <div className="w-1 h-1 bg-dim/20 rounded-full" />
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-green-400" />
                                <span>Trusted by 10,000+ students</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Quick Benefits - Minimal Cards */}
            <section className="relative py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="max-w-6xl mx-auto"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    icon: <Zap className="w-8 h-8 text-amber-400" />,
                                    title: "Instant Delivery",
                                    description: "Get your bundles activated in seconds",
                                    gradient: "from-amber-500/10 to-orange-500/10",
                                    borderColor: "border-amber-500/30"
                                },
                                {
                                    icon: <Shield className="w-8 h-8 text-green-400" />,
                                    title: "Available even with Okoa Jahazi",
                                    description: "Buy even with unpaid Okoa Jahazi",
                                    gradient: "from-green-500/10 to-emerald-500/10",
                                    borderColor: "border-green-500/30"
                                },
                                {
                                    icon: <Gift className="w-8 h-8 text-purple-400" />,
                                    title: "Exclusive Deals",
                                    description: "Free giveaways & student discounts",
                                    gradient: "from-purple-500/10 to-pink-500/10",
                                    borderColor: "border-purple-500/30"
                                }
                            ].map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    className={`group relative p-8 bg-gradient-to-br ${benefit.gradient} backdrop-blur-sm border ${benefit.borderColor} rounded-2xl hover:shadow-2xl transition-all duration-300`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative">
                                        <motion.div
                                            whileHover={{ rotate: 360, scale: 1.2 }}
                                            transition={{ duration: 0.6 }}
                                            className="mb-4 w-14 h-14 rounded-xl bg-surface/50 border border-white/10 flex items-center justify-center"
                                        >
                                            {benefit.icon}
                                        </motion.div>
                                        <h3 className="text-xl font-bold text-light mb-2">{benefit.title}</h3>
                                        <p className="text-sm text-dim/80">{benefit.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Quick Links - Minimal */}
            <section className="relative py-12 pb-20">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <h2 className="text-2xl md:text-3xl font-bold text-light mb-8">
                            Perfect for accessing
                        </h2>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            {[
                                { label: "Student Tools", href: "/student-tools" },
                                { label: "Cluster Calculator", href: "/cluster-calculator" },
                                { label: "KUCCPS News", href: "/news" },
                                { label: "Learn Skills", href: "/learn-skills" }
                            ].map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.href}
                                    className="inline-block px-6 py-3 bg-surface/50 backdrop-blur-sm border border-white/10 hover:border-accent/40 rounded-xl text-light hover:text-accent font-medium transition-all"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer showOnHomepage={false} />
        </div>
    )
}
