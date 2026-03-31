"use client"

import React from "react"
import { motion } from "framer-motion"

interface StatItem {
  value: string
  label: string
}

interface StatsRowProps {
  stats?: StatItem[]
}

const defaultStats: StatItem[] = [
  { value: "10K+", label: "Active Users" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "150+", label: "Countries" },
  { value: "4.9/5", label: "Customer Rating" },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
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

export default function StatsRow({ stats = defaultStats }: StatsRowProps) {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="mx-auto w-full max-w-5xl px-6">
        <motion.div
          className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="text-center"
            >
              <p className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
