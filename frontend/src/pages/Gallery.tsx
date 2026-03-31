import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { formatCostEUR } from "@/lib/utils";

interface GalleryItem {
  id: string;
  prompt: string;
  cost_eur: number;
}

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/gallery`)
      .then((r) => r.json())
      .then((data) => setItems(data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl md:text-4xl text-[var(--frost)] mb-2">Gallery</h1>
      <p className="text-sm text-[var(--muted)] mb-10" style={{ fontFamily: "var(--font-body)" }}>
        Recent creations by ArkhosAI
      </p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden">
              <div className="h-48 animate-shimmer" />
              <div className="p-4 bg-[var(--deep)]">
                <div className="h-3 w-3/4 rounded animate-shimmer mb-2" />
                <div className="h-2 w-1/2 rounded animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <GlassCard className="max-w-md mx-auto text-center py-12">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-[var(--border)] flex items-center justify-center mx-auto mb-4">
            <Zap size={24} className="text-[var(--muted)]" />
          </div>
          <p className="text-[var(--frost)] text-lg font-medium mb-2">
            No sites generated yet
          </p>
          <p className="text-sm text-[var(--muted)] mb-6" style={{ fontFamily: "var(--font-body)" }}>
            Be the first to create something
          </p>
          <Link
            to="/generate"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--ember)] text-white text-sm font-medium shadow-[var(--shadow-ember)] hover:shadow-[var(--shadow-ember-strong)] transition-all duration-200 no-underline"
          >
            <Zap size={14} />
            Start Building
          </Link>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <GlassCard key={item.id} padding="compact" className="cursor-pointer">
              <p className="text-sm text-[var(--frost)] mb-1 line-clamp-2">
                {item.prompt}
              </p>
              <span className="text-[11px] font-mono text-[var(--success)]"
                    style={{ fontFamily: "var(--font-code)" }}>
                {formatCostEUR(item.cost_eur)}
              </span>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
