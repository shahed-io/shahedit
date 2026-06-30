import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Copy, Trophy, Sparkles, Eye, Users, Gift, Download, Wand2 } from "lucide-react";

type Field = { key: string; label: string; type: "text" | "email" | "tel" | "textarea" | "select"; required?: boolean; options?: string[]; placeholder?: string };
type Campaign = any;

const emptyForm = {
  title: "", slug: "", description: "", banner_url: "", prize_description: "",
  google_form_url: "", use_google_form: false,
  winners_count: 1, winner_prizes: [] as string[],
  status: "draft", starts_at: "", ends_at: "",
  max_entries: "", require_login: false,
  thank_you_message: "", redirect_url: "",
  meta_title: "", meta_description: "",
  fields: [
    { key: "name", label: "নাম", type: "text", required: true },
    { key: "email", label: "ইমেইল", type: "email", required: true },
    { key: "phone", label: "মোবাইল", type: "tel", required: true },
  ] as Field[],
};

export default function AdminOffers() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [active, setActive] = useState<Campaign | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [tab, setTab] = useState("list");
  const [picking, setPicking] = useState(false);
  const [aiBrief, setAiBrief] = useState("");
  const [aiBusy, setAiBusy] = useState(false);

  const aiGenerate = async () => {
    if (!aiBrief.trim()) return toast.error("Offer-এর বিস্তারিত লিখুন");
    setAiBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-offer-campaign", {
        body: { brief: aiBrief },
      });
      if (error || (data as any)?.error) throw new Error((data as any)?.error || error?.message);
      setForm({ ...emptyForm, ...(data as any) });
      toast.success("AI offer তৈরি করেছে — যাচাই করে Save করুন");
    } catch (e: any) {
      toast.error(e.message || "AI generate ব্যর্থ");
    } finally {
      setAiBusy(false);
    }
  };


  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("offer_campaigns" as any).select("*").order("created_at", { ascending: false });
    setCampaigns((data as any[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const loadDetail = async (c: Campaign) => {
    setActive(c);
    setTab("entries");
    const [{ data: subs }, { data: w }] = await Promise.all([
      supabase.from("offer_submissions" as any).select("*").eq("campaign_id", c.id).order("created_at", { ascending: false }),
      supabase.from("offer_winners" as any).select("*, offer_submissions(name,email,phone)").eq("campaign_id", c.id).order("position"),
    ]);
    setSubmissions((subs as any[]) ?? []);
    setWinners((w as any[]) ?? []);
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setAiBrief(""); setOpen(true); };
  const openEdit = (c: Campaign) => {
    setEditing(c);
    setForm({
      ...emptyForm, ...c,
      winner_prizes: c.winner_prizes ?? [],
      fields: c.fields?.length ? c.fields : emptyForm.fields,
      starts_at: c.starts_at ? c.starts_at.slice(0, 16) : "",
      ends_at: c.ends_at ? c.ends_at.slice(0, 16) : "",
      max_entries: c.max_entries ?? "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) return toast.error("শিরোনাম দিন");
    const slug = (form.slug || form.title).toLowerCase().trim().replace(/[^\w\u0980-\u09FF]+/g, "-").replace(/^-+|-+$/g, "");
    const payload: any = {
      ...form, slug,
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
      max_entries: form.max_entries ? Number(form.max_entries) : null,
      winners_count: Number(form.winners_count) || 1,
    };
    let res;
    if (editing) {
      res = await supabase.from("offer_campaigns" as any).update(payload).eq("id", editing.id);
    } else {
      res = await supabase.from("offer_campaigns" as any).insert(payload);
    }
    if (res.error) return toast.error(res.error.message);
    toast.success("সংরক্ষিত!");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("নিশ্চিত? এই অফার ও সকল এন্ট্রি মুছে যাবে।")) return;
    const { error } = await supabase.from("offer_campaigns" as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("মুছে ফেলা হয়েছে");
    if (active?.id === id) setActive(null);
    load();
  };

  const pickWinners = async (mode: "smart" | "random" = "smart", extra?: string) => {
    if (!active) return;
    setPicking(true);
    try {
      const { data, error } = await supabase.functions.invoke("pick-offer-winners", {
        body: { campaign_id: active.id, count: active.winners_count, prompt: extra, mode },
      });
      if (error || (data as any)?.error) throw new Error((data as any)?.error || error?.message);
      toast.success(`${(data as any).winners.length} জন বিজয়ী নির্বাচিত! (${mode === "random" ? "Random" : "AI Smart"})`);
      loadDetail(active);
    } catch (e: any) {
      toast.error(e.message || "নির্বাচন ব্যর্থ");
    } finally {
      setPicking(false);
    }
  };

  const toggleWinnerPublish = async (id: string, val: boolean) => {
    await supabase.from("offer_winners" as any).update({ is_published: val }).eq("id", id);
    if (active) loadDetail(active);
  };

  const publishAll = async (val: boolean) => {
    if (!active) return;
    await supabase.from("offer_winners" as any).update({ is_published: val }).eq("campaign_id", active.id);
    await supabase.from("offer_campaigns" as any).update({ winners_announced: val, winners_announce_at: val ? new Date().toISOString() : null }).eq("id", active.id);
    toast.success(val ? "বিজয়ী প্রকাশিত" : "প্রকাশ বন্ধ");
    loadDetail(active);
    load();
  };

  const exportCsv = () => {
    if (!submissions.length) return;
    const headers = ["id", "name", "email", "phone", "created_at", "answers"];
    const rows = submissions.map((s) =>
      [s.id, s.name, s.email, s.phone, s.created_at, JSON.stringify(s.answers).replace(/"/g, '""')]
        .map((v) => `"${(v ?? "").toString().replace(/"/g, '""')}"`).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${active?.slug || "offer"}-entries.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportWinnersCsv = () => {
    if (!winners.length) return;
    const headers = ["position", "name", "email", "phone", "prize", "reason", "selected_by", "is_published", "created_at"];
    const rows = winners.map((w) => [
      w.position,
      w.offer_submissions?.name,
      w.offer_submissions?.email,
      w.offer_submissions?.phone,
      w.prize,
      w.reason,
      w.selected_by,
      w.is_published ? "yes" : "no",
      w.created_at,
    ].map((v) => `"${(v ?? "").toString().replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${active?.slug || "offer"}-winners.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const offerUrl = (slug: string) => `${window.location.origin}/offer/${slug}`;

  const updateField = (i: number, patch: Partial<Field>) => {
    const next = [...form.fields]; next[i] = { ...next[i], ...patch }; setForm({ ...form, fields: next });
  };
  const addField = () => setForm({ ...form, fields: [...form.fields, { key: `field_${form.fields.length + 1}`, label: "নতুন ফিল্ড", type: "text" }] });
  const removeField = (i: number) => setForm({ ...form, fields: form.fields.filter((_, x) => x !== i) });

  const prizeRows = useMemo(() => {
    const n = Math.max(1, Number(form.winners_count) || 1);
    return Array.from({ length: n }, (_, i) => form.winner_prizes[i] || "");
  }, [form.winners_count, form.winner_prizes]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Gift className="w-6 h-6 text-purple-500" /> Offers & Giveaways</h1>
          <p className="text-sm text-muted-foreground">নিজের ডোমেইনে অফার ফর্ম, এন্ট্রি ব্যবস্থাপনা ও AI-নির্বাচিত বিজয়ী।</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> নতুন অফার</Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="list">Campaigns ({campaigns.length})</TabsTrigger>
          <TabsTrigger value="entries" disabled={!active}>Entries</TabsTrigger>
          <TabsTrigger value="winners" disabled={!active}>Winners</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Winners</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8">লোড হচ্ছে...</TableCell></TableRow>
                  ) : campaigns.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">কোনো অফার নেই</TableCell></TableRow>
                  ) : campaigns.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="font-medium">{c.title}</div>
                        <div className="text-xs text-muted-foreground">{c.prize_description?.slice(0, 60)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.status === "published" ? "default" : "secondary"}>{c.status}</Badge>
                        {c.use_google_form && <Badge variant="outline" className="ml-1">Google</Badge>}
                      </TableCell>
                      <TableCell>{c.winners_count}</TableCell>
                      <TableCell>
                        <button className="text-xs text-primary underline" onClick={() => { navigator.clipboard.writeText(offerUrl(c.slug)); toast.success("Copied!"); }}>
                          /offer/{c.slug}
                        </button>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button size="icon" variant="ghost" onClick={() => loadDetail(c)} title="View entries"><Users className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => window.open(offerUrl(c.slug), "_blank")} title="Open"><Eye className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Edit className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entries">
          {active && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle>{active.title} — Entries ({submissions.length})</CardTitle>
                  <p className="text-xs text-muted-foreground">URL: {offerUrl(active.slug)}</p>
                </div>
                <Button variant="outline" size="sm" onClick={exportCsv}><Download className="w-4 h-4 mr-1" /> CSV</Button>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">কোনো এন্ট্রি নেই</TableCell></TableRow>
                    ) : submissions.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>{s.email}</TableCell>
                        <TableCell>{s.phone}</TableCell>
                        <TableCell className="text-xs">{new Date(s.created_at).toLocaleString("bn-BD")}</TableCell>
                        <TableCell>{s.is_disqualified ? <Badge variant="destructive">DQ</Badge> : <Badge variant="secondary">Valid</Badge>}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="winners">
          {active && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500" /> Winners ({winners.length}/{active.winners_count})</CardTitle>
                  <p className="text-xs text-muted-foreground">AI {active.winners_count} জন winner বেছে নিবে এন্ট্রি থেকে।</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => pickWinners("smart")} disabled={picking}><Sparkles className="w-4 h-4 mr-1" /> {picking ? "নির্বাচন হচ্ছে..." : "AI Smart Pick"}</Button>
                  <Button variant="secondary" onClick={() => pickWinners("random")} disabled={picking}><Trophy className="w-4 h-4 mr-1" /> Random Pick</Button>
                  {winners.length > 0 && (
                    <Button variant="outline" onClick={() => publishAll(!winners.every((w) => w.is_published))}>
                      {winners.every((w) => w.is_published) ? "সব Unpublish" : "সব Publish"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {winners.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">এখনো কোনো winner নির্বাচিত হয়নি।</p>
                ) : (
                  <div className="space-y-3">
                    {winners.map((w) => (
                      <div key={w.id} className="flex items-start gap-3 p-3 rounded-xl border">
                        <span className="w-10 h-10 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center">{w.position}</span>
                        <div className="flex-1">
                          <div className="font-semibold">{w.offer_submissions?.name}</div>
                          <div className="text-xs text-muted-foreground">{w.offer_submissions?.email} · {w.offer_submissions?.phone}</div>
                          {w.prize && <div className="text-sm mt-1">🎁 {w.prize}</div>}
                          {w.reason && <div className="text-xs italic text-muted-foreground mt-1">{w.reason}</div>}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span>Public</span>
                          <Switch checked={w.is_published} onCheckedChange={(v) => toggleWinnerPublish(w.id, v)} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "অফার সম্পাদনা" : "নতুন অফার"}</DialogTitle></DialogHeader>
          <Tabs defaultValue={editing ? "basics" : "ai"}>
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="ai"><Wand2 className="w-3.5 h-3.5 mr-1" /> AI</TabsTrigger>
              <TabsTrigger value="basics">Basics</TabsTrigger>
              <TabsTrigger value="form">Form Fields</TabsTrigger>
              <TabsTrigger value="winners">Winners</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="ai" className="space-y-3">
              <div className="rounded-xl border bg-gradient-to-br from-purple-500/5 to-pink-500/5 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold"><Wand2 className="w-4 h-4 text-purple-500" /> AI Offer Builder (Gemini)</div>
                <p className="text-xs text-muted-foreground">আপনার অফারের বিস্তারিত সহজ ভাষায় লিখুন — AI title, description, form fields, winners, prize, schedule সব নিজে থেকে তৈরি করে সকল box-এ বসিয়ে দিবে। পরে যেকোনো tab-এ গিয়ে edit করতে পারবেন।</p>
                <Textarea rows={8} value={aiBrief} onChange={(e) => setAiBrief(e.target.value)}
                  placeholder={`উদাহরণ:\nঈদ উপলক্ষে আমরা ৩ জন winner কে iPhone 15, Samsung Galaxy Watch ও ৫০০০ টাকা গিফট কার্ড দিব। অংশগ্রহণ করতে নাম, ইমেইল, মোবাইল, ফেসবুক প্রোফাইল লিঙ্ক এবং "আপনি কেন জিততে চান" লাগবে। ১০ দিন চলবে, সর্বোচ্চ ১০০০ এন্ট্রি।`} />
                <div className="flex gap-2">
                  <Button onClick={aiGenerate} disabled={aiBusy} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <Sparkles className="w-4 h-4 mr-1" /> {aiBusy ? "তৈরি হচ্ছে..." : "AI দিয়ে সব Generate করো"}
                  </Button>
                  {form.title && <span className="text-xs text-green-600 self-center">✓ "{form.title}" তৈরি হয়েছে — অন্য tab চেক করুন</span>}
                </div>
              </div>
            </TabsContent>


            <TabsContent value="basics" className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div><Label>Slug (URL)</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generate" /></div>
              </div>
              <div><Label>Description</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div><Label>Banner URL</Label><Input value={form.banner_url} onChange={(e) => setForm({ ...form, banner_url: e.target.value })} /></div>
              <div><Label>Prize Description</Label><Textarea rows={3} value={form.prize_description} onChange={(e) => setForm({ ...form, prize_description: e.target.value })} /></div>
              <div className="flex items-center gap-2">
                <Switch checked={form.use_google_form} onCheckedChange={(v) => setForm({ ...form, use_google_form: v })} />
                <Label>Google Form ব্যবহার করো (আমাদের ডোমেইনে embed হবে)</Label>
              </div>
              {form.use_google_form && (
                <div><Label>Google Form URL (embed)</Label><Input value={form.google_form_url} onChange={(e) => setForm({ ...form, google_form_url: e.target.value })} placeholder="https://docs.google.com/forms/.../viewform?embedded=true" /></div>
              )}
            </TabsContent>

            <TabsContent value="form" className="space-y-3">
              <p className="text-xs text-muted-foreground">কাস্টম ফর্ম ফিল্ড। যদি Google Form on থাকে, এগুলো ব্যবহৃত হবে না।</p>
              {form.fields.map((f, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-end border rounded-lg p-2">
                  <div className="col-span-3"><Label className="text-xs">Key</Label><Input value={f.key} onChange={(e) => updateField(i, { key: e.target.value })} /></div>
                  <div className="col-span-3"><Label className="text-xs">Label</Label><Input value={f.label} onChange={(e) => updateField(i, { label: e.target.value })} /></div>
                  <div className="col-span-2"><Label className="text-xs">Type</Label>
                    <select className="w-full h-10 rounded-md border bg-background px-2 text-sm" value={f.type} onChange={(e) => updateField(i, { type: e.target.value as any })}>
                      <option value="text">text</option><option value="email">email</option><option value="tel">tel</option><option value="textarea">textarea</option><option value="select">select</option>
                    </select>
                  </div>
                  <div className="col-span-3">
                    {f.type === "select" && <><Label className="text-xs">Options (comma)</Label><Input value={(f.options || []).join(",")} onChange={(e) => updateField(i, { options: e.target.value.split(",").map((o) => o.trim()).filter(Boolean) })} /></>}
                  </div>
                  <div className="col-span-1 flex flex-col gap-1">
                    <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={!!f.required} onChange={(e) => updateField(i, { required: e.target.checked })} /> Req</label>
                    <Button size="icon" variant="ghost" onClick={() => removeField(i)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addField}><Plus className="w-4 h-4 mr-1" /> Field</Button>
            </TabsContent>

            <TabsContent value="winners" className="space-y-3">
              <div><Label>কতজন বিজয়ী?</Label><Input type="number" min={1} value={form.winners_count} onChange={(e) => setForm({ ...form, winners_count: Number(e.target.value) || 1 })} /></div>
              <div>
                <Label>প্রতি অবস্থানের পুরস্কার</Label>
                <div className="space-y-2 mt-1">
                  {prizeRows.map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-8 text-sm font-semibold">#{i + 1}</span>
                      <Input value={p} onChange={(e) => {
                        const arr = [...prizeRows]; arr[i] = e.target.value; setForm({ ...form, winner_prizes: arr });
                      }} placeholder={`${i + 1}ম স্থানের পুরস্কার`} />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">AI এন্ট্রি থেকে fair pick করবে। ম্যানুয়াল edit-ও সম্ভব।</p>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><Label>Status</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-2 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="draft">Draft</option><option value="published">Published</option><option value="closed">Closed</option>
                  </select>
                </div>
                <div><Label>Max Entries</Label><Input type="number" value={form.max_entries as any} onChange={(e) => setForm({ ...form, max_entries: e.target.value as any })} /></div>
                <div><Label>Starts At</Label><Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /></div>
                <div><Label>Ends At</Label><Input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} /></div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-3">
              <div><Label>Thank You Message</Label><Textarea rows={3} value={form.thank_you_message} onChange={(e) => setForm({ ...form, thank_you_message: e.target.value })} /></div>
              <div><Label>Redirect URL (after submit)</Label><Input value={form.redirect_url} onChange={(e) => setForm({ ...form, redirect_url: e.target.value })} /></div>
              <div><Label>Meta Title</Label><Input value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} /></div>
              <div><Label>Meta Description</Label><Input value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} /></div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
