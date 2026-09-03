import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Sparkles, Loader2, Plus, X, Save, Wand2 } from "lucide-react";

const db = supabase as any;
const STATUS = ["draft", "sent", "paid", "overdue", "cancelled"];

const emptyItem = { description: "", quantity: 1, unit_price: 0 };

export default function InvoiceDesigner({ onSaved }: { onSaved?: () => void }) {
  const [settings, setSettings] = useState<any>({});
  const [presets, setPresets] = useState<any[]>([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiBusy, setAiBusy] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [createOrder, setCreateOrder] = useState(false);
  const [form, setForm] = useState<any>({
    client_name: "", client_email: "", client_phone: "", client_address: "",
    issue_date: new Date().toISOString().slice(0, 10), due_date: "",
    tax_rate: 0, discount: 0, status: "draft", notes: "", terms: "",
    items: [{ ...emptyItem }],
  });

  useEffect(() => {
    (async () => {
      const { data } = await db.from("invoice_settings").select("*").order("created_at").limit(1).maybeSingle();
      const { data: p } = await db.from("invoice_presets").select("*").order("sort_order");
      setPresets(p ?? []);
      if (data) {
        setSettings(data);
        setCreateOrder(!!data.auto_create_order);
        const due = new Date();
        due.setDate(due.getDate() + (Number(data.default_due_days) || 7));
        setForm((f: any) => ({
          ...f,
          tax_rate: Number(data.default_tax_rate) || 0,
          discount: Number(data.default_discount) || 0,
          terms: data.default_terms ?? "",
          notes: data.default_notes ?? "",
          due_date: due.toISOString().slice(0, 10),
        }));
      }
    })();
  }, []);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const setItem = (idx: number, patch: any) => {
    const next = [...form.items];
    next[idx] = { ...next[idx], ...patch };
    set("items", next);
  };

  const totals = () => {
    const subtotal = form.items.reduce((s: number, it: any) => s + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0), 0);
    const tax_amount = (subtotal * (Number(form.tax_rate) || 0)) / 100;
    const total = subtotal + tax_amount - (Number(form.discount) || 0);
    return { subtotal, tax_amount, total };
  };

  const runAi = async (mode: "items" | "notes" | "terms" | "summary") => {
    if (mode === "items" && !aiPrompt.trim()) return toast.error("Write what the invoice is for");
    setAiBusy(mode);
    try {
      const { data, error } = await supabase.functions.invoke("invoice-ai", {
        body: {
          mode,
          prompt: aiPrompt,
          context: { client: form.client_name, items: form.items, tax_rate: form.tax_rate, totals: totals() },
        },
      });
      if (error) throw error;
      const r = (data as any)?.result;
      if (!r) throw new Error("AI returned no result");
      if (mode === "items") {
        if (Array.isArray(r.items) && r.items.length) {
          set("items", r.items.map((i: any) => ({
            description: String(i.description ?? ""),
            quantity: Number(i.quantity) || 1,
            unit_price: Number(i.unit_price) || 0,
          })));
        }
        setForm((f: any) => ({
          ...f,
          notes: r.notes || f.notes,
          terms: r.terms || f.terms,
          tax_rate: r.tax_rate != null ? Number(r.tax_rate) : f.tax_rate,
        }));
      } else if (mode === "notes") set("notes", r.notes ?? form.notes);
      else if (mode === "terms") set("terms", r.terms ?? form.terms);
      else if (mode === "summary") set("notes", `${form.notes ? form.notes + "\n\n" : ""}${r.summary ?? ""}`);
      toast.success("AI applied");
    } catch (e: any) {
      toast.error(e.message || "AI failed");
    } finally {
      setAiBusy(null);
    }
  };

  const applyPreset = (p: any) => {
    if (p.type === "item") {
      const item = { description: p.data?.description ?? p.name, quantity: Number(p.data?.quantity) || 1, unit_price: Number(p.data?.unit_price) || 0 };
      const items = form.items.filter((i: any) => i.description || i.unit_price);
      set("items", [...items, item]);
    } else {
      setForm((f: any) => ({
        ...f,
        client_name: p.data?.client_name ?? f.client_name,
        client_email: p.data?.client_email ?? f.client_email,
        client_phone: p.data?.client_phone ?? f.client_phone,
        client_address: p.data?.client_address ?? f.client_address,
      }));
    }
  };

  const save = async () => {
    if (!form.client_name.trim()) return toast.error("Client name required");
    setSaving(true);
    try {
      const { subtotal, tax_amount, total } = totals();
      let order_id: string | null = null;

      if (createOrder) {
        const { data: order, error: oErr } = await db.from("orders").insert({
          customer_name: form.client_name,
          customer_email: form.client_email || "",
          customer_phone: form.client_phone || null,
          product_title: form.items[0]?.description || "Custom Invoice",
          amount: total,
          currency: settings.currency || "BDT",
          status: settings.order_status || "pending",
          admin_notes: "Created from invoice designer",
        }).select().single();
        if (oErr) throw oErr;
        order_id = order.id;
      }

      const { data: inv, error } = await db.from("invoices").insert({
        client_name: form.client_name, client_email: form.client_email, client_phone: form.client_phone,
        client_address: form.client_address, issue_date: form.issue_date, due_date: form.due_date || null,
        tax_rate: Number(form.tax_rate) || 0, discount: Number(form.discount) || 0,
        subtotal, tax_amount, total, status: form.status, notes: form.notes, terms: form.terms,
        order_id,
      }).select().single();
      if (error) throw error;

      await db.from("invoice_items").insert(form.items.filter((i: any) => i.description).map((it: any, i: number) => ({
        invoice_id: inv.id, description: it.description, quantity: Number(it.quantity) || 1,
        unit_price: Number(it.unit_price) || 0, amount: (Number(it.quantity) || 1) * (Number(it.unit_price) || 0), sort_order: i,
      })));

      toast.success(`Invoice ${inv.invoice_number} saved${order_id ? " + order created" : ""}`);
      setForm({ ...form, client_name: "", client_email: "", client_phone: "", client_address: "", items: [{ ...emptyItem }] });
      onSaved?.();
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const t = totals();
  const clientPresets = presets.filter((p) => p.type === "client");
  const itemPresets = presets.filter((p) => p.type === "item");

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h3 className="text-base font-bold flex items-center gap-2 mb-3"><Wand2 className="w-4 h-4 text-primary" />AI Invoice Builder</h3>
        <Textarea
          rows={3}
          placeholder="e.g. 5 পেজের বিজনেস ওয়েবসাইট, 1 বছরের হোস্টিং, লোগো ডিজাইন এবং 3 মাসের SEO — এই কাজের ইনভয়েস বানাও"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
        />
        <div className="flex flex-wrap gap-2 mt-3">
          <Button onClick={() => runAi("items")} disabled={aiBusy === "items"}>
            {aiBusy === "items" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}Generate Items & Pricing
          </Button>
          <Button variant="outline" onClick={() => runAi("notes")} disabled={aiBusy === "notes"}>AI Notes</Button>
          <Button variant="outline" onClick={() => runAi("terms")} disabled={aiBusy === "terms"}>AI Terms</Button>
          <Button variant="outline" onClick={() => runAi("summary")} disabled={aiBusy === "summary"}>AI Summary</Button>
        </div>
      </GlassCard>

      {(clientPresets.length > 0 || itemPresets.length > 0) && (
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground mb-2">Quick add from settings presets</p>
          <div className="flex flex-wrap gap-2">
            {clientPresets.map((p) => (
              <Button key={p.id} size="sm" variant="outline" onClick={() => applyPreset(p)}>👤 {p.name}</Button>
            ))}
            {itemPresets.map((p) => (
              <Button key={p.id} size="sm" variant="outline" onClick={() => applyPreset(p)}>➕ {p.name}</Button>
            ))}
          </div>
        </GlassCard>
      )}

      <GlassCard className="p-6">
        <h3 className="text-base font-bold mb-3">Client & Dates</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div><Label className="text-xs">Client name *</Label><Input value={form.client_name} onChange={(e) => set("client_name", e.target.value)} /></div>
          <div><Label className="text-xs">Client email</Label><Input value={form.client_email} onChange={(e) => set("client_email", e.target.value)} /></div>
          <div><Label className="text-xs">Client phone</Label><Input value={form.client_phone} onChange={(e) => set("client_phone", e.target.value)} /></div>
          <div><Label className="text-xs">Status</Label>
            <select className="w-full h-10 bg-background border border-input rounded-md px-3 text-sm" value={form.status} onChange={(e) => set("status", e.target.value)}>
              {STATUS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div><Label className="text-xs">Issue date</Label><Input type="date" value={form.issue_date} onChange={(e) => set("issue_date", e.target.value)} /></div>
          <div><Label className="text-xs">Due date</Label><Input type="date" value={form.due_date} onChange={(e) => set("due_date", e.target.value)} /></div>
          <div className="md:col-span-2"><Label className="text-xs">Client address</Label><Textarea value={form.client_address} onChange={(e) => set("client_address", e.target.value)} /></div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-base font-bold mb-3">Items</h3>
        {form.items.map((it: any, idx: number) => (
          <div key={idx} className="grid grid-cols-12 gap-2 mb-2">
            <Input className="col-span-6" placeholder="Description" value={it.description} onChange={(e) => setItem(idx, { description: e.target.value })} />
            <Input className="col-span-2" type="number" placeholder="Qty" value={it.quantity} onChange={(e) => setItem(idx, { quantity: e.target.value })} />
            <Input className="col-span-3" type="number" placeholder="Unit price" value={it.unit_price} onChange={(e) => setItem(idx, { unit_price: e.target.value })} />
            <Button variant="outline" size="icon" className="col-span-1 text-rose-400" onClick={() => set("items", form.items.filter((_: any, i: number) => i !== idx))}><X className="w-3 h-3" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => set("items", [...form.items, { ...emptyItem }])}><Plus className="w-3 h-3 mr-1" />Add Item</Button>

        <div className="grid sm:grid-cols-3 gap-3 mt-4">
          <div><Label className="text-xs">VAT / TAX %</Label><Input type="number" value={form.tax_rate} onChange={(e) => set("tax_rate", e.target.value)} /></div>
          <div><Label className="text-xs">Discount (৳)</Label><Input type="number" value={form.discount} onChange={(e) => set("discount", e.target.value)} /></div>
          <div className="text-right self-end">
            <div className="text-[10px] text-muted-foreground">Subtotal ৳{t.subtotal.toLocaleString()} · VAT ৳{t.tax_amount.toLocaleString()}</div>
            <div className="text-lg font-bold">Total: ৳{t.total.toLocaleString()}</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mt-4">
          <div><Label className="text-xs">Notes</Label><Textarea rows={4} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
          <div><Label className="text-xs">Terms</Label><Textarea rows={4} value={form.terms} onChange={(e) => set("terms", e.target.value)} /></div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Switch checked={createOrder} onCheckedChange={setCreateOrder} />
          <span className="text-xs">Also save as a website order</span>
        </div>

        <Button className="mt-4 w-full" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Save Invoice to Database
        </Button>
      </GlassCard>
    </div>
  );
}
