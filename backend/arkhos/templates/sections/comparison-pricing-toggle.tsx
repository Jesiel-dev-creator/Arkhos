"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface Plan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

const defaultPlans: Plan[] = [
  {
    name: "Starter",
    monthlyPrice: 15,
    yearlyPrice: 144,
    features: [
      "Up to 3 projects",
      "Basic templates",
      "Community support",
      "1GB storage",
    ],
  },
  {
    name: "Pro",
    monthlyPrice: 49,
    yearlyPrice: 470,
    highlighted: true,
    badge: "Most Popular",
    features: [
      "Unlimited projects",
      "Premium templates",
      "Priority support",
      "20GB storage",
      "Analytics dashboard",
      "Custom integrations",
    ],
  },
  {
    name: "Enterprise",
    monthlyPrice: 99,
    yearlyPrice: 950,
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "1TB storage",
      "24/7 phone support",
      "Custom branding",
      "API access",
      "SLA guarantee",
    ],
  },
];

interface PricingToggleProps {
  plans?: Plan[];
}

export default function PricingToggle({ plans = defaultPlans }: PricingToggleProps) {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-3 rounded-full bg-gray-100 dark:bg-gray-800 p-1">
            <button
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all",
                !isYearly
                  ? "bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-gray-100"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
              onClick={() => setIsYearly(false)}
            >
              Monthly
            </button>
            <button
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all",
                isYearly
                  ? "bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-gray-100"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
              onClick={() => setIsYearly(true)}
            >
              Yearly
              <span className="ml-1 text-xs text-green-600">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl p-6 transition-all",
                plan.highlighted
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xl scale-105"
                  : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
              )}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}

              <h3 className="text-lg font-semibold">{plan.name}</h3>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">
                  ${isYearly ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    plan.highlighted
                      ? "text-gray-300 dark:text-gray-600"
                      : "text-gray-500"
                  )}
                >
                  /month
                </span>
              </div>

              {isYearly && (
                <p
                  className={cn(
                    "mt-1 text-xs",
                    plan.highlighted
                      ? "text-gray-400 dark:text-gray-500"
                      : "text-gray-400"
                  )}
                >
                  Billed ${plan.yearlyPrice}/year
                </p>
              )}

              <button
                className={cn(
                  "mt-6 w-full py-2.5 rounded-lg font-medium text-sm transition-all",
                  plan.highlighted
                    ? "bg-white text-gray-900 hover:bg-gray-100 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
                    : "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                )}
              >
                Get Started
              </button>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <svg
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        plan.highlighted
                          ? "text-green-400"
                          : "text-green-500"
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
