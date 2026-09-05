import { useRef, useState } from "react";
import JSZip from "jszip";
import {
  Database, Download, FileJson, FileSpreadsheet, Loader2, ShieldCheck,
  UploadCloud, Archive, AlertTriangle, CheckCircle2, XCircle, FileArchive,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage, AdminPageHeader, GlassCard, SectionTitle } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

/* FK-নিরাপদ ক্রমে সাজানো টেবিল তালিকা */
const TABLES = [
  { name: "site_settings", label: "Site Settings", desc: "সাইটের সব কনফিগারেশন" },
  { name: "products", label: "Products", desc: "Product catalog" },
  { name: "service_packages", label: "Service Packages", desc: "All published packages" },
  { name: "blog_posts", label: "Blog Posts", desc: "Articles & drafts" },
  { name: "testimonials", label: "Testimonials", desc: "Client reviews" },
  { name: "team_members", label: "Team Members", desc: "Owner ও staff profiles" },
  { name: "faqs", label: "FAQs", desc: "Q&A entries" },
  { name: "newsletter_subscribers", label: "Newsletter", desc: "Email subscribers" },
  { name: "orders", label: "Orders", desc: "সব অর্ডার ও payment status" },
  { name: "leads", label: "Leads", desc: "Quote & contact form submissions" },
  { name: "payment_submissions", label: "Payment Submissions", desc: "Manual payment proof submissions" },
  { name: "wallet_transactions", label: "Wallet Transactions", desc: "All wallet ledger entries" },
  { name: "audit_logs", label: "Audit Logs", desc: "Admin activity history" },
] as const;

const KNOWN_ORDER = TABLES.map((t) => t.name);

interface ZipTablePreview { name: string; rows: number; known: boolean }
interface RestoreResult { table: string; ok: boolean; rows: number; error?: string }

