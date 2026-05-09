import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Package, Clock, CheckCircle2, X, Zap, Search, Phone,
  MessageCircle, Calendar, RefreshCw, Edit3, Save, Trash2, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  product_title: string;
  amount: number;
  currency: string;
  payment_id: string | null;
  payment_method: string | null;
  status: string;
  delivery_days: number | null;
  expected_delivery_at: string | null;
  delivered_at: string | null;
  delivery_notes: string | null;
  delivery_files: Array<{ url: string; name: string }> | null;
  admin_notes: string | null;
  created_at: string;
}

const statusOptions = [
  { value: "pending",     label: "Payment Pending", color: "hsl(35,90%,60%)",  bg: "rgba(251,146,60,0.12)",  Icon: Clock },
  { value: "in_progress", label: "In Progress",     color: "hsl(270,92%,65%)", bg: "rgba(168,85,247,0.12)", Icon: Zap },
  { value: "delivered",   label: "Delivered",       color: "hsl(145,70%,50%)", bg: "rgba(34,197,94,0.12)",  Icon: CheckCircle2 },
  { value: "cancelled",   label: "Cancelled",       color: "hsl(0,70%,60%)",   bg: "rgba(239,68,68,0.12)",  Icon: X },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Order | null>(null);
  const [draft, setDraft] = useState<Partial<Order>>({});
  const [saving, setSaving] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load orders");
    setOrders((data ?? []) as Order[]);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const filtered = orders.filter(o => {
    if (filter !== "all" && o.status !== filter) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return o.order_number.toLowerCase().includes(s)
      || o.customer_name.toLowerCase().includes(s)
      || o.customer_email.toLowerCase().includes(s)
      || (o.customer_phone ?? "").toLowerCase().includes(s)
      || o.product_title.toLowerCase().includes(s);
  });

  const counts = {
    all: orders.length,
    ...Object.fromEntries(statusOptions.map(s => [s.value, orders.filter(o => o.status === s.value).length])),
  };

  const openEdit = (o: Order) => {
    setEditing(o);
    setDraft({
      status: o.status,
      delivery_days: o.delivery_days,
      expected_delivery_at: o.expected_delivery_at,
      delivery_notes: o.delivery_notes,
      admin_notes: o.admin_notes,
      delivery_files: o.delivery_files ?? [],
    });
  };

  const saveOrder = async () => {
    if (!editing) return;
    setSaving(true);
    const patch: Record<string, unknown> = { ...draft };
    if (draft.status === "delivered" && !editing.delivered_at) {
      patch.delivered_at = new Date().toISOString();
    }
    if (draft.status === "in_progress" && !editing.expected_delivery_at && draft.delivery_days) {
      patch.expected_delivery_at = new Date(Date.now() + (draft.delivery_days as number) * 86400000).toISOString();
    }
    const { error } = await (supabase as any).from("orders").update(patch).eq("id", editing.id);
    setSaving(false);
    if (error) { toast.error("Save failed: " + error.message); return; }
    toast.success("Order updated");
    setEditing(null);
    fetchOrders();
  };

  const addDeliveryFile = () => {
    setDraft(d => ({
      ...d,
      delivery_files: [...((d.delivery_files as Array<{ url: string; name: string }>) ?? []), { url: "", name: "" }],
    }));
  };
  const updateFile = (idx: number, key: "url" | "name", val: string) => {
    setDraft(d => {
      const arr = [...((d.delivery_files as Array<{ url: string; name: string }>) ?? [])];
      arr[idx] = { ...arr[idx], [key]: val };
      return { ...d, delivery_files: arr };
    });
  };
  const removeFile = (idx: number) => {
    setDraft(d => ({
      ...d,
      delivery_files: ((d.delivery_files as Array<{ url: string; name: string }>) ?? []).filter((_, i) => i !== idx),
    }));
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("এই অর্ডার delete করবেন?")) return;
    const { error } = await (supabase as any).from("orders").delete().eq("id", id);
    if (error) { toast.error("Delete failed"); return; }
    toast.success("Deleted");
    fetchOrders();
  };

  const waLink = (o: Order, msg?: string) => {
    const phone = (o.customer_phone || "").replace(/\D/g, "");
    if (!phone) return null;
    const text = msg ?? `আপনার অর্ডার ${o.order_number} (${o.product_title}) সম্পর্কে যোগাযোগ — Shahed IT`;
    const intl = phone.startsWith("88") ? phone : phone.startsWith("0") ? "88" + phone : "880" + phone;
    return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2"><Package size={22} /> Orders & Delivery</h1>
          <p className="text-slate-400 text-sm mt-1">Order tracking, delivery timeline ও file delivery manage করুন</p>
        </div>
        <Button onClick={fetchOrders} variant="outline" size="sm" className="gap-2 border-white/15 bg-white/5 text-white hover:bg-white/10">
          <RefreshCw size={14} /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button onClick={() => setFilter("all")}
          className={`rounded-xl p-4 text-left transition-all ${filter === "all" ? "ring-2 ring-purple-500/50" : ""}`}
          style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.18)' }}>
          <p className="text-2xl font-black text-white">{counts.all}</p>
          <p className="text-xs text-slate-400 mt-1">All Orders</p>
        </button>
        {statusOptions.map(s => (
          <button key={s.value} onClick={() => setFilter(s.value)}
            className={`rounded-xl p-4 text-left transition-all ${filter === s.value ? "ring-2" : ""}`}
            style={{ background: s.bg, border: `1px solid ${s.color}40`, ['--tw-ring-color' as string]: s.color }}>
            <p className="text-2xl font-black" style={{ color: s.color }}>{counts[s.value] ?? 0}</p>
            <p className="text-xs text-slate-300 mt-1">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by order #, name, email, phone, product..."
          className="pl-10 bg-white/5 border-white/15 text-white placeholder:text-slate-500"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl p-14 text-center border border-dashed border-white/10 bg-white/[0.02]">
          <Package size={36} className="mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400">কোনো অর্ডার পাওয়া যায়নি</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o, i) => {
            const cfg = statusOptions.find(s => s.value === o.status) ?? statusOptions[0];
            const Icon = cfg.Icon;
            const wa = waLink(o);
            return (
              <motion.div key={o.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="rounded-2xl p-5 backdrop-blur-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex flex-col lg:flex-row lg:items-start gap-4 justify-between">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                      <Icon size={18} style={{ color: cfg.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-white truncate">{o.product_title}</span>
                        <span className="text-xs font-mono text-slate-500">#{o.order_number}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span className="font-medium text-slate-300">{o.customer_name}</span>
                        <span>·</span>
                        <span>{o.customer_email}</span>
                        {o.customer_phone && <><span>·</span><span className="flex items-center gap-1"><Phone size={10} /> {o.customer_phone}</span></>}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1.5">
                        <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(o.created_at).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })}</span>
                        {o.payment_method && <><span>·</span><span>{o.payment_method}</span></>}
                        {o.delivery_days && <><span>·</span><span>{o.delivery_days} day delivery</span></>}
                        {o.expected_delivery_at && <><span>·</span><span>ETA: {new Date(o.expected_delivery_at).toLocaleDateString("en-BD")}</span></>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col lg:items-end gap-2 shrink-0">
                    <p className="text-xl font-black text-emerald-400">৳{o.amount.toLocaleString()}</p>
                    <span className="text-xs font-semibold px-3 py-1 rounded-lg" style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/[0.06]">
                  <Button size="sm" onClick={() => openEdit(o)} className="gap-1.5 bg-gradient-to-r from-purple-600 to-teal-500 hover:opacity-90 text-white">
                    <Edit3 size={13} /> Manage
                  </Button>
                  {wa && (
                    <a href={wa} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline" className="gap-1.5 border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/15">
                        <MessageCircle size={13} /> WhatsApp
                      </Button>
                    </a>
                  )}
                  <Button size="sm" variant="outline" onClick={() => deleteOrder(o.id)}
                    className="gap-1.5 border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/15 ml-auto">
                    <Trash2 size={13} />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-2xl bg-slate-900 border-white/10 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              Manage Order {editing && <span className="font-mono text-sm text-slate-400 ml-2">#{editing.order_number}</span>}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="rounded-xl p-3 bg-white/5 text-sm space-y-1">
                <p><span className="text-slate-400">Customer:</span> {editing.customer_name} — {editing.customer_email}</p>
                <p><span className="text-slate-400">Product:</span> {editing.product_title}</p>
                <p><span className="text-slate-400">Amount:</span> ৳{editing.amount.toLocaleString()}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2 block">Status</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {statusOptions.map(s => (
                    <button key={s.value} onClick={() => setDraft(d => ({ ...d, status: s.value }))}
                      className={`p-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${draft.status === s.value ? "scale-[1.03]" : "border-white/10 opacity-70"}`}
                      style={draft.status === s.value ? { background: s.bg, color: s.color, borderColor: s.color } : { background: 'rgba(255,255,255,0.03)' }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-2 block">Delivery Days</label>
                  <Input type="number" min={1}
                    value={(draft.delivery_days ?? "") as number}
                    onChange={e => setDraft(d => ({ ...d, delivery_days: parseInt(e.target.value) || null }))}
                    className="bg-white/5 border-white/15 text-white" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-2 block">Expected Delivery</label>
                  <Input type="datetime-local"
                    value={draft.expected_delivery_at ? new Date(draft.expected_delivery_at as string).toISOString().slice(0, 16) : ""}
                    onChange={e => setDraft(d => ({ ...d, expected_delivery_at: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                    className="bg-white/5 border-white/15 text-white" />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2 block">Delivery Notes (গ্রাহকের জন্য)</label>
                <Textarea value={(draft.delivery_notes ?? "") as string}
                  onChange={e => setDraft(d => ({ ...d, delivery_notes: e.target.value }))}
                  rows={3} placeholder="Customer-কে যা বলতে চান..."
                  className="bg-white/5 border-white/15 text-white" />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2 block">Admin Notes (internal)</label>
                <Textarea value={(draft.admin_notes ?? "") as string}
                  onChange={e => setDraft(d => ({ ...d, admin_notes: e.target.value }))}
                  rows={2} placeholder="শুধু admin দেখবে..."
                  className="bg-white/5 border-white/15 text-white" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-300">Delivery Files / Links</label>
                  <Button size="sm" variant="outline" onClick={addDeliveryFile} className="border-white/15 bg-white/5 text-white hover:bg-white/10">+ Add</Button>
                </div>
                <div className="space-y-2">
                  {((draft.delivery_files as Array<{ url: string; name: string }>) ?? []).map((f, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input placeholder="File name (e.g. logo.zip)" value={f.name}
                        onChange={e => updateFile(idx, "name", e.target.value)}
                        className="bg-white/5 border-white/15 text-white" />
                      <Input placeholder="https://..." value={f.url}
                        onChange={e => updateFile(idx, "url", e.target.value)}
                        className="bg-white/5 border-white/15 text-white" />
                      <Button size="icon" variant="ghost" onClick={() => removeFile(idx)} className="text-red-400 hover:bg-red-500/10 shrink-0">
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={saveOrder} disabled={saving} className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-teal-500 text-white">
                  <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button onClick={() => setEditing(null)} variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
