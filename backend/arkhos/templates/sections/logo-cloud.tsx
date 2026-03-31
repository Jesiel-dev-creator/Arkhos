"use client"

import React from "react"
import { motion } from "framer-motion"

interface LogoCloudProps {
  heading?: string
  companies?: string[]
}

const defaultCompanies = [
  "Acme Corp",
  "Globex",
  "Initech",
  "Umbrella",
  "Cyberdyne",
  "Weyland",
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function LogoCloud({
  heading = "Trusted by industry leaders",
  companies = defaultCompanies,
}: LogoCloudProps) {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="mx-auto w-full max-w-5xl px-6">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-sm font-medium uppercase tracking-widest text-muted-foreground mb-10"
        >
          {heading}
        </motion.p>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {companies.map((name, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="flex items-center justify-center grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all duration-300"
            >
              <span className="text-lg md:text-xl font-bold tracking-tight text-foreground select-none">
                {name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
