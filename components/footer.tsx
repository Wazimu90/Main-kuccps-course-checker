"use client"

import Link from "next/link"
import { Phone, Mail, MessageSquare } from "lucide-react"

interface FooterProps {
  showOnHomepage?: boolean
}

export default function Footer({ showOnHomepage = false }: FooterProps) {
  if (!showOnHomepage) {
    return null
  }

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center space-y-8">
          {/* Contact Icons */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            <a href="tel:0748776354" className="flex flex-col items-center group">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-200">
                <Phone className="h-6 w-6" />
              </div>
            </a>

            <a href="mailto:kuccpscoursechecker1@gmail.com" className="flex flex-col items-center group">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-200">
                <Mail className="h-6 w-6" />
              </div>
            </a>

            <a
              href="https://wa.me/254748776354"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center group"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-200">
                <MessageSquare className="h-6 w-6" />
              </div>
            </a>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/privacy-policy" className="text-white/70 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-white/70 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/faq" className="text-white/70 hover:text-white transition-colors">
              FAQs
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-white/60 text-sm">© 2025 KUCCPS Course Checker. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
