"use client"

import { Phone, MessageCircle, Mail } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-bold text-white">Contact</h1>

        <div className="space-y-4">
          <a
            href="tel:+254748776354"
            className="block rounded-lg border border-white/20 px-4 py-3 text-white"
          >
            <span className="inline-flex items-center gap-2">
              <Phone className="h-5 w-5" /> Call on +254 748776354
            </span>
          </a>

          <a
            href="https://wa.me/254748776354"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-white/20 px-4 py-3 text-white"
          >
            <span className="inline-flex items-center gap-2">
              <MessageCircle className="h-5 w-5" /> Whatsapp chat on + 2547 48776354
            </span>
          </a>

          <a
            href="mailto:kuccpscoursechecker1@gmail.com"
            className="block rounded-lg border border-white/20 px-4 py-3 text-white"
          >
            <span className="inline-flex items-center gap-2">
              <Mail className="h-5 w-5" /> Email on kuccpscoursechecker1@gmail.com
            </span>
          </a>
        </div>
      </div>
    </div>
  )
}
