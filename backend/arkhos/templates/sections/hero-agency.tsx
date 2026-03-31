"use client"

import React from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CreativeAgencyHero() {
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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  const accentVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.5,
      },
    },
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

      <motion.div
        className="relative z-10 container mx-auto px-6 py-20 lg:py-32"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8">
            <motion.div variants={itemVariants} className="space-y-6">
              <motion.div variants={accentVariants} className="inline-block">
                <span className="text-primary font-medium text-sm tracking-wider uppercase">
                  Creative Studio
                </span>
              </motion.div>

              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold leading-[0.9] tracking-tight text-foreground">
                We craft
                <br />
                <span className="text-primary">bold</span>
                <br />
                experiences
              </h1>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed"
            >
              Transforming ideas into stunning digital realities. We blend
              creativity with strategy to deliver exceptional results.
            </motion.p>

            <motion.div variants={itemVariants}>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-lg rounded-full group transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
              >
                Start Your Project
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </motion.div>
          </div>

          <motion.div className="lg:col-span-5 relative" variants={itemVariants}>
            <div className="relative aspect-square max-w-md mx-auto lg:ml-auto">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl"
                animate={{ rotate: [0, 5, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-8 bg-gradient-to-tr from-primary/30 to-primary/20 rounded-3xl backdrop-blur-sm"
                animate={{ rotate: [0, -5, 0], scale: [1, 1.03, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />
              <div className="absolute inset-16 bg-gradient-to-bl from-primary/40 to-primary/30 rounded-3xl backdrop-blur-md" />
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12"
        >
          {[
            { number: "150+", label: "Projects Delivered" },
            { number: "50+", label: "Happy Clients" },
            { number: "15+", label: "Team Members" },
            { number: "8+", label: "Years Experience" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center lg:text-left"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </div>
  )
}
