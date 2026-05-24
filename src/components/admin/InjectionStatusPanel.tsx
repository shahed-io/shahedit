import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, RefreshCw, Activity, Code2, Tag } from "lucide-react";

type Check = {
  label: string;
  category: "Verification" | "Analytics" | "Pixel" | "Schema" | "Meta";
  detect: () => { ok: boolean; detail?: string };
};

const metaCheck = (name: string): { ok: boolean; detail?: string } => {
  const el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  return el ? { ok: true, detail: el.content.slice(0, 40) } : { ok: false };
};
const propCheck = (prop: string): { ok: boolean; detail?: string } => {
  const el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement | null;
  return el ? { ok: true, detail: el.content.slice(0, 40) } : { ok: false };
};
const scriptCheck = (id: string, urlPart?: string): { ok: boolean; detail?: string } => {
  if (document.getElementById(id)) return { ok: true, detail: `#${id}` };
  if (urlPart) {
    const el = document.querySelector(`script[src*="${urlPart}"]`);
    if (el) return { ok: true, detail: urlPart };
  }
  return { ok: false };
};
const globalCheck = (name: string): { ok: boolean; detail?: string } => {
  const v = (window as any)[name];
  return v ? { ok: true, detail: typeof v } : { ok: false };
};

const CHECKS: Check[] = [
  // Verifications
  { label: "Google Search Console", category: "Verification", detect: () => metaCheck("google-site-verification") },
  { label: "Bing Webmaster", category: "Verification", detect: () => metaCheck("msvalidate.01") },
  { label: "Yandex Webmaster", category: "Verification", detect: () => metaCheck("yandex-verification") },
  { label: "Pinterest Verify", category: "Verification", detect: () => metaCheck("p:domain_verify") },
  { label: "Naver Verify", category: "Verification", detect: () => metaCheck("naver-site-verification") },
  { label: "Baidu Verify", category: "Verification", detect: () => metaCheck("baidu-site-verification") },
  { label: "Ahrefs Verify", category: "Verification", detect: () => metaCheck("ahrefs-site-verification") },
  { label: "Norton Safe Web", category: "Verification", detect: () => metaCheck("norton-safeweb-site-verification") },
  { label: "Facebook App ID", category: "Verification", detect: () => propCheck("fb:app_id") },

  // Analytics
  { label: "Google Tag Manager", category: "Analytics", detect: () => scriptCheck("gtm-script", "googletagmanager.com/gtm.js") },
  { label: "Google Analytics 4 (gtag)", category: "Analytics", detect: () => scriptCheck("gtag-loader", "googletagmanager.com/gtag/js") },
  { label: "dataLayer (GA/GTM)", category: "Analytics", detect: () => globalCheck("dataLayer") },
  { label: "Microsoft Clarity", category: "Analytics", detect: () => ({ ok: !!document.getElementById("clarity-script") || !!(window as any).clarity, detail: (window as any).clarity ? "window.clarity ✓" : undefined }) },
  { label: "Hotjar", category: "Analytics", detect: () => ({ ok: !!document.getElementById("hotjar-script") || !!(window as any).hj }) },
  { label: "Yandex Metrica", category: "Analytics", detect: () => ({ ok: !!document.getElementById("ym-script") || !!(window as any).ym }) },

  // Pixels
  { label: "Google AdSense", category: "Pixel", detect: () => scriptCheck("adsense-script", "adsbygoogle.js") },
  { label: "Meta (Facebook) Pixel", category: "Pixel", detect: () => ({ ok: !!document.getElementById("fb-pixel") || !!(window as any).fbq }) },
  { label: "TikTok Pixel", category: "Pixel", detect: () => ({ ok: !!document.getElementById("tiktok-pixel") || !!(window as any).ttq }) },
  { label: "LinkedIn Insight", category: "Pixel", detect: () => ({ ok: !!document.getElementById("linkedin-insight") || !!(window as any).lintrk }) },
  { label: "Twitter / X Pixel", category: "Pixel", detect: () => ({ ok: !!document.getElementById("twitter-pixel") || !!(window as any).twq }) },
  { label: "Pinterest Tag", category: "Pixel", detect: () => ({ ok: !!document.getElementById("pinterest-tag") || !!(window as any).pintrk }) },
  { label: "Snapchat Pixel", category: "Pixel", detect: () => ({ ok: !!document.getElementById("snap-pixel") || !!(window as any).snaptr }) },

  // Core meta
  { label: "Title tag", category: "Meta", detect: () => ({ ok: !!document.title, detail: document.title.slice(0, 50) }) },
  { label: "Meta description", category: "Meta", detect: () => metaCheck("description") },
  { label: "Canonical URL", category: "Meta", detect: () => {
    const el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    return el ? { ok: true, detail: el.href } : { ok: false };
  }},
  { label: "Open Graph title", category: "Meta", detect: () => propCheck("og:title") },
  { label: "Open Graph image", category: "Meta", detect: () => propCheck("og:image") },
  { label: "Twitter card", category: "Meta", detect: () => metaCheck("twitter:card") },
  { label: "Robots meta", category: "Meta", detect: () => metaCheck("robots") },
];

