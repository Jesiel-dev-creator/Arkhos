"use client"

import React from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

interface MenuItem {
  name: string
  description: string
  price: string
  image: string
  badge?: string
}

interface MenuGridProps {
  heading?: string
  subtitle?: string
  items?: MenuItem[]
}

const defaultItems: MenuItem[] = [
  {
    name: "Croissant au Beurre",
    description: "Flaky, golden pastry made with premium French butter and layered to perfection.",
    price: "3.50",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4159c26c?q=80&w=600&auto=format&fit=crop",
    badge: "Popular",
  },
  {
    name: "Pain au Chocolat",
    description: "Delicate viennoiserie filled with rich dark chocolate batons.",
    price: "4.00",
    image: "https://images.unsplash.com/photo-1530610476181-d83430b64dcd?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Tarte au Citron",
    description: "Tangy lemon curd on a crisp shortcrust base topped with Italian meringue.",
    price: "6.50",
    image: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Eclair Vanille",
    description: "Choux pastry filled with Madagascar vanilla cream and dark chocolate glaze.",
    price: "5.50",
    image: "https://images.unsplash.com/photo-1587668178277-295251f900ce?q=80&w=600&auto=format&fit=crop",
    badge: "New",
  },
  {
    name: "Baguette Tradition",
    description: "Artisan sourdough baguette with a crackling crust and open crumb.",
    price: "2.80",
    image: "https://images.unsplash.com/photo-1549931319-a545753467c8?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Macaron Assortis",
    description: "Box of six handcrafted macarons in seasonal flavours.",
    price: "12.00",
    image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?q=80&w=600&auto=format&fit=crop",
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

export default function MenuGrid({
  heading = "Our Menu",
  subtitle = "Handcrafted daily with the finest ingredients, baked fresh every morning.",
  items = defaultItems,
}: MenuGridProps) {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            {heading}
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {items.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  crossOrigin="anonymous"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {item.badge && (
                  <Badge className="absolute top-3 right-3">
                    {item.badge}
                  </Badge>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground">{item.name}</h3>
                  <span className="shrink-0 text-lg font-bold text-primary">
                    &euro;{item.price}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
