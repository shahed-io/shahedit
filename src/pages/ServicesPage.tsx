import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { formatBdt } from "@/lib/utils";
import {
  Globe, Wrench, Palette, Facebook, TrendingUp, Building2,
  LayoutGrid, Search, ShoppingCart, Star, ArrowRight,
} from "lucide-react";

type SidebarCat = {
  slug: string | null; // null = all
  label: string;
  icon: typeof Globe;
  accent: string; // hsl
};

const sidebarCats: SidebarCat[] = [
  { slug: null, label: "সব", icon: LayoutGrid, accent: "270 92% 65%" },
  { slug: "web-development", label: "Web Development", accent: "270 92% 65%", icon: Globe },
  { slug: "website-maintenance", label: "Website Maintenance", accent: "210 90% 65%", icon: Wrench },
  { slug: "graphics-design", label: "Graphics Design", accent: "320 90% 65%", icon: Palette },
  { slug: "facebook-services", label: "Facebook Services", accent: "220 95% 65%", icon: Facebook },
  { slug: "digital-marketing", label: "Digital Marketing", accent: "150 80% 55%", icon: TrendingUp },
  { slug: "business-solutions", label: "Business Solutions", accent: "42 95% 60%", icon: Building2 },
];

interface DbPackage {
  id: string;
  service_id: string;
  title: string;
  short_description: string | null;
  price: number | null;
  original_price: number | null;
  features: string[] | null;
  image_url: string | null;
  is_featured: boolean;
  badge: string | null;
  slug: string | null;
  created_at: string;
  sort_order: number;
}

interface DbService { id: string; slug: string | null; title: string }

type SortKey = "latest" | "price-asc" | "price-desc" | "popular";

