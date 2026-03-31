"use client"

import React from "react"
import { motion } from "framer-motion"

interface Stat {
  value: string
  label: string
}

interface AboutSplitProps {
  heading?: string
  paragraph1?: string
  paragraph2?: string
  imageSrc?: string
  imageAlt?: string
  stats?: Stat[]
}

const defaultStats: Stat[] = [
  { value: "10K+", label: "Customers" },
  { value: "99.9%", label: "Uptime" },
  { value: "50+", label: "Countries" },
]

export default function AboutSplit({
  heading = "Our Story",
  paragraph1 = "Founded in 2020, we set out to build tools that empower teams to create extraordinary digital experiences. What started as a small idea has grown into a platform trusted by thousands.",
  paragraph2 = "We believe in transparency, quality craftsmanship, and putting our users first. Every feature we build is guided by real feedback from the people who use our product every day.",
  imageSrc = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop",
  imageAlt = "Team collaborating",
  stats = defaultStats,
}: AboutSplitProps) {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Image — left 45% */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5"
          >
            <div className="overflow-hidden rounded-2xl shadow-xl">
              <img
                src={imageSrc}
                alt={imageAlt}
                crossOrigin="anonymous"
                className="h-auto w-full object-cover aspect-[4/5]"
              />
            </div>
          </motion.div>

          {/* Content — right 55% */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="lg:col-span-7 space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              {heading}
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              {paragraph1}
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              {paragraph2}
            </p>

            {stats && stats.length > 0 && (
              <div className="grid grid-cols-3 gap-6 pt-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <p className="text-2xl md:text-3xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
