import { useEffect, useMemo, useState, FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SEO } from "@/components/SEO";
import { Search, Package, Wrench, FileText, ArrowUpRight, Briefcase, HelpCircle, Sparkles, Filter } from "lucide-react";
import { runSearch, SearchHit, SearchType, highlight } from "@/lib/search";

const FILTERS: { key: SearchType | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "service", label: "Services" },
  { key: "package", label: "Packages" },
  { key: "blog", label: "Blog" },
  { key: "project", label: "Projects" },
  { key: "faq", label: "FAQ" },
  { key: "page", label: "Pages" },
];

const iconFor = (t: SearchType) =>
  t === "service" ? Wrench : t === "package" ? Package : t === "blog" ? FileText : t === "project" ? Briefcase : t === "faq" ? HelpCircle : Sparkles;

const labelFor = (t: SearchType) =>
  t === "service" ? "Service" : t === "package" ? "Package" : t === "blog" ? "Blog" : t === "project" ? "Project" : t === "faq" ? "FAQ" : "Page";

const Highlighted = ({ text, query }: { text?: string; query: string }) => {
  if (!text) return null;
  const h = highlight(text, query);
  if (!h) return <>{text.slice(0, 160)}{text.length > 160 ? "…" : ""}</>;
  return (
    <>
      {h.before && <>…{h.before}</>}
      <mark style={{ background: "rgba(124,58,237,0.22)", color: "#c4b5fd", padding: "0 3px", borderRadius: 3, fontWeight: 700 }}>{h.match}</mark>
      {h.after}{h.after.length >= 120 ? "…" : ""}
    </>
  );
};