const ServicesPage = () => {
  const [params, setParams] = useSearchParams();
  const activeSlug = params.get("cat"); // null = all
  const search = params.get("q") ?? "";
  const sort = (params.get("sort") as SortKey) ?? "latest";

  const [services, setServices] = useState<DbService[]>([]);
  const [packages, setPackages] = useState<DbPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: svcs }, { data: pkgs }] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any).from("services").select("id, slug, title").eq("is_published", true),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any).from("service_packages").select("*").eq("is_published", true),
      ]);
      setServices((svcs ?? []) as DbService[]);
      setPackages((pkgs ?? []) as DbPackage[]);
      setLoading(false);
    })();
  }, []);

  const slugById = useMemo(() => {
    const m = new Map<string, string>();
    services.forEach((s) => { if (s.slug) m.set(s.id, s.slug); });
    return m;
  }, [services]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    packages.forEach((p) => {
      const sl = slugById.get(p.service_id);
      if (sl) m.set(sl, (m.get(sl) ?? 0) + 1);
    });
    return m;
  }, [packages, slugById]);

  const filtered = useMemo(() => {
    let list = packages;
    if (activeSlug) list = list.filter((p) => slugById.get(p.service_id) === activeSlug);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || (p.short_description ?? "").toLowerCase().includes(q));
    }
    const sorted = [...list];
    switch (sort) {
      case "price-asc": sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0)); break;
      case "price-desc": sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0)); break;
      case "popular": sorted.sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.sort_order - b.sort_order); break;
      default: sorted.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
    }
    return sorted;
  }, [packages, slugById, activeSlug, search, sort]);

  const setParam = (key: string, val: string | null) => {
    const next = new URLSearchParams(params);
    if (val === null || val === "") next.delete(key); else next.set(key, val);
    setParams(next, { replace: false });
  };

  const activeCat = sidebarCats.find((c) => c.slug === activeSlug) ?? sidebarCats[0];

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${activeCat.label} প্রোডাক্ট — Shahed IT`} description="আমাদের সকল ক্যাটাগরির প্রোডাক্ট ও প্যাকেজ এক জায়গায়।" />
      <SiteHeader />

      {/* Page header */}
      <section className="pt-24 pb-6 relative">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-black">
              {activeSlug ? activeCat.label : "সব"} <span className="gradient-text">প্রোডাক্ট</span>
            </h1>
            <p className="text-foreground/55 text-sm mt-2">{filtered.length}টি প্রোডাক্ট পাওয়া গেছে</p>
          </motion.div>
        </div>
      </section>

      {/* Main grid */}
      <section className="pb-20 relative">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[260px_1fr] gap-6">
            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24 self-start">
              <div className="rounded-2xl p-4 border"
                style={{
                  background: "linear-gradient(180deg, hsla(270,92%,65%,0.06), hsla(320,90%,55%,0.04))",
                  borderColor: "hsla(270,92%,65%,0.18)",
                }}>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-foreground/55 mb-3 pl-2 border-l-2"
                  style={{ borderColor: "hsl(270,92%,65%)" }}>
                  ক্যাটাগরি
                </p>
                <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
                  {sidebarCats.map((c) => {
                    const isActive = (c.slug ?? null) === activeSlug;
                    const Icon = c.icon;
                    const count = c.slug ? counts.get(c.slug) ?? 0 : packages.length;
                    return (
                      <button
                        key={c.label}
                        onClick={() => setParam("cat", c.slug)}
                        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all shrink-0 lg:shrink"
                        style={{
                          background: isActive ? `hsla(${c.accent}, 0.18)` : "transparent",
                          border: `1px solid ${isActive ? `hsla(${c.accent}, 0.45)` : "transparent"}`,
                          boxShadow: isActive ? `0 6px 18px hsla(${c.accent}, 0.25)` : "none",
                        }}
                      >
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: `hsla(${c.accent}, 0.15)`, border: `1px solid hsla(${c.accent}, 0.30)` }}>
                          <Icon size={15} style={{ color: `hsl(${c.accent})` }} />
                        </span>
                        <span className={`text-sm font-semibold whitespace-nowrap ${isActive ? "text-foreground" : "text-foreground/70 group-hover:text-foreground"}`}>
                          {c.label}
                        </span>
                        <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md hidden lg:inline"
                          style={{ background: `hsla(${c.accent}, 0.15)`, color: `hsl(${c.accent})` }}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {activeSlug && (
                  <Link
                    to={`/services/${activeSlug}`}
                    className="mt-4 flex items-center justify-between gap-2 text-xs font-bold px-3 py-2.5 rounded-xl text-white"
                    style={{ background: `linear-gradient(135deg, hsl(${activeCat.accent}), hsl(320,90%,48%))` }}
                  >
                    ক্যাটাগরির বিস্তারিত <ArrowRight size={13} />
                  </Link>
                )}
              </div>
            </aside>

            {/* Right column */}
            <div>
              {/* Search + Sort */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setParam("q", e.target.value)}
                    placeholder="প্রোডাক্ট খুঁজুন..."
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-purple-400/50 focus:bg-white/[0.06] outline-none text-sm transition-all"
                  />
                </div>
                <select
                  value={sort}
                  onChange={(e) => setParam("sort", e.target.value)}
                  className="px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-purple-400/50 outline-none text-sm font-semibold cursor-pointer"
                >
                  <option value="latest">সর্বশেষ</option>
                  <option value="popular">জনপ্রিয়</option>
                  <option value="price-asc">কম দাম আগে</option>
                  <option value="price-desc">বেশি দাম আগে</option>
                </select>
              </div>

              {/* Products grid */}
              {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-72 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="rounded-2xl p-14 border text-center"
                  style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
                  <p className="text-foreground/70 font-semibold mb-2">কোনো প্রোডাক্ট পাওয়া যায়নি</p>
                  <p className="text-foreground/45 text-sm">অন্য ক্যাটাগরি চেষ্টা করুন বা অনুসন্ধান পরিবর্তন করুন</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map((p, i) => {
                      const sl = slugById.get(p.service_id) ?? "";
                      const accent = sidebarCats.find((c) => c.slug === sl)?.accent ?? "270 92% 65%";
                      const discount = p.original_price && p.price && p.original_price > p.price
                        ? Math.round(((p.original_price - p.price) / p.original_price) * 100)
                        : null;
                      return (
                        <motion.div
                          key={p.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: Math.min(i * 0.03, 0.3) }}
                          whileHover={{ y: -4 }}
                          className="group relative rounded-2xl overflow-hidden border flex flex-col"
                          style={{
                            background: `hsla(${accent}, 0.05)`,
                            borderColor: `hsla(${accent}, 0.20)`,
                          }}
                        >
                          {/* Image */}
                          <Link to={`/product/${p.slug ?? p.id}`} className="block relative aspect-square overflow-hidden">
                            {p.image_url ? (
                              <img
                                src={p.image_url}
                                alt={p.title}
                                loading="lazy"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"
                                style={{ background: `linear-gradient(135deg, hsla(${accent}, 0.30), hsla(${accent}, 0.05))` }}>
                                <ShoppingCart size={40} style={{ color: `hsl(${accent})` }} />
                              </div>
                            )}
                            {discount && (
                              <span className="absolute top-2 left-2 text-[10px] font-black px-2 py-1 rounded-md bg-red-500 text-white shadow">
                                -{discount}%
                              </span>
                            )}
                            {p.is_featured ? (
                              <span className="absolute top-2 right-2 text-[10px] font-black px-2 py-1 rounded-md text-white shadow inline-flex items-center gap-1"
                                style={{ background: `linear-gradient(135deg, hsl(${accent}), hsl(320,90%,55%))` }}>
                                <Star size={9} fill="currentColor" /> Premium
                              </span>
                            ) : p.badge ? (
                              <span className="absolute top-2 right-2 text-[10px] font-black px-2 py-1 rounded-md text-white shadow"
                                style={{ background: `hsl(${accent})` }}>
                                {p.badge}
                              </span>
                            ) : null}
                          </Link>

                          {/* Body */}
                          <div className="p-4 flex flex-col flex-1">
                            <Link to={`/product/${p.slug ?? p.id}`} className="block">
                              <h3 className="text-sm font-bold text-foreground leading-tight mb-2 line-clamp-2 group-hover:text-white transition-colors">
                                {p.title}
                              </h3>
                            </Link>
                            <div className="flex items-end justify-between mt-auto">
                              <div>
                                <p className="text-lg font-black" style={{ color: `hsl(${accent})` }}>
                                  {p.price != null ? formatBdt(p.price) : "—"}
                                </p>
                                {p.original_price != null && p.price != null && p.original_price > p.price && (
                                  <p className="text-[11px] text-foreground/40 line-through leading-none">{formatBdt(p.original_price)}</p>
                                )}
                              </div>
                              <Link
                                to={`/product/${p.slug ?? p.id}`}
                                aria-label="অর্ডার করুন"
                                className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110"
                                style={{ background: `linear-gradient(135deg, hsl(${accent}), hsl(320,90%,48%))` }}
                              >
                                <ShoppingCart size={15} />
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default ServicesPage;
