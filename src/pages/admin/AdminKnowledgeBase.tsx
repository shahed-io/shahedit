import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage, AdminPageHeader, GlassCard } from "@/components/admin/ui";
import { BookOpen, Plus, Trash2, Edit2, Save, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const db = supabase as any;
const emptyForm = { title: "", slug: "", excerpt: "", content: "", category: "general", is_published: false, is_featured: false, meta_title: "", meta_description: "" };

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^\w\u0980-\u09FF]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

export default function AdminKnowledgeBase() {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const { data } = await db.from("knowledge_articles").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title) return toast.error("Title required");
    const payload = { ...form, slug: form.slug || slugify(form.title), published_at: form.is_published ? new Date().toISOString() : null };
    const { error } = editing
      ? await db.from("knowledge_articles").update(payload).eq("id", editing.id)
      : await db.from("knowledge_articles").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Updated" : "Article created");
    setEditing(null); setForm(emptyForm); setShowForm(false); load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete?")) return;
    await db.from("knowledge_articles").delete().eq("id", id); load();
  };
  const togglePublish = async (a: any) => {
    await db.from("knowledge_articles").update({ is_published: !a.is_published, published_at: !a.is_published ? new Date().toISOString() : null }).eq("id", a.id);
    load();
  };

  return (
    <AdminPage>
      <AdminPageHeader
        title="Knowledge Base"
        subtitle="Help articles & documentation for clients"
        icon={BookOpen}
        actions={<Button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }}><Plus className="w-4 h-4 mr-2" />New Article</Button>}
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(a => (
          <GlassCard key={a.id} hover className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-foreground font-syne line-clamp-2">{a.title}</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${a.is_published ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-500/20 text-slate-300"}`}>{a.is_published ? "LIVE" : "DRAFT"}</span>
            </div>
            {a.category && <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 inline-block mb-2">{a.category}</span>}
            {a.excerpt && <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{a.excerpt}</p>}
            <p className="text-[10px] text-muted-foreground mb-3">👁 {a.view_count} views · /{a.slug}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditing(a); setForm({ ...emptyForm, ...a }); setShowForm(true); }}><Edit2 className="w-3 h-3 mr-1" />Edit</Button>
              <Button size="sm" variant="outline" onClick={() => togglePublish(a)}>{a.is_published ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}</Button>
              <Button size="sm" variant="outline" onClick={() => del(a.id)} className="text-rose-400 border-rose-400/30"><Trash2 className="w-3 h-3" /></Button>
            </div>
          </GlassCard>
        ))}
        {items.length === 0 && <p className="text-muted-foreground text-sm col-span-3 text-center py-8">No articles yet</p>}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Article" : "New Article"}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <Input placeholder="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} />
            <Input placeholder="Slug" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
            <Input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
            <Textarea placeholder="Excerpt (short summary)" value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} />
            <Textarea rows={10} placeholder="Content (markdown/HTML)" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
            <Input placeholder="Meta title (SEO)" value={form.meta_title} onChange={e => setForm({ ...form, meta_title: e.target.value })} />
            <Textarea placeholder="Meta description (SEO)" value={form.meta_description} onChange={e => setForm({ ...form, meta_description: e.target.value })} />
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.is_published} onCheckedChange={v => setForm({ ...form, is_published: v })} /> Published</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.is_featured} onCheckedChange={v => setForm({ ...form, is_featured: v })} /> Featured</label>
            </div>
            <Button onClick={save}><Save className="w-4 h-4 mr-2" />{editing ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}
