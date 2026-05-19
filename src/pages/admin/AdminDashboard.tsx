import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Inbox, Briefcase, FolderOpen, FileText, TrendingUp, Clock, CheckCircle, AlertCircle,
  DollarSign, ShoppingCart, Users, Eye, Activity, BarChart3, PieChart as PieIcon,
  CreditCard, RefreshCw, Sparkles, ExternalLink, ArrowRight, Zap, Globe, Star,
  MessageSquare, Wallet, Gauge, Calendar,
} from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";
import { AdminPage, AdminPageHeader, GlassCard, KpiCard, SectionTitle } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";

const fmtBDT = (n: number) =>
  "৳" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n || 0);

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6"];

const startOf = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    pending:     "bg-amber-400/15 text-amber-300 border-amber-400/30",
    in_progress: "bg-sky-400/15 text-sky-300 border-sky-400/30",
    verified:    "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
    confirmed:   "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
    delivered:   "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
    rejected:    "bg-rose-400/15 text-rose-300 border-rose-400/30",
    cancelled:   "bg-rose-400/15 text-rose-300 border-rose-400/30",
    new:         "bg-violet-400/15 text-violet-300 border-violet-400/30",
    contacted:   "bg-fuchsia-400/15 text-fuchsia-300 border-fuchsia-400/30",
    converted:   "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
    closed:      "bg-slate-400/15 text-slate-300 border-slate-400/30",
  };
  return (
    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-medium ${map[status] ?? "bg-muted text-muted-foreground border-border"}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState({
    revToday: 0, revWeek: 0, revMonth: 0, revTotal: 0,
    ordersTotal: 0, ordersPending: 0, ordersInProgress: 0,
    paymentsPending: 0, leadsNew: 0, refundsPending: 0,
    pageviews30: 0, productsActive: 0, reviewsAvg: 0,
  });
  const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
  const [orderStatusMix, setOrderStatusMix] = useState<any[]>([]);
  const [paymentMix, setPaymentMix] = useState<any[]>([]);
  const [topServices, setTopServices] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [topPages, setTopPages] = useState<any[]>([]);
  const [trafficTrend, setTrafficTrend] = useState<any[]>([]);
  const [ga4Id, setGa4Id] = useState<string | null>(null);
  const [counts, setCounts] = useState({ services: 0, products: 0, blog: 0, projects: 0, users: 0 });

  const fetchAll = async () => {
    setLoading(true);
    const since30 = daysAgo(30).toISOString();
    const since14 = daysAgo(14).toISOString();
    const todayISO = startOf(new Date()).toISOString();
    const weekISO = startOf(daysAgo(7)).toISOString();
    const monthISO = startOf(daysAgo(30)).toISOString();

    const [
      ordersAll, paymentsPending, leadsRecent, refundsPending, eventsRecent,
      reviewsAgg, servicesCount, productsCount, blogCount, projectsCount, profilesCount,
      ga4Setting, topPagesData, ordersList, paymentsList, leadsList,
    ] = await Promise.all([
      supabase.from("orders").select("id,amount,status,product_title,created_at,payment_method"),
      supabase.from("payment_submissions").select("id,name,amount,payment_method,status,created_at,service").eq("status", "pending").order("created_at", { ascending: false }).limit(5),
      supabase.from("leads").select("id,name,email,service_interested,status,created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("refund_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("analytics_events").select("path,created_at").gte("created_at", since30).limit(5000),
      supabase.from("product_reviews").select("rating"),
      supabase.from("services").select("id", { count: "exact", head: true }),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("blog_posts").select("id", { count: "exact", head: true }),
      supabase.from("projects").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("site_settings").select("value").eq("key", "ga4_measurement_id").maybeSingle(),
      supabase.from("analytics_events").select("path").gte("created_at", since30).limit(2000),
      supabase.from("orders").select("id,order_number,customer_name,product_title,amount,status,created_at").order("created_at", { ascending: false }).limit(6),
      supabase.from("payment_submissions").select("id,name,amount,payment_method,status,created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("leads").select("id,name,email,service_interested,status,created_at").order("created_at", { ascending: false }).limit(5),
    ]);

    const orders = (ordersAll.data ?? []) as any[];
    const billable = orders.filter(o => !["cancelled", "rejected"].includes(o.status));

    const sumIf = (cond: (o: any) => boolean) =>
      billable.filter(cond).reduce((s, o) => s + Number(o.amount || 0), 0);

    // Revenue trend (30 days)
    const dayMap: Record<string, { date: string; revenue: number; orders: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = daysAgo(i).toISOString().slice(0, 10);
      dayMap[d] = { date: d.slice(5), revenue: 0, orders: 0 };
    }
    billable.forEach(o => {
      const d = o.created_at.slice(0, 10);
      if (dayMap[d]) { dayMap[d].revenue += Number(o.amount || 0); dayMap[d].orders += 1; }
    });

    // Order status mix
    const statusCounts: Record<string, number> = {};
    orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

    // Payment method mix
    const payMixCounts: Record<string, number> = {};
    orders.forEach(o => {
      const k = o.payment_method || "unknown";
      payMixCounts[k] = (payMixCounts[k] || 0) + 1;
    });

    // Top services
    const svcRev: Record<string, { name: string; revenue: number; count: number }> = {};
    billable.forEach(o => {
      const k = o.product_title || "Other";
      if (!svcRev[k]) svcRev[k] = { name: k, revenue: 0, count: 0 };
      svcRev[k].revenue += Number(o.amount || 0);
      svcRev[k].count += 1;
    });

    // Traffic trend + top pages
    const trafficMap: Record<string, { date: string; views: number }> = {};
    for (let i = 13; i >= 0; i--) {
      const d = daysAgo(i).toISOString().slice(0, 10);
      trafficMap[d] = { date: d.slice(5), views: 0 };
    }
    (eventsRecent.data ?? []).forEach((e: any) => {
      const d = (e.created_at || "").slice(0, 10);
      if (trafficMap[d]) trafficMap[d].views++;
    });
    const pageCounts: Record<string, number> = {};
    (topPagesData.data ?? []).forEach((e: any) => {
      const p = e.path || "/";
      pageCounts[p] = (pageCounts[p] || 0) + 1;
    });

    const reviews = (reviewsAgg.data ?? []) as any[];
    const avg = reviews.length ? reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length : 0;

    setKpi({
      revToday: sumIf(o => o.created_at >= todayISO),
      revWeek: sumIf(o => o.created_at >= weekISO),
      revMonth: sumIf(o => o.created_at >= monthISO),
      revTotal: billable.reduce((s, o) => s + Number(o.amount || 0), 0),
      ordersTotal: orders.length,
      ordersPending: orders.filter(o => o.status === "pending").length,
      ordersInProgress: orders.filter(o => o.status === "in_progress").length,
      paymentsPending: (paymentsPending.data ?? []).length,
      leadsNew: (leadsRecent.data ?? []).filter((l: any) => l.status === "new").length,
      refundsPending: refundsPending.count ?? 0,
      pageviews30: (eventsRecent.data ?? []).length,
      productsActive: productsCount.count ?? 0,
      reviewsAvg: avg,
    });

    setRevenueTrend(Object.values(dayMap));
    setOrderStatusMix(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));
    setPaymentMix(Object.entries(payMixCounts).map(([name, value]) => ({ name, value })));
    setTopServices(Object.values(svcRev).sort((a, b) => b.revenue - a.revenue).slice(0, 5));
    setRecentOrders(ordersList.data ?? []);
    setPendingPayments(paymentsList.data ?? []);
    setRecentLeads(leadsList.data ?? []);
    setTrafficTrend(Object.values(trafficMap));
    setTopPages(Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([path, views]) => ({ path, views })));
    setGa4Id(ga4Setting.data?.value ?? null);
    setCounts({
      services: servicesCount.count ?? 0,
      products: productsCount.count ?? 0,
      blog: blogCount.count ?? 0,
      projects: projectsCount.count ?? 0,
      users: profilesCount.count ?? 0,
    });
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const quickLinks = [
    { label: "Leads", icon: Inbox, href: "/admin/leads", color: "from-violet-500 to-fuchsia-500" },
    { label: "Orders", icon: ShoppingCart, href: "/admin/orders", color: "from-emerald-500 to-teal-500" },
    { label: "Payments", icon: Wallet, href: "/admin/payments", color: "from-amber-500 to-orange-500" },
    { label: "Products", icon: Briefcase, href: "/admin/products", color: "from-sky-500 to-blue-500" },
    { label: "Banners", icon: Sparkles, href: "/admin/banners", color: "from-pink-500 to-rose-500" },
    { label: "Analytics", icon: BarChart3, href: "/admin/analytics", color: "from-purple-500 to-indigo-500" },
    { label: "Quotations", icon: FileText, href: "/admin/quotations", color: "from-cyan-500 to-blue-500" },
    { label: "Refunds", icon: RefreshCw, href: "/admin/refunds", color: "from-red-500 to-rose-500" },
  ];

  return (
    <AdminPage>
      <AdminPageHeader
        title="Dashboard Overview"
        subtitle="Real-time business insights · Sales, traffic, and operations"
        icon={Gauge}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            {ga4Id && (
              <a href={`https://analytics.google.com/analytics/web/#/p${ga4Id.replace("G-", "")}/`} target="_blank" rel="noreferrer">
                <Button size="sm" className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                  <ExternalLink className="w-4 h-4 mr-1.5" /> Open GA4
                </Button>
              </a>
            )}
          </>
        }
      />

      {/* Revenue KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Revenue Today" value={fmtBDT(kpi.revToday)} icon={DollarSign} accent="emerald" href="/admin/orders" />
        <KpiCard label="Revenue (7d)" value={fmtBDT(kpi.revWeek)} icon={TrendingUp} accent="violet" href="/admin/orders" />
        <KpiCard label="Revenue (30d)" value={fmtBDT(kpi.revMonth)} icon={Activity} accent="magenta" href="/admin/analytics" />
        <KpiCard label="Total Revenue" value={fmtBDT(kpi.revTotal)} icon={Wallet} accent="amber" href="/admin/invoices" />
      </div>

      {/* Operations KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <KpiCard label="Total Orders" value={kpi.ordersTotal} icon={ShoppingCart} accent="violet" href="/admin/orders" />
        <KpiCard label="In Progress" value={kpi.ordersInProgress} icon={Clock} accent="sky" href="/admin/orders" />
        <KpiCard label="Pending Pay" value={kpi.paymentsPending} icon={CreditCard} accent="amber" href="/admin/payments" />
        <KpiCard label="New Leads" value={kpi.leadsNew} icon={Inbox} accent="magenta" href="/admin/leads" />
        <KpiCard label="Refunds" value={kpi.refundsPending} icon={RefreshCw} accent="rose" href="/admin/refunds" />
        <KpiCard label="Pageviews 30d" value={kpi.pageviews30} icon={Eye} accent="emerald" href="/admin/analytics" />
      </div>


      {/* Quick Actions */}
      <GlassCard className="p-5 mb-8">
        <SectionTitle><Zap className="w-4 h-4" /> Quick Actions</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {quickLinks.map((q, i) => (
            <motion.div key={q.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link to={q.href} className="block group">
                <div className={`relative overflow-hidden rounded-xl p-4 border border-primary/20 bg-gradient-to-br ${q.color}/20 hover:border-primary/40 transition-all`}>
                  <q.icon className="w-5 h-5 text-foreground mb-2" />
                  <p className="text-xs font-medium text-foreground">{q.label}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Charts Row 1: Revenue trend + Order status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <GlassCard className="p-5 lg:col-span-2">
          <SectionTitle><TrendingUp className="w-4 h-4" /> Revenue · Last 30 Days</SectionTitle>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionTitle><PieIcon className="w-4 h-4" /> Order Status</SectionTitle>
          {orderStatusMix.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No orders yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={orderStatusMix} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                  {orderStatusMix.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      </div>

      {/* Charts Row 2: Traffic trend + Payment mix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <GlassCard className="p-5 lg:col-span-2">
          <SectionTitle><Eye className="w-4 h-4" /> Site Traffic · Last 14 Days</SectionTitle>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trafficTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Line type="monotone" dataKey="views" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionTitle><CreditCard className="w-4 h-4" /> Payment Methods</SectionTitle>
          {paymentMix.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No payments yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={paymentMix}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Bar dataKey="value" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      </div>

      {/* Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle><ShoppingCart className="w-4 h-4" /> Recent Orders</SectionTitle>
            <Link to="/admin/orders" className="text-xs text-primary hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No orders yet</div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map(o => (
                <Link key={o.id} to="/admin/orders" className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-primary/10 hover:border-primary/30 hover:bg-white/[0.04] transition cursor-pointer">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{o.product_title}</p>
                    <p className="text-xs text-muted-foreground">{o.customer_name} · {o.order_number}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-bold text-emerald-400">{fmtBDT(Number(o.amount))}</span>
                    <StatusBadge status={o.status} />
                  </div>
                </Link>
              ))}
            </div>

          )}
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle><AlertCircle className="w-4 h-4" /> Pending Payments</SectionTitle>
            <Link to="/admin/payments" className="text-xs text-primary hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {pendingPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm flex flex-col items-center gap-2">
              <CheckCircle className="w-8 h-8 text-emerald-400/60" />
              All caught up
            </div>
          ) : (
            <div className="space-y-2">
              {pendingPayments.map(p => (
                <Link key={p.id} to="/admin/payments" className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-primary/10 hover:border-primary/30 hover:bg-white/[0.04] transition cursor-pointer">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{p.payment_method}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-bold text-amber-400">{fmtBDT(Number(p.amount))}</span>
                    <StatusBadge status={p.status} />
                  </div>
                </Link>
              ))}
            </div>

          )}
        </GlassCard>
      </div>

      {/* Top services + Recent leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <GlassCard className="p-5">
          <SectionTitle><Star className="w-4 h-4" /> Top Selling Services</SectionTitle>
          {topServices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No sales data yet</div>
          ) : (
            <div className="space-y-3">
              {topServices.map((s, i) => {
                const max = topServices[0]?.revenue || 1;
                const pct = (s.revenue / max) * 100;
                return (
                  <Link key={s.name} to="/admin/orders" className="block group/row cursor-pointer">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-foreground flex items-center gap-2 group-hover/row:text-primary transition">
                        <span className="text-xs text-muted-foreground w-5">#{i + 1}</span>
                        {s.name}
                      </span>
                      <span className="text-xs text-emerald-400 font-semibold">{fmtBDT(s.revenue)} · {s.count}x</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </Link>
                );
              })}
            </div>

          )}
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle><Inbox className="w-4 h-4" /> Recent Leads</SectionTitle>
            <Link to="/admin/leads" className="text-xs text-primary hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {recentLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No leads yet</div>
          ) : (
            <div className="space-y-2">
              {recentLeads.map(l => (
                <Link key={l.id} to="/admin/leads" className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-primary/10 hover:border-primary/30 hover:bg-white/[0.04] transition cursor-pointer">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {l.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{l.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{l.service_interested || l.email}</p>
                  </div>
                  <StatusBadge status={l.status} />
                </Link>
              ))}
            </div>

          )}
        </GlassCard>
      </div>

      {/* Top pages + GA4 + System counts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <GlassCard className="p-5">
          <SectionTitle><Globe className="w-4 h-4" /> Top Pages (30d)</SectionTitle>
          {topPages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No traffic data yet</div>
          ) : (
            <div className="space-y-2">
              {topPages.map((p, i) => (
                <a key={p.path} href={p.path} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-primary/10 hover:border-primary/30 hover:bg-white/[0.04] transition cursor-pointer">
                  <span className="text-xs text-foreground truncate flex-1 mr-2">
                    <span className="text-muted-foreground mr-2">#{i + 1}</span>{p.path}
                  </span>
                  <span className="text-xs text-primary font-semibold">{p.views}</span>
                </a>
              ))}
            </div>

          )}
        </GlassCard>

        <GlassCard className="p-5">
          <SectionTitle><BarChart3 className="w-4 h-4" /> Google Analytics</SectionTitle>
          {ga4Id ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-400/10 border border-emerald-400/30">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-xs text-emerald-300 font-medium">Connected</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{ga4Id}</p>
                </div>
              </div>
              <a href={`https://analytics.google.com/analytics/web/`} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Open GA4 Reports
                </Button>
              </a>
              <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Search Console
                </Button>
              </a>
              <Link to="/admin/analytics">
                <Button size="sm" className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground">
                  <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> Internal Analytics
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-400/10 border border-amber-400/30">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <p className="text-xs text-amber-300">GA4 not configured</p>
              </div>
              <Link to="/admin/seo">
                <Button size="sm" className="w-full">Configure GA4</Button>
              </Link>
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <SectionTitle><Activity className="w-4 h-4" /> System Overview</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Services", value: counts.services, icon: Briefcase },
              { label: "Products", value: counts.products, icon: Sparkles },
              { label: "Blog Posts", value: counts.blog, icon: FileText },
              { label: "Projects", value: counts.projects, icon: FolderOpen },
              { label: "Users", value: counts.users, icon: Users },
              { label: "Avg Rating", value: kpi.reviewsAvg.toFixed(1) + "★", icon: Star },
            ].map(c => (
              <div key={c.label} className="p-3 rounded-xl bg-white/[0.02] border border-primary/10">
                <div className="flex items-center justify-between mb-1">
                  <c.icon className="w-4 h-4 text-primary/70" />
                </div>
                <p className="text-xl font-bold font-syne text-foreground">{c.value}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{c.label}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </AdminPage>
  );
};

export default AdminDashboard;
