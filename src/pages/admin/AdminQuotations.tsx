import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage, AdminPageHeader, GlassCard, KpiCard } from "@/components/admin/ui";
import { FileText, Plus, Trash2, Edit2, Save, Eye, X, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const db = supabase as any;
const STATUS = ["draft", "sent", "accepted", "rejected", "expired", "converted"];
const STATUS_COLOR: Record<string, string> = {
  draft: "bg-slate-500/20 text-slate-300",
  sent: "bg-sky-500/20 text-sky-300",
  accepted: "bg-emerald-500/20 text-emerald-300",
  rejected: "bg-rose-500/20 text-rose-300",
  expired: "bg-amber-500/20 text-amber-300",
  converted: "bg-primary/20 text-primary",
};

const emptyItem = { description: "", quantity: 1, unit_price: 0 };
const emptyForm = {
  client_name: "", client_email: "", client_phone: "", client_company: "", subject: "",
  issue_date: new Date().toISOString().slice(0, 10), valid_until: "",
  tax_rate: 0, discount: 0, status: "draft", notes: "", terms: "Valid for 30 days",
  items: [{ ...emptyItem }],
};

export default function AdminQuotations() {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [viewing, setViewing] = useState<any | null>(null);

  const load = async () => {
    const { data } = await db.from("quotations").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const totals = () => {
    const subtotal = form.items.reduce((s: number, it: any) => s + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0), 0);
    const tax_amount = (subtotal * (Number(form.tax_rate) || 0)) / 100;
    const total = subtotal + tax_amount - (Number(form.discount) || 0);
    return { subtotal, tax_amount, total };
  };

  const save = async () => {
    if (!form.client_name) return toast.error("Client name required");
    const { subtotal, tax_amount, total } = totals();
    const payload = {
      client_name: form.client_name, client_email: form.client_email, client_phone: form.client_phone, client_company: form.client_company,
      subject: form.subject, issue_date: form.issue_date, valid_until: form.valid_until || null,
      tax_rate: Number(form.tax_rate) || 0, discount: Number(form.discount) || 0,
      subtotal, tax_amount, total, status: form.status, notes: form.notes, terms: form.terms,
    };
    let qid = editing?.id;
    if (editing) {
      const { error } = await db.from("quotations").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
      await db.from("quotation_items").delete().eq("quotation_id", editing.id);
    } else {
      const { data, error } = await db.from("quotations").insert(payload).select().single();
      if (error) return toast.error(error.message);
      qid = data.id;
    }
    await db.from("quotation_items").insert(form.items.map((it: any, i: number) => ({
      quotation_id: qid, description: it.description, quantity: Number(it.quantity), unit_price: Number(it.unit_price),
      amount: Number(it.quantity) * Number(it.unit_price), sort_order: i,
    })));
    toast.success(editing ? "Updated" : "Quotation created");
    setEditing(null); setForm(emptyForm); setShowForm(false); load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete?")) return;
    await db.from("quotations").delete().eq("id", id); load();
  };
  const openEdit = async (q: any) => {
    const { data: qi } = await db.from("quotation_items").select("*").eq("quotation_id", q.id).order("sort_order");
    setEditing(q);
    setForm({ ...emptyForm, ...q, valid_until: q.valid_until ?? "", items: qi && qi.length ? qi.map((i: any) => ({ description: i.description, quantity: i.quantity, unit_price: i.unit_price })) : [{ ...emptyItem }] });
    setShowForm(true);
  };
  const openView = async (q: any) => {
    const { data: qi } = await db.from("quotation_items").select("*").eq("quotation_id", q.id).order("sort_order");
    setViewing({ ...q, items: qi ?? [] });
  };
  const convertToOrder = async (q: any) => {
    if (!confirm("Convert this quotation to an order?")) return;
    const { data: order, error } = await db.from("orders").insert({
      customer_name: q.client_name, customer_email: q.client_email ?? "", customer_phone: q.client_phone,
      product_title: q.subject || `Quote ${q.quote_number}`, amount: q.total, currency: q.currency, status: "pending",
    }).select().single();
    if (error) return toast.error(error.message);
    await db.from("quotations").update({ status: "converted", converted_order_id: order.id }).eq("id", q.id);
    toast.success("Converted to order");
    load();
  };

  const stats = {
    total: items.length,
    sent: items.filter(i => i.status === "sent").length,
    accepted: items.filter(i => i.status === "accepted" || i.status === "converted").length,
    pipeline: items.filter(i => ["sent", "accepted"].includes(i.status)).reduce((s, i) => s + Number(i.total), 0),
  };

  return (
    <AdminPage>
      <AdminPageHeader
        title="Quotations / Proposals"
        subtitle="Custom quotation builder with order conversion"
        icon={FileText}
        actions={<Button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }}><Plus className="w-4 h-4 mr-2" />New Quote</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total" value={stats.total} icon={FileText} accent="violet" />
        <KpiCard label="Sent" value={stats.sent} icon={FileText} accent="sky" />
        <KpiCard label="Accepted" value={stats.accepted} icon={FileText} accent="emerald" />
        <KpiCard label="Pipeline (BDT)" value={`৳${stats.pipeline.toLocaleString()}`} icon={FileText} accent="amber" />
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-primary/5 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left p-3">Quote #</th>
              <th className="text-left p-3">Client</th>
              <th className="text-left p-3">Subject</th>
              <th className="text-right p-3">Total</th>
              <th className="text-center p-3">Status</th>
              <th className="text-right p-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map(q => (
              <tr key={q.id} className="border-t border-primary/10 hover:bg-primary/5">
                <td className="p-3 font-mono text-xs">{q.quote_number}</td>
                <td className="p-3">{q.client_name}</td>
                <td className="p-3 text-xs">{q.subject}</td>
                <td className="p-3 text-right font-semibold">৳{Number(q.total).toLocaleString()}</td>
                <td className="p-3 text-center"><span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_COLOR[q.status]}`}>{q.status}</span></td>
                <td className="p-3 text-right">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openView(q)}><Eye className="w-3 h-3" /></Button>
                  {q.status !== "converted" && <Button size="icon" variant="ghost" className="h-7 w-7 text-primary" onClick={() => convertToOrder(q)} title="Convert to order"><ArrowRight className="w-3 h-3" /></Button>}
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(q)}><Edit2 className="w-3 h-3" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-400" onClick={() => del(q.id)}><Trash2 className="w-3 h-3" /></Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No quotations yet</td></tr>}
          </tbody>
        </table>
      </GlassCard>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Quotation" : "New Quotation"}</DialogTitle></DialogHeader>
          <div className="grid md:grid-cols-2 gap-3">
            <Input placeholder="Client name *" value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} />
            <Input placeholder="Company" value={form.client_company} onChange={e => setForm({ ...form, client_company: e.target.value })} />
            <Input placeholder="Email" value={form.client_email} onChange={e => setForm({ ...form, client_email: e.target.value })} />
            <Input placeholder="Phone" value={form.client_phone} onChange={e => setForm({ ...form, client_phone: e.target.value })} />
            <Input className="md:col-span-2" placeholder="Subject (e.g. Website Development Proposal)" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
            <Input type="date" value={form.issue_date} onChange={e => setForm({ ...form, issue_date: e.target.value })} />
            <Input type="date" placeholder="Valid until" value={form.valid_until} onChange={e => setForm({ ...form, valid_until: e.target.value })} />
            <select className="bg-background border border-input rounded-md px-3 py-2 text-sm md:col-span-2" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              {STATUS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Items</h4>
            {form.items.map((it: any, idx: number) => (
              <div key={idx} className="grid grid-cols-12 gap-2 mb-2">
                <Input className="col-span-6" placeholder="Description" value={it.description} onChange={e => { const n = [...form.items]; n[idx].description = e.target.value; setForm({ ...form, items: n }); }} />
                <Input className="col-span-2" type="number" placeholder="Qty" value={it.quantity} onChange={e => { const n = [...form.items]; n[idx].quantity = e.target.value; setForm({ ...form, items: n }); }} />
                <Input className="col-span-3" type="number" placeholder="Price" value={it.unit_price} onChange={e => { const n = [...form.items]; n[idx].unit_price = e.target.value; setForm({ ...form, items: n }); }} />
                <Button variant="outline" size="icon" className="col-span-1 text-rose-400" onClick={() => setForm({ ...form, items: form.items.filter((_: any, i: number) => i !== idx) })}><X className="w-3 h-3" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setForm({ ...form, items: [...form.items, { ...emptyItem }] })}><Plus className="w-3 h-3 mr-1" />Add</Button>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <Input type="number" placeholder="Tax %" value={form.tax_rate} onChange={e => setForm({ ...form, tax_rate: e.target.value })} />
            <Input type="number" placeholder="Discount" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} />
            <div className="text-right text-sm self-center font-bold">Total: ৳{totals().total.toLocaleString()}</div>
          </div>
          <Textarea className="mt-2" placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <Textarea className="mt-2" placeholder="Terms" value={form.terms} onChange={e => setForm({ ...form, terms: e.target.value })} />
          <Button className="mt-3 w-full" onClick={save}><Save className="w-4 h-4 mr-2" />{editing ? "Update" : "Create"}</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewing} onOpenChange={o => !o && setViewing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Quotation {viewing?.quote_number}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="bg-white text-black p-6 rounded">
              <div className="flex justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Shahed IT</h2>
                  <p className="text-xs">Sopura, Rajshahi · 01820-060046</p>
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-lg">QUOTATION</h3>
                  <p className="text-xs">#{viewing.quote_number}</p>
                  <p className="text-xs">{viewing.issue_date}</p>
                  {viewing.valid_until && <p className="text-xs">Valid: {viewing.valid_until}</p>}
                </div>
              </div>
              <div className="mb-3 border-t border-b py-2">
                <p className="text-xs text-gray-500">For:</p>
                <p className="font-semibold">{viewing.client_name}{viewing.client_company && ` — ${viewing.client_company}`}</p>
                {viewing.subject && <p className="text-sm mt-1 font-medium">Re: {viewing.subject}</p>}
              </div>
              <table className="w-full text-xs mb-4">
                <thead><tr className="border-b"><th className="text-left p-1">Item</th><th className="text-right p-1">Qty</th><th className="text-right p-1">Price</th><th className="text-right p-1">Amount</th></tr></thead>
                <tbody>{viewing.items?.map((it: any) => (<tr key={it.id} className="border-b"><td className="p-1">{it.description}</td><td className="text-right p-1">{it.quantity}</td><td className="text-right p-1">৳{Number(it.unit_price).toLocaleString()}</td><td className="text-right p-1">৳{Number(it.amount).toLocaleString()}</td></tr>))}</tbody>
              </table>
              <div className="text-right text-xs space-y-1">
                <p>Subtotal: ৳{Number(viewing.subtotal).toLocaleString()}</p>
                {viewing.tax_rate > 0 && <p>Tax: ৳{Number(viewing.tax_amount).toLocaleString()}</p>}
                {viewing.discount > 0 && <p>Discount: -৳{Number(viewing.discount).toLocaleString()}</p>}
                <p className="text-lg font-bold border-t pt-1">Total: ৳{Number(viewing.total).toLocaleString()}</p>
              </div>
              {viewing.terms && <p className="text-xs mt-3"><strong>Terms:</strong> {viewing.terms}</p>}
              {viewing.notes && <p className="text-xs mt-2"><strong>Notes:</strong> {viewing.notes}</p>}
            </div>
          )}
          <Button onClick={() => window.print()} className="mt-2"><Download className="w-4 h-4 mr-2" />Print / Save PDF</Button>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}
