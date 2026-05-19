import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage, AdminPageHeader, GlassCard } from "@/components/admin/ui";
import { Package, Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const db = supabase as any;
const emptyItem = { description: "", quantity: 1, unit_price: 0 };
const empty = {
  customer_name: "", customer_email: "", customer_phone: "", product_title: "",
  amount: 0, payment_method: "manual", status: "pending", delivery_days: 7, admin_notes: "",
  items: [{ ...emptyItem }],
};

export default function AdminCustomOrder() {
  const [form, setForm] = useState<any>(empty);

  const lineTotal = () => form.items.reduce((s: number, it: any) => s + Number(it.quantity || 0) * Number(it.unit_price || 0), 0);

  const create = async () => {
    if (!form.customer_name || !form.customer_email) return toast.error("Customer name & email required");
    const total = Number(form.amount) > 0 ? Number(form.amount) : lineTotal();
    if (total <= 0) return toast.error("Amount must be > 0");
    const breakdown = form.items.filter((i: any) => i.description).map((i: any) => `• ${i.description} × ${i.quantity} @ ৳${i.unit_price} = ৳${Number(i.quantity) * Number(i.unit_price)}`).join("\n");
    const notes = [form.admin_notes, breakdown && `\n— Items —\n${breakdown}`].filter(Boolean).join("\n");
    const { error } = await db.from("orders").insert({
      customer_name: form.customer_name, customer_email: form.customer_email, customer_phone: form.customer_phone,
      product_title: form.product_title || "Custom Order", amount: total, currency: "BDT",
      payment_method: form.payment_method, status: form.status, delivery_days: Number(form.delivery_days) || 7,
      admin_notes: notes,
    });
    if (error) return toast.error(error.message);
    toast.success("✅ Custom order created");
    setForm(empty);
  };

  return (
    <AdminPage>
      <AdminPageHeader title="Custom Order Generator" subtitle="Admin-side manual order তৈরি করুন" icon={Package} />

      <GlassCard className="p-6 max-w-3xl">
        <h3 className="text-sm font-semibold mb-3">Customer Info</h3>
        <div className="grid md:grid-cols-2 gap-3 mb-4">
          <Input placeholder="Customer name *" value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} />
          <Input placeholder="Customer email *" value={form.customer_email} onChange={e => setForm({ ...form, customer_email: e.target.value })} />
          <Input placeholder="Customer phone" value={form.customer_phone} onChange={e => setForm({ ...form, customer_phone: e.target.value })} />
          <Input placeholder="Product/Service title" value={form.product_title} onChange={e => setForm({ ...form, product_title: e.target.value })} />
        </div>

        <h3 className="text-sm font-semibold mb-2">Items (optional — for receipt breakdown)</h3>
        {form.items.map((it: any, idx: number) => (
          <div key={idx} className="grid grid-cols-12 gap-2 mb-2">
            <Input className="col-span-6" placeholder="Item description" value={it.description} onChange={e => { const n = [...form.items]; n[idx].description = e.target.value; setForm({ ...form, items: n }); }} />
            <Input className="col-span-2" type="number" placeholder="Qty" value={it.quantity} onChange={e => { const n = [...form.items]; n[idx].quantity = e.target.value; setForm({ ...form, items: n }); }} />
            <Input className="col-span-3" type="number" placeholder="Unit price" value={it.unit_price} onChange={e => { const n = [...form.items]; n[idx].unit_price = e.target.value; setForm({ ...form, items: n }); }} />
            <Button variant="outline" size="icon" className="col-span-1 text-rose-400" onClick={() => setForm({ ...form, items: form.items.filter((_: any, i: number) => i !== idx) })}><X className="w-3 h-3" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setForm({ ...form, items: [...form.items, { ...emptyItem }] })}><Plus className="w-3 h-3 mr-1" />Add Item</Button>

        <p className="text-xs text-muted-foreground mt-3">Items total: ৳{lineTotal().toLocaleString()}</p>

        <div className="grid md:grid-cols-3 gap-3 mt-4">
          <Input type="number" placeholder="Final amount (override)" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          <select className="bg-background border border-input rounded-md px-3 text-sm" value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value })}>
            <option value="manual">Manual</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="rocket">Rocket</option>
            <option value="bank">Bank Transfer</option>
            <option value="cash">Cash</option>
          </select>
          <select className="bg-background border border-input rounded-md px-3 text-sm" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Input type="number" placeholder="Delivery days" value={form.delivery_days} onChange={e => setForm({ ...form, delivery_days: e.target.value })} />
        </div>

        <Textarea className="mt-3" placeholder="Admin notes (visible in orders)" value={form.admin_notes} onChange={e => setForm({ ...form, admin_notes: e.target.value })} />

        <Button className="mt-4 w-full" onClick={create}><Save className="w-4 h-4 mr-2" />Create Custom Order</Button>
      </GlassCard>
    </AdminPage>
  );
}
