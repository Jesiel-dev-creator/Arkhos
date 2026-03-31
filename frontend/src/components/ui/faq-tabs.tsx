import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export const FAQ = ({ title = "FAQs", subtitle = "Frequently Asked Questions", categories, faqData, className, ...props }: any) => {
  const categoryKeys = Object.keys(categories);
  const [selectedCategory, setSelectedCategory] = useState(categoryKeys[0]);
  return (
    <section className={cn("relative overflow-hidden bg-background px-4 py-12 text-foreground", className)} {...props}>
      <div className="relative z-10 flex flex-col items-center justify-center">
        <span className="mb-8 bg-gradient-to-r from-primary to-primary/60 bg-clip-text font-medium text-transparent">{subtitle}</span>
        <h2 className="mb-8 text-5xl font-bold">{title}</h2>
      </div>
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-4">
        {Object.entries(categories).map(([key, label]: any) => (
          <button key={key} onClick={() => setSelectedCategory(key)}
            className={cn("relative overflow-hidden whitespace-nowrap rounded-md border px-3 py-1.5 text-sm font-medium transition-colors duration-500",
              selectedCategory === key ? "border-primary text-background" : "border-border bg-transparent text-muted-foreground hover:text-foreground")}>
            <span className="relative z-10">{label}</span>
            <AnimatePresence>
              {selectedCategory === key && (
                <motion.span initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "100%" }} transition={{ duration: 0.5, ease: "backIn" }}
                  className="absolute inset-0 z-0 bg-gradient-to-r from-primary to-primary/80" />
              )}
            </AnimatePresence>
          </button>
        ))}
      </div>
      <div className="mx-auto mt-12 max-w-3xl">
        <AnimatePresence mode="wait">
          {Object.entries(faqData).map(([category, questions]: any) => {
            if (selectedCategory !== category) return null;
            return (
              <motion.div key={category} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.5 }} className="space-y-4">
                {questions.map((faq: any, index: number) => (
                  <FAQItem key={index} faq={faq} />
                ))}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
};

function FAQItem({ faq }: { faq: { question: string; answer: string } }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div animate={isOpen ? "open" : "closed"}
      className={cn("rounded-xl border transition-colors", isOpen ? "bg-muted/50" : "bg-card")}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex w-full items-center justify-between gap-4 p-4 text-left">
        <span className={cn("text-lg font-medium transition-colors", isOpen ? "text-foreground" : "text-muted-foreground")}>{faq.question}</span>
        <motion.span variants={{ open: { rotate: "45deg" }, closed: { rotate: "0deg" } }} transition={{ duration: 0.2 }}>
          <Plus className={cn("h-5 w-5 transition-colors", isOpen ? "text-foreground" : "text-muted-foreground")} />
        </motion.span>
      </button>
      <motion.div initial={false} animate={{ height: isOpen ? "auto" : "0px", marginBottom: isOpen ? "16px" : "0px" }} transition={{ duration: 0.3 }} className="overflow-hidden px-4">
        <p className="text-muted-foreground">{faq.answer}</p>
      </motion.div>
    </motion.div>
  );
}

export default FAQ;
