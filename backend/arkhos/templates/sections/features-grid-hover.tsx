"use client"

import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export interface Feature {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
  href: string;
}

export interface FeatureGridProps {
  features: Feature[];
  className?: string;
}

const FeatureCard: React.FC<{ feature: Feature }> = ({ feature }) => (
  <a
    href={feature.href}
    className={cn(
      "group",
      "flex flex-col sm:flex-row items-start gap-6",
      "p-6 rounded-lg border",
      "bg-card text-card-foreground",
      "transition-all duration-300",
      "hover:shadow-md hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    )}
  >
    {/* Image */}
    <div className="flex-shrink-0">
      <img
        src={feature.imageSrc}
        alt={feature.imageAlt}
        crossOrigin="anonymous"
        className="h-24 w-24 object-contain"
      />
    </div>

    {/* Text Content & Arrow */}
    <div className="flex flex-1 flex-col justify-between h-full">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {feature.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {feature.description}
        </p>
      </div>
      <div className="flex justify-end mt-4">
        <ArrowRight
          className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary"
        />
      </div>
    </div>
  </a>
);

export default function FeatureGrid({ features, className }: FeatureGridProps) {
  if (!features || features.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 lg:grid-cols-2",
        className
      )}
    >
      {features.map((feature, index) => (
        <FeatureCard key={index} feature={feature} />
      ))}
    </div>
  );
}
