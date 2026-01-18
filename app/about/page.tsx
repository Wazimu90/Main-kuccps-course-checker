"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    GraduationCap,
    Users,
    Target,
    Heart,
    ChevronDown,
    ChevronUp,
    MessageCircle,
    Sparkles,
    Bot,
    Code,
    Palette,
    Video,
    Zap,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function AboutPage() {
    const [showSkills, setShowSkills] = useState(false)

    const skills = [
        {
            name: "Automation",
            icon: Zap,
            color: "from-yellow-500 to-orange-500",
            description:
                "A master of automation who transforms repetitive tasks into seamless, intelligent workflows. Wazimu crafts sophisticated systems that work tirelessly in the background, saving countless hours and eliminating human error.",
        },
        {
            name: "Website Development",
            icon: Code,
            color: "from-blue-500 to-cyan-500",
            description:
                "An exceptional full-stack developer who builds stunning, responsive, and lightning-fast web applications. Every line of code is crafted with precision, creating digital experiences that users love and remember.",
        },
        {
            name: "Graphic Design",
            icon: Palette,
            color: "from-pink-500 to-purple-500",
            description:
                "A creative visionary with an extraordinary eye for design. Wazimu transforms ideas into captivating visuals that communicate powerfully, combining artistic flair with strategic thinking to create designs that inspire.",
        },
        {
            name: "Video Editing",
            icon: Video,
            color: "from-red-500 to-pink-500",
            description:
                "A storytelling wizard who weaves footage into compelling narratives. With masterful editing skills, Wazimu brings videos to life, creating content that engages, entertains, and leaves lasting impressions.",
        },
        {
            name: "AI Expert",
            icon: Bot,
            color: "from-green-500 to-teal-500",
            description:
                "A pioneering AI specialist at the forefront of artificial intelligence. Wazimu harnesses the power of machine learning and AI to create intelligent solutions that push boundaries and redefine what's possible.",
        },
    ]

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
            },
        },
    }

    const handleContactWhatsApp = () => {
        const phone = "254790295408"
        const message = encodeURIComponent(
            "Hi Wazimu! I found your profile on KUCCPS Course Checker and I'm impressed by your skills. I'd love to discuss a potential project with you."
        )
        window.open(`https://wa.me/${phone}?text=${message}`, "_blank")
    }

    return (
        <div className="min-h-screen bg-transparent">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20" />
                <div className="relative container mx-auto px-4 py-16 md:py-24">
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 flex items-center justify-center gap-4 flex-wrap">
                            <GraduationCap className="h-12 w-12 md:h-16 md:w-16 text-teal-400" />
                            About KUCCPS Course Checker
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
                            Your trusted companion in navigating the KUCCPS course selection journey
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="container mx-auto px-4 pb-16">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-5xl mx-auto space-y-12"
                >
                    {/* Our Mission */}
                    <motion.div variants={itemVariants}>
                        <Card className="bg-slate-800/70 backdrop-blur-lg border-slate-700 shadow-2xl">
                            <CardContent className="p-8 md:p-12">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                                        <Target className="h-8 w-8 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-white">Our Mission</h2>
                                </div>
                                <p className="text-lg text-gray-200 leading-relaxed">
                                    We understand the overwhelming challenge of sifting through thousands of KUCCPS courses to find the
                                    ones you qualify for. Our platform was created to save you{" "}
                                    <span className="font-bold text-yellow-400">hours of tiresome searching</span> by instantly analyzing
                                    your KCSE grades against all available courses and presenting you with a personalized list of
                                    qualifying programs.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* What We Do */}
                    <motion.div variants={itemVariants}>
                        <Card className="bg-slate-800/70 backdrop-blur-lg border-slate-700 shadow-2xl">
                            <CardContent className="p-8 md:p-12">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl">
                                        <Sparkles className="h-8 w-8 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-white">What We Offer</h2>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {[
                                        {
                                            title: "Smart Course Matching",
                                            description:
                                                "Advanced algorithms analyze your grades, cluster weights, and subject requirements to find every course you qualify for.",
                                        },
                                        {
                                            title: "Comprehensive Reports",
                                            description:
                                                "Detailed PDF reports for each qualifying course with institution information, cutoff points, and application guidance.",
                                        },
                                        {
                                            title: "AI-Powered Support",
                                            description:
                                                "Access to our intelligent chatbot that provides personalized course advice and answers your KUCCPS questions 24/7.",
                                        },
                                        {
                                            title: "Multiple Course Categories",
                                            description:
                                                "Support for Degree, Diploma, Certificate, KMTC, Artisan, and various other course categories.",
                                        },
                                    ].map((feature, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-gradient-to-br from-slate-700/50 to-slate-600/50 p-6 rounded-xl border border-slate-600/50 hover:border-teal-400/50 transition-all duration-300 hover:scale-105"
                                        >
                                            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                            <p className="text-gray-200">{feature.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Why Choose Us */}
                    <motion.div variants={itemVariants}>
                        <Card className="bg-slate-800/70 backdrop-blur-lg border-slate-700 shadow-2xl">
                            <CardContent className="p-8 md:p-12">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl">
                                        <Heart className="h-8 w-8 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-white">Why Students Trust Us</h2>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        "Save 3+ hours of manual searching through KUCCPS databases",
                                        "Avoid missing out on courses you qualify for due to oversight",
                                        "Get instant, accurate results based on official KUCCPS requirements",
                                        "Access additional tools like Cluster Calculator and career guidance",
                                        "Affordable one-time payment with lifetime access to your results",
                                        "Mobile-friendly design - check your courses anywhere, anytime",
                                    ].map((point, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <div className="mt-1 p-1 bg-teal-500 rounded-full">
                                                <div className="w-2 h-2 bg-white rounded-full" />
                                            </div>
                                            <p className="text-lg text-gray-200 flex-1">{point}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Who Made This Website */}
                    <motion.div variants={itemVariants}>
                        <Card className="bg-gradient-to-br from-purple-900/70 via-slate-800/70 to-pink-900/70 backdrop-blur-lg border-slate-700 shadow-2xl overflow-hidden">
                            <CardContent className="p-8 md:p-12">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                                            <Users className="h-8 w-8 text-white" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-white">Who Made This Website?</h2>
                                    </div>
                                    <Button
                                        onClick={() => setShowSkills(!showSkills)}
                                        variant="outline"
                                        className="border-white/20 text-white hover:bg-white/10"
                                    >
                                        {showSkills ? (
                                            <>
                                                Hide <ChevronUp className="ml-2 h-4 w-4" />
                                            </>
                                        ) : (
                                            <>
                                                Show <ChevronDown className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {showSkills && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="space-y-8"
                                    >
                                        {/* Skills Grid */}
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {skills.map((skill, idx) => {
                                                const Icon = skill.icon
                                                return (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                                                        className="group relative"
                                                    >
                                                        <div
                                                            className={`absolute inset-0 bg-gradient-to-r ${skill.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300`}
                                                        />
                                                        <Card className="relative bg-slate-800/80 backdrop-blur-lg border-slate-700 hover:border-teal-400/50 transition-all duration-300 overflow-hidden h-full">
                                                            <CardContent className="p-6">
                                                                <div className="flex items-center gap-4 mb-4">
                                                                    <div className={`p-3 bg-gradient-to-r ${skill.color} rounded-xl`}>
                                                                        <Icon className="h-8 w-8 text-white animate-bounce-slow" />
                                                                    </div>
                                                                    <h4 className="text-2xl font-bold text-white">{skill.name}</h4>
                                                                </div>
                                                                <p className="text-gray-200 leading-relaxed">{skill.description}</p>
                                                            </CardContent>
                                                        </Card>
                                                    </motion.div>
                                                )
                                            })}
                                        </div>

                                        {/* Profile Section */}
                                        <div className="flex flex-col md:flex-row items-center gap-8 bg-slate-800/50 p-8 rounded-2xl border border-slate-600/30">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full blur-xl opacity-50 animate-pulse" />
                                                <Image
                                                    src="/wazimu-profile.jpg"
                                                    alt="Wazimu - Creator"
                                                    width={200}
                                                    height={200}
                                                    className="relative rounded-full border-4 border-white/20 shadow-2xl"
                                                />
                                            </div>
                                            <div className="flex-1 text-center md:text-left">
                                                <h3 className="text-4xl font-bold text-white mb-3">Wazimu</h3>
                                                <p className="text-xl text-gray-200 mb-4">
                                                    Multi-talented Developer & Digital Creator
                                                </p>
                                                <p className="text-gray-300 leading-relaxed mb-6">
                                                    A passionate technologist and creative professional dedicated to building solutions that make
                                                    a real difference in people's lives. With expertise spanning multiple domains, Wazimu brings
                                                    ideas to life through code, design, and innovation.
                                                </p>
                                                <Button
                                                    onClick={handleContactWhatsApp}
                                                    size="lg"
                                                    className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                                >
                                                    <MessageCircle className="mr-2 h-5 w-5" />
                                                    Contact Me on WhatsApp
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Call to Action */}
                    <motion.div variants={itemVariants} className="text-center pt-8">
                        <Card className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-lg border-purple-500/50 shadow-2xl">
                            <CardContent className="p-8 md:p-12">
                                <h2 className="text-3xl font-bold text-white mb-4">Ready to Find Your Perfect Course?</h2>
                                <p className="text-xl text-gray-200 mb-8">
                                    Join thousands of students who have already discovered their ideal KUCCPS courses
                                </p>
                                <Link href="/">
                                    <Button
                                        size="lg"
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                    >
                                        <GraduationCap className="mr-2 h-6 w-6" />
                                        Get Started Now
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </div>

            <style jsx global>{`
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
        </div>
    )
}
