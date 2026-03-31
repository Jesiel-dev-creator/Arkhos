"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Zap, Settings, Sparkles } from "lucide-react"

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
}

const defaultFeatures: Feature[] = [
  {
    icon: <Zap className="size-6 text-primary" />,
    title: "Lightning Fast",
    description:
      "Extensive customization options, allowing you to tailor every aspect to meet your specific needs.",
  },
  {
    icon: <Settings className="size-6 text-primary" />,
    title: "Full Control",
    description:
      "From design elements to functionality, you have complete control to create a unique and personalized experience.",
  },
  {
    icon: <Sparkles className="size-6 text-primary" />,
    title: "AI Powered",
    description:
      "Leverage cutting-edge AI to automate workflows and deliver smarter results with less effort.",
  },
]

const CardDecorator = ({ children }: { children: React.ReactNode }) => (
  <div
    aria-hidden
    className="relative mx-auto size-36 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"
  >
    <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
    <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-t border-l">
      {children}
    </div>
  </div>
)

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function Features3Col({
  heading = "Built to cover your needs",
  subtitle = "Everything you need to build, ship, and scale your product with confidence.",
  features = defaultFeatures,
}: {
  heading?: string
  subtitle?: string
  features?: Feature[]
}) {
  return (
    <section className="bg-muted/50 py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-balance text-4xl font-semibold text-foreground lg:text-5xl">
            {heading}
          </h2>
          <p className="mt-4 text-muted-foreground">{subtitle}</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <Card className="mx-auto mt-8 grid max-w-sm md:max-w-full md:grid-cols-3 md:divide-x divide-y md:divide-y-0 overflow-hidden shadow-sm *:text-center md:mt-16">
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants} className="group">
                <CardHeader className="pb-3">
                  <CardDecorator>{feature.icon}</CardDecorator>
                  <h3 className="mt-6 font-medium text-foreground">
                    {feature.title}
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </motion.div>
            ))}
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
