"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { ExternalLink, CheckCircle, Clock, Wifi, Play, X } from "lucide-react"
import Footer from "@/components/footer"

interface GovernmentService {
    name: string
    description: string
    website: string
    logo: string
    status: "open" | "not-open" | "online"
}

interface VideoTutorial {
    id: string
    title: string
    description: string
    youtubeId: string
    thumbnail?: string
    duration?: string
}

const GOVERNMENT_SERVICES: GovernmentService[] = [
    {
        name: "Kenya Universities and Colleges Central Placement Service (KUCCPS)",
        description: "A state corporation that offers career guidance and coordinates placement of Government-sponsored students into universities, national polytechnics, technical training institutes and other accredited higher learning institutions in Kenya.",
        website: "https://kuccps.net",
        logo: "/images/kuccpslogo.png",
        status: "not-open",
    },
    {
        name: "Higher Education Loans Board (HELB)",
        description: "A state agency under the Ministry of Education that provides education loans, scholarships and manages partner funds to support learners in universities and TVET institutions in Kenya.",
        website: "https://www.helb.co.ke",
        logo: "/images/helblogo.png",
        status: "not-open",
    },
    {
        name: "Kenya Revenue Authority (KRA)",
        description: "A government agency established by an Act of Parliament to assess, collect and account for all government revenue, advise on revenue administration, and support automation of tax services through online platforms.",
        website: "https://www.kra.go.ke",
        logo: "/images/kralogo.jpg",
        status: "open",
    },
    {
        name: "Kenya National Examinations Council (KNEC)",
        description: "The national body responsible for quality assessment and administration of credible public examinations in Kenya, including registration of candidates and release of national exam results.",
        website: "https://www.knec.ac.ke",
        logo: "/images/kneclogo.png",
        status: "open",
    },
    {
        name: "Ministry of Education (MOE), Republic of Kenya",
        description: "The ministry that formulates and implements policies on education and training, including curricula, standards, examinations, university charters, and management of basic, tertiary and university education in Kenya.",
        website: "https://www.education.go.ke",
        logo: "/images/ministrylogo.png",
        status: "open",
    },
    {
        name: "Skylink Bundlesfasta - Fast Bundles, Trusted deals.",
        description: "Buy Safaricom Data even if you have not paid your Okoa Jahazi. Get affordable Data, Minutes and SMS Bundles instantly.",
        website: "https://www.bingwazone.co.ke/app/bfasta",
        logo: "/images/datalogo.png",
        status: "online",
    }
]

const VIDEO_TUTORIALS: VideoTutorial[] = [
    {
        id: "1",
        title: "How to Check Qualified Courses on Our Website",
        description: "Step-by-step guide on using our KUCCPS Course Checker to find courses you qualify for based on your KCSE grades.",
        youtubeId: "dQw4w9WgXcQ", // Replace with actual YouTube video ID
        duration: "5:30"
    },
    {
        id: "2",
        title: "How to Apply for KUCCPS University Placement",
        description: "Complete walkthrough of the KUCCPS application process, from account creation to course selection and submission.",
        youtubeId: "dQw4w9WgXcQ", // Replace with actual YouTube video ID
        duration: "8:45"
    },
    {
        id: "3",
        title: "How to Apply for KRA PIN Online",
        description: "Easy tutorial on registering for your KRA PIN through iTax, required for HELB and other government services.",
        youtubeId: "dQw4w9WgXcQ", // Replace with actual YouTube video ID
        duration: "6:15"
    },
    {
        id: "4",
        title: "How to Apply for HELB Loan & Scholarship",
        description: "Comprehensive guide on applying for Higher Education Loans and Scholarships through the HELB online portal.",
        youtubeId: "dQw4w9WgXcQ", // Replace with actual YouTube video ID
        duration: "10:20"
    },
    {
        id: "5",
        title: "Understanding KUCCPS Cluster Points & Cut-off",
        description: "Learn how cluster points are calculated and how to interpret cut-off marks for different courses and universities.",
        youtubeId: "dQw4w9WgXcQ", // Replace with actual YouTube video ID
        duration: "7:30"
    },
    {
        id: "6",
        title: "How to Download Your KNEC Results Certificate",
        description: "Guide on accessing and downloading your official KCSE results certificate from the KNEC portal.",
        youtubeId: "dQw4w9WgXcQ", // Replace with actual YouTube video ID
        duration: "4:20"
    }
]