type SchemaInfo = { type: string; valid: boolean; size: number; error?: string };

const ICONS: Record<Check["category"], any> = {
  Verification: Tag,
  Analytics: Activity,
  Pixel: Activity,
  Schema: Code2,
  Meta: Tag,
};

export function InjectionStatusPanel() {
  const [results, setResults] = useState<Array<Check & { ok: boolean; detail?: string }>>([]);
  const [schemas, setSchemas] = useState<SchemaInfo[]>([]);
  const [tick, setTick] = useState(0);

  const scan = useCallback(() => {
    setResults(CHECKS.map((c) => ({ ...c, ...c.detect() })));
    const ldNodes = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    const info: SchemaInfo[] = ldNodes.map((n) => {
      const raw = n.textContent || "";
      try {
        const parsed = JSON.parse(raw);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        const types = arr.map((p) => p["@type"] || "Unknown").join(", ");
        return { type: types, valid: true, size: raw.length };
      } catch (e: any) {
        return { type: "Invalid JSON", valid: false, size: raw.length, error: e.message };
      }
    });
    setSchemas(info);
  }, []);

  useEffect(() => {
    const t = setTimeout(scan, 800); // wait for injection
    const i = setInterval(scan, 5000);
    return () => { clearTimeout(t); clearInterval(i); };
  }, [scan, tick]);

  const grouped = results.reduce((acc, r) => {
    (acc[r.category] ||= []).push(r);
    return acc;
  }, {} as Record<string, typeof results>);

  const activeCount = results.filter((r) => r.ok).length;
  const schemaValidCount = schemas.filter((s) => s.valid).length;

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 border-emerald-500/20 p-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-emerald-300 font-semibold flex items-center gap-2">
            <Activity size={18} /> Live Injection Status
          </h3>
          <p className="text-xs text-white/60 mt-1">
            এই page-এর DOM থেকে real-time detect করা হচ্ছে।
            <span className="text-emerald-300 font-semibold ml-1">{activeCount}</span>/{results.length} active ·
            <span className="text-emerald-300 font-semibold ml-1">{schemaValidCount}</span>/{schemas.length} schema valid
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setTick((t) => t + 1)} className="border-white/20">
          <RefreshCw size={14} className="mr-1.5" /> Rescan
        </Button>
      </Card>

      {Object.entries(grouped).map(([cat, items]) => {
        const Icon = ICONS[cat as Check["category"]] || Tag;
        return (
          <Card key={cat} className="bg-white/5 border-white/10 p-4">
            <h4 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
              <Icon size={14} className="text-amber-300" /> {cat}
              <Badge variant="outline" className="text-[10px] border-white/20 text-white/60">
                {items.filter((i) => i.ok).length}/{items.length}
              </Badge>
            </h4>
            <div className="grid sm:grid-cols-2 gap-2">
              {items.map((r) => (
                <div key={r.label} className="flex items-start gap-2 text-sm p-2 rounded bg-white/[0.02] border border-white/5">
                  {r.ok ? (
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={16} className="text-white/30 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className={r.ok ? "text-white/90" : "text-white/50"}>{r.label}</div>
                    {r.detail && <div className="text-[10px] text-white/40 truncate font-mono">{r.detail}</div>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      })}

      <Card className="bg-white/5 border-white/10 p-4">
        <h4 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
          <Code2 size={14} className="text-amber-300" /> JSON-LD Structured Data
          <Badge variant="outline" className="text-[10px] border-white/20 text-white/60">
            {schemas.length} injected
          </Badge>
        </h4>
        {schemas.length === 0 ? (
          <p className="text-xs text-white/50">No JSON-LD schemas detected on this page.</p>
        ) : (
          <div className="space-y-2">
            {schemas.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-sm p-2 rounded bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 min-w-0">
                  {s.valid ? (
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle size={16} className="text-rose-400 shrink-0" />
                  )}
                  <span className="text-white/80 font-mono text-xs truncate">{s.type}</span>
                  {s.error && <span className="text-rose-300 text-[10px]">{s.error}</span>}
                </div>
                <span className="text-[10px] text-white/40">{s.size} bytes</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer"
             className="text-xs text-amber-300 hover:text-amber-200 underline">
            → Test in Google Rich Results
          </a>
          <a href="https://validator.schema.org/" target="_blank" rel="noopener noreferrer"
             className="text-xs text-amber-300 hover:text-amber-200 underline">
            → Schema.org Validator
          </a>
          <a href="https://www.facebook.com/tools/debug/" target="_blank" rel="noopener noreferrer"
             className="text-xs text-amber-300 hover:text-amber-200 underline">
            → Facebook Sharing Debugger
          </a>
        </div>
      </Card>
    </div>
  );
}
