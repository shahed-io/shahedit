import { useState } from "react";
import { Tag, Plus, Trash2, Pencil } from "lucide-react";
import { AdminPage, AdminPageHeader, GlassCard } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useProductTags, useSaveTag, useDeleteTag } from "@/hooks/useProductMgmt";

export default function AdminProductTags() {
  const { data: tags = [], isLoading } = useProductTags();
  const save = useSaveTag();
  const del = useDeleteTag();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any>(null);
  const [form, setForm] = useState<any>({ name: "", slug: "" });

  const submit = async () => {
    if (!form.name.trim()) return toast.error("Name দরকার");
    await save.mutateAsync({ id: edit?.id, ...form });
    toast.success("সংরক্ষিত"); setOpen(false);
  };

  return (
    <AdminPage>
      <AdminPageHeader title="Product Tags" subtitle="Product tag manage" icon={Tag}
        actions={<Button onClick={() => { setEdit(null); setForm({ name: "", slug: "" }); setOpen(true); }}><Plus className="w-4 h-4" /> New Tag</Button>} />
      <GlassCard className="p-4">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> :
          <div className="flex flex-wrap gap-2">
            {tags.map((t: any) => (
              <div key={t.id} className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm">
                <span>{t.name}</span>
                <button onClick={() => { setEdit(t); setForm({ name: t.name, slug: t.slug }); setOpen(true); }} className="opacity-0 group-hover:opacity-100"><Pencil className="w-3 h-3" /></button>
                <button onClick={async () => { if (confirm("Delete?")) { await del.mutateAsync(t.id); toast.success("Deleted"); } }} className="opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3 text-rose-400" /></button>
              </div>
            ))}
            {!tags.length && <p className="text-sm text-muted-foreground">কোনো tag নেই</p>}
          </div>}
      </GlassCard>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit ? "Edit" : "New"} Tag</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto" /></div>
            <Button onClick={submit} className="w-full" disabled={save.isPending}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}
