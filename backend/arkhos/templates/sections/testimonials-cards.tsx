"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Testimonial {
  name: string
  role: string
  stars: number
  avatar: string
  content: string
}

const defaultTestimonials: Testimonial[] = [
  {
    name: "Marie Dubois",
    role: "Product Designer",
    stars: 5,
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    content:
      "An incredible experience from start to finish. The attention to detail and quality of work exceeded all expectations.",
  },
  {
    name: "Thomas Laurent",
    role: "Frontend Developer",
    stars: 4,
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    content:
      "The flexibility to customize every aspect is amazing. It has transformed the way I develop web applications.",
  },
  {
    name: "Sophie Martin",
    role: "Marketing Director",
    stars: 5,
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    content:
      "The extensive collection of components has significantly accelerated our workflow and improved our results.",
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function TestimonialsCards({
  heading = "Loved by the Community",
  subtitle = "See what our customers have to say about their experience.",
  testimonials = defaultTestimonials,
}: {
  heading?: string
  subtitle?: string
  testimonials?: Testimonial[]
}) {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto w-full max-w-5xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-foreground">{heading}</h2>
          <p className="text-muted-foreground mt-4">{subtitle}</p>
        </div>

        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-card rounded-2xl border border-border p-5 shadow-sm"
            >
              <div className="flex gap-1" aria-label={`${t.stars} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "size-4",
                      i < t.stars
                        ? "fill-primary stroke-primary"
                        : "fill-muted stroke-transparent"
                    )}
                  />
                ))}
              </div>

              <p className="text-foreground my-4 text-sm leading-relaxed">
                "{t.content}"
              </p>

              <div className="flex items-center gap-2">
                <Avatar className="size-8 border shadow-sm">
                  <AvatarImage src={t.avatar} alt={t.name} />
                  <AvatarFallback>{t.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-foreground text-sm font-medium">{t.name}</div>
                <span aria-hidden className="bg-muted-foreground/25 size-1 rounded-full" />
                <span className="text-muted-foreground text-sm">{t.role}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