const downloadFile = (filename: string, content: string | Blob, mime: string) => {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const toCSV = (rows: any[]): string => {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
};

const AdminBackupCenter = () => {
  const [busy, setBusy] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  // Restore state
  const fileRef = useRef<HTMLInputElement>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [zipManifest, setZipManifest] = useState<any>(null);
  const [zipTables, setZipTables] = useState<ZipTablePreview[]>([]);
  const [zipData, setZipData] = useState<Record<string, any[]> | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState<string>("");
  const [restoreResults, setRestoreResults] = useState<RestoreResult[] | null>(null);

  /* ---------- Export ---------- */

  const fetchTable = async (table: string): Promise<any[]> => {
    const { data, error } = await (supabase as any).from(table).select("*").limit(10000);
    if (error) throw error;
    return data || [];
  };

  const exportTable = async (table: string, format: "csv" | "json") => {
    setBusy(`${table}:${format}`);
    try {
      const rows = await fetchTable(table);
      setCounts((c) => ({ ...c, [table]: rows.length }));
      const ts = new Date().toISOString().slice(0, 10);
      if (format === "csv") downloadFile(`${table}_${ts}.csv`, toCSV(rows), "text/csv");
      else downloadFile(`${table}_${ts}.json`, JSON.stringify(rows, null, 2), "application/json");
      toast.success(`${table}: ${rows.length} rows exported`);
    } catch (e: any) {
      toast.error(e.message || "Export failed");
    } finally {
      setBusy(null);
    }
  };

  const exportZip = async () => {
    setBusy("zip");
    try {
      const zip = new JSZip();
      const manifest: any = {
        format: "lovable-admin-backup",
        version: 1,
        app: "Shahed IT",
        exported_at: new Date().toISOString(),
        tables: [] as { name: string; rows: number }[],
      };
      const dataFolder = zip.folder("data")!;
      for (const t of TABLES) {
        try {
          const rows = await fetchTable(t.name);
          dataFolder.file(`${t.name}.json`, JSON.stringify(rows, null, 2));
          manifest.tables.push({ name: t.name, rows: rows.length });
        } catch (e) {
          console.warn("skip", t.name, e);
        }
      }
      zip.file("manifest.json", JSON.stringify(manifest, null, 2));
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
      const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      downloadFile(`backup_${ts}.zip`, blob, "application/zip");
      toast.success("ZIP backup ডাউনলোড হয়েছে");
    } catch (e: any) {
      toast.error(e.message || "ZIP backup failed");
    } finally {
      setBusy(null);
    }
  };

  /* ---------- Restore ---------- */

  const resetRestore = () => {
    setZipFile(null); setZipManifest(null); setZipTables([]); setZipData(null);
    setRestoreResults(null); setRestoreProgress("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleZipPick = async (file: File) => {
    setZipFile(file);
    setRestoreResults(null);
    setZipManifest(null);
    setZipTables([]);
    setZipData(null);
    try {
      const zip = await JSZip.loadAsync(file);
      // manifest (optional — যেকোনো সাইটের zip চলবে)
      let manifest: any = null;
      const manifestFile = zip.file("manifest.json");
      if (manifestFile) {
        try { manifest = JSON.parse(await manifestFile.async("string")); } catch { /* ignore */ }
      }
      // data/*.json বা root-level <table>.json — দুইটাই সাপোর্ট
      const dump: Record<string, any[]> = [];
      const previews: ZipTablePreview[] = [];
      const jsonFiles = Object.keys(zip.files).filter((p) => p.endsWith(".json") && !zip.files[p].dir && !p.endsWith("manifest.json"));
      for (const path of jsonFiles) {
        const name = path.replace(/^data\//, "").replace(/\.json$/, "");
        try {
          const parsed = JSON.parse(await zip.files[path].async("string"));
          const rows = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.rows) ? parsed.rows : [];
          dump[name] = rows;
          previews.push({ name, rows: rows.length, known: (KNOWN_ORDER as string[]).includes(name) });
        } catch { /* skip broken file */ }
      }
      if (!previews.length) {
        toast.error("ZIP-এ কোনো টেবিল ডেটা (JSON) পাওয়া যায়নি");
        setZipFile(null);
        return;
      }
      // FK order অনুযায়ী সাজানো
      previews.sort((a, b) => {
        const ai = KNOWN_ORDER.indexOf(a.name as any); const bi = KNOWN_ORDER.indexOf(b.name as any);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      });
      setZipManifest(manifest);
      setZipTables(previews);
      setZipData(dump);
      toast.success(`ZIP পড়া সম্পন্ন — ${previews.length} টি টেবিল পাওয়া গেছে`);
    } catch (e: any) {
      toast.error("ZIP ফাইল পড়া যাচ্ছে না — সঠিক backup ZIP দিন");
      setZipFile(null);
    }
  };

  const runRestore = async () => {
    if (!zipData) return;
    setRestoring(true);
    setRestoreResults(null);
    const results: RestoreResult[] = [];
    const ordered = [...zipTables].sort((a, b) => {
      const ai = KNOWN_ORDER.indexOf(a.name as any); const bi = KNOWN_ORDER.indexOf(b.name as any);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
    for (const t of ordered) {
      const rows = zipData[t.name] || [];
      if (!rows.length) { results.push({ table: t.name, ok: true, rows: 0 }); continue; }
      setRestoreProgress(`${t.name} restore হচ্ছে… (${rows.length} rows)`);
      try {
        let done = 0;
        for (let i = 0; i < rows.length; i += 200) {
          const chunk = rows.slice(i, i + 200);
          const { error } = await (supabase as any).from(t.name).upsert(chunk);
          if (error) throw error;
          done += chunk.length;
        }
        results.push({ table: t.name, ok: true, rows: done });
      } catch (e: any) {
        results.push({ table: t.name, ok: false, rows: 0, error: e.message || "failed" });
      }
    }
    setRestoreResults(results);
    setRestoreProgress("");
    setRestoring(false);
    const okCount = results.filter((r) => r.ok).length;
    if (okCount === results.length) toast.success("সব টেবিল সফলভাবে restore হয়েছে");
    else toast.warning(`${okCount}/${results.length} টেবিল restore হয়েছে — বাকিগুলোতে সমস্যা আছে`);
  };

  /* ---------- UI ---------- */

  return (
    <AdminPage>
      <AdminPageHeader
        title="Backup & Restore"
        subtitle="ZIP ফাইলে সম্পূর্ণ admin panel backup নিন, আবার ZIP upload করে restore করুন"
        icon={Database}
        actions={
          <Button onClick={exportZip} disabled={!!busy}>
            {busy === "zip" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Archive className="w-4 h-4 mr-2" />}
            সম্পূর্ণ ZIP Backup ডাউনলোড
          </Button>
        }
      />

      <GlassCard className="p-4 mb-6 border-emerald-500/30 bg-emerald-500/[0.04]">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-emerald-300">ZIP Backup & Restore</p>
            <p className="text-muted-foreground text-xs mt-0.5">
              ডাউনলোড করা ZIP ফাইলটি যেকোনো প্রজেক্টের admin panel-এ upload করলেই সব ডেটা restore হবে।
              প্রতি টেবিল থেকে সর্বোচ্চ ১০,০০০ row export হয়। Backup ফাইল নিরাপদে রাখুন।
            </p>
          </div>
        </div>
      </GlassCard>

      {/* ---------- Restore section ---------- */}
      <SectionTitle>ZIP থেকে Restore করুন</SectionTitle>
      <GlassCard className="p-5 mb-8">
        {!zipData ? (
          <div
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <UploadCloud className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-semibold text-sm">Backup ZIP ফাইল upload করুন</p>
            <p className="text-xs text-muted-foreground mt-1">এই সাইটের বা অন্য যেকোনো প্রজেক্টের backup ZIP চলবে</p>
            {zipFile && <p className="text-xs mt-2 flex items-center justify-center gap-1"><FileArchive className="w-3.5 h-3.5" />{zipFile.name} — পড়া হচ্ছে…</p>}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="font-bold text-sm flex items-center gap-2">
                  <FileArchive className="w-4 h-4 text-primary" /> {zipFile?.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {zipManifest?.app ? `${zipManifest.app} • ` : ""}
                  {zipManifest?.exported_at ? `Export: ${new Date(zipManifest.exported_at).toLocaleString("bn-BD")} • ` : ""}
                  {zipTables.length} টি টেবিল • মোট {zipTables.reduce((s, t) => s + t.rows, 0)} rows
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={resetRestore} disabled={restoring}>বাতিল</Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
              {zipTables.map((t) => (
                <div key={t.name} className="flex items-center justify-between bg-background/40 border border-border rounded-lg px-3 py-2">
                  <span className="text-xs font-mono truncate">{t.name}</span>
                  <Badge className={t.known ? "bg-primary/15 text-primary border-primary/30" : "bg-amber-500/15 text-amber-400 border-amber-500/30"}>
                    {t.rows}
                  </Badge>
                </div>
              ))}
            </div>

            <GlassCard className="p-3 border-amber-500/30 bg-amber-500/[0.04]">
              <div className="flex items-start gap-2 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  Restore করলে একই ID-এর পুরনো ডেটা ZIP-এর ডেটা দিয়ে <b>overwrite</b> হবে, আর নতুন ডেটা যোগ হবে।
                  এটি undo করা যাবে না — আগে বর্তমান ডেটার backup নিয়ে নিন।
                </p>
              </div>
            </GlassCard>

            <Button onClick={runRestore} disabled={restoring} className="w-full sm:w-auto">
              {restoring ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
              {restoring ? restoreProgress || "Restore চলছে…" : "Restore শুরু করুন"}
            </Button>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".zip,application/zip"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleZipPick(f); }}
        />

        {restoreResults && (
          <div className="mt-5 space-y-1.5">
            <p className="text-sm font-semibold mb-2">Restore ফলাফল</p>
            {restoreResults.map((r) => (
              <div key={r.table} className="flex items-center justify-between text-xs bg-background/40 border border-border rounded-lg px-3 py-2">
                <span className="flex items-center gap-2 font-mono">
                  {r.ok ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                  {r.table}
                </span>
                <span className="text-muted-foreground">{r.ok ? `${r.rows} rows` : r.error}</span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* ---------- Per-table export ---------- */}
      <SectionTitle>প্রতিটি Table আলাদাভাবে Export</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {TABLES.map((t) => (
          <GlassCard key={t.name} className="p-4" hover>
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0">
                <p className="font-bold text-sm">{t.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{t.desc}</p>
              </div>
              {counts[t.name] !== undefined && (
                <Badge className="bg-primary/15 text-primary border-primary/30 shrink-0">{counts[t.name]} rows</Badge>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline" size="sm" className="flex-1"
                onClick={() => exportTable(t.name, "csv")}
                disabled={busy === `${t.name}:csv`}
              >
                {busy === `${t.name}:csv` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />}
                CSV
              </Button>
              <Button
                variant="outline" size="sm" className="flex-1"
                onClick={() => exportTable(t.name, "json")}
                disabled={busy === `${t.name}:json`}
              >
                {busy === `${t.name}:json` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileJson className="w-3.5 h-3.5 mr-1.5" />}
                JSON
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </AdminPage>
  );
};

export default AdminBackupCenter;
