import { useEffect, useMemo, useRef, useState } from "react";
import { Edit2, ImagePlus, Package, Plus, Search, Star, Trash2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { syncServiceCategoriesWithAdminCatalog } from "@/hooks/useProductMgmt";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { AdminHeroHeader } from "@/components/admin/AdminCatalogHeader";

type Category = { id: string; name: string; slug: string; icon: string | null };
type Product = {
  id: string; title: string; slug: string | null; short_description: string | null;
  description: string | null; price: number | null; original_price: number | null;
  currency: string | null; image_url: string | null; category_id: string | null;
  service_id: string; is_published: boolean; is_featured: boolean; badge: string | null;
  features: string[] | null; sort_order: number | null;
  sku?: string | null; delivery_days?: number | null; meta_title?: string | null;
  meta_description?: string | null; meta_keywords?: string | null; canonical_url?: string | null;
  gallery_urls?: string[] | null;
};

type Form = Omit<Product, "id" | "service_id"> & { service_id: string; featureText: string; galleryText: string; sku: string; delivery_days: number | null; meta_title: string; meta_description: string; meta_keywords: string; canonical_url: string };
type EditorTab = "general" | "inventory" | "media" | "details" | "seo";
const blankForm = (): Form => ({ title: "", slug: "", short_description: "", description: "", price: null, original_price: null, currency: "BDT", image_url: "", category_id: "", service_id: "", is_published: true, is_featured: false, badge: "", features: [], featureText: "", gallery_urls: [], galleryText: "", sort_order: 0, sku: "", delivery_days: null, meta_title: "", meta_description: "", meta_keywords: "", canonical_url: "" });

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function AdminProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Array<{ id: string; slug: string }>>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Form>(blankForm());
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<EditorTab>("general");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      await syncServiceCategoriesWithAdminCatalog();
    } catch (error: any) {
      console.warn("Catalog sync warning:", error);
      toast.warning(error?.message ?? "Catalog sync did not complete");
    }

    const [{ data: productRows, error: productError }, { data: categoryRows }, { data: serviceRows }] = await Promise.all([
      supabase.from("service_packages" as any).select("*").order("sort_order").order("created_at", { ascending: false }),
      supabase.from("product_categories").select("id,name,slug,icon").eq("is_active", true).order("sort_order"),
      supabase.from("services").select("id,slug"),
    ]);
    if (productError) toast.error(productError.message);
    setProducts((productRows as Product[]) ?? []);
    setCategories(categoryRows ?? []);
    setServices(serviceRows ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter(product => [product.title, product.slug, product.short_description].filter(Boolean).join(" ").toLowerCase().includes(query));
  }, [products, search]);

  const openNew = () => { setEditing(null); setForm(blankForm()); setActiveTab("general"); setOpen(true); };
  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({ ...blankForm(), ...product, featureText: (product.features ?? []).join("\n"), galleryText: (product.gallery_urls ?? []).join("\n") });
    setActiveTab("general");
    setOpen(true);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `packages/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("cms-media").upload(path, file, { upsert: false });
    if (error) toast.error(error.message);
    else {
      const { data } = supabase.storage.from("cms-media").getPublicUrl(path);
      setForm(current => ({ ...current, image_url: data.publicUrl }));
      toast.success("Image uploaded");
    }
    setUploading(false);
  };

  const save = async () => {
    if (!form.title.trim()) return toast.error("Product title is required");
    const category = categories.find(item => item.id === form.category_id);
    const service = services.find(item => item.slug === category?.slug);
    if (!form.category_id || !service) return toast.error("Select a category");

    const payload: Record<string, any> = {
      title: form.title.trim(), slug: form.slug || slugify(form.title), short_description: form.short_description || null,
      description: form.description || null, price: form.price === null ? null : Number(form.price),
      original_price: form.original_price === null ? null : Number(form.original_price), currency: form.currency || "BDT",
      image_url: form.image_url || null, category_id: form.category_id, service_id: service.id,
      is_published: form.is_published, is_featured: form.is_featured, badge: form.badge || null,
      features: form.featureText.split("\n").map(item => item.trim()).filter(Boolean), sort_order: Number(form.sort_order) || 0,
      sku: form.sku || null, delivery_days: form.delivery_days === null ? null : Number(form.delivery_days),
      meta_title: form.meta_title || null, meta_description: form.meta_description || null,
      meta_keywords: form.meta_keywords || null, canonical_url: form.canonical_url || null,
      gallery_urls: form.galleryText.split("\n").map(item => item.trim()).filter(Boolean),
    };

    const mutation = editing
      ? supabase.from("service_packages" as any).update(payload).eq("id", editing.id)
      : supabase.from("service_packages" as any).insert(payload);

    let { error } = await mutation;

    if (error && /gallery_urls.*(schema|column)|column.*gallery_urls/i.test(error.message)) {
      delete payload.gallery_urls;
      const fallbackQuery = editing
        ? supabase.from("service_packages" as any).update(payload).eq("id", editing.id)
        : supabase.from("service_packages" as any).insert(payload);
      ({ error } = await fallbackQuery);
    }

    if (error) return toast.error(error.message);
    toast.success(editing ? "Product updated" : "Product created");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("service_packages" as any).delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Product deleted"); load(); }
  };

  const toggle = async (product: Product) => {
    const { error } = await supabase.from("service_packages" as any).update({ is_published: !product.is_published }).eq("id", product.id);
    if (error) toast.error(error.message); else load();
  };

  return (
    <div className="catalog-page">
      <AdminHeroHeader title="Products" section="Catalog" Icon={Package} />
      <div className="catalog-toolbar">
        <div className="catalog-search"><Search size={16} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search by name, slug..." /><span>{filtered.length} products</span></div>
        <Button onClick={openNew} className="catalog-primary"><Plus size={16} /> Add New Product</Button>
      </div>
      <div className="catalog-table-wrap">
        <table className="catalog-table"><thead><tr><th></th><th>PRODUCT</th><th>TYPE</th><th>PRICE</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
          <tbody>{loading ? <tr><td colSpan={6} className="catalog-empty">Loading products...</td></tr> : filtered.length === 0 ? <tr><td colSpan={6} className="catalog-empty">No products found</td></tr> : filtered.map(product => {
            const category = categories.find(item => item.id === product.category_id);
            return <tr key={product.id}><td><input type="checkbox" /></td><td><div className="catalog-product"><div className="catalog-thumb">{product.image_url ? <img src={product.image_url} alt="" /> : <Package size={18} />}</div><div><strong>{product.title}</strong><small>{category?.name ?? "Uncategorized"}{product.is_featured && <em><Star size={10} /> Featured</em>}</small></div></div></td><td>{product.badge || "Service"}</td><td><b>৳{Number(product.price ?? 0).toLocaleString("en-BD")}</b>{product.original_price && <del>৳{Number(product.original_price).toLocaleString("en-BD")}</del>}</td><td><button className={`catalog-status ${product.is_published ? "active" : "draft"}`} onClick={() => toggle(product)}><span />{product.is_published ? "Active" : "Draft"}</button></td><td><button className="catalog-action" onClick={() => openEdit(product)} title="Edit"><Edit2 size={15} /></button><button className="catalog-action danger" onClick={() => remove(product.id)} title="Delete"><Trash2 size={15} /></button></td></tr>;
          })}</tbody></table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}><DialogContent className="catalog-dialog product-editor-dialog"><DialogHeader><DialogTitle>{editing ? "Edit Product" : "Add New Product"}</DialogTitle></DialogHeader>
        <div className="product-editor-tabs">{([["general", "📦 General"], ["inventory", "🔥 Inventory"], ["media", "🖼️ Media"], ["details", "📋 Details"], ["seo", "🔍 SEO"]] as const).map(([id, label]) => <button key={id} className={activeTab === id ? "active" : ""} onClick={() => setActiveTab(id)} type="button">{label}</button>)}</div>
        <div className="catalog-form product-editor-body">
          {activeTab === "general" && <>
            <div className="editor-type-grid"><button type="button" className="selected">💾 Digital Download</button><button type="button">🔑 License Key</button><button type="button">👤 Account Delivery</button><button type="button">🔄 Subscription</button><button type="button">🛠️ Service</button><button type="button">📦 Physical Product</button></div>
            <label>Product title<Input value={form.title} onChange={event => setForm(current => ({ ...current, title: event.target.value, slug: current.slug || slugify(event.target.value), meta_title: current.meta_title || `${event.target.value} Price in Bangladesh` }))} /></label>
            <label>Category<select value={form.category_id} onChange={event => setForm(current => ({ ...current, category_id: event.target.value }))}><option value="">Select category</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            <label>Subtitle / Custom tagline<Input value={form.short_description ?? ""} placeholder="Best quality guaranteed, instant delivery..." onChange={event => setForm(current => ({ ...current, short_description: event.target.value }))} /></label>
            <label>Slug (URL)<Input value={form.slug ?? ""} onChange={event => setForm(current => ({ ...current, slug: event.target.value }))} /></label>
            <label>Product description <span className="catalog-hint">one bullet per line</span><Textarea rows={6} value={form.description ?? ""} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} /></label>
          </>}
          {activeTab === "inventory" && <>
            <div className="editor-section-title">💰 Pricing & Inventory</div>
            <div className="catalog-form-grid"><label>Selling price (৳)<Input type="number" value={form.price ?? ""} onChange={event => setForm(current => ({ ...current, price: event.target.value ? Number(event.target.value) : null }))} /></label><label>Original / MRP (৳)<Input type="number" value={form.original_price ?? ""} onChange={event => setForm(current => ({ ...current, original_price: event.target.value ? Number(event.target.value) : null }))} /></label></div>
            <div className="catalog-form-grid"><label>SKU<Input value={form.sku} placeholder="SKU-12345" onChange={event => setForm(current => ({ ...current, sku: event.target.value }))} /></label><label>Delivery days<Input type="number" value={form.delivery_days ?? ""} placeholder="Instant" onChange={event => setForm(current => ({ ...current, delivery_days: event.target.value ? Number(event.target.value) : null }))} /></label></div>
            <label>Badge<Input value={form.badge ?? ""} placeholder="New / Premium / Hot" onChange={event => setForm(current => ({ ...current, badge: event.target.value }))} /></label>
            <div className="catalog-toggles"><label><Switch checked={form.is_published} onCheckedChange={value => setForm(current => ({ ...current, is_published: value }))} /> Active</label><label><Switch checked={form.is_featured} onCheckedChange={value => setForm(current => ({ ...current, is_featured: value }))} /> Featured</label></div>
          </>}
          {activeTab === "media" && <>
            <div className="catalog-image-upload" onClick={() => fileRef.current?.click()}>{form.image_url ? <img src={form.image_url} alt="Preview" /> : <><ImagePlus size={24} /><span>Upload featured image</span></>}<input ref={fileRef} type="file" accept="image/*" hidden onChange={event => { const file = event.target.files?.[0]; if (file) uploadImage(file); }} />{uploading && <b>Uploading...</b>}</div>
            <label>Featured image URL<Input value={form.image_url ?? ""} onChange={event => setForm(current => ({ ...current, image_url: event.target.value }))} /></label>
            <label>Gallery image URLs <span className="catalog-hint">one URL per line</span><Textarea rows={5} value={form.galleryText} placeholder="https://..." onChange={event => setForm(current => ({ ...current, galleryText: event.target.value }))} /></label>
          </>}
          {activeTab === "details" && <>
            <label>Features <span className="catalog-hint">one feature per line</span><Textarea rows={6} value={form.featureText} onChange={event => setForm(current => ({ ...current, featureText: event.target.value }))} /></label>
            <label>Delivery / warranty notes<Textarea rows={4} placeholder="Instant delivery, genuine product, support included..." /></label>
            <label>Sort order<Input type="number" value={form.sort_order} onChange={event => setForm(current => ({ ...current, sort_order: Number(event.target.value) }))} /></label>
          </>}
          {activeTab === "seo" && <>
            <div className="seo-generator-hint">✨ AI-ready SEO fields · keep title within 60 characters and description within 160 characters.</div>
            <label>SEO title (max 60)<Input maxLength={60} value={form.meta_title} onChange={event => setForm(current => ({ ...current, meta_title: event.target.value }))} /></label>
            <label>Meta description (max 160)<Textarea maxLength={160} rows={4} value={form.meta_description} onChange={event => setForm(current => ({ ...current, meta_description: event.target.value }))} /></label>
            <label>Meta keywords<Input value={form.meta_keywords} onChange={event => setForm(current => ({ ...current, meta_keywords: event.target.value }))} /></label>
            <label>Canonical URL<Input value={form.canonical_url} placeholder="https://shahedit.com/product/..." onChange={event => setForm(current => ({ ...current, canonical_url: event.target.value }))} /></label>
          </>}
        </div>
        <div className="product-editor-footer"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save} className="catalog-primary">{editing ? "Update Product" : "Create Product"}</Button></div>
      </DialogContent></Dialog>
    </div>
  );
}
