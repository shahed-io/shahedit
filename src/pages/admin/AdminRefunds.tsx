import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Search, Download, RefreshCw, RefreshCcw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { Lead, LeadStatus } from "@/lib/supabase-types";
import { AdminPage, AdminPageHeader, GlassCard, KpiCard } from "@/components/admin/ui";

const statusOptions: LeadStatus[] = ["new", "in_progress", "contacted", "converted", "closed"];

const statusLabel: Record<LeadStatus, string> = {
  new: "Pending",
  in_progress: "Processing",
  contacted: "Contacted",
  converted: "Refunded",
  closed: "Rejected",
};

const statusColor: Record<LeadStatus, string> = {
  new: "text-amber-300 bg-amber-400/10 border-amber-400/30",
  in_progress: "text-sky-300 bg-sky-400/10 border-sky-400/30",
  contacted: "text-violet-300 bg-violet-400/10 border-violet-400/30",
  converted: "text-emerald-300 bg-emerald-400/10 border-emerald-400/30",
  closed: "text-rose-300 bg-rose-400/10 border-rose-400/30",
};

const AdminRefunds = () => {
  const [rows, setRows] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    let q = supabase
      .from("leads")
      .select("*")
      .eq("service_interested", "Refund Request")
      .order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter as LeadStatus);
    if (from) q = q.gte("created_at", new Date(from).toISOString());
    if (to) q = q.lte("created_at", new Date(to + "T23:59:59").toISOString());
    const { data, error } = await q;
    if (error) toast.error("Failed to load");
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [filter, from, to]);

  const updateStatus = async (id: string, status: LeadStatus) => {
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) { toast.error("Failed to update"); return; }
    toast.success("Status updated");
    setRows(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
  };

  const saveNotes = async () => {
    if (!selected) return;
    setSaving(true);
    const { error } = await supabase.from("leads").update({ notes }).eq("id", selected.id);
    setSaving(false);
    if (error) { toast.error("Failed"); return; }
    toast.success("Notes saved");
    setRows(prev => prev.map(l => l.id === selected.id ? { ...l, notes } : l));
  };

  const filtered = useMemo(() => rows.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    (l.project_description ?? "").toLowerCase().includes(search.toLowerCase())
  ), [rows, search]);

  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Reason/Description", "Status", "Date"];
    const escape = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
    const csvRows = filtered.map(l => [
      l.name, l.email, l.phone ?? "", l.project_description ?? "",
      statusLabel[l.status], new Date(l.created_at).toLocaleString(),
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
    pending: rows.filter(r => r.status === "new").length,
    processing: rows.filter(r => r.status === "in_progress").length,
    refunded: rows.filter(r => r.status === "converted").length,
    rejected: rows.filter(r => r.status === "closed").length,
  }), [rows]);

  return (
    <AdminPage>
      <AdminPageHeader
        title="Refund Requests"
        subtitle="রিফান্ড অনুরোধসমূহ পর্যালোচনা ও প্রসেস করুন"
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
        <KpiCard label="Refunded" value={counts.refunded} accent="emerald" />
        <KpiCard label="Rejected" value={counts.rejected} accent="rose" />
      </div>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <GlassCard className="p-4 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              {["all", ...statusOptions].map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filter === s
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                      : "bg-card/40 text-muted-foreground hover:text-foreground border border-primary/10"
                  }`}
                >
                  {s === "all" ? "All" : statusLabel[s as LeadStatus]}
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
                  placeholder="Search name, email, reason..."
                  className="pl-9 h-8 text-sm w-60"
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
                      {["Customer", "Contact", "Reason", "Status", "Date"].map(h => (
                        <th key={h} className="text-left text-muted-foreground text-xs font-medium px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((l, i) => (
                      <motion.tr
                        key={l.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(i * 0.02, 0.3) }}
                        onClick={() => { setSelected(l); setNotes(l.notes ?? ""); }}
                        className={`border-b border-primary/5 hover:bg-primary/5 cursor-pointer transition-colors ${
                          selected?.id === l.id ? "bg-primary/10" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <p className="text-foreground text-sm font-medium">{l.name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-foreground/80 text-xs">{l.email}</p>
                          <p className="text-muted-foreground text-xs">{l.phone}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs max-w-xs truncate">
                          {l.project_description?.split("\n")[0] || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={l.status}
                            onChange={e => { e.stopPropagation(); updateStatus(l.id, e.target.value as LeadStatus); }}
                            onClick={e => e.stopPropagation()}
                            className={`text-xs px-2.5 py-1 rounded-full border font-medium bg-transparent cursor-pointer ${statusColor[l.status]}`}
                          >
                            {statusOptions.map(s => (
                              <option key={s} value={s} className="bg-background text-foreground">{statusLabel[s]}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(l.created_at).toLocaleDateString()}</td>
                      </motion.tr>
                    ))}
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
            className="w-80 flex-shrink-0"
          >
            <GlassCard className="p-5 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground font-semibold">Refund Details</h3>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
              </div>
              <div className="space-y-3 text-sm mb-5">
                {[
                  ["Name", selected.name],
                  ["Email", selected.email],
                  ["Phone", selected.phone],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k as string}>
                    <p className="text-muted-foreground text-xs">{k}</p>
                    <p className="text-foreground">{v}</p>
                  </div>
                ))}
                {selected.project_description && (
                  <div>
                    <p className="text-muted-foreground text-xs">Reason / Order Info</p>
                    <p className="text-foreground text-xs leading-relaxed whitespace-pre-wrap">{selected.project_description}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground text-xs">Submitted</p>
                  <p className="text-foreground text-xs">{new Date(selected.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="mb-3">
                <p className="text-muted-foreground text-xs mb-1.5">Internal Notes</p>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-card/40 border border-primary/15 rounded-lg p-2.5 text-foreground text-xs resize-none h-24 focus:outline-none focus:border-primary"
                  placeholder="Decision, refund txn id, ..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveNotes} disabled={saving} className="flex-1 h-9 text-sm">
                  {saving ? "Saving..." : "Save Notes"}
                </Button>
                {selected.email && (
                  <Button asChild variant="outline" size="icon" className="h-9 w-9">
                    <a href={`mailto:${selected.email}`}><ExternalLink size={14} /></a>
                  </Button>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </AdminPage>
  );
};

export default AdminRefunds;
