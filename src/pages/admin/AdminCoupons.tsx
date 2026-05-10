import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage, AdminPageHeader, GlassCard } from "@/components/admin/ui";
import { Tag, Plus, Trash2, Edit2, Save, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function AdminCoupons() {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({
    code: "", description: "", discount_type: "percent", discount_value: 10,
    min_order_amount: 0, max_uses: null, valid_until: "", is_active: true,
  });

  const load = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.code) return toast.error("Code দিন");
    const payload = { ...form, code: form.code.toUpperCase().trim(), valid_until: form.valid_until || null, max_uses: form.max_uses || null };
    if (editing) {
      const { error } = await supabase.from("coupons").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Updated");
    } else {
      const { error } = await supabase.from("coupons").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Coupon created");
    }
    setEditing(null);
    setForm({ code: "", description: "", discount_type: "percent", discount_value: 10, min_order_amount: 0, max_uses: null, valid_until: "", is_active: true });
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    await supabase.from("coupons").delete().eq("id", id);
    load();
  };

  const copy = (code: string) => { navigator.clipboard.writeText(code); toast.success("Copied"); };

  return (
    <AdminPage>
      <AdminPageHeader title="Coupons & Discount Codes" subtitle="Promo codes তৈরি ও manage করুন" icon={Tag} />

      <GlassCard className="p-5 mb-6">
        <h3 className="text-sm font-semibold text-amber-100 mb-3">{editing ? "Edit Coupon" : "Create Coupon"}</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <Input placeholder="CODE (e.g., SAVE20)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          <select className="bg-background border border-input rounded-md px-3 text-sm" value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}>
            <option value="percent">Percent (%)</option>
            <option value="flat">Flat (BDT)</option>
          </select>
          <Input type="number" placeholder="Discount value" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} />
          <Input type="number" placeholder="Min order amount" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: Number(e.target.value) })} />
          <Input type="number" placeholder="Max uses (blank = unlimited)" value={form.max_uses ?? ""} onChange={(e) => setForm({ ...form, max_uses: e.target.value ? Number(e.target.value) : null })} />
          <Input type="datetime-local" placeholder="Valid until" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} />
          <Textarea className="md:col-span-2" placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><span className="text-xs">Active</span></div>
          <Button onClick={save}>{editing ? <><Save className="w-4 h-4 mr-2" />Update</> : <><Plus className="w-4 h-4 mr-2" />Create</>}</Button>
        </div>
      </GlassCard>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((c) => (
          <GlassCard key={c.id} hover className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <code className="text-amber-300 font-bold font-mono text-lg">{c.code}</code>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copy(c.code)}><Copy className="w-3 h-3" /></Button>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                {c.is_active ? "ACTIVE" : "OFF"}
              </span>
            </div>
            <p className="text-2xl font-bold text-amber-100 font-syne mb-1">
              {c.discount_type === "percent" ? `${c.discount_value}% OFF` : `৳${c.discount_value} OFF`}
            </p>
            {c.description && <p className="text-xs text-muted-foreground mb-2">{c.description}</p>}
            <div className="flex flex-wrap gap-2 text-[10px] text-amber-300/70 mb-3">
              {c.min_order_amount > 0 && <span>Min ৳{c.min_order_amount}</span>}
              {c.max_uses && <span>{c.used_count}/{c.max_uses} used</span>}
              {c.valid_until && <span>Until {new Date(c.valid_until).toLocaleDateString()}</span>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditing(c); setForm({ code: c.code, description: c.description ?? "", discount_type: c.discount_type, discount_value: c.discount_value, min_order_amount: c.min_order_amount ?? 0, max_uses: c.max_uses, valid_until: c.valid_until ? c.valid_until.slice(0, 16) : "", is_active: c.is_active }); }}>
                <Edit2 className="w-3 h-3 mr-1" />Edit
              </Button>
              <Button size="sm" variant="outline" onClick={() => del(c.id)} className="text-rose-400 border-rose-400/30">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </GlassCard>
        ))}
        {items.length === 0 && <p className="text-muted-foreground text-sm col-span-3 text-center py-8">No coupons yet</p>}
      </div>
    </AdminPage>
  );
}
