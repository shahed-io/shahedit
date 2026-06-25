import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Users, TrendingUp, Filter, Smartphone, Globe2, Loader2, MousePointerClick } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

type Event = { id: string; event_type: string; path: string | null; referrer: string | null; session_id: string | null; user_agent: string | null; meta: any; created_at: string };
type Order = { id: string; amount: number; status: string; created_at: string };
type Lead = { id: string; created_at: string; source?: string | null };

const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

const RANGES = [
  { value: "7", label: "৭ দিন" },
  { value: "30", label: "৩০ দিন" },
  { value: "90", label: "৯০ দিন" },
];

function parseUA(ua: string | null) {
  if (!ua) return { device: "Unknown", browser: "Unknown", os: "Unknown" };
  const u = ua.toLowerCase();
  const device = /mobile|android|iphone|ipod/i.test(u) ? "Mobile" : /tablet|ipad/i.test(u) ? "Tablet" : "Desktop";
  const browser = u.includes("edg/") ? "Edge" : u.includes("chrome") ? "Chrome" : u.includes("firefox") ? "Firefox" : u.includes("safari") ? "Safari" : "Other";
  const os = u.includes("windows") ? "Windows" : u.includes("mac os") ? "macOS" : u.includes("android") ? "Android" : u.includes("iphone") || u.includes("ipad") ? "iOS" : u.includes("linux") ? "Linux" : "Other";
  return { device, browser, os };
}

function refSource(ref: string | null) {
  if (!ref) return "Direct";
  try {
    const host = new URL(ref).hostname.replace(/^www\./, "");
    if (host.includes("google")) return "Google";
    if (host.includes("facebook") || host.includes("fb.")) return "Facebook";
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("youtube")) return "YouTube";
    if (host.includes("bing")) return "Bing";
    if (host.includes("linkedin")) return "LinkedIn";
    return host;
  } catch { return "Direct"; }
}

