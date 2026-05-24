import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Star, StarOff,
  X, Search, CheckSquare, Square, Save, LayoutGrid, List, FileText, Tag, GripVertical,
  Upload, Image as ImageIcon, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { notifyGscOnPublish } from "@/lib/gsc-client";

// ─── Types ───────────────────────────────────────────────────────────────────

type SelectOption = { value: string; label: string };

type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "checkbox" | "number" | "date" | "url" | "email" | "array" | "image" | "select";
  placeholder?: string;
  span?: "full";
  /** For type="select": static options */
  options?: SelectOption[];
  /** For type="select": load options from a table dynamically */
  optionsTable?: { table: string; valueKey?: string; labelKey: string };
  /** For type="image": storage bucket, defaults to "cms-media" */
  bucket?: string;
};

type CrudConfig = {
  table: string;
  displayName: string;
  fields: FieldDef[];
  primaryKey?: string;        // field shown as title in table row (default: fields[0])
  hasPublish?: boolean;       // show publish toggle
  hasFeatured?: boolean;      // show featured toggle
  hasSort?: boolean;          // show sort order
  orderBy?: string;
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const statusBadge = (published: boolean) =>
  published
    ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
    : "bg-slate-700/60 text-slate-400 border border-slate-600/30";

// ─── Factory ──────────────────────────────────────────────────────────────────

const createWooCrudPage = (cfg: CrudConfig) => {
  const {
    table, displayName, fields,
    hasPublish = false, hasFeatured = false, hasSort = false,
    orderBy = "created_at",
  } = cfg;

  const primaryField = fields[0];
  const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  return function WooCrudPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<Record<string, any>>({});
    const [editing, setEditing] = useState<string | null>(null);
    const [showPanel, setShowPanel] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");
    const [arrayInputs, setArrayInputs] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState<"general" | "seo">("general");
    const [dynamicOptions, setDynamicOptions] = useState<Record<string, SelectOption[]>>({});
    const [uploading, setUploading] = useState<Record<string, boolean>>({});

    const fetch = async () => {
      setLoading(true);
      const q = supabase.from(table as any).select("*");
      if (hasSort) q.order("sort_order");
      else q.order(orderBy, { ascending: false });
      const { data } = await q;
      setItems(data ?? []);
      setLoading(false);
    };

    // Load dynamic select options for fields with optionsTable
    useEffect(() => {
      const loaders = fields.filter(f => f.type === "select" && f.optionsTable);
      if (!loaders.length) return;
      (async () => {
        const map: Record<string, SelectOption[]> = {};
        for (const f of loaders) {
          const cfg = f.optionsTable!;
          const { data } = await supabase
            .from(cfg.table as any)
            .select(`${cfg.valueKey || "id"}, ${cfg.labelKey}`)
            .order(cfg.labelKey);
          map[f.key] = (data ?? []).map((r: any) => ({
            value: r[cfg.valueKey || "id"],
            label: r[cfg.labelKey],
          }));
        }
        setDynamicOptions(map);
      })();
    }, []);

    const uploadImage = async (fieldKey: string, file: File, bucket = "cms-media") => {
      setUploading(p => ({ ...p, [fieldKey]: true }));
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${table}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600", upsert: false,
      });
      if (upErr) {
        setUploading(p => ({ ...p, [fieldKey]: false }));
        toast.error(upErr.message);
        return;
      }
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      setForm(p => ({ ...p, [fieldKey]: pub.publicUrl }));
      setUploading(p => ({ ...p, [fieldKey]: false }));
      toast.success("Image uploaded");
    };

    useEffect(() => { fetch(); }, []);

    const emptyForm = () => {
      const obj: Record<string, any> = {};
      fields.forEach(f => {
        if (f.type === "checkbox") obj[f.key] = f.key === "is_published" ? true : false;
        else if (f.type === "number") obj[f.key] = 0;
        else if (f.type === "array") obj[f.key] = [];
        else obj[f.key] = "";
      });
      return obj;
    };

    const openNew = () => {
      setForm(emptyForm());
      setEditing(null);
      setArrayInputs({});
      setActiveTab("general");
      setShowPanel(true);
    };

    const openEdit = (item: any) => {
      setForm({ ...item });
      setEditing(item.id);
      setArrayInputs({});
      setActiveTab("general");
      setShowPanel(true);
    };

    const closePanel = () => { setShowPanel(false); setEditing(null); setForm({}); };

    const save = async () => {
      const primaryVal = form[primaryField.key];
      if (!primaryVal?.toString().trim()) { toast.error(`${primaryField.label} is required`); return; }
      setSaving(true);

      // auto-slug if slug field exists and empty
      const payload = { ...form };
      const slugField = fields.find(f => f.key === "slug");
      if (slugField && !payload.slug) payload.slug = slugify(String(primaryVal));

      let error;
      if (editing) {
        ({ error } = await supabase.from(table as any).update(payload).eq("id", editing));
      } else {
        ({ error } = await supabase.from(table as any).insert([payload]));
      }
      setSaving(false);
      if (error) { toast.error(error.message); return; }
      toast.success(editing ? `${displayName} updated!` : `${displayName} created!`);
      if (payload.is_published) notifyGscOnPublish();
      closePanel();
      fetch();
    };

    const remove = async (id: string, title: string) => {
      if (!confirm(`Delete "${title}"?`)) return;
      const { error } = await supabase.from(table as any).delete().eq("id", id);
      if (error) { toast.error(error.message); return; }
      toast.success("Deleted");
      setSelected(p => { const n = new Set(p); n.delete(id); return n; });
      fetch();
    };

    const bulkDelete = async () => {
      if (!confirm(`Delete ${selected.size} selected item(s)?`)) return;
      for (const id of selected) await supabase.from(table as any).delete().eq("id", id);
      toast.success(`${selected.size} deleted`);
      setSelected(new Set());
      fetch();
    };

    const bulkTogglePublish = async (publish: boolean) => {
      for (const id of selected) await supabase.from(table as any).update({ is_published: publish }).eq("id", id);
      toast.success(`${selected.size} updated`);
      if (publish) notifyGscOnPublish();
      setSelected(new Set());
      fetch();
    };

    const togglePublish = async (id: string, cur: boolean) => {
      await supabase.from(table as any).update({ is_published: !cur }).eq("id", id);
      if (!cur) notifyGscOnPublish();
      fetch();
    };

    const toggleFeatured = async (id: string, cur: boolean) => {
      await supabase.from(table as any).update({ is_featured: !cur }).eq("id", id);
      fetch();
    };

    const toggleSelect = (id: string) =>
      setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

    const filtered = items.filter(item => {
      const matchSearch = !search || String(item[primaryField.key] ?? "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = !hasPublish || filterStatus === "all" ||
        (filterStatus === "published" ? item.is_published : !item.is_published);
      return matchSearch && matchStatus;
    });

    const counts = {
      all: items.length,
      published: items.filter(i => i.is_published).length,
      draft: items.filter(i => !i.is_published).length,
    };

    // Split fields into general vs seo for the panel
    const seoKeys = ["meta_title", "meta_description"];
    const generalFields = fields.filter(f => !seoKeys.includes(f.key));
    const seoFields = fields.filter(f => seoKeys.includes(f.key));
    const hasSeoTab = seoFields.length > 0;

    return (
      <div className="relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">{displayName}s</h1>
            <p className="text-slate-400 text-sm mt-0.5">{items.length} total records</p>
          </div>
          <Button onClick={openNew} className="bg-purple-600 hover:bg-purple-500 gap-2 h-9 text-sm">
            <Plus size={15} /> Add {displayName}
          </Button>
        </div>

        {/* Filter Tabs (only for publishable content) */}
        {hasPublish && (
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
        )}

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder={`Search ${displayName.toLowerCase()}s...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 h-9"
            />
          </div>

          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{selected.size} selected</span>
              {hasPublish && (
                <>
                  <button onClick={() => bulkTogglePublish(true)} className="px-3 py-1.5 text-xs bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-600/30 transition">
                    Publish
                  </button>
                  <button onClick={() => bulkTogglePublish(false)} className="px-3 py-1.5 text-xs bg-slate-700 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-600 transition">
                    Unpublish
                  </button>
                </>
              )}
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
              {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-slate-800/50 rounded-xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-slate-400 font-medium">No {displayName.toLowerCase()}s found</p>
              <p className="text-slate-500 text-sm mt-1">Try adjusting filters or add a new entry</p>
              <Button onClick={openNew} className="mt-4 bg-purple-600 hover:bg-purple-500 gap-2">
                <Plus size={14} /> Add {displayName}
              </Button>
            </div>
          ) : viewMode === "table" ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="px-4 py-3 text-left w-8">
                    <button onClick={() => {
                      if (selected.size === filtered.length) setSelected(new Set());
                      else setSelected(new Set(filtered.map(i => i.id)));
                    }} className="text-slate-500 hover:text-white">
                      {selected.size === filtered.length && filtered.length > 0
                        ? <CheckSquare size={15} className="text-purple-400" />
                        : <Square size={15} />}
                    </button>
                  </th>
                  <th className="px-3 py-3 text-left text-slate-500 text-xs font-semibold uppercase tracking-wider">{primaryField.label}</th>
                  {hasPublish && <th className="px-3 py-3 text-left text-slate-500 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">Status</th>}
                  <th className="px-3 py-3 text-left text-slate-500 text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="px-3 py-3 text-right text-slate-500 text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`hover:bg-slate-800/30 transition-colors group ${selected.has(item.id) ? "bg-purple-900/10" : ""}`}
                  >
                    <td className="px-4 py-3.5">
                      <button onClick={() => toggleSelect(item.id)} className="text-slate-500 hover:text-purple-400">
                        {selected.has(item.id) ? <CheckSquare size={15} className="text-purple-400" /> : <Square size={15} />}
                      </button>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-3">
                        {item.icon && (
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                            style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.2)' }}>
                            {item.icon}
                          </div>
                        )}
                        {(item.client_avatar || item.avatar_url || item.featured_image || item.logo_url) && (
                          <img
                            src={item.client_avatar || item.avatar_url || item.featured_image || item.logo_url}
                            alt=""
                            className="w-9 h-9 rounded-xl object-cover shrink-0 bg-slate-800"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-white font-semibold text-sm truncate max-w-[220px]">
                            {item[primaryField.key]}
                          </p>
                          {(item.client_title || item.role || item.excerpt || item.short_description || item.department) && (
                            <p className="text-slate-500 text-xs truncate max-w-[220px] mt-0.5">
                              {item.client_title || item.role || item.excerpt || item.short_description || item.department}
                            </p>
                          )}
                          {hasFeatured && item.is_featured && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 mt-0.5">
                              <Star size={9} fill="currentColor" /> Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    {hasPublish && (
                      <td className="px-3 py-3.5 hidden sm:table-cell">
                        <button
                          onClick={() => togglePublish(item.id, item.is_published ?? false)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 ${statusBadge(item.is_published ?? false)}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.is_published ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                          {item.is_published ? "Published" : "Draft"}
                        </button>
                      </td>
                    )}
                    <td className="px-3 py-3.5 hidden md:table-cell">
                      <span className="text-slate-500 text-xs">{new Date(item.created_at).toLocaleDateString()}</span>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        {hasFeatured && (
                          <button
                            onClick={() => toggleFeatured(item.id, item.is_featured ?? false)}
                            title={item.is_featured ? "Unfeature" : "Feature"}
                            className={`p-1.5 rounded-lg transition ${item.is_featured ? "text-amber-400 bg-amber-400/10 hover:bg-amber-400/20" : "text-slate-500 hover:text-amber-400 hover:bg-slate-800"}`}
                          >
                            {item.is_featured ? <Star size={13} fill="currentColor" /> : <StarOff size={13} />}
                          </button>
                        )}
                        {hasPublish && (
                          <button
                            onClick={() => togglePublish(item.id, item.is_published ?? false)}
                            title={item.is_published ? "Unpublish" : "Publish"}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-yellow-400 hover:bg-slate-800 transition"
                          >
                            {item.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-slate-800 transition"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => remove(item.id, String(item[primaryField.key]))}
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
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className={`rounded-xl border p-4 group transition-all ${
                    selected.has(item.id) ? "border-purple-500/50 bg-purple-900/10" : "border-slate-700/60 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleSelect(item.id)} className="text-slate-600 hover:text-purple-400">
                        {selected.has(item.id) ? <CheckSquare size={14} className="text-purple-400" /> : <Square size={14} />}
                      </button>
                      {item.icon && <span className="text-2xl">{item.icon}</span>}
                      {(item.client_avatar || item.avatar_url) && (
                        <img src={item.client_avatar || item.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover bg-slate-800" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      )}
                    </div>
                    {hasPublish && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusBadge(item.is_published ?? false)}`}>
                        {item.is_published ? "Published" : "Draft"}
                      </span>
                    )}
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1 truncate">{item[primaryField.key]}</h3>
                  {(item.client_title || item.role || item.excerpt || item.short_description) && (
                    <p className="text-slate-500 text-xs line-clamp-2 mb-3">{item.client_title || item.role || item.excerpt || item.short_description}</p>
                  )}
                  <div className="flex items-center gap-1 pt-2 border-t border-slate-800">
                    {hasFeatured && (
                      <button onClick={() => toggleFeatured(item.id, item.is_featured ?? false)} className={`p-1.5 rounded transition ${item.is_featured ? "text-amber-400" : "text-slate-600 hover:text-amber-400"}`}>
                        <Star size={13} fill={item.is_featured ? "currentColor" : "none"} />
                      </button>
                    )}
                    {hasPublish && (
                      <button onClick={() => togglePublish(item.id, item.is_published ?? false)} className="p-1.5 rounded text-slate-600 hover:text-yellow-400 transition">
                        {item.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    )}
                    <button onClick={() => openEdit(item)} className="p-1.5 rounded text-slate-600 hover:text-blue-400 transition"><Pencil size={13} /></button>
                    <button onClick={() => remove(item.id, String(item[primaryField.key]))} className="p-1.5 rounded text-slate-600 hover:text-red-400 transition ml-auto"><Trash2 size={13} /></button>
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
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={closePanel}
                className="fixed inset-0 bg-black/60 z-40"
              />
              <motion.div
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 right-0 h-full w-full max-w-xl z-50 bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl overflow-hidden"
              >
                {/* Panel Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
                  <div>
                    <h2 className="text-white font-bold">{editing ? `Edit ${displayName}` : `Add New ${displayName}`}</h2>
                    <p className="text-slate-500 text-xs">{editing ? "Update details below" : "Fill in the details below"}</p>
                  </div>
                  <button onClick={closePanel} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
                    <X size={18} />
                  </button>
                </div>

                {/* Tabs (only if SEO fields exist) */}
                {hasSeoTab && (
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
                )}

                {/* Panel Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                  {(!hasSeoTab || activeTab === "general") && generalFields.map(f => (
                    <div key={f.key} className={f.span === "full" ? "col-span-2" : ""}>
                      {f.type === "checkbox" ? (
                        <button
                          onClick={() => setForm(p => ({ ...p, [f.key]: !p[f.key] }))}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                            form[f.key]
                              ? "bg-purple-600/15 border-purple-500/35 text-white"
                              : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
                          }`}
                        >
                          <div className={`w-8 h-5 rounded-full transition-all relative shrink-0 ${form[f.key] ? "bg-purple-600" : "bg-slate-700"}`}>
                            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form[f.key] ? "left-3.5" : "left-0.5"}`} />
                          </div>
                          <span className="text-sm font-medium">{f.label}</span>
                        </button>
                      ) : f.type === "textarea" ? (
                        <div>
                          <Label className="text-slate-400 text-xs mb-1.5 block">{f.label}</Label>
                          <textarea
                            value={form[f.key] ?? ""}
                            onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                            rows={4}
                            placeholder={f.placeholder}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
                          />
                        </div>
                      ) : f.type === "array" ? (
                        <div>
                          <Label className="text-slate-400 text-xs mb-2 block">{f.label}</Label>
                          <div className="flex gap-2 mb-3">
                            <Input
                              value={arrayInputs[f.key] ?? ""}
                              onChange={e => setArrayInputs(p => ({ ...p, [f.key]: e.target.value }))}
                              onKeyDown={e => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const val = (arrayInputs[f.key] ?? "").trim();
                                  if (!val) return;
                                  setForm(p => ({ ...p, [f.key]: [...(p[f.key] ?? []), val] }));
                                  setArrayInputs(p => ({ ...p, [f.key]: "" }));
                                }
                              }}
                              placeholder={f.placeholder || "Type and press Enter..."}
                              className="bg-slate-800 border-slate-700 text-white h-9 text-sm flex-1"
                            />
                            <Button
                              onClick={() => {
                                const val = (arrayInputs[f.key] ?? "").trim();
                                if (!val) return;
                                setForm(p => ({ ...p, [f.key]: [...(p[f.key] ?? []), val] }));
                                setArrayInputs(p => ({ ...p, [f.key]: "" }));
                              }}
                              className="bg-purple-600 hover:bg-purple-500 h-9 px-3"
                            >
                              <Plus size={14} />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {(form[f.key] ?? []).length === 0 && (
                              <p className="text-xs text-slate-600 text-center py-3 border border-dashed border-slate-700 rounded-lg">
                                No items yet. Add above.
                              </p>
                            )}
                            {(form[f.key] ?? []).map((item: string, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-slate-800/70 border border-slate-700/60 rounded-lg group">
                                <GripVertical size={13} className="text-slate-600" />
                                <span className="flex-1 text-sm text-slate-300">{item}</span>
                                <button
                                  onClick={() => setForm(p => ({ ...p, [f.key]: (p[f.key] ?? []).filter((_: any, i: number) => i !== idx) }))}
                                  className="text-slate-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : f.type === "image" ? (
                        <div>
                          <Label className="text-slate-400 text-xs mb-1.5 block">{f.label}</Label>
                          <div className="flex items-start gap-3">
                            <div className="w-24 h-24 rounded-lg border border-dashed border-slate-700 bg-slate-800/40 flex items-center justify-center overflow-hidden shrink-0">
                              {form[f.key] ? (
                                <img src={form[f.key]} alt="" className="w-full h-full object-cover"
                                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                              ) : (
                                <ImageIcon size={22} className="text-slate-600" />
                              )}
                            </div>
                            <div className="flex-1 space-y-2">
                              <label className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 cursor-pointer transition w-fit">
                                {uploading[f.key] ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                                {uploading[f.key] ? "Uploading..." : "Upload image"}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={!!uploading[f.key]}
                                  onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) uploadImage(f.key, file, f.bucket);
                                    e.target.value = "";
                                  }}
                                />
                              </label>
                              <Input
                                value={form[f.key] ?? ""}
                                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                placeholder="or paste image URL"
                                className="bg-slate-800 border-slate-700 text-white h-9 text-xs"
                              />
                              {form[f.key] && (
                                <button
                                  type="button"
                                  onClick={() => setForm(p => ({ ...p, [f.key]: "" }))}
                                  className="text-xs text-rose-400 hover:text-rose-300"
                                >
                                  Remove image
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : f.type === "select" ? (
                        <div>
                          <Label className="text-slate-400 text-xs mb-1.5 block">{f.label}</Label>
                          <select
                            value={form[f.key] ?? ""}
                            onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value || null }))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 h-10 text-white text-sm focus:outline-none focus:border-purple-500"
                          >
                            <option value="">— None —</option>
                            {(f.options ?? dynamicOptions[f.key] ?? []).map(o => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <Label className="text-slate-400 text-xs mb-1.5 block">{f.label}</Label>
                          <Input
                            type={f.type || "text"}
                            value={form[f.key] ?? ""}
                            onChange={e => {
                              const val = f.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value;
                              setForm(p => ({
                                ...p,
                                [f.key]: val,
                                ...(f.key === "title" && !editing
                                  ? { slug: slugify(e.target.value) }
                                  : {}),
                              }));
                            }}
                            placeholder={f.placeholder}
                            className="bg-slate-800 border-slate-700 text-white h-10 focus:border-purple-500"
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  {hasSeoTab && activeTab === "seo" && (
                    <>
                      {seoFields.map(f => (
                        <div key={f.key}>
                          <Label className="text-slate-400 text-xs mb-1.5 block">{f.label}</Label>
                          {f.type === "textarea" ? (
                            <textarea
                              value={form[f.key] ?? ""}
                              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                              rows={3}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
                            />
                          ) : (
                            <Input
                              value={form[f.key] ?? ""}
                              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                              className="bg-slate-800 border-slate-700 text-white h-10"
                            />
                          )}
                          <p className="text-xs text-slate-600 mt-1">
                            {(form[f.key] ?? "").length}/{f.key === "meta_title" ? 60 : 160} chars
                          </p>
                        </div>
                      ))}
                      {/* SERP Preview */}
                      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                        <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">SERP Preview</p>
                        <p className="text-blue-400 text-sm hover:underline">{form.meta_title || form[primaryField.key] || "Page Title"}</p>
                        <p className="text-green-400 text-xs mt-0.5">shahedit.com › {form.slug || "page-slug"}</p>
                        <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{form.meta_description || form.short_description || form.excerpt || "Meta description will appear here..."}</p>
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
                    {saving ? "Saving..." : editing ? `Update ${displayName}` : `Create ${displayName}`}
                  </Button>
                  <Button variant="ghost" onClick={closePanel} className="text-slate-400 hover:text-white">
                    Cancel
                  </Button>
                  {editing && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        const item = items.find(x => x.id === editing);
                        if (item) { remove(item.id, String(item[primaryField.key])); closePanel(); }
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
};

// ─── Page Exports ──────────────────────────────────────────────────────────────

export const AdminPortfolio = createWooCrudPage({
  table: "projects", displayName: "Project",
  hasPublish: true, hasFeatured: true, hasSort: true,
  fields: [
    { key: "title", label: "Title", placeholder: "Project title" },
    { key: "slug", label: "Slug" },
    { key: "client_name", label: "Client Name" },
    { key: "category", label: "Category", placeholder: "e.g. Web Design" },
    { key: "image_url", label: "Cover Image URL", placeholder: "https://..." },
    { key: "project_url", label: "Live URL", placeholder: "https://..." },
    { key: "short_description", label: "Short Description", type: "textarea" },
    { key: "description", label: "Full Description", type: "textarea" },
    { key: "tech_stack", label: "Tech Stack", type: "array", placeholder: "e.g. React, Node.js..." },
    { key: "is_published", label: "Published" , type: "checkbox" },
    { key: "is_featured", label: "Featured", type: "checkbox" },
    { key: "meta_title", label: "Meta Title" },
    { key: "meta_description", label: "Meta Description", type: "textarea" },
  ],
});

export const AdminBlog = createWooCrudPage({
  table: "blog_posts", displayName: "Blog Post",
  hasPublish: true, hasFeatured: true,
  fields: [
    { key: "title", label: "Title", placeholder: "Post title" },
    { key: "slug", label: "Slug" },
    { key: "featured_image", label: "Featured Image", type: "image" },
    {
      key: "category_id", label: "Category", type: "select",
      optionsTable: { table: "blog_categories", labelKey: "name" },
    },
    { key: "excerpt", label: "Excerpt", type: "textarea" },
    { key: "content", label: "Content", type: "textarea" },
    { key: "tags", label: "Tags", type: "array", placeholder: "Add tag and press Enter" },
    { key: "is_published", label: "Published", type: "checkbox" },
    { key: "is_featured", label: "Featured", type: "checkbox" },
    { key: "meta_title", label: "Meta Title" },
    { key: "meta_description", label: "Meta Description", type: "textarea" },
  ],
});

export const AdminBlogCategories = createWooCrudPage({
  table: "blog_categories", displayName: "Blog Category",
  fields: [
    { key: "name", label: "Name", placeholder: "Category name" },
    { key: "slug", label: "Slug" },
    { key: "description", label: "Description", type: "textarea" },
  ],
});

export const AdminTestimonials = createWooCrudPage({
  table: "testimonials", displayName: "Testimonial",
  hasPublish: true, hasSort: true,
  fields: [
    { key: "client_name", label: "Client Name", placeholder: "Full name" },
    { key: "client_title", label: "Title / Position", placeholder: "e.g. CEO" },
    { key: "client_company", label: "Company" },
    { key: "client_avatar", label: "Avatar URL", placeholder: "https://..." },
    { key: "content", label: "Testimonial Content", type: "textarea" },
    { key: "rating", label: "Rating (1–5)", type: "number" },
    { key: "is_published", label: "Published", type: "checkbox" },
  ],
});

export const AdminTeam = createWooCrudPage({
  table: "team_members", displayName: "Team Member",
  hasPublish: true, hasSort: true,
  fields: [
    { key: "name", label: "Full Name", placeholder: "Name" },
    { key: "role", label: "Role / Position", placeholder: "e.g. Lead Developer" },
    { key: "avatar_url", label: "Photo URL", placeholder: "https://..." },
    { key: "email", label: "Email", type: "email" },
    { key: "linkedin_url", label: "LinkedIn URL", type: "url" },
    { key: "twitter_url", label: "Twitter / X URL", type: "url" },
    { key: "bio", label: "Bio", type: "textarea" },
    { key: "is_published", label: "Published", type: "checkbox" },
  ],
});

export const AdminClients = createWooCrudPage({
  table: "clients", displayName: "Client",
  hasPublish: true, hasSort: true,
  fields: [
    { key: "name", label: "Client Name", placeholder: "Company name" },
    { key: "logo_url", label: "Logo URL", placeholder: "https://..." },
    { key: "website_url", label: "Website URL", type: "url" },
    { key: "is_published", label: "Published", type: "checkbox" },
  ],
});

export const AdminPricing = createWooCrudPage({
  table: "pricing_plans", displayName: "Pricing Plan",
  hasPublish: true, hasSort: true,
  fields: [
    { key: "name", label: "Plan Name", placeholder: "e.g. Basic" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "price_monthly", label: "Monthly Price (BDT)", type: "number" },
    { key: "price_yearly", label: "Yearly Price (BDT)", type: "number" },
    { key: "features", label: "Features", type: "array", placeholder: "Add feature and press Enter" },
    { key: "is_popular", label: "Mark as Popular", type: "checkbox" },
    { key: "is_published", label: "Published", type: "checkbox" },
  ],
});

export const AdminFAQ = createWooCrudPage({
  table: "faqs", displayName: "FAQ",
  hasPublish: true, hasSort: true,
  fields: [
    { key: "question", label: "Question", placeholder: "Enter the question" },
    { key: "answer", label: "Answer", type: "textarea" },
    { key: "category", label: "Category", placeholder: "e.g. General" },
    { key: "sort_order", label: "Sort Order", type: "number" },
    { key: "is_published", label: "Published", type: "checkbox" },
  ],
});

export const AdminCareers = createWooCrudPage({
  table: "careers", displayName: "Career",
  hasPublish: true,
  fields: [
    { key: "title", label: "Job Title", placeholder: "e.g. Frontend Developer" },
    { key: "department", label: "Department", placeholder: "e.g. Engineering" },
    { key: "location", label: "Location", placeholder: "e.g. Dhaka, Bangladesh" },
    { key: "type", label: "Type", placeholder: "e.g. Full-time, Part-time" },
    { key: "description", label: "Job Description", type: "textarea" },
    { key: "requirements", label: "Requirements", type: "array", placeholder: "Add requirement and press Enter" },
    { key: "deadline", label: "Application Deadline", type: "date" },
    { key: "is_published", label: "Published", type: "checkbox" },
  ],
});
