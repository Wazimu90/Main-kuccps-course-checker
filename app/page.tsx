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
      description: "Learn a skill & improve your personal development.",
      icon: Briefcase,
      href: "#",
      onClick: showComingSoon,
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
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-6 mt-16 md:mt-0 inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
              >
                <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                <span className="text-sm font-medium text-light">Official KUCCPS Data • Verified Results</span>
              </motion.div>

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
                Powered by official KUCCPS Data | With Intelligent Assistant to help you understand and choose the best Courses. 
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
                  <span>10k+ Students Helped</span>
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
                  onClick={category.onClick}
                  delay={index}
                  colorScheme={category.colorScheme}
                />
              ))}
            </div>
          </div>
        </section>

        <HowItWorks />
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
