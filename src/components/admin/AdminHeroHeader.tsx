import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Activity, TrendingUp, type LucideIcon } from "lucide-react";

interface AdminHeroHeaderProps {
  title: string;
  section: string;
  Icon: LucideIcon;
  decorIcons?: LucideIcon[];
}

const fetchLiveStats = async () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const since = start.toISOString();
  const [{ data: orders }, { count: customers }, { count: lowStock }] = await Promise.all([
    supabase.from("orders").select("total").gte("created_at", since),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "active").lte("stock_quantity", 5).not("stock_quantity", "is", null),
  ]);
  return {
    orders: orders?.length ?? 0,
    revenue: (orders ?? []).reduce((sum, order) => sum + Number(order.total ?? 0), 0),
    customers: customers ?? 0,
    lowStock: lowStock ?? 0,
  };
};

const AdminHeroHeader = ({ title, section, Icon, decorIcons = [Icon, TrendingUp, Activity] }: AdminHeroHeaderProps) => {
  const { data } = useQuery({ queryKey: ["admin-hero-live-stats"], queryFn: fetchLiveStats, staleTime: 30_000, refetchInterval: 60_000 });
  return (
    <section className="admin-hero-header">
      <div className="admin-hero-blob admin-hero-blob-1" aria-hidden="true" />
      <div className="admin-hero-blob admin-hero-blob-2" aria-hidden="true" />
      <div className="admin-hero-blob admin-hero-blob-3" aria-hidden="true" />
      <div className="admin-hero-decor" aria-hidden="true">
        {decorIcons.map((DecorIcon, index) => <DecorIcon key={index} className={`admin-hero-decor-icon admin-hero-decor-${index + 1}`} />)}
      </div>
      <div className="admin-hero-content">
        <div className="admin-hero-icon"><Icon /></div>
        <div className="admin-hero-text">
          <p className="admin-hero-kicker">{section || "Overview"}</p>
          <h1>{title}</h1>
          <p className="admin-hero-subtitle">{section ? `${section} - Manage and configure ${title.toLowerCase()}` : "Welcome to your admin panel"}</p>
        </div>
        <div className="admin-hero-stats" aria-label="Store statistics">
          <span><strong>{data?.orders ?? "-"}</strong><small>Orders today</small></span>
          <span><strong>৳{data ? Math.round(data.revenue).toLocaleString("en-BD") : "-"}</strong><small>Revenue today</small></span>
          <span><strong>{data?.customers ?? "-"}</strong><small>New customers</small></span>
          <span><strong>{data?.lowStock ?? "-"}</strong><small>Low stock</small></span>
        </div>
      </div>
    </section>
  );
};

export default AdminHeroHeader;
