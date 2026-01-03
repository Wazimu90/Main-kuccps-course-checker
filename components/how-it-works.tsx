"use client"

import React, { useEffect, useRef, useState } from "react"
import { Search, ClipboardCheck, FileText, ArrowRight } from "lucide-react"

const HowItWorks: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  const steps = [
    {
      step: 1,
      title: "Select Course Category",
      description:
        "Choose course category; Degree, Diploma, Certificate, Artisan, KMTC",
      icon: <Search className="w-8 h-8 text-accent" />,
    },
    {
      step: 2,
      title: "Enter Your Grades",
      description:
        "Input your KCSE grades and subject cluster points accurately for precise results",
      icon: <ClipboardCheck className="w-8 h-8 text-success" />,
    },
    {
      step: 3,
      title: "View & Download Results",
      description:
        "Get a complete list of courses you qualify for with downloadable PDF report",
      icon: <FileText className="w-8 h-8 text-accent-soft" />,
    },
  ]

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div
          className={`text-center mb-20 transition-all duration-1000 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-surface border border-dim/30 mb-4">
            <span className="text-accent text-xs font-semibold tracking-wider uppercase">Simple Process</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-text-light to-dim mb-6">
            How It Works
          </h2>
          <p className="text-dim text-lg max-w-2xl mx-auto">
            Our advanced algorithm calculates your eligibility in seconds. Just follow these three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          <div
            className={`hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-dim/20 via-accent/30 to-dim/20 transition-all duration-1000 delay-500 ${
              isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
            }`}
          />

          {steps.map((item, index) => (
            <div
              key={item.step}
              className={`relative group transition-all duration-700 ease-out`}
              style={{
                transitionDelay: `${index * 200}ms`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(40px)",
              }}
            >
              <div className="relative p-8 rounded-3xl bg-surface/40 backdrop-blur-md border border-dim/20 hover:border-accent/30 transition-all duration-500 hover:shadow-[0_0_30px_-5px_rgba(34,211,238,0.1)] hover:-translate-y-2 group-hover:bg-surface/60">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-base border border-dim/30 flex items-center justify-center z-20 group-hover:border-accent/50 group-hover:scale-110 transition-all duration-500 shadow-lg">
                  <span className="text-lg font-bold text-dim group-hover:text-accent transition-colors">{item.step}</span>
                </div>

                <div className="mt-8 text-center flex flex-col items-center">
                  <div
                    className="mb-6 p-4 rounded-2xl bg-base/50 border border-dim/10 group-hover:border-accent/20 transition-all duration-500 animate-float"
                    style={{ animationDelay: `${index * 1.5}s` }}
                  >
                    {item.icon}
                  </div>

                  <h3 className="text-xl font-semibold text-text-light mb-3 group-hover:text-accent-soft transition-colors duration-300">
                    {item.title}
                  </h3>

                  <p className="text-dim text-sm leading-relaxed group-hover:text-dim/80">
                    {item.description}
                  </p>
                </div>

                {index !== steps.length - 1 && (
                  <div className="md:hidden absolute -bottom-12 left-1/2 w-[2px] h-8 bg-dim/20" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks

