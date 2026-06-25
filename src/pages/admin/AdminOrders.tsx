import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Package, Clock, CheckCircle2, X, Zap, Search, Phone,
  MessageCircle, Calendar, RefreshCw, Edit3, Save, Trash2,
  FileText, History, Undo2, Truck, Plus, Ban, StickyNote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { openInvoice } from "@/lib/invoice";

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
  tracking_carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  cancel_reason: string | null;
  created_at: string;
}

interface TimelineEvent {
  id: string;
  event: string;
  message: string | null;
  actor: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

const statusOptions = [
  { value: "pending",     label: "Payment Pending", color: "hsl(35,90%,60%)",  bg: "rgba(251,146,60,0.12)",  Icon: Clock },
  { value: "in_progress", label: "In Progress",     color: "hsl(270,92%,65%)", bg: "rgba(168,85,247,0.12)", Icon: Zap },
  { value: "delivered",   label: "Delivered",       color: "hsl(145,70%,50%)", bg: "rgba(34,197,94,0.12)",  Icon: CheckCircle2 },
  { value: "cancelled",   label: "Cancelled",       color: "hsl(0,70%,60%)",   bg: "rgba(239,68,68,0.12)",  Icon: X },
];

const db = supabase as any;

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Order | null>(null);
  const [draft, setDraft] = useState<Partial<Order>>({});
  const [saving, setSaving] = useState(false);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [newNote, setNewNote] = useState("");
  const [cancelOrder, setCancelOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [refundOrder, setRefundOrder] = useState<Order | null>(null);
  const [refundReason, setRefundReason] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await db.from("orders").select("*").order("created_at", { ascending: false });
    if (error) toast.error("Failed to load orders");
    setOrders((data ?? []) as Order[]);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const loadTimeline = useCallback(async (orderId: string) => {
    const { data } = await db.from("order_timeline").select("*").eq("order_id", orderId).order("created_at", { ascending: false });
    setTimeline((data ?? []) as TimelineEvent[]);
  }, []);

  const filtered = orders.filter(o => {
    if (filter !== "all" && o.status !== filter) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return o.order_number.toLowerCase().includes(s)
      || o.customer_name.toLowerCase().includes(s)
      || o.customer_email.toLowerCase().includes(s)
      || (o.customer_phone ?? "").toLowerCase().includes(s)
      || o.product_title.toLowerCase().includes(s)
      || (o.tracking_number ?? "").toLowerCase().includes(s);
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
      tracking_carrier: o.tracking_carrier,
      tracking_number: o.tracking_number,
      tracking_url: o.tracking_url,
    });
    setNewNote("");
    loadTimeline(o.id);
  };

  const saveOrder = async () => {
    if (!editing) return;
    setSaving(true);
    const patch: Record<string, unknown> = { ...draft };
    if (draft.status === "delivered" && !editing.delivered_at) patch.delivered_at = new Date().toISOString();
    if (draft.status === "in_progress" && !editing.expected_delivery_at && draft.delivery_days) {
      patch.expected_delivery_at = new Date(Date.now() + (draft.delivery_days as number) * 86400000).toISOString();
    }
    const { error } = await db.from("orders").update(patch).eq("id", editing.id);
    setSaving(false);
    if (error) { toast.error("Save failed: " + error.message); return; }
    toast.success("Order updated");
    setEditing(null);
    fetchOrders();
  };

  const addTimelineNote = async () => {
    if (!editing || !newNote.trim()) return;
    const { error } = await db.from("order_timeline").insert({
      order_id: editing.id, event: "note", message: newNote.trim(), actor: "admin",
    });
    if (error) { toast.error("Note failed"); return; }
    setNewNote("");
    loadTimeline(editing.id);
    toast.success("Note added");
  };

