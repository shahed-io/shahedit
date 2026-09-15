import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Package, ChevronDown, ChevronRight, ImagePlus, X, ToggleLeft, ToggleRight, Settings2, Globe, Wrench, Palette, Facebook, TrendingUp, BriefcaseBusiness, Code2, Smartphone, Cloud, BarChart3, ShieldCheck } from "lucide-react";
import RichDescriptionEditor from "@/components/RichDescriptionEditor";
import { motion, AnimatePresence } from "framer-motion";

interface Service {
  id: string;
  title: string;
  slug: string;
  icon: string | null;
  image_url: string | null;
  short_description?: string | null;
}

interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

const categoryIcons: Record<string, typeof Package> = {
  Globe, Wrench, Palette, Facebook, TrendingUp, BriefcaseBusiness, Code2, Smartphone, Cloud, BarChart3, ShieldCheck,
};

const CategoryIcon = ({ name }: { name: string | null }) => {
  const Icon = categoryIcons[name ?? ""] ?? Package;
  return <Icon size={17} className="text-purple-300" />;
};

interface ServicePackage {
  id: string;
  service_id: string;
  category_id: string | null;
  title: string;
  slug: string | null;
  description: string | null;
  price: number | null;
  original_price: number | null;
  currency: string;
  badge: string | null;
  features: string[] | null;
  image_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
}

const emptyForm = (): Omit<ServicePackage, "id" | "service_id"> => ({
  title: "",
  slug: "",
  description: "",
  price: null,
  original_price: null,
  currency: "BDT",
  badge: null,
  features: [],
  image_url: "",
  is_published: true,
  is_featured: false,
  sort_order: 0,
});

