"use client"

import { motion } from "framer-motion"
import { Smartphone, ExternalLink, MessageSquare, Gift, Zap, Shield, Users } from "lucide-react"
import Link from "next/link"
import Footer from "@/components/footer"

export default function BuyDataPage() {
    return (
        <div className="min-h-screen flex flex-col bg-base">
            {/* Hero Section */}
            <section className="relative py-16 md:py-24 overflow-hidden">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="mb-6 mt-20 md:mt-8 inline-flex items-center px-4 py-2 rounded-full bg-green-500/10 backdrop-blur-sm border border-green-500/20"
                        >
                            <Smartphone className="h-4 w-4 text-green-400 mr-2" />
                            <span className="text-sm font-medium text-green-400">Affordable Student Data Bundles</span>
                        </motion.div>

                        <h1 className="mb-6 text-4xl md:text-6xl font-bold leading-tight text-light">
                            Get Affordable Data Bundles for Students
                        </h1>

                        <p className="mb-8 text-lg md:text-xl text-dim max-w-3xl mx-auto leading-relaxed">
                            Buy Safaricom data bundles even if you have unpaid Okoa Jahazi debt. Perfect for checking KUCCPS results, using our tools, and staying connected.
                        </p>

                        <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href="https://bingwazone.co.ke/app/bfasta"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 text-white font-bold text-lg rounded-xl shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:shadow-[0_0_40px_rgba(34,197,94,0.7)] transition-all"
                        >
                            <Smartphone className="w-6 h-6" />
                            <span>Buy Data Now</span>
                            <ExternalLink className="w-5 h-5" />
                        </motion.a>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-12 bg-surface/50">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-light mb-4">
                            Why Choose Our Data Service?
                        </h2>
                        <p className="text-dim max-w-2xl mx-auto">
                            Specially designed to help students stay connected affordably
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {[
                            {
                                icon: <Zap className="w-6 h-6 text-amber-400" />,
                                title: "Instant Activation",
                                description: "Get your data bundles activated immediately after purchase. No delays, no waiting."
                            },
                            {
                                icon: <Shield className="w-6 h-6 text-green-400" />,
                                title: "No Okoa Jahazi Required",
                                description: "Buy data even if you have unpaid Okoa Jahazi debt. We've got you covered!"
                            },
                            {
                                icon: <Gift className="w-6 h-6 text-purple-400" />,
                                title: "Special Offers",
                                description: "Join our WhatsApp group for exclusive deals, free data giveaways, and student discounts."
                            },
                            {
                                icon: <Smartphone className="w-6 h-6 text-blue-400" />,
                                title: "Multiple Services",
                                description: "Get data, SMS bundles, and airtime minutes - all in one place at affordable rates."
                            },
                            {
                                icon: <Users className="w-6 h-6 text-cyan-400" />,
                                title: "24/7 Support",
                                description: "Our team is always available to assist you with any issues or questions."
                            },
                            {
                                icon: <ExternalLink className="w-6 h-6 text-pink-400" />,
                                title: "Trusted Service",
                                description: "Thousands of students trust us for their data needs. Join the community today!"
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="p-6 bg-surface border border-white/10 rounded-xl hover:border-green-500/30 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)] transition-all"
                            >
                                <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-light mb-2">{feature.title}</h3>
                                <p className="text-sm text-dim leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* WhatsApp Group Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="max-w-3xl mx-auto bg-gradient-to-br from-green-500/10 to-green-600/5 border-2 border-green-500/30 rounded-2xl p-8 text-center"
                    >
                        <MessageSquare className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <h2 className="text-2xl md:text-3xl font-bold text-light mb-4">
                            Join Our WhatsApp Community
                        </h2>
                        <p className="text-dim mb-6 leading-relaxed">
                            Get instant updates on special offers, free data giveaways, KUCCPS news, and exclusive student discounts. Stay connected with thousands of other students!
                        </p>
                        <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href="https://chat.whatsapp.com/JOe71dS1RgxAGLWNEfKxPI"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-lg shadow-lg transition-colors"
                        >
                            <MessageSquare className="w-5 h-5" />
                            <span>Join WhatsApp Group</span>
                            <ExternalLink className="w-4 h-4" />
                        </motion.a>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-surface/50">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-light mb-4">
                            Ready to Get Connected?
                        </h2>
                        <p className="text-dim mb-8 leading-relaxed">
                            Click the button below to visit Bfasta and purchase your data bundles instantly. Perfect for accessing <Link href="/student-tools" className="text-accent hover:underline font-semibold">student tools</Link>, checking your <Link href="/cluster-calculator" className="text-accent hover:underline font-semibold">KUCCPS cluster points</Link>, and staying updated with the latest <Link href="/news" className="text-accent hover:underline font-semibold">KUCCPS news</Link>.
                        </p>
                        <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href="https://bingwazone.co.ke/app/bfasta"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 text-white font-bold text-lg rounded-xl shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:shadow-[0_0_40px_rgba(34,197,94,0.7)] transition-all"
                        >
                            <Smartphone className="w-6 h-6" />
                            <span>Visit Bfasta Now</span>
                            <ExternalLink className="w-5 h-5" />
                        </motion.a>
                    </motion.div>
                </div>
            </section>

            {/* Internal Links Section */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl mx-auto"
                    >
                        <h2 className="text-2xl md:text-3xl font-bold text-light mb-6 text-center">
                            Explore More Tools & Resources
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link
                                href="/student-tools"
                                className="p-4 bg-surface border border-white/10 rounded-xl hover:border-accent/30 hover:bg-accent/5 transition-all group"
                            >
                                <h3 className="text-light font-semibold mb-2 group-hover:text-accent transition-colors">
                                    Student Tools & Resources
                                </h3>
                                <p className="text-sm text-dim">Access KUCCPS portal, HELB, and other essential student services</p>
                            </Link>
                            <Link
                                href="/learn-skills"
                                className="p-4 bg-surface border border-white/10 rounded-xl hover:border-accent/30 hover:bg-accent/5 transition-all group"
                            >
                                <h3 className="text-light font-semibold mb-2 group-hover:text-accent transition-colors">
                                    Learn Digital Skills
                                </h3>
                                <p className="text-sm text-dim">Master high-income digital skills for free while waiting for placement</p>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer showOnHomepage={false} />
        </div>
    )
}
