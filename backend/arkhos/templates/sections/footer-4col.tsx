"use client"

import React from "react"
import { motion } from "framer-motion"
import { Github, Twitter, Linkedin, Instagram } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface FooterLink {
  label: string
  href: string
}

interface Footer4ColProps {
  logo?: string
  tagline?: string
  productLinks?: FooterLink[]
  legalLinks?: FooterLink[]
  newsletterHeading?: string
  newsletterPlaceholder?: string
  copyrightName?: string
}

const defaultProductLinks: FooterLink[] = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Documentation", href: "#docs" },
  { label: "Changelog", href: "#changelog" },
]

const defaultLegalLinks: FooterLink[] = [
  { label: "Privacy Policy", href: "#privacy" },
  { label: "Terms of Service", href: "#terms" },
  { label: "Cookie Policy", href: "#cookies" },
  { label: "GDPR", href: "#gdpr" },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Instagram, href: "#", label: "Instagram" },
]

export default function Footer4Col({
  logo = "Brand",
  tagline = "Building the future, one pixel at a time. Quality software crafted with care.",
  productLinks = defaultProductLinks,
  legalLinks = defaultLegalLinks,
  newsletterHeading = "Stay updated",
  newsletterPlaceholder = "Enter your email",
  copyrightName = "Brand Inc",
}: Footer4ColProps) {
  return (
    <footer className="bg-card border-t border-border">
      <motion.div
        className="mx-auto w-full max-w-7xl px-6 py-12 md:py-16"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Logo + tagline */}
          <motion.div variants={itemVariants} className="space-y-4">
            <a href="/" className="text-xl font-bold tracking-tight text-foreground">
              {logo}
            </a>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {tagline}
            </p>
          </motion.div>

          {/* Column 2: Product links */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Product</h4>
            <ul className="space-y-3">
              {productLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Legal links */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4: Newsletter */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">
              {newsletterHeading}
            </h4>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for updates and news.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-2"
            >
              <Input
                type="email"
                placeholder={newsletterPlaceholder}
                className="h-9 text-sm"
              />
              <Button size="sm" type="submit">
                Subscribe
              </Button>
            </form>
          </motion.div>
        </div>

        <Separator className="my-8" />

        {/* Bottom bar */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-between gap-4 sm:flex-row"
        >
          <p className="text-xs text-muted-foreground">
            &copy; 2026 {copyrightName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                aria-label={social.label}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </footer>
  )
}
