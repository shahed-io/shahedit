import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage, AdminPageHeader, GlassCard, KpiCard } from "@/components/admin/ui";
import { FileText, Plus, Trash2, Edit2, Save, Eye, X, Mic, MicOff, Sparkles, Loader2, Printer, Bell, PenTool, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";
import { BRAND } from "@/lib/brand";

const db = supabase as any;
const STATUS = ["draft", "issued", "sent", "archived"];
const STATUS_COLOR: Record<string, string> = {
  draft: "bg-slate-500/20 text-slate-300",
  issued: "bg-sky-500/20 text-sky-300",
  sent: "bg-emerald-500/20 text-emerald-300",
  archived: "bg-zinc-500/20 text-zinc-400",
};
const CATEGORIES = [
  { v: "general", l: "General / সাধারণ" },
  { v: "service", l: "Service / সার্ভিস" },
  { v: "payment", l: "Payment / পেমেন্ট" },
  { v: "warning", l: "Warning / সতর্কতা" },
  { v: "legal", l: "Legal / আইনি" },
  { v: "announcement", l: "Announcement / ঘোষণা" },
];
const LOGO_KEY = "invoice_logo_url";
const SIG_KEY = "notice_signature_url";
const SIG_NAME_KEY = "notice_signature_name";

const emptyForm = {
  title: "", subject: "", body: "",
  recipient_name: "", recipient_address: "", recipient_email: "", recipient_phone: "",
  issued_by: "Shahed IT — Authorized Officer",
  issue_date: new Date().toISOString().slice(0, 10),
  reference: "", category: "general", status: "draft",
  language: "bn", tone: "formal", ai_prompt: "",
};

export default function AdminNotices() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [viewing, setViewing] = useState<any | null>(null);
  const [generating, setGenerating] = useState(false);
  const [listening, setListening] = useState(false);
  const recogRef = useRef<any>(null);

  // Settings
  const [logoUrl, setLogoUrl] = useState<string>(BRAND.logoUrl);
  const [sigUrl, setSigUrl] = useState<string>("");
  const [sigName, setSigName] = useState<string>("Shahed IT — Authorized Officer");
  const [showSig, setShowSig] = useState(false);
  const [sigBusy, setSigBusy] = useState(false);
  const [aiSigName, setAiSigName] = useState("");
  const [aiSigStyle, setAiSigStyle] = useState("elegant");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await db.from("notices").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  const loadSettings = async () => {
    const { data } = await db.from("site_settings").select("key,value").in("key", [LOGO_KEY, SIG_KEY, SIG_NAME_KEY]);
    (data || []).forEach((r: any) => {
      if (r.key === LOGO_KEY && r.value) setLogoUrl(r.value);
      if (r.key === SIG_KEY && r.value) setSigUrl(r.value);
      if (r.key === SIG_NAME_KEY && r.value) setSigName(r.value);
    });
  };
  useEffect(() => { load(); loadSettings(); }, []);

  const upsertSetting = async (key: string, value: string, label: string) => {
    const { data: ex } = await db.from("site_settings").select("id").eq("key", key).maybeSingle();
    if (ex) await db.from("site_settings").update({ value }).eq("key", key);
    else await db.from("site_settings").insert({ key, value, type: "text", group_name: "notices", label });
  };

  // ---- Signature upload ----
  const handleUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("শুধুমাত্র image file আপলোড করুন");
    setSigBusy(true);
    try {
      const path = `signatures/notice-signature-${Date.now()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("cms-media").upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("cms-media").getPublicUrl(path);
      await upsertSetting(SIG_KEY, data.publicUrl, "Notice Signature Image URL");
      setSigUrl(data.publicUrl);
      toast.success("Signature uploaded");
    } catch (e: any) {
      toast.error(e.message);
    } finally { setSigBusy(false); }
  };

  // ---- AI signature ----
  const generateSig = async () => {
    const name = aiSigName.trim();
    if (!name) return toast.error("নাম লিখুন");
    setSigBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-notice", {
        body: { mode: "signature", name, style: aiSigStyle },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const dataUrl = (data as any).image_data_url as string;
      // Convert to Blob and upload
      const resp = await fetch(dataUrl);
      const blob = await resp.blob();
      const path = `signatures/ai-signature-${Date.now()}.png`;
      const { error: upErr } = await supabase.storage.from("cms-media").upload(path, blob, { upsert: true, contentType: "image/png" });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("cms-media").getPublicUrl(path);
      await upsertSetting(SIG_KEY, pub.publicUrl, "Notice Signature Image URL");
      await upsertSetting(SIG_NAME_KEY, name, "Notice Signature Name");
      setSigUrl(pub.publicUrl);
      setSigName(name);
      toast.success("AI signature তৈরি হয়েছে");
    } catch (e: any) {
      toast.error(e.message);
    } finally { setSigBusy(false); }
  };

  const clearSig = async () => {
    await upsertSetting(SIG_KEY, "", "Notice Signature Image URL");
    setSigUrl("");
    toast.success("Signature cleared");
  };

  const saveSigName = async () => {
    await upsertSetting(SIG_NAME_KEY, sigName, "Notice Signature Name");
    toast.success("Saved");
  };

  // ---- Voice input ----
  const toggleVoice = () => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("আপনার ব্রাউজার voice input সাপোর্ট করে না (Chrome/Edge ব্যবহার করুন)"); return; }
    if (listening) { recogRef.current?.stop(); return; }
    const r = new SR();
    r.lang = form.language === "en" ? "en-US" : "bn-BD";
    r.continuous = true; r.interimResults = true;
    let finalText = form.ai_prompt;
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onerror = (e: any) => { setListening(false); if (e.error !== "no-speech") toast.error("Voice error: " + e.error); };
    r.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += (finalText ? " " : "") + t;
        else interim += t;
      }
      setForm((f: any) => ({ ...f, ai_prompt: finalText + (interim ? " " + interim : "") }));
    };
    recogRef.current = r; r.start();
  };

  const generate = async () => {
    if (!form.ai_prompt.trim()) return toast.error("আগে নোটিশের বিস্তারিত লিখুন বা বলুন");
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-notice", {
        body: {
          prompt: form.ai_prompt, language: form.language, tone: form.tone,
          category: form.category, recipient_name: form.recipient_name, reference: form.reference,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setForm((f: any) => ({
        ...f,
        title: (data as any).title || f.title,
        subject: (data as any).subject || f.subject,
        body: (data as any).body || f.body,
      }));
      toast.success("AI নোটিশ তৈরি করেছে");
    } catch (e: any) { toast.error(e.message || "AI generation failed"); }
    finally { setGenerating(false); }
  };

  const openNew = () => { setForm({ ...emptyForm, issued_by: sigName || emptyForm.issued_by }); setEditingId(null); setShowForm(true); };
  const openEdit = (n: any) => { setForm({ ...emptyForm, ...n }); setEditingId(n.id); setShowForm(true); };

  const save = async () => {
    if (!form.title || !form.body) return toast.error("Title এবং Body আবশ্যক");
    const payload = {
      title: form.title, subject: form.subject, body: form.body,
      recipient_name: form.recipient_name, recipient_address: form.recipient_address,
      recipient_email: form.recipient_email, recipient_phone: form.recipient_phone,
      issued_by: form.issued_by, issue_date: form.issue_date, reference: form.reference,
      category: form.category, status: form.status, language: form.language, tone: form.tone,
      ai_prompt: form.ai_prompt,
    };
    if (editingId) {
      const { error } = await db.from("notices").update(payload).eq("id", editingId);
      if (error) return toast.error(error.message);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await db.from("notices").insert({ ...payload, created_by: user?.id });
      if (error) return toast.error(error.message);
    }
    toast.success("Saved"); setShowForm(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this notice?")) return;
    const { error } = await db.from("notices").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  const printNotice = () => window.print();

  const kpis = {
    total: items.length,
    draft: items.filter(i => i.status === "draft").length,
    issued: items.filter(i => i.status === "issued" || i.status === "sent").length,
  };

  return (
    <AdminPage>
      <AdminPageHeader
        icon={Bell}
        title="Notice System"
        subtitle="AI-powered notice generator with voice input — invoice-style design"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowSig(true)}><PenTool className="w-4 h-4 mr-2" />Signature</Button>
            <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" />New Notice</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <KpiCard label="Total Notices" value={kpis.total} icon={FileText} />
        <KpiCard label="Draft" value={kpis.draft} icon={Edit2} />
        <KpiCard label="Issued / Sent" value={kpis.issued} icon={Eye} />
      </div>

      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-white/10">
                <th className="text-left p-2">Notice #</th>
                <th className="text-left p-2">Title</th>
                <th className="text-left p-2">Recipient</th>
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Status</th>
                <th className="text-right p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={6} className="text-center p-8 text-muted-foreground">কোন নোটিশ নেই। উপরের "New Notice" বাটনে ক্লিক করুন।</td></tr>
              )}
              {items.map(n => (
                <tr key={n.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-2 font-mono text-xs">{n.notice_number}</td>
                  <td className="p-2">{n.title}</td>
                  <td className="p-2 text-xs">{n.recipient_name || "—"}</td>
                  <td className="p-2 text-xs">{n.issue_date}</td>
                  <td className="p-2"><span className={`text-[10px] uppercase px-2 py-0.5 rounded ${STATUS_COLOR[n.status] || ""}`}>{n.status}</span></td>
                  <td className="p-2">
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => setViewing(n)}><Eye className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(n)}><Edit2 className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(n.id)}><Trash2 className="w-4 h-4 text-rose-400" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* ===== Signature Manager ===== */}
      <Dialog open={showSig} onOpenChange={setShowSig}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Notice Signature Manager</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-white/10 p-3 bg-white/5">
              <p className="text-xs text-muted-foreground mb-2">Current signature (used on all notices automatically)</p>
              {sigUrl ? (
                <div className="bg-white rounded p-3 flex items-center justify-center min-h-[80px]">
                  <img src={sigUrl} alt="Signature" className="max-h-20 object-contain" />
                </div>
              ) : (
                <div className="bg-white/5 rounded p-3 text-center text-xs text-muted-foreground">কোন signature সেট করা নেই</div>
              )}
              {sigUrl && <Button size="sm" variant="outline" className="mt-2" onClick={clearSig}><X className="w-3 h-3 mr-1" />Remove</Button>}
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Signer Name (নাম + পদবি)</label>
              <div className="flex gap-2">
                <Input value={sigName} onChange={e => setSigName(e.target.value)} placeholder="যেমন: Shahed Hossain — Director" />
                <Button onClick={saveSigName}><Save className="w-4 h-4" /></Button>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold"><Upload className="w-4 h-4" />Upload Signature Image</div>
              <p className="text-xs text-muted-foreground">PNG (transparent preferred) বা JPG — স্ক্যান করা signature</p>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
              <Button variant="outline" disabled={sigBusy} onClick={() => fileRef.current?.click()}>
                {sigBusy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                Choose Image
              </Button>
            </div>

            <div className="rounded-lg border border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="w-4 h-4 text-violet-400" />AI Signature Generator</div>
              <Input placeholder="Signer name (e.g. Shahed Hossain)" value={aiSigName} onChange={e => setAiSigName(e.target.value)} />
              <Select value={aiSigStyle} onValueChange={setAiSigStyle}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="elegant">Elegant cursive</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                  <SelectItem value="modern">Modern minimal</SelectItem>
                  <SelectItem value="classic">Classic copperplate</SelectItem>
                </SelectContent>
              </Select>
              <Button disabled={sigBusy} onClick={generateSig} className="bg-gradient-to-r from-violet-600 to-fuchsia-600">
                {sigBusy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Generate with AI
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Create / Edit Dialog ===== */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Notice" : "New Notice"}</DialogTitle></DialogHeader>

          <div className="rounded-lg border border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="w-4 h-4 text-violet-400" />AI Notice Writer (Gemini)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Select value={form.language} onValueChange={v => setForm({ ...form, language: v })}>
                <SelectTrigger><SelectValue placeholder="Language" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bn">বাংলা</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="mixed">Mixed (BN+EN)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.tone} onValueChange={v => setForm({ ...form, tone: v })}>
                <SelectTrigger><SelectValue placeholder="Tone" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="polite">Polite</SelectItem>
                  <SelectItem value="firm">Firm / Strict</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.v} value={c.v}>{c.l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Textarea
                placeholder="নোটিশে কি লিখতে চান বিস্তারিত বলুন... অথবা মাইক চেপে কথা বলুন।"
                value={form.ai_prompt}
                onChange={e => setForm({ ...form, ai_prompt: e.target.value })}
                rows={4} className="pr-12"
              />
              <Button type="button" size="icon" variant={listening ? "destructive" : "secondary"}
                className="absolute top-2 right-2" onClick={toggleVoice}>
                {listening ? <MicOff className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4" />}
              </Button>
            </div>
            <Button onClick={generate} disabled={generating} className="bg-gradient-to-r from-violet-600 to-fuchsia-600">
              {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Generate with AI
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground">Title *</label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground">Subject</label>
              <Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground">Body *</label>
              <Textarea rows={8} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Recipient Name</label>
              <Input value={form.recipient_name} onChange={e => setForm({ ...form, recipient_name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Recipient Email</label>
              <Input value={form.recipient_email} onChange={e => setForm({ ...form, recipient_email: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Recipient Phone</label>
              <Input value={form.recipient_phone} onChange={e => setForm({ ...form, recipient_phone: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Reference</label>
              <Input value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground">Recipient Address</label>
              <Textarea rows={2} value={form.recipient_address} onChange={e => setForm({ ...form, recipient_address: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Issue Date</label>
              <Input type="date" value={form.issue_date} onChange={e => setForm({ ...form, issue_date: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Issued By</label>
              <Input value={form.issued_by} onChange={e => setForm({ ...form, issued_by: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Status</label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-3">
            <Button variant="outline" onClick={() => setShowForm(false)}><X className="w-4 h-4 mr-2" />Cancel</Button>
            <Button onClick={save}><Save className="w-4 h-4 mr-2" />Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== View Dialog (invoice-style, printable) ===== */}
      <Dialog open={!!viewing} onOpenChange={o => !o && setViewing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Notice {viewing?.notice_number}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="bg-white text-black p-6 rounded" id="notice-print">
              <div className="flex justify-between mb-4">
                <div className="flex items-start gap-3">
                  <img src={logoUrl} alt="Logo" crossOrigin="anonymous" className="h-14 w-14 object-contain" />
                  <div>
                    <h2 className="text-xl font-bold">{BRAND.name}</h2>
                    <p className="text-xs">{BRAND.address}</p>
                    <p className="text-xs">Phone: {BRAND.phone}</p>
                    <p className="text-xs">{BRAND.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-lg">NOTICE</h3>
                  <p className="text-xs">#{viewing.notice_number}</p>
                  <p className="text-xs">Date: {viewing.issue_date}</p>
                  {viewing.reference && <p className="text-xs">Ref: {viewing.reference}</p>}
                  <p className="text-[10px] mt-1 px-2 py-0.5 inline-block rounded bg-gray-100 uppercase font-semibold">{viewing.status}</p>
                </div>
              </div>

              <div className="mb-4 border-t border-b py-2">
                <p className="text-xs text-gray-500">To:</p>
                <p className="font-semibold">{viewing.recipient_name || "—"}</p>
                {viewing.recipient_email && <p className="text-xs">{viewing.recipient_email}</p>}
                {viewing.recipient_phone && <p className="text-xs">{viewing.recipient_phone}</p>}
                {viewing.recipient_address && <p className="text-xs whitespace-pre-line">{viewing.recipient_address}</p>}
              </div>

              <h1 className="text-base font-bold text-center mb-2 underline">{viewing.title}</h1>
              {viewing.subject && <p className="text-sm font-semibold mb-3"><span className="text-gray-600">Subject: </span>{viewing.subject}</p>}

              <div className="text-sm whitespace-pre-line leading-relaxed mb-6">{viewing.body}</div>

              <div className="flex justify-between items-end gap-4 mt-8">
                <div className="flex flex-col items-center">
                  <div className="bg-white p-1 border rounded">
                    <QRCodeCanvas value={`${BRAND.website}/notice/${viewing.notice_number}`} size={80} level="M" includeMargin={false} />
                  </div>
                  <p className="text-[9px] text-gray-500 mt-1">Scan to verify</p>
                </div>
                <div className="text-right text-xs">
                  <div className="min-w-[200px] flex flex-col items-end">
                    {sigUrl ? (
                      <img src={sigUrl} alt="Signature" crossOrigin="anonymous" className="h-16 object-contain mb-1 mix-blend-multiply" />
                    ) : (
                      <div className="h-12" />
                    )}
                    <div className="border-t border-gray-400 pt-1 w-full text-right">
                      <p className="font-semibold">{sigName || viewing.issued_by}</p>
                      <p className="text-gray-500">Authorized Signature</p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 text-center mt-4 pt-2 border-t">
                This is an official notice from {BRAND.name} · {BRAND.website}
              </p>
            </div>
          )}
          <div className="flex gap-2 mt-2 flex-wrap">
            <Button onClick={printNotice}><Printer className="w-4 h-4 mr-2" />Print / Save PDF</Button>
            {viewing && <Button variant="outline" onClick={() => { setViewing(null); openEdit(viewing); }}><Edit2 className="w-4 h-4 mr-2" />Edit</Button>}
          </div>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}
