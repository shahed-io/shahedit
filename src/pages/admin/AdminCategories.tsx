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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminServices from "./AdminServices";

type Row = any;

export default function AdminCategories() {
  const { data: cats = [], isLoading } = useProductCategories();
  const save = useSaveCategory();
  const del = useDeleteCategory();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Row | null>(null);
  const [form, setForm] = useState<any>({ name: "", slug: "", parent_id: null, description: "", image_url: "", sort_order: 0, is_active: true });

  const openNew = () => {
    setEdit(null);
    setForm({ name: "", slug: "", parent_id: null, description: "", image_url: "", sort_order: 0, is_active: true });
    setOpen(true);
  };
  const openEdit = (r: Row) => {
    setEdit(r);
    setForm({ name: r.name, slug: r.slug, parent_id: r.parent_id, description: r.description ?? "", image_url: r.image_url ?? "", sort_order: r.sort_order ?? 0, is_active: r.is_active });
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

  return (
    <AdminPage>
      <AdminPageHeader
        title="Categories"
        subtitle="Category এবং Sub-Category এক জায়গায় (parent দিয়ে nested)"
        icon={FolderTree}
        actions={<Button onClick={openNew}><Plus className="w-4 h-4" /> New Category</Button>}
      />
      <GlassCard className="p-4">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border/40">
                  <th className="p-2">Name</th><th className="p-2">Slug</th><th className="p-2">Parent</th><th className="p-2">Order</th><th className="p-2">Status</th><th className="p-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cats.map((c: Row) => (
                  <tr key={c.id} className="border-b border-border/20 hover:bg-primary/5">
                    <td className="p-2 font-medium">{c.name}</td>
                    <td className="p-2 text-xs font-mono">{c.slug}</td>
                    <td className="p-2 text-xs">{cats.find((p: Row) => p.id === c.parent_id)?.name ?? "—"}</td>
                    <td className="p-2">{c.sort_order}</td>
                    <td className="p-2"><Badge variant={c.is_active ? "default" : "secondary"}>{c.is_active ? "Active" : "Inactive"}</Badge></td>
                    <td className="p-2 text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(c.id)}><Trash2 className="w-4 h-4 text-rose-400" /></Button>
                    </td>
                  </tr>
                ))}
                {!cats.length && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">কোনো category নেই</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>


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
