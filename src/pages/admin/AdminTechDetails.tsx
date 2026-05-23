import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus, Save, Trash2, Pencil, Loader2, Code2, Eye, EyeOff, X,
} from "lucide-react";
import { fetchAllTechs, fallbackRows, type TechRow } from "@/lib/tech-details-api";

const CATEGORIES = ["Frontend", "Backend", "Database", "CMS", "Design", "Mobile", "Language"];

type FormState = Omit<TechRow, "id"> & { id?: string };

const empty: FormState = {
  slug: "", name: "", category: "Frontend", tagline: "",
  color: "#a78bfa", symbol: "•",
  what_is_it: "", history: "",
  pros: [], cons: [], best_for: [],
  sort_order: 0, is_published: true,
};

export default function AdminTechDetails() {
  const [items, setItems] = useState<TechRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const rows = await fetchAllTechs();
    setItems(rows);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const seedFromStatic = async () => {
    setSaving(true);
    const payload = fallbackRows.map(({ id, ...rest }) => rest);
    const { error } = await supabase.from("tech_details" as any).upsert(payload, { onConflict: "slug" });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Default technologies seeded");
    load();
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.slug || !editing.name) { toast.error("Slug ও Name দরকার"); return; }
    setSaving(true);
    const { id, ...row } = editing;
    const op = id
      ? supabase.from("tech_details" as any).update(row).eq("id", id)
      : supabase.from("tech_details" as any).insert(row);
    const { error } = await op;
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(id ? "Updated" : "Created");
    setEditing(null);
    load();
  };

  const remove = async (row: TechRow) => {
    if (row.id.startsWith("static-")) { toast.error("Default item — first 'Seed' to make editable"); return; }
    if (!confirm(`Delete "${row.name}"?`)) return;
    const { error } = await supabase.from("tech_details" as any).delete().eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    load();
  };

  const togglePublished = async (row: TechRow) => {
    if (row.id.startsWith("static-")) { toast.error("Default item — first 'Seed' to make editable"); return; }
    const { error } = await supabase.from("tech_details" as any)
      .update({ is_published: !row.is_published }).eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    load();
  };

  const isDbBacked = items.length > 0 && !items[0].id.startsWith("static-");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Code2 className="text-primary" /> Tech Stack Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Home page এর Tech Stack ও /tech/:slug page এর সব content edit করুন।</p>
        </div>
        <div className="flex gap-2">
          {!isDbBacked && (
            <Button variant="outline" onClick={seedFromStatic} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Seed defaults"}
            </Button>
          )}
          <Button onClick={() => setEditing({ ...empty, sort_order: items.length })}>
            <Plus className="w-4 h-4 mr-1" /> Add Technology
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((row) => (
            <Card key={row.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0"
                    style={{ background: `${row.color}20`, color: row.color, border: `1px solid ${row.color}40` }}>
                    {row.symbol}
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base truncate">{row.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px]">{row.category}</Badge>
                      <span className="text-[10px] text-muted-foreground">/{row.slug}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground line-clamp-2">{row.tagline}</p>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Switch checked={row.is_published} onCheckedChange={() => togglePublished(row)} />
                    <span className="text-xs">{row.is_published ? <Eye className="w-3.5 h-3.5 inline" /> : <EyeOff className="w-3.5 h-3.5 inline" />}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(row)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(row)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                  </div>
                </div>
                {row.id.startsWith("static-") && (
                  <p className="text-[10px] text-amber-500">Static fallback — "Seed defaults" চেপে editable করুন।</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start md:items-center justify-center p-2 md:p-6 overflow-y-auto" onClick={() => setEditing(null)}>
          <div className="bg-card border rounded-2xl w-full max-w-3xl my-4 max-h-[95vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-card border-b px-5 py-3 flex items-center justify-between z-10">
              <h2 className="font-bold">{editing.id ? "Edit" : "New"} Technology</h2>
              <Button size="sm" variant="ghost" onClick={() => setEditing(null)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <Field label="Name *"><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
                <Field label="Slug * (URL)"><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} placeholder="e.g. react" /></Field>
                <Field label="Category">
                  <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Sort Order"><Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></Field>
                <Field label="Color (hex)">
                  <div className="flex gap-2">
                    <Input type="color" value={editing.color} onChange={(e) => setEditing({ ...editing, color: e.target.value })} className="w-14 h-10 p-1" />
                    <Input value={editing.color} onChange={(e) => setEditing({ ...editing, color: e.target.value })} />
                  </div>
                </Field>
                <Field label="Symbol / Icon char"><Input value={editing.symbol} onChange={(e) => setEditing({ ...editing, symbol: e.target.value })} /></Field>
              </div>
              <Field label="Tagline (short one-liner)"><Input value={editing.tagline} onChange={(e) => setEditing({ ...editing, tagline: e.target.value })} /></Field>
              <Field label="What is it? (এটা কী?)"><Textarea rows={4} value={editing.what_is_it} onChange={(e) => setEditing({ ...editing, what_is_it: e.target.value })} /></Field>
              <Field label="History (ইতিহাস ও উৎপত্তি)"><Textarea rows={4} value={editing.history} onChange={(e) => setEditing({ ...editing, history: e.target.value })} /></Field>
              <ListField label="Pros (সুবিধা)" items={editing.pros} onChange={(pros) => setEditing({ ...editing, pros })} />
              <ListField label="Cons (অসুবিধা)" items={editing.cons} onChange={(cons) => setEditing({ ...editing, cons })} />
              <ListField label="Best For (কোন কাজে আদর্শ)" items={editing.best_for} onChange={(best_for) => setEditing({ ...editing, best_for })} />
              <div className="flex items-center gap-2 pt-2 border-t">
                <Switch checked={editing.is_published} onCheckedChange={(v) => setEditing({ ...editing, is_published: v })} />
                <Label>Published</Label>
              </div>
            </div>
            <div className="sticky bottom-0 bg-card border-t px-5 py-3 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5"><Label className="text-xs font-semibold">{label}</Label>{children}</div>
);

const ListField = ({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) => (
  <div className="space-y-2">
    <Label className="text-xs font-semibold">{label}</Label>
    {items.map((it, i) => (
      <div key={i} className="flex gap-2">
        <Textarea rows={2} value={it} onChange={(e) => { const next = [...items]; next[i] = e.target.value; onChange(next); }} />
        <Button size="sm" variant="ghost" onClick={() => onChange(items.filter((_, idx) => idx !== i))}><Trash2 className="w-4 h-4 text-destructive" /></Button>
      </div>
    ))}
    <Button size="sm" variant="outline" onClick={() => onChange([...items, ""])}><Plus className="w-3.5 h-3.5 mr-1" /> Add item</Button>
  </div>
);
