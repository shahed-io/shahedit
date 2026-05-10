import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage, AdminPageHeader, GlassCard } from "@/components/admin/ui";
import { ArrowLeftRight, Plus, Trash2, Edit2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function AdminRedirects() {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ from_path: "", to_path: "", status_code: 301, is_active: true });

  const load = async () => {
    const { data } = await supabase.from("redirects").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.from_path.startsWith("/") || !form.to_path) { toast.error("Path গুলো সঠিকভাবে দিন"); return; }
    if (editing) {
      const { error } = await supabase.from("redirects").update(form).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Updated");
    } else {
      const { error } = await supabase.from("redirects").insert(form);
      if (error) return toast.error(error.message);
      toast.success("Redirect added");
    }
    setEditing(null);
    setForm({ from_path: "", to_path: "", status_code: 301, is_active: true });
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this redirect?")) return;
    await supabase.from("redirects").delete().eq("id", id);
    load();
  };

  return (
    <AdminPage>
      <AdminPageHeader
        title="Redirects (301/302)"
        subtitle="পুরাতন URL → নতুন URL — SEO link juice ধরে রাখুন"
        icon={ArrowLeftRight}
      />

      <GlassCard className="p-5 mb-6">
        <h3 className="text-sm font-semibold text-amber-100 mb-3">{editing ? "Edit Redirect" : "Add New Redirect"}</h3>
        <div className="grid md:grid-cols-12 gap-3">
          <Input className="md:col-span-4" placeholder="/old-page" value={form.from_path} onChange={(e) => setForm({ ...form, from_path: e.target.value })} />
          <Input className="md:col-span-4" placeholder="/new-page" value={form.to_path} onChange={(e) => setForm({ ...form, to_path: e.target.value })} />
          <select className="md:col-span-2 bg-background border border-input rounded-md px-3 text-sm" value={form.status_code} onChange={(e) => setForm({ ...form, status_code: Number(e.target.value) })}>
            <option value={301}>301 Permanent</option>
            <option value={302}>302 Temporary</option>
          </select>
          <div className="md:col-span-1 flex items-center justify-center">
            <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
          </div>
          <Button className="md:col-span-1" onClick={save}>
            {editing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </Button>
        </div>
      </GlassCard>

      <GlassCard className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-amber-400/10 text-amber-300/70 text-xs uppercase tracking-wider">
              <th className="text-left p-3">From</th>
              <th className="text-left p-3">To</th>
              <th className="text-left p-3">Code</th>
              <th className="text-left p-3">Hits</th>
              <th className="text-left p-3">Active</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-b border-amber-400/5 hover:bg-amber-400/5">
                <td className="p-3 text-amber-100 font-mono text-xs">{r.from_path}</td>
                <td className="p-3 text-emerald-300 font-mono text-xs">{r.to_path}</td>
                <td className="p-3 text-xs">{r.status_code}</td>
                <td className="p-3 text-xs">{r.hits}</td>
                <td className="p-3"><span className={`text-xs ${r.is_active ? "text-emerald-400" : "text-rose-400"}`}>{r.is_active ? "ON" : "OFF"}</span></td>
                <td className="p-3 flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(r); setForm({ from_path: r.from_path, to_path: r.to_path, status_code: r.status_code, is_active: r.is_active }); }}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => del(r.id)} className="text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} className="text-center p-8 text-muted-foreground text-xs">No redirects yet</td></tr>}
          </tbody>
        </table>
      </GlassCard>
    </AdminPage>
  );
}
