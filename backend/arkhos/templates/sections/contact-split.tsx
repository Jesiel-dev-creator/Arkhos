"use client"

import React from "react"
import { motion } from "framer-motion"
import { MapPin, Clock, Mail } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface ContactInfo {
  icon: React.ReactNode
  title: string
  details: string[]
}

interface ContactSplitProps {
  heading?: string
  subtitle?: string
  contactInfo?: ContactInfo[]
  formHeading?: string
  submitText?: string
}

const defaultContactInfo: ContactInfo[] = [
  {
    icon: <MapPin className="h-5 w-5 text-primary" />,
    title: "Address",
    details: ["12 Rue de Rivoli", "75001 Paris, France"],
  },
  {
    icon: <Clock className="h-5 w-5 text-primary" />,
    title: "Hours",
    details: ["Mon - Fri: 9:00 - 18:00", "Sat: 10:00 - 14:00"],
  },
  {
    icon: <Mail className="h-5 w-5 text-primary" />,
    title: "Contact",
    details: ["+33 1 23 45 67 89", "hello@example.com"],
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
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function ContactSplit({
  heading = "Get in Touch",
  subtitle = "We'd love to hear from you. Reach out and we'll respond as soon as we can.",
  contactInfo = defaultContactInfo,
  formHeading = "Send a Message",
  submitText = "Send Message",
}: ContactSplitProps) {
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

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left: Info cards */}
          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {contactInfo.map((info, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="border-border bg-card">
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {info.title}
                      </h3>
                      {info.details.map((detail, i) => (
                        <p key={i} className="text-sm text-muted-foreground mt-0.5">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Right: Contact form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            <Card className="border-border bg-card">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg font-semibold text-foreground mb-6">
                  {formHeading}
                </h3>
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input placeholder="First name" />
                    <Input placeholder="Last name" />
                  </div>
                  <Input type="email" placeholder="Email address" />
                  <Input placeholder="Subject" />
                  <Textarea
                    placeholder="Your message..."
                    className="min-h-[120px] resize-none"
                  />
                  <Button type="submit" className="w-full">
                    {submitText}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
