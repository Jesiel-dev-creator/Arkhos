"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Activity,
  Wifi,
  Server,
  Database,
} from "lucide-react";

type StatusType = "operational" | "degraded" | "outage";

interface StatusItem {
  name: string;
  status: StatusType;
  icon: React.ReactNode;
  latency?: string;
}

interface SystemStatusBlockProps {
  items?: StatusItem[];
  lastUpdated?: string;
  onRefresh?: () => void;
  className?: string;
}

const defaultItems: StatusItem[] = [
  { name: "API Server", status: "operational", icon: <Server className="w-4 h-4" />, latency: "45ms" },
  { name: "Database", status: "operational", icon: <Database className="w-4 h-4" />, latency: "12ms" },
  { name: "AI Pipeline", status: "operational", icon: <Activity className="w-4 h-4" />, latency: "230ms" },
  { name: "CDN", status: "operational", icon: <Wifi className="w-4 h-4" />, latency: "8ms" },
];

const statusConfig: Record<StatusType, { color: string; icon: React.ReactNode; label: string }> = {
  operational: {
    color: "text-emerald-400",
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    label: "Operational",
  },
  degraded: {
    color: "text-amber-400",
    icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    label: "Degraded",
  },
  outage: {
    color: "text-red-400",
    icon: <XCircle className="w-4 h-4 text-red-400" />,
    label: "Outage",
  },
};

export default function SystemStatusBlock({
  items = defaultItems,
  lastUpdated = "Just now",
  onRefresh,
  className,
}: SystemStatusBlockProps) {
  const overallStatus: StatusType = items.some((i) => i.status === "outage")
    ? "outage"
    : items.some((i) => i.status === "degraded")
      ? "degraded"
      : "operational";

  return (
    <Card className={cn("bg-neutral-950 border-neutral-800", className)}>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {statusConfig[overallStatus].icon}
            <span className={cn("text-sm font-medium", statusConfig[overallStatus].color)}>
              {overallStatus === "operational"
                ? "All Systems Operational"
                : overallStatus === "degraded"
                  ? "Partial Degradation"
                  : "System Outage"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Status Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-neutral-900/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-neutral-400">{item.icon}</span>
                <span className="text-sm text-neutral-200">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                {item.latency && (
                  <span className="text-xs text-neutral-500 font-mono">{item.latency}</span>
                )}
                {statusConfig[item.status].icon}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-neutral-800">
          <p className="text-xs text-neutral-500">Last updated: {lastUpdated}</p>
        </div>
      </CardContent>
    </Card>
  );
}
