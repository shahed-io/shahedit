import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search, FileText, Globe, Shield, Code2, Share2, ArrowLeftRight, LinkIcon,
  Save, Plus, Trash2, RefreshCw, ExternalLink, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type SeoPage = {
  id?: string;
  route_path: string;
  page_label: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  canonical_url: string | null;
  robots: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  twitter_card: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image: string | null;
  schema_json: any;
  is_active: boolean;
};

const DEFAULT_PAGE: SeoPage = {
  route_path: "/",
  page_label: "Homepage",
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  canonical_url: "",
  robots: "index,follow",
  og_title: "",
  og_description: "",
  og_image: "",
  twitter_card: "summary_large_image",
  twitter_title: "",
  twitter_description: "",
  twitter_image: "",
  schema_json: null,
  is_active: true,
};

// ─────────────────────────── Pages list (shared) ───────────────────────────
function usePages() {
  const [pages, setPages] = useState<SeoPage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("seo_pages")
      .select("*")
      .order("route_path", { ascending: true });
    if (error) toast.error(error.message);
    setPages((data as SeoPage[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  return { pages, setPages, loading, reload: load };
}

// ─────────────────────────── Page Picker ───────────────────────────
function PagePicker({
  pages, selectedId, onSelect, onCreate,
}: {
  pages: SeoPage[]; selectedId?: string;
  onSelect: (id: string) => void; onCreate: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <select
        value={selectedId || ""}
        onChange={(e) => onSelect(e.target.value)}
        className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-sm min-w-[260px]"
      >
        <option value="">— Select a route —</option>
        {pages.map((p) => (
          <option key={p.id} value={p.id}>
            {p.route_path} {p.page_label ? `(${p.page_label})` : ""}
          </option>
        ))}
      </select>
      <Button size="sm" onClick={onCreate} className="gap-2">
        <Plus className="w-4 h-4" /> Add Route
      </Button>
    </div>
  );
}

// ─────────────────────────── Save helper ───────────────────────────
async function savePage(page: SeoPage) {
  const payload = { ...page, updated_at: new Date().toISOString() };
  if (page.id) {
    const { error } = await supabase.from("seo_pages").update(payload as any).eq("id", page.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("seo_pages").insert(payload as any);
    if (error) throw error;
  }
}

// ─────────────────────────── Meta Title Tab ───────────────────────────
function MetaTitleTab() {
  const { pages, reload, loading } = usePages();
  const [selectedId, setSelectedId] = useState<string>("");
  const [draft, setDraft] = useState<SeoPage | null>(null);

  useEffect(() => {
    if (selectedId) setDraft(pages.find(p => p.id === selectedId) || null);
  }, [selectedId, pages]);

  const handleCreate = async () => {
    const route = prompt("New route path (e.g. /pricing)");
    if (!route) return;
    try {
      await savePage({ ...DEFAULT_PAGE, route_path: route, page_label: route });
      toast.success("Route added");
      await reload();
    } catch (e: any) { toast.error(e.message); }
  };

  const save = async () => {
    if (!draft) return;
    try { await savePage(draft); toast.success("Saved"); await reload(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <Card className="p-5 bg-slate-900/40 border-white/10">
      <PagePicker pages={pages} selectedId={selectedId} onSelect={setSelectedId} onCreate={handleCreate} />
      {loading && <p className="text-slate-400 text-sm">Loading…</p>}
      {draft && (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400">Meta Title (recommended ≤ 60 chars)</label>
            <Input value={draft.meta_title || ""} maxLength={120}
              onChange={(e) => setDraft({ ...draft, meta_title: e.target.value })} />
            <p className="text-[11px] text-slate-500 mt-1">{(draft.meta_title || "").length} chars</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/30 p-3">
            <p className="text-xs text-slate-500 mb-1">Google preview</p>
            <p className="text-blue-400 text-base leading-tight truncate">{draft.meta_title || "Untitled"}</p>
            <p className="text-emerald-400 text-xs mt-1">https://shahedit.com{draft.route_path}</p>
            <p className="text-slate-300 text-xs mt-1 line-clamp-2">{draft.meta_description || "—"}</p>
          </div>
          <Button onClick={save} className="gap-2"><Save className="w-4 h-4" /> Save</Button>
        </div>
      )}
    </Card>
  );
}

// ─────────────────────────── Meta Description Tab ───────────────────────────
function MetaDescriptionTab() {
  const { pages, reload, loading } = usePages();
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<SeoPage | null>(null);
  useEffect(() => { if (selectedId) setDraft(pages.find(p => p.id === selectedId) || null); }, [selectedId, pages]);

  const save = async () => {
    if (!draft) return;
    try { await savePage(draft); toast.success("Saved"); await reload(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <Card className="p-5 bg-slate-900/40 border-white/10">
      <PagePicker pages={pages} selectedId={selectedId} onSelect={setSelectedId} onCreate={() => toast.info("Add routes in Meta Title tab")} />
      {loading && <p className="text-slate-400 text-sm">Loading…</p>}
      {draft && (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400">Meta Description (recommended ≤ 160 chars)</label>
            <Textarea rows={3} maxLength={320}
              value={draft.meta_description || ""}
              onChange={(e) => setDraft({ ...draft, meta_description: e.target.value })} />
            <p className="text-[11px] text-slate-500 mt-1">{(draft.meta_description || "").length} chars</p>
          </div>
          <div>
            <label className="text-xs text-slate-400">Meta Keywords (comma-separated)</label>
            <Input value={draft.meta_keywords || ""}
              onChange={(e) => setDraft({ ...draft, meta_keywords: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-slate-400">Canonical URL</label>
            <Input value={draft.canonical_url || ""} placeholder="https://shahedit.com/path"
              onChange={(e) => setDraft({ ...draft, canonical_url: e.target.value })} />
          </div>
          <Button onClick={save} className="gap-2"><Save className="w-4 h-4" /> Save</Button>
        </div>
      )}
    </Card>
  );
}

// ─────────────────────────── Sitemap Tab ───────────────────────────
function SitemapTab() {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/sitemap.xml").then(r => r.text()).then(t => { setContent(t); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const urls = useMemo(() => {
    const m = [...(content.matchAll(/<loc>([^<]+)<\/loc>/g))];
    return m.map(x => x[1]);
  }, [content]);

  return (
    <Card className="p-5 bg-slate-900/40 border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-white font-semibold">Sitemap.xml</h3>
          <p className="text-xs text-slate-400">Auto-generated at build time from your routes.</p>
        </div>
        <a href="/sitemap.xml" target="_blank" rel="noreferrer">
          <Button size="sm" variant="outline" className="gap-2"><ExternalLink className="w-4 h-4" /> Open</Button>
        </a>
      </div>
      {loading ? <p className="text-slate-400 text-sm">Loading…</p> : (
        <>
          <p className="text-xs text-slate-400 mb-2">{urls.length} URLs indexed</p>
          <div className="max-h-[300px] overflow-y-auto space-y-1 mb-3">
            {urls.map(u => (
              <div key={u} className="text-xs text-emerald-400 font-mono px-2 py-1 rounded bg-black/30">{u}</div>
            ))}
          </div>
          <pre className="text-[11px] text-slate-400 bg-black/40 p-3 rounded-lg max-h-[260px] overflow-auto">{content}</pre>
        </>
      )}
    </Card>
  );
}

// ─────────────────────────── Robots Tab ───────────────────────────
function RobotsTab() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/robots.txt").then(r => r.text()).then(t => { setContent(t); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  return (
    <Card className="p-5 bg-slate-900/40 border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-white font-semibold">robots.txt</h3>
          <p className="text-xs text-slate-400">Controls what crawlers can index.</p>
        </div>
        <a href="/robots.txt" target="_blank" rel="noreferrer">
          <Button size="sm" variant="outline" className="gap-2"><ExternalLink className="w-4 h-4" /> Open</Button>
        </a>
      </div>
      {loading ? <p className="text-slate-400 text-sm">Loading…</p> : (
        <pre className="text-xs text-slate-200 bg-black/40 p-4 rounded-lg whitespace-pre-wrap font-mono">{content}</pre>
      )}
      <p className="text-[11px] text-slate-500 mt-3">
        Edit <code className="text-emerald-400">public/robots.txt</code> in code to modify. Admin/CEO routes are blocked by default.
      </p>
    </Card>
  );
}

// ─────────────────────────── Schema Tab ───────────────────────────
function SchemaTab() {
  const { pages, reload } = usePages();
  const [selectedId, setSelectedId] = useState("");
  const [json, setJson] = useState<string>("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const p = pages.find(x => x.id === selectedId);
    setJson(p?.schema_json ? JSON.stringify(p.schema_json, null, 2) : "");
    setErr("");
  }, [selectedId, pages]);

  const presets: Record<string, any> = {
    Organization: { "@context": "https://schema.org", "@type": "Organization", name: "Shahed IT", url: "https://shahedit.com" },
    Article: { "@context": "https://schema.org", "@type": "Article", headline: "", author: { "@type": "Person", name: "" }, datePublished: new Date().toISOString() },
    Product: { "@context": "https://schema.org", "@type": "Product", name: "", description: "", offers: { "@type": "Offer", price: "0", priceCurrency: "BDT" } },
    FAQPage: { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: "?", acceptedAnswer: { "@type": "Answer", text: "" } }] },
    BreadcrumbList: { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [] },
  };

  const save = async () => {
    const p = pages.find(x => x.id === selectedId);
    if (!p) return;
    try {
      const parsed = json.trim() ? JSON.parse(json) : null;
      setErr("");
      await savePage({ ...p, schema_json: parsed });
      toast.success("Schema saved");
      await reload();
    } catch (e: any) {
      setErr(e.message); toast.error("Invalid JSON");
    }
  };

  return (
    <Card className="p-5 bg-slate-900/40 border-white/10">
      <PagePicker pages={pages} selectedId={selectedId} onSelect={setSelectedId} onCreate={() => toast.info("Add routes in Meta Title tab")} />
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.keys(presets).map(k => (
          <Button key={k} size="sm" variant="outline"
            onClick={() => setJson(JSON.stringify(presets[k], null, 2))}>{k}</Button>
        ))}
      </div>
      <Textarea rows={14} value={json} onChange={(e) => setJson(e.target.value)}
        className="font-mono text-xs" placeholder="Paste JSON-LD here…" />
      {err && <p className="text-rose-400 text-xs mt-2">{err}</p>}
      <Button onClick={save} className="gap-2 mt-3"><Save className="w-4 h-4" /> Save Schema</Button>
    </Card>
  );
}

// ─────────────────────────── Open Graph Tab ───────────────────────────
function OpenGraphTab() {
  const { pages, reload } = usePages();
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<SeoPage | null>(null);
  useEffect(() => { setDraft(pages.find(p => p.id === selectedId) || null); }, [selectedId, pages]);

  const save = async () => {
    if (!draft) return;
    try { await savePage(draft); toast.success("Saved"); await reload(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <Card className="p-5 bg-slate-900/40 border-white/10">
      <PagePicker pages={pages} selectedId={selectedId} onSelect={setSelectedId} onCreate={() => toast.info("Add routes in Meta Title tab")} />
      {draft && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="text-white text-sm font-semibold flex items-center gap-2"><Share2 className="w-4 h-4 text-purple-400" /> Open Graph (Facebook/LinkedIn)</h4>
            <Input placeholder="og:title" value={draft.og_title || ""} onChange={(e) => setDraft({ ...draft, og_title: e.target.value })} />
            <Textarea rows={2} placeholder="og:description" value={draft.og_description || ""} onChange={(e) => setDraft({ ...draft, og_description: e.target.value })} />
            <Input placeholder="og:image URL (1200x630)" value={draft.og_image || ""} onChange={(e) => setDraft({ ...draft, og_image: e.target.value })} />
            {draft.og_image && <img src={draft.og_image} alt="og preview" className="w-full rounded-lg border border-white/10" />}
          </div>
          <div className="space-y-3">
            <h4 className="text-white text-sm font-semibold flex items-center gap-2"><Share2 className="w-4 h-4 text-sky-400" /> Twitter / X</h4>
            <select value={draft.twitter_card || "summary_large_image"} onChange={(e) => setDraft({ ...draft, twitter_card: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-sm">
              <option value="summary">summary</option>
              <option value="summary_large_image">summary_large_image</option>
            </select>
            <Input placeholder="twitter:title" value={draft.twitter_title || ""} onChange={(e) => setDraft({ ...draft, twitter_title: e.target.value })} />
            <Textarea rows={2} placeholder="twitter:description" value={draft.twitter_description || ""} onChange={(e) => setDraft({ ...draft, twitter_description: e.target.value })} />
            <Input placeholder="twitter:image URL" value={draft.twitter_image || ""} onChange={(e) => setDraft({ ...draft, twitter_image: e.target.value })} />
          </div>
        </div>
      )}
      {draft && <Button onClick={save} className="gap-2 mt-4"><Save className="w-4 h-4" /> Save OG/Twitter</Button>}
    </Card>
  );
}

// ─────────────────────────── Redirects Tab ───────────────────────────
function RedirectsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ from_path: "", to_path: "", status_code: 301, is_active: true });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("redirects").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows(data || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.from_path || !form.to_path) return toast.error("Both paths required");
    const { error } = await supabase.from("redirects").insert(form as any);
    if (error) return toast.error(error.message);
    toast.success("Redirect added"); setForm({ from_path: "", to_path: "", status_code: 301, is_active: true }); load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this redirect?")) return;
    const { error } = await supabase.from("redirects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  const toggle = async (r: any) => {
    const { error } = await supabase.from("redirects").update({ is_active: !r.is_active } as any).eq("id", r.id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <Card className="p-5 bg-slate-900/40 border-white/10">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><ArrowLeftRight className="w-4 h-4" /> 301/302 Redirect Manager</h3>
      <div className="grid md:grid-cols-4 gap-2 mb-4">
        <Input placeholder="From /old" value={form.from_path} onChange={e => setForm({ ...form, from_path: e.target.value })} />
        <Input placeholder="To /new" value={form.to_path} onChange={e => setForm({ ...form, to_path: e.target.value })} />
        <select value={form.status_code} onChange={e => setForm({ ...form, status_code: Number(e.target.value) })}
          className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-sm">
          <option value={301}>301 Permanent</option>
          <option value={302}>302 Temporary</option>
        </select>
        <Button onClick={add} className="gap-2"><Plus className="w-4 h-4" /> Add</Button>
      </div>
      {loading ? <p className="text-slate-400 text-sm">Loading…</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-400 text-xs border-b border-white/10">
              <th className="py-2">From</th><th>To</th><th>Code</th><th>Hits</th><th>Status</th><th></th>
            </tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-b border-white/5 text-slate-200">
                  <td className="py-2 font-mono text-xs">{r.from_path}</td>
                  <td className="font-mono text-xs">{r.to_path}</td>
                  <td>{r.status_code}</td>
                  <td>{r.hits || 0}</td>
                  <td>
                    <button onClick={() => toggle(r)}>
                      <Badge className={r.is_active ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-500/20 text-slate-400"}>
                        {r.is_active ? "Active" : "Off"}
                      </Badge>
                    </button>
                  </td>
                  <td><Button size="sm" variant="ghost" onClick={() => del(r.id)}><Trash2 className="w-4 h-4 text-rose-400" /></Button></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-slate-500 text-sm">No redirects yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

// ─────────────────────────── Broken Link Checker Tab ───────────────────────────
function BrokenLinksTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("broken_links").select("*").order("last_seen_at", { ascending: false }).limit(500);
    if (error) toast.error(error.message);
    setRows(data || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const resolve = async (id: string) => {
    const { error } = await supabase.from("broken_links").update({ resolved: true } as any).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const scan = async () => {
    setScanning(true);
    try {
      const sitemap = await fetch("/sitemap.xml").then(r => r.text());
      const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
      let broken = 0;
      for (const u of urls.slice(0, 50)) {
        try {
          const res = await fetch(u, { method: "HEAD" });
          if (!res.ok && res.status >= 400) {
            broken++;
            const path = new URL(u).pathname;
            await supabase.from("broken_links").insert({
              path, hits: 1, last_seen_at: new Date().toISOString(), resolved: false,
            } as any);
          }
        } catch { /* CORS may block external */ }
      }
      toast.success(`Scan done. ${broken} broken URL(s) found.`);
      load();
    } finally { setScanning(false); }
  };

  return (
    <Card className="p-5 bg-slate-900/40 border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-white font-semibold flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Broken Link Checker</h3>
          <p className="text-xs text-slate-400">Auto-logged when visitors hit a 404. Run a scan to verify sitemap URLs.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={load} className="gap-2"><RefreshCw className="w-4 h-4" /> Refresh</Button>
          <Button size="sm" onClick={scan} disabled={scanning} className="gap-2">
            {scanning ? "Scanning…" : <><Search className="w-4 h-4" /> Run Scan</>}
          </Button>
        </div>
      </div>
      {loading ? <p className="text-slate-400 text-sm">Loading…</p> : rows.length === 0 ? (
        <div className="text-center py-10 text-emerald-400 text-sm flex flex-col items-center gap-2">
          <CheckCircle2 className="w-8 h-8" /> No broken links recorded.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-400 text-xs border-b border-white/10">
              <th className="py-2">Path</th><th>Hits</th><th>Last Seen</th><th>Referrer</th><th>Status</th><th></th>
            </tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-b border-white/5 text-slate-200">
                  <td className="py-2 font-mono text-xs text-rose-300">{r.path}</td>
                  <td>{r.hits}</td>
                  <td className="text-xs">{r.last_seen_at ? new Date(r.last_seen_at).toLocaleString() : "—"}</td>
                  <td className="text-xs truncate max-w-[200px]">{r.referrer || "—"}</td>
                  <td>
                    <Badge className={r.resolved ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}>
                      {r.resolved ? "Fixed" : "Broken"}
                    </Badge>
                  </td>
                  <td>
                    {!r.resolved && <Button size="sm" variant="ghost" onClick={() => resolve(r.id)}>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

// ─────────────────────────── Main Hub ───────────────────────────
export default function AdminSEOPanel() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-purple-600/20 via-fuchsia-600/10 to-pink-600/20 border border-white/10 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Search className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">SEO Panel</h1>
            <p className="text-sm text-slate-300">Meta, Sitemap, Robots, Schema, Open Graph, Redirects & Broken Links — all in one place.</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="meta-title">
        <TabsList className="bg-slate-900/60 border border-white/10 flex-wrap h-auto">
          <TabsTrigger value="meta-title" className="gap-2"><FileText className="w-4 h-4" /> Meta Title</TabsTrigger>
          <TabsTrigger value="meta-desc" className="gap-2"><FileText className="w-4 h-4" /> Meta Description</TabsTrigger>
          <TabsTrigger value="sitemap" className="gap-2"><Globe className="w-4 h-4" /> Sitemap</TabsTrigger>
          <TabsTrigger value="robots" className="gap-2"><Shield className="w-4 h-4" /> Robots.txt</TabsTrigger>
          <TabsTrigger value="schema" className="gap-2"><Code2 className="w-4 h-4" /> Schema</TabsTrigger>
          <TabsTrigger value="og" className="gap-2"><Share2 className="w-4 h-4" /> Open Graph</TabsTrigger>
          <TabsTrigger value="redirects" className="gap-2"><ArrowLeftRight className="w-4 h-4" /> Redirects</TabsTrigger>
          <TabsTrigger value="broken" className="gap-2"><AlertTriangle className="w-4 h-4" /> Broken Links</TabsTrigger>
        </TabsList>

        <TabsContent value="meta-title" className="mt-4"><MetaTitleTab /></TabsContent>
        <TabsContent value="meta-desc" className="mt-4"><MetaDescriptionTab /></TabsContent>
        <TabsContent value="sitemap" className="mt-4"><SitemapTab /></TabsContent>
        <TabsContent value="robots" className="mt-4"><RobotsTab /></TabsContent>
        <TabsContent value="schema" className="mt-4"><SchemaTab /></TabsContent>
        <TabsContent value="og" className="mt-4"><OpenGraphTab /></TabsContent>
        <TabsContent value="redirects" className="mt-4"><RedirectsTab /></TabsContent>
        <TabsContent value="broken" className="mt-4"><BrokenLinksTab /></TabsContent>
      </Tabs>
    </motion.div>
  );
}
