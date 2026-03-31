"use client"

import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface FeatureRow {
  title: string
  description: string
  imageUrl: string
  imageAlt: string
}

const defaultFeatures: FeatureRow[] = [
  {
    title: "Blocks built with Shadcn & Tailwind",
    description:
      "Hundreds of finely crafted components built with React, Tailwind and Shadcn UI. Developers can copy and paste these blocks directly into their project.",
    imageUrl:
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop",
    imageAlt: "Feature preview",
  },
  {
    title: "Designed for developer experience",
    description:
      "From design elements to functionality, you have complete control to create a unique and personalized experience for your users.",
    imageUrl:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop",
    imageAlt: "Feature preview",
  },
  {
    title: "Scale with confidence",
    description:
      "Built on modern infrastructure with enterprise-grade security. Deploy globally and scale automatically as your business grows.",
    imageUrl:
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&auto=format&fit=crop",
    imageAlt: "Feature preview",
  },
]

const itemVariants = {
  hidden: (isLeft: boolean) => ({
    opacity: 0,
    x: isLeft ? -40 : 40,
  }),
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function FeaturesAlternating({
  features = defaultFeatures,
}: {
  features?: FeatureRow[]
}) {
  return (
    <section className="py-16 md:py-32 bg-background">
      <div className="container mx-auto max-w-6xl px-6 space-y-24">
        {features.map((feature, index) => {
          const isReversed = index % 2 === 1
          return (
            <div
              key={index}
              className={`grid items-center gap-8 md:gap-16 lg:grid-cols-2 ${
                isReversed ? "" : ""
              }`}
            >
              <motion.div
                className={`flex flex-col items-center text-center lg:items-start lg:text-left ${
                  isReversed ? "lg:order-2" : ""
                }`}
                custom={!isReversed}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                <h2 className="text-3xl font-semibold text-balance text-foreground lg:text-4xl">
                  {feature.title}
                </h2>
                <p className="mt-4 mb-8 max-w-xl text-muted-foreground lg:text-lg">
                  {feature.description}
                </p>
                <div className="flex w-full flex-col justify-center gap-2 sm:flex-row lg:justify-start">
                  <Button>Learn More</Button>
                  <Button variant="outline">View Details</Button>
                </div>
              </motion.div>

              <motion.div
                className={isReversed ? "lg:order-1" : ""}
                custom={isReversed}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                <img
                  src={feature.imageUrl}
                  alt={feature.imageAlt}
                  crossOrigin="anonymous"
                  className="max-h-96 w-full rounded-xl object-cover shadow-lg"
                />
              </motion.div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
