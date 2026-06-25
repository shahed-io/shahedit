import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Save, Copy, Upload, X as XIcon, Eye, ExternalLink, Image as ImageIcon } from "lucide-react";

type Popup = {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  cta_label: string;
  cta_link: string;
  bg_color: string;
  text_color: string;
  button_bg_color: string;
  button_text_color: string;
  overlay_opacity: number;
  border_radius: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  targeting: "all" | "home" | "specific";
  target_paths: string[];
  show_once: boolean;
  delay_seconds: number;
  priority: number;
};

const EMPTY: Omit<Popup, "id"> = {
  title: "স্বাগতম! 🎉",
  subtitle: "আমাদের নতুন অফার দেখুন এবং সাশ্রয়ী মূল্যে সেবা গ্রহণ করুন।",
  image_url: "",
  cta_label: "এখনই দেখুন",
  cta_link: "/services",
  bg_color: "#0a0510",
  text_color: "#ffffff",
  button_bg_color: "#7c3aed",
  button_text_color: "#ffffff",
  overlay_opacity: 0.7,
  border_radius: 24,
  is_active: false,
  starts_at: null,
  ends_at: null,
  targeting: "all",
  target_paths: [],
  show_once: true,
  delay_seconds: 2,
  priority: 0,
};

const db = supabase as any;

