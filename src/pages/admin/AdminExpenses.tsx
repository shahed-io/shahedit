import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage, AdminPageHeader, GlassCard, KpiCard } from "@/components/admin/ui";
import { DollarSign, Plus, Trash2, Edit2, Save, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const db = supabase as any;
const CATEGORIES = ["office", "salary", "marketing", "software", "utility", "travel", "other"];

const emptyForm = {
  title: "", category: "office", amount: 0, vendor: "", payment_method: "cash",
  expense_date: new Date().toISOString().slice(0, 10), notes: "", receipt_url: "",
};

export default function AdminExpenses() {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(emptyForm);

  const load = async () => {
    const { data } = await db.from("expenses").select("*").order("expense_date", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title || !form.amount) return toast.error("Title ও Amount দিন");
    const payload = { ...form, amount: Number(form.amount) };
    const { error } = editing
      ? await db.from("expenses").update(payload).eq("id", editing.id)
      : await db.from("expenses").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Updated" : "Expense added");
    setEditing(null); setForm(emptyForm); load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete?")) return;
    await db.from("expenses").delete().eq("id", id); load();
  };

  const thisMonth = items.filter(i => i.expense_date?.startsWith(new Date().toISOString().slice(0, 7)));
  const stats = {
    total: items.reduce((s, i) => s + Number(i.amount), 0),
    month: thisMonth.reduce((s, i) => s + Number(i.amount), 0),
    count: items.length,
  };

  return (
    <AdminPage>
      <AdminPageHeader title="Expense Tracker" subtitle="মাসিক খরচ ট্র্যাক করুন" icon={DollarSign} />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <KpiCard label="This Month" value={`৳${stats.month.toLocaleString()}`} icon={TrendingDown} accent="rose" />
        <KpiCard label="All Time" value={`৳${stats.total.toLocaleString()}`} icon={DollarSign} accent="amber" />
        <KpiCard label="Entries" value={stats.count} icon={DollarSign} accent="violet" />
      </div>

      <GlassCard className="p-5 mb-6">
        <h3 className="text-sm font-semibold mb-3">{editing ? "Edit Expense" : "Add Expense"}</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <Input className="md:col-span-2" placeholder="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Input type="number" placeholder="Amount (BDT) *" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          <select className="bg-background border border-input rounded-md px-3 py-2 text-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <Input placeholder="Vendor" value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} />
          <Input placeholder="Payment method" value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value })} />
          <Input type="date" value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })} />
          <Input placeholder="Receipt URL" value={form.receipt_url} onChange={e => setForm({ ...form, receipt_url: e.target.value })} />
          <Textarea className="md:col-span-3" placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <div className="md:col-span-3 flex gap-2">
            <Button onClick={save}><Save className="w-4 h-4 mr-2" />{editing ? "Update" : "Add"}</Button>
            {editing && <Button variant="outline" onClick={() => { setEditing(null); setForm(emptyForm); }}>Cancel</Button>}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-primary/5 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Vendor</th>
              <th className="text-right p-3">Amount</th>
              <th className="text-right p-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map(e => (
              <tr key={e.id} className="border-t border-primary/10">
                <td className="p-3 text-xs text-muted-foreground">{e.expense_date}</td>
                <td className="p-3">{e.title}</td>
                <td className="p-3"><span className="text-[10px] px-2 py-0.5 rounded bg-primary/10">{e.category}</span></td>
                <td className="p-3 text-xs">{e.vendor}</td>
                <td className="p-3 text-right font-semibold text-rose-400">৳{Number(e.amount).toLocaleString()}</td>
                <td className="p-3 text-right">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditing(e); setForm({ ...emptyForm, ...e }); }}><Edit2 className="w-3 h-3" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-400" onClick={() => del(e.id)}><Trash2 className="w-3 h-3" /></Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No expenses</td></tr>}
          </tbody>
        </table>
      </GlassCard>
    </AdminPage>
  );
}
