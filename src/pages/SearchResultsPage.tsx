import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SEO } from "@/components/SEO";
import { Search, Package, Wrench, FileText, ArrowUpRight } from "lucide-react";

type Item = {
  type: "service" | "package" | "blog";
  title: string;
  subtitle?: string;
  href: string;
};

const SearchResultsPage = () => {
  const [params] = useSearchParams();
  const q = (params.get("q") || "").trim();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) { setItems([]); return; }
    setLoading(true);
    (async () => {
      const like = `%${q}%`;
      const [svc, pkg, blog] = await Promise.all([
        supabase.from("services").select("title,slug,short_description")
          .eq("is_published", true)
          .or(`title.ilike.${like},short_description.ilike.${like},description.ilike.${like}`)
          .limit(20),
        supabase.from("service_packages").select("id,title,short_description,description")
          .eq("is_published", true)
          .or(`title.ilike.${like},short_description.ilike.${like},description.ilike.${like}`)
          .limit(30),
        supabase.from("blog_posts").select("title,slug,excerpt")
          .eq("is_published", true)
          .or(`title.ilike.${like},excerpt.ilike.${like},content.ilike.${like}`)
          .limit(20),
      ]);
      const out: Item[] = [];
      svc.data?.forEach((s: any) => out.push({ type: "service", title: s.title, subtitle: s.short_description, href: `/services` }));
      pkg.data?.forEach((p: any) => out.push({ type: "package", title: p.title, subtitle: p.short_description, href: `/product/${p.id}` }));
      blog.data?.forEach((b: any) => out.push({ type: "blog", title: b.title, subtitle: b.excerpt, href: `/blog` }));
      setItems(out);
      setLoading(false);
    })();
  }, [q]);

  const iconFor = (t: Item["type"]) => t === "service" ? Wrench : t === "package" ? Package : FileText;
  const labelFor = (t: Item["type"]) => t === "service" ? "Service" : t === "package" ? "Package" : "Blog";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #0a0a1a, #141432)" }}>
      <SEO title={q ? `Search: ${q} — Shah ED IT` : "Search — Shah ED IT"} description={`Search results for "${q}"`} />
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
            style={{ background: "rgba(124,58,237,0.15)", color: "#c4b5fd" }}>
            <Search size={12} /> Search Results
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {q ? <>"<span style={{ color: "#a78bfa" }}>{q}</span>" এর ফলাফল</> : "কিছু খুঁজুন"}
          </h1>
          {!loading && q && (
            <p className="mt-2 text-sm" style={{ color: "#9b8fb5" }}>{items.length} টি ফলাফল পাওয়া গেছে</p>
          )}
        </div>

        {loading && (
          <div className="py-20 text-center" style={{ color: "#9b8fb5" }}>খোঁজা হচ্ছে...</div>
        )}

        {!loading && q && items.length === 0 && (
          <div className="py-20 text-center rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-white text-lg font-semibold mb-2">কোনো ফলাফল পাওয়া যায়নি</p>
            <p className="text-sm" style={{ color: "#9b8fb5" }}>অন্য কোনো keyword দিয়ে চেষ্টা করুন</p>
          </div>
        )}

        <div className="space-y-3">
          {items.map((s, i) => {
            const Icon = iconFor(s.type);
            return (
              <Link
                key={`${s.type}-${i}`}
                to={s.href}
                className="group flex items-center gap-4 p-4 rounded-2xl transition-all hover:scale-[1.01]"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <span className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(236,72,153,0.15))" }}>
                  <Icon size={20} style={{ color: "#a78bfa" }} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{ background: "rgba(124,58,237,0.2)", color: "#c4b5fd" }}>{labelFor(s.type)}</span>
                  </div>
                  <h3 className="text-white font-semibold truncate">{s.title}</h3>
                  {s.subtitle && <p className="text-sm truncate" style={{ color: "#9b8fb5" }}>{s.subtitle}</p>}
                </div>
                <ArrowUpRight size={20} className="shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: "#a78bfa" }} />
              </Link>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default SearchResultsPage;
