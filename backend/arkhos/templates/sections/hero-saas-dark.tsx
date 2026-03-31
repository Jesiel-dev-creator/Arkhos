"use client"

import React from "react"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Zap, Shield, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const DotPattern = () => {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-30">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />
    </div>
  )
}

interface FeaturePill {
  icon: React.ReactNode
  text: string
}

export default function SaaSHeroSection() {
  const featurePills: FeaturePill[] = [
    { icon: <Sparkles className="w-4 h-4" />, text: "AI-Powered" },
    { icon: <Zap className="w-4 h-4" />, text: "Lightning Fast" },
    { icon: <Shield className="w-4 h-4" />, text: "Enterprise Security" },
    { icon: <Rocket className="w-4 h-4" />, text: "Scale Instantly" },
  ]

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
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  const pillVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: 0.8 + i * 0.1,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  }

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-background flex items-center justify-center">
      <DotPattern />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50" />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px]" />

      <motion.div
        className="relative z-10 container mx-auto px-4 py-20 flex flex-col items-center text-center max-w-5xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <Badge
            variant="outline"
            className="border-primary/30 bg-primary/10 text-primary px-4 py-1.5 text-sm font-medium backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5 mr-2 inline-block" />
            Introducing the Future of SaaS
          </Badge>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
        >
          <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
            Build Faster.
          </span>
          <br />
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Scale Smarter.
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-10 max-w-3xl leading-relaxed"
        >
          Transform your workflow with our cutting-edge platform. Built for teams
          who demand excellence and designed for scale.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 mb-16"
        >
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/40"
          >
            Get Started Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="border-2 border-border hover:border-muted-foreground text-foreground hover:bg-muted/50 px-8 py-6 text-lg font-semibold backdrop-blur-sm"
          >
            Watch Demo
          </Button>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center gap-3 md:gap-4"
          variants={containerVariants}
        >
          {featurePills.map((pill, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={pillVariants}
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Badge
                variant="secondary"
                className="bg-card/60 hover:bg-card/80 border border-border text-foreground px-5 py-2.5 text-sm font-medium backdrop-blur-md cursor-default transition-colors"
              >
                {pill.icon}
                <span className="ml-2">{pill.text}</span>
              </Badge>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="mt-16 text-muted-foreground text-sm"
        >
          Trusted by 10,000+ companies worldwide
        </motion.div>
      </motion.div>
    </section>
  )
}
