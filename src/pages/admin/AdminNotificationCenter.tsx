import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell, CheckCheck, Trash2, Inbox, CreditCard, Package, MessageSquare, AlertCircle,
  Mail, Smartphone, Send, Save, ExternalLink, Copy, Plus, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage, AdminPageHeader, GlassCard, KpiCard } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

// ---------------- Types ----------------
type Notif = {
  id: string; title: string; body: string | null; type: string | null;
  is_read: boolean; link: string | null; created_at: string; user_id: string | null;
};

type Channel = {
  id: number;
  email_enabled: boolean;
  sms_enabled: boolean; sms_provider: string; sms_from: string | null;
  whatsapp_enabled: boolean; whatsapp_number: string; whatsapp_default_message: string;
  push_enabled: boolean; push_provider: string; push_vapid_public: string | null;
  admin_alert_emails: string;
  admin_alert_on_new_order: boolean;
  admin_alert_on_new_lead: boolean;
  admin_alert_on_refund: boolean;
  admin_alert_on_failed_payment: boolean;
};

type Template = {
  id: string; channel: string; template_key: string; label: string;
  subject: string | null; body: string; is_active: boolean; variables: any;
};

// ---------------- Helpers ----------------
const typeIcon = (t: string | null) => {
  switch (t) {
    case "order": return Package;
    case "payment": return CreditCard;
    case "lead": return Inbox;
    case "support": return MessageSquare;
    default: return AlertCircle;
  }
};
const typeColor = (t: string | null) => {
  switch (t) {
    case "order": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    case "payment": return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    case "lead": return "text-sky-400 bg-sky-500/10 border-sky-500/30";
    case "support": return "text-violet-400 bg-violet-500/10 border-violet-500/30";
    default: return "text-rose-400 bg-rose-500/10 border-rose-500/30";
  }
};

