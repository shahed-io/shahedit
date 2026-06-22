import { useEffect, useState, useMemo } from "react";
import { Target, TrendingUp, DollarSign, Package, Trophy, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage, AdminPageHeader, GlassCard, KpiCard, SectionTitle } from "@/components/admin/ui";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const STORAGE_KEY = "shahedit:kpi:targets:v1";

type Targets = {
  monthly_revenue: number;
  monthly_orders: number;
  monthly_leads: number;
};

const defaultTargets: Targets = {
  monthly_revenue: 200000,
  monthly_orders: 30,
  monthly_leads: 50,
};

const AdminKpiTracker = () => {
  const [targets, setTargets] = useState<Targets>(defaultTargets);
  const [orders, setOrders] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setTargets({ ...defaultTargets, ...JSON.parse(saved) });
    } catch {}
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const monthStart = new Date();
      monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
      const [o, l] = await Promise.all([
        supabase.from("orders").select("id,amount,status,created_at,customer_name").gte("created_at", monthStart.toISOString()),
        supabase.from("leads").select("id,name,assigned_to,created_at,status").gte("created_at", monthStart.toISOString()),
      ]);
      setOrders(o.data || []);
      setLeads(l.data || []);
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const paidOrders = orders.filter((o) => ["in_progress", "completed", "delivered"].includes(o.status));
    const revenue = paidOrders.reduce((s, o) => s + Number(o.amount || 0), 0);
    return {
      revenue,
      orderCount: orders.length,
      leadCount: leads.length,
      revenuePct: Math.min(100, Math.round((revenue / Math.max(1, targets.monthly_revenue)) * 100)),
      orderPct: Math.min(100, Math.round((orders.length / Math.max(1, targets.monthly_orders)) * 100)),
      leadPct: Math.min(100, Math.round((leads.length / Math.max(1, targets.monthly_leads)) * 100)),
    };
  }, [orders, leads, targets]);

  // Leaderboard from lead assignments
  const leaderboard = useMemo(() => {
    const map = new Map<string, number>();
    leads.forEach((l) => {
      if (!l.assigned_to) return;
      map.set(l.assigned_to, (map.get(l.assigned_to) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [leads]);

  const saveTargets = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(targets));
    toast.success("Target সংরক্ষিত");
  };

  const ProgressRing = ({ pct, color }: { pct: number; color: string }) => {
    const r = 36; const c = 2 * Math.PI * r;
    return (
      <svg width="92" height="92" className="-rotate-90">
        <circle cx="46" cy="46" r={r} stroke="hsl(var(--muted))" strokeWidth="8" fill="none" opacity="0.2" />
        <circle cx="46" cy="46" r={r} stroke={color} strokeWidth="8" fill="none"
          strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
    );
  };

  return (
    <AdminPage>
      <AdminPageHeader
        title="KPI & Goals Tracker"
        subtitle="মাসিক লক্ষ্য, অগ্রগতি ও কর্মী leaderboard"
        icon={Target}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {([
          { label: "Revenue (BDT)", value: stats.revenue.toLocaleString(), target: targets.monthly_revenue, pct: stats.revenuePct, color: "hsl(var(--primary))", icon: DollarSign },
          { label: "Orders", value: stats.orderCount, target: targets.monthly_orders, pct: stats.orderPct, color: "hsl(160 70% 50%)", icon: Package },
          { label: "Leads", value: stats.leadCount, target: targets.monthly_leads, pct: stats.leadPct, color: "hsl(var(--accent))", icon: TrendingUp },
        ] as const).map((m) => (
          <GlassCard key={m.label} className="p-5">
            <div className="flex items-center gap-5">
              <div className="relative">
                <ProgressRing pct={m.pct} color={m.color} />
                <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">{m.pct}%</div>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{m.label}</p>
                <p className="text-2xl font-extrabold font-syne mt-1">{m.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Target: {m.target.toLocaleString()}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SectionTitle>মাসিক Target সেট করুন</SectionTitle>
          <GlassCard className="p-5 space-y-4">
            {([
              ["Revenue Target (BDT)", "monthly_revenue"],
              ["Order Target (count)", "monthly_orders"],
              ["Lead Target (count)", "monthly_leads"],
            ] as const).map(([label, key]) => (
              <div key={key}>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">{label}</label>
                <Input
                  type="number"
                  value={targets[key]}
                  onChange={(e) => setTargets({ ...targets, [key]: Number(e.target.value) })}
                />
              </div>
            ))}
            <Button onClick={saveTargets} className="w-full">Target Save করুন</Button>
          </GlassCard>
        </div>

        <div>
          <SectionTitle>কর্মী Leaderboard (এই মাসে assigned leads)</SectionTitle>
          <GlassCard className="p-2">
            {loading ? (
              <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>
            ) : leaderboard.length === 0 ? (
              <div className="p-8 text-center">
                <Trophy className="w-9 h-9 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">এখনো কোনো assigned lead নেই</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {leaderboard.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-3 p-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                      i === 0 ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" :
                      i === 1 ? "bg-slate-400/20 text-slate-300 border border-slate-400/40" :
                      i === 2 ? "bg-orange-600/20 text-orange-400 border border-orange-600/40" :
                      "bg-card border border-border text-muted-foreground"
                    }`}>
                      {i === 0 ? <Trophy className="w-4 h-4" /> : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono text-foreground/80 truncate">{m.id.slice(0, 8)}…</p>
                      <p className="text-[10px] text-muted-foreground">User ID</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{m.count}</p>
                      <p className="text-[10px] text-muted-foreground">leads</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </AdminPage>
  );
};

export default AdminKpiTracker;
