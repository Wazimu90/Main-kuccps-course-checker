"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import {
    Phone,
    Mail,
    MessageCircle,
    Headphones,
} from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
    const contactMethods = [
        {
            icon: Phone,
            title: "Call Support",
            action: "Make a Call",
            href: "tel:+254713111921",
            color: "from-blue-500 to-cyan-500",

        },
        {
            icon: MessageCircle,
            title: "WhatsApp Chat",
            action: "Start Chat",
            href: "https://wa.me/254790295408?text=Hi%2C%20I%20need%20help%20with%20KUCCPS%20Course%20Checker",
            color: "from-green-500 to-teal-500",

        },
        {
            icon: Mail,
            title: "Email Support",
            action: "Send Email",
            href: "mailto:kuccpscoursechecker1@gmail.com",
            color: "from-purple-500 to-pink-500",

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

    return (
        <div className="min-h-screen bg-transparent">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative overflow-hidden"
            >
                <div className="relative container mx-auto px-4 py-16 md:py-24">
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 flex items-center justify-center gap-4 flex-wrap">
                            <Headphones className="h-12 w-12 md:h-16 md:w-16 text-teal-400" />
                            Get In Touch
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
                            We're here to help! Choose your preferred way to reach us.
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
                    className="max-w-6xl mx-auto"
                >
                    {/* Contact Methods */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {contactMethods.map((method, idx) => {
                            const Icon = method.icon
                            return (
                                <motion.div
                                    key={idx}
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="h-full"
                                >
                                    <Link href={method.href} target="_blank" rel="noopener noreferrer">
                                        <Card className="bg-slate-800/70 backdrop-blur-lg border-slate-700 shadow-2xl hover:border-teal-400/50 transition-all duration-300 h-full cursor-pointer group flex flex-col items-center justify-center">
                                            <CardContent className="p-10 text-center flex flex-col items-center">
                                                <div className={`inline-flex p-6 bg-gradient-to-r ${method.color} rounded-2xl mb-6 shadow-lg`}>
                                                    <Icon className="h-12 w-12 text-white group-hover:scale-110 transition-transform" />
                                                </div>
                                                <h3 className="text-3xl font-bold text-white mb-3">{method.title}</h3>
                                                <p className="text-sm text-gray-400 mb-6">{method.description}</p>
                                                <div className={`px-8 py-3 rounded-full bg-gradient-to-r ${method.color} text-white font-bold text-lg shadow-lg group-hover:shadow-xl group-hover:brightness-110 transition-all`}>
                                                    {method.action}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            )
                        })}
                    </div>
                </motion.div>
                <div className="mt-12 text-center">
                    <p className="text-gray-400 text-sm">
                        Need help with Helb/Kuccps/KRA Applications? Reach us on <Link href="https://wa.me/254790295408?text=Hi%2C%20I%20need%20help%20with%20KUCCPS%20Application" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">WhatsApp</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
