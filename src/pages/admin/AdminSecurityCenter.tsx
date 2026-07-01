import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, Loader2, Trash2, Plus, KeyRound, History, Ban, Globe, Smartphone, ScrollText, ShieldCheck } from "lucide-react";

type Settings = {
  id: number;
  twofa_required_for_admins: boolean;
  twofa_required_for_all: boolean;
  recaptcha_enabled: boolean;
  recaptcha_site_key: string | null;
  // recaptcha_secret_key is stored as an edge function secret, not in the DB.
  ip_whitelist_enabled: boolean;
  failed_login_lockout_threshold: number;
  failed_login_lockout_minutes: number;
  session_idle_timeout_minutes: number;
  session_absolute_timeout_hours: number;
};

export default function AdminSecurityCenter() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [whitelist, setWhitelist] = useState<any[]>([]);
  const [newIp, setNewIp] = useState("");
  const [newIpLabel, setNewIpLabel] = useState("");

  const [failed, setFailed] = useState<any[]>([]);
  const [logins, setLogins] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);

  const loadAll = async () => {
    setLoading(true);
    const [s, w, f, l, d, a] = await Promise.all([
      (supabase as any).from("security_settings").select("*").eq("id", 1).maybeSingle(),
      (supabase as any).from("ip_whitelist").select("*").order("created_at", { ascending: false }),
      (supabase as any).from("failed_login_attempts").select("*").order("attempted_at", { ascending: false }).limit(200),
      (supabase as any).from("customer_login_history").select("*").order("logged_in_at", { ascending: false }).limit(200),
      (supabase as any).from("customer_devices").select("*").order("last_seen_at", { ascending: false }).limit(200),
      (supabase as any).from("audit_logs").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    setSettings(s.data ?? {
      id: 1, twofa_required_for_admins: false, twofa_required_for_all: false,
      recaptcha_enabled: false, recaptcha_site_key: "",
      ip_whitelist_enabled: false, failed_login_lockout_threshold: 5, failed_login_lockout_minutes: 15,
      session_idle_timeout_minutes: 60, session_absolute_timeout_hours: 24,
    });
    setWhitelist(w.data ?? []);
    setFailed(f.data ?? []);
    setLogins(l.data ?? []);
    setDevices(d.data ?? []);
    setAudit(a.data ?? []);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const stats = useMemo(() => {
    const since = Date.now() - 24 * 60 * 60 * 1000;
    return {
      failed24: failed.filter(f => new Date(f.attempted_at).getTime() > since).length,
      logins24: logins.filter(l => new Date(l.logged_in_at).getTime() > since).length,
      whitelist: whitelist.filter(w => w.is_active).length,
      devices: devices.length,
    };
  }, [failed, logins, whitelist, devices]);

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    const { error } = await (supabase as any).from("security_settings").upsert({ ...settings, id: 1, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) return toast.error("সেভ ব্যর্থ: " + error.message);
    toast.success("সিকিউরিটি সেটিংস সংরক্ষিত");
  };

  const addIp = async () => {
    if (!newIp.trim()) return;
    const { error } = await (supabase as any).from("ip_whitelist").insert({ ip_address: newIp.trim(), label: newIpLabel.trim() || null });
    if (error) return toast.error(error.message);
    setNewIp(""); setNewIpLabel("");
    toast.success("IP whitelist-এ যুক্ত হয়েছে");
    loadAll();
  };

  const removeIp = async (id: string) => {
    const { error } = await (supabase as any).from("ip_whitelist").delete().eq("id", id);
    if (error) return toast.error(error.message);
    loadAll();
  };

  const toggleIp = async (id: string, is_active: boolean) => {
    await (supabase as any).from("ip_whitelist").update({ is_active }).eq("id", id);
    loadAll();
  };

  if (loading || !settings) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Security Center</h1>
          <p className="text-sm text-muted-foreground">সাইটের নিরাপত্তা ও অ্যাক্সেস কন্ট্রোল কেন্দ্রীয়ভাবে পরিচালনা করুন</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Ban} label="Failed Logins (24h)" value={stats.failed24} tone="destructive" />
        <KpiCard icon={History} label="Successful Logins (24h)" value={stats.logins24} />
        <KpiCard icon={Globe} label="Whitelisted IPs" value={stats.whitelist} />
        <KpiCard icon={Smartphone} label="Tracked Devices" value={stats.devices} />
      </div>

      <Tabs defaultValue="2fa" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 h-auto">
          <TabsTrigger value="2fa">2FA</TabsTrigger>
          <TabsTrigger value="logins">Login History</TabsTrigger>
          <TabsTrigger value="failed">Failed Logins</TabsTrigger>
          <TabsTrigger value="whitelist">IP Whitelist</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="recaptcha">reCAPTCHA</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        {/* 2FA */}
        <TabsContent value="2fa" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Two-Factor Authentication</CardTitle><CardDescription>Supabase MFA (TOTP) এনফোর্স করুন। ইউজার তাদের প্রোফাইল থেকে authenticator সংযুক্ত করবে।</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <ToggleRow label="Admin/Staff-দের জন্য 2FA বাধ্যতামূলক"
                checked={settings.twofa_required_for_admins}
                onChange={v => setSettings({ ...settings, twofa_required_for_admins: v })} />
              <ToggleRow label="সকল ইউজারের জন্য 2FA বাধ্যতামূলক"
                checked={settings.twofa_required_for_all}
                onChange={v => setSettings({ ...settings, twofa_required_for_all: v })} />
              <Button onClick={saveSettings} disabled={saving}><ShieldCheck className="h-4 w-4 mr-2" />সংরক্ষণ করুন</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Login History */}
        <TabsContent value="logins">
          <Card>
            <CardHeader><CardTitle>Login History</CardTitle><CardDescription>সাম্প্রতিক সফল লগইন (শেষ ২০০টি)</CardDescription></CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Time</TableHead><TableHead>User</TableHead><TableHead>IP</TableHead><TableHead>Device</TableHead><TableHead>Location</TableHead></TableRow></TableHeader>
                <TableBody>
                  {logins.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">কোন রেকর্ড নেই</TableCell></TableRow>}
                  {logins.map(l => (
                    <TableRow key={l.id}>
                      <TableCell>{new Date(l.logged_in_at).toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-xs">{l.user_id?.slice(0,8) ?? "—"}</TableCell>
                      <TableCell className="font-mono">{l.ip_address ?? "—"}</TableCell>
                      <TableCell className="max-w-[240px] truncate">{l.user_agent ?? "—"}</TableCell>
                      <TableCell>{l.location ?? l.country ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Failed Logins */}
        <TabsContent value="failed" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Lockout পলিসি</CardTitle><CardDescription>নির্দিষ্ট সংখ্যক ব্যর্থ চেষ্টার পর অ্যাকাউন্ট সাময়িকভাবে লক হবে।</CardDescription></CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div><Label>Threshold (চেষ্টা)</Label><Input type="number" value={settings.failed_login_lockout_threshold} onChange={e => setSettings({...settings, failed_login_lockout_threshold: parseInt(e.target.value)||0})}/></div>
              <div><Label>Lockout সময় (মিনিট)</Label><Input type="number" value={settings.failed_login_lockout_minutes} onChange={e => setSettings({...settings, failed_login_lockout_minutes: parseInt(e.target.value)||0})}/></div>
              <div className="flex items-end"><Button onClick={saveSettings} disabled={saving} className="w-full">সংরক্ষণ</Button></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Failed Login Attempts</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Time</TableHead><TableHead>Email</TableHead><TableHead>IP</TableHead><TableHead>Reason</TableHead></TableRow></TableHeader>
                <TableBody>
                  {failed.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">কোন ব্যর্থ চেষ্টা নেই 🎉</TableCell></TableRow>}
                  {failed.map(f => (
                    <TableRow key={f.id}>
                      <TableCell>{new Date(f.attempted_at).toLocaleString()}</TableCell>
                      <TableCell>{f.email ?? "—"}</TableCell>
                      <TableCell className="font-mono">{f.ip_address ?? "—"}</TableCell>
                      <TableCell><Badge variant="destructive">{f.reason ?? "invalid_credentials"}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IP Whitelist */}
        <TabsContent value="whitelist" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>IP Whitelist</CardTitle><CardDescription>চালু থাকলে কেবল অনুমোদিত IP থেকে admin panel-এ ঢোকা যাবে।</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <ToggleRow label="IP Whitelist এনফোর্স করুন" checked={settings.ip_whitelist_enabled}
                onChange={v => setSettings({ ...settings, ip_whitelist_enabled: v })} />
              <Button onClick={saveSettings} disabled={saving} size="sm">সেটিং সংরক্ষণ</Button>
              <div className="grid md:grid-cols-3 gap-3 pt-4 border-t">
                <Input placeholder="IP address (e.g. 103.x.x.x)" value={newIp} onChange={e=>setNewIp(e.target.value)} />
                <Input placeholder="Label (optional)" value={newIpLabel} onChange={e=>setNewIpLabel(e.target.value)} />
                <Button onClick={addIp}><Plus className="h-4 w-4 mr-2" />যুক্ত করুন</Button>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>IP</TableHead><TableHead>Label</TableHead><TableHead>Active</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {whitelist.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">কোন IP যোগ করা নেই</TableCell></TableRow>}
                  {whitelist.map(w => (
                    <TableRow key={w.id}>
                      <TableCell className="font-mono">{w.ip_address}</TableCell>
                      <TableCell>{w.label ?? "—"}</TableCell>
                      <TableCell><Switch checked={w.is_active} onCheckedChange={v=>toggleIp(w.id,v)} /></TableCell>
                      <TableCell><Button size="icon" variant="ghost" onClick={()=>removeIp(w.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Devices */}
        <TabsContent value="devices">
          <Card>
            <CardHeader><CardTitle>Device Management</CardTitle><CardDescription>ইউজারদের ট্র্যাক করা ডিভাইস</CardDescription></CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Last Seen</TableHead><TableHead>User</TableHead><TableHead>Device</TableHead><TableHead>Browser</TableHead><TableHead>IP</TableHead><TableHead>Trusted</TableHead></TableRow></TableHeader>
                <TableBody>
                  {devices.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">কোন ডিভাইস নেই</TableCell></TableRow>}
                  {devices.map(d => (
                    <TableRow key={d.id}>
                      <TableCell>{d.last_seen_at ? new Date(d.last_seen_at).toLocaleString() : "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{d.user_id?.slice(0,8) ?? "—"}</TableCell>
                      <TableCell>{d.device_name ?? d.device_type ?? "—"}</TableCell>
                      <TableCell>{d.browser ?? "—"}</TableCell>
                      <TableCell className="font-mono">{d.ip_address ?? "—"}</TableCell>
                      <TableCell>{d.is_trusted ? <Badge>Trusted</Badge> : <Badge variant="outline">No</Badge>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions */}
        <TabsContent value="sessions">
          <Card>
            <CardHeader><CardTitle>Session Manager</CardTitle><CardDescription>সেশন timeout কনফিগারেশন</CardDescription></CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div><Label>Idle Timeout (মিনিট)</Label><Input type="number" value={settings.session_idle_timeout_minutes} onChange={e=>setSettings({...settings, session_idle_timeout_minutes: parseInt(e.target.value)||0})}/></div>
              <div><Label>Absolute Timeout (ঘণ্টা)</Label><Input type="number" value={settings.session_absolute_timeout_hours} onChange={e=>setSettings({...settings, session_absolute_timeout_hours: parseInt(e.target.value)||0})}/></div>
              <div className="flex items-end"><Button onClick={saveSettings} disabled={saving} className="w-full">সংরক্ষণ</Button></div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* reCAPTCHA */}
        <TabsContent value="recaptcha">
          <Card>
            <CardHeader><CardTitle>Google reCAPTCHA</CardTitle><CardDescription>Login/Signup ও Contact ফর্মে bot-protection</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <ToggleRow label="reCAPTCHA এনফোর্স করুন" checked={settings.recaptcha_enabled}
                onChange={v => setSettings({ ...settings, recaptcha_enabled: v })} />
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Site Key</Label><Input value={settings.recaptcha_site_key ?? ""} onChange={e=>setSettings({...settings, recaptcha_site_key: e.target.value})} placeholder="6Lc..." /></div>
                <div><Label>Secret Key</Label><Input type="password" value={settings.recaptcha_secret_key ?? ""} onChange={e=>setSettings({...settings, recaptcha_secret_key: e.target.value})} placeholder="6Lc..." /></div>
              </div>
              <p className="text-xs text-muted-foreground"><KeyRound className="h-3 w-3 inline mr-1" />Keys পাবেন: google.com/recaptcha/admin</p>
              <Button onClick={saveSettings} disabled={saving}>সংরক্ষণ করুন</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log */}
        <TabsContent value="audit">
          <Card>
            <CardHeader><CardTitle>Audit Log</CardTitle><CardDescription>Admin কার্যক্রমের রেকর্ড (শেষ ২০০টি)</CardDescription></CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Time</TableHead><TableHead>Actor</TableHead><TableHead>Action</TableHead><TableHead>Entity</TableHead><TableHead>Details</TableHead></TableRow></TableHeader>
                <TableBody>
                  {audit.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">কোন লগ নেই</TableCell></TableRow>}
                  {audit.map(a => (
                    <TableRow key={a.id}>
                      <TableCell>{new Date(a.created_at).toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-xs">{a.user_id?.slice(0,8) ?? "system"}</TableCell>
                      <TableCell><Badge variant="outline"><ScrollText className="h-3 w-3 mr-1" />{a.action ?? a.event ?? "—"}</Badge></TableCell>
                      <TableCell>{a.entity_type ?? a.resource ?? "—"} {a.entity_id ? `#${String(a.entity_id).slice(0,8)}` : ""}</TableCell>
                      <TableCell className="max-w-[280px] truncate text-xs text-muted-foreground">{typeof a.metadata === 'object' ? JSON.stringify(a.metadata) : (a.details ?? "—")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number; tone?: "destructive" }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${tone === "destructive" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border">
      <span className="text-sm font-medium">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
