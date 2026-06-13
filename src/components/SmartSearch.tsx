import { useState, useEffect, useRef, useMemo, FormEvent, KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Search, X, Clock, TrendingUp, Star, Sparkles, Package, Wrench, FileText, Briefcase, HelpCircle, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { runSearch, SearchHit, SearchType, highlight } from "@/lib/search";
import { supabase } from "@/integrations/supabase/client";

const RECENT_KEY = "search_recent_v1";
const MAX_RECENT = 8;

const POPULAR_FALLBACK = [
  "Web Development", "App Development", "Logo Design", "Graphic Design",
  "SEO Service", "Digital Marketing", "WordPress Website", "Cloud Hosting",
];

interface Props {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}

interface TrendingProduct {
  id: string;
  slug?: string | null;
  title: string;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  price: number | null;
  original_price: number | null;
  currency: string | null;
  service_title?: string | null;
}

const iconFor = (t: SearchType) => {
  switch (t) {
    case "service": return Wrench;
    case "package": return Package;
    case "blog": return FileText;
    case "project": return Briefcase;
    case "faq": return HelpCircle;
    default: return Sparkles;
  }
};

const labelFor = (t: SearchType) =>
  t === "service" ? "Service" : t === "package" ? "Package" : t === "blog" ? "Blog" : t === "project" ? "Project" : t === "faq" ? "FAQ" : "Page";

const Highlighted = ({ text, query }: { text?: string; query: string }) => {
  if (!text) return null;
  const h = highlight(text, query);
  if (!h) return <>{text}</>;
  return (
    <>
      {h.before}<mark style={{ background: "linear-gradient(90deg, rgba(168,85,247,0.45), rgba(236,72,153,0.35))", color: "#fff", padding: "0 3px", borderRadius: 4, fontWeight: 700 }}>{h.match}</mark>{h.after}
    </>
  );
};

const fmtPrice = (n: number | null | undefined) => {
  if (n == null) return "";
  return "৳" + Math.round(Number(n)).toLocaleString("en-IN");
};

const SmartSearch = ({ variant = "desktop", onNavigate }: Props) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [results, setResults] = useState<SearchHit[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [trending, setTrending] = useState<TrendingProduct[]>([]);
  const [popular, setPopular] = useState<string[]>(POPULAR_FALLBACK);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalInputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const getActiveInput = () => modalInputRef.current || inputRef.current;
  const focusSearchInput = () => getActiveInput()?.focus();
  const blurSearchInput = () => {
    inputRef.current?.blur();
    modalInputRef.current?.blur();
  };

  useEffect(() => {
    try { const raw = localStorage.getItem(RECENT_KEY); if (raw) setRecent(JSON.parse(raw)); } catch {}
  }, []);

  // Fetch trending products once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("service_packages")
        .select("id,slug,title,short_description,description,image_url,price,original_price,currency,is_featured,sort_order,services(title)")
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .limit(6);
      if (cancelled || !data) return;
      setTrending(data.map((d: any) => ({
        id: d.id,
        slug: d.slug,
        title: d.title,
        short_description: d.short_description,
        description: d.description,
        image_url: d.image_url,
        price: d.price,
        original_price: d.original_price,
        currency: d.currency,
        service_title: d.services?.title || null,
      })));
    })();
    return () => { cancelled = true; };
  }, []);

  // Fetch popular searches once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("popular_searches")
        .select("term")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(20);
      if (cancelled) return;
      const list = (data || []).map((d: any) => d.term).filter(Boolean);
      if (list.length) setPopular(list);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (variant !== "desktop") return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
        // wait a tick so the input is mounted/visible before focusing
        setTimeout(() => {
          const activeInput = getActiveInput();
          activeInput?.focus();
          activeInput?.select();
        }, 0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [variant]);

  useEffect(() => {
    if (variant !== "mobile") return;
    const onClick = (e: MouseEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [variant]);

  useEffect(() => {
    if (variant !== "desktop" || !open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => focusSearchInput(), 0);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, variant]);

  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults([]); setLoading(false); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const hits = await runSearch(q, { limitPerType: 4 });
        setResults(hits.slice(0, 10));
      } catch { setResults([]); }
      setLoading(false);
      setActive(0);
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  const items = results;

  const saveRecent = (q: string) => {
    const next = [q, ...recent.filter(r => r !== q)].slice(0, MAX_RECENT);
    setRecent(next);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
  };

  const removeRecent = (q: string) => {
    const next = recent.filter(r => r !== q);
    setRecent(next);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
  };

  const close = () => { setOpen(false); setQuery(""); blurSearchInput(); onNavigate?.(); };

  const goTo = (href: string, saveQ?: string) => {
    if (saveQ) saveRecent(saveQ);
    close();
    navigate(href);
  };

  const goHit = (s: SearchHit) => goTo(s.href, s.title);

  const goRecent = (q: string) => { setQuery(q); focusSearchInput(); };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (items[active]) return goHit(items[active]);
    saveRecent(q);
    close();
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, items.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === "Escape") { setOpen(false); blurSearchInput(); }
  };

  const clearRecent = () => { setRecent([]); try { localStorage.removeItem(RECENT_KEY); } catch {} };

  const showEmptyState = !query.trim();

  const discountPct = (orig?: number | null, p?: number | null) => {
    if (!orig || !p || orig <= p) return null;
    return Math.round(((orig - p) / orig) * 100);
  };

  const searchUi = (
    <div
      ref={wrapRef}
      className={
        variant === "desktop"
          ? open
            ? "hidden lg:flex flex-col fixed top-24 left-0 right-0 z-[90] mx-auto w-[min(92vw,720px)] max-w-[720px]"
            : "hidden lg:flex relative flex-1 max-w-md mx-auto"
          : "relative w-full"
      }
    >
      <form onSubmit={submit} className="relative z-10 w-full">
        <div
          className="group relative w-full flex items-center gap-2 pl-3 pr-1 py-1 rounded-full transition-all focus-within:scale-[1.005]"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: `1.5px solid ${open ? "rgba(168,85,247,0.45)" : "rgba(168,85,247,0.22)"}`,
            boxShadow: open
              ? "0 8px 28px rgba(124,58,237,0.30), inset 0 1px 0 rgba(255,255,255,0.06)"
              : "inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <Search size={16} className="shrink-0 transition-colors" style={{ color: open ? "#c4b5fd" : "rgba(226, 218, 245, 0.6)" }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="প্রোডাক্ট খুঁজুন..."
            className="flex-1 min-w-0 bg-transparent outline-none text-sm font-medium placeholder:text-[rgba(226,218,245,0.45)]"
            style={{ color: "#fff" }}
            autoComplete="off"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(""); inputRef.current?.focus(); }} className="p-0.5 rounded-full hover:bg-white/10">
              <X size={14} style={{ color: "rgba(226, 218, 245, 0.7)" }} />
            </button>
          )}
          {variant === "desktop" && !query && !open && (
            <kbd
              className="hidden lg:flex items-center gap-0.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md mr-1"
              style={{
                background: "rgba(168, 85, 247, 0.15)",
                border: "1px solid rgba(168, 85, 247, 0.30)",
                color: "#c4b5fd",
              }}
            >⌘ K</kbd>
          )}
          <button
            type="submit"
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-105"
            style={{ background: "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)", boxShadow: "0 3px 10px rgba(168,85,247,0.40)" }}
            aria-label="Search"
          >
            <Search size={12} className="text-white" />
          </button>
        </div>
      </form>

      {/* Desktop full-page blur backdrop */}
      {variant === "desktop" && (
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setOpen(false)}
              className="hidden lg:block fixed inset-0 z-0 cursor-default"
              style={{
                background: "rgba(6, 3, 16, 0.72)",
                backdropFilter: "blur(14px) saturate(120%)",
                WebkitBackdropFilter: "blur(14px) saturate(120%)",
              }}
            />
          )}
        </AnimatePresence>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.14 }}
            className={`mt-3 rounded-2xl overflow-hidden z-10 ${variant === "desktop" ? "w-full" : "absolute left-0 right-0"}`}
            style={{
              background: "linear-gradient(180deg, rgba(20,12,40,0.96), rgba(12,6,28,0.98))",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(168, 85, 247, 0.25)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(168,85,247,0.08), 0 8px 32px rgba(124,58,237,0.25)",
            }}
          >
            {/* Top hint bar (mirrors footer style) */}
            <div className="flex items-center justify-between px-5 py-2 border-b text-[10px]"
              style={{ borderColor: "rgba(168,85,247,0.18)", background: "linear-gradient(180deg, rgba(124,58,237,0.12), rgba(124,58,237,0.06))", color: "rgba(226,218,245,0.6)" }}>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded border" style={{ borderColor: "rgba(168,85,247,0.35)", color: "#c4b5fd", background: "rgba(168,85,247,0.10)" }}>↑↓</kbd> নেভিগেট</span>
                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded border" style={{ borderColor: "rgba(168,85,247,0.35)", color: "#c4b5fd", background: "rgba(168,85,247,0.10)" }}>↵</kbd> সিলেক্ট</span>
                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded border" style={{ borderColor: "rgba(168,85,247,0.35)", color: "#c4b5fd", background: "rgba(168,85,247,0.10)" }}>Esc</kbd> বন্ধ</span>
              </div>
              <span className="flex items-center gap-1 font-medium" style={{ color: "#f0abfc" }}>
                <Sparkles size={11} /> Shahed IT Search
              </span>
            </div>



            <div className="max-h-[60vh] overflow-y-auto">
              {/* ============== EMPTY STATE ============== */}
              {showEmptyState && (
                <>
                  {/* Recent Searches */}
                  {recent.length > 0 && (
                    <section className="pt-4">
                      <div className="flex items-center justify-between px-5 pb-2">
                        <span className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: "#c4b5fd" }}>
                          <Clock size={13} /> সাম্প্রতিক সার্চ
                        </span>
                        <button onClick={clearRecent} className="text-[11px] font-medium hover:underline" style={{ color: "#ec4899" }}>
                          সব মুছুন
                        </button>
                      </div>
                      <ul>
                        {recent.map((r) => (
                          <li key={r}>
                            <div className="group flex items-center gap-3 px-5 py-2 hover:bg-[rgba(168,85,247,0.10)] transition-colors">
                              <Clock size={14} style={{ color: "rgba(226,218,245,0.5)" }} className="shrink-0" />
                              <button
                                type="button"
                                onClick={() => goRecent(r)}
                                className="flex-1 text-left text-sm truncate"
                                style={{ color: "rgba(255,255,255,0.92)" }}
                              >
                                {r}
                              </button>
                              <button
                                type="button"
                                onClick={() => removeRecent(r)}
                                className="opacity-60 hover:opacity-100 p-1 rounded-md hover:bg-white/10"
                                aria-label="Remove"
                              >
                                <X size={13} style={{ color: "rgba(226,218,245,0.6)" }} />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* Popular Searches */}
                  <section className="pt-4">
                    <div className="px-5 pb-2">
                      <span className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: "#c4b5fd" }}>
                        <TrendingUp size={13} /> জনপ্রিয় সার্চ
                      </span>
                    </div>
                    <ul>
                      {popular.map((p) => (
                        <li key={p}>
                          <button
                            type="button"
                            onClick={() => goRecent(p)}
                            className="w-full flex items-center gap-3 px-5 py-2 text-left hover:bg-[rgba(168,85,247,0.10)] transition-colors"
                          >
                            <TrendingUp size={14} style={{ color: "#a855f7" }} className="shrink-0" />
                            <span className="text-sm" style={{ color: "rgba(255,255,255,0.92)" }}>{p}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Trending Products */}
                  {trending.length > 0 && (
                    <section className="pt-4 pb-2 border-t mt-3" style={{ borderColor: "rgba(168,85,247,0.18)" }}>
                      <div className="px-5 pt-3 pb-2">
                        <span className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: "#c4b5fd" }}>
                          <Star size={13} /> ট্রেন্ডিং প্রোডাক্ট
                        </span>
                      </div>
                      <ul>
                        {trending.map((t) => {
                          const pct = discountPct(t.original_price, t.price);
                          return (
                            <li key={t.id}>
                              <button
                                type="button"
                                onClick={() => goTo(`/product/${t.slug || t.id}`)}
                                className="w-full flex items-center gap-3 px-5 py-2.5 text-left hover:bg-[rgba(168,85,247,0.10)] transition-colors"
                              >
                                {/* Thumbnail */}
                                <div
                                  className="w-12 h-12 rounded-xl shrink-0 overflow-hidden flex items-center justify-center"
                                  style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.30), rgba(236,72,153,0.30))", border: "1px solid rgba(168,85,247,0.25)" }}
                                >
                                  {t.image_url ? (
                                    <img src={t.image_url} alt={t.title} className="w-full h-full object-cover" loading="lazy" />
                                  ) : (
                                    <Package size={18} style={{ color: "#c4b5fd" }} />
                                  )}
                                </div>

                                {/* Body */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold truncate" style={{ color: "rgba(255,255,255,0.95)" }}>
                                      {t.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {t.service_title && (
                                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0"
                                        style={{ background: "rgba(168,85,247,0.20)", color: "#d8b4fe", border: "1px solid rgba(168,85,247,0.30)" }}>
                                        {t.service_title}
                                      </span>
                                    )}
                                    {t.short_description && (
                                      <span className="text-xs truncate" style={{ color: "rgba(226,218,245,0.55)" }}>
                                        {t.short_description}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Price */}
                                <div className="shrink-0 text-right">
                                  {t.price != null && (
                                    <div className="text-sm font-bold" style={{ color: "#f0abfc" }}>
                                      {fmtPrice(t.price)}
                                    </div>
                                  )}
                                  {t.original_price != null && t.original_price > (t.price || 0) && (
                                    <div className="text-[11px] line-through" style={{ color: "rgba(226,218,245,0.45)" }}>
                                      {fmtPrice(t.original_price)}
                                    </div>
                                  )}
                                  {pct && (
                                    <div className="text-[10px] font-bold mt-0.5 px-1.5 py-0.5 rounded inline-block"
                                      style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.30), rgba(168,85,247,0.30))", color: "#fbcfe8", border: "1px solid rgba(236,72,153,0.40)" }}>
                                      -{pct}%
                                    </div>
                                  )}
                                </div>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  )}
                </>
              )}

              {/* ============== QUERY RESULTS ============== */}
              {!showEmptyState && (
                <>
                  <div className="px-5 pt-3 pb-1 flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: "rgba(226,218,245,0.55)" }}>
                      {loading ? "খোঁজা হচ্ছে..." : items.length ? `${items.length} টি ফলাফল` : "কোনো ফলাফল নেই"}
                    </span>
                  </div>
                  <ul className="py-1">
                    {items.map((s, i) => {
                      const Icon = iconFor(s.type);
                      const isActive = i === active;
                      return (
                        <li key={`${s.type}-${s.title}-${i}`}>
                          <button
                            type="button"
                            onMouseEnter={() => setActive(i)}
                            onClick={() => goHit(s)}
                            className="w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors"
                            style={{ background: isActive ? "linear-gradient(90deg, rgba(168,85,247,0.18), rgba(236,72,153,0.10))" : "transparent" }}
                          >
                            <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(168, 85, 247, 0.18)", border: "1px solid rgba(168,85,247,0.25)" }}>
                              <Icon size={14} style={{ color: "#c4b5fd" }} />
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="flex items-center gap-2">
                                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: "rgba(168,85,247,0.20)", color: "#d8b4fe", border: "1px solid rgba(168,85,247,0.30)" }}>{labelFor(s.type)}</span>
                                <span className="block text-sm font-semibold truncate" style={{ color: "rgba(255,255,255,0.95)" }}>
                                  <Highlighted text={s.title} query={query} />
                                </span>
                              </span>
                              {s.subtitle && <span className="block text-xs truncate mt-0.5" style={{ color: "rgba(226,218,245,0.55)" }}>
                                <Highlighted text={s.subtitle} query={query} />
                              </span>}
                            </span>
                            <ArrowUpRight size={14} className="shrink-0" style={{ color: isActive ? "#f0abfc" : "rgba(226,218,245,0.4)" }} />
                          </button>
                        </li>
                      );
                    })}
                    <li>
                      <button
                        type="button"
                        onClick={submit as any}
                        className="w-full flex items-center gap-3 px-5 py-2.5 text-left border-t hover:bg-[rgba(168,85,247,0.10)] transition-colors"
                        style={{ borderColor: "rgba(168,85,247,0.18)" }}
                      >
                        <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)", boxShadow: "0 4px 12px rgba(168,85,247,0.40)" }}>
                          <Search size={14} className="text-white" />
                        </span>
                        <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.95)" }}>
                          "<span style={{ color: "#f0abfc" }}>{query}</span>" দিয়ে সব ফলাফল দেখুন
                        </span>
                      </button>
                    </li>
                  </ul>
                </>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (variant === "desktop" && open && typeof document !== "undefined") {
    return createPortal(searchUi, document.body);
  }

  return searchUi;
};

export default SmartSearch;
