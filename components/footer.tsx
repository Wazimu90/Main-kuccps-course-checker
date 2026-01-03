"use client"

import React, { useState, useRef, useEffect } from "react"
import {
  Phone,
  Mail,
  MessageCircle,
  ChevronUp,
  X,
  ExternalLink,
  Shield,
  FileText,
  HelpCircle,
  MessageSquare,
} from "lucide-react"

interface FooterProps {
  showOnHomepage?: boolean
}

export default function Footer({ showOnHomepage = false }: FooterProps) {
  if (!showOnHomepage) return null

  const [isContactOpen, setIsContactOpen] = useState(false)
  const [contacts, setContacts] = useState({
    phone: "+254 700 000 000",
    whatsapp: "+254 700 000 000",
    email: "info@kuccpschecker.com"
  })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings")
        if (res.ok) {
          const { settings } = await res.json()
          setContacts({
            phone: String(settings.contact_phone || "+254 700 000 000"),
            whatsapp: String(settings.whatsapp_number || settings.contact_phone || "+254 700 000 000"),
            email: String(settings.contact_email || "info@kuccpschecker.com")
          })
        }
      } catch (e) {
        console.error("Failed to load footer contacts", e)
      }
    }
    fetchSettings()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsContactOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleContact = () => setIsContactOpen((o) => !o)

  return (
    <div className="relative left-0 right-0 z-50 flex justify-center px-2 md:px-4">
      <nav
        ref={containerRef}
        className="pointer-events-auto relative flex items-center bg-surface border border-dim/30 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] backdrop-blur-xl rounded-full pl-4 pr-2 py-2 md:pl-8 md:pr-2 md:py-3 transition-all duration-500 ease-out hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:border-accent/40"
        style={{ borderRadius: "9999px" }}
      >
        <div className="flex items-center gap-3 md:gap-8 pr-3 md:pr-8 border-r border-dim/30 mr-1 md:mr-2">
          <FooterLink href="/privacy-policy" label="Privacy Policy" mobileLabel="Privacy" icon={<Shield size={14} />} />
          <FooterLink href="/terms" label="Terms of Service" mobileLabel="Terms" icon={<FileText size={14} />} />
          <FooterLink href="/faq" label="FAQs" mobileLabel="FAQs" icon={<HelpCircle size={14} />} />
        </div>

        <div className="relative">
          <div
            className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-6 flex flex-col gap-3 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-bottom ${
              isContactOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-75 translate-y-4 pointer-events-none"
            }`}
          >
            <ContactOption
              icon={<Phone size={18} />}
              label="Call Us"
              value={contacts.phone}
              href={`tel:${contacts.phone.replace(/\s+/g, "")}`}
              color="text-accent"
              delay={100}
            />
            <ContactOption
              icon={<MessageCircle size={18} />}
              label="WhatsApp"
              value={contacts.whatsapp}
              href={`https://wa.me/${contacts.whatsapp.replace(/\D/g, "")}`}
              color="text-success"
              delay={50}
            />
            <ContactOption
              icon={<Mail size={18} />}
              label="Email Us"
              value={contacts.email}
              href={`mailto:${contacts.email}`}
              color="text-text-light"
              delay={0}
            />
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-[1px] h-6 bg-gradient-to-b from-dim/50 to-transparent -z-10" />
          </div>

          <button
            onClick={toggleContact}
            className={`relative group flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${
              isContactOpen
                ? "bg-accent text-base shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                : "bg-dim/20 text-text-light hover:bg-dim/40 hover:text-white"
            }`}
          >
            <span className="relative z-10 md:hidden">
              <MessageSquare size={16} />
            </span>
            <span className="relative z-10 hidden md:inline">Contact</span>
            <div className={`transition-transform duration-300 ${isContactOpen ? "rotate-180" : "rotate-0"}`}>
              {isContactOpen ? <X size={16} /> : <ChevronUp size={16} />}
            </div>
          </button>
        </div>
      </nav>
    </div>
  )
}

interface FooterLinkProps {
  href: string
  label: string
  mobileLabel: string
  icon: React.ReactNode
}

function FooterLink({ href, label, mobileLabel, icon }: FooterLinkProps) {
  return (
    <a href={href} className="group flex items-center gap-2 text-xs md:text-sm font-medium text-dim hover:text-accent transition-colors duration-300">
      <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hidden md:block">
        {icon}
      </span>
      <span className="relative whitespace-nowrap">
        <span className="md:hidden">{mobileLabel}</span>
        <span className="hidden md:inline">{label}</span>
        <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent transition-all duration-300 group-hover:w-full" />
      </span>
    </a>
  )
}

interface ContactOptionProps {
  icon: React.ReactNode
  label: string
  value: string
  href: string
  color: string
  delay: number
}

function ContactOption({ icon, label, value, href, color, delay }: ContactOptionProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center md:justify-start gap-0 md:gap-3 p-2 md:p-3 bg-surface border border-dim/40 rounded-full md:rounded-2xl shadow-xl hover:scale-110 md:hover:scale-105 hover:border-accent/50 hover:bg-base transition-all duration-300 group min-w-0 md:min-w-[200px]"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`p-2 md:p-2.5 rounded-full md:rounded-xl bg-base border border-dim/30 ${color} group-hover:shadow-[0_0_10px_rgba(34,211,238,0.2)] transition-shadow duration-300`}>
        {icon}
      </div>
      <div className="hidden md:flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-dim font-bold">{label}</span>
        <span className="text-xs font-medium text-text-light max-w-[150px] truncate" title={value}>
          {value}
        </span>
      </div>
      <ExternalLink size={12} className="ml-auto text-dim opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block" />
    </a>
  )
}