// ============================================================
// Main Component
// ============================================================
const AdminNotificationCenter = () => {
  const [tab, setTab] = useState("admin");
  const [channels, setChannels] = useState<Channel | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    const [{ data: c }, { data: t }, { data: n }] = await Promise.all([
      supabase.from("notification_channels" as any).select("*").eq("id", 1).maybeSingle(),
      supabase.from("notification_templates" as any).select("*").order("channel").order("label"),
      supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    setChannels((c as any) || null);
    setTemplates((t as any) || []);
    setItems((n as any) || []);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  // ---- Channel settings ----
  const updateChannel = (patch: Partial<Channel>) => setChannels((c) => (c ? { ...c, ...patch } : c));
  const saveChannels = async () => {
    if (!channels) return;
    const { id, ...rest } = channels;
    const { error } = await supabase.from("notification_channels" as any).update(rest as any).eq("id", 1);
    if (error) toast.error(error.message);
    else toast.success("Settings saved");
  };

  // ---- Templates ----
  const tplByChannel = (ch: string) => templates.filter((t) => t.channel === ch);
  const saveTemplate = async (tpl: Template) => {
    const { error } = await supabase.from("notification_templates" as any)
      .update({ subject: tpl.subject, body: tpl.body, is_active: tpl.is_active } as any)
      .eq("id", tpl.id);
    if (error) toast.error(error.message);
    else toast.success("Template saved");
  };

  // ---- Admin alerts log (in-app notifications) ----
  const unreadCount = items.filter((i) => !i.is_read).length;
  const todayCount = items.filter((i) => new Date(i.created_at).toDateString() === new Date().toDateString()).length;
  const markAllRead = async () => {
    const ids = items.filter((i) => !i.is_read).map((i) => i.id);
    if (!ids.length) return;
    await supabase.from("notifications").update({ is_read: true }).in("id", ids);
    setItems((s) => s.map((n) => ({ ...n, is_read: true })));
    toast.success("সব পড়া হিসেবে চিহ্নিত");
  };
  const remove = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setItems((s) => s.filter((n) => n.id !== id));
  };

  if (loading || !channels) {
    return <AdminPage><div className="p-12 text-center text-muted-foreground">Loading…</div></AdminPage>;
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Notification Center"
        subtitle="Email, SMS, WhatsApp, Push ও Admin Alerts — সব এক জায়গায়"
        icon={Bell}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total Alerts" value={items.length} icon={Bell} accent="violet" />
        <KpiCard label="Unread" value={unreadCount} icon={AlertCircle} accent="rose" />
        <KpiCard label="Today" value={todayCount} icon={Inbox} accent="emerald" />
        <KpiCard
          label="Active Channels"
          value={[channels.email_enabled, channels.sms_enabled, channels.whatsapp_enabled, channels.push_enabled].filter(Boolean).length}
          icon={MessageSquare} accent="sky"
        />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-4">
          <TabsTrigger value="email"><Mail className="w-4 h-4 mr-1.5" /> Email</TabsTrigger>
          <TabsTrigger value="sms"><Smartphone className="w-4 h-4 mr-1.5" /> SMS</TabsTrigger>
          <TabsTrigger value="whatsapp"><MessageSquare className="w-4 h-4 mr-1.5" /> WhatsApp</TabsTrigger>
          <TabsTrigger value="push"><Bell className="w-4 h-4 mr-1.5" /> Push</TabsTrigger>
          <TabsTrigger value="admin"><AlertCircle className="w-4 h-4 mr-1.5" /> Admin Alert</TabsTrigger>
        </TabsList>

        {/* ============ EMAIL ============ */}
        <TabsContent value="email">
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" /> Email Notifications
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Email channel চালু/বন্ধ করুন। সম্পূর্ণ template ও SMTP setup Email System এ।
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={channels.email_enabled}
                  onCheckedChange={(v) => updateChannel({ email_enabled: v })}
                />
                <span className="text-sm">{channels.email_enabled ? "Enabled" : "Disabled"}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
              <Link to="/ceo/email-system"><Button variant="outline" size="sm"><ExternalLink className="w-3.5 h-3.5 mr-1.5" />Email System</Button></Link>
              <Link to="/ceo/campaigns"><Button variant="outline" size="sm"><ExternalLink className="w-3.5 h-3.5 mr-1.5" />Email Campaigns</Button></Link>
              <Link to="/ceo/newsletter"><Button variant="outline" size="sm"><ExternalLink className="w-3.5 h-3.5 mr-1.5" />Newsletter</Button></Link>
              <Button onClick={saveChannels} size="sm" className="ml-auto"><Save className="w-3.5 h-3.5 mr-1.5" />Save</Button>
            </div>
          </GlassCard>
        </TabsContent>

        {/* ============ SMS ============ */}
        <TabsContent value="sms">
          <GlassCard className="p-6 space-y-4 mb-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" /> SMS Channel
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Twilio বা GatewayAPI connector যোগ করুন এবং sender configure করুন।
                </p>
              </div>
              <Switch checked={channels.sms_enabled} onCheckedChange={(v) => updateChannel({ sms_enabled: v })} />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label>Provider</Label>
                <select
                  className="w-full mt-1 h-10 px-3 rounded-md bg-background border border-input text-sm"
                  value={channels.sms_provider}
                  onChange={(e) => updateChannel({ sms_provider: e.target.value })}
                >
                  <option value="twilio">Twilio</option>
                  <option value="gatewayapi">GatewayAPI</option>
                  <option value="brevo">Brevo SMS</option>
                </select>
              </div>
              <div>
                <Label>Sender / From Number</Label>
                <Input
                  className="mt-1"
                  placeholder="+15555550123"
                  value={channels.sms_from || ""}
                  onChange={(e) => updateChannel({ sms_from: e.target.value })}
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
              ⚠️ SMS পাঠাতে অবশ্যই {channels.sms_provider} connector যোগ করতে হবে। Backend secret সঠিকভাবে set না থাকলে message যাবে না।
            </div>

            <Button onClick={saveChannels} size="sm"><Save className="w-3.5 h-3.5 mr-1.5" />Save</Button>
          </GlassCard>

          <TemplateList channel="sms" templates={tplByChannel("sms")} onSave={saveTemplate} />
        </TabsContent>

        {/* ============ WHATSAPP ============ */}
        <TabsContent value="whatsapp">
          <GlassCard className="p-6 space-y-4 mb-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-400" /> WhatsApp (Click-to-chat)
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  wa.me deep link ব্যবহার করে customer-রা সরাসরি chat শুরু করতে পারবে।
                </p>
              </div>
              <Switch checked={channels.whatsapp_enabled} onCheckedChange={(v) => updateChannel({ whatsapp_enabled: v })} />
            </div>

            <div>
              <Label>WhatsApp Number (E.164)</Label>
              <Input
                className="mt-1"
                placeholder="+8801820060046"
                value={channels.whatsapp_number}
                onChange={(e) => updateChannel({ whatsapp_number: e.target.value })}
              />
            </div>
            <div>
              <Label>Default Message</Label>
              <Textarea
                className="mt-1"
                rows={3}
                value={channels.whatsapp_default_message}
                onChange={(e) => updateChannel({ whatsapp_default_message: e.target.value })}
              />
            </div>

            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between gap-2 flex-wrap">
              <span className="break-all font-mono">
                https://wa.me/{channels.whatsapp_number.replace(/[^\d]/g, "")}?text={encodeURIComponent(channels.whatsapp_default_message)}
              </span>
              <Button size="sm" variant="outline" onClick={() => {
                const link = `https://wa.me/${channels.whatsapp_number.replace(/[^\d]/g, "")}?text=${encodeURIComponent(channels.whatsapp_default_message)}`;
                navigator.clipboard.writeText(link);
                toast.success("Link copied");
              }}>
                <Copy className="w-3.5 h-3.5 mr-1.5" />Copy Link
              </Button>
            </div>

            <Button onClick={saveChannels} size="sm"><Save className="w-3.5 h-3.5 mr-1.5" />Save</Button>
          </GlassCard>

          <TemplateList channel="whatsapp" templates={tplByChannel("whatsapp")} onSave={saveTemplate} />
        </TabsContent>

        {/* ============ PUSH ============ */}
        <TabsContent value="push">
          <GlassCard className="p-6 space-y-4 mb-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Bell className="w-5 h-5 text-violet-400" /> Push Notifications
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Web Push (VAPID) বা OneSignal-এর মতো provider configure করুন।
                </p>
              </div>
              <Switch checked={channels.push_enabled} onCheckedChange={(v) => updateChannel({ push_enabled: v })} />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label>Provider</Label>
                <select
                  className="w-full mt-1 h-10 px-3 rounded-md bg-background border border-input text-sm"
                  value={channels.push_provider}
                  onChange={(e) => updateChannel({ push_provider: e.target.value })}
                >
                  <option value="web-push">Web Push (VAPID)</option>
                  <option value="onesignal">OneSignal</option>
                  <option value="firebase">Firebase Cloud Messaging</option>
                </select>
              </div>
              <div>
                <Label>VAPID Public Key</Label>
                <Input
                  className="mt-1 font-mono text-xs"
                  placeholder="BJ..."
                  value={channels.push_vapid_public || ""}
                  onChange={(e) => updateChannel({ push_vapid_public: e.target.value })}
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/30 text-xs text-violet-300">
              💡 VAPID private key এবং subscription endpoint backend secret হিসেবে রাখতে হবে। Setup-এর জন্য Lovable Cloud secrets ব্যবহার করুন।
            </div>

            <Button onClick={saveChannels} size="sm"><Save className="w-3.5 h-3.5 mr-1.5" />Save</Button>
          </GlassCard>

          <TemplateList channel="push" templates={tplByChannel("push")} onSave={saveTemplate} />
        </TabsContent>

        {/* ============ ADMIN ALERT ============ */}
        <TabsContent value="admin">
          <GlassCard className="p-6 space-y-4 mb-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" /> Admin Alert Triggers
            </h3>

            <div>
              <Label>Alert Recipients (comma-separated emails)</Label>
              <Input
                className="mt-1"
                value={channels.admin_alert_emails}
                onChange={(e) => updateChannel({ admin_alert_emails: e.target.value })}
                placeholder="admin@example.com, ops@example.com"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3 pt-2">
              {[
                { key: "admin_alert_on_new_order" as const, label: "🛒 New order received" },
                { key: "admin_alert_on_new_lead" as const, label: "📩 New lead submitted" },
                { key: "admin_alert_on_refund" as const, label: "💸 Refund request" },
                { key: "admin_alert_on_failed_payment" as const, label: "❌ Failed payment" },
              ].map((t) => (
                <label key={t.key} className="flex items-center justify-between p-3 rounded-lg bg-card/40 border border-border/40">
                  <span className="text-sm">{t.label}</span>
                  <Switch checked={channels[t.key]} onCheckedChange={(v) => updateChannel({ [t.key]: v } as any)} />
                </label>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <Button onClick={markAllRead} variant="outline" size="sm" disabled={!unreadCount}>
                <CheckCheck className="w-3.5 h-3.5 mr-1.5" />Mark all read
              </Button>
              <Button onClick={saveChannels} size="sm"><Save className="w-3.5 h-3.5 mr-1.5" />Save</Button>
            </div>
          </GlassCard>

          <TemplateList channel="admin_alert" templates={tplByChannel("admin_alert")} onSave={saveTemplate} />

          <GlassCard className="p-2 mt-4">
            <div className="px-4 pt-3 pb-2 flex items-center justify-between">
              <h4 className="text-sm font-bold">Recent In-App Alerts</h4>
              <span className="text-xs text-muted-foreground">{items.length} total</span>
            </div>
            {items.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">কোনো alert নেই</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40 max-h-[500px] overflow-y-auto">
                {items.slice(0, 50).map((n) => {
                  const Icon = typeIcon(n.type);
                  return (
                    <div key={n.id} className={`flex gap-3 p-3 group hover:bg-primary/[0.04] ${!n.is_read ? "bg-primary/[0.02]" : ""}`}>
                      <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${typeColor(n.type)}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm truncate">{n.title}</p>
                          {!n.is_read && <Badge className="bg-primary/20 text-primary border-primary/40 text-[9px] h-4">NEW</Badge>}
                        </div>
                        {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                        <p className="text-[10px] text-muted-foreground/70 mt-1">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 text-rose-400 opacity-0 group-hover:opacity-100" onClick={() => remove(n.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </TabsContent>
      </Tabs>
    </AdminPage>
  );
};

// ============================================================
// Template list — reusable for all channels
// ============================================================
const TemplateList = ({
  channel, templates, onSave,
}: { channel: string; templates: Template[]; onSave: (t: Template) => void }) => {
  const [local, setLocal] = useState<Template[]>(templates);
  useEffect(() => { setLocal(templates); }, [templates]);

  if (!local.length) {
    return (
      <GlassCard className="p-6 text-center text-sm text-muted-foreground">
        এই channel-এর জন্য কোনো template নেই।
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Templates</h4>
      {local.map((tpl, idx) => (
        <GlassCard key={tpl.id} className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <p className="font-semibold text-sm">{tpl.label}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{tpl.template_key}</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={tpl.is_active}
                onCheckedChange={(v) => {
                  const next = [...local]; next[idx] = { ...tpl, is_active: v }; setLocal(next);
                }}
              />
              <span className="text-xs text-muted-foreground">{tpl.is_active ? "Active" : "Off"}</span>
            </div>
          </div>

          {tpl.subject !== null && (
            <div>
              <Label className="text-xs">Subject / Title</Label>
              <Input
                className="mt-1"
                value={tpl.subject || ""}
                onChange={(e) => {
                  const next = [...local]; next[idx] = { ...tpl, subject: e.target.value }; setLocal(next);
                }}
              />
            </div>
          )}

          <div>
            <Label className="text-xs">Message Body</Label>
            <Textarea
              className="mt-1 font-mono text-xs"
              rows={3}
              value={tpl.body}
              onChange={(e) => {
                const next = [...local]; next[idx] = { ...tpl, body: e.target.value }; setLocal(next);
              }}
            />
          </div>

          {Array.isArray(tpl.variables) && tpl.variables.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-muted-foreground">Variables:</span>
              {tpl.variables.map((v: string) => (
                <code key={v} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {`{{${v}}}`}
                </code>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <Button size="sm" onClick={() => onSave(tpl)}>
              <Save className="w-3.5 h-3.5 mr-1.5" /> Save
            </Button>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};

export default AdminNotificationCenter;
