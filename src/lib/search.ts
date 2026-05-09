import { supabase } from "@/integrations/supabase/client";

export type SearchType = "service" | "package" | "blog" | "project" | "faq" | "page";

export type SearchHit = {
  type: SearchType;
  title: string;
  subtitle?: string;
  href: string;
  score: number;
  matchedField?: string;
  meta?: {
    image_url?: string | null;
    price?: number | null;
    original_price?: number | null;
    badge?: string | null;
    category?: string | null;
  };
};

export const STATIC_PAGES: { title: string; href: string; keywords: string[] }[] = [
  { title: "Home", href: "/", keywords: ["home", "হোম", "মূল"] },
  { title: "Services", href: "/services", keywords: ["service", "services", "সার্ভিস", "সেবা"] },
  { title: "Portfolio", href: "/portfolio", keywords: ["portfolio", "work", "পোর্টফোলিও", "কাজ"] },
  { title: "Pricing", href: "/pricing", keywords: ["pricing", "price", "মূল্য", "প্রাইস"] },
  { title: "Blog", href: "/blog", keywords: ["blog", "article", "ব্লগ", "আর্টিকেল"] },
  { title: "Contact", href: "/contact", keywords: ["contact", "যোগাযোগ"] },
  { title: "About Us", href: "/about", keywords: ["about", "আমাদের", "সম্পর্কে"] },
  { title: "Get Quote", href: "/get-quote", keywords: ["quote", "quotation", "কোটেশন", "অর্ডার"] },
  { title: "FAQ", href: "/faq", keywords: ["faq", "প্রশ্ন", "জিজ্ঞাসা"] },
  { title: "Dashboard", href: "/dashboard", keywords: ["dashboard", "ড্যাশবোর্ড", "প্রোফাইল"] },
  { title: "Careers", href: "/careers", keywords: ["career", "job", "ক্যারিয়ার", "চাকরি"] },
];

const norm = (s: string) => (s || "").toLowerCase().normalize("NFC");

const scoreMatch = (q: string, fields: { value?: string | null; weight: number }[]): { score: number; field?: string } => {
  const ql = norm(q);
  const tokens = ql.split(/\s+/).filter(Boolean);
  let best = 0;
  let bestField: string | undefined;
  for (const f of fields) {
    const v = norm(f.value || "");
    if (!v) continue;
    let s = 0;
    if (v === ql) s = 100;
    else if (v.startsWith(ql)) s = 80;
    else if (v.includes(ql)) s = 60;
    else {
      const matched = tokens.filter(t => v.includes(t)).length;
      if (matched) s = 30 + (matched / tokens.length) * 20;
    }
    s *= f.weight;
    if (s > best) { best = s; bestField = f.value || ""; }
  }
  return { score: best, field: bestField };
};

const orFilter = (q: string, cols: string[]) => {
  // sanitize for postgrest .or() — strip commas/parens which break the filter syntax
  const safe = q.replace(/[,()*]/g, " ").trim();
  if (!safe) return "";
  const like = `%${safe}%`;
  return cols.map(c => `${c}.ilike.${like}`).join(",");
};

export async function runSearch(query: string, opts?: { limitPerType?: number }): Promise<SearchHit[]> {
  const q = query.trim();
  if (!q) return [];
  const limit = opts?.limitPerType ?? 8;

  const [svc, pkg, blog, proj, faq] = await Promise.all([
    supabase.from("services").select("title,slug,short_description,description")
      .eq("is_published", true).or(orFilter(q, ["title", "short_description", "description", "slug"])).limit(limit),
    supabase.from("service_packages").select("id,title,short_description,description")
      .eq("is_published", true).or(orFilter(q, ["title", "short_description", "description"])).limit(limit),
    supabase.from("blog_posts").select("title,slug,excerpt,content")
      .eq("is_published", true).or(orFilter(q, ["title", "excerpt", "content"])).limit(limit),
    supabase.from("projects").select("title,slug,short_description,description,client_name")
      .eq("is_published", true).or(orFilter(q, ["title", "short_description", "description", "client_name"])).limit(limit),
    supabase.from("faqs").select("question,answer")
      .eq("is_published", true).or(orFilter(q, ["question", "answer"])).limit(limit),
  ]);

  const hits: SearchHit[] = [];

  svc.data?.forEach((s: any) => {
    const { score, field } = scoreMatch(q, [
      { value: s.title, weight: 3 },
      { value: s.short_description, weight: 1.5 },
      { value: s.description, weight: 1 },
    ]);
    hits.push({ type: "service", title: s.title, subtitle: s.short_description, href: `/services`, score, matchedField: field });
  });
  pkg.data?.forEach((p: any) => {
    const { score, field } = scoreMatch(q, [
      { value: p.title, weight: 3 },
      { value: p.short_description, weight: 1.5 },
      { value: p.description, weight: 1 },
    ]);
    hits.push({ type: "package", title: p.title, subtitle: p.short_description, href: `/product/${p.id}`, score, matchedField: field });
  });
  blog.data?.forEach((b: any) => {
    const { score, field } = scoreMatch(q, [
      { value: b.title, weight: 3 },
      { value: b.excerpt, weight: 1.5 },
      { value: b.content, weight: 0.8 },
    ]);
    hits.push({ type: "blog", title: b.title, subtitle: b.excerpt, href: `/blog`, score, matchedField: field });
  });
  proj.data?.forEach((p: any) => {
    const { score, field } = scoreMatch(q, [
      { value: p.title, weight: 3 },
      { value: p.short_description, weight: 1.5 },
      { value: p.client_name, weight: 1.2 },
      { value: p.description, weight: 0.8 },
    ]);
    hits.push({ type: "project", title: p.title, subtitle: p.short_description || p.client_name, href: `/portfolio`, score, matchedField: field });
  });
  faq.data?.forEach((f: any) => {
    const { score, field } = scoreMatch(q, [
      { value: f.question, weight: 3 },
      { value: f.answer, weight: 1 },
    ]);
    hits.push({ type: "faq", title: f.question, subtitle: f.answer, href: `/faq`, score, matchedField: field });
  });

  // pages
  const ql = norm(q);
  STATIC_PAGES.forEach(p => {
    const target = [p.title, ...p.keywords].join(" ");
    const { score } = scoreMatch(q, [{ value: target, weight: 1.2 }]);
    if (score > 0 || norm(p.title).includes(ql)) {
      hits.push({ type: "page", title: p.title, href: p.href, score: score || 20 });
    }
  });

  return hits.filter(h => h.score > 0).sort((a, b) => b.score - a.score);
}

export function highlight(text: string | undefined, query: string): { before: string; match: string; after: string } | null {
  if (!text || !query) return null;
  const t = text;
  const i = norm(t).indexOf(norm(query));
  if (i < 0) {
    // try first token
    const tok = query.trim().split(/\s+/)[0];
    if (!tok) return null;
    const j = norm(t).indexOf(norm(tok));
    if (j < 0) return null;
    return { before: t.slice(Math.max(0, j - 40), j), match: t.slice(j, j + tok.length), after: t.slice(j + tok.length, j + tok.length + 120) };
  }
  return { before: t.slice(Math.max(0, i - 40), i), match: t.slice(i, i + query.length), after: t.slice(i + query.length, i + query.length + 120) };
}
