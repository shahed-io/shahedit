import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Search, Globe, BarChart3, Code2, Save, Plus, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { clearSeoCache } from "@/components/SEO";

type SeoPage = {
  id: string;
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

const GLOBAL_KEYS = [
  { key: "site_url", label: "Site URL", placeholder: "https://shahedit.com", group: "seo" },
  { key: "default_meta_title", label: "Default Meta Title", group: "seo" },
  { key: "default_meta_description", label: "Default Meta Description", textarea: true, group: "seo" },
  { key: "default_meta_keywords", label: "Default Keywords (comma separated)", group: "seo" },
  { key: "default_og_image", label: "Default Open Graph Image URL", group: "seo" },
  { key: "twitter_handle", label: "Twitter Handle (@yourname)", group: "seo" },
  { key: "organization_schema", label: "Organization JSON-LD Schema", textarea: true, mono: true, group: "seo" },
  { key: "ga4_measurement_id", label: "Google Analytics 4 ID (G-XXXXXXX)", group: "analytics" },
  { key: "gsc_verification_code", label: "Google Search Console Verification Code", group: "analytics" },
  { key: "bing_verification_code", label: "Bing Webmaster Verification", group: "analytics" },
  { key: "facebook_pixel_id", label: "Facebook Pixel ID", group: "analytics" },
];

export default function AdminSEO() {
  const [tab, setTab] = useState("global");
  const [pages, setPages] = useState<SeoPage[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<SeoPage | null>(null);

  const load = async () => {
    setLoading(true);
    const [pg, st] = await Promise.all([
      supabase.from("seo_pages").select("*").order("route_path"),
      supabase.from("site_settings").select("key,value").in("key", GLOBAL_KEYS.map(g => g.key)),
    ]);
    setPages((pg.data as any) || []);
    const map: Record<string, string> = {};
    st.data?.forEach((r: any) => { map[r.key] = r.value || ""; });
    setSettings(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveGlobal = async () => {
    setSaving(true);
    for (const k of GLOBAL_KEYS) {
      await supabase.from("site_settings").upsert({
        key: k.key, value: settings[k.key] || "", type: k.textarea ? "textarea" : "text", group_name: k.group, label: k.label,
      } as any, { onConflict: "key" });
    }
    setSaving(false);
    clearSeoCache();
    toast.success("Global SEO settings saved");
  };

  const savePage = async (p: SeoPage) => {
    setSaving(true);
    let schema: any = p.schema_json;
    if (typeof schema === "string") {
      try { schema = schema.trim() ? JSON.parse(schema) : null; } catch { toast.error("Invalid JSON-LD"); setSaving(false); return; }
    }
    const { id, ...rest } = p;
    const { error } = await supabase.from("seo_pages").update({ ...rest, schema_json: schema } as any).eq("id", id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    clearSeoCache();
    toast.success("Saved");
    setEditing(null);
    load();
  };

  const addPage = async () => {
    const route = prompt("Route path (e.g. /about, /product/abc):");
    if (!route) return;
    const { data, error } = await supabase.from("seo_pages").insert({ route_path: route, page_label: route, is_active: true } as any).select().maybeSingle();
    if (error) { toast.error(error.message); return; }
    clearSeoCache();
    load();
    setEditing(data as any);
  };

  const deletePage = async (id: string) => {
    if (!confirm("Delete this SEO entry?")) return;
    await supabase.from("seo_pages").delete().eq("id", id);
    clearSeoCache();
    load();
  };

  const projectRef = (import.meta as any).env?.VITE_SUPABASE_PROJECT_ID;
  const sitemapUrl = `https://${projectRef}.functions.supabase.co/sitemap`;
  const robotsUrl = `https://${projectRef}.functions.supabase.co/robots`;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent flex items-center gap-3">
          <Search size={28} /> SEO & Analytics
        </h1>
        <p className="text-white/60 mt-1">Per-page meta tags, Open Graph, structured data, sitemap & analytics.</p>
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-white/5 backdrop-blur-xl border border-white/10">
          <TabsTrigger value="global"><Globe size={14} className="mr-2" /> Global</TabsTrigger>
          <TabsTrigger value="pages"><Code2 size={14} className="mr-2" /> Per-Page SEO</TabsTrigger>
          <TabsTrigger value="tools"><BarChart3 size={14} className="mr-2" /> Sitemap & Tools</TabsTrigger>
        </TabsList>

        {/* GLOBAL */}
        <TabsContent value="global" className="space-y-4 mt-4">
          {loading ? <p className="text-white/50">Loading…</p> : (
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 space-y-5">
              {(["seo", "analytics"] as const).map(group => (
                <div key={group}>
                  <h3 className="text-white/80 font-semibold uppercase text-xs tracking-wider mb-3">{group === "seo" ? "SEO Defaults" : "Analytics & Verification"}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {GLOBAL_KEYS.filter(k => k.group === group).map(k => (
                      <div key={k.key} className={k.textarea ? "md:col-span-2" : ""}>
                        <Label className="text-white/70">{k.label}</Label>
                        {k.textarea ? (
                          <Textarea
                            value={settings[k.key] || ""}
                            onChange={e => setSettings(s => ({ ...s, [k.key]: e.target.value }))}
                            className={`mt-1 bg-white/5 border-white/10 text-white ${k.mono ? "font-mono text-xs" : ""}`}
                            rows={k.mono ? 6 : 3}
                          />
                        ) : (
                          <Input
                            value={settings[k.key] || ""}
                            placeholder={(k as any).placeholder}
                            onChange={e => setSettings(s => ({ ...s, [k.key]: e.target.value }))}
                            className="mt-1 bg-white/5 border-white/10 text-white"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <Button onClick={saveGlobal} disabled={saving} className="bg-gradient-to-r from-purple-600 to-teal-500">
                <Save size={16} className="mr-2" /> {saving ? "Saving…" : "Save Global SEO"}
              </Button>
            </Card>
          )}
        </TabsContent>

        {/* PER PAGE */}
        <TabsContent value="pages" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <p className="text-white/60 text-sm">Override meta tags per route. Empty fields fall back to defaults.</p>
            <Button onClick={addPage} className="bg-gradient-to-r from-purple-600 to-teal-500"><Plus size={14} className="mr-2" /> Add Route</Button>
          </div>
          <div className="grid gap-3">
            {pages.map(p => (
              <Card key={p.id} className="bg-white/5 backdrop-blur-xl border border-white/10 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-purple-300 text-sm bg-purple-500/10 px-2 py-0.5 rounded">{p.route_path}</code>
                      {p.page_label && <span className="text-white/70 text-sm">{p.page_label}</span>}
                      {!p.is_active && <span className="text-amber-400 text-xs">(inactive)</span>}
                    </div>
                    <p className="text-white/90 mt-1 truncate">{p.meta_title || <span className="text-white/30 italic">no title set</span>}</p>
                    <p className="text-white/50 text-xs truncate">{p.meta_description || "—"}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(p)}>Edit</Button>
                    <Button size="sm" variant="ghost" onClick={() => deletePage(p.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TOOLS */}
        <TabsContent value="tools" className="space-y-4 mt-4">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 space-y-4">
            <h3 className="text-white font-semibold">Sitemap & robots.txt</h3>
            <p className="text-white/60 text-sm">Submit these URLs to Google Search Console & Bing Webmaster Tools.</p>
            <div className="space-y-3">
              <div className="bg-black/20 rounded-lg p-3 flex items-center justify-between gap-3">
                <code className="text-teal-300 text-xs truncate">{sitemapUrl}</code>
                <a href={sitemapUrl} target="_blank" rel="noopener" className="text-purple-300 hover:text-purple-200"><ExternalLink size={16} /></a>
              </div>
              <div className="bg-black/20 rounded-lg p-3 flex items-center justify-between gap-3">
                <code className="text-teal-300 text-xs truncate">{robotsUrl}</code>
                <a href={robotsUrl} target="_blank" rel="noopener" className="text-purple-300 hover:text-purple-200"><ExternalLink size={16} /></a>
              </div>
            </div>
            <p className="text-white/50 text-xs">
              Tip: Configure your domain DNS so <code>/sitemap.xml</code> and <code>/robots.txt</code> redirect to these URLs, or use them directly when submitting.
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-3xl w-full my-8 space-y-4"
          >
            <h2 className="text-xl font-bold text-white">Edit SEO — <code className="text-purple-300">{editing.route_path}</code></h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Page Label" value={editing.page_label} onChange={v => setEditing({ ...editing, page_label: v })} />
              <Field label="Robots" value={editing.robots} onChange={v => setEditing({ ...editing, robots: v })} placeholder="index,follow" />
              <Field label="Meta Title" value={editing.meta_title} onChange={v => setEditing({ ...editing, meta_title: v })} full />
              <Field label="Meta Description" value={editing.meta_description} onChange={v => setEditing({ ...editing, meta_description: v })} textarea full />
              <Field label="Meta Keywords" value={editing.meta_keywords} onChange={v => setEditing({ ...editing, meta_keywords: v })} full />
              <Field label="Canonical URL" value={editing.canonical_url} onChange={v => setEditing({ ...editing, canonical_url: v })} full />
              <Field label="OG Title" value={editing.og_title} onChange={v => setEditing({ ...editing, og_title: v })} />
              <Field label="OG Image URL" value={editing.og_image} onChange={v => setEditing({ ...editing, og_image: v })} />
              <Field label="OG Description" value={editing.og_description} onChange={v => setEditing({ ...editing, og_description: v })} textarea full />
              <Field label="Twitter Card" value={editing.twitter_card} onChange={v => setEditing({ ...editing, twitter_card: v })} placeholder="summary_large_image" />
              <Field label="Twitter Image URL" value={editing.twitter_image} onChange={v => setEditing({ ...editing, twitter_image: v })} />
              <Field
                label="JSON-LD Schema (optional)"
                value={typeof editing.schema_json === "object" && editing.schema_json !== null ? JSON.stringify(editing.schema_json, null, 2) : (editing.schema_json || "")}
                onChange={v => setEditing({ ...editing, schema_json: v as any })}
                textarea full mono rows={6}
              />
              <div className="md:col-span-2 flex items-center gap-2">
                <input type="checkbox" id="active" checked={editing.is_active} onChange={e => setEditing({ ...editing, is_active: e.target.checked })} />
                <Label htmlFor="active" className="text-white/70">Active</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={() => savePage(editing)} disabled={saving} className="bg-gradient-to-r from-purple-600 to-teal-500">
                <Save size={16} className="mr-2" />Save
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, textarea, full, mono, rows,
}: {
  label: string; value: any; onChange: (v: string) => void; placeholder?: string;
  textarea?: boolean; full?: boolean; mono?: boolean; rows?: number;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <Label className="text-white/70">{label}</Label>
      {textarea ? (
        <Textarea value={value || ""} onChange={e => onChange(e.target.value)} rows={rows || 3} className={`mt-1 bg-white/5 border-white/10 text-white ${mono ? "font-mono text-xs" : ""}`} />
      ) : (
        <Input value={value || ""} placeholder={placeholder} onChange={e => onChange(e.target.value)} className="mt-1 bg-white/5 border-white/10 text-white" />
      )}
    </div>
  );
}
