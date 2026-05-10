import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Search, Download, RefreshCw, RefreshCcw, ExternalLink, FileText, Image as ImageIcon, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AdminPage, AdminPageHeader, GlassCard, KpiCard } from "@/components/admin/ui";

type Attachment = { name: string; path: string; size: number; type: string };
type Status = "pending" | "processing" | "approved" | "rejected" | "completed";

interface RefundRow {
  id: string;
  request_number: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string;
  order_id: string | null;
  reason: string;
  status: Status;
  admin_notes: string | null;
  attachments: Attachment[] | null;
  created_at: string;
  updated_at: string;
}

const statusOptions: Status[] = ["pending", "processing", "approved", "rejected", "completed"];

const statusLabel: Record<Status, string> = {
  pending: "Pending",
  processing: "Processing",
  approved: "Approved",
  rejected: "Rejected",
  completed: "Completed",
};

const statusColor: Record<Status, string> = {
  pending: "text-amber-300 bg-amber-400/10 border-amber-400/30",
  processing: "text-sky-300 bg-sky-400/10 border-sky-400/30",
  approved: "text-emerald-300 bg-emerald-400/10 border-emerald-400/30",
  completed: "text-emerald-300 bg-emerald-400/10 border-emerald-400/30",
  rejected: "text-rose-300 bg-rose-400/10 border-rose-400/30",
};

