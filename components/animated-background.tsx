"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

export default function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const { clientX, clientY } = e
      const { width, height, left, top } = containerRef.current.getBoundingClientRect()

      const x = (clientX - left) / width
      const y = (clientY - top) / height

      containerRef.current.style.setProperty("--mouse-x", `${x}`)
      containerRef.current.style.setProperty("--mouse-y", `${y}`)
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden -z-10 h-[150vh]"
      style={
        {
          "--mouse-x": "0.5",
          "--mouse-y": "0.5",
        } as React.CSSProperties
      }
    >
      <motion.div
        className="absolute inset-0 animated-gradient opacity-40 dark:opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 0.4, 0.35, 0.4] }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />

      <motion.div
        className="absolute rounded-full bg-pink-500/30 dark:bg-pink-500/40 blur-3xl"
        style={{
          width: "40%",
          height: "40%",
          left: "calc(var(--mouse-x) * 100% - 20%)",
          top: "calc(var(--mouse-y) * 100% - 20%)",
          transform: "translate(-50%, -50%)",
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />

      <motion.div
        className="absolute rounded-full bg-purple-500/30 dark:bg-purple-500/40 blur-3xl"
        style={{
          width: "30%",
          height: "30%",
          left: "calc((1 - var(--mouse-x)) * 100% - 15%)",
          top: "calc((1 - var(--mouse-y)) * 100% - 15%)",
          transform: "translate(-30%, -30%)",
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 5,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          delay: 1,
        }}
      />
    </div>
  )
}
