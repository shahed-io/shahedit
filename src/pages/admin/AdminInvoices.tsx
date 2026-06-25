import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage, AdminPageHeader, GlassCard, KpiCard } from "@/components/admin/ui";
import { FileText, Plus, Trash2, Edit2, Save, Eye, Download, X, DollarSign, Check, Mail, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";
import { BRAND } from "@/lib/brand";

const db = supabase as any;
const STATUS = ["draft", "sent", "paid", "overdue", "cancelled"];
const STATUS_COLOR: Record<string, string> = {
  draft: "bg-slate-500/20 text-slate-300",
  sent: "bg-sky-500/20 text-sky-300",
  paid: "bg-emerald-500/20 text-emerald-300",
  overdue: "bg-rose-500/20 text-rose-300",
  cancelled: "bg-slate-500/20 text-slate-400",
};
const SETTINGS_KEY = "invoice_logo_url";

const emptyItem = { description: "", quantity: 1, unit_price: 0 };
const emptyForm = {
  client_name: "", client_email: "", client_phone: "", client_address: "",
  issue_date: new Date().toISOString().slice(0, 10), due_date: "",
  tax_rate: 0, discount: 0, status: "draft", notes: "", terms: "Payment within 7 days",
  items: [{ ...emptyItem }],
};

export default function AdminInvoices() {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [viewing, setViewing] = useState<any | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>(BRAND.logoUrl);
  const [showLogoEditor, setShowLogoEditor] = useState(false);
  const [logoDraft, setLogoDraft] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const { data } = await db.from("invoices").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  const loadLogo = async () => {
    const { data } = await db.from("site_settings").select("value").eq("key", SETTINGS_KEY).maybeSingle();
    if (data?.value) setLogoUrl(data.value);
  };
  useEffect(() => { load(); loadLogo(); }, []);

  const saveLogo = async () => {
    const url = logoDraft.trim() || BRAND.logoUrl;
    const { data: existing } = await db.from("site_settings").select("id").eq("key", SETTINGS_KEY).maybeSingle();
    if (existing) {
      await db.from("site_settings").update({ value: url }).eq("key", SETTINGS_KEY);
    } else {
      await db.from("site_settings").insert({ key: SETTINGS_KEY, value: url, type: "text", group_name: "invoices", label: "Invoice Logo URL" });
    }
    setLogoUrl(url);
    setShowLogoEditor(false);
    toast.success("Logo updated");
  };

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
      client_name: form.client_name, client_email: form.client_email, client_phone: form.client_phone, client_address: form.client_address,
      issue_date: form.issue_date, due_date: form.due_date || null,
      tax_rate: Number(form.tax_rate) || 0, discount: Number(form.discount) || 0,
      subtotal, tax_amount, total, status: form.status, notes: form.notes, terms: form.terms,
    };
    if (editing) {
      const { error } = await db.from("invoices").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
      await db.from("invoice_items").delete().eq("invoice_id", editing.id);
      await db.from("invoice_items").insert(form.items.map((it: any, i: number) => ({
        invoice_id: editing.id, description: it.description, quantity: Number(it.quantity), unit_price: Number(it.unit_price),
        amount: Number(it.quantity) * Number(it.unit_price), sort_order: i,
      })));
      toast.success("Invoice updated");
    } else {
      const { data, error } = await db.from("invoices").insert(payload).select().single();
      if (error) return toast.error(error.message);
      await db.from("invoice_items").insert(form.items.map((it: any, i: number) => ({
        invoice_id: data.id, description: it.description, quantity: Number(it.quantity), unit_price: Number(it.unit_price),
        amount: Number(it.quantity) * Number(it.unit_price), sort_order: i,
      })));
      toast.success(`Invoice ${data.invoice_number} created`);
    }
    setEditing(null); setForm(emptyForm); setShowForm(false); load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    await db.from("invoices").delete().eq("id", id); load();
  };
  const markPaid = async (id: string) => {
    await db.from("invoices").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", id);
    load();
  };
  const openEdit = async (inv: any) => {
    const { data: lineItems } = await db.from("invoice_items").select("*").eq("invoice_id", inv.id).order("sort_order");
    setEditing(inv);
    setForm({
      ...emptyForm, ...inv,
      issue_date: inv.issue_date, due_date: inv.due_date ?? "",
      items: lineItems && lineItems.length ? lineItems.map((i: any) => ({ description: i.description, quantity: i.quantity, unit_price: i.unit_price })) : [{ ...emptyItem }],
    });
    setShowForm(true);
  };
  const openView = async (inv: any) => {
    const { data: lineItems } = await db.from("invoice_items").select("*").eq("invoice_id", inv.id).order("sort_order");
    setViewing({ ...inv, items: lineItems ?? [] });
  };

  const downloadPdf = async () => {
    if (!invoiceRef.current || !viewing) return;
    setDownloadingPdf(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(invoiceRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW;
      const imgH = (canvas.height * imgW) / canvas.width;
      let heightLeft = imgH;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgW, imgH);
      heightLeft -= pageH;
      while (heightLeft > 0) {
        position = heightLeft - imgH;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgW, imgH);
        heightLeft -= pageH;
      }
      pdf.save(`${viewing.invoice_number}.pdf`);
      toast.success("PDF downloaded");
    } catch (e: any) {
      toast.error(e.message || "PDF failed");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const sendEmail = async (inv: any) => {
    if (!inv.client_email) return toast.error("Client email missing");
    setSendingId(inv.id);
    try {
      const { error } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "invoice-email",
          recipientEmail: inv.client_email,
          templateData: {
            name: inv.client_name,
            invoiceNumber: inv.invoice_number,
            amount: Number(inv.total).toLocaleString(),
            dueDate: inv.due_date || inv.issue_date,
            invoiceUrl: `${window.location.origin}/dashboard?tab=invoices&id=${inv.id}`,
          },
        },
      });
      if (error) throw error;
      if (inv.status === "draft") {
        await db.from("invoices").update({ status: "sent" }).eq("id", inv.id);
      }
      toast.success(`Invoice emailed to ${inv.client_email}`);
      load();
    } catch (e: any) {
      toast.error(e.message || "Email failed");
    } finally {
      setSendingId(null);
    }
  };

  const stats = {
    total: items.length,
    paid: items.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.total || 0), 0),
    pending: items.filter(i => i.status === "sent").reduce((s, i) => s + Number(i.total || 0), 0),
    overdue: items.filter(i => i.status === "overdue").length,
  };

  const qrPayload = viewing ? JSON.stringify({
    inv: viewing.invoice_number,
    amt: Number(viewing.total),
    cur: viewing.currency || "BDT",
    to: viewing.client_name,
    date: viewing.issue_date,
    url: `${window.location.origin}/dashboard?tab=invoices&id=${viewing.id}`,
  }) : "";

  return (
    <AdminPage>
      <AdminPageHeader
        title="Invoices"
        subtitle="Auto-numbered invoices · PDF · QR · Email · VAT/TAX"
        icon={FileText}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setLogoDraft(logoUrl); setShowLogoEditor(true); }}>
              <ImageIcon className="w-4 h-4 mr-2" />Custom Logo
            </Button>
            <Button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />New Invoice
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Invoices" value={stats.total} icon={FileText} accent="violet" />
        <KpiCard label="Paid (BDT)" value={`৳${stats.paid.toLocaleString()}`} icon={DollarSign} accent="emerald" />
        <KpiCard label="Pending (BDT)" value={`৳${stats.pending.toLocaleString()}`} icon={DollarSign} accent="amber" />
        <KpiCard label="Overdue" value={stats.overdue} icon={FileText} accent="rose" />
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-primary/5 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left p-3">Invoice #</th>
              <th className="text-left p-3">Client</th>
              <th className="text-left p-3">Date</th>
              <th className="text-right p-3">Amount</th>
              <th className="text-center p-3">Status</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(inv => (
              <tr key={inv.id} className="border-t border-primary/10 hover:bg-primary/5">
                <td className="p-3 font-mono text-xs">{inv.invoice_number}</td>
                <td className="p-3">{inv.client_name}</td>
                <td className="p-3 text-xs text-muted-foreground">{inv.issue_date}</td>
                <td className="p-3 text-right font-semibold">৳{Number(inv.total).toLocaleString()}</td>
                <td className="p-3 text-center"><span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_COLOR[inv.status]}`}>{inv.status}</span></td>
                <td className="p-3 text-right whitespace-nowrap">
                  <Button size="icon" variant="ghost" className="h-7 w-7" title="View" onClick={() => openView(inv)}><Eye className="w-3 h-3" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-sky-400" title="Email invoice" disabled={sendingId === inv.id} onClick={() => sendEmail(inv)}>
                    {sendingId === inv.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                  </Button>
                  {inv.status !== "paid" && <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-400" title="Mark paid" onClick={() => markPaid(inv.id)}><Check className="w-3 h-3" /></Button>}
                  <Button size="icon" variant="ghost" className="h-7 w-7" title="Edit" onClick={() => openEdit(inv)}><Edit2 className="w-3 h-3" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-400" title="Delete" onClick={() => del(inv.id)}><Trash2 className="w-3 h-3" /></Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No invoices yet</td></tr>}
          </tbody>
        </table>
      </GlassCard>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Invoice" : "New Invoice (auto-numbered)"}</DialogTitle></DialogHeader>
          <div className="grid md:grid-cols-2 gap-3">
            <Input placeholder="Client name *" value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} />
            <Input placeholder="Client email" value={form.client_email} onChange={e => setForm({ ...form, client_email: e.target.value })} />
            <Input placeholder="Client phone" value={form.client_phone} onChange={e => setForm({ ...form, client_phone: e.target.value })} />
            <Input type="date" value={form.issue_date} onChange={e => setForm({ ...form, issue_date: e.target.value })} />
            <Input type="date" placeholder="Due date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
            <select className="bg-background border border-input rounded-md px-3 py-2 text-sm" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              {STATUS.map(s => <option key={s}>{s}</option>)}
            </select>
            <Textarea className="md:col-span-2" placeholder="Client address" value={form.client_address} onChange={e => setForm({ ...form, client_address: e.target.value })} />
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Items</h4>
            {form.items.map((it: any, idx: number) => (
              <div key={idx} className="grid grid-cols-12 gap-2 mb-2">
                <Input className="col-span-6" placeholder="Description" value={it.description} onChange={e => { const next = [...form.items]; next[idx].description = e.target.value; setForm({ ...form, items: next }); }} />
                <Input className="col-span-2" type="number" placeholder="Qty" value={it.quantity} onChange={e => { const next = [...form.items]; next[idx].quantity = e.target.value; setForm({ ...form, items: next }); }} />
                <Input className="col-span-3" type="number" placeholder="Unit price" value={it.unit_price} onChange={e => { const next = [...form.items]; next[idx].unit_price = e.target.value; setForm({ ...form, items: next }); }} />
                <Button variant="outline" size="icon" className="col-span-1 text-rose-400" onClick={() => setForm({ ...form, items: form.items.filter((_: any, i: number) => i !== idx) })}><X className="w-3 h-3" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setForm({ ...form, items: [...form.items, { ...emptyItem }] })}><Plus className="w-3 h-3 mr-1" />Add Item</Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
            <div>
              <label className="text-[10px] uppercase text-muted-foreground">VAT / TAX %</label>
              <Input type="number" placeholder="e.g. 15" value={form.tax_rate} onChange={e => setForm({ ...form, tax_rate: e.target.value })} />
            </div>
            <div>
              <label className="text-[10px] uppercase text-muted-foreground">Discount (৳)</label>
              <Input type="number" placeholder="0" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} />
            </div>
            <div className="text-right text-sm self-end font-bold">
              <div className="text-[10px] text-muted-foreground">Subtotal ৳{totals().subtotal.toLocaleString()} · VAT ৳{totals().tax_amount.toLocaleString()}</div>
              Total: ৳{totals().total.toLocaleString()}
            </div>
          </div>
          <Textarea className="mt-2" placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <Textarea className="mt-2" placeholder="Terms" value={form.terms} onChange={e => setForm({ ...form, terms: e.target.value })} />
          <Button className="mt-3 w-full" onClick={save}><Save className="w-4 h-4 mr-2" />{editing ? "Update" : "Create"}</Button>
        </DialogContent>
      </Dialog>

      {/* Logo Editor */}
      <Dialog open={showLogoEditor} onOpenChange={setShowLogoEditor}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Custom Invoice Logo</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">Paste a publicly hosted image URL. Leave empty to use the default Shahed IT logo.</p>
          <Input placeholder="https://example.com/logo.png" value={logoDraft} onChange={e => setLogoDraft(e.target.value)} />
          {(logoDraft || logoUrl) && <img src={logoDraft || logoUrl} alt="Logo preview" className="h-16 object-contain mx-auto bg-white rounded p-2" />}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowLogoEditor(false)}>Cancel</Button>
            <Button onClick={saveLogo}><Save className="w-4 h-4 mr-2" />Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog (printable + PDF) */}
      <Dialog open={!!viewing} onOpenChange={o => !o && setViewing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Invoice {viewing?.invoice_number}</DialogTitle></DialogHeader>
          {viewing && (
            <div ref={invoiceRef} className="bg-white text-black p-6 rounded" id="invoice-print">
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
                  <h3 className="font-bold text-lg">INVOICE</h3>
                  <p className="text-xs">#{viewing.invoice_number}</p>
                  <p className="text-xs">Date: {viewing.issue_date}</p>
                  {viewing.due_date && <p className="text-xs">Due: {viewing.due_date}</p>}
                  <p className="text-[10px] mt-1 px-2 py-0.5 inline-block rounded bg-gray-100 uppercase font-semibold">{viewing.status}</p>
                </div>
              </div>
              <div className="mb-4 border-t border-b py-2">
                <p className="text-xs text-gray-500">Bill To:</p>
                <p className="font-semibold">{viewing.client_name}</p>
                {viewing.client_email && <p className="text-xs">{viewing.client_email}</p>}
                {viewing.client_phone && <p className="text-xs">{viewing.client_phone}</p>}
                {viewing.client_address && <p className="text-xs whitespace-pre-line">{viewing.client_address}</p>}
              </div>
              <table className="w-full text-xs mb-4">
                <thead><tr className="border-b bg-gray-50"><th className="text-left p-1">Item</th><th className="text-right p-1">Qty</th><th className="text-right p-1">Price</th><th className="text-right p-1">Amount</th></tr></thead>
                <tbody>
                  {viewing.items?.map((it: any) => (
                    <tr key={it.id} className="border-b"><td className="p-1">{it.description}</td><td className="text-right p-1">{it.quantity}</td><td className="text-right p-1">৳{Number(it.unit_price).toLocaleString()}</td><td className="text-right p-1">৳{Number(it.amount).toLocaleString()}</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between items-end gap-4">
                <div className="flex flex-col items-center">
                  <div className="bg-white p-1 border rounded">
                    <QRCodeCanvas value={qrPayload} size={96} level="M" includeMargin={false} />
                  </div>
                  <p className="text-[9px] text-gray-500 mt-1">Scan to verify</p>
                </div>
                <div className="text-right text-xs space-y-1">
                  <p>Subtotal: ৳{Number(viewing.subtotal).toLocaleString()}</p>
                  {viewing.tax_rate > 0 && <p>VAT / TAX ({viewing.tax_rate}%): ৳{Number(viewing.tax_amount).toLocaleString()}</p>}
                  {viewing.discount > 0 && <p>Discount: -৳{Number(viewing.discount).toLocaleString()}</p>}
                  <p className="text-lg font-bold border-t pt-1">Total: ৳{Number(viewing.total).toLocaleString()}</p>
                </div>
              </div>
              {viewing.notes && <p className="text-xs mt-4"><strong>Notes:</strong> {viewing.notes}</p>}
              {viewing.terms && <p className="text-xs mt-2"><strong>Terms:</strong> {viewing.terms}</p>}
              <p className="text-[10px] text-gray-400 text-center mt-4 pt-2 border-t">Thank you for your business · {BRAND.website}</p>
            </div>
          )}
          <div className="flex gap-2 mt-2 flex-wrap">
            <Button onClick={downloadPdf} disabled={downloadingPdf}>
              {downloadingPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Download PDF
            </Button>
            <Button variant="outline" onClick={() => window.print()}>Print</Button>
            {viewing?.client_email && (
              <Button variant="outline" disabled={sendingId === viewing.id} onClick={() => sendEmail(viewing)}>
                {sendingId === viewing.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                Email to {viewing.client_email}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}
