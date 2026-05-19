import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage, AdminPageHeader, GlassCard, KpiCard } from "@/components/admin/ui";
import { Mail, Plus, Trash2, Download, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const db = supabase as any;

export default function AdminNewsletter() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ email: "", name: "" });
  const [filter, setFilter] = useState("all");

  const load = async () => {
    const { data } = await db.from("newsletter_subscribers").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.email) return toast.error("Email required");
    const { error } = await db.from("newsletter_subscribers").insert({ ...form, source: "manual" });
    if (error) return toast.error(error.message);
    toast.success("Added");
    setForm({ email: "", name: "" }); load();
  };
  const unsubscribe = async (id: string) => {
    await db.from("newsletter_subscribers").update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() }).eq("id", id);
    load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete subscriber?")) return;
    await db.from("newsletter_subscribers").delete().eq("id", id); load();
  };
  const exportCsv = () => {
    const csv = ["email,name,status,source,subscribed_at", ...items.map(i => `${i.email},${i.name ?? ""},${i.status},${i.source ?? ""},${i.created_at}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "subscribers.csv"; a.click();
  };

  const filtered = items.filter(i => filter === "all" || i.status === filter);
  const stats = {
    total: items.length,
    active: items.filter(i => i.status === "active").length,
    unsub: items.filter(i => i.status === "unsubscribed").length,
  };

  return (
    <AdminPage>
      <AdminPageHeader
        title="Newsletter Subscribers"
        subtitle="Email subscriber list"
        icon={Mail}
        actions={<Button variant="outline" onClick={exportCsv}><Download className="w-4 h-4 mr-2" />Export CSV</Button>}
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <KpiCard label="Total" value={stats.total} icon={Mail} accent="violet" />
        <KpiCard label="Active" value={stats.active} icon={Mail} accent="emerald" />
        <KpiCard label="Unsubscribed" value={stats.unsub} icon={UserMinus} accent="rose" />
      </div>

      <GlassCard className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-2">
          <Input placeholder="Email *" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="Name (optional)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Button onClick={add}><Plus className="w-4 h-4 mr-2" />Add</Button>
        </div>
      </GlassCard>

      <div className="flex gap-2 mb-3">
        {["all", "active", "unsubscribed", "bounced"].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`text-xs px-3 py-1 rounded-full ${filter === s ? "bg-primary text-primary-foreground" : "bg-primary/10"}`}>{s}</button>
        ))}
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-primary/5 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Source</th>
              <th className="text-center p-3">Status</th>
              <th className="text-left p-3">Subscribed</th>
              <th className="text-right p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-t border-primary/10">
                <td className="p-3 font-mono text-xs">{s.email}</td>
                <td className="p-3">{s.name ?? "—"}</td>
                <td className="p-3 text-xs">{s.source ?? "—"}</td>
                <td className="p-3 text-center"><span className={`text-[10px] px-2 py-0.5 rounded-full ${s.status === "active" ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>{s.status}</span></td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</td>
                <td className="p-3 text-right">
                  {s.status === "active" && <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => unsubscribe(s.id)}><UserMinus className="w-3 h-3" /></Button>}
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-400" onClick={() => del(s.id)}><Trash2 className="w-3 h-3" /></Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No subscribers</td></tr>}
          </tbody>
        </table>
      </GlassCard>
    </AdminPage>
  );
}
