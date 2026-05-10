import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage, AdminPageHeader, GlassCard, KpiCard } from "@/components/admin/ui";
import { Globe, ExternalLink, RefreshCw, AlertTriangle, CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminSitemap() {
  const [stats, setStats] = useState({ static: 0, blogs: 0, services: 0, packages: 0, projects: 0 });
  const [broken, setBroken] = useState<any[]>([]);
  const sitemapUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sitemap-xml`;
  const robotsUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/robots-txt`;

  const load = async () => {
    const [b, s, p, pj, br] = await Promise.all([
      supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("is_published", true),
      supabase.from("services").select("id", { count: "exact", head: true }).eq("is_published", true),
      supabase.from("service_packages").select("id", { count: "exact", head: true }).eq("is_published", true),
      supabase.from("projects").select("id", { count: "exact", head: true }).eq("is_published", true),
      supabase.from("broken_links").select("*").eq("resolved", false).order("hits", { ascending: false }).limit(20),
    ]);
    setStats({
      static: 14,
      blogs: b.count ?? 0,
      services: s.count ?? 0,
      packages: p.count ?? 0,
      projects: pj.count ?? 0,
    });
    setBroken(br.data ?? []);
  };
  useEffect(() => { load(); }, []);

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copied"); };
  const total = stats.static + stats.blogs + stats.services + stats.packages + stats.projects;

  return (
    <AdminPage>
      <AdminPageHeader
        title="Sitemap & Robots.txt"
        subtitle="Auto-generated XML sitemap + 404 detection — Google ranking এর জন্য গুরুত্বপূর্ণ"
        icon={Globe}
        actions={<Button variant="outline" onClick={load}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <KpiCard label="Total URLs" value={total} icon={Globe} accent="amber" />
        <KpiCard label="Static" value={stats.static} accent="sky" />
        <KpiCard label="Blog Posts" value={stats.blogs} accent="emerald" />
        <KpiCard label="Services + Packages" value={stats.services + stats.packages} accent="violet" />
        <KpiCard label="Projects" value={stats.projects} accent="rose" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-amber-100">Sitemap.xml</h3>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Auto-generated XML sitemap. Google Search Console এ এই URL submit করুন:
          </p>
          <div className="flex gap-2 mb-3">
            <code className="flex-1 text-xs bg-black/30 border border-amber-400/20 rounded p-2 truncate text-amber-200">{sitemapUrl}</code>
            <Button size="sm" variant="outline" onClick={() => copy(sitemapUrl)}><Copy className="w-3 h-3" /></Button>
            <Button size="sm" variant="outline" asChild><a href={sitemapUrl} target="_blank" rel="noreferrer"><ExternalLink className="w-3 h-3" /></a></Button>
          </div>
          <p className="text-[11px] text-amber-300/70">
            ✓ Includes: static pages, blog posts, services, packages, projects.<br/>
            ✓ Auto updates যখনই নতুন content publish হয়।
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-amber-100">Robots.txt</h3>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Search engine crawlers কে guide করার জন্য:
          </p>
          <div className="flex gap-2 mb-3">
            <code className="flex-1 text-xs bg-black/30 border border-amber-400/20 rounded p-2 truncate text-amber-200">{robotsUrl}</code>
            <Button size="sm" variant="outline" onClick={() => copy(robotsUrl)}><Copy className="w-3 h-3" /></Button>
            <Button size="sm" variant="outline" asChild><a href={robotsUrl} target="_blank" rel="noreferrer"><ExternalLink className="w-3 h-3" /></a></Button>
          </div>
          <p className="text-[11px] text-amber-300/70">
            ✓ Admin/auth routes blocked.<br/>
            ✓ Sitemap auto referenced.
          </p>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-semibold text-amber-100">Broken Links / 404 Errors</h3>
          <span className="text-xs text-muted-foreground ml-auto">{broken.length} unresolved</span>
        </div>
        {broken.length === 0 ? (
          <p className="text-xs text-emerald-400 py-4">✓ No broken links detected!</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-amber-400/10 text-amber-300/70 text-xs uppercase tracking-wider">
                <th className="text-left p-2">Path</th>
                <th className="text-left p-2">Hits</th>
                <th className="text-left p-2">Last Seen</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {broken.map((b) => (
                <tr key={b.id} className="border-b border-amber-400/5">
                  <td className="p-2 text-xs font-mono text-rose-300">{b.path}</td>
                  <td className="p-2 text-xs">{b.hits}</td>
                  <td className="p-2 text-xs text-muted-foreground">{new Date(b.last_seen_at).toLocaleString()}</td>
                  <td className="p-2 text-right">
                    <Button size="sm" variant="outline" onClick={async () => {
                      await supabase.from("broken_links").update({ resolved: true }).eq("id", b.id);
                      load();
                    }}>Mark Resolved</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassCard>
    </AdminPage>
  );
}