export default function AdminAnalyticsHub() {
  const [range, setRange] = useState("30");
  const [events, setEvents] = useState<Event[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const since = new Date(Date.now() - parseInt(range) * 86400000).toISOString();
      const [e, o, l] = await Promise.all([
        (supabase as any).from("analytics_events").select("*").gte("created_at", since).order("created_at", { ascending: false }).limit(5000),
        (supabase as any).from("orders").select("id,amount,status,created_at").gte("created_at", since).limit(5000),
        (supabase as any).from("leads").select("id,created_at,source").gte("created_at", since).limit(5000),
      ]);
      setEvents(e.data ?? []);
      setOrders(o.data ?? []);
      setLeads(l.data ?? []);
      setLoading(false);
    })();
  }, [range]);

  const stats = useMemo(() => {
    const sessions = new Set(events.map(e => e.session_id).filter(Boolean));
    const pageviews = events.filter(e => e.event_type === "pageview" || e.event_type === "page_view" || !e.event_type).length || events.length;
    const completedOrders = orders.filter(o => ["in_progress","completed","delivered"].includes(o.status));
    const revenue = completedOrders.reduce((s, o) => s + Number(o.amount || 0), 0);
    const cvr = sessions.size > 0 ? (completedOrders.length / sessions.size * 100) : 0;
    return {
      sessions: sessions.size,
      pageviews,
      orders: completedOrders.length,
      revenue,
      cvr,
      leads: leads.length,
    };
  }, [events, orders, leads]);

  const dailySeries = useMemo(() => {
    const map: Record<string, { date: string; sessions: Set<string>; views: number; orders: number; revenue: number }> = {};
    const days = parseInt(range);
    for (let i = 0; i < days; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      map[d] = { date: d, sessions: new Set(), views: 0, orders: 0, revenue: 0 };
    }
    events.forEach(e => {
      const d = e.created_at.slice(0, 10);
      if (map[d]) { map[d].views++; if (e.session_id) map[d].sessions.add(e.session_id); }
    });
    orders.forEach(o => {
      const d = o.created_at.slice(0, 10);
      if (map[d] && ["in_progress","completed","delivered"].includes(o.status)) {
        map[d].orders++; map[d].revenue += Number(o.amount || 0);
      }
    });
    return Object.values(map)
      .map(v => ({ date: v.date.slice(5), sessions: v.sessions.size, views: v.views, orders: v.orders, revenue: v.revenue }))
      .reverse();
  }, [events, orders, range]);

  const devicePie = useMemo(() => {
    const c: Record<string, number> = {};
    events.forEach(e => { const { device } = parseUA(e.user_agent); c[device] = (c[device] || 0) + 1; });
    return Object.entries(c).map(([name, value]) => ({ name, value }));
  }, [events]);

  const browserRows = useMemo(() => {
    const c: Record<string, number> = {};
    events.forEach(e => { const { browser } = parseUA(e.user_agent); c[browser] = (c[browser] || 0) + 1; });
    return Object.entries(c).sort((a,b) => b[1]-a[1]);
  }, [events]);

  const osRows = useMemo(() => {
    const c: Record<string, number> = {};
    events.forEach(e => { const { os } = parseUA(e.user_agent); c[os] = (c[os] || 0) + 1; });
    return Object.entries(c).sort((a,b) => b[1]-a[1]);
  }, [events]);

  const countryRows = useMemo(() => {
    const c: Record<string, number> = {};
    events.forEach(e => {
      const country = e.meta?.country || e.meta?.geo?.country || "Unknown";
      c[country] = (c[country] || 0) + 1;
    });
    return Object.entries(c).sort((a,b) => b[1]-a[1]).slice(0, 20);
  }, [events]);

  const utmRows = useMemo(() => {
    const rows: Record<string, { source: string; medium: string; campaign: string; visits: number; sessions: Set<string> }> = {};
    events.forEach(e => {
      const m = e.meta || {};
      const source = m.utm_source || m.utmSource || null;
      if (!source) return;
      const key = `${source}|${m.utm_medium || "-"}|${m.utm_campaign || "-"}`;
      if (!rows[key]) rows[key] = { source, medium: m.utm_medium || "-", campaign: m.utm_campaign || "-", visits: 0, sessions: new Set() };
      rows[key].visits++;
      if (e.session_id) rows[key].sessions.add(e.session_id);
    });
    return Object.values(rows).map(r => ({ ...r, sessions: r.sessions.size })).sort((a,b) => b.visits - a.visits);
  }, [events]);

  const referrerRows = useMemo(() => {
    const c: Record<string, number> = {};
    events.forEach(e => { const s = refSource(e.referrer); c[s] = (c[s] || 0) + 1; });
    return Object.entries(c).sort((a,b) => b[1]-a[1]).slice(0, 15);
  }, [events]);

  const topPages = useMemo(() => {
    const c: Record<string, number> = {};
    events.forEach(e => { if (e.path) c[e.path] = (c[e.path] || 0) + 1; });
    return Object.entries(c).sort((a,b) => b[1]-a[1]).slice(0, 15);
  }, [events]);

  // Funnel
  const funnel = useMemo(() => {
    const sessions = new Set(events.map(e => e.session_id).filter(Boolean)).size;
    const productViews = events.filter(e => e.path?.includes("/services") || e.path?.includes("/product") || e.event_type === "product_view").length;
    const checkout = events.filter(e => e.path?.includes("checkout") || e.event_type === "begin_checkout").length;
    const purchases = orders.filter(o => ["in_progress","completed","delivered"].includes(o.status)).length;
    return [
      { stage: "Visit", count: sessions, color: COLORS[0] },
      { stage: "Product View", count: productViews, color: COLORS[1] },
      { stage: "Checkout", count: checkout || leads.length, color: COLORS[2] },
      { stage: "Purchase", count: purchases, color: COLORS[3] },
    ];
  }, [events, orders, leads]);

  if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Analytics Hub</h1>
            <p className="text-sm text-muted-foreground">ভিজিটর, conversion, funnel ও traffic source এর বিস্তারিত রিপোর্ট</p>
          </div>
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>{RANGES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Kpi icon={Users} label="Sessions" value={stats.sessions.toLocaleString()} />
        <Kpi icon={MousePointerClick} label="Pageviews" value={stats.pageviews.toLocaleString()} />
        <Kpi icon={Filter} label="Leads" value={stats.leads.toLocaleString()} />
        <Kpi icon={TrendingUp} label="Orders" value={stats.orders.toLocaleString()} />
        <Kpi icon={BarChart3} label="Revenue" value={`৳${stats.revenue.toLocaleString()}`} />
        <Kpi icon={TrendingUp} label="CVR" value={`${stats.cvr.toFixed(2)}%`} tone="success" />
      </div>

      <Tabs defaultValue="visitors">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 h-auto">
          <TabsTrigger value="visitors">Visitors</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
          <TabsTrigger value="utm">UTM</TabsTrigger>
          <TabsTrigger value="device">Device</TabsTrigger>
          <TabsTrigger value="country">Country</TabsTrigger>
        </TabsList>

        <TabsContent value="visitors" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Visitor Trend</CardTitle><CardDescription>দৈনিক sessions ও pageviews</CardDescription></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailySeries}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="views" name="Pageviews" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.2} />
                  <Area type="monotone" dataKey="sessions" name="Sessions" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Top Pages</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Path</TableHead><TableHead className="text-right">Views</TableHead></TableRow></TableHeader>
                <TableBody>
                  {topPages.map(([p, c]) => <TableRow key={p}><TableCell className="font-mono text-xs">{p}</TableCell><TableCell className="text-right">{c}</TableCell></TableRow>)}
                  {topPages.length === 0 && <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">কোন data নেই</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Conversion Rate</CardTitle><CardDescription>দৈনিক sessions → orders</CardDescription></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailySeries}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sessions" name="Sessions" fill={COLORS[0]} />
                  <Bar dataKey="orders" name="Orders" fill={COLORS[1]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <Stat label="Avg CVR" value={`${stats.cvr.toFixed(2)}%`} />
                <Stat label="Avg Order Value" value={stats.orders > 0 ? `৳${(stats.revenue/stats.orders).toFixed(0)}` : "৳0"} />
                <Stat label="Revenue / Visit" value={stats.sessions > 0 ? `৳${(stats.revenue/stats.sessions).toFixed(2)}` : "৳0"} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel">
          <Card>
            <CardHeader><CardTitle>Sales Funnel</CardTitle><CardDescription>Visit → Product → Checkout → Purchase</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {funnel.map((f, i) => {
                const pct = funnel[0].count > 0 ? (f.count / funnel[0].count * 100) : 0;
                return (
                  <div key={f.stage} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{i+1}. {f.stage}</span>
                      <span className="text-muted-foreground">{f.count.toLocaleString()} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="h-8 rounded-md bg-muted overflow-hidden">
                      <div className="h-full transition-all" style={{ width: `${pct}%`, background: f.color }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utm">
          <Card>
            <CardHeader><CardTitle>UTM Tracking</CardTitle><CardDescription>?utm_source / utm_medium / utm_campaign — meta-তে স্টোর করুন</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Source</TableHead><TableHead>Medium</TableHead><TableHead>Campaign</TableHead><TableHead className="text-right">Sessions</TableHead><TableHead className="text-right">Visits</TableHead></TableRow></TableHeader>
                <TableBody>
                  {utmRows.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">UTM তথ্য নেই — analytics tracking-এ utm params capture করুন</TableCell></TableRow>}
                  {utmRows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell><Badge>{r.source}</Badge></TableCell>
                      <TableCell>{r.medium}</TableCell>
                      <TableCell>{r.campaign}</TableCell>
                      <TableCell className="text-right">{r.sessions}</TableCell>
                      <TableCell className="text-right">{r.visits}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader><CardTitle>Referrer Sources</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Source</TableHead><TableHead className="text-right">Visits</TableHead></TableRow></TableHeader>
                <TableBody>
                  {referrerRows.map(([s, c]) => <TableRow key={s}><TableCell>{s}</TableCell><TableCell className="text-right">{c}</TableCell></TableRow>)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="device" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Smartphone className="h-4 w-4" />Device Type</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={devicePie} dataKey="value" nameKey="name" outerRadius={80} label>
                      {devicePie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip /><Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Browser</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Browser</TableHead><TableHead className="text-right">Visits</TableHead></TableRow></TableHeader>
                  <TableBody>{browserRows.map(([b, c]) => <TableRow key={b}><TableCell>{b}</TableCell><TableCell className="text-right">{c}</TableCell></TableRow>)}</TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Operating System</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>OS</TableHead><TableHead className="text-right">Visits</TableHead></TableRow></TableHeader>
                <TableBody>{osRows.map(([o, c]) => <TableRow key={o}><TableCell>{o}</TableCell><TableCell className="text-right">{c}</TableCell></TableRow>)}</TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="country">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe2 className="h-4 w-4" />Country Report</CardTitle>
              <CardDescription>Country data analytics_events.meta.country থেকে নেওয়া হয়। tracking-এ Geo IP যোগ করুন।</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Country</TableHead><TableHead className="text-right">Visits</TableHead></TableRow></TableHeader>
                <TableBody>
                  {countryRows.length === 0 && <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">Geo data নেই</TableCell></TableRow>}
                  {countryRows.map(([c, n]) => <TableRow key={c}><TableCell>{c}</TableCell><TableCell className="text-right">{n}</TableCell></TableRow>)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, tone }: { icon: any; label: string; value: any; tone?: "success" }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${tone === "success" ? "bg-emerald-500/10 text-emerald-600" : "bg-primary/10 text-primary"}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xl font-bold truncate">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg border bg-muted/30">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
