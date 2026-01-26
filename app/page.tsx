"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import {
  GraduationCap,
  Award,
  BookOpen,
  Stethoscope,
  Hammer,
  Briefcase,
  Database,
  Search,
  ClipboardCheck,
  FileText,
  CheckCircle,
  Users,
  Star,
  Calculator,
  ExternalLink,
} from "lucide-react"
import MagicMenu from "@/components/MagicMenu"
import { useToast } from "@/hooks/use-toast"
import CourseCategoryCard from "@/components/course-category-card"
import TestimonialCarousel from "@/components/testimonial-carousel"
import Footer from "@/components/footer"
import TextType from "@/components/ui/text-type"
import HowItWorks from "@/components/how-it-works"

export default function Home() {
  const { toast } = useToast()
  const courseCategoriesRef = useRef<HTMLDivElement>(null)

  const scrollToCategories = () => {
    courseCategoriesRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const showComingSoon = () => {
    toast({
      title: "Coming Soon!",
      description: "This feature is currently under development and will be available soon.",
      duration: 3000,
    })
  }

  const courseCategories = [
    {
      title: "Degree",
      description: "Bachelor's degree programs from universities",
      icon: GraduationCap,
      href: "/degree",
      colorScheme: "purple",
    },
    {
      title: "Diploma",
      description: "Diploma courses from colleges and polytechnics",
      icon: Award,
      href: "/diploma",
      colorScheme: "blue",
    },
    {
      title: "Certificate",
      description: "Certificate programs for specialized skills",
      icon: BookOpen,
      href: "/certificate",
      colorScheme: "green",
    },
    {
      title: "KMTC",
      description: "Kenya Medical Training College courses",
      icon: Stethoscope,
      href: "/kmtc",
      colorScheme: "orange",
    },
    {
      title: "Artisan",
      description: "Hands-on technical and vocational courses",
      icon: Hammer,
      href: "/artisan",
      colorScheme: "pink",
    },
    {
      title: "Short Courses",
      description: "For Free Learn a skill & improve your personal development.",
      icon: Briefcase,
      href: "/learn-skills",
      colorScheme: "indigo",
    },

  ]



  return (
    <div className="min-h-screen flex flex-col">


      {/* Hero Section */}
      <section className="relative py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="mb-6 text-4xl md:text-6xl lg:text-7xl font-bold leading-tight min-h-[200px] md:min-h-[300px]">
                <TextType
                  text={["I have my KCSE results. Now what exactly do I qualify for?", "Check Which KUCCPS Courses You Qualify For Based on Your KCSE Grades", "Your future is yours. We just make it clearer."]}
                  typingSpeed={50}
                  pauseDuration={1800}
                  deletingSpeed={15}
                  showCursor={true}
                  cursorCharacter="|"
                  className="text-light"
                  startOnVisible={true}
                  loop={true}
                />
              </h1>

              <p className="mb-8 text-lg md:text-xl text-light max-w-3xl mx-auto leading-relaxed">
                Powered by official KUCCPS Data. Use our <a href="/cluster-calculator" className="text-accent hover:underline font-semibold">cluster calculator</a> to understand your chances, then  <a href="/degree" className="text-accent hover:underline font-semibold">check which courses you qualify for</a> based on your KCSE results. Get intelligent AI assistance to help you make the best choices.
              </p>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <MagicMenu />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-light"
              >
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-green-400" />
                  <span>102k+ Students Helped</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-green-400" />
                  <span>10k+ Courses</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-2 text-yellow-400" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-blue-400" />
                  <span>99% Accuracy</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-blue-400" />
                  <span>Free AI Assistant</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-blue-400" />
                  <span>Free PDF Download</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Extended Gradient Background Section */}
      <div className="relative bg-base">
        {/* Course Categories Section */}
        <section id="courses" className="py-20" ref={courseCategoriesRef} tabIndex={-1}>
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 text-3xl md:text-5xl font-bold text-light">Explore Course Categories</h2>
              <p className="mx-auto max-w-2xl text-lg text-light">
                Select a category to check which courses you qualify for based on your KCSE results
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {courseCategories.map((category, index) => (
                <CourseCategoryCard
                  key={category.title}
                  title={category.title}
                  description={category.description}
                  icon={category.icon}
                  href={category.href}
                  delay={index}
                  colorScheme={category.colorScheme}
                />
              ))}
            </div>
          </div>
        </section>

        <HowItWorks />

        {/* Complete Process Section with Internal Links */}
        <section className="py-16 bg-base">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-light mb-4">
                Complete KUCCPS Course Checking Process
              </h2>
              <p className="text-dim max-w-2xl mx-auto">
                Follow these simple steps to find and apply for courses you qualify for
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <a
                  href="/cluster-calculator"
                  className="group block p-6 bg-surface border border-white/10 rounded-xl hover:border-accent/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <Calculator className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-light mb-2 group-hover:text-accent transition-colors">
                    1. Calculate Cluster Points
                  </h3>
                  <p className="text-sm text-dim">
                    Estimate your cluster weights for all 20 KUCCPS categories using our AI-powered calculator
                  </p>
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <a
                  href="/degree"
                  className="group block p-6 bg-surface border border-white/10 rounded-xl hover:border-accent/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <BookOpen className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-light mb-2 group-hover:text-accent transition-colors">
                    2. Check Course Eligibility
                  </h3>
                  <p className="text-sm text-dim">
                    Find degree, diploma, certificate, KMTC, or artisan courses you qualify for based on your grades
                  </p>
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <a
                  href="/student-tools"
                  className="group block p-6 bg-surface border border-white/10 rounded-xl hover:border-accent/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <ExternalLink className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-light mb-2 group-hover:text-accent transition-colors">
                    3. Apply via KUCCPS Portal
                  </h3>
                  <p className="text-sm text-dim">
                    Access official KUCCPS and HELB portals to submit your course choices and apply for loans
                  </p>
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Student Resources Hub - Internal Linking Section */}
        <section className="py-16 bg-surface/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-light mb-4">
                Additional Resources for KUCCPS Applicants
              </h2>
              <p className="text-dim max-w-2xl mx-auto">
                Everything you need to make informed decisions about your future
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {/* FAQ Link */}
              <motion.a
                href="/faq"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group p-6 bg-surface border border-white/10 rounded-xl hover:border-accent/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all"
              >
                <FileText className="w-10 h-10 text-accent mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-light mb-2 group-hover:text-accent transition-colors">
                  KUCCPS FAQ
                </h3>
                <p className="text-sm text-dim leading-relaxed">
                  Get answers to <span className="text-accent hover:underline">frequently asked questions</span> about KUCCPS application, cluster points, and course selection.
                </p>
              </motion.a>

              {/* Video Tutorials Link */}
              <motion.a
                href="/student-tools"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -5 }}
                className="group p-6 bg-surface border border-white/10 rounded-xl hover:border-accent/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all"
              >
                <ClipboardCheck className="w-10 h-10 text-accent mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-light mb-2 group-hover:text-accent transition-colors">
                  Video Tutorials
                </h3>
                <p className="text-sm text-dim leading-relaxed">
                  Watch <span className="text-accent hover:underline">step-by-step video guides</span> on how to apply for KUCCPS, check results, and navigate student services.
                </p>
              </motion.a>

              {/* Learn Skills Link */}
              <motion.a
                href="/learn-skills"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -5 }}
                className="group p-6 bg-surface border border-white/10 rounded-xl hover:border-green-500/30 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)] transition-all"
              >
                <Award className="w-10 h-10 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-light mb-2 group-hover:text-green-400 transition-colors">
                  Learn Digital Skills
                </h3>
                <p className="text-sm text-dim leading-relaxed">
                  <span className="text-green-400 hover:underline">Learn high-income digital skills for free</span> while waiting for KUCCPS placement. Master web development, design, and more.
                </p>
              </motion.a>

              {/* Buy Data Link */}
              <motion.a
                href="/buy-data"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -5 }}
                className="group p-6 bg-surface border border-white/10 rounded-xl hover:border-green-500/30 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)] transition-all"
              >
                <Database className="w-10 h-10 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-light mb-2 group-hover:text-green-400 transition-colors">
                  Affordable Data Bundles
                </h3>
                <p className="text-sm text-dim leading-relaxed">
                  <span className="text-green-400 hover:underline">Get affordable student data bundles</span> to access KUCCPS portal and check your results anytime.
                </p>
              </motion.a>
            </div>
          </div>
        </section>
      </div>

      {/* Testimonials Section */}
      <section className="py-20 bg-base overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl md:text-5xl font-bold text-light">What Students Say</h2>
            <p className="mx-auto max-w-2xl text-lg text-light">
              Hear from thousands of students who have successfully used our course checker
            </p>
          </motion.div>

          <TestimonialCarousel />
        </div>
      </section>

      <Footer showOnHomepage={true} />
    </div>
  )
}
