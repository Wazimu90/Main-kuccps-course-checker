"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"

interface Testimonial {
  name: string
  title: string
  message: string
  initial: string
  rating: number
}

const testimonials: Testimonial[] = [
  {
    name: "David Kamau",
    title: "Engineering Student",
    message:
      "This tool saved me so much time! I was able to find courses I didn't even know I qualified for. The results were accurate and helped me make informed decisions about my future.",
    initial: "D",
    rating: 5,
  },
  {
    name: "Faith Wanjiku",
    title: "Medicine Student",
    message:
      "The course checker helped me discover my options after KCSE. The process was simple, fast, and the PDF report was very detailed. Highly recommend to all students!",
    initial: "F",
    rating: 5,
  },
  {
    name: "Grace Akinyi",
    title: "Education Student",
    message:
      "Amazing platform! It showed me courses I never considered before. The cluster point calculations were spot on and saved me from making wrong choices.",
    initial: "G",
    rating: 5,
  },
]

export default function TestimonialCarousel() {
  return (
    <div className="relative w-full max-w-6xl mx-auto px-4">
      <div className="relative overflow-hidden">
        <div
          className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="flex-none w-80 md:w-96 snap-center"
            >
              <div className="relative">
                <div className="rounded-3xl bg-card/90 backdrop-blur-sm p-8 shadow-2xl border border-white/10 hover:shadow-3xl hover:scale-105 transition-all duration-500">
                  {/* Glowing border effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 blur-xl -z-10"></div>

                  {/* Rating stars */}
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  {/* Message */}
                  <p className="text-center text-white/90 leading-relaxed mb-6 italic text-lg">
                    "{testimonial.message}"
                  </p>

                  {/* Profile */}
                  <div className="flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                      {testimonial.initial}
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-white text-lg">{testimonial.name}</p>
                      <p className="text-white/70 text-sm">{testimonial.title}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="flex justify-center mt-6">
          <p className="text-white/60 text-sm">← Scroll to see more testimonials →</p>
        </div>
      </div>
    </div>
  )
}
