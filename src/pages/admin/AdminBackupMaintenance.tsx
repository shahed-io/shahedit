import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database, Loader2, Download, Upload, Trash2, Power, RefreshCw, Clock, HardDrive, Wrench } from "lucide-react";

const TABLES = [
  "orders","leads","payment_submissions","products","service_packages","blog_posts",
  "testimonials","team_members","faqs","newsletter_subscribers","audit_logs","wallet_transactions",
  "profiles","invoices","coupons","license_keys","product_reviews","clients","projects",
];

type MS = {
  id: number;
  auto_backup_enabled: boolean;
  auto_backup_frequency: string;
  auto_backup_time: string;
  auto_backup_retention_days: number;
  last_auto_backup_at: string | null;
  maintenance_mode: boolean;
  maintenance_message: string;
  maintenance_allow_admin: boolean;
  cache_version: number;
};

const download = (name: string, content: string, mime = "application/json") => {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
};

export default function AdminBackupMaintenance() {
  const [settings, setSettings] = useState<MS | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [restoreText, setRestoreText] = useState("");

  const load = async () => {
    setLoading(true);
    const [s, j] = await Promise.all([
      (supabase as any).from("maintenance_settings").select("*").eq("id", 1).maybeSingle(),
      (supabase as any).from("backup_jobs").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    setSettings(s.data);
    setJobs(j.data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!settings) return;
    setBusy("save");
    const { error } = await (supabase as any).from("maintenance_settings")
      .upsert({ ...settings, id: 1, updated_at: new Date().toISOString() });
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success("সেটিংস সংরক্ষিত");
  };

  const runBackup = async (type: "manual" | "database") => {
    setBusy(type);
    try {
      const dump: Record<string, any[]> = {};
      let totalRows = 0;
      for (const t of TABLES) {
        const { data, error } = await (supabase as any).from(t).select("*").limit(10000);
        if (!error && data) { dump[t] = data; totalRows += data.length; }
      }
      const ts = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);
      const fileName = `${type}_backup_${ts}.json`;
      const content = JSON.stringify({ type, exported_at: new Date().toISOString(), tables: dump }, null, 2);
      download(fileName, content);
      const sizeBytes = new Blob([content]).size;
      await (supabase as any).from("backup_jobs").insert({
        type, status: "completed", table_count: Object.keys(dump).length,
        row_count: totalRows, size_bytes: sizeBytes, file_name: fileName,
      });
      if (type === "manual") {
        await (supabase as any).from("maintenance_settings").update({ last_auto_backup_at: new Date().toISOString() }).eq("id", 1);
      }
      toast.success(`Backup ready — ${totalRows} rows`);
      load();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(null); }
  };

  const clearCache = async () => {
    if (!settings) return;
    setBusy("cache");
    const newV = (settings.cache_version || 1) + 1;
    const { error } = await (supabase as any).from("maintenance_settings").update({ cache_version: newV }).eq("id", 1);
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      localStorage.removeItem("app-cache");
      sessionStorage.clear();
    } catch {}
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success(`Cache cleared — version v${newV}`);
    load();
  };

  const restoreFromText = async () => {
    if (!restoreText.trim()) return toast.error("Backup JSON paste করুন");
    if (!confirm("⚠️ এটি বর্তমান data-এর উপর restore করবে। নিশ্চিত?")) return;
    setBusy("restore");
    try {
      const parsed = JSON.parse(restoreText);
      const tables = parsed.tables || parsed;
      let restored = 0;
      for (const [tableName, rows] of Object.entries(tables)) {
        if (!Array.isArray(rows) || rows.length === 0) continue;
        const { error } = await (supabase as any).from(tableName).upsert(rows);
        if (!error) restored += rows.length;
      }
      await (supabase as any).from("backup_jobs").insert({
        type: "restore", status: "completed", row_count: restored, notes: "Manual restore from JSON",
      });
      toast.success(`Restored ${restored} rows`);
      setRestoreText("");
      load();
    } catch (e: any) { toast.error("Invalid JSON: " + e.message); } finally { setBusy(null); }
  };

  const deleteJob = async (id: string) => {
    await (supabase as any).from("backup_jobs").delete().eq("id", id);
    load();
  };

  if (loading || !settings) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Database className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Backup & Maintenance</h1>
          <p className="text-sm text-muted-foreground">Backup, restore, cache ও maintenance mode কেন্দ্রীয়ভাবে পরিচালনা করুন</p>
        </div>
      </div>

      {settings.maintenance_mode && (
        <Card className="border-orange-500/40 bg-orange-500/[0.06]">
          <CardContent className="p-4 flex items-center gap-3">
            <Wrench className="h-5 w-5 text-orange-500" />
            <div className="text-sm">
              <p className="font-semibold text-orange-600 dark:text-orange-400">Maintenance Mode সক্রিয় আছে</p>
              <p className="text-xs text-muted-foreground">Public visitors maintenance page দেখছেন।</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={HardDrive} label="Total Backups" value={jobs.length} />
        <KpiCard icon={Clock} label="Last Backup" value={settings.last_auto_backup_at ? new Date(settings.last_auto_backup_at).toLocaleDateString() : "—"} small />
        <KpiCard icon={RefreshCw} label="Cache Version" value={`v${settings.cache_version}`} />
        <KpiCard icon={Power} label="Maintenance" value={settings.maintenance_mode ? "ON" : "OFF"} tone={settings.maintenance_mode ? "destructive" : undefined} />
      </div>

      <Tabs defaultValue="auto" className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 h-auto">
          <TabsTrigger value="auto">Auto Backup</TabsTrigger>
          <TabsTrigger value="manual">Manual Backup</TabsTrigger>
          <TabsTrigger value="database">Database Backup</TabsTrigger>
          <TabsTrigger value="restore">Restore</TabsTrigger>
          <TabsTrigger value="cache">Cache Clear</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="auto" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auto Backup শিডিউল</CardTitle>
              <CardDescription>নির্দিষ্ট সময়ে স্বয়ংক্রিয়ভাবে ব্যাকআপ তৈরি হবে।</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <span className="text-sm font-medium">Auto Backup সক্রিয় করুন</span>
                <Switch checked={settings.auto_backup_enabled} onCheckedChange={v => setSettings({ ...settings, auto_backup_enabled: v })} />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Frequency</Label>
                  <Select value={settings.auto_backup_frequency} onValueChange={v => setSettings({ ...settings, auto_backup_frequency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Time (HH:MM)</Label>
                  <Input type="time" value={settings.auto_backup_time} onChange={e => setSettings({ ...settings, auto_backup_time: e.target.value })} />
                </div>
                <div>
                  <Label>Retention (দিন)</Label>
                  <Input type="number" value={settings.auto_backup_retention_days} onChange={e => setSettings({ ...settings, auto_backup_retention_days: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <Button onClick={save} disabled={busy === "save"}>সেটিংস সংরক্ষণ</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manual Backup</CardTitle>
              <CardDescription>এখনই সম্পূর্ণ data snapshot তৈরি করুন (JSON file)।</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => runBackup("manual")} disabled={busy === "manual"} size="lg">
                {busy === "manual" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Backup শুরু করুন
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Backup</CardTitle>
              <CardDescription>সম্পূর্ণ database (সব table) JSON-এ export</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">প্রতি table থেকে সর্বোচ্চ ১০,০০০ row। বড় database-এর জন্য Lovable support-এর সাথে যোগাযোগ করুন।</p>
              <Button onClick={() => runBackup("database")} disabled={busy === "database"} size="lg" variant="default">
                {busy === "database" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
                সম্পূর্ণ Database Backup
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Backup History</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Rows</TableHead>
                  <TableHead>Size</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {jobs.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">কোন backup নেই</TableCell></TableRow>}
                  {jobs.map(j => (
                    <TableRow key={j.id}>
                      <TableCell>{new Date(j.created_at).toLocaleString()}</TableCell>
                      <TableCell><Badge variant="outline">{j.type}</Badge></TableCell>
                      <TableCell>{j.row_count ?? "—"}</TableCell>
                      <TableCell>{j.size_bytes ? `${(j.size_bytes / 1024).toFixed(1)} KB` : "—"}</TableCell>
                      <TableCell><Badge>{j.status}</Badge></TableCell>
                      <TableCell><Button size="icon" variant="ghost" onClick={() => deleteJob(j.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restore" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Restore from Backup</CardTitle>
              <CardDescription>পূর্বে export করা JSON file-এর content paste করে restore করুন। ⚠️ একই id-এর rows overwrite হবে।</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea rows={10} placeholder='{"tables": {"products": [...], ...}}' value={restoreText} onChange={e => setRestoreText(e.target.value)} className="font-mono text-xs" />
              <Button onClick={restoreFromText} disabled={busy === "restore"} variant="destructive">
                {busy === "restore" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                Restore Execute
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cache Clear</CardTitle>
              <CardDescription>Browser cache, service worker cache এবং app cache version bump করুন।</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">Current cache version: <Badge>v{settings.cache_version}</Badge></div>
              <Button onClick={clearCache} disabled={busy === "cache"}>
                {busy === "cache" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                সব Cache Clear করুন
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Mode</CardTitle>
              <CardDescription>সক্রিয় হলে public visitors maintenance page দেখবেন; admin login করতে পারবেন (অনুমতি থাকলে)।</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <span className="text-sm font-medium">Maintenance Mode সক্রিয় করুন</span>
                <Switch checked={settings.maintenance_mode} onCheckedChange={v => setSettings({ ...settings, maintenance_mode: v })} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <span className="text-sm font-medium">Admin-দের জন্য সাইট খোলা রাখুন</span>
                <Switch checked={settings.maintenance_allow_admin} onCheckedChange={v => setSettings({ ...settings, maintenance_allow_admin: v })} />
              </div>
              <div>
                <Label>Maintenance Message</Label>
                <Textarea rows={3} value={settings.maintenance_message} onChange={e => setSettings({ ...settings, maintenance_message: e.target.value })} />
              </div>
              <Button onClick={save} disabled={busy === "save"}>সেটিংস সংরক্ষণ</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, tone, small }: { icon: any; label: string; value: any; tone?: "destructive"; small?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${tone === "destructive" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className={`font-bold truncate ${small ? "text-base" : "text-2xl"}`}>{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
