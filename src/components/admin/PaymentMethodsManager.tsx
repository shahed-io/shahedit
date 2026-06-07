import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Save, X, Smartphone, GripVertical, Upload, ImageIcon } from "lucide-react";
import type { PaymentMethod } from "@/hooks/usePaymentMethods";

const empty: Partial<PaymentMethod> = {
  method_id: "", label: "", sublabel: "", number: "", color: "#E2136E",
  short_code: "", logo_url: null, instructions: "", sort_order: 99, is_active: true,
};

export const PaymentMethodsManager = () => {
  const [items, setItems] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null); // id or "new"
  const [form, setForm] = useState<Partial<PaymentMethod>>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadLogo = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("শুধু image ফাইল আপলোড করুন"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("ফাইল 2MB এর কম হতে হবে"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `payment-logos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("cms-media").upload(path, file, {
      cacheControl: "3600", upsert: false, contentType: file.type,
    });
    if (error) { setUploading(false); toast.error("আপলোড ব্যর্থ: " + error.message); return; }
    const { data } = supabase.storage.from("cms-media").getPublicUrl(path);
    setForm(f => ({ ...f, logo_url: data.publicUrl }));
    setUploading(false);
    toast.success("✅ লোগো আপলোড হয়েছে");
  };

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("payment_methods")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) toast.error("লোড করতে সমস্যা: " + error.message);
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startEdit = (m: PaymentMethod) => {
    setEditing(m.id);
    setForm(m);
  };
  const startNew = () => {
    setEditing("new");
    setForm({ ...empty, sort_order: (items.at(-1)?.sort_order ?? 0) + 1 });
  };
  const cancel = () => { setEditing(null); setForm(empty); };

  const save = async () => {
    if (!form.method_id?.trim() || !form.label?.trim() || !form.number?.trim()) {
      toast.error("Method ID, Label ও Number বাধ্যতামূলক"); return;
    }
    setSaving(true);
    const payload = {
      method_id: form.method_id!.trim(),
      label: form.label!.trim(),
      sublabel: form.sublabel?.trim() || null,
      number: form.number!.trim(),
      color: form.color || "#E2136E",
      short_code: form.short_code?.trim() || form.label!.trim().slice(0, 2).toUpperCase(),
      logo_url: form.logo_url || null,
      instructions: form.instructions?.trim() || null,
      sort_order: Number(form.sort_order ?? 99),
      is_active: form.is_active ?? true,
    };
    let error;
    if (editing === "new") {
      ({ error } = await (supabase as any).from("payment_methods").insert(payload));
    } else {
      ({ error } = await (supabase as any).from("payment_methods").update(payload).eq("id", editing));
    }
    setSaving(false);
    if (error) { toast.error("সেভ ব্যর্থ: " + error.message); return; }
    toast.success("✅ সেভ হয়েছে");
    cancel();
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("এই পেমেন্ট মেথড মুছে ফেলবেন?")) return;
    const { error } = await (supabase as any).from("payment_methods").delete().eq("id", id);
    if (error) { toast.error("মুছতে সমস্যা: " + error.message); return; }
    toast.success("মুছে ফেলা হয়েছে");
    load();
  };

  const toggleActive = async (m: PaymentMethod) => {
    const { error } = await (supabase as any)
      .from("payment_methods").update({ is_active: !m.is_active }).eq("id", m.id);
    if (error) { toast.error("আপডেট ব্যর্থ"); return; }
    load();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Smartphone size={16} className="text-purple-400" />
          <h2 className="text-white font-semibold text-sm">ম্যানুয়াল পেমেন্ট নম্বর</h2>
          <span className="text-xs text-slate-500">({items.length})</span>
        </div>
        {editing === null && (
          <Button size="sm" onClick={startNew} className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5">
            <Plus size={14} /> নতুন যোগ করুন
          </Button>
        )}
      </div>

      {editing !== null && (
        <div className="mb-4 p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-slate-400 mb-1 block">Method ID *</Label>
              <Input value={form.method_id ?? ""} onChange={e => setForm(f => ({ ...f, method_id: e.target.value }))}
                placeholder="bkash_send" className="bg-slate-800 border-slate-700 text-white text-sm" />
            </div>
            <div>
              <Label className="text-xs text-slate-400 mb-1 block">Label *</Label>
              <Input value={form.label ?? ""} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                placeholder="বিকাশ" className="bg-slate-800 border-slate-700 text-white text-sm" />
            </div>
            <div>
              <Label className="text-xs text-slate-400 mb-1 block">Sublabel</Label>
              <Input value={form.sublabel ?? ""} onChange={e => setForm(f => ({ ...f, sublabel: e.target.value }))}
                placeholder="Send Money" className="bg-slate-800 border-slate-700 text-white text-sm" />
            </div>
            <div>
              <Label className="text-xs text-slate-400 mb-1 block">নম্বর *</Label>
              <Input value={form.number ?? ""} onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
                placeholder="01820060046" className="bg-slate-800 border-slate-700 text-white text-sm font-mono" />
            </div>
            <div>
              <Label className="text-xs text-slate-400 mb-1 block">Short Code</Label>
              <Input value={form.short_code ?? ""} onChange={e => setForm(f => ({ ...f, short_code: e.target.value }))}
                placeholder="bK" maxLength={4} className="bg-slate-800 border-slate-700 text-white text-sm" />
            </div>
            <div>
              <Label className="text-xs text-slate-400 mb-1 block">কালার</Label>
              <div className="flex gap-2">
                <input type="color" value={form.color ?? "#E2136E"} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  className="h-10 w-12 rounded border border-slate-700 bg-slate-800 cursor-pointer" />
                <Input value={form.color ?? ""} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white text-sm font-mono" />
              </div>
            </div>
            <div>
              <Label className="text-xs text-slate-400 mb-1 block">Sort Order</Label>
              <Input type="number" value={form.sort_order ?? 0} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                className="bg-slate-800 border-slate-700 text-white text-sm" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch checked={form.is_active ?? true} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label className="text-xs text-slate-300">সক্রিয়</Label>
            </div>
          </div>
          <div>
            <Label className="text-xs text-slate-400 mb-1 block">নির্দেশনা (ঐচ্ছিক)</Label>
            <Input value={form.instructions ?? ""} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
              placeholder="যেমন: Send Money অপশনে পাঠান" className="bg-slate-800 border-slate-700 text-white text-sm" />
          </div>
          <div>
            <Label className="text-xs text-slate-400 mb-1 block flex items-center gap-1.5">
              <ImageIcon size={12} /> লোগো (যেমন: বিকাশ লোগো) — PNG/JPG/SVG, max 2MB
            </Label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl border border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden shrink-0"
                style={{ background: form.logo_url ? "#fff" : form.color }}>
                {form.logo_url ? (
                  <img src={form.logo_url} alt="logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-white text-xs font-bold">{form.short_code || "?"}</span>
                )}
              </div>
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo(f); e.target.value = ""; }} />
                <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs hover:bg-slate-700">
                  <Upload size={12} /> {uploading ? "আপলোড হচ্ছে..." : (form.logo_url ? "পরিবর্তন করুন" : "লোগো আপলোড")}
                </span>
              </label>
              {form.logo_url && (
                <Button size="sm" variant="ghost" onClick={() => setForm(f => ({ ...f, logo_url: null }))}
                  className="text-red-400 hover:bg-red-500/10 text-xs gap-1 h-8">
                  <X size={12} /> Remove
                </Button>
              )}
              <Input value={form.logo_url ?? ""} onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))}
                placeholder="বা সরাসরি image URL পেস্ট করুন"
                className="bg-slate-800 border-slate-700 text-white text-xs flex-1" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={save} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white gap-1.5">
              <Save size={14} /> {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
            </Button>
            <Button size="sm" variant="outline" onClick={cancel} className="border-slate-700 text-slate-300 gap-1.5">
              <X size={14} /> বাতিল
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center text-slate-500 py-6 text-sm">লোড হচ্ছে...</div>
      ) : items.length === 0 ? (
        <div className="text-center text-slate-500 py-6 text-sm">কোনো পেমেন্ট মেথড নেই — উপরে "নতুন যোগ করুন" ক্লিক করুন।</div>
      ) : (
        <div className="space-y-2">
          {items.map(m => (
            <div key={m.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition ${m.is_active ? "bg-slate-800/50 border-slate-700" : "bg-slate-800/20 border-slate-800 opacity-60"}`}>
              <GripVertical size={14} className="text-slate-600 shrink-0" />
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden"
                style={{ background: m.logo_url ? "#fff" : m.color }}>
                {m.logo_url ? <img src={m.logo_url} alt={m.label} className="w-full h-full object-contain" /> : m.short_code}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-semibold text-sm">{m.label}</span>
                  {m.sublabel && <span className="text-xs text-slate-400">· {m.sublabel}</span>}
                  <span className="text-[10px] text-slate-500 font-mono">#{m.method_id}</span>
                </div>
                <p className="text-purple-300 font-mono text-sm">{m.number}</p>
              </div>
              <Switch checked={m.is_active} onCheckedChange={() => toggleActive(m)} />
              <Button size="sm" variant="ghost" onClick={() => startEdit(m)}
                className="text-slate-300 hover:text-white hover:bg-slate-700 h-8 w-8 p-0">
                <Pencil size={14} />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove(m.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0">
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
