import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Mail, Server, FileEdit, ShoppingBag, KeyRound, Send, Save, Eye,
  CheckCircle2, Info, ExternalLink, AlertTriangle, RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Settings = {
  id: number;
  from_name: string;
  from_email: string;
  reply_to: string | null;
  order_confirmation_enabled: boolean;
  order_status_enabled: boolean;
  order_delivery_enabled: boolean;
  password_reset_enabled: boolean;
  welcome_email_enabled: boolean;
  newsletter_enabled: boolean;
};

type Template = {
  id: string;
  template_key: string;
  label: string;
  subject: string;
  body_html: string;
  is_active: boolean;
  description: string | null;
  variables: string[];
};

function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const load = async () => {
    const { data, error } = await supabase.from("email_system_settings").select("*").eq("id", 1).maybeSingle();
    if (error) toast.error(error.message);
    setSettings(data as Settings);
  };
  useEffect(() => { load(); }, []);
  const save = async (patch: Partial<Settings>) => {
    const { error } = await supabase.from("email_system_settings").update(patch as any).eq("id", 1);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    load();
  };
  return { settings, save, reload: load };
}

// ─────────────────── SMTP Tab ───────────────────
function SmtpTab({ settings, save }: { settings: Settings | null; save: (p: Partial<Settings>) => Promise<void> }) {
  const [draft, setDraft] = useState<Settings | null>(settings);
  useEffect(() => setDraft(settings), [settings]);
  if (!draft) return <p className="text-slate-400">Loading…</p>;

  return (
    <Card className="p-5 bg-slate-900/40 border-white/10 space-y-4">
      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 flex gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-emerald-300 font-semibold text-sm">Built-in Email Delivery Active</p>
          <p className="text-emerald-200/80 text-xs mt-1">
            Your project uses Lovable's managed email infrastructure — no SMTP credentials required.
            Configure your sender identity below; templates render automatically via the edge functions.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-400">From Name</label>
          <Input value={draft.from_name || ""} onChange={(e) => setDraft({ ...draft, from_name: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-slate-400">From Email</label>
          <Input value={draft.from_email || ""} onChange={(e) => setDraft({ ...draft, from_email: e.target.value })} placeholder="noreply@shahedit.com" />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-slate-400">Reply-To (optional)</label>
          <Input value={draft.reply_to || ""} onChange={(e) => setDraft({ ...draft, reply_to: e.target.value })} placeholder="support@shahedit.com" />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-slate-400">
        <p className="font-semibold text-slate-200 mb-1 flex items-center gap-2"><Info className="w-4 h-4" /> Delivery method</p>
        <p>Protocol: <span className="text-emerald-400 font-mono">Lovable Email Gateway</span></p>
        <p>Queue: <span className="text-emerald-400 font-mono">pgmq → process-email-queue (cron)</span></p>
        <p>Templates engine: <span className="text-emerald-400 font-mono">React Email + edge functions</span></p>
      </div>

      <Button onClick={() => save({
        from_name: draft.from_name, from_email: draft.from_email, reply_to: draft.reply_to,
      })} className="gap-2"><Save className="w-4 h-4" /> Save Sender</Button>
    </Card>
  );
}

// ─────────────────── Templates Tab ───────────────────
function TemplatesTab() {
  const [list, setList] = useState<Template[]>([]);
  const [active, setActive] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("email_templates").select("*").order("label");
    if (error) toast.error(error.message);
    const arr = (data || []).map((t: any) => ({ ...t, variables: Array.isArray(t.variables) ? t.variables : [] }));
    setList(arr as Template[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!active) return;
    const { error } = await supabase.from("email_templates").update({
      subject: active.subject, body_html: active.body_html, is_active: active.is_active,
      updated_at: new Date().toISOString(),
    } as any).eq("id", active.id);
    if (error) return toast.error(error.message);
    toast.success("Template saved");
    load();
  };

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-4">
      <Card className="p-3 bg-slate-900/40 border-white/10 max-h-[600px] overflow-y-auto">
        {loading && <p className="text-slate-400 text-sm">Loading…</p>}
        {list.map((t) => (
          <button key={t.id} onClick={() => setActive(t)}
            className={`w-full text-left p-3 rounded-lg mb-2 transition-all border ${
              active?.id === t.id
                ? "bg-purple-500/20 border-purple-500/40"
                : "bg-slate-800/40 border-white/5 hover:border-white/20"
            }`}>
            <div className="flex items-center justify-between">
              <p className="text-white font-semibold text-sm">{t.label}</p>
              {t.is_active ? <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px]">ON</Badge>
                : <Badge className="bg-slate-500/20 text-slate-400 text-[10px]">OFF</Badge>}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">{t.template_key}</p>
          </button>
        ))}
      </Card>

      <Card className="p-5 bg-slate-900/40 border-white/10">
        {!active ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">Select a template to edit</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">{active.label}</h3>
                <p className="text-xs text-slate-400">{active.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Active</span>
                <Switch checked={active.is_active} onCheckedChange={(v) => setActive({ ...active, is_active: v })} />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400">Subject</label>
              <Input value={active.subject} onChange={(e) => setActive({ ...active, subject: e.target.value })} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-400">HTML Body</label>
                <p className="text-[11px] text-slate-500">
                  Vars: {active.variables.map(v => <code key={v} className="text-emerald-400 mx-1">{`{{${v}}}`}</code>)}
                </p>
              </div>
              <Textarea rows={12} className="font-mono text-xs"
                value={active.body_html} onChange={(e) => setActive({ ...active, body_html: e.target.value })} />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <Button onClick={save} className="gap-2"><Save className="w-4 h-4" /> Save Template</Button>
              <div className="rounded-lg border border-white/10 bg-black/40 p-3 max-h-[200px] overflow-auto">
                <p className="text-[10px] text-slate-500 mb-1 flex items-center gap-1"><Eye className="w-3 h-3" /> Preview</p>
                <div className="text-xs text-slate-200 prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: active.body_html }} />
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─────────────────── Order Emails Tab ───────────────────
function OrderEmailsTab({ settings, save }: { settings: Settings | null; save: (p: Partial<Settings>) => Promise<void> }) {
  const [log, setLog] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("email_send_log").select("*")
      .in("template_name", ["order_confirmation", "order_status", "order_delivery"])
      .order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => setLog(data || []));
  }, []);

  if (!settings) return null;

  return (
    <div className="space-y-4">
      <Card className="p-5 bg-slate-900/40 border-white/10 space-y-3">
        <h3 className="text-white font-semibold flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-amber-400" /> Order Email Notifications</h3>
        {[
          { key: "order_confirmation_enabled", label: "Order Confirmation", desc: "Sent when a new order is placed" },
          { key: "order_status_enabled", label: "Status Updates", desc: "Sent when order status changes" },
          { key: "order_delivery_enabled", label: "Delivery Notification", desc: "Sent when order is delivered" },
        ].map((row) => (
          <div key={row.key} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-white/5">
            <div>
              <p className="text-white text-sm font-semibold">{row.label}</p>
              <p className="text-xs text-slate-400">{row.desc}</p>
            </div>
            <Switch checked={(settings as any)[row.key]}
              onCheckedChange={(v) => save({ [row.key]: v } as any)} />
          </div>
        ))}
      </Card>

      <Card className="p-5 bg-slate-900/40 border-white/10">
        <h4 className="text-white font-semibold text-sm mb-3">Recent Order Emails</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-400 text-xs border-b border-white/10">
              <th className="py-2">Template</th><th>Recipient</th><th>Status</th><th>Sent</th>
            </tr></thead>
            <tbody>
              {log.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-slate-500">No emails sent yet.</td></tr>}
              {log.map((r) => (
                <tr key={r.id} className="border-b border-white/5 text-slate-200">
                  <td className="py-2 text-xs font-mono">{r.template_name}</td>
                  <td className="text-xs">{r.recipient_email}</td>
                  <td>
                    <Badge className={
                      r.status === "sent" ? "bg-emerald-500/20 text-emerald-300" :
                      r.status === "failed" ? "bg-rose-500/20 text-rose-300" :
                      "bg-amber-500/20 text-amber-300"
                    }>{r.status}</Badge>
                  </td>
                  <td className="text-xs text-slate-400">{new Date(r.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────── Password Reset Tab ───────────────────
function PasswordResetTab({ settings, save }: { settings: Settings | null; save: (p: Partial<Settings>) => Promise<void> }) {
  const [test, setTest] = useState("");
  const [sending, setSending] = useState(false);

  const sendTest = async () => {
    if (!test) return toast.error("Enter an email");
    setSending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(test, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Reset email sent");
    } catch (e: any) {
      toast.error(e.message);
    } finally { setSending(false); }
  };

  if (!settings) return null;
  return (
    <div className="space-y-4">
      <Card className="p-5 bg-slate-900/40 border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold flex items-center gap-2"><KeyRound className="w-4 h-4 text-purple-400" /> Password Reset Emails</h3>
            <p className="text-xs text-slate-400 mt-1">Sent automatically by Lovable Cloud Auth when users request a reset.</p>
          </div>
          <Switch checked={settings.password_reset_enabled}
            onCheckedChange={(v) => save({ password_reset_enabled: v })} />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-white/5">
          <div>
            <p className="text-white text-sm font-semibold">Welcome Email</p>
            <p className="text-xs text-slate-400">Sent to new users after signup.</p>
          </div>
          <Switch checked={settings.welcome_email_enabled}
            onCheckedChange={(v) => save({ welcome_email_enabled: v })} />
        </div>
      </Card>

      <Card className="p-5 bg-slate-900/40 border-white/10">
        <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2"><Send className="w-4 h-4" /> Test Password Reset</h4>
        <div className="flex flex-wrap gap-2">
          <Input value={test} onChange={(e) => setTest(e.target.value)} placeholder="user@example.com" className="flex-1 min-w-[220px]" />
          <Button onClick={sendTest} disabled={sending} className="gap-2">
            {sending ? "Sending…" : <><Send className="w-4 h-4" /> Send Test</>}
          </Button>
        </div>
        <p className="text-[11px] text-slate-500 mt-2">Uses the live Supabase auth flow. Customize the email template under Email Templates → Password Reset.</p>
      </Card>
    </div>
  );
}

// ─────────────────── Newsletter Tab ───────────────────
function NewsletterTab({ settings, save }: { settings: Settings | null; save: (p: Partial<Settings>) => Promise<void> }) {
  const [stats, setStats] = useState({ subs: 0, campaigns: 0, sent: 0 });
  useEffect(() => {
    (async () => {
      const [{ count: subs }, { count: campaigns }, { count: sent }] = await Promise.all([
        supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("email_campaigns").select("*", { count: "exact", head: true }),
        supabase.from("email_campaigns").select("*", { count: "exact", head: true }).eq("status", "sent"),
      ]);
      setStats({ subs: subs || 0, campaigns: campaigns || 0, sent: sent || 0 });
    })();
  }, []);

  if (!settings) return null;
  return (
    <div className="space-y-4">
      <Card className="p-5 bg-slate-900/40 border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold flex items-center gap-2"><Mail className="w-4 h-4 text-sky-400" /> Newsletter System</h3>
            <p className="text-xs text-slate-400 mt-1">Manage subscribers and broadcast campaigns.</p>
          </div>
          <Switch checked={settings.newsletter_enabled}
            onCheckedChange={(v) => save({ newsletter_enabled: v })} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/10 border border-sky-500/30">
            <p className="text-xs text-sky-200">Active Subscribers</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.subs}</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-fuchsia-600/10 border border-purple-500/30">
            <p className="text-xs text-purple-200">Total Campaigns</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.campaigns}</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/10 border border-emerald-500/30">
            <p className="text-xs text-emerald-200">Sent Campaigns</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.sent}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mt-4">
          <a href="/ceo/newsletter">
            <Button variant="outline" className="w-full gap-2"><ExternalLink className="w-4 h-4" /> Manage Subscribers</Button>
          </a>
          <a href="/ceo/campaigns">
            <Button className="w-full gap-2"><Send className="w-4 h-4" /> Create Campaign</Button>
          </a>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────── Main Hub ───────────────────
export default function AdminEmailSystem() {
  const { settings, save, reload } = useSettings();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-sky-600/20 via-cyan-600/10 to-emerald-600/20 border border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center">
              <Mail className="w-6 h-6 text-sky-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Email System</h1>
              <p className="text-sm text-slate-300">SMTP, Templates, Order Emails, Password Reset & Newsletter</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={reload} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="smtp">
        <TabsList className="bg-slate-900/60 border border-white/10 flex-wrap h-auto">
          <TabsTrigger value="smtp" className="gap-2"><Server className="w-4 h-4" /> SMTP</TabsTrigger>
          <TabsTrigger value="templates" className="gap-2"><FileEdit className="w-4 h-4" /> Email Templates</TabsTrigger>
          <TabsTrigger value="orders" className="gap-2"><ShoppingBag className="w-4 h-4" /> Order Emails</TabsTrigger>
          <TabsTrigger value="reset" className="gap-2"><KeyRound className="w-4 h-4" /> Password Reset</TabsTrigger>
          <TabsTrigger value="newsletter" className="gap-2"><Mail className="w-4 h-4" /> Newsletter</TabsTrigger>
        </TabsList>

        <TabsContent value="smtp" className="mt-4"><SmtpTab settings={settings} save={save} /></TabsContent>
        <TabsContent value="templates" className="mt-4"><TemplatesTab /></TabsContent>
        <TabsContent value="orders" className="mt-4"><OrderEmailsTab settings={settings} save={save} /></TabsContent>
        <TabsContent value="reset" className="mt-4"><PasswordResetTab settings={settings} save={save} /></TabsContent>
        <TabsContent value="newsletter" className="mt-4"><NewsletterTab settings={settings} save={save} /></TabsContent>
      </Tabs>
    </motion.div>
  );
}
