import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Search, Download, RefreshCw, MessageSquare, Inbox, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { Lead, LeadStatus } from "@/lib/supabase-types";
import { AdminPage, AdminPageHeader, GlassCard, KpiCard } from "@/components/admin/ui";

const statusOptions: LeadStatus[] = ["new", "in_progress", "contacted", "converted", "closed"];

const statusColor: Record<LeadStatus, string> = {
  new: "text-amber-300 bg-amber-400/10 border-amber-400/30",
  in_progress: "text-sky-300 bg-sky-400/10 border-sky-400/30",
  contacted: "text-violet-300 bg-violet-400/10 border-violet-400/30",
  converted: "text-emerald-300 bg-emerald-400/10 border-emerald-400/30",
  closed: "text-rose-300 bg-rose-400/10 border-rose-400/30",
};

const AdminLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [source, setSource] = useState<string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [includeRefunds, setIncludeRefunds] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    let q = supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter as LeadStatus);
    if (source !== "all") q = q.eq("source", source as Lead["source"]);
    if (from) q = q.gte("created_at", new Date(from).toISOString());
    if (to) q = q.lte("created_at", new Date(to + "T23:59:59").toISOString());
    if (!includeRefunds) q = q.or("service_interested.is.null,service_interested.neq.Refund Request");
    const { data, error } = await q;
    if (error) toast.error("Failed to load");
    setLeads(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); /* eslint-disable-next-line */ }, [filter, source, from, to, includeRefunds]);

  const updateStatus = async (id: string, status: LeadStatus) => {
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) { toast.error("Failed to update"); return; }
    toast.success("Status updated");
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    if (selectedLead?.id === id) setSelectedLead(prev => prev ? { ...prev, status } : null);
  };

  const saveNotes = async () => {
    if (!selectedLead) return;
    setSaving(true);
    await supabase.from("leads").update({ notes }).eq("id", selectedLead.id);
    setSaving(false);
    toast.success("Notes saved");
    setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, notes } : l));
  };

  const filtered = useMemo(() => leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    (l.company ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (l.phone ?? "").toLowerCase().includes(search.toLowerCase())
  ), [leads, search]);

  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Company", "Service", "Budget", "Timeline", "Source", "Status", "Notes", "Date"];
    const escape = (v: string) => `"${(v ?? "").toString().replace(/"/g, '""')}"`;
    const csvRows = filtered.map(l => [
      l.name, l.email, l.phone ?? "", l.company ?? "", l.service_interested ?? "",
      l.budget_range ?? "", l.timeline ?? "", l.source ?? "", l.status, l.notes ?? "",
      new Date(l.created_at).toLocaleString(),
    ].map(escape).join(","));
    const csv = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `leads-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const counts = useMemo(() => ({
    total: leads.length,
    new: leads.filter(l => l.status === "new").length,
    progress: leads.filter(l => l.status === "in_progress").length,
    converted: leads.filter(l => l.status === "converted").length,
    closed: leads.filter(l => l.status === "closed").length,
  }), [leads]);

  return (
    <AdminPage>
      <AdminPageHeader
        title="Leads"
        subtitle={`${leads.length} leads • Sales pipeline overview`}
        icon={Inbox}
        actions={
          <>
            <Button onClick={fetchLeads} variant="ghost" size="icon" className="border border-primary/15">
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
        <KpiCard label="New" value={counts.new} accent="amber" />
        <KpiCard label="In Progress" value={counts.progress} accent="sky" />
        <KpiCard label="Converted" value={counts.converted} accent="emerald" />
        <KpiCard label="Closed" value={counts.closed} accent="rose" />
      </div>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <GlassCard className="p-4 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              {["all", ...statusOptions].map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                    filter === s
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                      : "bg-card/40 text-muted-foreground hover:text-foreground border border-primary/10"
                  }`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
              <select
                value={source}
                onChange={e => setSource(e.target.value)}
                className="h-8 text-xs rounded-lg bg-card/40 border border-primary/10 text-foreground px-2"
              >
                <option value="all">All sources</option>
                <option value="contact_form">Contact form</option>
                <option value="quote_form">Quote form</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="phone">Phone</option>
                <option value="referral">Referral</option>
                <option value="other">Other</option>
              </select>
              <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="h-8 w-36 text-xs" />
              <span className="text-muted-foreground text-xs">→</span>
              <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="h-8 w-36 text-xs" />
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                <input type="checkbox" checked={includeRefunds} onChange={e => setIncludeRefunds(e.target.checked)} />
                Include refunds
              </label>
              <div className="relative ml-auto">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search leads..."
                  className="pl-9 h-8 text-sm w-56"
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
                <MessageSquare size={40} className="text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">No leads found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary/10">
                      {["Name", "Contact", "Service", "Source", "Status", "Date"].map(h => (
                        <th key={h} className="text-left text-muted-foreground text-xs font-medium px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((lead, i) => (
                      <motion.tr
                        key={lead.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(i * 0.02, 0.3) }}
                        onClick={() => { setSelectedLead(lead); setNotes(lead.notes ?? ""); }}
                        className={`border-b border-primary/5 hover:bg-primary/5 cursor-pointer transition-colors ${
                          selectedLead?.id === lead.id ? "bg-primary/10" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <p className="text-foreground text-sm font-medium">{lead.name}</p>
                          <p className="text-muted-foreground text-xs">{lead.company}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-foreground/80 text-xs">{lead.email}</p>
                          <p className="text-muted-foreground text-xs">{lead.phone}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{lead.service_interested || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs capitalize">{(lead.source ?? "").replace("_", " ") || "—"}</td>
                        <td className="px-4 py-3">
                          <select
                            value={lead.status}
                            onChange={e => { e.stopPropagation(); updateStatus(lead.id, e.target.value as LeadStatus); }}
                            onClick={e => e.stopPropagation()}
                            className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize bg-transparent cursor-pointer ${statusColor[lead.status]}`}
                          >
                            {statusOptions.map(s => <option key={s} value={s} className="bg-background text-foreground capitalize">{s.replace("_", " ")}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(lead.created_at).toLocaleDateString()}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>

        {selectedLead && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 flex-shrink-0"
          >
            <GlassCard className="p-5 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground font-semibold">Lead Details</h3>
                <button onClick={() => setSelectedLead(null)} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
              </div>
              <div className="space-y-3 text-sm mb-5">
                {[
                  ["Name", selectedLead.name],
                  ["Email", selectedLead.email],
                  ["Phone", selectedLead.phone],
                  ["Company", selectedLead.company],
                  ["Service", selectedLead.service_interested],
                  ["Budget", selectedLead.budget_range],
                  ["Timeline", selectedLead.timeline],
                  ["Source", selectedLead.source],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k as string}>
                    <p className="text-muted-foreground text-xs">{k}</p>
                    <p className="text-foreground">{v}</p>
                  </div>
                ))}
                {selectedLead.project_description && (
                  <div>
                    <p className="text-muted-foreground text-xs">Description</p>
                    <p className="text-foreground text-xs leading-relaxed whitespace-pre-wrap">{selectedLead.project_description}</p>
                  </div>
                )}
              </div>
              <div className="mb-3">
                <p className="text-muted-foreground text-xs mb-1.5">Internal Notes</p>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-card/40 border border-primary/15 rounded-lg p-2.5 text-foreground text-xs resize-none h-24 focus:outline-none focus:border-primary"
                  placeholder="Add notes..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveNotes} disabled={saving} className="flex-1 h-9 text-sm">
                  {saving ? "Saving..." : "Save Notes"}
                </Button>
                {selectedLead.email && (
                  <Button asChild variant="outline" size="icon" className="h-9 w-9">
                    <a href={`mailto:${selectedLead.email}`}><ExternalLink size={14} /></a>
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

export default AdminLeads;