  const addDeliveryFile = () => setDraft(d => ({ ...d, delivery_files: [...((d.delivery_files as any[]) ?? []), { url: "", name: "" }] }));
  const updateFile = (idx: number, key: "url" | "name", val: string) => setDraft(d => {
    const arr = [...((d.delivery_files as any[]) ?? [])];
    arr[idx] = { ...arr[idx], [key]: val };
    return { ...d, delivery_files: arr };
  });
  const removeFile = (idx: number) => setDraft(d => ({ ...d, delivery_files: ((d.delivery_files as any[]) ?? []).filter((_, i) => i !== idx) }));

  const deleteOrder = async (id: string) => {
    if (!confirm("এই অর্ডার delete করবেন?")) return;
    const { error } = await db.from("orders").delete().eq("id", id);
    if (error) { toast.error("Delete failed"); return; }
    toast.success("Deleted"); fetchOrders();
  };

  const downloadInvoice = (o: Order) => {
    openInvoice({
      id: o.id, name: o.customer_name, email: o.customer_email, phone: o.customer_phone,
      service: o.product_title, amount: Number(o.amount), payment_method: o.payment_method || "Manual",
      transaction_id: o.payment_id || o.order_number, status: o.status === "delivered" || o.status === "in_progress" ? "verified" : o.status,
      created_at: o.created_at,
    });
  };

  const confirmCancel = async () => {
    if (!cancelOrder) return;
    const { error } = await db.from("orders").update({
      status: "cancelled", cancel_reason: cancelReason || "Cancelled by admin",
    }).eq("id", cancelOrder.id);
    if (error) { toast.error("Cancel failed"); return; }
    await db.from("order_timeline").insert({
      order_id: cancelOrder.id, event: "cancelled", message: cancelReason || "Cancelled by admin", actor: "admin",
    });
    toast.success("Order cancelled");
    setCancelOrder(null); setCancelReason(""); fetchOrders();
  };

