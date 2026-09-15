import { useEffect, useState } from "react";
import { Edit2, Folder, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { AdminHeroHeader } from "@/components/admin/AdminCatalogHeader";

type Category = { id: string; name: string; slug: string; description: string | null; image_url: string | null; icon: string | null; is_active: boolean; sort_order: number };
const empty = { name: "", slug: "", description: "", image_url: "", icon: "", is_active: true, sort_order: 0 };
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function AdminCategoryCatalog() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const load = async () => { const { data, error } = await supabase.from("product_categories").select("*").order("sort_order").order("name"); if (error) toast.error(error.message); setCategories(data ?? []); };
  useEffect(() => { load(); }, []);
  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (category: Category) => { setEditing(category); setForm({ name: category.name, slug: category.slug, description: category.description ?? "", image_url: category.image_url ?? "", icon: category.icon ?? "", is_active: category.is_active, sort_order: category.sort_order }); setOpen(true); };
  const save = async () => { if (!form.name.trim()) return toast.error("Category name is required"); const payload = { ...form, slug: form.slug || slugify(form.name), description: form.description || null, image_url: form.image_url || null, icon: form.icon || null }; const query = editing ? supabase.from("product_categories").update(payload).eq("id", editing.id) : supabase.from("product_categories").insert(payload); const { error } = await query; if (error) toast.error(error.message); else { toast.success(editing ? "Category updated" : "Category created"); setOpen(false); load(); } };
  const remove = async (id: string) => { if (!confirm("Delete this category?")) return; const { error } = await supabase.from("product_categories").delete().eq("id", id); if (error) toast.error(error.message); else { toast.success("Category deleted"); load(); } };
  return <div className="catalog-page"><AdminHeroHeader title="Categories" section="Catalog" Icon={Folder} /><div className="category-heading"><div><h2>Categories Management</h2><p>Changes update the website in real-time</p></div><Button onClick={openNew} className="catalog-primary"><Plus size={16} /> Add Category</Button></div><div className="category-grid">{categories.map(category => <article className="category-card" key={category.id}><div className="category-card-top"><div className="category-image">{category.image_url ? <img src={category.image_url} alt="" /> : <Folder size={23} />}</div><div className="category-card-actions"><button onClick={() => openEdit(category)}><Edit2 size={15} /></button><button onClick={() => remove(category.id)}><Trash2 size={15} /></button></div></div><h3>{category.name}</h3><small>/{category.slug}</small><p>{category.description || "No description added"}</p><div className="category-meta"><span className={category.is_active ? "active" : "inactive"}>{category.is_active ? "Active" : "Inactive"}</span><span>Order: {category.sort_order}</span></div></article>)}</div><Dialog open={open} onOpenChange={setOpen}><DialogContent className="catalog-dialog"><DialogHeader><DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle></DialogHeader><div className="catalog-form"><label>Category name<Input value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value, slug: current.slug || slugify(event.target.value) }))} /></label><label>Slug<Input value={form.slug} onChange={event => setForm(current => ({ ...current, slug: event.target.value }))} /></label><label>Description<Textarea rows={4} value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} /></label><label>Image URL<Input value={form.image_url} onChange={event => setForm(current => ({ ...current, image_url: event.target.value }))} /></label><div className="catalog-form-grid"><label>Icon name<Input value={form.icon} placeholder="Globe / Palette" onChange={event => setForm(current => ({ ...current, icon: event.target.value }))} /></label><label>Sort order<Input type="number" value={form.sort_order} onChange={event => setForm(current => ({ ...current, sort_order: Number(event.target.value) }))} /></label></div><label className="catalog-switch"><Switch checked={form.is_active} onCheckedChange={value => setForm(current => ({ ...current, is_active: value }))} /> Active</label><Button onClick={save} className="catalog-primary w-full">{editing ? "Save Changes" : "Create Category"}</Button></div></DialogContent></Dialog></div>;
}
