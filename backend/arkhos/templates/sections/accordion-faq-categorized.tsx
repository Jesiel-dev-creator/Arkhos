"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  title: string;
  items: FaqItem[];
}

function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        className="flex w-full flex-1 items-center justify-between py-4 text-left font-semibold transition-all hover:underline"
        onClick={onToggle}
      >
        {item.question}
        <ChevronDown
          className={`h-4 w-4 shrink-0 opacity-60 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="pb-4 pt-0 text-sm text-gray-600 dark:text-gray-400">
          {item.answer}
        </div>
      )}
    </div>
  );
}

const defaultCategories: FaqCategory[] = [
  {
    title: "General",
    items: [
      {
        question: "What is the purpose of this platform?",
        answer:
          "Our platform is designed to simplify your workflow and save you hours every week using automation and AI-powered tools.",
      },
      {
        question: "Is this service available worldwide?",
        answer:
          "Yes, we support users across the globe. Some regional features may vary.",
      },
    ],
  },
  {
    title: "Billing",
    items: [
      {
        question: "Do you offer refunds?",
        answer:
          "Yes, we offer a 7-day refund policy. If you're unsatisfied, just contact our support within that time frame.",
      },
      {
        question: "Can I change my plan later?",
        answer:
          "Absolutely! You can upgrade or downgrade your plan anytime from your account dashboard.",
      },
    ],
  },
  {
    title: "Technical",
    items: [
      {
        question: "Does this integrate with other tools?",
        answer:
          "Yes! We support integrations with Slack, Notion, Zapier, and many more.",
      },
      {
        question: "Is there an API available?",
        answer:
          "Yes, our public API is available for all Pro users. Documentation can be found in the developer portal.",
      },
    ],
  },
];

export default function CategorizedFaq({
  categories = defaultCategories,
}: {
  categories?: FaqCategory[];
}) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-20">
      <div className="flex flex-col md:flex-row gap-12 items-start">
        {/* Left Column */}
        <div className="md:w-1/2">
          <h2 className="text-4xl font-bold mb-4">Have questions?</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            We&apos;re here to help you understand how everything works. If you
            still have doubts, feel free to{" "}
            <a href="/contact" className="underline">
              reach out to our team
            </a>
            .
          </p>
        </div>

        {/* Right Column */}
        <div className="md:w-1/2 space-y-10">
          {categories.map((category) => (
            <div key={category.title}>
              <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">
                {category.title}
              </h3>
              {category.items.map((item, idx) => {
                const key = `${category.title}-${idx}`;
                return (
                  <AccordionItem
                    key={key}
                    item={item}
                    isOpen={openItems.has(key)}
                    onToggle={() => toggleItem(key)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