  const submitRefund = async () => {
    if (!refundOrder) return;
    if (!refundReason.trim()) return toast.error("Reason required");
    const reqNo = "RR-" + Date.now().toString(36).toUpperCase();
    const { error } = await db.from("refund_requests").insert({
      request_number: reqNo,
      user_id: refundOrder.user_id,
      name: refundOrder.customer_name,
      email: refundOrder.customer_email,
      phone: refundOrder.customer_phone || "N/A",
      order_id: refundOrder.order_number,
      reason: refundReason.trim(),
      status: "pending",
      attachments: [],
    });
    if (error) { toast.error("Refund request failed: " + error.message); return; }
    await db.from("order_timeline").insert({
      order_id: refundOrder.id, event: "refund_requested", message: `Refund request ${reqNo}: ${refundReason.trim()}`, actor: "admin",
    });
    toast.success("Refund request created — check Refunds panel");
    setRefundOrder(null); setRefundReason("");
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
          <h1 className="text-2xl font-black text-white flex items-center gap-2"><Package size={22} /> Order Management</h1>
          <p className="text-slate-400 text-sm mt-1">Details, payment, delivery, invoice, timeline, refund, cancel ও tracking</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/custom-order">
            <Button size="sm" className="gap-2 bg-gradient-to-r from-purple-600 to-teal-500 text-white">
              <Plus size={14} /> Manual Order
            </Button>
          </Link>
          <Button onClick={fetchOrders} variant="outline" size="sm" className="gap-2 border-white/15 bg-white/5 text-white hover:bg-white/10">
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>
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
        <Input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by order #, name, email, phone, product, tracking #..."
          className="pl-10 bg-white/5 border-white/15 text-white placeholder:text-slate-500" />
      </div>

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
              <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
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
                        <span>·</span><span>{o.customer_email}</span>
                        {o.customer_phone && <><span>·</span><span className="flex items-center gap-1"><Phone size={10} /> {o.customer_phone}</span></>}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1.5">
                        <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(o.created_at).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })}</span>
                        {o.payment_method && <><span>·</span><span>{o.payment_method}</span></>}
                        {o.delivery_days && <><span>·</span><span>{o.delivery_days} day delivery</span></>}
                        {o.expected_delivery_at && <><span>·</span><span>ETA: {new Date(o.expected_delivery_at).toLocaleDateString("en-BD")}</span></>}
                        {o.tracking_number && <><span>·</span><span className="flex items-center gap-1 text-cyan-400"><Truck size={10} /> {o.tracking_carrier ?? ""} {o.tracking_number}</span></>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col lg:items-end gap-2 shrink-0">
                    <p className="text-xl font-black text-emerald-400">৳{Number(o.amount).toLocaleString("en-IN")}</p>
                    <span className="text-xs font-semibold px-3 py-1 rounded-lg" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/[0.06]">
                  <Button size="sm" onClick={() => openEdit(o)} className="gap-1.5 bg-gradient-to-r from-purple-600 to-teal-500 hover:opacity-90 text-white">
                    <Edit3 size={13} /> Manage
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => downloadInvoice(o)}
                    className="gap-1.5 border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/15">
                    <FileText size={13} /> Invoice
                  </Button>
                  {wa && (
                    <a href={wa} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline" className="gap-1.5 border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/15">
                        <MessageCircle size={13} /> WhatsApp
                      </Button>
                    </a>
                  )}
                  {o.status !== "cancelled" && o.status !== "delivered" && (
                    <Button size="sm" variant="outline" onClick={() => { setCancelOrder(o); setCancelReason(""); }}
                      className="gap-1.5 border-orange-500/30 bg-orange-500/10 text-orange-300 hover:bg-orange-500/15">
                      <Ban size={13} /> Cancel
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => { setRefundOrder(o); setRefundReason(""); }}
                    className="gap-1.5 border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/15">
                    <Undo2 size={13} /> Refund
                  </Button>
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

      {/* Manage dialog */}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-3xl bg-slate-900 border-white/10 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              Manage Order {editing && <span className="font-mono text-sm text-slate-400 ml-2">#{editing.order_number}</span>}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="bg-white/5 border border-white/10">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="delivery">Delivery</TabsTrigger>
                <TabsTrigger value="tracking">Tracking</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="rounded-xl p-3 bg-white/5 text-sm space-y-1">
                  <p><span className="text-slate-400">Customer:</span> {editing.customer_name} — {editing.customer_email}</p>
                  {editing.customer_phone && <p><span className="text-slate-400">Phone:</span> {editing.customer_phone}</p>}
                  <p><span className="text-slate-400">Product:</span> {editing.product_title}</p>
                  <p><span className="text-slate-400">Amount:</span> ৳{Number(editing.amount).toLocaleString("en-IN")}</p>
                  <p><span className="text-slate-400">Payment:</span> {editing.payment_method ?? "—"} {editing.payment_id && <span className="text-xs font-mono text-slate-500 ml-1">({editing.payment_id.slice(0,8)})</span>}</p>
                  {editing.cancel_reason && <p className="text-orange-300"><span className="text-slate-400">Cancel reason:</span> {editing.cancel_reason}</p>}
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

                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-2 block flex items-center gap-2"><StickyNote size={14}/> Admin Notes (internal)</label>
                  <Textarea value={(draft.admin_notes ?? "") as string}
                    onChange={e => setDraft(d => ({ ...d, admin_notes: e.target.value }))}
                    rows={3} placeholder="শুধু admin দেখবে..."
                    className="bg-white/5 border-white/15 text-white" />
                </div>
              </TabsContent>

              <TabsContent value="delivery" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-slate-300 mb-2 block">Delivery Days</label>
                    <Input type="number" min={1} value={(draft.delivery_days ?? "") as number}
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-300">Delivery Files / Links</label>
                    <Button size="sm" variant="outline" onClick={addDeliveryFile} className="border-white/15 bg-white/5 text-white hover:bg-white/10">+ Add</Button>
                  </div>
                  <div className="space-y-2">
                    {((draft.delivery_files as any[]) ?? []).map((f, idx) => (
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
              </TabsContent>

              <TabsContent value="tracking" className="space-y-4 mt-4">
                <p className="text-xs text-slate-400">Shipping/courier tracking — যেকোনো courier (Pathao, RedX, Steadfast, Sundarban etc.)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-slate-300 mb-2 block">Carrier</label>
                    <Input placeholder="e.g. Pathao, RedX, Steadfast" value={(draft.tracking_carrier ?? "") as string}
                      onChange={e => setDraft(d => ({ ...d, tracking_carrier: e.target.value }))}
                      className="bg-white/5 border-white/15 text-white" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-300 mb-2 block">Tracking Number</label>
                    <Input placeholder="e.g. PT-123456789" value={(draft.tracking_number ?? "") as string}
                      onChange={e => setDraft(d => ({ ...d, tracking_number: e.target.value }))}
                      className="bg-white/5 border-white/15 text-white" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-2 block">Tracking URL (optional)</label>
                  <Input placeholder="https://courier.com/track/..." value={(draft.tracking_url ?? "") as string}
                    onChange={e => setDraft(d => ({ ...d, tracking_url: e.target.value }))}
                    className="bg-white/5 border-white/15 text-white" />
                </div>
                {draft.tracking_url && (
                  <a href={draft.tracking_url as string} target="_blank" rel="noreferrer" className="text-cyan-400 text-xs underline">Open tracking link →</a>
                )}
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4 mt-4">
                <div className="flex gap-2">
                  <Input value={newNote} onChange={e => setNewNote(e.target.value)}
                    placeholder="Add a timeline note..." className="bg-white/5 border-white/15 text-white" />
                  <Button size="sm" onClick={addTimelineNote} className="bg-purple-600 text-white">Add</Button>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {timeline.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">No timeline events yet</p>
                  ) : timeline.map(ev => (
                    <div key={ev.id} className="rounded-lg p-3 bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-purple-300 uppercase tracking-wide flex items-center gap-1.5">
                          <History size={11} /> {ev.event.replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(ev.created_at).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })} · {ev.actor}
                        </span>
                      </div>
                      {ev.message && <p className="text-sm text-slate-200">{ev.message}</p>}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <div className="flex gap-2 pt-4 border-t border-white/10 mt-4">
                <Button onClick={saveOrder} disabled={saving} className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-teal-500 text-white">
                  <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button onClick={() => setEditing(null)} variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">Close</Button>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel dialog */}
      <Dialog open={!!cancelOrder} onOpenChange={(v) => !v && setCancelOrder(null)}>
        <DialogContent className="max-w-md bg-slate-900 border-white/10 text-white">
          <DialogHeader><DialogTitle className="text-white">Cancel Order</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-400">Order <span className="font-mono text-orange-300">#{cancelOrder?.order_number}</span> cancel করছেন। কারণ লিখুন:</p>
          <Textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} rows={3}
            placeholder="কারণ (customer-কে নোটিফাই করতে পারে)..."
            className="bg-white/5 border-white/15 text-white" />
          <div className="flex gap-2">
            <Button onClick={confirmCancel} className="flex-1 bg-orange-600 text-white">Confirm Cancel</Button>
            <Button variant="outline" onClick={() => setCancelOrder(null)} className="border-white/15 bg-white/5 text-white">Back</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Refund dialog */}
      <Dialog open={!!refundOrder} onOpenChange={(v) => !v && setRefundOrder(null)}>
        <DialogContent className="max-w-md bg-slate-900 border-white/10 text-white">
          <DialogHeader><DialogTitle className="text-white">Create Refund Request</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-400">Order <span className="font-mono text-amber-300">#{refundOrder?.order_number}</span> এর জন্য refund request তৈরি হবে। Admin → Refunds থেকে অনুমোদন দিন।</p>
          <Textarea value={refundReason} onChange={e => setRefundReason(e.target.value)} rows={3}
            placeholder="Refund কারণ..." className="bg-white/5 border-white/15 text-white" />
          <div className="flex gap-2">
            <Button onClick={submitRefund} className="flex-1 bg-amber-600 text-white">Create Request</Button>
            <Button variant="outline" onClick={() => setRefundOrder(null)} className="border-white/15 bg-white/5 text-white">Back</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
