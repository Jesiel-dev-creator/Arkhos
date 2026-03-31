"use client";

import React from "react";
import {
  Target,
  CalendarCheck,
  Globe,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-6 transition-all hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700">
      <div className="text-blue-600 dark:text-blue-400 mb-5">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      <p className="mt-3 text-gray-600 dark:text-gray-400 text-balance">
        {description}
      </p>
      <ArrowUpRight className="absolute right-4 top-4 h-5 w-5 text-gray-400 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </div>
  );
}

const features = [
  {
    icon: <Target className="h-5 w-5" />,
    title: "AI Code Generation",
    description:
      "Our advanced AI models transform natural language into production-ready code.",
  },
  {
    icon: <CalendarCheck className="h-5 w-5" />,
    title: "Smart Scheduling",
    description:
      "Intelligent scheduling that adapts to your workflow and team availability.",
  },
  {
    icon: <Globe className="h-5 w-5" />,
    title: "Global Deployment",
    description:
      "Deploy your applications worldwide with edge-optimized infrastructure.",
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "AI-Powered Insights",
    description:
      "Get actionable insights from your data with our AI analytics engine.",
  },
];

export default function FeatureIconCards() {
  return (
    <section className="py-24">
      <div className="mx-auto w-full max-w-5xl px-6">
        <h2 className="max-w-2xl text-balance text-4xl font-semibold text-gray-900 dark:text-gray-100">
          Empowering developers with AI-driven solutions
        </h2>
        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
