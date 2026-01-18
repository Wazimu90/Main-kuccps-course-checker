"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Sparkles,
    BookOpen,
    Code,
    Palette,
    TrendingUp,
    Video,
    MessageCircle,
    Smartphone,
    X,
    ExternalLink,
    Zap,
    Users,
    Award
} from "lucide-react"
import Footer from "@/components/footer"

export default function LearnSkillsPage() {
    const [showBuyDataModal, setShowBuyDataModal] = useState(false)

    // Floating Buy Data Button Handler
    const handleBuyDataClick = () => {
        setShowBuyDataModal(true)
    }

    // Skills data
    const skills = [
        {
            icon: <Code className="w-8 h-8 text-blue-400" />,
            title: "Web Development",
            desc: "Build modern websites and apps using HTML, CSS, React, and Next.js.",
            color: "from-blue-500/20 to-blue-600/10",
            border: "border-blue-500/30"
        },
        {
            icon: <Palette className="w-8 h-8 text-pink-400" />,
            title: "Graphic Design",
            desc: "Master Photoshop, Illustrator, and Canva to create stunning visuals.",
            color: "from-pink-500/20 to-pink-600/10",
            border: "border-pink-500/30"
        },
        {
            icon: <TrendingUp className="w-8 h-8 text-green-400" />,
            title: "Digital Marketing",
            desc: "Learn SEO, social media marketing, and content strategy to grow brands.",
            color: "from-green-500/20 to-green-600/10",
            border: "border-green-500/30"
        },
        {
            icon: <Video className="w-8 h-8 text-purple-400" />,
            title: "Video Editing",
            desc: "Create professional videos using Premiere Pro, CapCut, and After Effects.",
            color: "from-purple-500/20 to-purple-600/10",
            border: "border-purple-500/30"
        },
        {
            icon: <Video className="w-8 h-8 text-blue-400" />,
            title: "AI Literacy",
            desc: "Master how to use AI to efficiently.",
            color: "from-blue-500/20 to-blue-600/10",
            border: "border-blue-500/30"
        },
        {
            icon: <Video className="w-8 h-8 text-yellow-400" />,
            title: "Tech Tools",
            desc: "Access to free Softwares, Apps and Tools.",
            color: "from-yellow-500/20 to-yellow-600/10",
            border: "border-yellow-500/30"
        }
    ]

    return (
        <div className="min-h-screen bg-dark text-light overflow-x-hidden relative selection:bg-amber-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <main className="relative z-10">
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 overflow-hidden">
                    <div className="container mx-auto max-w-6xl text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 backdrop-blur-sm mb-8"
                            >
                                <Sparkles className="w-4 h-4 text-amber-500 mr-2" />
                                <span className="text-amber-500 text-sm font-bold uppercase tracking-wider">Coming Soon: Skill Up Academy</span>
                            </motion.div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight">
                                Master High-Income<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-500">Digital Skills For FREE</span>
                            </h1>

                            <p className="text-lg md:text-xl text-dim max-w-3xl mx-auto mb-12 leading-relaxed">
                                We are building the ultimate platform for you to learn practical, job-ready digital skills at absolutely no cost. Perfect for students waiting for KUCCPS placement or exploring <a href="/certificate" className="text-accent hover:underline font-semibold">certificate courses</a> and <a href="/artisan" className="text-accent hover:underline font-semibold">artisan technical trades</a>. Don't miss the launch!
                            </p>

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <a
                                    href="https://whatsapp.com/channel/0029VbBw1it3WHTbDLpgOL1w"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-lg rounded-2xl shadow-[0_0_30px_rgba(37,211,102,0.4)] hover:shadow-[0_0_50px_rgba(37,211,102,0.6)] transition-all group"
                                >
                                    <MessageCircle className="w-6 h-6" />
                                    <span>Join Priority List on WhatsApp</span>
                                    <ExternalLink className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                                </a>
                                <p className="mt-4 text-xs md:text-sm text-dim">
                                    <span className="text-green-400">●</span> 150+ students already waiting
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-20 px-4 bg-white/5 border-y border-white/5 backdrop-blur-sm">
                    <div className="container mx-auto max-w-6xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            {[
                                { icon: <Zap className="w-6 h-6" />, title: "100% Free", desc: "No hidden fees. Premium education accessible to everyone." },
                                { icon: <Users className="w-6 h-6" />, title: "Community Driven", desc: "Learn alongside peers and mentors in our active community." },
                                { icon: <Award className="w-6 h-6" />, title: "Certified", desc: "Earn certificates to showcase your skills to employers." }
                            ].map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.2 }}
                                    className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-colors"
                                >
                                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-amber-500">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-light mb-2">{feature.title}</h3>
                                    <p className="text-dim text-sm leading-relaxed">{feature.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Course Sneak Peak */}
                <section className="py-20 px-4">
                    <div className="container mx-auto max-w-6xl">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl md:text-5xl font-bold text-light mb-6">What You Will Learn</h2>
                            <p className="text-dim">Get ready to master these high-demand skills</p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {skills.map((skill, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    whileHover={{ y: -5 }}
                                    viewport={{ once: true }}
                                    className={`p-6 md:p-8 rounded-3xl bg-gradient-to-br ${skill.color} border ${skill.border} hover:bg-opacity-20 transition-all cursor-default relative overflow-hidden group`}
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                                        {skill.icon}
                                    </div>
                                    <div className="relative z-10">
                                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 shadow-lg">
                                            {skill.icon}
                                        </div>
                                        <h3 className="text-2xl font-bold text-light mb-3">{skill.title}</h3>
                                        <p className="text-dim leading-relaxed mb-6">{skill.desc}</p>
                                        <div className="flex items-center text-sm font-semibold opacity-70">
                                            <span className="px-3 py-1 rounded-full bg-white/10">Coming Soon</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-20 px-4 text-center">
                    <div className="container mx-auto max-w-4xl bg-gradient-to-br from-surface to-dark border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]"></div>

                        <h2 className="text-3xl md:text-4xl font-bold text-light mb-6 relative z-10">Don't Miss The Launch!</h2>
                        <p className="text-dim text-lg mb-8 max-w-2xl mx-auto relative z-10">
                            Be among the first to access these free courses. Join our exclusive WhatsApp community today for updates and early access.
                        </p>

                        <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href="https://whatsapp.com/channel/0029VbBw1it3WHTbDLpgOL1w"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-lg rounded-xl shadow-lg transition-colors relative z-10"
                        >
                            <MessageCircle className="w-5 h-5" />
                            <span>Join WhatsApp Group</span>
                        </motion.a>
                    </div>
                </section>

                <Footer showOnHomepage={false} />
            </main>

            {/* Floating Buy Data Button & Modal */}
            <AnimatePresence>
                {showBuyDataModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
                        onClick={() => setShowBuyDataModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 50 }}
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                            className="relative max-w-lg w-full max-h-[90vh] bg-gradient-to-br from-green-900/40 via-surface to-surface border-2 border-green-500/40 rounded-3xl shadow-[0_0_60px_rgba(34,197,94,0.4)] overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Animated background elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-green-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

                            <button
                                onClick={() => setShowBuyDataModal(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-all hover:rotate-90 z-10"
                            >
                                <X className="w-5 h-5 text-dim hover:text-light" />
                            </button>

                            <div className="relative z-10 overflow-y-auto p-6 md:p-8">
                                {/* Header with animated icon */}
                                <div className="text-center mb-4 md:mb-6">
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.1, 1],
                                            rotate: [0, 5, -5, 0]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            repeatType: "reverse"
                                        }}
                                        className="inline-flex w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 items-center justify-center mb-3 md:mb-4 shadow-[0_0_30px_rgba(34,197,94,0.5)]"
                                    >
                                        <Smartphone className="w-8 h-8 md:w-10 md:h-10 text-white" />
                                    </motion.div>

                                    <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-300 to-emerald-400 mb-2">
                                        🎉 Amazing Offer! 🎉
                                    </h3>
                                    <p className="text-sm md:text-base text-green-200 font-semibold">
                                        Buy Data Even with unpaid Okoa Jahazi Debt!
                                    </p>
                                </div>

                                {/* Features with icons */}
                                <div className="bg-gradient-to-br from-green-500/15 to-green-600/10 border border-green-500/30 rounded-2xl p-4 md:p-5 mb-4 md:mb-6 backdrop-blur-sm">
                                    <p className="text-light text-sm md:text-base leading-relaxed mb-4 text-center">
                                        Get <strong className="text-green-400">instant Safaricom data, SMS & minutes</strong> from Bfasta - no matter your Okoa Jahazi debt! 📱✨
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center"
                                        >
                                            <div className="text-2xl mb-1">⚡</div>
                                            <p className="text-xs font-semibold text-green-300">Instant Activation</p>
                                        </motion.div>
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center"
                                        >
                                            <div className="text-2xl mb-1">💰</div>
                                            <p className="text-xs font-semibold text-green-300">Affordable Rates</p>
                                        </motion.div>
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center"
                                        >
                                            <div className="text-2xl mb-1">🌟</div>
                                            <p className="text-xs font-semibold text-green-300">24/7 Available</p>
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Benefits list */}
                                <div className="bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 mb-4 md:mb-6">
                                    <p className="text-xs text-dim mb-3 font-semibold uppercase tracking-wide">Perfect for:</p>
                                    <div className="space-y-2">
                                        {[
                                            '✅ Checking KUCCPS results',
                                            '✅ Using this calculator anytime',
                                            '✅ Staying connected with friends',
                                            '✅ Emergency internet needs'
                                        ].map((item, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="text-xs md:text-sm text-light flex items-center gap-2"
                                            >
                                                <span>{item}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* CTA Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowBuyDataModal(false)}
                                        className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/20 text-dim hover:text-light font-medium rounded-xl transition-all"
                                    >
                                        Maybe Later
                                    </button>
                                    <motion.a
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        href="https://bingwazone.co.ke/app/Bfasta"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => setShowBuyDataModal(false)}
                                        className="flex-[2] py-3 px-6 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 text-white font-black rounded-xl transition-all shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:shadow-[0_0_40px_rgba(34,197,94,0.7)] flex items-center justify-center gap-2 text-base relative overflow-hidden group"
                                    >
                                        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                                        <span className="relative z-10">Buy Now! 🚀</span>
                                        <ExternalLink className="w-5 h-5 relative z-10" />
                                    </motion.a>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Buy Data Button */}
            <motion.button
                onClick={handleBuyDataClick}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-[0_0_25px_rgba(34,197,94,0.6)] hover:shadow-[0_0_35px_rgba(34,197,94,0.8)] border-2 border-green-400/30 flex items-center justify-center transition-all duration-300 group"
                aria-label="Buy Safaricom Data"
            >
                <Smartphone className="w-6 h-6 md:w-8 md:h-8 text-white group-hover:scale-110 transition-transform" />
                {/* Pulse animation */}
                <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30"></span>
            </motion.button>
        </div>
    )
}