const AdminRefunds = () => {
  const [rows, setRows] = useState<RefundRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [selected, setSelected] = useState<RefundRow | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    let q = supabase
      .from("refund_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    if (from) q = q.gte("created_at", new Date(from).toISOString());
    if (to) q = q.lte("created_at", new Date(to + "T23:59:59").toISOString());
    const { data, error } = await q;
    if (error) toast.error("Failed to load");
    setRows((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [filter, from, to]);

  const updateStatus = async (id: string, status: Status) => {
    const { error } = await supabase.from("refund_requests").update({ status }).eq("id", id);
    if (error) { toast.error("Failed to update"); return; }
    toast.success(`Marked as ${statusLabel[status]}`);
    setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
  };

  const saveNotes = async () => {
    if (!selected) return;
    setSaving(true);
    const { error } = await supabase.from("refund_requests").update({ admin_notes: notes }).eq("id", selected.id);
    setSaving(false);
    if (error) { toast.error("Failed"); return; }
    toast.success("Notes saved");
    setRows(prev => prev.map(r => r.id === selected.id ? { ...r, admin_notes: notes } : r));
  };

  const openAttachment = async (path: string) => {
    const { data, error } = await supabase.storage
      .from("refund-attachments")
      .createSignedUrl(path, 60 * 10);
    if (error || !data) { toast.error("Failed to open"); return; }
    window.open(data.signedUrl, "_blank");
  };

  const filtered = useMemo(() => rows.filter(r => {
    const s = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(s) ||
      r.email.toLowerCase().includes(s) ||
      r.request_number.toLowerCase().includes(s) ||
      (r.order_id ?? "").toLowerCase().includes(s) ||
      r.reason.toLowerCase().includes(s)
    );
  }), [rows, search]);

  const exportCSV = () => {
    const headers = ["Request ID", "Name", "Email", "Phone", "Order ID", "Reason", "Status", "Admin Notes", "Date"];
    const escape = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
    const csvRows = filtered.map(r => [
      r.request_number, r.name, r.email, r.phone, r.order_id ?? "",
      r.reason, statusLabel[r.status], r.admin_notes ?? "",
      new Date(r.created_at).toLocaleString(),
    ].map(escape).join(","));
    const csv = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `refund-requests-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const counts = useMemo(() => ({
    total: rows.length,
    pending: rows.filter(r => r.status === "pending").length,
    processing: rows.filter(r => r.status === "processing").length,
    approved: rows.filter(r => r.status === "approved" || r.status === "completed").length,
    rejected: rows.filter(r => r.status === "rejected").length,
  }), [rows]);

  return (
    <AdminPage>
      <AdminPageHeader
        title="Refund Requests"
        subtitle="রিফান্ড অনুরোধসমূহ পর্যালোচনা ও Approve/Reject করুন"
        icon={RefreshCcw}
        actions={
          <>
            <Button onClick={fetchData} variant="ghost" size="icon" className="border border-primary/15">
              <RefreshCw size={15} />
            </Button>
            <Button onClick={exportCSV} className="gap-2">
              <Download size={15} /> Export CSV
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        <KpiCard label="Total" value={counts.total} accent="violet" />
        <KpiCard label="Pending" value={counts.pending} accent="amber" />
        <KpiCard label="Processing" value={counts.processing} accent="sky" />
        <KpiCard label="Approved" value={counts.approved} accent="emerald" />
        <KpiCard label="Rejected" value={counts.rejected} accent="rose" />
      </div>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <GlassCard className="p-4 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              {(["all", ...statusOptions] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filter === s
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                      : "bg-card/40 text-muted-foreground hover:text-foreground border border-primary/10"
                  }`}
                >
                  {s === "all" ? "All" : statusLabel[s as Status]}
                </button>
              ))}
              <div className="flex items-center gap-2 ml-2">
                <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="h-8 w-36 text-xs" />
                <span className="text-muted-foreground text-xs">→</span>
                <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="h-8 w-36 text-xs" />
                {(from || to) && (
                  <button onClick={() => { setFrom(""); setTo(""); }} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
                )}
              </div>
              <div className="relative ml-auto">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search ID, name, email, reason..."
                  className="pl-9 h-8 text-sm w-64"
                />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="overflow-hidden">
            {loading ? (
              <div className="space-y-px">
                {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-card/30 animate-pulse" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <RefreshCcw size={40} className="text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">No refund requests found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary/10">
                      {["Request ID", "Customer", "Contact", "Reason", "Files", "Status", "Date"].map(h => (
                        <th key={h} className="text-left text-muted-foreground text-xs font-medium px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, i) => {
                      const atts = Array.isArray(r.attachments) ? r.attachments : [];
                      return (
                        <motion.tr
                          key={r.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: Math.min(i * 0.02, 0.3) }}
                          onClick={() => { setSelected(r); setNotes(r.admin_notes ?? ""); }}
                          className={`border-b border-primary/5 hover:bg-primary/5 cursor-pointer transition-colors ${
                            selected?.id === r.id ? "bg-primary/10" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <code className="text-primary text-xs font-semibold">{r.request_number}</code>
                            {r.order_id && <p className="text-muted-foreground text-xs mt-0.5">#{r.order_id}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-foreground text-sm font-medium">{r.name}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-foreground/80 text-xs">{r.email}</p>
                            <p className="text-muted-foreground text-xs">{r.phone}</p>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs max-w-xs truncate">
                            {r.reason.split("\n")[0]}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {atts.length > 0 ? `📎 ${atts.length}` : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={r.status}
                              onChange={e => { e.stopPropagation(); updateStatus(r.id, e.target.value as Status); }}
                              onClick={e => e.stopPropagation()}
                              className={`text-xs px-2.5 py-1 rounded-full border font-medium bg-transparent cursor-pointer ${statusColor[r.status]}`}
                            >
                              {statusOptions.map(s => (
                                <option key={s} value={s} className="bg-background text-foreground">{statusLabel[s]}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>

        {selected && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-96 flex-shrink-0"
          >
            <GlassCard className="p-5 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground font-semibold">Refund Details</h3>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
              </div>

              <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-muted-foreground text-xs">Request ID</p>
                <code className="text-primary font-bold text-sm">{selected.request_number}</code>
              </div>

              <div className="space-y-3 text-sm mb-5">
                {[
                  ["Name", selected.name],
                  ["Email", selected.email],
                  ["Phone", selected.phone],
                  ["Order ID", selected.order_id],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k as string}>
                    <p className="text-muted-foreground text-xs">{k}</p>
                    <p className="text-foreground break-words">{v}</p>
                  </div>
                ))}
                <div>
                  <p className="text-muted-foreground text-xs">Reason</p>
                  <p className="text-foreground text-xs leading-relaxed whitespace-pre-wrap">{selected.reason}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Submitted</p>
                  <p className="text-foreground text-xs">{new Date(selected.created_at).toLocaleString()}</p>
                </div>
              </div>

              {Array.isArray(selected.attachments) && selected.attachments.length > 0 && (
                <div className="mb-4">
                  <p className="text-muted-foreground text-xs mb-2">Attachments ({selected.attachments.length})</p>
                  <div className="space-y-1.5">
                    {selected.attachments.map(a => {
                      const isImg = a.type?.startsWith("image/");
                      return (
                        <button
                          key={a.path}
                          onClick={() => openAttachment(a.path)}
                          className="w-full flex items-center gap-2 p-2 rounded-lg border border-primary/15 bg-card/40 hover:border-primary hover:bg-primary/5 transition-colors text-left"
                        >
                          {isImg ? <ImageIcon size={14} className="text-primary shrink-0" /> : <FileText size={14} className="text-primary shrink-0" />}
                          <span className="text-xs text-foreground truncate flex-1">{a.name}</span>
                          <ExternalLink size={12} className="text-muted-foreground shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mb-4">
                <Button
                  onClick={() => updateStatus(selected.id, "approved")}
                  disabled={selected.status === "approved"}
                  className="h-9 text-xs gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  <CheckCircle2 size={14} /> Approve
                </Button>
                <Button
                  onClick={() => updateStatus(selected.id, "rejected")}
                  disabled={selected.status === "rejected"}
                  variant="destructive"
                  className="h-9 text-xs gap-1.5"
                >
                  <XCircle size={14} /> Reject
                </Button>
                <Button
                  onClick={() => updateStatus(selected.id, "processing")}
                  disabled={selected.status === "processing"}
                  variant="outline"
                  className="h-9 text-xs gap-1.5 col-span-2"
                >
                  <Loader2 size={14} /> Mark Processing
                </Button>
              </div>

              <div className="mb-3">
                <p className="text-muted-foreground text-xs mb-1.5">Admin Notes (গ্রাহককে দেখানো হবে)</p>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-card/40 border border-primary/15 rounded-lg p-2.5 text-foreground text-xs resize-none h-24 focus:outline-none focus:border-primary"
                  placeholder="Decision, refund txn id, রিজেক্টের কারণ..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveNotes} disabled={saving} className="flex-1 h-9 text-sm">
                  {saving ? "Saving..." : "Save Notes"}
                </Button>
                <Button asChild variant="outline" size="icon" className="h-9 w-9">
                  <a href={`mailto:${selected.email}`}><ExternalLink size={14} /></a>
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </AdminPage>
  );
};

export default AdminRefunds;
