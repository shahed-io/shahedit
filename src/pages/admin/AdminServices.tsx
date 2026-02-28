import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Star, StarOff,
  X, Search, Filter, CheckSquare, Square, ChevronUp,
  ChevronDown, GripVertical, Tag, FileText, Save, LayoutGrid, List
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Service } from "@/lib/supabase-types";

const emptyService: Partial<Service> = {
  title: "", slug: "", short_description: "", description: "",
  icon: "", image_url: "", features: [], is_featured: false,
  is_published: true, sort_order: 0, meta_title: "", meta_description: ""
};

const statusBadge = (published: boolean) =>
  published
    ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
    : "bg-slate-700/60 text-slate-400 border border-slate-600/30";

const AdminServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Service>>(emptyService);
  const [editing, setEditing] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [featureInput, setFeatureInput] = useState("");
  const [activeTab, setActiveTab] = useState<"general" | "seo">("general");

  const fetchServices = async () => {
    setLoading(true);
    const { data } = await supabase.from("services").select("*").order("sort_order");
    setServices(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, []);

  const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const openNew = () => {
    setForm(emptyService);
    setEditing(null);
    setFeatureInput("");
    setActiveTab("general");
    setShowPanel(true);
  };

  const openEdit = (s: Service) => {
    setForm({ ...s });
    setEditing(s.id);
    setFeatureInput("");
    setActiveTab("general");
    setShowPanel(true);
  };

  const closePanel = () => { setShowPanel(false); setEditing(null); setForm(emptyService); };

  const save = async () => {
    if (!form.title?.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    const payload = {
      ...form,
      title: form.title!,
      slug: form.slug || slugify(form.title ?? ""),
      features: form.features ?? [],
    };
    let error;
    if (editing) {
      ({ error } = await supabase.from("services").update(payload).eq("id", editing));
    } else {
      ({ error } = await supabase.from("services").insert([payload]));
    }
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Service updated!" : "Service created!");
    closePanel();
    fetchServices();
  };

  const remove = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    await supabase.from("services").delete().eq("id", id);
    toast.success("Deleted");
    setSelected(p => { const n = new Set(p); n.delete(id); return n; });
    fetchServices();
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} selected service(s)?`)) return;
    for (const id of selected) await supabase.from("services").delete().eq("id", id);
    toast.success(`${selected.size} deleted`);
    setSelected(new Set());
    fetchServices();
  };

  const bulkTogglePublish = async (publish: boolean) => {
    for (const id of selected) await supabase.from("services").update({ is_published: publish }).eq("id", id);
    toast.success(`${selected.size} updated`);
    setSelected(new Set());
    fetchServices();
  };

  const togglePublish = async (id: string, cur: boolean) => {
    await supabase.from("services").update({ is_published: !cur }).eq("id", id);
    fetchServices();
  };

  const toggleFeatured = async (id: string, cur: boolean) => {
    await supabase.from("services").update({ is_featured: !cur }).eq("id", id);
    fetchServices();
  };

  const moveOrder = async (id: string, dir: -1 | 1) => {
    const idx = services.findIndex(s => s.id === id);
    if (idx < 0) return;
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= services.length) return;
    const a = services[idx], b = services[swapIdx];
    await Promise.all([
      supabase.from("services").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("services").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    fetchServices();
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setForm(p => ({ ...p, features: [...(p.features ?? []), featureInput.trim()] }));
    setFeatureInput("");
  };

  const removeFeature = (i: number) => {
    setForm(p => ({ ...p, features: (p.features ?? []).filter((_, idx) => idx !== i) }));
  };

  const toggleSelect = (id: string) =>
    setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(s => s.id)));
  };

  const filtered = services.filter(s => {
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || (filterStatus === "published" ? s.is_published : !s.is_published);
    return matchSearch && matchStatus;
  });

  const counts = {
    all: services.length,
    published: services.filter(s => s.is_published).length,
    draft: services.filter(s => !s.is_published).length,
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Services</h1>
          <p className="text-slate-400 text-sm mt-0.5">{services.length} total services</p>
        </div>
        <Button onClick={openNew} className="bg-purple-600 hover:bg-purple-500 gap-2 h-9 text-sm">
          <Plus size={15} /> Add Service
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 mb-4 flex-wrap">
        {(["all", "published", "draft"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilterStatus(f)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterStatus === f
                ? "bg-purple-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-black/20 text-[10px]">
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 h-9"
          />
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{selected.size} selected</span>
            <button onClick={() => bulkTogglePublish(true)} className="px-3 py-1.5 text-xs bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-600/30 transition">
              Publish
            </button>
            <button onClick={() => bulkTogglePublish(false)} className="px-3 py-1.5 text-xs bg-slate-700 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-600 transition">
              Unpublish
            </button>
            <button onClick={bulkDelete} className="px-3 py-1.5 text-xs bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition">
              <Trash2 size={12} className="inline mr-1" />Delete
            </button>
          </div>
        )}

        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => setViewMode("table")} className={`p-2 rounded-lg transition ${viewMode === "table" ? "bg-slate-700 text-white" : "text-slate-500 hover:text-white hover:bg-slate-800"}`}><List size={15} /></button>
          <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition ${viewMode === "grid" ? "bg-slate-700 text-white" : "text-slate-500 hover:text-white hover:bg-slate-800"}`}><LayoutGrid size={15} /></button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="space-y-px p-1">
            {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-slate-800/50 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-slate-400 font-medium">No services found</p>
            <p className="text-slate-500 text-sm mt-1">Try adjusting filters or add a new service</p>
            <Button onClick={openNew} className="mt-4 bg-purple-600 hover:bg-purple-500 gap-2">
              <Plus size={14} /> Add Service
            </Button>
          </div>
        ) : viewMode === "table" ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80">
                <th className="px-4 py-3 text-left w-8">
                  <button onClick={toggleAll} className="text-slate-500 hover:text-white">
                    {selected.size === filtered.length && filtered.length > 0
                      ? <CheckSquare size={15} className="text-purple-400" />
                      : <Square size={15} />}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-slate-500 text-xs font-semibold uppercase tracking-wider">Service</th>
                <th className="px-3 py-3 text-left text-slate-500 text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Features</th>
                <th className="px-3 py-3 text-left text-slate-500 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="px-3 py-3 text-left text-slate-500 text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">Order</th>
                <th className="px-3 py-3 text-right text-slate-500 text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((s, i) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`hover:bg-slate-800/30 transition-colors group ${selected.has(s.id) ? "bg-purple-900/10" : ""}`}
                >
                  {/* Checkbox */}
                  <td className="px-4 py-3.5">
                    <button onClick={() => toggleSelect(s.id)} className="text-slate-500 hover:text-purple-400">
                      {selected.has(s.id) ? <CheckSquare size={15} className="text-purple-400" /> : <Square size={15} />}
                    </button>
                  </td>

                  {/* Service Info */}
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                        style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
                        {s.icon || "🔧"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate max-w-[200px]">{s.title}</p>
                        <p className="text-slate-500 text-xs truncate max-w-[200px] mt-0.5">{s.short_description}</p>
                        {s.is_featured && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 mt-0.5">
                            <Star size={9} fill="currentColor" /> Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Features count */}
                  <td className="px-3 py-3.5 hidden md:table-cell">
                    <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-full">
                      {(s.features ?? []).length} features
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-3 py-3.5 hidden sm:table-cell">
                    <button onClick={() => togglePublish(s.id, s.is_published ?? false)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 ${statusBadge(s.is_published ?? false)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.is_published ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                      {s.is_published ? "Published" : "Draft"}
                    </button>
                  </td>

                  {/* Order */}
                  <td className="px-3 py-3.5 hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      <button onClick={() => moveOrder(s.id, -1)} className="p-1 text-slate-600 hover:text-white hover:bg-slate-700 rounded transition">
                        <ChevronUp size={13} />
                      </button>
                      <span className="text-slate-500 text-xs w-6 text-center">{s.sort_order}</span>
                      <button onClick={() => moveOrder(s.id, 1)} className="p-1 text-slate-600 hover:text-white hover:bg-slate-700 rounded transition">
                        <ChevronDown size={13} />
                      </button>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleFeatured(s.id, s.is_featured ?? false)}
                        title={s.is_featured ? "Unfeature" : "Feature"}
                        className={`p-1.5 rounded-lg transition ${s.is_featured ? "text-amber-400 bg-amber-400/10 hover:bg-amber-400/20" : "text-slate-500 hover:text-amber-400 hover:bg-slate-800"}`}
                      >
                        {s.is_featured ? <Star size={13} fill="currentColor" /> : <StarOff size={13} />}
                      </button>
                      <button
                        onClick={() => togglePublish(s.id, s.is_published ?? false)}
                        title={s.is_published ? "Unpublish" : "Publish"}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-yellow-400 hover:bg-slate-800 transition"
                      >
                        {s.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <button
                        onClick={() => openEdit(s)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-slate-800 transition"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => remove(s.id, s.title)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        ) : (
          /* Grid View */
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className={`rounded-xl border p-4 group transition-all ${
                  selected.has(s.id) ? "border-purple-500/50 bg-purple-900/10" : "border-slate-700/60 hover:border-slate-600"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleSelect(s.id)} className="text-slate-600 hover:text-purple-400">
                      {selected.has(s.id) ? <CheckSquare size={14} className="text-purple-400" /> : <Square size={14} />}
                    </button>
                    <span className="text-2xl">{s.icon || "🔧"}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusBadge(s.is_published ?? false)}`}>
                    {s.is_published ? "Published" : "Draft"}
                  </span>
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{s.title}</h3>
                <p className="text-slate-500 text-xs line-clamp-2 mb-3">{s.short_description}</p>
                {(s.features ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(s.features ?? []).slice(0, 3).map((f, j) => (
                      <span key={j} className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">{f}</span>
                    ))}
                    {(s.features ?? []).length > 3 && (
                      <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">+{(s.features ?? []).length - 3}</span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-1 pt-2 border-t border-slate-800">
                  <button onClick={() => toggleFeatured(s.id, s.is_featured ?? false)} className={`p-1.5 rounded transition ${s.is_featured ? "text-amber-400" : "text-slate-600 hover:text-amber-400"}`}>
                    <Star size={13} fill={s.is_featured ? "currentColor" : "none"} />
                  </button>
                  <button onClick={() => togglePublish(s.id, s.is_published ?? false)} className="p-1.5 rounded text-slate-600 hover:text-yellow-400 transition">
                    {s.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded text-slate-600 hover:text-blue-400 transition"><Pencil size={13} /></button>
                  <button onClick={() => remove(s.id, s.title)} className="p-1.5 rounded text-slate-600 hover:text-red-400 transition ml-auto"><Trash2 size={13} /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Slide-in Panel (WooCommerce style) */}
      <AnimatePresence>
        {showPanel && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closePanel}
              className="fixed inset-0 bg-black/60 z-40"
            />
            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-full max-w-xl z-50 bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
                <div>
                  <h2 className="text-white font-bold">{editing ? "Edit Service" : "Add New Service"}</h2>
                  <p className="text-slate-500 text-xs">{editing ? "Update service details" : "Fill in the details below"}</p>
                </div>
                <button onClick={closePanel} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
                  <X size={18} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-800 px-6 shrink-0">
                {([["general", "General", FileText], ["seo", "SEO", Tag]] as const).map(([tab, label, Icon]) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-1.5 px-3 py-3 text-sm border-b-2 -mb-px transition ${
                      activeTab === tab
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <Icon size={13} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Panel Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {activeTab === "general" && (
                  <>
                    {/* Title + Slug */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label className="text-slate-400 text-xs mb-1.5 block">Title <span className="text-red-400">*</span></Label>
                        <Input
                          value={form.title ?? ""}
                          onChange={e => setForm(p => ({
                            ...p,
                            title: e.target.value,
                            slug: editing ? p.slug : slugify(e.target.value)
                          }))}
                          placeholder="e.g. Web Design & Development"
                          className="bg-slate-800 border-slate-700 text-white h-10 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-400 text-xs mb-1.5 block">Slug</Label>
                        <Input
                          value={form.slug ?? ""}
                          onChange={e => setForm(p => ({ ...p, slug: slugify(e.target.value) }))}
                          className="bg-slate-800 border-slate-700 text-slate-300 h-10 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-400 text-xs mb-1.5 block">Icon (Emoji)</Label>
                        <Input
                          value={form.icon ?? ""}
                          onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                          placeholder="e.g. 💻"
                          className="bg-slate-800 border-slate-700 text-white h-10 text-xl"
                        />
                      </div>
                    </div>

                    {/* Image URL */}
                    <div>
                      <Label className="text-slate-400 text-xs mb-1.5 block">Image URL</Label>
                      <Input
                        value={form.image_url ?? ""}
                        onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
                        placeholder="https://..."
                        className="bg-slate-800 border-slate-700 text-white h-10"
                      />
                    </div>

                    {/* Short Description */}
                    <div>
                      <Label className="text-slate-400 text-xs mb-1.5 block">Short Description</Label>
                      <textarea
                        value={form.short_description ?? ""}
                        onChange={e => setForm(p => ({ ...p, short_description: e.target.value }))}
                        rows={2}
                        placeholder="Brief one-liner about this service..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
                      />
                    </div>

                    {/* Full Description */}
                    <div>
                      <Label className="text-slate-400 text-xs mb-1.5 block">Full Description</Label>
                      <textarea
                        value={form.description ?? ""}
                        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                        rows={4}
                        placeholder="Detailed description..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
                      />
                    </div>

                    {/* Features Manager */}
                    <div>
                      <Label className="text-slate-400 text-xs mb-2 block">Features / Sub-services</Label>
                      {/* Add feature input */}
                      <div className="flex gap-2 mb-3">
                        <Input
                          value={featureInput}
                          onChange={e => setFeatureInput(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                          placeholder="Type a feature and press Enter..."
                          className="bg-slate-800 border-slate-700 text-white h-9 text-sm flex-1"
                        />
                        <Button onClick={addFeature} className="bg-purple-600 hover:bg-purple-500 h-9 px-3">
                          <Plus size={14} />
                        </Button>
                      </div>
                      {/* Features list */}
                      <div className="space-y-2">
                        {(form.features ?? []).length === 0 && (
                          <p className="text-xs text-slate-600 text-center py-3 border border-dashed border-slate-700 rounded-lg">
                            No features yet. Add sub-services above.
                          </p>
                        )}
                        {(form.features ?? []).map((f, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-800/70 border border-slate-700/60 rounded-lg group">
                            <GripVertical size={13} className="text-slate-600 cursor-grab" />
                            <span className="flex-1 text-sm text-slate-300">{f}</span>
                            <button
                              onClick={() => removeFeature(i)}
                              className="text-slate-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: "is_published", label: "Published", desc: "Visible on website" },
                        { key: "is_featured", label: "Featured", desc: "Show in highlights" },
                      ].map(({ key, label, desc }) => (
                        <button
                          key={key}
                          onClick={() => setForm(p => ({ ...p, [key]: !(p as any)[key] }))}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                            (form as any)[key]
                              ? "bg-purple-600/15 border-purple-500/35 text-white"
                              : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
                          }`}
                        >
                          <div className={`w-8 h-5 rounded-full transition-all relative ${(form as any)[key] ? "bg-purple-600" : "bg-slate-700"}`}>
                            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${(form as any)[key] ? "left-3.5" : "left-0.5"}`} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold">{label}</p>
                            <p className="text-[10px] text-slate-500">{desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Sort Order */}
                    <div>
                      <Label className="text-slate-400 text-xs mb-1.5 block">Sort Order</Label>
                      <Input
                        type="number"
                        value={form.sort_order ?? 0}
                        onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                        className="bg-slate-800 border-slate-700 text-white h-9 w-24"
                      />
                    </div>
                  </>
                )}

                {activeTab === "seo" && (
                  <>
                    <div>
                      <Label className="text-slate-400 text-xs mb-1.5 block">Meta Title</Label>
                      <Input
                        value={form.meta_title ?? ""}
                        onChange={e => setForm(p => ({ ...p, meta_title: e.target.value }))}
                        placeholder={form.title ?? "Page title for SEO"}
                        className="bg-slate-800 border-slate-700 text-white h-10"
                      />
                      <p className="text-xs text-slate-600 mt-1">{(form.meta_title ?? "").length}/60 chars</p>
                    </div>
                    <div>
                      <Label className="text-slate-400 text-xs mb-1.5 block">Meta Description</Label>
                      <textarea
                        value={form.meta_description ?? ""}
                        onChange={e => setForm(p => ({ ...p, meta_description: e.target.value }))}
                        rows={3}
                        placeholder="Short description for search results..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
                      />
                      <p className="text-xs text-slate-600 mt-1">{(form.meta_description ?? "").length}/160 chars</p>
                    </div>
                    {/* SERP Preview */}
                    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                      <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">SERP Preview</p>
                      <p className="text-blue-400 text-sm hover:underline">{form.meta_title || form.title || "Service Title"}</p>
                      <p className="text-green-400 text-xs mt-0.5">shahedit.com › services › {form.slug || "slug"}</p>
                      <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{form.meta_description || form.short_description || "Meta description will appear here..."}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Panel Footer */}
              <div className="px-6 py-4 border-t border-slate-800 flex items-center gap-3 shrink-0 bg-slate-900/90">
                <Button
                  onClick={save}
                  disabled={saving}
                  className="bg-purple-600 hover:bg-purple-500 disabled:opacity-60 gap-2 flex-1 sm:flex-none"
                >
                  <Save size={14} />
                  {saving ? "Saving..." : editing ? "Update Service" : "Create Service"}
                </Button>
                <Button variant="ghost" onClick={closePanel} className="text-slate-400 hover:text-white">
                  Cancel
                </Button>
                {editing && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const s = services.find(x => x.id === editing);
                      if (s) remove(s.id, s.title).then(closePanel);
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10 ml-auto gap-1.5"
                  >
                    <Trash2 size={13} /> Delete
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminServices;
