"use client"

import React from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PricingTier {
  name: string
  price: string
  period?: string
  description: string
  features: string[]
  ctaText: string
  highlighted?: boolean
}

interface Pricing3ColProps {
  heading?: string
  subtitle?: string
  tiers?: PricingTier[]
}

const defaultTiers: PricingTier[] = [
  {
    name: "Free",
    price: "0",
    period: "/month",
    description: "Perfect for trying things out and personal projects.",
    features: [
      "Up to 3 projects",
      "Basic analytics",
      "Community support",
      "1 GB storage",
    ],
    ctaText: "Get Started",
  },
  {
    name: "Pro",
    price: "29",
    period: "/month",
    description: "Everything you need for a growing business.",
    features: [
      "Unlimited projects",
      "Advanced analytics",
      "Priority support",
      "100 GB storage",
      "Custom domain",
      "Team collaboration",
    ],
    ctaText: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "99",
    period: "/month",
    description: "Dedicated support and infrastructure for your team.",
    features: [
      "Everything in Pro",
      "Unlimited storage",
      "24/7 phone support",
      "Custom integrations",
      "SLA guarantee",
      "Dedicated account manager",
    ],
    ctaText: "Contact Sales",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function Pricing3Col({
  heading = "Simple, transparent pricing",
  subtitle = "Choose the plan that fits your needs. No hidden fees, cancel anytime.",
  tiers = defaultTiers,
}: Pricing3ColProps) {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            {heading}
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {tiers.map((tier, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={cn(
                "relative flex flex-col rounded-2xl border p-6 md:p-8 bg-card",
                tier.highlighted
                  ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]"
                  : "border-border"
              )}
            >
              {tier.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {tier.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tier.description}
                </p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold tracking-tight text-foreground">
                  &euro;{tier.price}
                </span>
                {tier.period && (
                  <span className="text-sm text-muted-foreground">
                    {tier.period}
                  </span>
                )}
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={tier.highlighted ? "default" : "outline"}
              >
                {tier.ctaText}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
