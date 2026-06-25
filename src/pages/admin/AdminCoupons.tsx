import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage, AdminPageHeader, GlassCard } from "@/components/admin/ui";
import { Tag, Plus, Trash2, Edit2, Save, Copy, Truck, Percent, Banknote, UserCheck, Sparkles, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Coupon = any;

const emptyForm = {
  code: "", description: "",
  discount_type: "percent" as "percent" | "flat" | "free_shipping",
  discount_value: 10,
  min_order_amount: 0,
  max_uses: null as number | null,
  per_user_limit: null as number | null,
  max_discount_amount: null as number | null,
  valid_from: "",
  valid_until: "",
  is_active: true,
  first_order_only: false,
  free_shipping: false,
  user_email: "",
  user_id: "" as string,
};

export default function AdminCoupons() {
  const [items, setItems] = useState<Coupon[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);

  const load = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
    const { data: r } = await (supabase as any).from("coupon_redemptions").select("*, coupons(code)").order("created_at", { ascending: false }).limit(200);
    setRedemptions(r ?? []);
  };
  useEffect(() => { load(); }, []);

  const reset = () => { setEditing(null); setForm(emptyForm); };

  const save = async () => {
    if (!form.code.trim()) return toast.error("Code দিন");
    const payload: any = {
      code: form.code.toUpperCase().trim(),
      description: form.description || null,
      discount_type: form.discount_type,
      discount_value: form.discount_type === "free_shipping" ? 0 : Number(form.discount_value),
      min_order_amount: Number(form.min_order_amount) || 0,
      max_uses: form.max_uses || null,
      per_user_limit: form.per_user_limit || null,
      max_discount_amount: form.max_discount_amount || null,
      valid_from: form.valid_from || null,
      valid_until: form.valid_until || null,
      is_active: form.is_active,
      first_order_only: form.first_order_only,
      free_shipping: form.free_shipping || form.discount_type === "free_shipping",
      user_email: form.user_email.trim() || null,
      user_id: form.user_id.trim() || null,
    };
    const q = editing
      ? supabase.from("coupons").update(payload).eq("id", editing.id)
      : supabase.from("coupons").insert(payload);
    const { error } = await q;
    if (error) return toast.error(error.message);
    toast.success(editing ? "Updated" : "Coupon created");
    reset();
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    await supabase.from("coupons").delete().eq("id", id);
    load();
  };

  const copy = (code: string) => { navigator.clipboard.writeText(code); toast.success("Copied"); };

  const startEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code, description: c.description ?? "",
      discount_type: c.discount_type, discount_value: c.discount_value,
      min_order_amount: c.min_order_amount ?? 0,
      max_uses: c.max_uses, per_user_limit: c.per_user_limit,
      max_discount_amount: c.max_discount_amount,
      valid_from: c.valid_from ? c.valid_from.slice(0, 16) : "",
      valid_until: c.valid_until ? c.valid_until.slice(0, 16) : "",
      is_active: c.is_active,
      first_order_only: !!c.first_order_only,
      free_shipping: !!c.free_shipping,
      user_email: c.user_email ?? "",
      user_id: c.user_id ?? "",
    });
  };

  const typeIcon = (t: string) => t === "percent" ? <Percent className="w-3 h-3" /> : t === "flat" ? <Banknote className="w-3 h-3" /> : <Truck className="w-3 h-3" />;
  const typeLabel = (c: Coupon) => c.discount_type === "percent" ? `${c.discount_value}% OFF` : c.discount_type === "flat" ? `৳${c.discount_value} OFF` : "FREE SHIPPING";

  const stats = {
    total: items.length,
    active: items.filter(c => c.is_active).length,
    expired: items.filter(c => c.valid_until && new Date(c.valid_until) < new Date()).length,
    redemptions: redemptions.length,
  };

  return (
    <AdminPage>
      <AdminPageHeader title="Coupon System" subtitle="Fixed / Percent / Free-shipping · First-order · Expiry · Usage Limits · User-Specific" icon={Tag} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Coupons", value: stats.total, color: "text-amber-100" },
          { label: "Active", value: stats.active, color: "text-emerald-400" },
          { label: "Expired", value: stats.expired, color: "text-rose-400" },
          { label: "Redemptions", value: stats.redemptions, color: "text-violet-400" },
        ].map(s => (
          <GlassCard key={s.label} className="p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </GlassCard>
        ))}
      </div>

      <Tabs defaultValue="manage" className="w-full">
        <TabsList>
          <TabsTrigger value="manage" className="gap-1.5"><Tag size={14} />Manage</TabsTrigger>
          <TabsTrigger value="redemptions" className="gap-1.5"><History size={14} />Redemption History</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6 mt-4">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-amber-100">{editing ? `Edit: ${editing.code}` : "Create Coupon"}</h3>
              {editing && <Button size="sm" variant="ghost" onClick={reset}>Cancel</Button>}
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <Input placeholder="CODE (e.g., SAVE20)" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
              <select className="bg-background border border-input rounded-md px-3 h-10 text-sm" value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value as any })}>
                <option value="percent">Percentage Discount (%)</option>
                <option value="flat">Fixed Discount (৳)</option>
                <option value="free_shipping">Free Shipping</option>
              </select>

              {form.discount_type !== "free_shipping" && (
                <Input type="number" placeholder={form.discount_type === "percent" ? "Discount %" : "Discount amount (৳)"}
                  value={form.discount_value} onChange={e => setForm({ ...form, discount_value: Number(e.target.value) })} />
              )}
              {form.discount_type === "percent" && (
                <Input type="number" placeholder="Max discount cap ৳ (optional)" value={form.max_discount_amount ?? ""}
                  onChange={e => setForm({ ...form, max_discount_amount: e.target.value ? Number(e.target.value) : null })} />
              )}

              <Input type="number" placeholder="Minimum order (৳)" value={form.min_order_amount}
                onChange={e => setForm({ ...form, min_order_amount: Number(e.target.value) })} />
              <Input type="number" placeholder="Total usage limit (blank = ∞)" value={form.max_uses ?? ""}
                onChange={e => setForm({ ...form, max_uses: e.target.value ? Number(e.target.value) : null })} />

              <Input type="number" placeholder="Per-user usage limit (blank = ∞)" value={form.per_user_limit ?? ""}
                onChange={e => setForm({ ...form, per_user_limit: e.target.value ? Number(e.target.value) : null })} />
              <div className="hidden md:block" />

              <div>
                <label className="text-[11px] text-muted-foreground">Valid from</label>
                <Input type="datetime-local" value={form.valid_from} onChange={e => setForm({ ...form, valid_from: e.target.value })} />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">Expiry date</label>
                <Input type="datetime-local" value={form.valid_until} onChange={e => setForm({ ...form, valid_until: e.target.value })} />
              </div>

              <Input placeholder="User-specific email (optional)" value={form.user_email}
                onChange={e => setForm({ ...form, user_email: e.target.value })} />
              <Input placeholder="User-specific user_id (optional)" value={form.user_id}
                onChange={e => setForm({ ...form, user_id: e.target.value })} />

              <Textarea className="md:col-span-2" placeholder="Description (shown to customer)" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} />

              <div className="md:col-span-2 grid sm:grid-cols-3 gap-3 p-3 rounded-lg border border-amber-500/10 bg-amber-500/[0.02]">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
                  <span>Active</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <Switch checked={form.first_order_only} onCheckedChange={v => setForm({ ...form, first_order_only: v })} />
                  <span className="flex items-center gap-1"><Sparkles size={12} />First Order Only</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <Switch checked={form.free_shipping} onCheckedChange={v => setForm({ ...form, free_shipping: v })} />
                  <span className="flex items-center gap-1"><Truck size={12} />Include Free Shipping</span>
                </label>
              </div>

              <Button onClick={save} className="md:col-span-2">
                {editing ? <><Save className="w-4 h-4 mr-2" />Update Coupon</> : <><Plus className="w-4 h-4 mr-2" />Create Coupon</>}
              </Button>
            </div>
          </GlassCard>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(c => {
              const expired = c.valid_until && new Date(c.valid_until) < new Date();
              const exhausted = c.max_uses && c.used_count >= c.max_uses;
              return (
                <GlassCard key={c.id} hover className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <code className="text-amber-300 font-bold font-mono text-lg">{c.code}</code>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copy(c.code)}><Copy className="w-3 h-3" /></Button>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${!c.is_active ? "bg-slate-500/20 text-slate-400" : expired ? "bg-rose-500/20 text-rose-400" : exhausted ? "bg-orange-500/20 text-orange-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                      {!c.is_active ? "OFF" : expired ? "EXPIRED" : exhausted ? "USED UP" : "ACTIVE"}
                    </span>
                  </div>

                  <p className="text-2xl font-bold text-amber-100 font-syne mb-1 flex items-center gap-2">
                    {typeIcon(c.discount_type)}
                    {typeLabel(c)}
                  </p>
                  {c.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{c.description}</p>}

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {c.first_order_only && <Badge variant="outline" className="text-[9px] gap-0.5 border-violet-500/30 text-violet-300"><Sparkles size={9} />1st order</Badge>}
                    {c.free_shipping && c.discount_type !== "free_shipping" && <Badge variant="outline" className="text-[9px] gap-0.5 border-sky-500/30 text-sky-300"><Truck size={9} />+Free ship</Badge>}
                    {(c.user_email || c.user_id) && <Badge variant="outline" className="text-[9px] gap-0.5 border-amber-500/30 text-amber-300"><UserCheck size={9} />User-specific</Badge>}
                    {c.per_user_limit && <Badge variant="outline" className="text-[9px] border-slate-500/30">Max {c.per_user_limit}/user</Badge>}
                    {c.max_discount_amount && <Badge variant="outline" className="text-[9px] border-slate-500/30">Cap ৳{c.max_discount_amount}</Badge>}
                  </div>

                  <div className="flex flex-wrap gap-2 text-[10px] text-amber-300/70 mb-3">
                    {c.min_order_amount > 0 && <span>Min ৳{c.min_order_amount}</span>}
                    <span>{c.used_count}{c.max_uses ? `/${c.max_uses}` : ""} used</span>
                    {c.valid_until && <span>Until {new Date(c.valid_until).toLocaleDateString()}</span>}
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => startEdit(c)}>
                      <Edit2 className="w-3 h-3 mr-1" />Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => del(c.id)} className="text-rose-400 border-rose-400/30">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </GlassCard>
              );
            })}
            {items.length === 0 && <p className="text-muted-foreground text-sm col-span-3 text-center py-8">No coupons yet</p>}
          </div>
        </TabsContent>

        <TabsContent value="redemptions" className="mt-4">
          <GlassCard className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-muted-foreground uppercase text-[10px]">
                  <tr className="border-b border-amber-500/10">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Code</th>
                    <th className="text-left p-2">Customer</th>
                    <th className="text-right p-2">Order ৳</th>
                    <th className="text-right p-2">Discount ৳</th>
                    <th className="text-left p-2">Order</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptions.length === 0 ? (
                    <tr><td colSpan={6} className="text-center p-6 text-muted-foreground">No redemptions yet</td></tr>
                  ) : redemptions.map(r => (
                    <tr key={r.id} className="border-b border-amber-500/5 hover:bg-amber-500/5">
                      <td className="p-2 text-muted-foreground">{new Date(r.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</td>
                      <td className="p-2"><code className="text-amber-300 font-mono">{r.coupons?.code ?? "—"}</code></td>
                      <td className="p-2">{r.user_email || r.user_id?.slice(0, 8) || "—"}</td>
                      <td className="p-2 text-right">৳{Number(r.order_amount).toLocaleString("en-IN")}</td>
                      <td className="p-2 text-right text-emerald-400 font-semibold">−৳{Number(r.discount_amount).toLocaleString("en-IN")}</td>
                      <td className="p-2 font-mono text-[10px] text-muted-foreground">{r.order_id?.slice(0, 8) ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </AdminPage>
  );
}
