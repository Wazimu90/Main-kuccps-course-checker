"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Star, Quote, ChevronLeft, ChevronRight, GraduationCap } from "lucide-react"

const testimonials = [
  {
    name: "David Kamau",
    title: "Bsc Engineering Student",
    message:
      "This tool saved me so much time! I was able to find courses I didn't even know I qualified for. The results were accurate and helped me make informed decisions about my future.",
    grade: "B+",
    rating: 5,
  },
  {
    name: "Faith Wanjiku",
    title: "Bsc Medicine Student",
    message:
      "The course checker helped me discover my options after KCSE. The process was simple, fast, and the PDF report was very detailed. Highly recommend to all students!",
    grade: "A",
    rating: 5,
  },
  {
    name: "Grace Akinyi",
    title: "Diploma in Education Science",
    message:
      "Amazing platform! It showed me courses I never considered before. The AI Assistant saved me from making wrong choices.",
    grade: "C+",
    rating: 5,
  },
  {
    name: "Kevin Njoroge",
    title: "Certificate in Electrical Engineering",
    message:
      "I’ve never seen a tool this accurate and fast. It gave me all my eligible courses without stress and helped me avoid making the wrong application.",
    grade: "C-",
    rating: 5,
  },
  {
    name: "Sharon Mwende",
    title: "Bsc in Community Health",
    message:
      "I thought choosing a course would stress me, but this tool made it stupidly simple. Anyone confused should just use it immediately.",
    grade: "B-",
    rating: 5,
  },
]

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }, [])

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
    let interval: number
    if (isAutoPlaying) {
      interval = window.setInterval(nextSlide, 2500)
    }
    return () => clearInterval(interval)
  }, [isAutoPlaying, nextSlide])

  const handleMouseEnter = () => setIsAutoPlaying(false)
  const handleMouseLeave = () => setIsAutoPlaying(true)

  const getCardStyle = (index: number) => {
    const total = testimonials.length
    let diff = (index - currentIndex + total) % total
    if (diff > total / 2) diff -= total

    const isCenter = diff === 0
    const isLeft = diff === -1
    const isRight = diff === 1
    const isVisible = isCenter || isLeft || isRight

    let style: React.CSSProperties = {
      transition: "all 0.6s cubic-bezier(0.25, 1, 0.5, 1)",
      position: "absolute",
      opacity: 0,
      transform: "translateX(0) scale(0.8)",
      zIndex: 0,
      visibility: "hidden",
    }

    if (isVisible) {
      style.visibility = "visible"
      if (isCenter) {
        style.opacity = 1
        style.zIndex = 20
        style.transform = "translateX(0%) scale(1)"
        style.left = "0"
        style.right = "0"
        style.margin = "auto"
      } else if (isLeft) {
        style.opacity = 0.4
        style.zIndex = 10
        style.transform = "translateX(-50%) scale(0.85) perspective(1000px) rotateY(15deg)"
        style.left = "10%"
        if (typeof window !== "undefined" && window.innerWidth < 768) {
          style.opacity = 0
          style.transform = "translateX(-100%) scale(0.5)"
        }
      } else if (isRight) {
        style.opacity = 0.4
        style.zIndex = 10
        style.transform = "translateX(50%) scale(0.85) perspective(1000px) rotateY(-15deg)"
        style.right = "10%"
        if (typeof window !== "undefined" && window.innerWidth < 768) {
          style.opacity = 0
          style.transform = "translateX(100%) scale(0.5)"
        }
      }
    }

    return style
  }

  return (
    <section
      className="py-20 relative overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-text-light to-dim mb-4">
            Success Stories
          </h2>
          <div className="w-20 h-1 bg-accent/30 mx-auto rounded-full" />
        </div>

        <div className="relative h-[450px] md:h-[400px] w-full max-w-4xl mx-auto" style={{ perspective: "1000px" }}>
          {testimonials.map((item, index) => {
            const styles = getCardStyle(index)
            return (
              <div key={index} className="w-full md:w-[600px] absolute top-0" style={styles}>
                <div className="bg-surface/60 backdrop-blur-xl border border-dim/20 p-8 md:p-10 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] h-full flex flex-col relative group hover:border-accent/30 transition-colors duration-300">
                  <div className="absolute top-6 right-8 text-accent/10 group-hover:text-accent/20 transition-colors duration-300">
                    <Quote size={80} fill="currentColor" />
                  </div>

                  <div className="flex gap-1 mb-6">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} size={16} className="text-yellow-500" fill="currentColor" />
                    ))}
                  </div>

                  <blockquote className="text-lg md:text-xl text-dim group-hover:text-text-light transition-colors duration-300 leading-relaxed italic mb-8 flex-grow">
                    "{item.message}"
                  </blockquote>

                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-success flex items-center justify-center shadow-lg shadow-accent/20 text-base font-bold text-surface shrink-0">
                      {item.grade}
                    </div>

                    <div className="flex-grow">
                      <h3 className="text-text-light font-bold text-lg">{item.name}</h3>
                      <p className="text-accent-soft text-sm">{item.title}</p>
                    </div>

                    <div className="hidden md:flex flex-col items-end text-right">
                      <span className="text-[10px] uppercase tracking-widest text-dim font-bold">Grade</span>
                      <span className="text-dim/80 text-sm font-mono flex items-center gap-1">
                        <GraduationCap size={14} /> {item.grade}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          <button
            onClick={prevSlide}
            aria-label="Previous testimonial"
            className="absolute top-1/2 -left-2 md:-left-16 -translate-y-1/2 p-3 rounded-full bg-surface border border-dim/30 text-dim hover:text-accent hover:border-accent/50 transition-all duration-300 z-30 group"
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next testimonial"
            className="absolute top-1/2 -right-2 md:-right-16 -translate-y-1/2 p-3 rounded-full bg-surface border border-dim/30 text-dim hover:text-accent hover:border-accent/50 transition-all duration-300 z-30 group"
          >
            <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-8 md:mt-4">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex
                ? "w-8 bg-accent shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                : "w-2 bg-dim/30 hover:bg-dim/60"
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
