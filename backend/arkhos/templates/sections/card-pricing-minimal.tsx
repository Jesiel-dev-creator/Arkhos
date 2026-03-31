"use client";

import React from "react";

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  buttonText?: string;
}

const plans: PricingPlan[] = [
  {
    name: "Basic",
    price: "$29",
    period: "/month",
    buttonText: "Get Started",
    features: [
      "Access to all basic courses",
      "Community support",
      "10 practice projects",
      "Course completion certificate",
      "Basic code review",
    ],
  },
  {
    name: "Pro",
    price: "$79",
    period: "/month",
    highlighted: true,
    badge: "Most Popular",
    buttonText: "Get Started",
    features: [
      "Access to all Pro courses",
      "Priority community support",
      "30 practice projects",
      "Course completion certificate",
      "Advanced code review",
      "1-on-1 mentoring sessions",
      "Job assistance",
    ],
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "/month",
    buttonText: "Get Started",
    features: [
      "Access to all courses",
      "Dedicated support",
      "Unlimited projects",
      "Course completion certificate",
      "Premium code review",
      "Weekly 1-on-1 mentoring",
      "Job guarantee",
    ],
  },
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M7.162 13.5 2.887 9.225l1.07-1.069 3.205 3.207 6.882-6.882 1.069 1.07z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function PricingCards() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={`w-72 text-center p-6 rounded-lg relative ${
            plan.highlighted
              ? "bg-indigo-500 text-white border border-indigo-400"
              : "bg-white text-gray-800/80 border border-gray-200"
          }`}
        >
          {plan.badge && (
            <p className="absolute px-3 text-sm -top-3.5 left-3.5 py-1 bg-indigo-400 text-white rounded-full">
              {plan.badge}
            </p>
          )}
          <p className={`font-semibold ${plan.badge ? "pt-2" : ""}`}>
            {plan.name}
          </p>
          <h2 className="text-3xl font-semibold">
            {plan.price}
            <span
              className={`text-sm font-normal ${
                plan.highlighted ? "" : "text-gray-500"
              }`}
            >
              {plan.period}
            </span>
          </h2>
          <ul className="list-none text-sm mt-6 space-y-1">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <CheckIcon
                  className={
                    plan.highlighted ? "text-white" : "text-indigo-500"
                  }
                />
                <p>{feature}</p>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={`text-sm w-full py-2 rounded font-medium mt-7 transition-all ${
              plan.highlighted
                ? "bg-white text-indigo-500 hover:bg-gray-200"
                : "bg-indigo-500 text-white hover:bg-indigo-600"
            }`}
          >
            {plan.buttonText}
          </button>
        </div>
      ))}
    </div>
  );
}
