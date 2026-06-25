import { useState } from "react";
import { Building2, Plus, Pencil, Trash2 } from "lucide-react";
import { AdminPage, AdminPageHeader, GlassCard } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useProductBrands, useSaveBrand, useDeleteBrand } from "@/hooks/useProductMgmt";

export default function AdminBrands() {
  const { data: brands = [], isLoading } = useProductBrands();
  const save = useSaveBrand();
  const del = useDeleteBrand();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any>(null);
  const [form, setForm] = useState<any>({ name: "", slug: "", logo_url: "", description: "", website_url: "", is_active: true });

  const openNew = () => { setEdit(null); setForm({ name: "", slug: "", logo_url: "", description: "", website_url: "", is_active: true }); setOpen(true); };
  const openEdit = (r: any) => { setEdit(r); setForm({ ...r }); setOpen(true); };
  const submit = async () => {
    if (!form.name.trim()) return toast.error("Name দরকার");
    try { await save.mutateAsync({ id: edit?.id, ...form }); toast.success("সংরক্ষিত"); setOpen(false); }
    catch (e: any) { toast.error(e.message); }
  };
  const remove = async (id: string) => { if (!confirm("Delete?")) return; await del.mutateAsync(id); toast.success("Deleted"); };

  return (
    <AdminPage>
      <AdminPageHeader title="Product Brands" subtitle="Brand list manage করুন" icon={Building2}
        actions={<Button onClick={openNew}><Plus className="w-4 h-4" /> New Brand</Button>} />
      <GlassCard className="p-4">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted-foreground border-b border-border/40"><th className="p-2">Logo</th><th className="p-2">Name</th><th className="p-2">Website</th><th className="p-2">Status</th><th className="p-2 text-right">Actions</th></tr></thead>
              <tbody>
                {brands.map((b: any) => (
                  <tr key={b.id} className="border-b border-border/20 hover:bg-primary/5">
                    <td className="p-2">{b.logo_url ? <img src={b.logo_url} alt={b.name} className="w-8 h-8 rounded object-contain" /> : "—"}</td>
                    <td className="p-2 font-medium">{b.name}</td>
                    <td className="p-2 text-xs">{b.website_url ?? "—"}</td>
                    <td className="p-2"><Badge variant={b.is_active ? "default" : "secondary"}>{b.is_active ? "Active" : "Inactive"}</Badge></td>
                    <td className="p-2 text-right"><Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => remove(b.id)}><Trash2 className="w-4 h-4 text-rose-400" /></Button></td>
                  </tr>
                ))}
                {!brands.length && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">কোনো brand নেই</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit ? "Edit" : "New"} Brand</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Slug (optional)</Label><Input value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
            <div><Label>Logo URL</Label><Input value={form.logo_url ?? ""} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} /></div>
            <div><Label>Website URL</Label><Input value={form.website_url ?? ""} onChange={(e) => setForm({ ...form, website_url: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><span className="text-sm">Active</span></div>
            <Button onClick={submit} disabled={save.isPending} className="w-full">{save.isPending ? "Saving…" : "Save"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}
