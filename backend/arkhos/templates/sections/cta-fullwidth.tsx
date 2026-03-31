"use client"

import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface CtaFullwidthProps {
  heading?: string
  subtitle?: string
  primaryButtonText?: string
  secondaryButtonText?: string
  primaryHref?: string
  secondaryHref?: string
  onPrimaryClick?: () => void
  onSecondaryClick?: () => void
}

export default function CtaFullwidth({
  heading = "Ready to get started?",
  subtitle = "Join thousands of teams already building better products. Start your free trial today.",
  primaryButtonText = "Start Free Trial",
  secondaryButtonText = "Learn More",
  primaryHref = "#",
  secondaryHref = "#",
  onPrimaryClick,
  onSecondaryClick,
}: CtaFullwidthProps) {
  return (
    <section className="w-full bg-primary">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-5xl px-6 py-16 md:py-24 text-center"
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-primary-foreground">
          {heading}
        </h2>
        <p className="mt-4 text-base md:text-lg text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            variant="secondary"
            className="w-full sm:w-auto font-semibold px-8"
            asChild
            onClick={onPrimaryClick}
          >
            <a href={primaryHref}>{primaryButtonText}</a>
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="w-full sm:w-auto font-semibold px-8 text-primary-foreground border border-primary-foreground/30 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            asChild
            onClick={onSecondaryClick}
          >
            <a href={secondaryHref}>{secondaryButtonText}</a>
          </Button>
        </div>
      </motion.div>
    </section>
  )
}
