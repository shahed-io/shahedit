import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Service } from "@/lib/supabase-types";

const emptyService: Partial<Service> = { title: "", slug: "", short_description: "", description: "", icon: "", is_featured: false, is_published: true, sort_order: 0 };

const AdminServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Service>>(emptyService);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from("services").select("*").order("sort_order");
    setServices(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const save = async () => {
    if (!form.title) { toast.error("Title is required"); return; }
    setSaving(true);
    const payload = { ...form, title: form.title!, slug: form.slug || slugify(form.title ?? "") };
    if (editing) {
      const { error } = await supabase.from("services").update(payload).eq("id", editing);
      if (error) { toast.error(error.message); } else { toast.success("Updated!"); }
    } else {
      const { error } = await supabase.from("services").insert([payload]);
      if (error) { toast.error(error.message); } else { toast.success("Created!"); }
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    setForm(emptyService);
    fetch();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    await supabase.from("services").delete().eq("id", id);
    toast.success("Deleted");
    fetch();
  };

  const togglePublish = async (id: string, current: boolean) => {
    await supabase.from("services").update({ is_published: !current }).eq("id", id);
    fetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Services</h1>
          <p className="text-slate-400 text-sm">{services.length} services</p>
        </div>
        <Button
          onClick={() => { setForm(emptyService); setEditing(null); setShowForm(true); }}
          className="bg-purple-600 hover:bg-purple-500 gap-2"
        >
          <Plus size={15} /> Add Service
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-700 rounded-2xl p-6 mb-6"
        >
          <h2 className="text-white font-semibold mb-4">{editing ? "Edit Service" : "New Service"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {[["title", "Title *"], ["slug", "Slug (auto)"], ["icon", "Icon (emoji or URL)"], ["image_url", "Image URL"]].map(([key, label]) => (
              <div key={key}>
                <Label className="text-slate-300 text-xs mb-1.5 block">{label}</Label>
                <Input
                  value={(form as any)[key] ?? ""}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value, ...(key === "title" && !editing ? { slug: slugify(e.target.value) } : {}) }))}
                  className="bg-slate-800 border-slate-700 text-white h-9"
                />
              </div>
            ))}
          </div>
          <div className="mb-4">
            <Label className="text-slate-300 text-xs mb-1.5 block">Short Description</Label>
            <Input value={form.short_description ?? ""} onChange={e => setForm(p => ({ ...p, short_description: e.target.value }))} className="bg-slate-800 border-slate-700 text-white h-9" />
          </div>
          <div className="mb-4">
            <Label className="text-slate-300 text-xs mb-1.5 block">Description (HTML/Markdown)</Label>
            <textarea value={form.description ?? ""} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-purple-500" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_featured ?? false} onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))} className="rounded" />
              Featured
            </label>
            <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_published ?? true} onChange={e => setForm(p => ({ ...p, is_published: e.target.checked }))} className="rounded" />
              Published
            </label>
          </div>
          <div className="flex gap-3">
            <Button onClick={save} disabled={saving} className="bg-teal-600 hover:bg-teal-500">{saving ? "Saving..." : "Save"}</Button>
            <Button variant="ghost" onClick={() => setShowForm(false)} className="text-slate-400">Cancel</Button>
          </div>
        </motion.div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="space-y-px">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-slate-800/50 animate-pulse" />)}</div>
        ) : services.length === 0 ? (
          <div className="text-center py-16"><p className="text-slate-500">No services yet. Click "Add Service" to create one.</p></div>
        ) : (
          <table className="w-full">
            <thead><tr className="border-b border-slate-800">{["Icon", "Title", "Slug", "Status", "Actions"].map(h => <th key={h} className="text-left text-slate-400 text-xs font-medium px-4 py-3">{h}</th>)}</tr></thead>
            <tbody>
              {services.map((s, i) => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-4 py-3 text-2xl">{s.icon || "🔧"}</td>
                  <td className="px-4 py-3">
                    <p className="text-white text-sm font-medium">{s.title}</p>
                    <p className="text-slate-500 text-xs">{s.short_description?.slice(0, 50)}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs font-mono">{s.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${s.is_published ? "bg-teal-400/10 text-teal-400" : "bg-slate-700 text-slate-400"}`}>
                      {s.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" onClick={() => togglePublish(s.id, s.is_published)} className="h-7 w-7 text-slate-400 hover:text-yellow-400">
                        {s.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => { setForm(s); setEditing(s.id); setShowForm(true); }} className="h-7 w-7 text-slate-400 hover:text-blue-400">
                        <Pencil size={13} />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(s.id)} className="h-7 w-7 text-slate-400 hover:text-red-400">
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminServices;
