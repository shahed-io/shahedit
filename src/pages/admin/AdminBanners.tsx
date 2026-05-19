import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Trash2, Save, GripVertical, Eye, EyeOff, Copy } from "lucide-react";

type Stat = { value: string; label: string };
type SlideCard = {
  title: string; subtitle?: string; badge_text?: string; badge_color?: string;
  price?: string; original_price?: string; link?: string; accent?: string; icon?: string;
};
type Slide = {
  id: string;
  sort_order: number;
  is_active: boolean;
  badge_text: string | null;
  headline: string;
  highlight: string | null;
  description: string | null;
  primary_cta_label: string | null;
  primary_cta_link: string | null;
  secondary_cta_label: string | null;
  secondary_cta_link: string | null;
  show_countdown: boolean;
  countdown_label: string | null;
  countdown_end_at: string | null;
  stats: Stat[];
  cards: SlideCard[];
  background_image_url: string | null;
  autoplay_seconds: number;
};

const EMPTY: Omit<Slide, "id"> = {
  sort_order: 0, is_active: true, badge_text: "", headline: "New Slide", highlight: "",
  description: "", primary_cta_label: "", primary_cta_link: "/", secondary_cta_label: "", secondary_cta_link: "/",
  show_countdown: false, countdown_label: "Special Offer Ends In", countdown_end_at: null,
  stats: [], cards: [], background_image_url: "", autoplay_seconds: 7,
};

const BADGE_COLORS = ["blue", "amber", "purple", "pink", "emerald", "rose"];
const ICON_OPTIONS = ["Code2", "Globe", "Smartphone", "Zap", "Sparkles", "Star", "Crown", "Rocket", "Palette", "Megaphone", "Cloud", "Shield", "Briefcase", "Heart"];

