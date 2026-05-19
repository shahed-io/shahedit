import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RefreshCw, Zap, CheckCircle2, AlertTriangle, Copy, Hash, Phone, User, Calendar, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BkashTxn {
  id: string;
  payment_id: string | null;
  payer_reference: string | null;
  customer_msisdn: string | null;
  trx_id: string | null;
  amount: number;
  currency: string;
  intent: string;
  merchant_invoice_number: string | null;
  status: string;
  mode: string;
  payment_create_time: string | null;
  payment_execute_time: string | null;
  user_email: string | null;
  customer_name: string | null;
  service: string | null;
  note: string | null;
  raw_payload: any;
  created_at: string;
}

const statusColors: Record<string, string> = {
  initiated: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
};

const AdminBkashPGW = () => {
  const [txns, setTxns] = useState<BkashTxn[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"sandbox" | "live">("sandbox");
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | "initiated" | "completed" | "failed">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const callbackUrl = `${window.location.origin}/payment/bkash/callback`;

  const fetchTxns = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from("bkash_transactions").select("*").order("created_at", { ascending: false });
    setTxns(data ?? []);
    setLoading(false);
  };

  const fetchMode = async () => {
    const { data } = await supabase.from("site_settings").select("value").eq("key", "bkash_pgw_mode").single();
    if (data?.value === "live" || data?.value === "sandbox") setMode(data.value as any);
  };

  useEffect(() => { fetchTxns(); fetchMode(); }, []);

  const saveMode = async (next: "sandbox" | "live") => {
    setSaving(true);
    setMode(next);
    await supabase.from("site_settings").upsert({ key: "bkash_pgw_mode", value: next, group_name: "payment", label: "bKash PGW Mode", type: "text" }, { onConflict: "key" });
    setSaving(false);
    toast.success(`bKash মোড: ${next.toUpperCase()}`);
  };

  const filtered = txns.filter(t => filter === "all" ? true : t.status === filter);
  const stats = {
    total: txns.length,
    initiated: txns.filter(t => t.status === "initiated").length,
    completed: txns.filter(t => t.status === "completed").length,
    failed: txns.filter(t => t.status === "failed").length,
    revenue: txns.filter(t => t.status === "completed").reduce((s, t) => s + Number(t.amount), 0),
  };

  const copy = (s: string) => { navigator.clipboard.writeText(s); toast.success("কপি হয়েছে"); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap size={22} className="text-pink-400" /> bKash Payment Gateway
          </h1>
          <p className="text-slate-400 text-sm">bKash PGW (Tokenized Checkout) — পেমেন্ট ও লেনদেন</p>
        </div>
        <Button onClick={fetchTxns} variant="outline" size="sm" className="gap-2 border-slate-700 text-slate-300">
          <RefreshCw size={14} /> রিফ্রেশ
        </Button>
      </div>

      {/* Mode + Config */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
        <div>
          <h2 className="text-white font-semibold text-sm mb-3">এনভায়রনমেন্ট মোড</h2>
          <div className="flex gap-3">
            {(["sandbox", "live"] as const).map(m => (
              <button
                key={m}
                onClick={() => saveMode(m)}
                disabled={saving}
                className={`flex-1 rounded-xl border p-4 text-left transition-all ${mode === m ? (m === "live" ? "border-green-500 bg-green-500/10" : "border-amber-500 bg-amber-500/10") : "border-slate-700 hover:border-slate-600"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-bold text-sm uppercase ${mode === m ? "text-white" : "text-slate-300"}`}>{m}</span>
                  {mode === m && <span className={`text-[10px] px-2 py-0.5 rounded-full ${m === "live" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>সক্রিয়</span>}
                </div>
                <p className="text-slate-400 text-xs">{m === "sandbox" ? "টেস্ট মোড — bKash sandbox URLs" : "প্রোডাকশন — আসল bKash অ্যাকাউন্ট"}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-white font-semibold text-sm mb-3">কনফিগারেশন</h2>
          <div className="space-y-2 text-xs">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-slate-500 mb-1">Callback URL (bKash মার্চেন্ট পোর্টালে যোগ করুন)</p>
                <p className="text-slate-200 font-mono truncate">{callbackUrl}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => copy(callbackUrl)} className="text-slate-300 gap-1"><Copy size={12} /></Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { k: "BKASH_APP_KEY", set: true },
                { k: "BKASH_APP_SECRET", set: true },
                { k: "BKASH_USERNAME", set: true },
                { k: "BKASH_PASSWORD", set: true },
              ].map(c => (
                <div key={c.k} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 flex items-center justify-between">
                  <span className="text-slate-300 font-mono text-[11px]">{c.k}</span>
                  <span className="flex items-center gap-1 text-green-400 text-[10px]"><CheckCircle2 size={11} /> সেট আছে</span>
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-[11px] flex items-start gap-1.5 pt-1">
              <AlertTriangle size={11} className="text-amber-400 mt-0.5 shrink-0" />
              ক্রেডেনশিয়াল আপডেট করতে: Admin → Settings → Secrets (BKASH_*).
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "মোট", value: stats.total, color: "text-white" },
          { label: "Initiated", value: stats.initiated, color: "text-blue-400" },
          { label: "Completed", value: stats.completed, color: "text-green-400" },
          { label: "Failed", value: stats.failed, color: "text-red-400" },
          { label: "আয় (৳)", value: stats.revenue.toLocaleString("en-IN"), color: "text-pink-400" },
        ].map(s => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "initiated", "completed", "failed"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? "bg-pink-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
            {f === "all" ? "সব" : f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">লোড হচ্ছে...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500">কোনো লেনদেন নেই</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filtered.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="p-4 hover:bg-slate-800/40 transition-colors">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-white font-semibold text-sm flex items-center gap-1.5"><User size={12} className="text-slate-400" />{t.customer_name || "—"}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusColors[t.status] ?? statusColors.initiated}`}>{t.status}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${t.mode === "live" ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"}`}>{t.mode}</span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1"><Calendar size={10} />{new Date(t.created_at).toLocaleString("bn-BD")}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
                      <span className="text-slate-400 flex items-center gap-1"><Hash size={10} /> Payment ID: <code className="text-slate-200 font-mono text-[11px]">{t.payment_id || "—"}</code></span>
                      <span className="text-slate-400 flex items-center gap-1"><Receipt size={10} /> TrxID: <code className="text-green-300 font-mono text-[11px]">{t.trx_id || "—"}</code></span>
                      <span className="text-slate-400 flex items-center gap-1"><Phone size={10} /> {t.customer_msisdn || t.payer_reference || "—"}</span>
                      <span className="text-pink-400 font-bold">৳ {Number(t.amount).toLocaleString("en-IN")} {t.currency}</span>
                      <span className="text-slate-500 col-span-2">Invoice: {t.merchant_invoice_number} {t.service ? `• ${t.service}` : ""}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setExpanded(expanded === t.id ? null : t.id)} className="text-xs text-slate-300">
                    {expanded === t.id ? "Hide" : "Raw"}
                  </Button>
                </div>
                {expanded === t.id && (
                  <pre className="mt-3 bg-slate-950 border border-slate-800 rounded-lg p-3 text-[11px] text-slate-300 overflow-auto max-h-64">
{JSON.stringify(t.raw_payload, null, 2)}
                  </pre>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBkashPGW;