export default function AdminServicePackages() {
  const qc = useQueryClient();
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [featureInput, setFeatureInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // Service management state
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState<{ title: string; slug: string; short_description?: string; icon: string }>({ title: "", slug: "", short_description: "", icon: "🔧" });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["admin-services-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, title, slug, icon, image_url, short_description")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: categories = [] } = useQuery<ProductCategory[]>({
    queryKey: ["admin-product-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_categories")
        .select("id, name, slug, icon")
        .eq("is_active", true)
        .order("sort_order")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: packages = [] } = useQuery<ServicePackage[]>({
    queryKey: ["admin-service-packages"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("service_packages")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as ServicePackage[];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async ({ pkg, serviceId }: { pkg: Partial<ServicePackage>; serviceId: string }) => {
      if (pkg.id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from("service_packages").update({ ...pkg }).eq("id", pkg.id);
        if (error) throw error;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from("service_packages").insert({ ...pkg, service_id: serviceId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-service-packages"] });
      toast.success("প্রোডাক্ট সংরক্ষিত হয়েছে");
      resetForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from("service_packages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-service-packages"] });
      toast.success("প্রোডাক্ট মুছে ফেলা হয়েছে");
    },
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from("service_packages").update({ is_published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-service-packages"] }),
  });

  const resetForm = () => {
    setForm(emptyForm());
    setEditingPackage(null);
    setAddingFor(null);
    setFeatureInput("");
    setSelectedServiceId("");
    setSelectedCategoryId("");
  };

  const handleEdit = (pkg: ServicePackage) => {
    setEditingPackage(pkg);
    setAddingFor(pkg.service_id);
    setSelectedServiceId(pkg.service_id);
    setSelectedCategoryId(pkg.category_id ?? "");
    setForm({
      title: pkg.title,
      slug: pkg.slug ?? "",
      description: pkg.description ?? "",
      price: pkg.price,
      original_price: pkg.original_price,
      currency: pkg.currency,
      badge: pkg.badge,
      features: pkg.features ?? [],
      image_url: pkg.image_url ?? "",
      is_published: pkg.is_published,
      is_featured: pkg.is_featured,
      sort_order: pkg.sort_order,
    });
    setExpandedService(pkg.service_id);
  };

  const handleSubmit = (defaultServiceId: string) => {
    if (!form.title.trim()) return toast.error("শিরোনাম দিন");
    const targetServiceId = selectedServiceId || defaultServiceId;
    if (!targetServiceId) return toast.error("ক্যাটাগরি সিলেক্ট করুন");
    upsertMutation.mutate({
      pkg: editingPackage ? { ...form, id: editingPackage.id, service_id: targetServiceId, category_id: selectedCategoryId || null } : { ...form, category_id: selectedCategoryId || null },
      serviceId: targetServiceId,
    });
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setForm(f => ({ ...f, features: [...(f.features ?? []), featureInput.trim()] }));
    setFeatureInput("");
  };

  const removeFeature = (i: number) => {
    setForm(f => ({ ...f, features: f.features?.filter((_, idx) => idx !== i) ?? [] }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `packages/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("cms-media").upload(path, file);
    if (error) { toast.error("আপলোড ব্যর্থ"); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("cms-media").getPublicUrl(path);
    setForm(f => ({ ...f, image_url: publicUrl }));
    setUploading(false);
    toast.success("ছবি আপলোড হয়েছে");
  };

  const packagesForService = (serviceId: string) =>
    packages.filter(p => p.service_id === serviceId);

  const packagesForCategory = (category: ProductCategory) => {
    const service = services.find(s => s.slug === category.slug);
    return packages.filter(p => p.category_id === category.id || (!p.category_id && service?.id === p.service_id));
  };

  // The Products page is a flat product catalog. Categories are managed separately
  // in /ceo/categories and remain available here only as an assignment field.
  const categoryGroups = [{
    id: "all-products",
    title: "Products",
    icon: null,
    serviceId: services[0]?.id ?? "",
    categoryId: "",
    packages,
  }];

  // Service CRUD mutations
  const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const upsertService = useMutation({
    mutationFn: async (data: typeof serviceForm & { id?: string }) => {
      const payload = { ...data, slug: data.slug || slugify(data.title) };
      if (data.id) {
        const { error } = await supabase.from("services").update(payload).eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("services").insert([{ ...payload, is_published: true, sort_order: services.length }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-services-list"] });
      setShowServiceForm(false);
      setEditingService(null);
      setServiceForm({ title: "", slug: "", short_description: "", icon: "🔧" });
      toast.success(editingService ? "ক্যাটাগরি আপডেট হয়েছে" : "নতুন ক্যাটাগরি যোগ হয়েছে");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      // Delete related packages first
      await (supabase as any).from("service_packages").delete().eq("service_id", id);
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-services-list"] });
      qc.invalidateQueries({ queryKey: ["admin-service-packages"] });
      toast.success("ক্যাটাগরি মুছে ফেলা হয়েছে");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openServiceEdit = (s: Service) => {
    setEditingService(s);
    setServiceForm({ title: s.title, slug: s.slug, short_description: s.short_description ?? "", icon: s.icon ?? "🔧" });
    setShowServiceForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Products</h1>
          <p className="text-slate-400 text-sm mt-1">Manage products here. Assign each product to a category when creating or editing it.</p>
        </div>
        <Button
          onClick={() => { setEditingService(null); setServiceForm({ title: "", slug: "", short_description: "", icon: "🔧" }); setShowServiceForm(true); }}
          className="bg-purple-600 hover:bg-purple-500 text-white gap-2"
        >
          <Plus size={15} /> নতুন ক্যাটাগরি যোগ
        </Button>
      </div>

      {/* Service Add/Edit Modal */}
      <AnimatePresence>
        {showServiceForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) setShowServiceForm(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md mx-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-lg">
                  {editingService ? "ক্যাটাগরি এডিট করুন" : "নতুন ক্যাটাগরি যোগ করুন"}
                </h3>
                <button onClick={() => setShowServiceForm(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="space-y-1 w-16">
                    <label className="text-slate-400 text-xs">আইকন</label>
                    <Input
                      value={serviceForm.icon}
                      onChange={e => setServiceForm(f => ({ ...f, icon: e.target.value }))}
                      className="bg-slate-800 border-slate-700 text-white text-center text-xl"
                      maxLength={4}
                    />
                  </div>
                  <div className="space-y-1 flex-1">
                    <label className="text-slate-400 text-xs">ক্যাটাগরির নাম *</label>
                    <Input
                      value={serviceForm.title}
                      onChange={e => setServiceForm(f => ({ ...f, title: e.target.value, slug: slugify(e.target.value) }))}
                      placeholder="যেমন: Web Development"
                      className="bg-slate-800 border-slate-700 text-white"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 text-xs">Slug (URL)</label>
                  <Input
                    value={serviceForm.slug}
                    onChange={e => setServiceForm(f => ({ ...f, slug: e.target.value }))}
                    placeholder="web-development"
                    className="bg-slate-800 border-slate-700 text-white font-mono text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 text-xs">সংক্ষিপ্ত বিবরণ</label>
                  <Input
                    value={serviceForm.short_description}
                    onChange={e => setServiceForm(f => ({ ...f, short_description: e.target.value }))}
                    placeholder="ক্যাটাগরির একটি সংক্ষিপ্ত পরিচয়..."
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  onClick={() => {
                    if (!serviceForm.title.trim()) return toast.error("ক্যাটাগরির নাম দিন");
                    upsertService.mutate(editingService ? { ...serviceForm, id: editingService.id } : serviceForm);
                  }}
                  disabled={upsertService.isPending}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white"
                >
                  {upsertService.isPending ? "সংরক্ষণ হচ্ছে..." : editingService ? "আপডেট করুন" : "সার্ভিস যোগ করুন"}
                </Button>
                <Button variant="outline" onClick={() => setShowServiceForm(false)} className="border-slate-700 text-slate-300">
                  বাতিল
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {categoryGroups.map(category => {
          const pkgs = category.packages;
          const isExpanded = expandedService === category.id;
          const isAddingHere = addingFor === category.id;

          return (
            <div key={category.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              {/* Service header */}
              <div className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/30 transition-colors">
                <button
                  className="flex items-center gap-3 flex-1 text-left"
                  onClick={() => setExpandedService(isExpanded ? null : category.id)}
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center text-lg">
                    <CategoryIcon name={category.icon} />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold">{category.title}</p>
                    <p className="text-slate-500 text-xs">{pkgs.length} টি প্রোডাক্ট</p>
                  </div>
                </button>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => { const service = services.find(s => s.id === category.serviceId); if (service) openServiceEdit(service); }}
                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                    title="এডিট"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => { if (category.serviceId && confirm(`"${category.title}" এবং এর সকল প্রোডাক্ট মুছে ফেলতে চান?`)) deleteService.mutate(category.serviceId); }}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="ডিলিট"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    className="p-1.5 text-slate-400 ml-1"
                    onClick={() => setExpandedService(isExpanded ? null : category.id)}
                  >
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-slate-800"
                  >
                    <div className="p-5 space-y-4">
                      {/* Package list */}
                      {pkgs.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {pkgs.map(pkg => (
            <div key={pkg.id} className={`rounded-xl p-4 border group relative ${pkg.is_featured ? "bg-gradient-to-br from-amber-950/40 to-slate-800 border-amber-500/40" : "bg-slate-800 border-slate-700"}`}>
                              {/* Featured badge */}
                              {pkg.is_featured && (
                                <div className="absolute -top-2.5 left-4 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-lg">
                                  ⭐ Most Popular
                                </div>
                              )}
                              {pkg.image_url && (
                                <img src={pkg.image_url} alt={pkg.title} className="w-full h-28 object-cover rounded-lg mb-3 mt-1" />
                              )}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-sm truncate">{pkg.title}</p>
                                  {pkg.price !== null && (
                                    <p className="text-purple-400 text-xs font-semibold mt-0.5">
                                      {pkg.currency} {pkg.price?.toLocaleString("en-IN")}
                                    </p>
                                  )}
                                  {pkg.description && (
                                    <p className="text-slate-400 text-xs mt-1 line-clamp-2">{pkg.description}</p>
                                  )}
                                  {pkg.features && pkg.features.length > 0 && (
                                    <ul className="mt-2 space-y-0.5">
                                      {pkg.features.slice(0, 3).map((f, i) => (
                                        <li key={i} className="text-slate-400 text-xs flex items-center gap-1">
                                          <span className="w-1 h-1 rounded-full bg-teal-400 shrink-0" />
                                          {f}
                                        </li>
                                      ))}
                                      {pkg.features.length > 3 && (
                                        <li className="text-slate-500 text-xs">+{pkg.features.length - 3} আরও...</li>
                                      )}
                                    </ul>
                                  )}
                                </div>
                              </div>
                              {/* Actions */}
                              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700">
                                <button
                                  onClick={() => togglePublish.mutate({ id: pkg.id, is_published: !pkg.is_published })}
                                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${
                                    pkg.is_published ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-slate-400"
                                  }`}
                                >
                                  {pkg.is_published ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                                  {pkg.is_published ? "Published" : "Draft"}
                                </button>
                                <button
                                  onClick={() => handleEdit(pkg)}
                                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                                >
                                  <Pencil size={12} /> এডিট
                                </button>
                                <button
                                  onClick={() => { if (confirm("মুছে ফেলতে চান?")) deleteMutation.mutate(pkg.id); }}
                                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors ml-auto"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add/Edit form */}
                      {isAddingHere ? (
                        <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-5 space-y-4">
                          <h3 className="text-white font-semibold text-sm">
                            {editingPackage ? "প্রোডাক্ট এডিট করুন" : "নতুন প্রোডাক্ট যোগ করুন"}
                          </h3>

                          <div className="space-y-1">
                            <label className="text-slate-400 text-xs">ক্যাটাগরি *</label>
                            <select
                              value={selectedCategoryId || category.categoryId}
                              onChange={e => {
                                const next = categories.find(c => c.id === e.target.value);
                                setSelectedCategoryId(e.target.value);
                                setSelectedServiceId(services.find(s => s.slug === next?.slug)?.id ?? category.serviceId);
                              }}
                              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
                            >
                              {categories.map(c => (
                                <option key={c.id} value={c.id}>
                                  {c.icon ?? "📦"} {c.name}
                                </option>
                              ))}
                            </select>
                            <p className="text-slate-500 text-[11px]">এই প্যাকেজটি যে ক্যাটাগরির অধীনে দেখানো হবে</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-slate-400 text-xs">শিরোনাম *</label>
                              <Input
                                value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                placeholder="যেমন: Basic Package"
                                className="bg-slate-900 border-slate-700 text-white"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-slate-400 text-xs">বর্তমান মূল্য</label>
                                <Input
                                  type="number"
                                  value={form.price ?? ""}
                                  onChange={e => setForm(f => ({ ...f, price: e.target.value ? Number(e.target.value) : null }))}
                                  placeholder="9999"
                                  className="bg-slate-900 border-slate-700 text-white"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-slate-400 text-xs">আসল মূল্য (স্ট্রাইক)</label>
                                <Input
                                  type="number"
                                  value={form.original_price ?? ""}
                                  onChange={e => setForm(f => ({ ...f, original_price: e.target.value ? Number(e.target.value) : null }))}
                                  placeholder="40000"
                                  className="bg-slate-900 border-slate-700 text-white"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-slate-400 text-xs flex items-center gap-2">
                              URL Slug
                              <span className="text-slate-500 font-normal">(খালি রাখলে শিরোনাম থেকে স্বয়ংক্রিয় তৈরি হবে)</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 text-xs font-mono">/product/</span>
                              <Input
                                value={form.slug ?? ""}
                                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                                placeholder="basic-package"
                                className="bg-slate-900 border-slate-700 text-white font-mono text-sm flex-1"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-slate-400 text-xs">মুদ্রা</label>
                              <Input
                                value={form.currency}
                                onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                                placeholder="BDT"
                                className="bg-slate-900 border-slate-700 text-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-slate-400 text-xs">Badge (HOT/NEW)</label>
                              <select
                                value={form.badge ?? ""}
                                onChange={e => setForm(f => ({ ...f, badge: e.target.value || null }))}
                                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
                              >
                                <option value="">কোনো ব্যাজ নেই</option>
                                <option value="hot">🔥 HOT</option>
                                <option value="new">✨ NEW</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <label className="text-slate-400 text-xs font-medium">বিবরণ (Rich Text)</label>
                            <RichDescriptionEditor
                              value={form.description ?? ""}
                              onChange={html => setForm(f => ({ ...f, description: html }))}
                              placeholder="প্যাকেজের বিস্তারিত বিবরণ লিখুন... (Bold, Italic, তালিকা ইত্যাদি ব্যবহার করুন)"
                              minHeight="130px"
                            />
                          </div>

                          {/* Features */}
                          <div className="space-y-2">
                            <label className="text-slate-400 text-xs">ফিচার সমূহ</label>
                            <div className="flex gap-2">
                              <Input
                                value={featureInput}
                                onChange={e => setFeatureInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addFeature())}
                                placeholder="ফিচার লিখুন এবং Enter চাপুন"
                                className="bg-slate-900 border-slate-700 text-white flex-1"
                              />
                              <Button onClick={addFeature} size="sm" variant="outline" className="border-slate-600 text-slate-300">
                                <Plus size={14} />
                              </Button>
                            </div>
                            {form.features && form.features.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {form.features.map((f, i) => (
                                  <span key={i} className="flex items-center gap-1 bg-purple-600/20 text-purple-300 text-xs px-2.5 py-1 rounded-lg border border-purple-500/20">
                                    {f}
                                    <button onClick={() => removeFeature(i)} className="hover:text-red-400 ml-1">
                                      <X size={10} />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Image */}
                          <div className="space-y-2">
                            <label className="text-slate-400 text-xs">ছবি</label>
                            <div className="flex items-center gap-3">
                              {form.image_url ? (
                                <div className="relative">
                                  <img src={form.image_url} alt="" className="w-20 h-16 object-cover rounded-lg border border-slate-700" />
                                  <button
                                    onClick={() => setForm(f => ({ ...f, image_url: "" }))}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                                  >
                                    <X size={10} className="text-white" />
                                  </button>
                                </div>
                              ) : (
                                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-600 text-slate-400 text-sm cursor-pointer hover:border-purple-500 hover:text-purple-400 transition-colors">
                                  <ImagePlus size={16} />
                                  {uploading ? "আপলোড হচ্ছে..." : "ছবি আপলোড করুন"}
                                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                                </label>
                              )}
                              <div className="flex-1">
                                <Input
                                  value={form.image_url ?? ""}
                                  onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                                  placeholder="অথবা URL দিন"
                                  className="bg-slate-900 border-slate-700 text-white text-xs"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="text-slate-400 text-xs">ক্রম নম্বর</label>
                              <Input
                                type="number"
                                value={form.sort_order}
                                onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                                className="bg-slate-900 border-slate-700 text-white"
                              />
                            </div>
                            <div className="flex items-end pb-0.5">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <div
                                  onClick={() => setForm(f => ({ ...f, is_published: !f.is_published }))}
                                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${form.is_published ? "bg-green-500" : "bg-slate-600"}`}
                                >
                                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_published ? "translate-x-5" : "translate-x-0.5"}`} />
                                </div>
                                <span className="text-slate-300 text-sm">Published</span>
                              </label>
                            </div>
                            <div className="flex items-end pb-0.5">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <div
                                  onClick={() => setForm(f => ({ ...f, is_featured: !f.is_featured }))}
                                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${form.is_featured ? "bg-amber-500" : "bg-slate-600"}`}
                                >
                                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_featured ? "translate-x-5" : "translate-x-0.5"}`} />
                                </div>
                                <span className="text-amber-400 text-sm">⭐ Popular</span>
                              </label>
                            </div>
                          </div>

                          <div className="flex gap-3 pt-2">
                            <Button
                              onClick={() => handleSubmit(category.serviceId)}
                              disabled={upsertMutation.isPending}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              {upsertMutation.isPending ? "সংরক্ষণ হচ্ছে..." : editingPackage ? "আপডেট করুন" : "যোগ করুন"}
                            </Button>
                            <Button onClick={resetForm} variant="outline" className="border-slate-600 text-slate-300">
                              বাতিল
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setAddingFor(category.id); setEditingPackage(null); setForm(emptyForm()); setSelectedServiceId(category.serviceId); setSelectedCategoryId(category.categoryId); }}
                          className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 border border-dashed border-purple-500/30 hover:border-purple-500/60 rounded-xl px-4 py-3 w-full justify-center transition-all"
                        >
                          <Plus size={16} />
                          নতুন প্রোডাক্ট যোগ করুন
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