export default function AdminWelcomePopups() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await db
      .from("welcome_popups")
      .select("*")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    const rows = (data || []).map((r: any) => ({
      ...r,
      target_paths: Array.isArray(r.target_paths) ? r.target_paths : [],
    })) as Popup[];
    setPopups(rows);
    if (rows.length > 0 && !activeId) setActiveId(rows[0].id);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  const active = useMemo(() => popups.find((p) => p.id === activeId), [popups, activeId]);

  const updateActive = (patch: Partial<Popup>) => {
    if (!active) return;
    setPopups((all) => all.map((p) => (p.id === active.id ? { ...p, ...patch } : p)));
  };

  const saveActive = async () => {
    if (!active) return;
    setSaving(true);
    const { id, ...rest } = active;
    const payload = {
      ...rest,
      delay_seconds: Number(rest.delay_seconds) || 0,
      priority: Number(rest.priority) || 0,
      overlay_opacity: Number(rest.overlay_opacity) || 0.7,
      border_radius: Number(rest.border_radius) || 24,
      starts_at: rest.starts_at || null,
      ends_at: rest.ends_at || null,
    };
    const { error } = await db.from("welcome_popups").update(payload).eq("id", id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("সংরক্ষিত হয়েছে");
  };

  const createPopup = async () => {
    const { data, error } = await db.from("welcome_popups").insert([EMPTY]).select().single();
    if (error) {
      toast.error(error.message);
      return;
    }
    await load();
    setActiveId(data.id);
    toast.success("নতুন popup তৈরি হয়েছে");
  };

  const duplicatePopup = async () => {
    if (!active) return;
    const { id, ...rest } = active;
    const { data, error } = await db
      .from("welcome_popups")
      .insert([{ ...rest, title: `${rest.title} (কপি)`, is_active: false }])
      .select()
      .single();
    if (error) {
      toast.error(error.message);
      return;
    }
    await load();
    setActiveId(data.id);
    toast.success("Popup duplicate হয়েছে");
  };

  const deletePopup = async (id: string) => {
    if (!confirm("এই popup-টি ডিলিট করবেন?")) return;
    const { error } = await db.from("welcome_popups").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (activeId === id) setActiveId(null);
    await load();
    toast.success("ডিলিট হয়েছে");
  };

  const toggleActive = async (p: Popup) => {
    const { error } = await db.from("welcome_popups").update({ is_active: !p.is_active }).eq("id", p.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await load();
  };

  const uploadImage = async (file: File) => {
    if (!active) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("File too large (max 8MB)");
      return;
    }
    const ext = file.name.split(".").pop() || "jpg";
    const path = `welcome-popups/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const t = toast.loading("Uploading…");
    const { error: upErr } = await supabase.storage
      .from("cms-media")
      .upload(path, file, { upsert: false, cacheControl: "3600" });
    if (upErr) {
      toast.error(upErr.message, { id: t });
      return;
    }
    const { data: pub } = supabase.storage.from("cms-media").getPublicUrl(path);
    updateActive({ image_url: pub.publicUrl });
    toast.success("Uploaded", { id: t });
  };

  const clearLocalSeen = () => {
    try {
      localStorage.removeItem("welcome_popup_seen");
      toast.success("Local 'seen' state ক্লিয়ার করা হয়েছে — refresh করলে আবার popup দেখাবে");
    } catch {
      toast.error("পারলাম না");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Welcome Popup Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visitor-দের জন্য welcome popup তৈরি, customize ও schedule করুন
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={clearLocalSeen} variant="outline" size="sm">
            Reset "Seen" (test)
          </Button>
          <Button onClick={createPopup} size="sm">
            <Plus size={14} className="mr-1.5" /> নতুন Popup
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        {/* Sidebar list */}
        <Card className="p-3 space-y-2 max-h-[80vh] overflow-auto">
          {loading && <div className="text-sm text-muted-foreground p-2">লোড হচ্ছে…</div>}
          {!loading && popups.length === 0 && (
            <div className="text-sm text-muted-foreground p-3 text-center">
              এখনো কোনো popup নেই। "নতুন Popup" দিয়ে শুরু করুন।
            </div>
          )}
          {popups.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveId(p.id)}
              className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                activeId === p.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-accent/30"
              }`}
            >
              <div className="flex items-start gap-2">
                <div
                  className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center"
                  style={{ background: p.bg_color || "#222" }}
                >
                  {p.image_url ? (
                    <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={14} className="opacity-50" style={{ color: p.text_color }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{p.title || "(no title)"}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        p.is_active
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.is_active ? "ACTIVE" : "OFF"}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase">{p.targeting}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </Card>

        {/* Editor */}
        {!active ? (
          <Card className="p-8 text-center text-muted-foreground">
            একটি popup নির্বাচন করুন অথবা নতুন তৈরি করুন
          </Card>
        ) : (
          <Card className="p-4 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b">
              <div className="flex items-center gap-2">
                <Switch
                  checked={active.is_active}
                  onCheckedChange={(v) => updateActive({ is_active: v })}
                />
                <Label className="text-sm font-medium">
                  {active.is_active ? "🟢 Live" : "⚪ Inactive"}
                </Label>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowPreview(true)}>
                  <Eye size={14} className="mr-1.5" /> Preview
                </Button>
                <Button size="sm" variant="outline" onClick={duplicatePopup}>
                  <Copy size={14} className="mr-1.5" /> Duplicate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => deletePopup(active.id)}
                >
                  <Trash2 size={14} className="mr-1.5" /> Delete
                </Button>
                <Button size="sm" onClick={saveActive} disabled={saving}>
                  <Save size={14} className="mr-1.5" /> {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>

            <Tabs defaultValue="content">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="style">Style</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="targeting">Targeting</TabsTrigger>
              </TabsList>

              {/* CONTENT */}
              <TabsContent value="content" className="space-y-4 pt-4">
                <div>
                  <Label>Title (শিরোনাম)</Label>
                  <Input
                    value={active.title}
                    onChange={(e) => updateActive({ title: e.target.value })}
                    placeholder="স্বাগতম! 🎉"
                  />
                </div>
                <div>
                  <Label>Subtitle / Description</Label>
                  <Textarea
                    rows={3}
                    value={active.subtitle}
                    onChange={(e) => updateActive({ subtitle: e.target.value })}
                    placeholder="ছোট একটি description লিখুন…"
                  />
                </div>

                <div>
                  <Label>Image (Upload অথবা URL)</Label>
                  <div className="space-y-3 mt-1.5">
                    {active.image_url && (
                      <div className="relative w-full max-w-sm aspect-[16/9] rounded-lg overflow-hidden border">
                        <img src={active.image_url} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => updateActive({ image_url: "" })}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                          type="button"
                        >
                          <XIcon size={14} />
                        </button>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-2 px-3 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:opacity-90 transition">
                        <Upload size={14} />
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (f) await uploadImage(f);
                            e.target.value = "";
                          }}
                        />
                      </label>
                      <Input
                        placeholder="অথবা URL: https://…"
                        value={active.image_url}
                        onChange={(e) => updateActive({ image_url: e.target.value })}
                        className="flex-1 min-w-[200px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Button Label (CTA)</Label>
                    <Input
                      value={active.cta_label}
                      onChange={(e) => updateActive({ cta_label: e.target.value })}
                      placeholder="এখনই দেখুন"
                    />
                  </div>
                  <div>
                    <Label>Button Link</Label>
                    <Input
                      value={active.cta_link}
                      onChange={(e) => updateActive({ cta_link: e.target.value })}
                      placeholder="/services বা https://…"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* STYLE */}
              <TabsContent value="style" className="space-y-4 pt-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <ColorField
                    label="Background Color"
                    value={active.bg_color}
                    onChange={(v) => updateActive({ bg_color: v })}
                  />
                  <ColorField
                    label="Text Color"
                    value={active.text_color}
                    onChange={(v) => updateActive({ text_color: v })}
                  />
                  <ColorField
                    label="Button Background"
                    value={active.button_bg_color}
                    onChange={(v) => updateActive({ button_bg_color: v })}
                  />
                  <ColorField
                    label="Button Text"
                    value={active.button_text_color}
                    onChange={(v) => updateActive({ button_text_color: v })}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Border Radius ({active.border_radius}px)</Label>
                    <Input
                      type="range"
                      min={0}
                      max={48}
                      value={active.border_radius}
                      onChange={(e) => updateActive({ border_radius: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Overlay Opacity ({Math.round((active.overlay_opacity ?? 0.7) * 100)}%)</Label>
                    <Input
                      type="range"
                      min={0}
                      max={100}
                      value={(active.overlay_opacity ?? 0.7) * 100}
                      onChange={(e) =>
                        updateActive({ overlay_opacity: Number(e.target.value) / 100 })
                      }
                    />
                  </div>
                </div>
              </TabsContent>

              {/* SCHEDULE */}
              <TabsContent value="schedule" className="space-y-4 pt-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Start Date (optional)</Label>
                    <Input
                      type="datetime-local"
                      value={active.starts_at ? active.starts_at.slice(0, 16) : ""}
                      onChange={(e) =>
                        updateActive({ starts_at: e.target.value ? new Date(e.target.value).toISOString() : null })
                      }
                    />
                  </div>
                  <div>
                    <Label>End Date (optional)</Label>
                    <Input
                      type="datetime-local"
                      value={active.ends_at ? active.ends_at.slice(0, 16) : ""}
                      onChange={(e) =>
                        updateActive({ ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })
                      }
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <Label>Delay (seconds)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={active.delay_seconds}
                      onChange={(e) => updateActive({ delay_seconds: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Priority (higher = first)</Label>
                    <Input
                      type="number"
                      value={active.priority}
                      onChange={(e) => updateActive({ priority: Number(e.target.value) })}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Switch
                      checked={active.show_once}
                      onCheckedChange={(v) => updateActive({ show_once: v })}
                    />
                    <Label className="text-sm">Show only once per visitor</Label>
                  </div>
                </div>
              </TabsContent>

              {/* TARGETING */}
              <TabsContent value="targeting" className="space-y-4 pt-4">
                <div>
                  <Label>Where to show</Label>
                  <Select
                    value={active.targeting}
                    onValueChange={(v: any) => updateActive({ targeting: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সব pages (All pages)</SelectItem>
                      <SelectItem value="home">শুধু Homepage</SelectItem>
                      <SelectItem value="specific">নির্দিষ্ট pages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {active.targeting === "specific" && (
                  <div>
                    <Label>Target Paths (এক লাইনে একটি)</Label>
                    <Textarea
                      rows={5}
                      placeholder={"/services\n/blog\n/product/*"}
                      value={(active.target_paths || []).join("\n")}
                      onChange={(e) =>
                        updateActive({
                          target_paths: e.target.value
                            .split("\n")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Wildcard সাপোর্টেড: <code>/product/*</code> = সব product pages-এ দেখাবে
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && active && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: `rgba(0,0,0,${active.overlay_opacity})` }}
            onClick={() => setShowPreview(false)}
          />
          <div
            className="relative w-full max-w-md overflow-hidden shadow-2xl"
            style={{
              background: active.bg_color,
              color: active.text_color,
              borderRadius: active.border_radius,
            }}
          >
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-black/45 text-white"
            >
              <XIcon size={18} />
            </button>
            {active.image_url && (
              <div className="w-full aspect-[16/9] overflow-hidden">
                <img src={active.image_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6 text-center">
              {active.title && <h2 className="text-2xl font-bold mb-2">{active.title}</h2>}
              {active.subtitle && <p className="text-sm opacity-85 mb-5">{active.subtitle}</p>}
              {active.cta_label && (
                <a
                  href={active.cta_link || "#"}
                  target={active.cta_link?.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-7 py-3 rounded-xl font-semibold text-sm"
                  style={{
                    background: active.button_bg_color,
                    color: active.button_text_color,
                    boxShadow: `0 8px 24px ${active.button_bg_color}55`,
                  }}
                >
                  {active.cta_label} <ExternalLink size={14} className="ml-2" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2 mt-1.5">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 rounded border cursor-pointer flex-shrink-0"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 font-mono text-sm"
        />
      </div>
    </div>
  );
}
