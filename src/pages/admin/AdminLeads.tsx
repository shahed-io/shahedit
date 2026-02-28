import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Search, Download, Filter, RefreshCw, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { Lead, LeadStatus } from "@/lib/supabase-types";

const statusOptions: LeadStatus[] = ["new", "in_progress", "contacted", "converted", "closed"];

const statusColor: Record<LeadStatus, string> = {
  new: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  in_progress: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  contacted: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  converted: "text-teal-400 bg-teal-400/10 border-teal-400/20",
  closed: "text-slate-400 bg-slate-400/10 border-slate-400/20",
};

const AdminLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
  let q = supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter as LeadStatus);
    const { data } = await q;
    setLeads(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, [filter]);

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

  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Company", "Service", "Budget", "Status", "Date"];
    const rows = leads.map(l => [l.name, l.email, l.phone ?? "", l.company ?? "", l.service_interested ?? "", l.budget_range ?? "", l.status, new Date(l.created_at).toLocaleDateString()]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "leads.csv"; a.click();
    toast.success("CSV exported");
  };

  const filtered = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    (l.company ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Leads</h1>
            <p className="text-slate-400 text-sm">{leads.length} total leads</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchLeads} variant="ghost" size="icon" className="text-slate-400 hover:text-white border border-slate-700">
              <RefreshCw size={15} />
            </Button>
            <Button onClick={exportCSV} className="bg-teal-600 hover:bg-teal-500 text-white gap-2 text-sm">
              <Download size={15} /> Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {["all", ...statusOptions].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                filter === s ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
          <div className="relative ml-auto">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search leads..."
              className="pl-9 h-8 bg-slate-800 border-slate-700 text-white text-sm w-48"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="space-y-px">
              {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-slate-800/50 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare size={40} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500">No leads found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {["Name", "Contact", "Service", "Status", "Date"].map(h => (
                    <th key={h} className="text-left text-slate-400 text-xs font-medium px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, i) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => { setSelectedLead(lead); setNotes(lead.notes ?? ""); }}
                    className={`border-b border-slate-800/50 hover:bg-slate-800/50 cursor-pointer transition-colors ${
                      selectedLead?.id === lead.id ? "bg-purple-600/10 border-purple-600/20" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <p className="text-white text-sm font-medium">{lead.name}</p>
                      <p className="text-slate-500 text-xs">{lead.company}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-300 text-xs">{lead.email}</p>
                      <p className="text-slate-500 text-xs">{lead.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{lead.service_interested || "—"}</td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.status}
                        onChange={e => { e.stopPropagation(); updateStatus(lead.id, e.target.value as LeadStatus); }}
                        onClick={e => e.stopPropagation()}
                        className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize bg-transparent cursor-pointer ${statusColor[lead.status]}`}
                      >
                        {statusOptions.map(s => <option key={s} value={s} className="bg-slate-800 text-white capitalize">{s.replace("_", " ")}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{new Date(lead.created_at).toLocaleDateString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedLead && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-80 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex-shrink-0 h-fit sticky top-0"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Lead Details</h3>
            <button onClick={() => setSelectedLead(null)} className="text-slate-500 hover:text-white text-lg leading-none">×</button>
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
                <p className="text-slate-500 text-xs">{k}</p>
                <p className="text-white">{v}</p>
              </div>
            ))}
            {selectedLead.project_description && (
              <div>
                <p className="text-slate-500 text-xs">Description</p>
                <p className="text-white text-xs leading-relaxed">{selectedLead.project_description}</p>
              </div>
            )}
          </div>
          <div className="mb-3">
            <p className="text-slate-500 text-xs mb-1.5">Internal Notes</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-xs resize-none h-24 focus:outline-none focus:border-purple-500"
              placeholder="Add notes..."
            />
          </div>
          <Button onClick={saveNotes} disabled={saving} className="w-full bg-purple-600 hover:bg-purple-500 text-sm h-9">
            {saving ? "Saving..." : "Save Notes"}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default AdminLeads;
