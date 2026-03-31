"use client"

import React from "react"
import { motion } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface FaqItem {
  question: string
  answer: string
}

interface FaqAccordionProps {
  heading?: string
  subtitle?: string
  items?: FaqItem[]
}

const defaultItems: FaqItem[] = [
  {
    question: "How do I get started?",
    answer:
      "Sign up for a free account and you can start building right away. No credit card required for the free tier.",
  },
  {
    question: "Can I upgrade or downgrade my plan at any time?",
    answer:
      "Absolutely. You can switch plans at any time from your account settings. Changes take effect immediately and billing is prorated.",
  },
  {
    question: "Is there a free trial for paid plans?",
    answer:
      "Yes, all paid plans come with a 14-day free trial. You can explore every feature without any commitment.",
  },
  {
    question: "How does billing work?",
    answer:
      "We bill monthly or annually. Annual plans save you 20%. All prices are in EUR and include VAT where applicable.",
  },
  {
    question: "Can I cancel my subscription?",
    answer:
      "You can cancel at any time with no penalties. Your access continues until the end of your current billing period.",
  },
  {
    question: "Do you offer team or enterprise plans?",
    answer:
      "Yes. Our Enterprise plan includes dedicated support, custom integrations, and SLA guarantees. Contact our sales team for details.",
  },
  {
    question: "Where is my data stored?",
    answer:
      "All data is stored on EU-based servers (Paris, France) in compliance with GDPR. We never transfer data outside the EU without consent.",
  },
  {
    question: "How can I contact support?",
    answer:
      "You can reach us via email at support@example.com, through the in-app chat, or by visiting our help center for self-service resources.",
  },
]

export default function FaqAccordion({
  heading = "Frequently Asked Questions",
  subtitle = "Everything you need to know. Can't find what you're looking for? Contact our support team.",
  items = defaultItems,
}: FaqAccordionProps) {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="mx-auto w-full max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              {heading}
            </h2>
            <p className="mt-4 text-muted-foreground">{subtitle}</p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {items.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-base font-medium text-foreground hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
