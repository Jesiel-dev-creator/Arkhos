"use client"

import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface FrenchBakeryHeroProps {
  heading?: string
  subtitle?: string
  primaryButtonText?: string
  secondaryButtonText?: string
  backgroundImage?: string
  onPrimaryClick?: () => void
  onSecondaryClick?: () => void
}

export default function FrenchBakeryHero({
  heading = "Artisan Boulangerie Française",
  subtitle = "Savourez l'authenticité de nos pains et pâtisseries artisanales, préparés chaque jour avec passion et tradition",
  primaryButtonText = "Découvrir nos produits",
  secondaryButtonText = "Nous contacter",
  backgroundImage = "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2072&auto=format&fit=crop",
  onPrimaryClick = () => {},
  onSecondaryClick = () => {},
}: FrenchBakeryHeroProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.2,
      },
    },
  }

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Full-bleed background image with dark overlay */}
      <div className="absolute inset-0 w-full h-full">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
        />
        <div className="absolute inset-0 w-full h-full bg-black/60" />
      </div>

      {/* Content container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32"
      >
        <div className="flex flex-col items-center justify-center text-center space-y-6 md:space-y-8">
          {/* Main heading */}
          <motion.h1
            variants={fadeUpVariants}
            className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-tight tracking-tight max-w-5xl"
          >
            {heading}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUpVariants}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 font-light leading-relaxed max-w-3xl px-4"
          >
            {subtitle}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeUpVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-4 md:pt-8 w-full sm:w-auto px-4"
          >
            <motion.div variants={buttonVariants} className="w-full sm:w-auto">
              <Button
                onClick={onPrimaryClick}
                size="lg"
                className="w-full sm:w-auto bg-white text-black hover:bg-white/90 font-semibold text-base md:text-lg px-8 md:px-12 py-6 md:py-7 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-white/20"
              >
                {primaryButtonText}
              </Button>
            </motion.div>

            <motion.div variants={buttonVariants} className="w-full sm:w-auto">
              <Button
                onClick={onSecondaryClick}
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white hover:text-black font-semibold text-base md:text-lg px-8 md:px-12 py-6 md:py-7 rounded-full shadow-2xl transition-all duration-300 hover:scale-105"
              >
                {secondaryButtonText}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Decorative gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
    </section>
  )
}
