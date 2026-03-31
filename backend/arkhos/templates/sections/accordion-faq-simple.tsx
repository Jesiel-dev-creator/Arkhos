"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  heading?: string;
  description?: string;
  items?: FaqItem[];
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
    <div className="relative border-x first:rounded-t-lg first:border-t last:rounded-b-lg last:border-b border-gray-200 dark:border-gray-700">
      <button
        className="flex w-full items-center justify-between px-4 py-4 text-[15px] leading-6 font-medium text-left"
        onClick={onToggle}
      >
        {item.question}
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="text-gray-500 dark:text-gray-400 pb-4 px-4 text-sm">
          {item.answer}
        </div>
      )}
    </div>
  );
}

const defaultItems: FaqItem[] = [
  {
    question: "What is this platform?",
    answer:
      "A collection of beautifully crafted UI blocks and components, designed to help developers build modern websites with ease.",
  },
  {
    question: "Who can benefit from this?",
    answer:
      "Built for founders, product teams, and agencies that want to accelerate idea validation and delivery.",
  },
  {
    question: "What features are included?",
    answer:
      "Offers a collaborative workspace where you can design and build beautiful web applications, with reusable UI blocks, deployment automation, and comprehensive analytics all in one place.",
  },
  {
    question: "Can I customize components?",
    answer:
      "Yes. Offers editable design systems and code scaffolding so you can tailor blocks to your brand and workflow.",
  },
  {
    question: "Does it integrate with my existing tools?",
    answer:
      "Connects with popular source control, design tools, and cloud providers to fit into your current stack.",
  },
  {
    question: "How do I get support?",
    answer:
      "You can access detailed docs, community forums, and dedicated customer success channels for help at any time.",
  },
];

export default function FaqSection({
  heading = "Frequently Asked Questions",
  description = "Here are some common questions and answers. If you don't find what you're looking for, feel free to reach out.",
  items = defaultItems,
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-7 px-4 pt-16">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold md:text-4xl">{heading}</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
          {description}
        </p>
      </div>
      <div className="bg-white dark:bg-gray-900/50 w-full -space-y-px rounded-lg">
        {items.map((item, index) => (
          <AccordionItem
            key={index}
            item={item}
            isOpen={openIndex === index}
            onToggle={() =>
              setOpenIndex(openIndex === index ? null : index)
            }
          />
        ))}
      </div>
      <p className="text-gray-500 dark:text-gray-400">
        Can&apos;t find what you&apos;re looking for? Contact our{" "}
        <a href="#" className="text-blue-600 hover:underline">
          customer support team
        </a>
      </p>
    </div>
  );
}
