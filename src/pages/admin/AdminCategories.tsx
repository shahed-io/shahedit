import { useState } from "react";
import { FolderTree, Plus, Pencil, Trash2 } from "lucide-react";
import { AdminPage, AdminPageHeader, GlassCard } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useProductCategories, useSaveCategory, useDeleteCategory } from "@/hooks/useProductMgmt";

type Row = any;

export default function AdminCategories() {
  const { data: cats = [], isLoading } = useProductCategories();
  const save = useSaveCategory();
  const del = useDeleteCategory();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Row | null>(null);
  const [form, setForm] = useState<any>({ name: "", slug: "", parent_id: null, description: "", image_url: "", icon: "", sort_order: 0, is_active: true });

  const openNew = () => {
    setEdit(null);
    setForm({ name: "", slug: "", parent_id: null, description: "", image_url: "", icon: "", sort_order: 0, is_active: true });
    setOpen(true);
  };
  const openEdit = (r: Row) => {
    setEdit(r);
    setForm({ name: r.name, slug: r.slug, parent_id: r.parent_id, description: r.description ?? "", image_url: r.image_url ?? "", icon: r.icon ?? "", sort_order: r.sort_order ?? 0, is_active: r.is_active });
    setOpen(true);
  };
  const submit = async () => {
    if (!form.name.trim()) return toast.error("Name দরকার");
    try {
      await save.mutateAsync({ id: edit?.id, ...form, parent_id: form.parent_id || null });
      toast.success("সংরক্ষিত");
      setOpen(false);
    } catch (e: any) { toast.error(e.message ?? "ব্যর্থ"); }
  };
  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    try { await del.mutateAsync(id); toast.success("Deleted"); } catch (e: any) { toast.error(e.message); }
  };

  const parents = cats.filter((c: Row) => !c.parent_id);
  const sorted = [...cats].sort(
    (a: Row, b: Row) => (a.sort_order ?? 999) - (b.sort_order ?? 999) || String(a.name).localeCompare(String(b.name)),
  );

  return (
    <AdminPage>
      <AdminPageHeader
        title="Categories"
        subtitle="Category এবং Sub-Category এক জায়গায় (parent দিয়ে nested)"
        icon={FolderTree}
        actions={<Button onClick={openNew}><Plus className="w-4 h-4" /> New Category</Button>}
      />
      {isLoading ? (
        <GlassCard className="p-6"><p className="text-sm text-muted-foreground">Loading…</p></GlassCard>
      ) : !cats.length ? (
        <GlassCard className="p-10 text-center text-muted-foreground">কোনো category নেই</GlassCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((c: Row, i: number) => (
            <GlassCard
              key={c.id}
              className="group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_-20px_hsl(var(--primary)/0.55)]"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/20 to-accent/10 text-2xl shadow-inner">
                  {c.icon ? <span>{c.icon}</span> : <FolderTree className="h-6 w-6 text-primary" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-base font-semibold">{c.name}</h3>
                    <Badge variant={c.is_active ? "default" : "secondary"} className="shrink-0">{c.is_active ? "Active" : "Inactive"}</Badge>
                  </div>
                  <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">/{c.slug}</p>
                  {c.description && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{c.description}</p>}
                  {c.parent_id && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Parent: <span className="text-foreground/80">{cats.find((p: Row) => p.id === c.parent_id)?.name ?? "—"}</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="relative mt-4 flex items-center justify-between border-t border-border/40 pt-3">
                <span className="rounded-full bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground">Order #{c.sort_order ?? i + 1}</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4 text-rose-400" /></Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}



      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit ? "Edit" : "New"} Category</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Slug (optional)</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generate" /></div>
            <div>
              <Label>Parent (sub-category-এর জন্য নির্বাচন করুন)</Label>
              <Select value={form.parent_id ?? "none"} onValueChange={(v) => setForm({ ...form, parent_id: v === "none" ? null : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="none">— None (Top level) —</SelectItem>
                  {parents.filter((p: Row) => p.id !== edit?.id).map((p: Row) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>Icon (emoji, যেমন 💻 🎨 📊)</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="💻" /></div>
            <div><Label>Image URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
              <div className="flex items-end gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><span className="text-sm">Active</span></div>
            </div>
            <Button onClick={submit} disabled={save.isPending} className="w-full">{save.isPending ? "Saving…" : "Save"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}