const SearchResultsPage = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const q = (params.get("q") || "").trim();
  const filter = (params.get("type") || "all") as SearchType | "all";
  const [items, setItems] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState(q);
  const [tookMs, setTookMs] = useState(0);

  useEffect(() => { setInput(q); }, [q]);

  useEffect(() => {
    if (!q) { setItems([]); return; }
    setLoading(true);
    const start = performance.now();
    runSearch(q, { limitPerType: 20 })
      .then(hits => { setItems(hits); setTookMs(Math.round(performance.now() - start)); })
      .finally(() => setLoading(false));
  }, [q]);

  const filtered = useMemo(() => filter === "all" ? items : items.filter(i => i.type === filter), [items, filter]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    items.forEach(i => { c[i.type] = (c[i.type] || 0) + 1; });
    return c;
  }, [items]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = input.trim();
    if (!v) return;
    const next = new URLSearchParams(params);
    next.set("q", v);
    setParams(next);
  };

  const setFilter = (f: SearchType | "all") => {
    const next = new URLSearchParams(params);
    if (f === "all") next.delete("type"); else next.set("type", f);
    setParams(next);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #0a0a1a, #141432)" }}>
      <SEO title={q ? `Search: ${q} — Shah ED IT` : "Search — Shah ED IT"} description={`Search results for "${q}"`} />
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-5xl">
        {/* Search bar */}
        <form onSubmit={submit} className="mb-6">
          <div className="flex items-center gap-2 px-5 py-3 rounded-full"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <Search size={18} style={{ color: "#a78bfa" }} />
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="যেকোনো কিছু খুঁজুন..."
              className="flex-1 bg-transparent outline-none text-base text-white placeholder:text-[#9b8fb5]"
            />
            <button type="submit" className="px-4 py-1.5 rounded-full text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
              Search
            </button>
          </div>
        </form>

        {q && (
          <div className="mb-5">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              "<span style={{ color: "#a78bfa" }}>{q}</span>" এর ফলাফল
            </h1>
            {!loading && (
              <p className="text-sm" style={{ color: "#9b8fb5" }}>
                প্রায় {items.length} টি ফলাফল ({(tookMs / 1000).toFixed(2)} সেকেন্ড)
              </p>
            )}
          </div>
        )}

        {/* Filter chips */}
        {q && items.length > 0 && (
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            <Filter size={14} style={{ color: "#9b8fb5" }} className="shrink-0" />
            {FILTERS.map(f => {
              const c = counts[f.key] || 0;
              if (f.key !== "all" && !c) return null;
              const active = filter === f.key;
              return (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: active ? "linear-gradient(135deg, #7c3aed, #ec4899)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${active ? "transparent" : "rgba(255,255,255,0.1)"}`,
                    color: active ? "#fff" : "#c4b5fd",
                  }}>
                  {f.label} <span className="opacity-70 ml-1">{c}</span>
                </button>
              );
            })}
          </div>
        )}

        {loading && (
          <div className="py-20 text-center" style={{ color: "#9b8fb5" }}>খোঁজা হচ্ছে...</div>
        )}

        {!loading && q && filtered.length === 0 && (
          <div className="py-20 text-center rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-white text-lg font-semibold mb-2">কোনো ফলাফল পাওয়া যায়নি</p>
            <p className="text-sm mb-4" style={{ color: "#9b8fb5" }}>অন্য keyword দিয়ে চেষ্টা করুন বা spelling check করুন</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["Web Development", "App", "Logo", "SEO", "Hosting"].map(s => (
                <button key={s} onClick={() => { setInput(s); navigate(`/search?q=${encodeURIComponent(s)}`); }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: "rgba(124,58,237,0.15)", color: "#c4b5fd", border: "1px solid rgba(124,58,237,0.3)" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((s, i) => {
            const Icon = iconFor(s.type);
            const m = s.meta;
            const pct = m?.original_price && m?.price && m.original_price > m.price
              ? Math.round(((m.original_price - m.price) / m.original_price) * 100) : null;
            const fmt = (n?: number | null) => n == null ? "" : "৳" + Math.round(Number(n)).toLocaleString("en-US");
            return (
              <Link
                key={`${s.type}-${i}`}
                to={s.href}
                className="group block p-4 rounded-2xl transition-all hover:scale-[1.005]"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(236,72,153,0.15))" }}>
                    <Icon size={14} style={{ color: "#a78bfa" }} />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{ background: "rgba(124,58,237,0.15)", color: "#c4b5fd" }}>{labelFor(s.type)}</span>
                  {m?.category && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{ background: "rgba(236,72,153,0.15)", color: "#f9a8d4" }}>{m.category}</span>
                  )}
                  {m?.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{ background: "rgba(252,211,77,0.20)", color: "#fcd34d" }}>{m.badge}</span>
                  )}
                  <span className="text-xs ml-auto truncate max-w-[40%]" style={{ color: "#9b8fb5" }}>{s.href}</span>
                </div>
                <div className="flex items-start gap-3">
                  {s.type === "package" && (
                    <div
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl shrink-0 overflow-hidden flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(236,72,153,0.18))" }}
                    >
                      {m?.image_url ? (
                        <img src={m.image_url} alt={s.title} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <Package size={22} style={{ color: "#a78bfa" }} />
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-lg font-semibold mb-1 group-hover:underline">
                      <Highlighted text={s.title} query={q} />
                    </h3>
                    {s.subtitle && (
                      <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "#b8acce" }}>
                        <Highlighted text={s.subtitle} query={q} />
                      </p>
                    )}
                    {s.type === "package" && m?.price != null && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-base font-bold" style={{ color: "#a78bfa" }}>{fmt(m.price)}</span>
                        {m.original_price != null && m.original_price > m.price && (
                          <span className="text-xs line-through" style={{ color: "#6b5d8a" }}>{fmt(m.original_price)}</span>
                        )}
                        {pct && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ background: "rgba(252,211,77,0.20)", color: "#fcd34d" }}>-{pct}%</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {!q && (
          <div className="py-20 text-center">
            <Search size={40} className="mx-auto mb-4" style={{ color: "#7c3aed" }} />
            <h1 className="text-2xl font-bold text-white mb-2">কিছু খুঁজুন</h1>
            <p style={{ color: "#9b8fb5" }}>Services, Packages, Blog, Projects, FAQ - সব কিছু এক জায়গায়</p>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
};

export default SearchResultsPage;
