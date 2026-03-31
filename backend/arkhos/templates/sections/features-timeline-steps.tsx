"use client"

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Clock, X } from "lucide-react";

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp?: string | Date;
  status?: "default" | "completed" | "active" | "pending" | "error";
  icon?: React.ReactNode;
  content?: React.ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
  showConnectors?: boolean;
  showTimestamps?: boolean;
  variant?: "default" | "compact" | "spacious";
}

function getStatusIcon(status: TimelineItem["status"]) {
  switch (status) {
    case "completed":
      return <Check className="h-3 w-3" />;
    case "active":
      return <Clock className="h-3 w-3" />;
    case "pending":
      return <Clock className="h-3 w-3" />;
    case "error":
      return <X className="h-3 w-3" />;
    default:
      return <div className="h-2 w-2 rounded-full bg-current" />;
  }
}

function formatTimestamp(timestamp: string | Date): string {
  if (!timestamp) return "";
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const statusIconStyles: Record<string, string> = {
  default: "border-border text-muted-foreground",
  completed: "border-primary bg-primary text-primary-foreground",
  active: "border-primary bg-background text-primary animate-pulse",
  pending: "border-muted-foreground/30 text-muted-foreground",
  error: "border-destructive bg-destructive text-destructive-foreground",
};

const statusConnectorStyles: Record<string, string> = {
  default: "bg-border",
  completed: "bg-primary",
  active: "bg-primary",
  pending: "bg-muted-foreground/30",
  error: "bg-destructive",
};

const variantGap: Record<string, string> = {
  default: "gap-4",
  compact: "gap-2",
  spacious: "gap-8",
};

export default function Timeline({
  items,
  className,
  showConnectors = true,
  showTimestamps = true,
  variant = "default",
}: TimelineProps) {
  return (
    <div className={className}>
      <div className={cn("relative flex flex-col", variantGap[variant])}>
        {items.map((item, index) => (
          <div key={item.id} className="relative flex flex-row gap-3 pb-2">
            {/* Connector Line */}
            {showConnectors && index < items.length - 1 && (
              <div
                className={cn(
                  "absolute left-3 top-9 h-full w-px",
                  statusConnectorStyles[item.status || "default"]
                )}
              />
            )}

            {/* Icon */}
            <div className="relative z-10 flex shrink-0">
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-background text-xs font-medium",
                  statusIconStyles[item.status || "default"]
                )}
              >
                {item.icon || getStatusIcon(item.status)}
              </div>
            </div>

            {/* Content */}
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              {showTimestamps && item.timestamp && (
                <time className="text-xs text-muted-foreground">
                  {formatTimestamp(item.timestamp)}
                </time>
              )}

              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium leading-tight">{item.title}</h3>
              </div>

              {item.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              )}

              {item.content && <div className="mt-3">{item.content}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
