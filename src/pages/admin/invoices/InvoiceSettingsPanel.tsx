import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save, Plus, Trash2, Sparkles, Loader2, Package, Users } from "lucide-react";

const db = supabase as any;

export type InvoiceSettings = Record<string, any>;

export function useInvoiceSettings() {
  const [settings, setSettings] = useState<InvoiceSettings | null>(null);
  const reload = async () => {
    const { data } = await db.from("invoice_settings").select("*").order("created_at").limit(1).maybeSingle();
    setSettings(data ?? null);
  };
  useEffect(() => { reload(); }, []);
  return { settings, reload };
}

export default function InvoiceSettingsPanel({ onSaved }: { onSaved?: () => void }) {
  const [form, setForm] = useState<InvoiceSettings>({});
  const [presets, setPresets] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [aiBusy, setAiBusy] = useState<string | null>(null);

  const load = async () => {
    const { data } = await db.from("invoice_settings").select("*").order("created_at").limit(1).maybeSingle();
    setForm(data ?? {});
    const { data: p } = await db.from("invoice_presets").select("*").order("sort_order");
    setPresets(p ?? []);
  };
  useEffect(() => { load(); }, []);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    const payload = { ...form };
    delete payload.created_at; delete payload.updated_at;
    let error;
    if (form.id) {
      ({ error } = await db.from("invoice_settings").update(payload).eq("id", form.id));
    } else {
      const res = await db.from("invoice_settings").insert(payload).select().single();
      error = res.error;
      if (res.data) setForm(res.data);
    }
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Invoice settings saved");
    onSaved?.();
  };

  const aiWrite = async (mode: "terms" | "notes") => {
    setAiBusy(mode);
    try {
      const { data, error } = await supabase.functions.invoke("invoice-ai", {
        body: { mode, prompt: `Company: ${form.company_name || "Shahed IT"} — IT services agency in Rajshahi, Bangladesh. Default payment window ${form.default_due_days ?? 7} days.` },
      });
      if (error) throw error;
      const r = (data as any)?.result;
      if (mode === "terms" && r?.terms) set("default_terms", r.terms);
      if (mode === "notes" && r?.notes) set("default_notes", r.notes);
      toast.success("AI text generated");
    } catch (e: any) {
      toast.error(e.message || "AI failed");
    } finally {
      setAiBusy(null);
    }
  };

  const addPreset = async (type: "item" | "client") => {
    const name = prompt(type === "item" ? "Preset item name" : "Preset client name");
    if (!name) return;
    const data = type === "item" ? { description: name, quantity: 1, unit_price: 0 } : { client_name: name, client_email: "", client_phone: "", client_address: "" };
    const { error } = await db.from("invoice_presets").insert({ type, name, data, sort_order: presets.length });
    if (error) return toast.error(error.message);
    load();
  };

  const updatePreset = async (id: string, patch: any) => {
    const target = presets.find((p) => p.id === id);
    const next = { ...target, ...patch, data: { ...target.data, ...(patch.data ?? {}) } };
    setPresets(presets.map((p) => (p.id === id ? next : p)));
    await db.from("invoice_presets").update({ name: next.name, data: next.data }).eq("id", id);
  };

  const delPreset = async (id: string) => {
    await db.from("invoice_presets").delete().eq("id", id);
    setPresets(presets.filter((p) => p.id !== id));
  };

  const itemPresets = presets.filter((p) => p.type === "item");
  const clientPresets = presets.filter((p) => p.type === "client");

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h3 className="text-base font-bold mb-4">Company & Branding</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div><Label className="text-xs">Company name</Label><Input value={form.company_name ?? ""} onChange={(e) => set("company_name", e.target.value)} /></div>
          <div><Label className="text-xs">Email</Label><Input value={form.company_email ?? ""} onChange={(e) => set("company_email", e.target.value)} /></div>
          <div><Label className="text-xs">Phone</Label><Input value={form.company_phone ?? ""} onChange={(e) => set("company_phone", e.target.value)} /></div>
          <div><Label className="text-xs">Website</Label><Input value={form.company_website ?? ""} onChange={(e) => set("company_website", e.target.value)} /></div>
          <div className="md:col-span-2"><Label className="text-xs">Address</Label><Textarea value={form.company_address ?? ""} onChange={(e) => set("company_address", e.target.value)} /></div>
          <div><Label className="text-xs">Logo URL</Label><Input value={form.logo_url ?? ""} onChange={(e) => set("logo_url", e.target.value)} placeholder="https://..." /></div>
          <div><Label className="text-xs">Signature image URL</Label><Input value={form.signature_url ?? ""} onChange={(e) => set("signature_url", e.target.value)} placeholder="https://..." /></div>
          <div><Label className="text-xs">Signature name</Label><Input value={form.signature_name ?? ""} onChange={(e) => set("signature_name", e.target.value)} /></div>
          <div><Label className="text-xs">Brand colour</Label><Input type="color" className="h-10 p-1" value={form.brand_color ?? "#7c3aed"} onChange={(e) => set("brand_color", e.target.value)} /></div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-base font-bold mb-4">Invoice Defaults</h3>
        <div className="grid md:grid-cols-4 gap-3">
          <div><Label className="text-xs">Prefix</Label><Input value={form.invoice_prefix ?? "INV"} onChange={(e) => set("invoice_prefix", e.target.value)} /></div>
          <div><Label className="text-xs">Currency</Label><Input value={form.currency ?? "BDT"} onChange={(e) => set("currency", e.target.value)} /></div>
          <div><Label className="text-xs">Default VAT/TAX %</Label><Input type="number" value={form.default_tax_rate ?? 0} onChange={(e) => set("default_tax_rate", e.target.value)} /></div>
          <div><Label className="text-xs">Default discount (৳)</Label><Input type="number" value={form.default_discount ?? 0} onChange={(e) => set("default_discount", e.target.value)} /></div>
          <div><Label className="text-xs">Due after (days)</Label><Input type="number" value={form.default_due_days ?? 7} onChange={(e) => set("default_due_days", e.target.value)} /></div>
          <div className="md:col-span-3 flex items-end gap-6">
            <div className="flex items-center gap-2"><Switch checked={!!form.show_qr} onCheckedChange={(v) => set("show_qr", v)} /><span className="text-xs">Show QR code</span></div>
            <div className="flex items-center gap-2"><Switch checked={!!form.auto_create_order} onCheckedChange={(v) => set("auto_create_order", v)} /><span className="text-xs">Auto-create website order</span></div>
            <div className="w-40"><Label className="text-xs">Order status</Label><Input value={form.order_status ?? "pending"} onChange={(e) => set("order_status", e.target.value)} /></div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mt-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs">Default terms</Label>
              <Button size="sm" variant="ghost" disabled={aiBusy === "terms"} onClick={() => aiWrite("terms")}>
                {aiBusy === "terms" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}<span className="ml-1 text-xs">AI</span>
              </Button>
            </div>
            <Textarea rows={4} value={form.default_terms ?? ""} onChange={(e) => set("default_terms", e.target.value)} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs">Default notes</Label>
              <Button size="sm" variant="ghost" disabled={aiBusy === "notes"} onClick={() => aiWrite("notes")}>
                {aiBusy === "notes" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}<span className="ml-1 text-xs">AI</span>
              </Button>
            </div>
            <Textarea rows={4} value={form.default_notes ?? ""} onChange={(e) => set("default_notes", e.target.value)} />
          </div>
          <div><Label className="text-xs">Bank / payment details</Label><Textarea rows={3} value={form.bank_details ?? ""} onChange={(e) => set("bank_details", e.target.value)} /></div>
          <div><Label className="text-xs">Payment instructions</Label><Textarea rows={3} value={form.payment_instructions ?? ""} onChange={(e) => set("payment_instructions", e.target.value)} /></div>
          <div className="md:col-span-2"><Label className="text-xs">Footer note</Label><Input value={form.footer_note ?? ""} onChange={(e) => set("footer_note", e.target.value)} /></div>
        </div>

        <Button className="mt-4" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Save Settings
        </Button>
      </GlassCard>

      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold flex items-center gap-2"><Package className="w-4 h-4" />Ready Items</h3>
            <Button size="sm" variant="outline" onClick={() => addPreset("item")}><Plus className="w-3 h-3 mr-1" />Add</Button>
          </div>
          <div className="space-y-2">
            {itemPresets.map((p) => (
              <div key={p.id} className="grid grid-cols-12 gap-2">
                <Input className="col-span-7" value={p.data?.description ?? ""} onChange={(e) => updatePreset(p.id, { name: e.target.value, data: { description: e.target.value } })} />
                <Input className="col-span-4" type="number" value={p.data?.unit_price ?? 0} onChange={(e) => updatePreset(p.id, { data: { unit_price: Number(e.target.value) } })} />
                <Button size="icon" variant="ghost" className="col-span-1 text-rose-400" onClick={() => delPreset(p.id)}><Trash2 className="w-3 h-3" /></Button>
              </div>
            ))}
            {itemPresets.length === 0 && <p className="text-xs text-muted-foreground">No ready items yet.</p>}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold flex items-center gap-2"><Users className="w-4 h-4" />Ready Clients</h3>
            <Button size="sm" variant="outline" onClick={() => addPreset("client")}><Plus className="w-3 h-3 mr-1" />Add</Button>
          </div>
          <div className="space-y-2">
            {clientPresets.map((p) => (
              <div key={p.id} className="grid grid-cols-12 gap-2">
                <Input className="col-span-5" placeholder="Name" value={p.data?.client_name ?? ""} onChange={(e) => updatePreset(p.id, { name: e.target.value, data: { client_name: e.target.value } })} />
                <Input className="col-span-6" placeholder="Email" value={p.data?.client_email ?? ""} onChange={(e) => updatePreset(p.id, { data: { client_email: e.target.value } })} />
                <Button size="icon" variant="ghost" className="col-span-1 text-rose-400" onClick={() => delPreset(p.id)}><Trash2 className="w-3 h-3" /></Button>
              </div>
            ))}
            {clientPresets.length === 0 && <p className="text-xs text-muted-foreground">No ready clients yet.</p>}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
