import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowUp, ArrowDown, Plus, Save, Trash2, ExternalLink, Layout,
  Image as ImageIcon, MessageSquare, HelpCircle, Phone, Info, FileText, Menu as MenuIcon,
} from "lucide-react";

/* ============================================================
   HOMEPAGE / PAGE SECTIONS EDITOR (page_sections)
   ============================================================ */
type Section = {
  id: string;
  section_key: string;
  label: string;
  content: any;
  is_published: boolean;
  updated_at: string;
};

const HOMEPAGE_KEYS = [
  { key: "home_hero", label: "Hero" },
  { key: "home_services", label: "Services" },
  { key: "home_packages", label: "Packages" },
  { key: "home_portfolio", label: "Portfolio" },
  { key: "home_testimonials", label: "Testimonials" },
  { key: "home_cta", label: "Call To Action" },
];

function SectionsTab({ pageFilter, defaults }: { pageFilter: string; defaults: { key: string; label: string }[] }) {
  const [rows, setRows] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("page_sections")
      .select("*")
      .like("section_key", `${pageFilter}%`)
      .order("section_key");
    if (error) toast.error(error.message);
    setRows((data as Section[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [pageFilter]);

  const ensureDefaults = async () => {
    const existing = new Set(rows.map(r => r.section_key));
    const missing = defaults.filter(d => !existing.has(d.key));
    if (missing.length === 0) { toast.info("All default sections exist"); return; }
    const { error } = await supabase.from("page_sections").insert(
      missing.map((d, i) => ({
        section_key: d.key,
        label: d.label,
        content: { title: d.label, subtitle: "", body: "", image_url: "", cta_text: "", cta_link: "", order: i },
        is_published: true,
      }))
    );
    if (error) return toast.error(error.message);
    toast.success(`${missing.length}টি সেকশন তৈরি হয়েছে`);
    load();
  };

  const save = async (row: Section) => {
    const { error } = await supabase
      .from("page_sections")
      .update({ label: row.label, content: row.content, is_published: row.is_published, updated_at: new Date().toISOString() })
      .eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success("Saved");
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this section?")) return;
    const { error } = await supabase.from("page_sections").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const addCustom = async () => {
    const key = prompt(`Section key (must start with "${pageFilter}")`, `${pageFilter}custom_${Date.now()}`);
    if (!key) return;
    const { error } = await supabase.from("page_sections").insert({
      section_key: key,
      label: "New Section",
      content: { title: "", subtitle: "", body: "", image_url: "", cta_text: "", cta_link: "" },
      is_published: false,
    });
    if (error) return toast.error(error.message);
    load();
  };

  const updateRow = (id: string, patch: Partial<Section>) =>
    setRows(rs => rs.map(r => (r.id === id ? { ...r, ...patch } : r)));

  const updateContent = (id: string, patch: Record<string, any>) =>
    setRows(rs => rs.map(r => (r.id === id ? { ...r, content: { ...(r.content ?? {}), ...patch } } : r)));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={ensureDefaults}>
          <Plus className="h-4 w-4 mr-1" />Add default sections
        </Button>
        <Button size="sm" variant="outline" onClick={addCustom}>
          <Plus className="h-4 w-4 mr-1" />Add custom section
        </Button>
        <Button size="sm" variant="ghost" onClick={load}>Refresh</Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && rows.length === 0 && (
        <Card><CardContent className="py-8 text-center text-muted-foreground">
          কোন সেকশন নেই। উপরের “Add default sections” বাটনে ক্লিক করুন।
        </CardContent></Card>
      )}

      <div className="grid gap-4">
        {rows.map((r) => {
          const c = r.content ?? {};
          return (
            <Card key={r.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">{r.section_key}</Badge>
                    <Input
                      value={r.label}
                      onChange={(e) => updateRow(r.id, { label: e.target.value })}
                      className="h-8 w-56"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <Switch
                        checked={r.is_published}
                        onCheckedChange={(v) => updateRow(r.id, { is_published: v })}
                      />
                      Published
                    </label>
                    <Button size="sm" onClick={() => save(r)}><Save className="h-4 w-4 mr-1" />Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label>Title</Label>
                  <Input value={c.title ?? ""} onChange={(e) => updateContent(r.id, { title: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Subtitle</Label>
                  <Input value={c.subtitle ?? ""} onChange={(e) => updateContent(r.id, { subtitle: e.target.value })} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label>Body / HTML</Label>
                  <Textarea
                    rows={4}
                    value={c.body ?? ""}
                    onChange={(e) => updateContent(r.id, { body: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Image URL</Label>
                  <Input value={c.image_url ?? ""} onChange={(e) => updateContent(r.id, { image_url: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>CTA Text</Label>
                  <Input value={c.cta_text ?? ""} onChange={(e) => updateContent(r.id, { cta_text: e.target.value })} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label>CTA Link</Label>
                  <Input value={c.cta_link ?? ""} onChange={(e) => updateContent(r.id, { cta_link: e.target.value })} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   MENU BUILDER (cms_menus + menu_items)
   ============================================================ */
type CmsMenu = { id: string; name: string; location: string };
type MenuItem = { id: string; menu_id: string; label: string; item_type: string; target: string | null; sort_order: number; parent_id: string | null };

function MenuBuilderTab() {
  const [menus, setMenus] = useState<CmsMenu[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [items, setItems] = useState<MenuItem[]>([]);
  const selected = useMemo(() => menus.find(m => m.id === selectedId), [menus, selectedId]);

  const loadMenus = async () => {
    const { data, error } = await supabase.from("cms_menus").select("*").order("name");
    if (error) return toast.error(error.message);
    setMenus((data as CmsMenu[]) ?? []);
    if (data && data.length && !selectedId) setSelectedId(data[0].id);
  };
  const loadItems = async (menuId: string) => {
    const { data, error } = await supabase
      .from("menu_items").select("*").eq("menu_id", menuId).order("sort_order");
    if (error) return toast.error(error.message);
    setItems((data as MenuItem[]) ?? []);
  };
  useEffect(() => { loadMenus(); }, []);
  useEffect(() => { if (selectedId) loadItems(selectedId); }, [selectedId]);

  const createMenu = async () => {
    const name = prompt("Menu name (e.g. Header, Footer)");
    if (!name) return;
    const location = prompt("Location key (e.g. header, footer, sidebar)", "header") || "header";
    const { error } = await supabase.from("cms_menus").insert({ name, location });
    if (error) return toast.error(error.message);
    loadMenus();
  };
  const deleteMenu = async () => {
    if (!selected || !confirm(`Delete menu "${selected.name}"?`)) return;
    const { error } = await supabase.from("cms_menus").delete().eq("id", selected.id);
    if (error) return toast.error(error.message);
    setSelectedId("");
    loadMenus();
  };
  const addItem = async () => {
    if (!selectedId) return toast.error("Select a menu first");
    const sort = (items[items.length - 1]?.sort_order ?? 0) + 10;
    const { error } = await supabase.from("menu_items").insert({
      menu_id: selectedId, label: "New Link", item_type: "url", target: "/", sort_order: sort,
    });
    if (error) return toast.error(error.message);
    loadItems(selectedId);
  };
  const updateItem = (id: string, patch: Partial<MenuItem>) =>
    setItems(arr => arr.map(i => (i.id === id ? { ...i, ...patch } : i)));
  const saveItem = async (it: MenuItem) => {
    const { error } = await supabase.from("menu_items")
      .update({ label: it.label, item_type: it.item_type, target: it.target, sort_order: it.sort_order })
      .eq("id", it.id);
    if (error) return toast.error(error.message);
    toast.success("Saved");
  };
  const removeItem = async (id: string) => {
    if (!confirm("Delete this menu item?")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) return toast.error(error.message);
    loadItems(selectedId);
  };
  const move = async (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= items.length) return;
    const a = items[idx], b = items[j];
    await supabase.from("menu_items").update({ sort_order: b.sort_order }).eq("id", a.id);
    await supabase.from("menu_items").update({ sort_order: a.sort_order }).eq("id", b.id);
    loadItems(selectedId);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-64"><SelectValue placeholder="Select menu" /></SelectTrigger>
          <SelectContent>
            {menus.map(m => (
              <SelectItem key={m.id} value={m.id}>{m.name} · {m.location}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" onClick={createMenu}><Plus className="h-4 w-4 mr-1" />New menu</Button>
        {selected && (
          <Button size="sm" variant="ghost" onClick={deleteMenu}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
        <div className="flex-1" />
        <Button size="sm" onClick={addItem} disabled={!selectedId}>
          <Plus className="h-4 w-4 mr-1" />Add item
        </Button>
      </div>

      {selectedId && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {items.length === 0 && (
                <div className="p-6 text-center text-muted-foreground text-sm">কোন আইটেম নেই।</div>
              )}
              {items.map((it, idx) => (
                <div key={it.id} className="grid grid-cols-1 md:grid-cols-[auto,1fr,140px,1fr,auto] gap-2 items-center p-3">
                  <div className="flex md:flex-col gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => move(idx, -1)}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => move(idx, 1)}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input value={it.label} onChange={e => updateItem(it.id, { label: e.target.value })} placeholder="Label" />
                  <Select value={it.item_type} onValueChange={(v) => updateItem(it.id, { item_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="url">URL</SelectItem>
                      <SelectItem value="page">Page</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="external">External</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input value={it.target ?? ""} onChange={e => updateItem(it.id, { target: e.target.value })} placeholder="/path or https://…" />
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => saveItem(it)}>Save</Button>
                    <Button size="icon" variant="ghost" onClick={() => removeItem(it.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ============================================================
   QUICK LINK CARDS for existing modules
   ============================================================ */
function QuickLinks() {
  const items = [
    { to: "/ceo/banners", icon: ImageIcon, title: "Banner & Slider", desc: "Hero ব্যানার স্লাইডার পরিচালনা" },
    { to: "/ceo/welcome-popups", icon: MessageSquare, title: "Welcome Popup", desc: "ভিজিটর পপ-আপ ব্যবস্থাপনা" },
    { to: "/ceo/faq", icon: HelpCircle, title: "FAQ Manager", desc: "প্রশ্নোত্তর পরিচালনা" },
    { to: "/ceo/footer", icon: FileText, title: "Footer Editor", desc: "ফুটার কাস্টমাইজ" },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(i => (
        <Link key={i.to} to={i.to}>
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                <i.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1 font-medium">
                  {i.title} <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="text-xs text-muted-foreground">{i.desc}</div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

/* ============================================================
   PAGE
   ============================================================ */
export default function AdminWebsiteCms() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Layout className="h-6 w-6 text-primary" /> Website CMS
        </h1>
        <p className="text-sm text-muted-foreground">
          Homepage builder, Banner/Slider, Popup, FAQ, Contact, About, Footer ও Menu Builder এক জায়গায়।
        </p>
      </div>

      <QuickLinks />

      <Tabs defaultValue="homepage">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="homepage"><Layout className="h-4 w-4 mr-1" />Homepage Builder</TabsTrigger>
          <TabsTrigger value="contact"><Phone className="h-4 w-4 mr-1" />Contact Page</TabsTrigger>
          <TabsTrigger value="about"><Info className="h-4 w-4 mr-1" />About Page</TabsTrigger>
          <TabsTrigger value="menus"><MenuIcon className="h-4 w-4 mr-1" />Menu Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="homepage" className="mt-4">
          <SectionsTab pageFilter="home_" defaults={HOMEPAGE_KEYS} />
        </TabsContent>
        <TabsContent value="contact" className="mt-4">
          <SectionsTab pageFilter="contact_" defaults={[
            { key: "contact_hero", label: "Contact Hero" },
            { key: "contact_info", label: "Contact Info" },
            { key: "contact_form", label: "Contact Form" },
            { key: "contact_map", label: "Map / Location" },
          ]} />
        </TabsContent>
        <TabsContent value="about" className="mt-4">
          <SectionsTab pageFilter="about_" defaults={[
            { key: "about_hero", label: "About Hero" },
            { key: "about_story", label: "Our Story" },
            { key: "about_mission", label: "Mission & Vision" },
            { key: "about_team", label: "Team Highlight" },
            { key: "about_cta", label: "About CTA" },
          ]} />
        </TabsContent>
        <TabsContent value="menus" className="mt-4">
          <MenuBuilderTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
