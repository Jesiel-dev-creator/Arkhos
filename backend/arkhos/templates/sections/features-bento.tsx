"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  TrendingUp,
  CheckCircle,
  Globe,
  Zap,
  Shield,
  Star,
} from "lucide-react"

export interface BentoItem {
  title: string
  description: string
  icon: React.ReactNode
  status?: string
  tags?: string[]
  meta?: string
  colSpan?: number
  hasPersistentHover?: boolean
}

const defaultItems: BentoItem[] = [
  {
    title: "Analytics Dashboard",
    meta: "v2.4.1",
    description: "Real-time metrics with AI-powered insights and predictive analytics",
    icon: <TrendingUp className="w-4 h-4 text-primary" />,
    status: "Live",
    tags: ["Statistics", "Reports", "AI"],
    colSpan: 2,
    hasPersistentHover: true,
  },
  {
    title: "Task Manager",
    meta: "84 completed",
    description: "Automated workflow management with priority scheduling",
    icon: <CheckCircle className="w-4 h-4 text-primary" />,
    status: "Updated",
    tags: ["Productivity", "Automation"],
  },
  {
    title: "Global Network",
    meta: "6 regions",
    description: "Multi-region deployment with edge computing capabilities",
    icon: <Globe className="w-4 h-4 text-primary" />,
    status: "Beta",
    tags: ["Infrastructure", "Edge"],
    colSpan: 2,
  },
  {
    title: "Security Suite",
    meta: "Enterprise",
    description: "End-to-end encryption with zero-trust architecture",
    icon: <Shield className="w-4 h-4 text-primary" />,
    tags: ["Security", "Compliance"],
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function FeaturesBento({ items = defaultItems }: { items?: BentoItem[] }) {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {items.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={cn(
                "group relative p-5 rounded-xl overflow-hidden transition-all duration-300",
                "border border-border bg-card",
                "hover:shadow-lg hover:-translate-y-0.5 will-change-transform",
                item.colSpan === 2 ? "md:col-span-2" : "col-span-1",
                item.hasPersistentHover && "shadow-md -translate-y-0.5"
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 transition-opacity duration-300",
                  item.hasPersistentHover ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[length:4px_4px]" />
              </div>

              <div className="relative flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10 group-hover:bg-primary/15 transition-all duration-300">
                    {item.icon}
                  </div>
                  {item.status && (
                    <span className="text-xs font-medium px-2 py-1 rounded-lg bg-muted text-muted-foreground transition-colors duration-300">
                      {item.status}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-card-foreground tracking-tight text-[15px]">
                    {item.title}
                    {item.meta && (
                      <span className="ml-2 text-xs text-muted-foreground font-normal">
                        {item.meta}
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-snug">
                    {item.description}
                  </p>
                </div>

                {item.tags && (
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    {item.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-md bg-muted transition-all duration-200 hover:bg-muted/80"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
