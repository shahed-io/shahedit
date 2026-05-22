import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, X, ArrowRight, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRecentlyViewedIds } from "@/hooks/useRecentlyViewed";
import { formatPrice, type ServicePackageRow } from "@/components/ProductsSection";

export default function RecentlyViewedSection({ limit = 4, compact = false }: { limit?: number; compact?: boolean }) {
  const { ids, clear } = useRecentlyViewedIds();
  const [items, setItems] = useState<ServicePackageRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ids.length === 0) {
      setItems([]);
      return;
    }
    setLoading(true);
    supabase
      .from("service_packages")
      .select("*, services(title)")
      .in("id", ids)
      .eq("is_published", true)
      .then(({ data }) => {
        const map = new Map((data ?? []).map((p: any) => [p.id, p as ServicePackageRow]));
        // Preserve recency order
        const ordered = ids.map((id) => map.get(id)).filter(Boolean) as ServicePackageRow[];
        setItems(ordered.slice(0, limit));
        setLoading(false);
      });
  }, [ids, limit]);

  if (ids.length === 0 || (items.length === 0 && !loading)) return null;

  return (
    <section className={`relative ${compact ? "py-12" : "py-20"}`}>
      <div className="container mx-auto px-4 relative">
        <div className="flex items-end justify-between mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-3"
              style={{
                background: "rgba(168,85,247,0.10)",
                border: "1px solid rgba(168,85,247,0.25)",
                color: "hsl(270,92%,75%)",
              }}
            >
              <Clock size={12} /> Recently Viewed
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">
              আপনি সম্প্রতি <span className="gradient-text-pink">দেখেছেন</span>
            </h2>
          </motion.div>
          <button
            onClick={clear}
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/60 hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
          >
            <X size={14} /> Clear
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {items.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                to={`/product/${p.slug ?? p.id}`}
                className="group block rounded-2xl overflow-hidden border border-white/[0.06] hover:border-[hsl(270,92%,60%)]/40 transition-all duration-500"
                style={{
                  background: "linear-gradient(180deg, rgba(20,12,40,0.85), rgba(12,6,28,0.95))",
                  boxShadow: "0 12px 32px -16px rgba(0,0,0,0.6)",
                }}
              >
                <div className="aspect-[4/3] overflow-hidden relative bg-gradient-to-br from-primary/15 to-accent/15">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                  )}
                  <div
                    className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
                    style={{
                      background: "linear-gradient(to top, rgba(8,4,20,0.95), transparent)",
                    }}
                  />
                  {p.badge && (
                    <span
                      className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
                      style={{ background: "hsl(320,90%,55%)" }}
                    >
                      {p.badge}
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-bold text-white truncate group-hover:text-[hsl(320,90%,75%)] transition-colors">
                    {p.title}
                  </h3>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base font-extrabold text-white">
                      {p.price != null ? formatPrice(p.price) : "—"}
                    </span>
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0"
                      style={{
                        background: "hsl(320,90%,55%)",
                        boxShadow: "0 6px 18px -8px hsla(320,90%,55%,0.6)",
                      }}>
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
