"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SplitHeroSectionProps {
  heading?: string
  subtitle?: string
  ctaText?: string
  imageUrl?: string
  onCtaClick?: () => void
}

export default function SplitHeroSection({
  heading = "Build Amazing Products Faster",
  subtitle = "Create stunning web applications with our modern component library. Designed for developers who care about quality and speed.",
  ctaText = "Get Started",
  imageUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
  onCtaClick = () => {},
}: SplitHeroSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: "blur(8px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 0.8,
      },
    },
  }

  const imageVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        bounce: 0.2,
        duration: 1,
        delay: 0.4,
      },
    },
  }

  return (
    <section className="min-h-screen w-full bg-background">
      <div className="container mx-auto px-6 py-12 lg:py-0">
        <div className="grid min-h-screen grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col justify-center space-y-8"
          >
            <motion.h1
              variants={itemVariants}
              className="text-balance text-5xl font-bold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl"
            >
              {heading}
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="max-w-xl text-pretty text-lg text-muted-foreground md:text-xl"
            >
              {subtitle}
            </motion.p>

            <motion.div variants={itemVariants}>
              <Button
                size="lg"
                onClick={onCtaClick}
                className="group relative overflow-hidden text-base"
              >
                <span className="mr-8 transition-opacity duration-500 group-hover:opacity-0">
                  {ctaText}
                </span>
                <i className="absolute right-1 top-1 bottom-1 rounded-sm z-10 grid w-1/4 place-items-center transition-all duration-500 bg-primary-foreground/15 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95">
                  <ChevronRight size={18} strokeWidth={2} aria-hidden="true" />
                </i>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            className="relative h-[400px] w-full lg:h-[600px]"
          >
            <div className="relative h-full w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-2xl">
              <img
                src={imageUrl}
                alt="Hero"
                crossOrigin="anonymous"
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