export default function StudentToolsPage() {
    const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null)

    const getStatusBadge = (status: string) => {
        if (status === "open") {
            return (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/20 border border-success/30">
                    <CheckCircle className="w-3.5 h-3.5 text-success" />
                    <span className="text-xs font-semibold text-success">Applications Open</span>
                </div>
            )
        } else if (status === "not-open") {
            return (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-semibold text-amber-300">Applications Not Open Yet</span>
                </div>
            )
        } else if (status === "online") {
            return (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30">
                    <div className="relative flex items-center">
                        <Wifi className="w-3.5 h-3.5 text-accent" />
                        <span className="absolute right-0 top-0 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                        </span>
                    </div>
                    <span className="text-xs font-semibold text-accent">Online Now</span>
                </div>
            )
        }
        return null
    }

    const openVideoModal = (video: VideoTutorial) => {
        setSelectedVideo(video)
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden'
    }

    const closeVideoModal = () => {
        setSelectedVideo(null)
        // Restore body scroll
        document.body.style.overflow = 'auto'
    }

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
                            className="mb-6 mt-20 md:mt-8 inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
                        >
                            <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                            <span className="text-sm font-medium text-light">Essential Student Resources</span>
                        </motion.div>

                        <h1 className="mb-6 text-4xl md:text-6xl font-bold leading-tight text-light">
                            Student Tools & Resources
                        </h1>

                        <p className="mb-8 text-lg md:text-xl text-dim max-w-3xl mx-auto leading-relaxed">
                            Quick access to essential government services and platforms for Kenyan students. All official portals in one place.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {GOVERNMENT_SERVICES.map((service, index) => (
                            <motion.div
                                key={service.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <a
                                    href={service.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group block h-full"
                                >
                                    <div className="h-full relative overflow-hidden rounded-2xl bg-surface border border-white/10 p-6 transition-all duration-300 hover:border-accent/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] hover:-translate-y-1">
                                        {/* Logo Section */}
                                        <div className="relative mb-5 flex items-center justify-center">
                                            <div className="relative w-24 h-24 rounded-xl bg-white/5 border border-white/10 p-3 group-hover:bg-white/10 transition-all duration-300">
                                                <div className="relative w-full h-full">
                                                    <Image
                                                        src={service.logo}
                                                        alt={`${service.name} logo`}
                                                        fill
                                                        className="object-contain"
                                                        sizes="(max-width: 768px) 96px, 96px"
                                                    />
                                                    {/* Online Indicator for Skylink */}
                                                    {service.status === "online" && (
                                                        <span className="absolute -top-1 -right-1 flex h-4 w-4 z-10">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-4 w-4 bg-accent border-2 border-surface"></span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-bold text-light leading-tight line-clamp-2 group-hover:text-accent transition-colors duration-300">
                                                {service.name}
                                            </h3>

                                            <p className="text-sm text-dim leading-relaxed line-clamp-3">
                                                {service.description}
                                            </p>

                                            {/* Status Badge */}
                                            <div className="flex items-center justify-between pt-2">
                                                {getStatusBadge(service.status)}

                                                <div className="flex items-center gap-1.5 text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <span className="text-xs font-semibold">Visit</span>
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Hover Glow Effect */}
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/0 via-accent/0 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                    </div>
                                </a>
                            </motion.div>
                        ))}
                    </div>

                    {/* Info Note */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="mt-12 max-w-3xl mx-auto"
                    >
                        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-accent" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-base font-bold text-light mb-2">Official Government Services</h4>
                                    <p className="text-sm text-dim leading-relaxed">
                                        All links provided above are official government websites and verified platforms. Always ensure you're on the correct website before entering any personal information. Check for HTTPS and official domain names.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Video Tutorials Section */}
            <section className="py-16 pb-20">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mb-12 text-center"
                    >
                        <div className="mb-4 inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                            <Play className="h-4 w-4 text-accent mr-2" />
                            <span className="text-sm font-medium text-light">Video Tutorials</span>
                        </div>
                        <h2 className="mb-4 text-3xl md:text-5xl font-bold text-light">Learn How It Works</h2>
                        <p className="mx-auto max-w-2xl text-lg text-dim">
                            Watch our step-by-step video guides to navigate student services with confidence
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {VIDEO_TUTORIALS.map((video, index) => (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <button
                                    onClick={() => openVideoModal(video)}
                                    className="group block h-full w-full text-left"
                                >
                                    <div className="h-full relative overflow-hidden rounded-2xl bg-surface border border-white/10 transition-all duration-300 hover:border-accent/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] hover:-translate-y-1">
                                        {/* Video Thumbnail */}
                                        <div className="relative aspect-video bg-gradient-to-br from-accent/10 to-accent/5 overflow-hidden">
                                            <Image
                                                src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                                                alt={video.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            />
                                            {/* Play Button Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors duration-300">
                                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-accent/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                                                    <Play className="w-8 h-8 md:w-10 md:h-10 text-dark fill-dark ml-1" />
                                                </div>
                                            </div>
                                            {/* Duration Badge */}
                                            {video.duration && (
                                                <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/80 backdrop-blur-sm">
                                                    <span className="text-xs font-semibold text-white">{video.duration}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 space-y-3">
                                            <h3 className="text-base md:text-lg font-bold text-light leading-tight line-clamp-2 group-hover:text-accent transition-colors duration-300">
                                                {video.title}
                                            </h3>
                                            <p className="text-sm text-dim leading-relaxed line-clamp-2">
                                                {video.description}
                                            </p>
                                            <div className="flex items-center gap-2 pt-2">
                                                <Play className="w-4 h-4 text-accent" />
                                                <span className="text-xs font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    Watch Tutorial
                                                </span>
                                            </div>
                                        </div>

                                        {/* Hover Glow Effect */}
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/0 via-accent/0 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                    </div>
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Video Modal Overlay */}
            <AnimatePresence>
                {selectedVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                        onClick={closeVideoModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="relative w-full max-w-5xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={closeVideoModal}
                                className="absolute -top-12 right-0 md:-top-14 md:-right-14 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-300 group z-10"
                                aria-label="Close video"
                            >
                                <X className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
                            </button>

                            {/* Video Container */}
                            <div className="relative rounded-2xl overflow-hidden bg-black shadow-[0_0_60px_rgba(34,211,238,0.3)] border border-accent/20">
                                <div className="relative aspect-video">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0`}
                                        title={selectedVideo.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="absolute inset-0 w-full h-full"
                                    />
                                </div>
                                {/* Video Info */}
                                <div className="p-4 md:p-6 bg-surface/95 backdrop-blur-sm border-t border-white/10">
                                    <h3 className="text-lg md:text-xl font-bold text-light mb-2">{selectedVideo.title}</h3>
                                    <p className="text-sm text-dim">{selectedVideo.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer showOnHomepage={false} />
        </div>
    )
}
