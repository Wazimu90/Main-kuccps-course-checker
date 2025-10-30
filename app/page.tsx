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
  ArrowRight,
  Users,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import CourseCategoryCard from "@/components/course-category-card"
import TestimonialCarousel from "@/components/testimonial-carousel"
import AnimatedBackground from "@/components/animated-background"
import Footer from "@/components/footer"
import TextType from "@/components/ui/text-type"

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
      href: "/input/degree",
      colorScheme: "purple",
    },
    {
      title: "Diploma",
      description: "Diploma courses from colleges and polytechnics",
      icon: Award,
      href: "/input/diploma",
      colorScheme: "blue",
    },
    {
      title: "Certificate",
      description: "Certificate programs for specialized skills",
      icon: BookOpen,
      href: "/input/certificate",
      colorScheme: "green",
    },
    {
      title: "KMTC",
      description: "Kenya Medical Training College courses",
      icon: Stethoscope,
      href: "/input/kmtc",
      colorScheme: "orange",
    },
    {
      title: "Artisan",
      description: "Hands-on technical and vocational courses",
      icon: Hammer,
      href: "/input/artisan",
      colorScheme: "pink",
    },
    {
      title: "Short Courses",
      description: "Learn a skill & improve your personal development.",
      icon: Briefcase,
      href: "#",
      onClick: showComingSoon,
      colorScheme: "indigo",
    },
    {
      title: "Buy Data",
      description: "Purchase Safaricom Bundles even with Okoa Jahazi",
      icon: Database,
      href: "#",
      onClick: showComingSoon,
      colorScheme: "teal",
    },
  ]

  const howItWorksSteps = [
    {
      step: 1,
      title: "Select Course Category",
      description: "Choose the type of course you're interested in from our comprehensive categories",
      icon: Search,
    },
    {
      step: 2,
      title: "Enter Your Grades",
      description: "Input your KCSE grades and subject cluster points accurately for precise results",
      icon: ClipboardCheck,
    },
    {
      step: 3,
      title: "View & Download Results",
      description: "Get a complete list of courses you qualify for with downloadable PDF report",
      icon: FileText,
    },
  ]

  return (
    <>
      <AnimatedBackground />

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
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-6 inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
              >
                <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                <span className="text-sm font-medium text-white/90">Official KUCCPS Data • Accurate Results</span>
              </motion.div>

              <h1 className="mb-6 text-4xl md:text-6xl lg:text-7xl font-bold leading-tight min-h-[200px] md:min-h-[300px]">
                <TextType
                  text={["I have my KCSE results. Now what exactly do I qualify for?", "Check Which KUCCPS Courses You Qualify For Based on Your KCSE Grades", "Your future is yours. We just make it clearer."]}
                  typingSpeed={75}
                  pauseDuration={1500}
                  showCursor={true}
                  cursorCharacter="|"
                  className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
                  textColors={["#ffffff", "#e879f9", "#f0abfc"]}
                  startOnVisible={true}
                  loop={true}
                />
              </h1>

              <p className="mb-8 text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                We use official KUCCPS data and cluster formulas to show you exactly which courses match your KCSE
                grades. Get instant, accurate results in seconds.
              </p>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="rounded-full px-8 py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 group"
                  onClick={scrollToCategories}
                >
                  Check Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/70"
              >
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-green-400" />
                  <span>10,000+ Students Helped</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-2 text-yellow-400" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-blue-400" />
                  <span>99% Accuracy</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Extended Gradient Background Section */}
      <div className="relative bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900">
        {/* Course Categories Section */}
        <section className="py-20" ref={courseCategoriesRef}>
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 text-3xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Explore Course Categories
                </span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-white/80">
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
                  onClick={category.onClick}
                  delay={index}
                  colorScheme={category.colorScheme}
                />
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 text-3xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-white via-blue-200 to-green-200 bg-clip-text text-transparent">
                  How It Works
                </span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-white/80">
                Find your perfect course match in just three simple steps
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {howItWorksSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group"
                >
                  <div className="relative h-full rounded-2xl bg-white/10 backdrop-blur-sm p-8 shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-300">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <step.icon className="h-8 w-8" />
                    </div>
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-md">
                      {step.step}
                    </div>
                    <h3 className="mb-4 text-xl font-bold text-white">{step.title}</h3>
                    <p className="text-white/80 leading-relaxed">{step.description}</p>
                    <div className="mt-6 h-1 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-20 transition-all duration-300"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-white via-green-200 to-blue-200 bg-clip-text text-transparent">
                What Students Say
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-white/80">
              Hear from thousands of students who have successfully used our course checker
            </p>
          </motion.div>

          <TestimonialCarousel />
        </div>
      </section>

      {/* Footer - Only shown on homepage */}
      <Footer showOnHomepage={true} />
    </>
  )
}
