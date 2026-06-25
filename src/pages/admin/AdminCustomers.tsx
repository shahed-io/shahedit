import { useEffect, useState, useMemo } from "react";
import { Users, Search, Ban, CheckCircle, Wallet, Star, History, Smartphone, StickyNote, ShoppingBag, Download } from "lucide-react";
import { AdminPage, AdminPageHeader, GlassCard, KpiCard } from "@/components/admin/ui";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useCustomers, type CustomerRow } from "@/hooks/useCustomerMgmt";
import { toast } from "@/hooks/use-toast";
import { openInvoice } from "@/lib/invoice";

const fmtBDT = (n: number) => "৳" + Number(n || 0).toLocaleString("en-BD");
const fmtDate = (d?: string | null) => d ? new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—";

function exportCsv(rows: CustomerRow[]) {
  const head = ["Name","Email","Phone","Joined","Orders","Total Spent","Wallet","Points","Blocked","Last Login"];
  const lines = [head.join(",")].concat(rows.map(r => [
    JSON.stringify(r.full_name ?? ""), JSON.stringify(r.email ?? ""), JSON.stringify(r.phone ?? ""),
    r.created_at, r.order_count, r.total_spent, r.wallet_balance, r.reward_points,
    r.is_blocked ? "yes" : "no", r.last_login_at ?? "",
  ].join(",")));
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `customers-${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
}

export default function AdminCustomers() {
  const { rows, loading, reload } = useCustomers();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all"|"blocked"|"top"|"new">("all");
  const [selected, setSelected] = useState<CustomerRow | null>(null);

  const filtered = useMemo(() => {
    let r = rows;
    if (filter === "blocked") r = r.filter(x => x.is_blocked);
    if (filter === "top") r = [...r].sort((a,b) => b.total_spent - a.total_spent).slice(0, 50);
    if (filter === "new") {
      const monthAgo = Date.now() - 30*86400_000;
      r = r.filter(x => new Date(x.created_at).getTime() > monthAgo);
    }
    if (q.trim()) {
      const s = q.toLowerCase();
      r = r.filter(x => (x.email||"").toLowerCase().includes(s) || (x.full_name||"").toLowerCase().includes(s) || (x.phone||"").includes(s));
    }
    return r;
  }, [rows, q, filter]);

  const totals = useMemo(() => ({
    customers: rows.length,
    blocked: rows.filter(r => r.is_blocked).length,
    revenue: rows.reduce((s,r) => s + r.total_spent, 0),
    points: rows.reduce((s,r) => s + r.reward_points, 0),
  }), [rows]);

  return (
    <AdminPage>
      <AdminPageHeader
        title="Customer Management"
        subtitle="গ্রাহক তালিকা, পারচেজ হিস্ট্রি, ওয়ালেট, পয়েন্টস, লগইন, ডিভাইস ও নোটস"
        icon={Users}
        actions={<Button onClick={() => exportCsv(filtered)} variant="outline"><Download className="w-4 h-4 mr-1" /> Export CSV</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Customers" value={totals.customers} icon={Users} accent="violet" />
        <KpiCard label="Blocked" value={totals.blocked} icon={Ban} accent="rose" />
        <KpiCard label="Lifetime Revenue" value={fmtBDT(totals.revenue)} icon={Wallet} accent="emerald" />
        <KpiCard label="Points Outstanding" value={totals.points} icon={Star} accent="amber" />
      </div>

      <GlassCard className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="নাম, ইমেইল, ফোন দিয়ে খুঁজুন…" className="pl-9" />
          </div>
          <Select value={filter} onValueChange={v => setFilter(v as any)}>
            <SelectTrigger className="w-full md:w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="top">Top Spenders</SelectItem>
              <SelectItem value="new">New (Last 30 days)</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={reload}>Refresh</Button>
        </div>
      </GlassCard>

      {loading ? (
        <p className="text-center text-muted-foreground py-12">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">কোন গ্রাহক পাওয়া যায়নি।</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c => (
            <GlassCard key={c.user_id} hover className="p-4 cursor-pointer" >
              <div className="flex items-start gap-3" onClick={() => setSelected(c)}>
                {c.avatar_url ? (
                  <img src={c.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border border-primary/30" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center font-bold text-white">
                    {(c.full_name?.[0] || c.email?.[0] || "?").toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold truncate">{c.full_name || "(no name)"}</h3>
                    {c.is_blocked && <Badge variant="destructive" className="text-[10px]">BLOCKED</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                  {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-[10px] text-muted-foreground">Spent</p>
                  <p className="text-xs font-bold text-emerald-400">{fmtBDT(c.total_spent)}</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-[10px] text-muted-foreground">Wallet</p>
                  <p className="text-xs font-bold text-primary">{fmtBDT(c.wallet_balance)}</p>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-[10px] text-muted-foreground">Points</p>
                  <p className="text-xs font-bold text-amber-400">{c.reward_points}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{c.order_count} orders</span>
                <span>Last: {c.last_login_at ? new Date(c.last_login_at).toLocaleDateString() : "—"}</span>
              </div>
              <Button size="sm" className="w-full mt-3" onClick={() => setSelected(c)}>Manage</Button>
            </GlassCard>
          ))}
        </div>
      )}

      {selected && (
        <CustomerDetailDialog
          customer={selected}
          onClose={() => setSelected(null)}
          onChanged={reload}
        />
      )}
    </AdminPage>
  );
}

function CustomerDetailDialog({ customer, onClose, onChanged }: { customer: CustomerRow; onClose: () => void; onChanged: () => void }) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
              {(customer.full_name?.[0] || customer.email?.[0] || "?").toUpperCase()}
            </span>
            <div>
              <p>{customer.full_name || "(no name)"}</p>
              <p className="text-xs text-muted-foreground font-normal">{customer.email}</p>
            </div>
            {customer.is_blocked && <Badge variant="destructive">BLOCKED</Badge>}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid grid-cols-4 md:grid-cols-7 h-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders"><ShoppingBag className="w-3 h-3 mr-1" />Orders</TabsTrigger>
            <TabsTrigger value="wallet"><Wallet className="w-3 h-3 mr-1" />Wallet</TabsTrigger>
            <TabsTrigger value="points"><Star className="w-3 h-3 mr-1" />Points</TabsTrigger>
            <TabsTrigger value="logins"><History className="w-3 h-3 mr-1" />Logins</TabsTrigger>
            <TabsTrigger value="devices"><Smartphone className="w-3 h-3 mr-1" />Devices</TabsTrigger>
            <TabsTrigger value="notes"><StickyNote className="w-3 h-3 mr-1" />Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><OverviewTab c={customer} onChanged={onChanged} /></TabsContent>
          <TabsContent value="orders"><OrdersTab userId={customer.user_id} /></TabsContent>
          <TabsContent value="wallet"><WalletTab userId={customer.user_id} onChanged={onChanged} /></TabsContent>
          <TabsContent value="points"><PointsTab userId={customer.user_id} onChanged={onChanged} /></TabsContent>
          <TabsContent value="logins"><LoginsTab userId={customer.user_id} /></TabsContent>
          <TabsContent value="devices"><DevicesTab userId={customer.user_id} /></TabsContent>
          <TabsContent value="notes"><NotesTab userId={customer.user_id} /></TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function OverviewTab({ c, onChanged }: { c: CustomerRow; onChanged: () => void }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const toggleBlock = async () => {
    setBusy(true);
    const { error } = await (supabase as any).rpc("admin_set_block_status", {
      _user_id: c.user_id, _blocked: !c.is_blocked, _reason: reason || null,
    });
    setBusy(false);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    toast({ title: c.is_blocked ? "Unblocked" : "Blocked" });
    onChanged();
  };
  return (
    <div className="space-y-4 pt-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg border bg-card/40"><p className="text-xs text-muted-foreground">Joined</p><p className="font-semibold text-sm">{fmtDate(c.created_at)}</p></div>
        <div className="p-3 rounded-lg border bg-card/40"><p className="text-xs text-muted-foreground">Orders</p><p className="font-semibold text-sm">{c.order_count}</p></div>
        <div className="p-3 rounded-lg border bg-card/40"><p className="text-xs text-muted-foreground">Lifetime Spent</p><p className="font-semibold text-sm text-emerald-500">{fmtBDT(c.total_spent)}</p></div>
        <div className="p-3 rounded-lg border bg-card/40"><p className="text-xs text-muted-foreground">Last Login</p><p className="font-semibold text-sm">{fmtDate(c.last_login_at)}</p></div>
      </div>
      <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
        <Label className="flex items-center gap-2 mb-2"><Ban className="w-4 h-4 text-rose-500" /> Block / Unblock</Label>
        {!c.is_blocked && (
          <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Block reason (optional)…" className="mb-2" />
        )}
        <Button variant={c.is_blocked ? "default" : "destructive"} disabled={busy} onClick={toggleBlock}>
          {c.is_blocked ? <><CheckCircle className="w-4 h-4 mr-1" />Unblock User</> : <><Ban className="w-4 h-4 mr-1" />Block User</>}
        </Button>
      </div>
    </div>
  );
}

function OrdersTab({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => { (async () => {
    const { data } = await supabase.from("orders").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setOrders(data || []);
  })(); }, [userId]);
  if (!orders.length) return <p className="text-center text-muted-foreground py-8">কোন অর্ডার নেই।</p>;
  return (
    <div className="space-y-2 pt-3">
      {orders.map(o => (
        <div key={o.id} className="p-3 rounded-lg border bg-card/40 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <p className="font-semibold text-sm">{o.product_title}</p>
            <p className="text-xs text-muted-foreground">#{o.order_number} · {fmtDate(o.created_at)}</p>
          </div>
          <Badge variant={o.status === "in_progress" || o.status === "completed" ? "default" : "secondary"}>{o.status}</Badge>
          <p className="font-bold text-emerald-500">{fmtBDT(Number(o.amount||0))}</p>
          <Button size="sm" variant="outline" onClick={() => openInvoice(o)}>Invoice</Button>
        </div>
      ))}
    </div>
  );
}

function WalletTab({ userId, onChanged }: { userId: string; onChanged: () => void }) {
  const [bal, setBal] = useState(0);
  const [txs, setTxs] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("topup");
  const [desc, setDesc] = useState("");
  const load = async () => {
    const { data: w } = await supabase.from("wallets").select("balance").eq("user_id", userId).maybeSingle();
    setBal(Number(w?.balance || 0));
    const { data: t } = await supabase.from("wallet_transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
    setTxs(t || []);
  };
  useEffect(() => { load(); }, [userId]);
  const apply = async () => {
    const amt = Number(amount);
    if (!amt) return;
    const { error } = await (supabase as any).rpc("wallet_apply_transaction", {
      _user_id: userId, _type: type, _amount: amt, _description: desc || null,
    });
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    toast({ title: "Wallet updated" });
    setAmount(""); setDesc("");
    load(); onChanged();
  };
  return (
    <div className="space-y-4 pt-3">
      <div className="p-4 rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/30">
        <p className="text-xs text-muted-foreground">Current Balance</p>
        <p className="text-3xl font-bold text-primary">{fmtBDT(bal)}</p>
      </div>
      <div className="p-3 rounded-xl border bg-card/40 space-y-2">
        <Label>Apply Transaction</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="topup">Top-up</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
              <SelectItem value="bonus">Bonus</SelectItem>
              <SelectItem value="adjustment_credit">Adj. Credit</SelectItem>
              <SelectItem value="adjustment_debit">Adj. Debit</SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
            </SelectContent>
          </Select>
          <Input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
          <Input placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} className="md:col-span-1 col-span-2" />
          <Button onClick={apply}>Apply</Button>
        </div>
      </div>
      <div className="space-y-1">
        {txs.map(t => (
          <div key={t.id} className="flex items-center justify-between p-2 rounded border text-xs">
            <div>
              <p className="font-semibold">{t.type} <span className="text-muted-foreground">· {t.description || "—"}</span></p>
              <p className="text-muted-foreground">{fmtDate(t.created_at)}</p>
            </div>
            <p className={t.direction === "credit" ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
              {t.direction === "credit" ? "+" : "−"}{fmtBDT(Number(t.amount))}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PointsTab({ userId, onChanged }: { userId: string; onChanged: () => void }) {
  const [data, setData] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");
  const load = async () => {
    const { data: p } = await supabase.from("customer_reward_points").select("*").eq("user_id", userId).maybeSingle();
    setData(p);
    const { data: l } = await supabase.from("reward_points_log").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
    setLogs(l || []);
  };
  useEffect(() => { load(); }, [userId]);
  const apply = async () => {
    const d = parseInt(delta);
    if (!d) return;
    const { error } = await (supabase as any).rpc("adjust_reward_points", {
      _user_id: userId, _delta: d, _reason: reason || "Manual adjustment",
      _type: d > 0 ? "adjust_credit" : "adjust_debit",
    });
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    toast({ title: "Points updated" });
    setDelta(""); setReason("");
    load(); onChanged();
  };
  return (
    <div className="space-y-4 pt-3">
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <p className="text-xs text-muted-foreground">Balance</p>
          <p className="text-2xl font-bold text-amber-400">{data?.points ?? 0}</p>
        </div>
        <div className="p-4 rounded-xl border bg-card/40"><p className="text-xs text-muted-foreground">Lifetime Earned</p><p className="text-xl font-bold">{data?.lifetime_earned ?? 0}</p></div>
        <div className="p-4 rounded-xl border bg-card/40"><p className="text-xs text-muted-foreground">Lifetime Redeemed</p><p className="text-xl font-bold">{data?.lifetime_redeemed ?? 0}</p></div>
      </div>
      <div className="p-3 rounded-xl border bg-card/40 space-y-2">
        <Label>Adjust Points (use negative number to deduct)</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <Input type="number" placeholder="±Points" value={delta} onChange={e => setDelta(e.target.value)} />
          <Input placeholder="Reason" value={reason} onChange={e => setReason(e.target.value)} />
          <Button onClick={apply}>Apply</Button>
        </div>
      </div>
      <div className="space-y-1">
        {logs.map(l => (
          <div key={l.id} className="flex items-center justify-between p-2 rounded border text-xs">
            <div>
              <p className="font-semibold">{l.type} <span className="text-muted-foreground">· {l.reason || "—"}</span></p>
              <p className="text-muted-foreground">{fmtDate(l.created_at)}</p>
            </div>
            <p className={l.points >= 0 ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>{l.points >= 0 ? "+" : ""}{l.points}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoginsTab({ userId }: { userId: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => { (async () => {
    const { data } = await supabase.from("customer_login_history").select("*").eq("user_id", userId).order("logged_in_at", { ascending: false }).limit(100);
    setLogs(data || []);
  })(); }, [userId]);
  if (!logs.length) return <p className="text-center text-muted-foreground py-8">কোন লগইন রেকর্ড নেই।</p>;
  return (
    <div className="space-y-1 pt-3">
      {logs.map(l => (
        <div key={l.id} className="p-2 rounded border text-xs flex items-center justify-between">
          <div>
            <p className="font-semibold">{l.browser} · {l.os} · {l.device}</p>
            <p className="text-muted-foreground">{l.ip || "IP unknown"} {l.country && `· ${l.country}`}</p>
          </div>
          <p className="text-muted-foreground">{fmtDate(l.logged_in_at)}</p>
        </div>
      ))}
    </div>
  );
}

function DevicesTab({ userId }: { userId: string }) {
  const [devs, setDevs] = useState<any[]>([]);
  const load = async () => {
    const { data } = await supabase.from("customer_devices").select("*").eq("user_id", userId).order("last_seen_at", { ascending: false });
    setDevs(data || []);
  };
  useEffect(() => { load(); }, [userId]);
  const updateDev = async (id: string, patch: any) => {
    await (supabase as any).from("customer_devices").update(patch).eq("id", id);
    load();
  };
  if (!devs.length) return <p className="text-center text-muted-foreground py-8">কোন ডিভাইস নেই।</p>;
  return (
    <div className="space-y-2 pt-3">
      {devs.map(d => (
        <div key={d.id} className="p-3 rounded border flex flex-wrap items-center gap-3 text-sm">
          <Smartphone className="w-4 h-4 text-primary" />
          <div className="flex-1 min-w-[180px]">
            <p className="font-semibold">{d.device_name || `${d.browser} / ${d.os}`}</p>
            <p className="text-xs text-muted-foreground">Last seen: {fmtDate(d.last_seen_at)}</p>
          </div>
          {d.is_trusted && <Badge variant="secondary">Trusted</Badge>}
          {!d.is_active && <Badge variant="outline">Revoked</Badge>}
          <Button size="sm" variant="outline" onClick={() => updateDev(d.id, { is_trusted: !d.is_trusted })}>
            {d.is_trusted ? "Untrust" : "Trust"}
          </Button>
          <Button size="sm" variant={d.is_active ? "destructive" : "default"} onClick={() => updateDev(d.id, { is_active: !d.is_active })}>
            {d.is_active ? "Revoke" : "Restore"}
          </Button>
        </div>
      ))}
    </div>
  );
}

function NotesTab({ userId }: { userId: string }) {
  const [notes, setNotes] = useState<any[]>([]);
  const [text, setText] = useState("");
  const load = async () => {
    const { data } = await supabase.from("customer_notes").select("*").eq("user_id", userId).order("is_pinned", { ascending: false }).order("created_at", { ascending: false });
    setNotes(data || []);
  };
  useEffect(() => { load(); }, [userId]);
  const add = async () => {
    if (!text.trim()) return;
    const { error } = await (supabase as any).from("customer_notes").insert({ user_id: userId, note: text.trim() });
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    setText(""); load();
  };
  const togglePin = async (n: any) => {
    await (supabase as any).from("customer_notes").update({ is_pinned: !n.is_pinned }).eq("id", n.id);
    load();
  };
  const del = async (id: string) => {
    await (supabase as any).from("customer_notes").delete().eq("id", id);
    load();
  };
  return (
    <div className="space-y-3 pt-3">
      <div className="flex gap-2">
        <Textarea value={text} onChange={e => setText(e.target.value)} placeholder="Add an internal note about this customer…" rows={2} />
        <Button onClick={add}>Add</Button>
      </div>
      {notes.map(n => (
        <div key={n.id} className={`p-3 rounded border text-sm ${n.is_pinned ? "border-amber-500/40 bg-amber-500/5" : ""}`}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground">{fmtDate(n.created_at)} {n.is_pinned && "· 📌 pinned"}</p>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => togglePin(n)}>{n.is_pinned ? "Unpin" : "Pin"}</Button>
              <Button size="sm" variant="ghost" className="text-rose-500" onClick={() => del(n.id)}>Delete</Button>
            </div>
          </div>
          <p className="whitespace-pre-wrap">{n.note}</p>
        </div>
      ))}
    </div>
  );
}
