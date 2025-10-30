"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Menu, X, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const navItems = [
    { name: "Courses", href: "/#courses" },
    { name: "News", href: "/news" },
    { name: "Buy Data", href: "/#buy-data" },
    { name: "Learn a skill", href: "/#learn-skill" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/20 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-white">KUCCPS Checker</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                {item.name}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Right side - Theme toggle and mobile menu */}
        <div className="flex items-center space-x-2">
          <ModeToggle />

          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden border-t border-white/10 bg-black/40 backdrop-blur-md"
        >
          <nav className="container mx-auto px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
                >
                  {item.name}
                </Button>
              </Link>
            ))}
          </nav>
        </motion.div>
      )}
    </header>
  )
}
