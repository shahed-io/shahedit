import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage, AdminPageHeader, GlassCard, KpiCard, SectionTitle } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Search, Globe, FileSearch, BarChart3, Save, RefreshCw,
  TrendingUp, Eye, MousePointerClick, ExternalLink, Copy, CheckCircle2, XCircle, Edit3,
} from "lucide-react";
import { toast } from "sonner";

type Row = {
  id: string;
  table: "blog_posts" | "services" | "service_packages" | "projects";
  title: string;
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  url: string;
};

const TOGGLE_KEYS = [
  { key: "sitemap_enabled", label: "Sitemap.xml সক্রিয় রাখুন", default: "true" },
  { key: "robots_enabled", label: "Robots.txt সক্রিয় রাখুন", default: "true" },
  { key: "robots_index", label: "সাইট সার্চ ইঞ্জিনে index হবে (index/noindex)", default: "true" },
];

export default function AdminSEOTools() {
  const sitemapUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sitemap-xml`;
  const robotsUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/robots-txt`;

  const [tab, setTab] = useState("toggles");

  // Toggles
  const [toggles, setToggles] = useState<Record<string, boolean>>({});
  const [robotsCustom, setRobotsCustom] = useState("");
  const [savingT, setSavingT] = useState(false);

  // Slug/Meta editor
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState("");
  const [tableFilter, setTableFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Row | null>(null);

  // Keywords / performance
  const [pageViews, setPageViews] = useState<Array<{ path: string; views: number; sessions: number }>>([]);
  const [searches, setSearches] = useState<any[]>([]);
  const [totals, setTotals] = useState({ views: 0, sessions: 0, paths: 0, terms: 0 });

  const loadToggles = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key,value")
      .in("key", [...TOGGLE_KEYS.map(t => t.key), "robots_custom"]);
    const map: Record<string, boolean> = {};
    TOGGLE_KEYS.forEach(t => {
      const v = data?.find(d => d.key === t.key)?.value ?? t.default;
      map[t.key] = v === "true" || v === "1";
    });
    setToggles(map);
    setRobotsCustom(data?.find(d => d.key === "robots_custom")?.value || "");
  };

  const loadRows = async () => {
    const [b, s, p, pj] = await Promise.all([
      supabase.from("blog_posts").select("id,title,slug,meta_title,meta_description,is_published"),
      supabase.from("services").select("id,title,slug,meta_title,meta_description,is_published"),
      supabase.from("service_packages").select("id,title,slug,is_published"),
      supabase.from("projects").select("id,title,slug,meta_title,meta_description,is_published"),
    ]);
    const all: Row[] = [
      ...(b.data ?? []).map((r: any) => ({ ...r, table: "blog_posts" as const, url: `/blog/${r.slug}` })),
      ...(s.data ?? []).map((r: any) => ({ ...r, table: "services" as const, url: `/services/${r.slug}` })),
      ...(p.data ?? []).map((r: any) => ({ ...r, table: "service_packages" as const, meta_title: null, meta_description: null, url: `/product/${r.slug}` })),
      ...(pj.data ?? []).map((r: any) => ({ ...r, table: "projects" as const, url: `/portfolio/${r.slug}` })),
    ];
    setRows(all);
  };

  const loadAnalytics = async () => {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: ev } = await supabase
      .from("analytics_events")
      .select("path,session_id,event_type")
      .gte("created_at", since)
      .limit(10000);
    const byPath = new Map<string, { views: number; sessions: Set<string> }>();
    (ev ?? []).forEach((r: any) => {
      if (!r.path) return;
      const e = byPath.get(r.path) ?? { views: 0, sessions: new Set<string>() };
      if (r.event_type === "page_view") e.views++;
      if (r.session_id) e.sessions.add(r.session_id);
      byPath.set(r.path, e);
    });
    const arr = Array.from(byPath.entries())
      .map(([path, v]) => ({ path, views: v.views, sessions: v.sessions.size }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 50);
    setPageViews(arr);

    const totalSessions = new Set<string>();
    let totalViews = 0;
    (ev ?? []).forEach((r: any) => {
      if (r.session_id) totalSessions.add(r.session_id);
      if (r.event_type === "page_view") totalViews++;
    });

    const { data: terms } = await supabase
      .from("popular_searches")
      .select("*")
      .order("sort_order", { ascending: true });
    setSearches(terms ?? []);
    setTotals({
      views: totalViews,
      sessions: totalSessions.size,
      paths: byPath.size,
      terms: terms?.length ?? 0,
    });
  };

  useEffect(() => { loadToggles(); loadRows(); loadAnalytics(); }, []);

  const saveToggles = async () => {
    setSavingT(true);
    const upserts = [
      ...TOGGLE_KEYS.map(t => ({
        key: t.key,
        value: toggles[t.key] ? "true" : "false",
        type: "boolean",
        group_name: "seo",
        label: t.label,
      })),
      { key: "robots_custom", value: robotsCustom, type: "textarea", group_name: "seo", label: "Custom robots.txt rules" },
    ];
    for (const u of upserts) {
      await supabase.from("site_settings").upsert(u as any, { onConflict: "key" });
    }
    setSavingT(false);
    toast.success("SEO toggles saved");
  };

  const filteredRows = useMemo(() => {
    return rows
      .filter(r => tableFilter === "all" || r.table === tableFilter)
      .filter(r =>
        !filter ||
        r.title?.toLowerCase().includes(filter.toLowerCase()) ||
        r.slug?.toLowerCase().includes(filter.toLowerCase()),
      )
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [rows, filter, tableFilter]);

  const missingMeta = rows.filter(r => !r.meta_title || !r.meta_description).length;

  const saveRow = async () => {
    if (!editing) return;
    const payload: any = { slug: editing.slug };
    if (editing.table !== "service_packages") {
      payload.meta_title = editing.meta_title;
      payload.meta_description = editing.meta_description;
    }
    const { error } = await supabase.from(editing.table).update(payload).eq("id", editing.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Updated");
    setEditing(null);
    loadRows();
  };

  const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copied"); };

  return (
    <AdminPage>
      <AdminPageHeader
        title="SEO Tools & Reporting"
        subtitle="Sitemap/Robots toggle • Slug & Meta editor • Keywords & performance dashboard"
        icon={Search}
        actions={
          <Button variant="outline" onClick={() => { loadToggles(); loadRows(); loadAnalytics(); }}>
            <RefreshCw className="w-4 h-4 mr-2" />Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Indexable URLs" value={rows.filter(r => r.is_published).length} icon={Globe} accent="violet" />
        <KpiCard label="Missing Meta" value={missingMeta} icon={XCircle} accent="rose" />
        <KpiCard label="Page Views (30d)" value={totals.views} icon={Eye} accent="emerald" />
        <KpiCard label="Sessions (30d)" value={totals.sessions} icon={MousePointerClick} accent="sky" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-card/40 border border-primary/10">
          <TabsTrigger value="toggles"><Globe className="w-4 h-4 mr-2" />Sitemap & Robots</TabsTrigger>
          <TabsTrigger value="meta"><Edit3 className="w-4 h-4 mr-2" />Slug & Meta Editor</TabsTrigger>
          <TabsTrigger value="reports"><BarChart3 className="w-4 h-4 mr-2" />Keywords & Performance</TabsTrigger>
        </TabsList>

        {/* TOGGLES */}
        <TabsContent value="toggles" className="mt-4 space-y-4">
          <GlassCard className="p-5 space-y-4">
            <SectionTitle>Crawler Controls</SectionTitle>
            <div className="space-y-3">
              {TOGGLE_KEYS.map(t => (
                <div key={t.key} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-card/30 border border-primary/10">
                  <div>
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="text-xs text-muted-foreground font-mono">{t.key}</p>
                  </div>
                  <Switch
                    checked={!!toggles[t.key]}
                    onCheckedChange={(v) => setToggles(s => ({ ...s, [t.key]: v }))}
                  />
                </div>
              ))}
            </div>

            <div>
              <Label className="text-sm">Custom robots.txt rules (Disallow/Allow lines)</Label>
              <Textarea
                rows={6}
                className="mt-2 font-mono text-xs"
                placeholder={"Disallow: /private/\nAllow: /public/"}
                value={robotsCustom}
                onChange={(e) => setRobotsCustom(e.target.value)}
              />
            </div>

            <Button onClick={saveToggles} disabled={savingT} className="bg-gradient-to-r from-primary to-accent">
              <Save className="w-4 h-4 mr-2" />{savingT ? "Saving..." : "Save Settings"}
            </Button>
          </GlassCard>

          <div className="grid lg:grid-cols-2 gap-4">
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold">Sitemap.xml URL</h3>
              </div>
              <div className="flex gap-2">
                <code className="flex-1 text-xs bg-card/50 border border-primary/15 rounded p-2 truncate">{sitemapUrl}</code>
                <Button size="sm" variant="outline" onClick={() => copy(sitemapUrl)}><Copy className="w-3 h-3" /></Button>
                <Button size="sm" variant="outline" asChild><a href={sitemapUrl} target="_blank" rel="noreferrer"><ExternalLink className="w-3 h-3" /></a></Button>
              </div>
            </GlassCard>
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold">Robots.txt URL</h3>
              </div>
              <div className="flex gap-2">
                <code className="flex-1 text-xs bg-card/50 border border-primary/15 rounded p-2 truncate">{robotsUrl}</code>
                <Button size="sm" variant="outline" onClick={() => copy(robotsUrl)}><Copy className="w-3 h-3" /></Button>
                <Button size="sm" variant="outline" asChild><a href={robotsUrl} target="_blank" rel="noreferrer"><ExternalLink className="w-3 h-3" /></a></Button>
              </div>
            </GlassCard>
          </div>
        </TabsContent>

        {/* META */}
        <TabsContent value="meta" className="mt-4 space-y-4">
          <GlassCard className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <FileSearch className="w-4 h-4 text-primary" />
              <Input
                className="max-w-xs"
                placeholder="Search title or slug..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              <select
                className="h-9 rounded-md bg-card/40 border border-primary/15 px-2 text-sm"
                value={tableFilter}
                onChange={(e) => setTableFilter(e.target.value)}
              >
                <option value="all">All content</option>
                <option value="blog_posts">Blog posts</option>
                <option value="services">Services</option>
                <option value="service_packages">Service packages</option>
                <option value="projects">Projects</option>
              </select>
              <span className="text-xs text-muted-foreground ml-auto">{filteredRows.length} items</span>
            </div>
          </GlassCard>

          <GlassCard className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-card/40">
                  <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">Title</th>
                    <th className="text-left p-3">Slug</th>
                    <th className="text-left p-3">Meta</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map(r => {
                    const hasMeta = !!(r.meta_title && r.meta_description);
                    const titleLen = r.meta_title?.length ?? 0;
                    const descLen = r.meta_description?.length ?? 0;
                    return (
                      <tr key={`${r.table}-${r.id}`} className="border-t border-primary/10 hover:bg-primary/5">
                        <td className="p-3"><Badge variant="outline" className="text-[10px]">{r.table.replace("_", " ")}</Badge></td>
                        <td className="p-3 font-medium">{r.title}</td>
                        <td className="p-3 text-xs font-mono text-primary/80">/{r.slug}</td>
                        <td className="p-3 text-xs">
                          {r.table === "service_packages" ? (
                            <span className="text-muted-foreground">—</span>
                          ) : hasMeta ? (
                            <span className="text-emerald-400">
                              T:{titleLen} / D:{descLen}
                            </span>
                          ) : (
                            <span className="text-rose-400">Missing</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <Button size="sm" variant="outline" onClick={() => setEditing(r)}>Edit</Button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRows.length === 0 && (
                    <tr><td colSpan={5} className="p-6 text-center text-muted-foreground text-sm">No items</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </TabsContent>

        {/* REPORTS */}
        <TabsContent value="reports" className="mt-4 space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">Top Pages (last 30 days)</h3>
                <span className="text-xs text-muted-foreground ml-auto">{totals.paths} unique paths</span>
              </div>
              <div className="max-h-[420px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground uppercase">
                    <tr><th className="text-left p-2">Path</th><th className="text-right p-2">Views</th><th className="text-right p-2">Sessions</th></tr>
                  </thead>
                  <tbody>
                    {pageViews.map(p => (
                      <tr key={p.path} className="border-t border-primary/10">
                        <td className="p-2 text-xs font-mono truncate max-w-[260px]">{p.path}</td>
                        <td className="p-2 text-right">{p.views}</td>
                        <td className="p-2 text-right text-muted-foreground">{p.sessions}</td>
                      </tr>
                    ))}
                    {pageViews.length === 0 && (
                      <tr><td colSpan={3} className="p-6 text-center text-muted-foreground text-xs">No analytics data yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-semibold">Tracked Keywords</h3>
                <span className="text-xs text-muted-foreground ml-auto">{totals.terms} terms</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                "Popular Searches" থেকে আসা কীওয়ার্ড। সাইট search ranking এর জন্য monitor করুন।
              </p>
              <div className="flex flex-wrap gap-2 max-h-[360px] overflow-y-auto">
                {searches.map((s) => (
                  <Badge key={s.id} variant={s.is_active ? "default" : "outline"} className="text-xs">
                    {s.term}
                  </Badge>
                ))}
                {searches.length === 0 && (
                  <p className="text-xs text-muted-foreground">No keywords yet — add them in Popular Searches.</p>
                )}
              </div>
            </GlassCard>
          </div>

          <GlassCard className="p-5">
            <SectionTitle>Performance Tips</SectionTitle>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Missing meta থাকলে দ্রুত "Slug & Meta Editor" থেকে set করুন।</li>
              <li>Top page গুলোর জন্য schema.json যোগ করুন (Schema Builder)।</li>
              <li>Google Search Console এ sitemap URL submit করুন এবং performance compare করুন।</li>
              <li>Custom robots.txt rule দিয়ে crawl budget control করুন।</li>
            </ul>
          </GlassCard>
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto" onClick={() => setEditing(null)}>
          <div className="bg-card border border-primary/20 rounded-2xl p-6 max-w-2xl w-full my-10 space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-primary" />
              Edit — <span className="text-primary">{editing.title}</span>
            </h2>
            <div className="space-y-3">
              <div>
                <Label>Slug</Label>
                <Input value={editing.slug || ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="mt-1 font-mono text-sm" />
              </div>
              {editing.table !== "service_packages" && (
                <>
                  <div>
                    <Label>Meta Title <span className="text-xs text-muted-foreground">({editing.meta_title?.length ?? 0}/60)</span></Label>
                    <Input value={editing.meta_title || ""} onChange={(e) => setEditing({ ...editing, meta_title: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label>Meta Description <span className="text-xs text-muted-foreground">({editing.meta_description?.length ?? 0}/160)</span></Label>
                    <Textarea rows={3} value={editing.meta_description || ""} onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })} className="mt-1" />
                  </div>
                </>
              )}
              <p className="text-xs text-muted-foreground">URL preview: <code className="text-primary">{editing.url}</code></p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={saveRow} className="bg-gradient-to-r from-primary to-accent">
                <Save className="w-4 h-4 mr-2" />Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminPage>
  );
}
