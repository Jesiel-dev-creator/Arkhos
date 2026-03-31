"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type PlanLevel = "starter" | "pro" | "all" | string;

interface PricingFeature {
  name: string;
  included: PlanLevel | null;
}

interface PricingPlan {
  name: string;
  level: PlanLevel;
  price: {
    monthly: number;
    yearly: number;
  };
  popular?: boolean;
}

const defaultFeatures: PricingFeature[] = [
  { name: "Basic Designs", included: "starter" },
  { name: "Up to 5 team members", included: "starter" },
  { name: "Changes requests", included: "starter" },
  { name: "Advanced Analytics", included: "pro" },
  { name: "Up to 20 team members", included: "pro" },
  { name: "Priority support", included: "pro" },
  { name: "Custom integrations", included: "all" },
  { name: "Unlimited team members", included: "all" },
  { name: "24/7 phone support", included: "all" },
];

const defaultPlans: PricingPlan[] = [
  { name: "Free", price: { monthly: 15, yearly: 144 }, level: "starter" },
  {
    name: "Pro",
    price: { monthly: 49, yearly: 470 },
    level: "pro",
    popular: true,
  },
  { name: "Startup", price: { monthly: 99, yearly: 990 }, level: "all" },
];

function shouldShowCheck(
  included: PricingFeature["included"],
  level: string
): boolean {
  if (included === "all") return true;
  if (included === "pro" && (level === "pro" || level === "all")) return true;
  if (
    included === "starter" &&
    (level === "starter" || level === "pro" || level === "all")
  )
    return true;
  return false;
}

interface CompareTableProps {
  features?: PricingFeature[];
  plans?: PricingPlan[];
}

export default function CompareTable({
  features = defaultFeatures,
  plans = defaultPlans,
}: CompareTableProps) {
  return (
    <section>
      <div className="border-x border-gray-200 dark:border-gray-700">
        <div className="divide-y divide-gray-200 dark:divide-gray-700 last:border-b">
          {/* Header */}
          <div className="sticky top-20 z-10 mt-2 flex items-center border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 pl-6">
            <div className="flex-1 text-sm font-medium">Features</div>
            <div className="flex items-center text-sm">
              {plans.map((plan) => (
                <div
                  key={plan.level}
                  className="w-20 border-r border-gray-200 dark:border-gray-700 p-6 text-center font-medium first:border-l last:border-0 md:w-40 lg:w-60"
                >
                  {plan.name}
                </div>
              ))}
            </div>
          </div>

          {/* Feature rows */}
          {features.map((feature) => (
            <div
              key={feature.name}
              className="flex items-center pl-6 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <div className="flex-1 pr-4 text-sm">{feature.name}</div>
              <div className="flex items-center text-sm">
                {plans.map((plan) => (
                  <div
                    key={plan.level}
                    className={cn(
                      "flex w-20 justify-center border-r border-gray-200 dark:border-gray-700 py-6 first:border-l last:border-0 md:w-40 lg:w-60",
                      plan.level && "font-medium"
                    )}
                  >
                    {shouldShowCheck(feature.included, plan.level) ? (
                      <Check className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <span className="text-gray-300 dark:text-gray-700">
                        -
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
