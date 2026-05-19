import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Upload, X, Search, Package, Star, Eye, EyeOff, Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  title: string;
  slug: string;
  sku: string | null;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  gallery_urls: string[] | null;
  price: number;
  original_price: number | null;
  currency: string;
  stock_quantity: number;
  in_stock: boolean;
  category: string | null;
  tags: string[] | null;
  brand: string | null;
  weight_grams: number | null;
  dimensions: string | null;
  badge: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
}

type ProductForm = Omit<Product, "id" | "created_at" | "tags" | "gallery_urls"> & {
  tags_csv: string;
  gallery_csv: string;
};

const emptyForm: ProductForm = {
  title: "",
  slug: "",
  sku: "",
  short_description: "",
  description: "",
  image_url: "",
  price: 0,
  original_price: null,
  currency: "BDT",
  stock_quantity: 0,
  in_stock: true,
  category: "",
  brand: "",
  weight_grams: null,
  dimensions: "",
  badge: "",
  is_featured: false,
  is_published: true,
  sort_order: 0,
  meta_title: "",
  meta_description: "",
  tags_csv: "",
  gallery_csv: "",
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\u0980-\u09FF]+/g, "-").replace(/-+/g, "-").replace(/(^-|-$)/g, "");

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products" as any)
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setProducts((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      ...emptyForm,
      ...p,
      tags_csv: (p.tags ?? []).join(", "),
      gallery_csv: (p.gallery_urls ?? []).join("\n"),
    } as ProductForm);
    setDialogOpen(true);
  };

  const upload = async (file: File, kind: "main" | "gallery") => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      const url = data.publicUrl;
      if (kind === "main") {
        setForm((f) => ({ ...f, image_url: url }));
      } else {
        setForm((f) => ({ ...f, gallery_csv: f.gallery_csv ? `${f.gallery_csv}\n${url}` : url }));
      }
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    setSaving(true);
    const payload: any = {
      title: form.title.trim(),
      slug: (form.slug || slugify(form.title)) || slugify(form.title),
      sku: form.sku || null,
      short_description: form.short_description || null,
      description: form.description || null,
      image_url: form.image_url || null,
      gallery_urls: form.gallery_csv.split("\n").map((s) => s.trim()).filter(Boolean),
      price: Number(form.price) || 0,
      original_price: form.original_price ? Number(form.original_price) : null,
      currency: form.currency || "BDT",
      stock_quantity: Number(form.stock_quantity) || 0,
      in_stock: form.in_stock,
      category: form.category || null,
      tags: form.tags_csv.split(",").map((s) => s.trim()).filter(Boolean),
      brand: form.brand || null,
      weight_grams: form.weight_grams ? Number(form.weight_grams) : null,
      dimensions: form.dimensions || null,
      badge: form.badge || null,
      is_featured: form.is_featured,
      is_published: form.is_published,
      sort_order: Number(form.sort_order) || 0,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
    };
    const q = editingId
      ? supabase.from("products" as any).update(payload).eq("id", editingId)
      : supabase.from("products" as any).insert(payload);
    const { error } = await q;
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editingId ? "Product updated" : "Product created");
    setDialogOpen(false);
    fetchProducts();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products" as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    fetchProducts();
  };

  const togglePublish = async (p: Product) => {
    const { error } = await supabase.from("products" as any).update({ is_published: !p.is_published }).eq("id", p.id);
    if (error) return toast.error(error.message);
    fetchProducts();
  };

  const filtered = products.filter((p) =>
    [p.title, p.sku, p.category, p.brand].filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Package size={22} /> Products
          </h1>
          <p className="text-slate-400 text-sm">Manage your store's product catalog</p>
        </div>
        <Button onClick={openCreate} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90">
          <Plus size={16} className="mr-1" /> Add Product
        </Button>
      </div>

      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
        <Input
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-slate-900 border-slate-800"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-56 bg-slate-900 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-800">
          <Package size={42} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-4">No products yet</p>
          <Button onClick={openCreate} variant="outline">Create your first product</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition"
            >
              <div className="aspect-video bg-slate-800 relative overflow-hidden">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <Package size={36} />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  {p.is_featured && <Badge className="bg-yellow-500/90"><Star size={10} className="mr-1" />Featured</Badge>}
                  {p.badge && <Badge className="bg-purple-600/90">{p.badge}</Badge>}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-semibold line-clamp-1">{p.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_published ? "bg-green-500/10 text-green-400" : "bg-slate-700 text-slate-400"}`}>
                    {p.is_published ? "Live" : "Draft"}
                  </span>
                </div>
                <p className="text-slate-400 text-xs line-clamp-2 mb-3 min-h-[2rem]">{p.short_description || "—"}</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-white font-bold">
                    {p.currency} {Number(p.price).toLocaleString()}
                    {p.original_price && (
                      <span className="text-slate-500 line-through text-xs ml-2">{p.currency} {Number(p.original_price).toLocaleString()}</span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">Stock: {p.stock_quantity}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)} className="flex-1">
                    <Edit2 size={14} className="mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => togglePublish(p)} title={p.is_published ? "Unpublish" : "Publish"}>
                    {p.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => remove(p.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="md:col-span-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })}
                placeholder="Product name"
                className="bg-slate-950 border-slate-800"
              />
            </div>

            <div>
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="bg-slate-950 border-slate-800" />
            </div>
            <div>
              <Label>SKU</Label>
              <Input value={form.sku ?? ""} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="bg-slate-950 border-slate-800" />
            </div>

            <div className="md:col-span-2">
              <Label>Short Description</Label>
              <Textarea
                value={form.short_description ?? ""}
                onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                rows={2}
                className="bg-slate-950 border-slate-800"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Full Description</Label>
              <Textarea
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={6}
                className="bg-slate-950 border-slate-800"
                placeholder="Detailed description (supports plain text or HTML)"
              />
            </div>

            {/* Main image */}
            <div className="md:col-span-2">
              <Label>Main Image</Label>
              <div className="flex items-start gap-3">
                {form.image_url && (
                  <div className="relative">
                    <img src={form.image_url} className="w-24 h-24 object-cover rounded-lg border border-slate-700" alt="" />
                    <button
                      onClick={() => setForm({ ...form, image_url: "" })}
                      className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1"
                      type="button"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                <label className="flex-1 border-2 border-dashed border-slate-700 rounded-lg p-4 text-center cursor-pointer hover:border-slate-600">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "main")}
                  />
                  {uploading ? <Loader2 className="mx-auto animate-spin" size={20} /> : <Upload className="mx-auto text-slate-400 mb-1" size={18} />}
                  <p className="text-xs text-slate-400">Click to upload</p>
                </label>
              </div>
              <Input
                value={form.image_url ?? ""}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="or paste URL"
                className="bg-slate-950 border-slate-800 mt-2"
              />
            </div>

            {/* Gallery */}
            <div className="md:col-span-2">
              <Label>Gallery Images (one URL per line)</Label>
              <Textarea
                value={form.gallery_csv}
                onChange={(e) => setForm({ ...form, gallery_csv: e.target.value })}
                rows={3}
                className="bg-slate-950 border-slate-800 font-mono text-xs"
              />
              <label className="inline-flex items-center gap-2 text-xs text-purple-400 cursor-pointer mt-1">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "gallery")}
                />
                <ImagePlus size={14} /> Upload another image
              </label>
            </div>

            <div>
              <Label>Price ({form.currency}) *</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="bg-slate-950 border-slate-800"
              />
            </div>
            <div>
              <Label>Original Price (strike-through)</Label>
              <Input
                type="number"
                value={form.original_price ?? ""}
                onChange={(e) => setForm({ ...form, original_price: e.target.value ? Number(e.target.value) : null })}
                className="bg-slate-950 border-slate-800"
              />
            </div>

            <div>
              <Label>Currency</Label>
              <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="bg-slate-950 border-slate-800" />
            </div>
            <div>
              <Label>Stock Quantity</Label>
              <Input
                type="number"
                value={form.stock_quantity}
                onChange={(e) => setForm({ ...form, stock_quantity: Number(e.target.value) })}
                className="bg-slate-950 border-slate-800"
              />
            </div>

            <div>
              <Label>Category</Label>
              <Input value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-slate-950 border-slate-800" />
            </div>
            <div>
              <Label>Brand</Label>
              <Input value={form.brand ?? ""} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="bg-slate-950 border-slate-800" />
            </div>

            <div>
              <Label>Weight (grams)</Label>
              <Input
                type="number"
                value={form.weight_grams ?? ""}
                onChange={(e) => setForm({ ...form, weight_grams: e.target.value ? Number(e.target.value) : null })}
                className="bg-slate-950 border-slate-800"
              />
            </div>
            <div>
              <Label>Dimensions</Label>
              <Input
                value={form.dimensions ?? ""}
                onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                placeholder="e.g. 10x20x5 cm"
                className="bg-slate-950 border-slate-800"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Tags (comma separated)</Label>
              <Input value={form.tags_csv} onChange={(e) => setForm({ ...form, tags_csv: e.target.value })} className="bg-slate-950 border-slate-800" />
            </div>

            <div>
              <Label>Badge (e.g. NEW, SALE)</Label>
              <Input value={form.badge ?? ""} onChange={(e) => setForm({ ...form, badge: e.target.value })} className="bg-slate-950 border-slate-800" />
            </div>
            <div>
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                className="bg-slate-950 border-slate-800"
              />
            </div>

            <div className="md:col-span-2">
              <Label>SEO Meta Title</Label>
              <Input value={form.meta_title ?? ""} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} className="bg-slate-950 border-slate-800" />
            </div>
            <div className="md:col-span-2">
              <Label>SEO Meta Description</Label>
              <Textarea
                value={form.meta_description ?? ""}
                onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                rows={2}
                className="bg-slate-950 border-slate-800"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
              <Label>Published</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
              <Label>Featured</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.in_stock} onCheckedChange={(v) => setForm({ ...form, in_stock: v })} />
              <Label>In Stock</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-gradient-to-r from-purple-600 to-pink-600">
              {saving && <Loader2 size={14} className="mr-2 animate-spin" />}
              {editingId ? "Save Changes" : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
