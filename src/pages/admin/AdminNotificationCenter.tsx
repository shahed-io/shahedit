import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck, Trash2, Inbox, CreditCard, Package, MessageSquare, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage, AdminPageHeader, GlassCard, KpiCard } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Notif = {
  id: string;
  title: string;
  body: string | null;
  type: string | null;
  is_read: boolean;
  link: string | null;
  created_at: string;
  user_id: string | null;
};

const typeIcon = (t: string | null) => {
  switch (t) {
    case "order": return Package;
    case "payment": return CreditCard;
    case "lead": return Inbox;
    case "support": return MessageSquare;
    default: return AlertCircle;
  }
};

const typeColor = (t: string | null) => {
  switch (t) {
    case "order": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    case "payment": return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    case "lead": return "text-sky-400 bg-sky-500/10 border-sky-500/30";
    case "support": return "text-violet-400 bg-violet-500/10 border-violet-500/30";
    default: return "text-rose-400 bg-rose-500/10 border-rose-500/30";
  }
};

const AdminNotificationCenter = () => {
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "order" | "payment" | "lead">("all");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) toast.error("Failed to load notifications");
    setItems((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("admin-notif-center")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = items.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.is_read;
    return n.type === filter;
  });

  const unreadCount = items.filter((i) => !i.is_read).length;
  const todayCount = items.filter((i) => new Date(i.created_at).toDateString() === new Date().toDateString()).length;

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setItems((s) => s.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllRead = async () => {
    const ids = items.filter((i) => !i.is_read).map((i) => i.id);
    if (!ids.length) return;
    await supabase.from("notifications").update({ is_read: true }).in("id", ids);
    setItems((s) => s.map((n) => ({ ...n, is_read: true })));
    toast.success("সব notification পড়া হিসেবে চিহ্নিত");
  };

  const remove = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setItems((s) => s.filter((n) => n.id !== id));
    toast.success("Deleted");
  };

  const clearAll = async () => {
    if (!confirm("সব notification মুছে ফেলবেন?")) return;
    const ids = items.map((i) => i.id);
    if (!ids.length) return;
    await supabase.from("notifications").delete().in("id", ids);
    setItems([]);
    toast.success("All cleared");
  };

  return (
    <AdminPage>
      <AdminPageHeader
        title="Notification Center"
        subtitle="সব business alert, real-time এ আসা notification এক জায়গায়"
        icon={Bell}
        actions={
          <>
            <Button onClick={markAllRead} variant="outline" size="sm" disabled={!unreadCount}>
              <CheckCheck className="w-4 h-4 mr-2" /> সব পড়া হিসেবে চিহ্নিত
            </Button>
            <Button onClick={clearAll} variant="outline" size="sm" disabled={!items.length}>
              <Trash2 className="w-4 h-4 mr-2" /> Clear all
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total" value={items.length} icon={Bell} accent="violet" />
        <KpiCard label="Unread" value={unreadCount} icon={AlertCircle} accent="rose" />
        <KpiCard label="Today" value={todayCount} icon={Inbox} accent="emerald" />
        <KpiCard label="Last 7d" value={items.filter((i) => Date.now() - +new Date(i.created_at) < 7 * 864e5).length} icon={MessageSquare} accent="sky" />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(["all", "unread", "order", "payment", "lead"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filter === f
                ? "bg-primary/20 border-primary/50 text-primary"
                : "bg-card/30 border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            {f === "all" ? "সব" : f === "unread" ? "অপঠিত" : f}
          </button>
        ))}
      </div>

      <GlassCard className="p-2">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">কোনো notification নেই</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {filtered.map((n) => {
              const Icon = typeIcon(n.type);
              return (
                <div key={n.id} className={`flex gap-3 p-4 group hover:bg-primary/[0.04] transition-colors ${!n.is_read ? "bg-primary/[0.02]" : ""}`}>
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${typeColor(n.type)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-foreground truncate">{n.title}</p>
                      {!n.is_read && <Badge className="bg-primary/20 text-primary border-primary/40 text-[9px] h-4">NEW</Badge>}
                    </div>
                    {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {n.link && (
                      <Link to={n.link.startsWith("/dashboard") ? "/ceo" : n.link}>
                        <Button variant="ghost" size="sm" className="h-8">View</Button>
                      </Link>
                    )}
                    {!n.is_read && (
                      <Button variant="ghost" size="sm" className="h-8" onClick={() => markRead(n.id)}>
                        <CheckCheck className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-8 text-rose-400" onClick={() => remove(n.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </AdminPage>
  );
};

export default AdminNotificationCenter;
