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
                          whileHover={{ y: -6 }}
                          whileTap={{ scale: 0.97, y: 0, transition: { duration: 0.12 } }}
                          className="group relative rounded-3xl overflow-hidden border border-white/[0.06] hover:border-[hsl(320,90%,60%)]/40 transition-all duration-700 flex flex-col"
                          style={{
                            background: "linear-gradient(180deg, #1a0b2e 0%, #0f0620 100%)",
                            boxShadow:
                              "0 24px 60px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
                          }}
                        >
                          {/* Image */}
                          <Link to={`/product/${p.slug ?? p.id}`} className="block relative aspect-square overflow-hidden">
                            {p.image_url ? (
                              <motion.img
                                src={p.image_url}
                                alt={p.title}
                                loading="lazy"
                                className="w-full h-full object-cover"
                                whileHover={{ scale: 1.1, rotate: 1 }}
                                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"
                                style={{ background: `linear-gradient(135deg, hsla(${accent}, 0.30), hsla(${accent}, 0.05))` }}>
                                <ShoppingCart size={40} style={{ color: `hsl(${accent})` }} />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0212] via-[#0a0212]/30 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                            {discount && (
                              <span className="absolute top-3 left-3 text-[10px] font-black px-2.5 py-1 rounded-full backdrop-blur-xl bg-white/10 border border-white/15 text-white shadow-lg">
                                -{discount}%
                              </span>
                            )}
                            {p.is_featured ? (
                              <span className="absolute top-3 right-3 text-[10px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full backdrop-blur-xl bg-white/10 border border-white/15 text-white shadow-lg inline-flex items-center gap-1">
                                <Star size={9} fill="currentColor" style={{ color: "hsl(320,90%,68%)" }} /> Premium
                              </span>
                            ) : p.badge ? (
                              <span className="absolute top-3 right-3 text-[10px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full backdrop-blur-xl bg-white/10 border border-white/15 text-white shadow-lg">
                                {p.badge}
                              </span>
                            ) : null}
                          </Link>

                          {/* Body */}
                          <div className="p-4 flex flex-col flex-1 relative">
                            <Link to={`/product/${p.slug ?? p.id}`} className="block">
                              <h3 className="text-sm font-extrabold leading-tight mb-2 line-clamp-2 font-syne">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/65">
                                  {p.title}
                                </span>
                              </h3>
                            </Link>
                            <div className="flex items-end justify-between mt-auto">
                              <div>
                                <p className="text-lg font-black" style={{ color: "hsl(320,90%,68%)" }}>
                                  {p.price != null ? formatBdt(p.price) : "—"}
                                </p>
                                {p.original_price != null && p.price != null && p.original_price > p.price && (
                                  <p className="text-[11px] text-white/40 line-through leading-none">{formatBdt(p.original_price)}</p>
                                )}
                              </div>
                              <motion.div whileHover={{ scale: 1.1, rotate: -6 }} transition={{ type: "spring", stiffness: 280 }}>
                                <Link
                                  to={`/product/${p.slug ?? p.id}`}
                                  aria-label="অর্ডার করুন"
                                  className="relative w-10 h-10 rounded-2xl flex items-center justify-center text-white"
                                  style={{
                                    background: "hsl(320,90%,55%)",
                                    boxShadow: "0 10px 40px -10px hsla(320,90%,55%,0.55)",
                                  }}
                                >
                                  <ShoppingCart size={15} />
                                  <div className="absolute inset-1 border border-white/20 rounded-xl pointer-events-none" />
                                </Link>
                              </motion.div>
                            </div>
                          </div>
                          {/* Bottom reveal edge */}
                          <div
                            className="absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-700 pointer-events-none"
                            style={{
                              background:
                                "linear-gradient(90deg, hsl(320,90%,55%), hsl(270,92%,55%))",
                            }}
                          />
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
