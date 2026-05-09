import { useState, useEffect, useRef, useMemo, FormEvent, KeyboardEvent } from "react";
import { Search, X, Clock, ArrowUpRight, Package, Wrench, FileText, Sparkles, Briefcase, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { runSearch, SearchHit, SearchType, highlight } from "@/lib/search";

const RECENT_KEY = "search_recent_v1";
const MAX_RECENT = 6;

interface Props {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
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
      {h.before}<mark style={{ background: "rgba(124,58,237,0.18)", color: "#7c3aed", padding: "0 2px", borderRadius: 3, fontWeight: 700 }}>{h.match}</mark>{h.after}
    </>
  );
};

const SmartSearch = ({ variant = "desktop", onNavigate }: Props) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [results, setResults] = useState<SearchHit[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { const raw = localStorage.getItem(RECENT_KEY); if (raw) setRecent(JSON.parse(raw)); } catch {}
  }, []);

  useEffect(() => {
    if (variant !== "desktop") return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); inputRef.current?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [variant]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

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

  const items = useMemo<SearchHit[]>(() => {
    if (query.trim()) return results;
    return recent.map(r => ({ type: "page" as const, title: r, href: `/search?q=${encodeURIComponent(r)}`, score: 0 }));
  }, [query, results, recent]);

  const saveRecent = (q: string) => {
    const next = [q, ...recent.filter(r => r !== q)].slice(0, MAX_RECENT);
    setRecent(next);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
  };

  const go = (s: SearchHit) => {
    saveRecent(s.title);
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    onNavigate?.();
    navigate(s.href);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (items[active]) return go(items[active]);
    saveRecent(q);
    setOpen(false);
    setQuery("");
    onNavigate?.();
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, items.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === "Escape") { setOpen(false); inputRef.current?.blur(); }
  };

  const clearRecent = () => { setRecent([]); try { localStorage.removeItem(RECENT_KEY); } catch {} };

  return (
    <div ref={wrapRef} className={`relative ${variant === "desktop" ? "hidden md:flex flex-1 max-w-md mx-auto" : "w-full"}`}>
      <form onSubmit={submit} className="w-full">
        <div
          className="group relative w-full flex items-center gap-2 px-4 py-2.5 rounded-full transition-all focus-within:scale-[1.005]"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(245, 242, 250, 0.88))",
            border: "1px solid rgba(120, 100, 180, 0.16)",
            boxShadow: open
              ? "0 8px 28px rgba(124, 58, 237, 0.18), inset 0 1px 0 rgba(255,255,255,1)"
              : "inset 0 1px 2px rgba(80, 50, 140, 0.05), 0 1px 0 rgba(255,255,255,0.9)",
          }}
        >
          <Search size={16} className="shrink-0 transition-colors group-focus-within:text-[#7c3aed]" style={{ color: "#9b8fb5" }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="প্রোডাক্ট, সার্ভিস, ব্লগ খুঁজুন..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-[#9b8fb5] font-medium"
            style={{ color: "#2a1f4a" }}
            autoComplete="off"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(""); inputRef.current?.focus(); }} className="p-0.5 rounded-full hover:bg-[rgba(124,58,237,0.1)]">
              <X size={14} style={{ color: "#9b8fb5" }} />
            </button>
          )}
          {variant === "desktop" && !query && (
            <kbd
              className="hidden lg:flex items-center gap-0.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md"
              style={{
                background: "linear-gradient(180deg, #ffffff, #f8f5fd)",
                border: "1px solid rgba(120, 100, 180, 0.18)",
                color: "#7c3aed",
                boxShadow: "0 1px 0 rgba(80, 50, 140, 0.08), inset 0 1px 0 rgba(255,255,255,1)",
              }}
            >⌘ K</kbd>
          )}
        </div>
      </form>

      <AnimatePresence>
        {open && (items.length > 0 || loading || query.trim()) && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.14 }}
            className="absolute left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50"
            style={{
              background: "rgba(255,255,255,0.98)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(120, 100, 180, 0.18)",
              boxShadow: "0 20px 50px rgba(80, 50, 140, 0.18), 0 4px 12px rgba(0,0,0,0.04)",
            }}
          >
            {!query.trim() && recent.length > 0 && (
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: "#9b8fb5" }}>সাম্প্রতিক</span>
                <button onClick={clearRecent} className="text-[11px] font-medium hover:underline" style={{ color: "#7c3aed" }}>Clear</button>
              </div>
            )}
            {query.trim() && (
              <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: "#9b8fb5" }}>
                  {loading ? "খোঁজা হচ্ছে..." : items.length ? `${items.length} টি Suggestion` : "কোনো ফলাফল নেই"}
                </span>
              </div>
            )}
            <ul className="max-h-[60vh] overflow-y-auto py-1">
              {items.map((s, i) => {
                const Icon = !query.trim() ? Clock : iconFor(s.type);
                const isActive = i === active;
                return (
                  <li key={`${s.type}-${s.title}-${i}`}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(s)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                      style={{ background: isActive ? "linear-gradient(90deg, rgba(124,58,237,0.08), rgba(236,72,153,0.05))" : "transparent" }}
                    >
                      <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(124, 58, 237, 0.1)" }}>
                        <Icon size={14} style={{ color: "#7c3aed" }} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-2">
                          {query.trim() && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: "rgba(124,58,237,0.12)", color: "#7c3aed" }}>{labelFor(s.type)}</span>
                          )}
                          <span className="block text-sm font-semibold truncate" style={{ color: "#2a1f4a" }}>
                            {query.trim() ? <Highlighted text={s.title} query={query} /> : s.title}
                          </span>
                        </span>
                        {s.subtitle && <span className="block text-xs truncate mt-0.5" style={{ color: "#9b8fb5" }}>
                          {query.trim() ? <Highlighted text={s.subtitle} query={query} /> : s.subtitle}
                        </span>}
                      </span>
                      <ArrowUpRight size={14} className="shrink-0" style={{ color: isActive ? "#7c3aed" : "#c8bfd8" }} />
                    </button>
                  </li>
                );
              })}
              {query.trim() && (
                <li>
                  <button
                    type="button"
                    onClick={submit as any}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left border-t"
                    style={{ borderColor: "rgba(120, 100, 180, 0.1)" }}
                  >
                    <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)" }}>
                      <Search size={14} className="text-white" />
                    </span>
                    <span className="text-sm font-semibold" style={{ color: "#2a1f4a" }}>
                      "<span style={{ color: "#7c3aed" }}>{query}</span>" দিয়ে সব ফলাফল দেখুন
                    </span>
                  </button>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartSearch;
