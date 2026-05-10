import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage, AdminPageHeader, GlassCard } from "@/components/admin/ui";
import { Mail, Send, Plus, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AdminEmailCampaigns() {
  const [items, setItems] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [previewing, setPreviewing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", subject: "", body_html: "", audience: "leads" as "leads" | "clients" | "custom", custom_emails: "" });
  const [audienceCount, setAudienceCount] = useState(0);

  const load = async () => {
    const { data } = await supabase.from("email_campaigns").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    (async () => {
      if (form.audience === "leads") {
        const { count } = await supabase.from("leads").select("*", { count: "exact", head: true });
        setAudienceCount(count ?? 0);
      } else if (form.audience === "clients") {
        const { count } = await supabase.from("orders").select("customer_email", { count: "exact", head: true });
        setAudienceCount(count ?? 0);
      } else {
        setAudienceCount(form.custom_emails.split(",").map(s => s.trim()).filter(Boolean).length);
      }
    })();
  }, [form.audience, form.custom_emails]);

  const saveDraft = async () => {
    if (!form.name || !form.subject) return toast.error("Name & Subject দিন");
    const payload = {
      name: form.name, subject: form.subject, body_html: form.body_html,
      audience: form.audience,
      custom_emails: form.audience === "custom" ? form.custom_emails.split(",").map(s => s.trim()).filter(Boolean) : null,
      status: "draft",
    };
    const { error } = await supabase.from("email_campaigns").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Draft saved");
    setCreating(false);
    setForm({ name: "", subject: "", body_html: "", audience: "leads", custom_emails: "" });
    load();
  };

  const markSent = async (id: string) => {
    // Note: actual email delivery would be wired via edge function. We mark for tracking.
    if (!confirm("Mark this campaign as sent? (Email delivery requires Lovable Email/Resend setup)")) return;
    await supabase.from("email_campaigns").update({ status: "sent", sent_at: new Date().toISOString(), recipients_count: audienceCount }).eq("id", id);
    toast.success("Marked as sent");
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("email_campaigns").delete().eq("id", id);
    load();
  };

  return (
    <AdminPage>
      <AdminPageHeader
        title="Email Campaigns"
        subtitle="Leads ও clients দের কাছে bulk email পাঠান"
        icon={Mail}
        actions={<Button onClick={() => setCreating(true)}><Plus className="w-4 h-4 mr-2" />New Campaign</Button>}
      />

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Create Campaign</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Campaign name (internal)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Email subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <select className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value as any })}>
              <option value="leads">All Leads ({audienceCount})</option>
              <option value="clients">All Customers ({audienceCount})</option>
              <option value="custom">Custom emails</option>
            </select>
            {form.audience === "custom" && (
              <Textarea placeholder="email1@example.com, email2@example.com" value={form.custom_emails} onChange={(e) => setForm({ ...form, custom_emails: e.target.value })} />
            )}
            <Textarea rows={10} placeholder="HTML email body..." value={form.body_html} onChange={(e) => setForm({ ...form, body_html: e.target.value })} />
            <p className="text-xs text-muted-foreground">Recipients: <strong>{audienceCount}</strong></p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
              <Button onClick={saveDraft}><Send className="w-4 h-4 mr-2" />Save Draft</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewing} onOpenChange={(o) => !o && setPreviewing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{previewing?.subject}</DialogTitle></DialogHeader>
          <div className="border border-amber-400/20 rounded-lg p-4 bg-white text-black max-h-[500px] overflow-y-auto" dangerouslySetInnerHTML={{ __html: previewing?.body_html ?? "" }} />
        </DialogContent>
      </Dialog>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((c) => (
          <GlassCard key={c.id} hover className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-amber-100">{c.name}</h4>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.status === "sent" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                {c.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{c.subject}</p>
            <div className="text-[10px] text-amber-300/70 mb-3 space-y-0.5">
              <p>Audience: {c.audience}</p>
              {c.sent_at && <p>Sent: {new Date(c.sent_at).toLocaleDateString()} · {c.recipients_count} recipients</p>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => setPreviewing(c)}><Eye className="w-3 h-3 mr-1" />Preview</Button>
              {c.status !== "sent" && <Button size="sm" onClick={() => markSent(c.id)}><Send className="w-3 h-3" /></Button>}
              <Button size="sm" variant="outline" onClick={() => del(c.id)} className="text-rose-400 border-rose-400/30"><Trash2 className="w-3 h-3" /></Button>
            </div>
          </GlassCard>
        ))}
        {items.length === 0 && <p className="text-muted-foreground text-sm col-span-3 text-center py-8">No campaigns yet</p>}
      </div>
    </AdminPage>
  );
}
