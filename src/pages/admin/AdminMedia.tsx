import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Upload, Trash2, Search, Copy, Image as ImageIcon, Loader2, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPage, AdminPageHeader, GlassCard } from "@/components/admin/ui";
import { useAuth } from "@/contexts/AuthContext";

type MediaAsset = {
  id: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
  alt_text: string | null;
  title: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
};

const formatBytes = (b: number | null) => {
  if (!b) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
};

const AdminMedia = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<MediaAsset | null>(null);
  const [editAlt, setEditAlt] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);

  const fetchAssets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("media_assets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) toast.error(error.message);
    setAssets((data ?? []) as MediaAsset[]);
    setLoading(false);
  };

  useEffect(() => { fetchAssets(); }, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files || !files.length || !user) return;
    setUploading(true);
    let success = 0;
    for (const file of Array.from(files)) {
      try {
        const ext = file.name.split(".").pop() || "bin";
        const path = `library/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("cms-media")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) { toast.error(`${file.name}: ${upErr.message}`); continue; }
        const { data: pub } = supabase.storage.from("cms-media").getPublicUrl(path);

        // Try to capture image dimensions
        let width: number | null = null, height: number | null = null;
        if (file.type.startsWith("image/")) {
          await new Promise<void>(res => {
            const img = new Image();
            img.onload = () => { width = img.width; height = img.height; res(); };
            img.onerror = () => res();
            img.src = pub.publicUrl;
          });
        }

        const { error: dbErr } = await supabase.from("media_assets").insert({
          file_url: pub.publicUrl,
          file_type: file.type || "application/octet-stream",
          file_size: file.size,
          title: file.name,
          width, height,
          uploaded_by: user.id,
        });
        if (dbErr) { toast.error(`${file.name}: ${dbErr.message}`); continue; }
        success++;
      } catch (e: any) {
        toast.error(e.message);
      }
    }
    setUploading(false);
    if (success) toast.success(`${success} file(s) uploaded`);
    fetchAssets();
  };

  const remove = async (a: MediaAsset) => {
    if (!confirm(`Delete "${a.title || "this file"}"? This cannot be undone.`)) return;
    // attempt to remove the storage object
    try {
      const url = new URL(a.file_url);
      const idx = url.pathname.indexOf("/cms-media/");
      if (idx >= 0) {
        const path = url.pathname.slice(idx + "/cms-media/".length);
        await supabase.storage.from("cms-media").remove([path]);
      }
    } catch {}
    const { error } = await supabase.from("media_assets").delete().eq("id", a.id);
    if (error) { toast.error(error.message); return; }
    setSelected(null);
    setAssets(p => p.filter(x => x.id !== a.id));
    toast.success("Deleted");
  };

  const saveMeta = async () => {
    if (!selected) return;
    setSavingMeta(true);
    const { error } = await supabase
      .from("media_assets")
      .update({ alt_text: editAlt, title: editTitle })
      .eq("id", selected.id);
    setSavingMeta(false);
    if (error) { toast.error(error.message); return; }
    setAssets(p => p.map(a => a.id === selected.id ? { ...a, alt_text: editAlt, title: editTitle } : a));
    setSelected(s => s ? { ...s, alt_text: editAlt, title: editTitle } : null);
    toast.success("Saved");
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied");
  };

  const filtered = useMemo(() =>
    assets.filter(a =>
      (a.title ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (a.alt_text ?? "").toLowerCase().includes(search.toLowerCase())
    ), [assets, search]);

  return (
    <AdminPage>
      <AdminPageHeader
        title="Media Library"
        subtitle={`${assets.length} files • ছবি, লোগো ও মিডিয়া ম্যানেজ করুন`}
        icon={ImageIcon}
        actions={
          <>
            <Button onClick={fetchAssets} variant="ghost" size="icon" className="border border-primary/15">
              <RefreshCw size={15} />
            </Button>
            <label className="inline-flex items-center gap-2 px-4 h-9 rounded-md bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-medium cursor-pointer hover:opacity-90 transition">
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {uploading ? "Uploading..." : "Upload"}
              <input
                type="file"
                accept="image/*,video/*,application/pdf"
                multiple
                className="hidden"
                disabled={uploading}
                onChange={e => { handleUpload(e.target.files); e.target.value = ""; }}
              />
            </label>
          </>
        }
      />

      <GlassCard className="p-4 mb-5">
        <div
          onDragOver={e => { e.preventDefault(); }}
          onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
          className="border-2 border-dashed border-primary/20 rounded-xl py-6 flex flex-col items-center justify-center text-center"
        >
          <Upload size={26} className="text-primary mb-2" />
          <p className="text-sm text-foreground">Drag & drop files here</p>
          <p className="text-xs text-muted-foreground">or use the Upload button above • images / pdf / video</p>
        </div>
      </GlassCard>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or alt text..."
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {[...Array(10)].map((_, i) => <div key={i} className="aspect-square rounded-xl bg-card/30 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <GlassCard className="py-16 text-center">
              <ImageIcon size={40} className="text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No media yet. Upload your first file.</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map((a, i) => (
                <motion.button
                  key={a.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  onClick={() => { setSelected(a); setEditAlt(a.alt_text ?? ""); setEditTitle(a.title ?? ""); }}
                  className={`group relative aspect-square rounded-xl overflow-hidden border bg-card/40 ${
                    selected?.id === a.id ? "border-primary ring-2 ring-primary/40" : "border-primary/10 hover:border-primary/40"
                  } transition-all text-left`}
                >
                  {a.file_type.startsWith("image/") ? (
                    <img src={a.file_url} alt={a.alt_text ?? ""} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs p-2 break-all">
                      {a.file_type}
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-[10px] truncate">{a.title}</p>
                    <p className="text-white/70 text-[10px]">{formatBytes(a.file_size)}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {selected && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 flex-shrink-0"
          >
            <GlassCard className="p-4 sticky top-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-foreground font-semibold text-sm">File details</h3>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
              </div>
              <div className="aspect-video rounded-lg overflow-hidden bg-card/40 border border-primary/10 mb-4">
                {selected.file_type.startsWith("image/") ? (
                  <img src={selected.file_url} alt="" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">{selected.file_type}</div>
                )}
              </div>
              <div className="space-y-2 mb-4 text-xs">
                <div className="flex justify-between text-muted-foreground"><span>Type</span><span className="text-foreground">{selected.file_type}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Size</span><span className="text-foreground">{formatBytes(selected.file_size)}</span></div>
                {selected.width && selected.height && (
                  <div className="flex justify-between text-muted-foreground"><span>Dimensions</span><span className="text-foreground">{selected.width} × {selected.height}</span></div>
                )}
                <div className="flex justify-between text-muted-foreground"><span>Uploaded</span><span className="text-foreground">{new Date(selected.created_at).toLocaleDateString()}</span></div>
              </div>
              <div className="space-y-2 mb-3">
                <div>
                  <label className="text-muted-foreground text-xs">Title</label>
                  <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="h-9 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-muted-foreground text-xs">Alt text</label>
                  <Input value={editAlt} onChange={e => setEditAlt(e.target.value)} placeholder="Describe the image" className="h-9 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-muted-foreground text-xs">URL</label>
                  <div className="flex gap-1 mt-1">
                    <Input value={selected.file_url} readOnly className="h-9 text-xs" />
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => copyUrl(selected.file_url)}><Copy size={13} /></Button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveMeta} disabled={savingMeta} className="flex-1 h-9 text-sm">
                  {savingMeta ? "Saving..." : "Save"}
                </Button>
                <Button variant="outline" onClick={() => remove(selected)} className="h-9 px-3 text-rose-400 hover:text-rose-300 border-rose-400/30 hover:bg-rose-400/10">
                  <Trash2 size={14} />
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </AdminPage>
  );
};

export default AdminMedia;