export default function AdminBanners() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("hero_slides").select("*").order("sort_order", { ascending: true });
    if (error) { toast.error(error.message); setLoading(false); return; }
    const rows = (data || []).map((r: any) => ({
      ...r,
      stats: Array.isArray(r.stats) ? r.stats : [],
      cards: Array.isArray(r.cards) ? r.cards : [],
    })) as Slide[];
    setSlides(rows);
    if (rows.length > 0 && !activeId) setActiveId(rows[0].id);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const active = slides.find((s) => s.id === activeId);

  const updateActive = (patch: Partial<Slide>) => {
    if (!active) return;
    setSlides((all) => all.map((s) => (s.id === active.id ? { ...s, ...patch } : s)));
  };

  const saveActive = async () => {
    if (!active) return;
    setSaving(true);
    const { id, ...rest } = active;
    const payload = {
      ...rest,
      countdown_end_at: rest.countdown_end_at || null,
      autoplay_seconds: Number(rest.autoplay_seconds) || 7,
      sort_order: Number(rest.sort_order) || 0,
    };
    const { error } = await supabase.from("hero_slides").update(payload).eq("id", id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Saved");
  };

  const createSlide = async () => {
    const { data, error } = await supabase
      .from("hero_slides")
      .insert([{ ...EMPTY, sort_order: slides.length } as any])
      .select().single();
    if (error) { toast.error(error.message); return; }
    await load();
    setActiveId(data.id);
    toast.success("Slide created");
  };

  const duplicateSlide = async () => {
    if (!active) return;
    const { id, ...rest } = active;
    const { data, error } = await supabase
      .from("hero_slides")
      .insert([{ ...rest, headline: `${rest.headline} (copy)`, sort_order: slides.length } as any])
      .select().single();
    if (error) { toast.error(error.message); return; }
    await load();
    setActiveId(data.id);
    toast.success("Slide duplicated");
  };

  const deleteSlide = async (id: string) => {
    if (!confirm("Delete this slide?")) return;
    const { error } = await supabase.from("hero_slides").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    await load();
    if (activeId === id) setActiveId(null);
    toast.success("Deleted");
  };

  const move = async (id: string, dir: -1 | 1) => {
    const idx = slides.findIndex((s) => s.id === id);
    const swap = idx + dir;
    if (swap < 0 || swap >= slides.length) return;
    const a = slides[idx], b = slides[swap];
    await supabase.from("hero_slides").update({ sort_order: b.sort_order }).eq("id", a.id);
    await supabase.from("hero_slides").update({ sort_order: a.sort_order }).eq("id", b.id);
    load();
  };

  // helpers for nested arrays
  const updateStat = (i: number, patch: Partial<Stat>) => {
    if (!active) return;
    const next = active.stats.map((s, k) => (k === i ? { ...s, ...patch } : s));
    updateActive({ stats: next });
  };
  const addStat = () => active && updateActive({ stats: [...active.stats, { value: "", label: "" }] });
  const removeStat = (i: number) => active && updateActive({ stats: active.stats.filter((_, k) => k !== i) });

  const updateCard = (i: number, patch: Partial<SlideCard>) => {
    if (!active) return;
    updateActive({ cards: active.cards.map((c, k) => (k === i ? { ...c, ...patch } : c)) });
  };
  const addCard = () => active && updateActive({
    cards: [...active.cards, { title: "New Card", icon: "Sparkles", accent: "hsl(270,92%,65%)", badge_color: "purple", link: "/" }],
  });
  const removeCard = (i: number) => active && updateActive({ cards: active.cards.filter((_, k) => k !== i) });

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Hero Banner Slider</h1>
          <p className="text-sm text-slate-400 mt-1">হোমপেজ ব্যানার slide গুলো এখান থেকে customize করুন।</p>
        </div>
        <Button onClick={createSlide} className="bg-gradient-to-r from-purple-600 to-pink-600">
          <Plus size={16} className="mr-1.5" /> New Slide
        </Button>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Slide list */}
        <Card className="p-3 bg-white/[0.03] border-white/10 h-fit">
          {loading && <div className="text-sm text-slate-400 p-3">Loading…</div>}
          {!loading && slides.length === 0 && <div className="text-sm text-slate-400 p-3">No slides yet.</div>}
          <div className="space-y-1.5">
            {slides.map((s, i) => (
              <div
                key={s.id}
                className={`group flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors ${
                  activeId === s.id ? "bg-purple-500/15 border border-purple-500/30" : "hover:bg-white/5 border border-transparent"
                }`}
                onClick={() => setActiveId(s.id)}
              >
                <div className="flex flex-col">
                  <button onClick={(e) => { e.stopPropagation(); move(s.id, -1); }} disabled={i === 0} className="text-slate-500 hover:text-white disabled:opacity-20 text-xs leading-none">▲</button>
                  <button onClick={(e) => { e.stopPropagation(); move(s.id, 1); }} disabled={i === slides.length - 1} className="text-slate-500 hover:text-white disabled:opacity-20 text-xs leading-none">▼</button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{s.headline || "(untitled)"} </div>
                  <div className="text-[10px] text-slate-400 truncate">{s.highlight || "—"}</div>
                </div>
                {s.is_active ? <Eye size={14} className="text-emerald-400" /> : <EyeOff size={14} className="text-slate-500" />}
                <button onClick={(e) => { e.stopPropagation(); deleteSlide(s.id); }} className="text-rose-400/70 hover:text-rose-400 opacity-0 group-hover:opacity-100">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Editor */}
        {active ? (
          <Card className="p-5 md:p-6 bg-white/[0.03] border-white/10 space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Switch checked={active.is_active} onCheckedChange={(v) => updateActive({ is_active: v })} />
                <span className="text-sm text-white/80">{active.is_active ? "Active (publicly visible)" : "Hidden"}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={duplicateSlide}><Copy size={14} className="mr-1.5" /> Duplicate</Button>
                <Button onClick={saveActive} disabled={saving} className="bg-emerald-600 hover:bg-emerald-500">
                  <Save size={14} className="mr-1.5" /> {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>

            <Tabs defaultValue="content">
              <TabsList className="bg-white/5 border border-white/10">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="cta">CTAs & Countdown</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
                <TabsTrigger value="cards">Side Cards</TabsTrigger>
                <TabsTrigger value="bg">Background & Settings</TabsTrigger>
              </TabsList>

              {/* CONTENT */}
              <TabsContent value="content" className="space-y-4 pt-5">
                <Field label="Badge Text (top pill)">
                  <Input value={active.badge_text || ""} onChange={(e) => updateActive({ badge_text: e.target.value })} />
                </Field>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Headline (line 1)"><Input value={active.headline || ""} onChange={(e) => updateActive({ headline: e.target.value })} /></Field>
                  <Field label="Highlight (gradient line 2)"><Input value={active.highlight || ""} onChange={(e) => updateActive({ highlight: e.target.value })} /></Field>
                </div>
                <Field label="Description">
                  <Textarea rows={3} value={active.description || ""} onChange={(e) => updateActive({ description: e.target.value })} />
                </Field>
              </TabsContent>

              {/* CTAs */}
              <TabsContent value="cta" className="space-y-4 pt-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Primary CTA Label"><Input value={active.primary_cta_label || ""} onChange={(e) => updateActive({ primary_cta_label: e.target.value })} /></Field>
                  <Field label="Primary CTA Link"><Input value={active.primary_cta_link || ""} onChange={(e) => updateActive({ primary_cta_link: e.target.value })} /></Field>
                  <Field label="Secondary CTA Label"><Input value={active.secondary_cta_label || ""} onChange={(e) => updateActive({ secondary_cta_label: e.target.value })} /></Field>
                  <Field label="Secondary CTA Link"><Input value={active.secondary_cta_link || ""} onChange={(e) => updateActive({ secondary_cta_link: e.target.value })} /></Field>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <Switch checked={active.show_countdown} onCheckedChange={(v) => updateActive({ show_countdown: v })} />
                    <span className="text-sm text-white/80">Show countdown timer card</span>
                  </div>
                  {active.show_countdown && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <Field label="Countdown Label"><Input value={active.countdown_label || ""} onChange={(e) => updateActive({ countdown_label: e.target.value })} /></Field>
                      <Field label="Ends At">
                        <Input
                          type="datetime-local"
                          value={active.countdown_end_at ? new Date(active.countdown_end_at).toISOString().slice(0, 16) : ""}
                          onChange={(e) => updateActive({ countdown_end_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                        />
                      </Field>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* STATS */}
              <TabsContent value="stats" className="space-y-3 pt-5">
                {active.stats.map((s, i) => (
                  <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-center">
                    <Input placeholder="150+" value={s.value} onChange={(e) => updateStat(i, { value: e.target.value })} />
                    <Input placeholder="Projects Completed" value={s.label} onChange={(e) => updateStat(i, { label: e.target.value })} />
                    <Button variant="ghost" size="sm" onClick={() => removeStat(i)} className="text-rose-400"><Trash2 size={14} /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addStat}><Plus size={14} className="mr-1" /> Add Stat</Button>
              </TabsContent>

              {/* CARDS */}
              <TabsContent value="cards" className="space-y-4 pt-5">
                {active.cards.map((c, i) => (
                  <Card key={i} className="p-4 bg-white/[0.03] border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-slate-400">Card #{i + 1}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeCard(i)} className="text-rose-400"><Trash2 size={14} /></Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <Field label="Title"><Input value={c.title || ""} onChange={(e) => updateCard(i, { title: e.target.value })} /></Field>
                      <Field label="Subtitle"><Input value={c.subtitle || ""} onChange={(e) => updateCard(i, { subtitle: e.target.value })} /></Field>
                      <Field label="Price"><Input placeholder="৳৫,০০০" value={c.price || ""} onChange={(e) => updateCard(i, { price: e.target.value })} /></Field>
                      <Field label="Original Price"><Input placeholder="৳১০,০০০" value={c.original_price || ""} onChange={(e) => updateCard(i, { original_price: e.target.value })} /></Field>
                      <Field label="Badge Text"><Input value={c.badge_text || ""} onChange={(e) => updateCard(i, { badge_text: e.target.value })} /></Field>
                      <Field label="Badge Color">
                        <select className="w-full h-10 rounded-md bg-background border border-white/10 px-3 text-sm text-white" value={c.badge_color || "purple"} onChange={(e) => updateCard(i, { badge_color: e.target.value })}>
                          {BADGE_COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </Field>
                      <Field label="Link"><Input value={c.link || ""} onChange={(e) => updateCard(i, { link: e.target.value })} /></Field>
                      <Field label="Accent Color (HSL)"><Input placeholder="hsl(270,92%,65%)" value={c.accent || ""} onChange={(e) => updateCard(i, { accent: e.target.value })} /></Field>
                      <Field label="Icon">
                        <select className="w-full h-10 rounded-md bg-background border border-white/10 px-3 text-sm text-white" value={c.icon || "Sparkles"} onChange={(e) => updateCard(i, { icon: e.target.value })}>
                          {ICON_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </Field>
                    </div>
                  </Card>
                ))}
                <Button variant="outline" size="sm" onClick={addCard}><Plus size={14} className="mr-1" /> Add Card</Button>
              </TabsContent>

              {/* BG / SETTINGS */}
              <TabsContent value="bg" className="space-y-4 pt-5">
                <Field label="Background Image URL (optional, overlay applied)">
                  <Input placeholder="https://..." value={active.background_image_url || ""} onChange={(e) => updateActive({ background_image_url: e.target.value })} />
                </Field>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Autoplay Duration (seconds)">
                    <Input type="number" min={3} value={active.autoplay_seconds} onChange={(e) => updateActive({ autoplay_seconds: Number(e.target.value) || 7 })} />
                  </Field>
                  <Field label="Sort Order">
                    <Input type="number" value={active.sort_order} onChange={(e) => updateActive({ sort_order: Number(e.target.value) || 0 })} />
                  </Field>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        ) : (
          <Card className="p-12 bg-white/[0.03] border-white/10 text-center text-slate-400">
            একটি slide select করুন অথবা নতুন slide তৈরি করুন।
          </Card>
        )}
      </div>
    </div>
  );
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-slate-400">{label}</Label>
    {children}
  </div>
);
