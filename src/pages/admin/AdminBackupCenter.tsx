import { useState } from "react";
import { Database, Download, FileJson, FileSpreadsheet, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage, AdminPageHeader, GlassCard, SectionTitle } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const TABLES = [
  { name: "orders", label: "Orders", desc: "সব অর্ডার ও payment status" },
  { name: "leads", label: "Leads", desc: "Quote & contact form submissions" },
  { name: "payment_submissions", label: "Payment Submissions", desc: "Manual payment proof submissions" },
  { name: "products", label: "Products", desc: "Product catalog" },
  { name: "service_packages", label: "Service Packages", desc: "All published packages" },
  { name: "blog_posts", label: "Blog Posts", desc: "Articles & drafts" },
  { name: "testimonials", label: "Testimonials", desc: "Client reviews" },
  { name: "team_members", label: "Team Members", desc: "Owner ও staff profiles" },
  { name: "faqs", label: "FAQs", desc: "Q&A entries" },
  { name: "newsletter_subscribers", label: "Newsletter", desc: "Email subscribers" },
  { name: "audit_logs", label: "Audit Logs", desc: "Admin activity history" },
  { name: "wallet_transactions", label: "Wallet Transactions", desc: "All wallet ledger entries" },
] as const;

const downloadFile = (filename: string, content: string, mime: string) => {
  const blob = new Blob([content], { type: mime });
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

  const exportTable = async (table: string, format: "csv" | "json") => {
    setBusy(`${table}:${format}`);
    try {
      const { data, error } = await (supabase as any).from(table).select("*").limit(10000);
      if (error) throw error;
      const rows = data || [];
      setCounts((c) => ({ ...c, [table]: rows.length }));
      const ts = new Date().toISOString().slice(0, 10);
      if (format === "csv") {
        downloadFile(`${table}_${ts}.csv`, toCSV(rows), "text/csv");
      } else {
        downloadFile(`${table}_${ts}.json`, JSON.stringify(rows, null, 2), "application/json");
      }
      toast.success(`${table}: ${rows.length} rows exported`);
    } catch (e: any) {
      toast.error(e.message || "Export failed");
    } finally {
      setBusy(null);
    }
  };

  const exportAll = async () => {
    setBusy("all");
    try {
      const dump: Record<string, any[]> = {};
      for (const t of TABLES) {
        const { data, error } = await (supabase as any).from(t.name).select("*").limit(10000);
        if (error) { console.warn(t.name, error); continue; }
        dump[t.name] = data || [];
      }
      const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      downloadFile(`shahedit_backup_${ts}.json`, JSON.stringify({
        exported_at: new Date().toISOString(),
        tables: dump,
      }, null, 2), "application/json");
      toast.success("Full backup ready");
    } catch (e: any) {
      toast.error(e.message || "Backup failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <AdminPage>
      <AdminPageHeader
        title="Backup & Export Center"
        subtitle="যেকোনো table CSV/JSON-এ ডাউনলোড, সম্পূর্ণ database snapshot"
        icon={Database}
        actions={
          <Button onClick={exportAll} disabled={!!busy}>
            {busy === "all" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            সম্পূর্ণ Backup ডাউনলোড
          </Button>
        }
      />

      <GlassCard className="p-4 mb-6 border-emerald-500/30 bg-emerald-500/[0.04]">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-emerald-300">নিরাপদ Export</p>
            <p className="text-muted-foreground text-xs mt-0.5">
              সব data RLS policy অনুযায়ী export হবে। প্রতি table থেকে সর্বোচ্চ ১০,০০০ row। Backup file নিরাপদে রাখুন।
            </p>
          </div>
        </div>
      </GlassCard>

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
