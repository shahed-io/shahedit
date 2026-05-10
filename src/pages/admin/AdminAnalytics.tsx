import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage, AdminPageHeader, GlassCard, KpiCard, SectionTitle } from "@/components/admin/ui";
import { BarChart3, TrendingUp, Users, ShoppingCart, DollarSign, Eye, FileText, Mail } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";

export default function AdminAnalytics() {
  const [stats, setStats] = useState({ leads: 0, orders: 0, revenue: 0, pending: 0, blogs: 0, services: 0 });
  const [trend, setTrend] = useState<any[]>([]);
  const [topPages, setTopPages] = useState<any[]>([]);
  const [statusMix, setStatusMix] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const [leadsAll, ordersAll, payments, blogs, services, events] = await Promise.all([
          supabase.from("leads").select("created_at", { count: "exact" }),
          supabase.from("orders").select("amount,status,created_at", { count: "exact" }),
          supabase.from("payment_submissions").select("amount,status").eq("status", "pending"),
          supabase.from("blog_posts").select("id", { count: "exact", head: true }),
          supabase.from("services").select("id", { count: "exact", head: true }),
          supabase.from("analytics_events").select("path,created_at").gte("created_at", since30).limit(1000),
        ]);

        const revenue = (ordersAll.data ?? []).filter((o: any) => o.status !== "cancelled").reduce((s: number, o: any) => s + Number(o.amount || 0), 0);
        setStats({
          leads: leadsAll.count ?? 0,
          orders: ordersAll.count ?? 0,
          revenue,
          pending: payments.data?.length ?? 0,
          blogs: blogs.count ?? 0,
          services: services.count ?? 0,
        });

        // Build 14-day trend
        const days: Record<string, { date: string; leads: number; orders: number }> = {};
        for (let i = 13; i >= 0; i--) {
          const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
          days[d] = { date: d.slice(5), leads: 0, orders: 0 };
        }
        leadsAll.data?.forEach((l: any) => {
          const d = l.created_at.slice(0, 10);
          if (days[d]) days[d].leads++;
        });
        ordersAll.data?.forEach((o: any) => {
          const d = o.created_at.slice(0, 10);
          if (days[d]) days[d].orders++;
        });
        setTrend(Object.values(days));

        // Top pages
        const counts: Record<string, number> = {};
        events.data?.forEach((e: any) => {
          counts[e.path || "/"] = (counts[e.path || "/"] || 0) + 1;
        });
        setTopPages(Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([path, hits]) => ({ path, hits })));

        // Order status mix
        const sm: Record<string, number> = {};
        ordersAll.data?.forEach((o: any) => { sm[o.status] = (sm[o.status] || 0) + 1; });
        setStatusMix(Object.entries(sm).map(([name, value]) => ({ name, value })));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const COLORS = ["#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#0ea5e9", "#ec4899"];

  return (
    <AdminPage>
      <AdminPageHeader
        title="Analytics & Insights"
        subtitle="Real-time performance overview — leads, revenue, and traffic"
        icon={BarChart3}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <KpiCard label="Total Leads" value={stats.leads} icon={Users} accent="amber" />
        <KpiCard label="Orders" value={stats.orders} icon={ShoppingCart} accent="emerald" />
        <KpiCard label="Revenue (BDT)" value={`৳${stats.revenue.toLocaleString()}`} icon={DollarSign} accent="amber" />
        <KpiCard label="Pending Pay" value={stats.pending} icon={Mail} accent="rose" />
        <KpiCard label="Blog Posts" value={stats.blogs} icon={FileText} accent="violet" />
        <KpiCard label="Services" value={stats.services} icon={TrendingUp} accent="sky" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <GlassCard className="p-5 lg:col-span-2">
          <SectionTitle>Leads & Orders — Last 14 Days</SectionTitle>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,158,11,0.1)" />
                <XAxis dataKey="date" stroke="#a78bfa44" fontSize={11} />
                <YAxis stroke="#a78bfa44" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="leads" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionTitle>Order Status Mix</SectionTitle>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusMix} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(e: any) => e.name}>
                  {statusMix.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(245,158,11,0.3)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-5 lg:col-span-3">
          <SectionTitle>Top Pages (Last 30 Days)</SectionTitle>
          {topPages.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4">
              এখনো কোনো analytics event নেই। সাইটের সব পেজ visit হলে এখানে দেখা যাবে।
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={topPages}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,158,11,0.1)" />
                  <XAxis dataKey="path" stroke="#a78bfa44" fontSize={11} />
                  <YAxis stroke="#a78bfa44" fontSize={11} />
                  <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(245,158,11,0.3)" }} />
                  <Bar dataKey="hits" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </GlassCard>
      </div>
    </AdminPage>
  );
}
