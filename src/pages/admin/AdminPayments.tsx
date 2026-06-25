import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, RefreshCw, Settings, Zap, User, Phone, CreditCard, Hash, Receipt, History, RefreshCcw, ExternalLink, ArrowDownToLine, ArrowUpFromLine, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { openInvoice } from "@/lib/invoice";
import { PaymentMethodsManager } from "@/components/admin/PaymentMethodsManager";
import { WalletSettingsManager } from "@/components/admin/WalletSettingsManager";

type TxRow = {
  id: string;
  source: "submission" | "bkash" | "wallet";
  date: string;
  name: string;
  method: string;
  amount: number;
  direction: "credit" | "debit";
  status: string;
  reference: string;
};

const STATUS_PILL: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  confirmed: "bg-green-500/10 text-green-400 border-green-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
};

interface Payment {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  service: string | null;
  amount: number;
  payment_method: string;
  transaction_id: string;
  note: string | null;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  confirmed: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};
const statusLabels: Record<string, string> = {
  pending: "অপেক্ষামান",
  confirmed: "নিশ্চিত",
  rejected: "বাতিল",
};

const AdminPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [savingMode, setSavingMode] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "rejected">("all");

  const fetchPayments = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from("payment_submissions").select("*").order("created_at", { ascending: false });
    setPayments(data ?? []);
    setLoading(false);
  };

  const fetchMode = async () => {
    const { data } = await supabase.from("site_settings").select("value").eq("key", "payment_verification_mode").single();
    if (data) setMode(data.value as "manual" | "auto");
  };

  // Transaction history (combined sources)
  const [txRows, setTxRows] = useState<TxRow[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txSearch, setTxSearch] = useState("");
  const [txSourceFilter, setTxSourceFilter] = useState<"all" | "submission" | "bkash" | "wallet">("all");

  const fetchTransactions = async () => {
    setTxLoading(true);
    const db = supabase as any;
    const [subs, bkash, wallet] = await Promise.all([
      db.from("payment_submissions").select("id,name,amount,payment_method,transaction_id,status,created_at").order("created_at", { ascending: false }).limit(500),
      db.from("bkash_transactions").select("id,customer_name,amount,trx_id,status,mode,created_at,payment_create_time").order("created_at", { ascending: false }).limit(500),
      db.from("wallet_transactions").select("id,user_id,type,direction,amount,payment_method,reference_id,description,created_at").order("created_at", { ascending: false }).limit(500),
    ]);
    const rows: TxRow[] = [];
    (subs.data ?? []).forEach((s: any) => rows.push({
      id: `sub-${s.id}`, source: "submission", date: s.created_at, name: s.name, method: s.payment_method,
      amount: Number(s.amount), direction: "credit", status: s.status, reference: s.transaction_id || "—",
    }));
    (bkash.data ?? []).forEach((b: any) => rows.push({
      id: `bk-${b.id}`, source: "bkash", date: b.created_at || b.payment_create_time, name: b.customer_name || "Customer",
      method: `bKash ${b.mode || ""}`.trim(), amount: Number(b.amount), direction: "credit", status: (b.status || "pending").toLowerCase(), reference: b.trx_id || "—",
    }));
    (wallet.data ?? []).forEach((w: any) => rows.push({
      id: `wl-${w.id}`, source: "wallet", date: w.created_at, name: w.description || w.type,
      method: w.payment_method || "Wallet", amount: Number(w.amount), direction: w.direction, status: "completed",
      reference: w.reference_id || w.type,
    }));
    rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTxRows(rows);
    setTxLoading(false);
  };

  const exportTxCsv = () => {
    const filtered = txRows.filter(r => (txSourceFilter === "all" || r.source === txSourceFilter) && (!txSearch || JSON.stringify(r).toLowerCase().includes(txSearch.toLowerCase())));
    const header = "Date,Source,Name,Method,Amount,Direction,Status,Reference\n";
    const body = filtered.map(r => `"${new Date(r.date).toISOString()}","${r.source}","${r.name}","${r.method}",${r.amount},${r.direction},${r.status},"${r.reference}"`).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `transactions-${Date.now()}.csv`; a.click();
  };

  // Refund history
  const [refunds, setRefunds] = useState<any[]>([]);
  const fetchRefunds = async () => {
    const { data } = await (supabase as any).from("refund_requests").select("*").order("created_at", { ascending: false }).limit(200);
    setRefunds(data ?? []);
  };

  useEffect(() => { fetchPayments(); fetchMode(); fetchTransactions(); fetchRefunds(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await (supabase as any).from("payment_submissions").update({ status }).eq("id", id);
    if (error) { toast.error("আপডেট ব্যর্থ হয়েছে"); return; }
    toast.success(status === "confirmed" ? "✅ পেমেন্ট নিশ্চিত করা হয়েছে" : "❌ পেমেন্ট বাতিল করা হয়েছে");
    fetchPayments();
  };

  const autoVerify = async (payment: Payment) => {
    setVerifying(payment.id);
    try {
      const { data, error } = await supabase.functions.invoke("verify-payment", {
        body: { transaction_id: payment.transaction_id, payment_method: payment.payment_method },
      });
      if (error) { toast.error("ভেরিফিকেশনে সমস্যা হয়েছে"); return; }
      if (data.needs_config) { toast.error("API credentials কনফিগার করা নেই।"); return; }
      if (data.verified) {
        toast.success(`✅ ${data.message}`);
        fetchPayments();
      } else {
        toast.error(`❌ ${data.message}`);
      }
    } catch {
      toast.error("ভেরিফিকেশন ব্যর্থ হয়েছে");
    }
    setVerifying(null);
  };

  const saveMode = async () => {
    setSavingMode(true);
    await supabase.from("site_settings").update({ value: mode }).eq("key", "payment_verification_mode");
    setSavingMode(false);
    toast.success(`মোড পরিবর্তন হয়েছে: ${mode === "manual" ? "ম্যানুয়াল" : "অটো"}`);
  };

  const filtered = payments.filter(p => filter === "all" ? true : p.status === filter);

  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === "pending").length,
    confirmed: payments.filter(p => p.status === "confirmed").length,
    rejected: payments.filter(p => p.status === "rejected").length,
    totalAmount: payments.filter(p => p.status === "confirmed").reduce((s, p) => s + Number(p.amount), 0),
  };

  const filteredTx = txRows.filter(r =>
    (txSourceFilter === "all" || r.source === txSourceFilter) &&
    (!txSearch || `${r.name} ${r.reference} ${r.method} ${r.status}`.toLowerCase().includes(txSearch.toLowerCase()))
  );
  const refundStats = {
    total: refunds.length,
    pending: refunds.filter(r => r.status === "pending").length,
    approved: refunds.filter(r => ["approved", "processing", "completed"].includes(r.status)).length,
    rejected: refunds.filter(r => r.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Payment Management</h1>
          <p className="text-slate-400 text-sm">Gateway · Manual Payment · Verification · Transactions · Refunds</p>
        </div>
        <Button onClick={() => { fetchPayments(); fetchTransactions(); fetchRefunds(); }} variant="outline" size="sm" className="gap-2 border-slate-700 text-slate-300">
          <RefreshCw size={14} /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "মোট", value: stats.total, color: "text-white" },
          { label: "অপেক্ষামান", value: stats.pending, color: "text-yellow-400" },
          { label: "নিশ্চিত", value: stats.confirmed, color: "text-green-400" },
          { label: "বাতিল", value: stats.rejected, color: "text-red-400" },
          { label: "আয় (৳)", value: stats.totalAmount.toLocaleString("en-IN"), color: "text-purple-400" },
        ].map(s => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="verification" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800 flex flex-wrap h-auto">
          <TabsTrigger value="verification" className="gap-1.5"><CheckCircle size={14} />Verification</TabsTrigger>
          <TabsTrigger value="manual" className="gap-1.5"><CreditCard size={14} />Manual Payment</TabsTrigger>
          <TabsTrigger value="gateway" className="gap-1.5"><Zap size={14} />Gateway</TabsTrigger>
          <TabsTrigger value="transactions" className="gap-1.5"><History size={14} />Transaction History</TabsTrigger>
          <TabsTrigger value="refunds" className="gap-1.5"><RefreshCcw size={14} />Refund History</TabsTrigger>
        </TabsList>

        <TabsContent value="verification" className="space-y-6 mt-4">

      {/* Verification Mode */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings size={16} className="text-purple-400" />
          <h2 className="text-white font-semibold text-sm">ভেরিফিকেশন মোড</h2>
        </div>
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setMode("manual")}
            className={`flex-1 rounded-xl border p-4 text-left transition-all ${mode === "manual" ? "border-purple-500 bg-purple-500/10" : "border-slate-700 hover:border-slate-600"}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <User size={16} className={mode === "manual" ? "text-purple-400" : "text-slate-400"} />
              <span className={`font-semibold text-sm ${mode === "manual" ? "text-white" : "text-slate-300"}`}>ম্যানুয়াল</span>
              {mode === "manual" && <span className="ml-auto text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">সক্রিয়</span>}
            </div>
            <p className="text-slate-500 text-xs">Admin প্যানেল থেকে Transaction ID যাচাই করে Approve/Reject করবেন</p>
          </button>

          <button
            onClick={() => setMode("auto")}
            className={`flex-1 rounded-xl border p-4 text-left transition-all ${mode === "auto" ? "border-teal-500 bg-teal-500/10" : "border-slate-700 hover:border-slate-600"}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Zap size={16} className={mode === "auto" ? "text-teal-400" : "text-slate-400"} />
              <span className={`font-semibold text-sm ${mode === "auto" ? "text-white" : "text-slate-300"}`}>অটো (API)</span>
              {mode === "auto" && <span className="ml-auto text-xs bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full">সক্রিয়</span>}
            </div>
            <p className="text-slate-500 text-xs">Bkash/Nagad API দিয়ে স্বয়ংক্রিয়ভাবে ভেরিফাই হবে (API credentials লাগবে)</p>
          </button>
        </div>
        <Button onClick={saveMode} disabled={savingMode} size="sm" className="bg-gradient-to-r from-purple-600 to-teal-600 text-white">
          {savingMode ? "সেভ হচ্ছে..." : "মোড সেভ করুন"}
        </Button>
        {mode === "auto" && (
          <p className="text-yellow-400 text-xs mt-3 flex items-center gap-1.5">
            ⚠️ Auto মোডের জন্য Admin Settings-এ Bkash/Nagad API credentials যোগ করুন
          </p>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "confirmed", "rejected"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
          >
            {f === "all" ? "সব" : statusLabels[f]}
            {f !== "all" && <span className="ml-1.5 opacity-70">{stats[f as keyof typeof stats]}</span>}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">লোড হচ্ছে...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500">কোনো পেমেন্ট নেই</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="p-4 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-white font-semibold text-sm flex items-center gap-1.5">
                        <User size={13} className="text-slate-400" /> {p.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[p.status] ?? statusColors.pending}`}>
                        {statusLabels[p.status] ?? p.status}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(p.created_at).toLocaleString("bn-BD")}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <span className="text-slate-400 flex items-center gap-1"><Phone size={11} /> {p.phone}</span>
                      <span className="text-slate-400 flex items-center gap-1"><CreditCard size={11} /> {p.payment_method}</span>
                      <span className="text-green-400 font-bold">৳ {Number(p.amount).toLocaleString("en-IN")}</span>
                      <span className="text-slate-400 flex items-center gap-1"><Hash size={11} /> {p.transaction_id}</span>
                    </div>
                    {(p.service || p.note) && (
                      <p className="text-slate-500 text-xs mt-1">
                        {p.service && <span>সার্ভিস: {p.service}</span>}
                        {p.note && <span className="ml-2">• {p.note}</span>}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openInvoice(p as any)}
                      className="text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/10 gap-1"
                    >
                      <Receipt size={12} /> Invoice
                    </Button>
                    {mode === "auto" && p.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => autoVerify(p)}
                        disabled={verifying === p.id}
                        className="text-xs border-teal-500/30 text-teal-400 hover:bg-teal-500/10 gap-1"
                      >
                        <Zap size={12} />
                        {verifying === p.id ? "যাচাই..." : "অটো"}
                      </Button>
                    )}
                    {p.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateStatus(p.id, "confirmed")}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs gap-1"
                        >
                          <CheckCircle size={12} /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(p.id, "rejected")}
                          className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 gap-1"
                        >
                          <XCircle size={12} /> Reject
                        </Button>
                      </>
                    )}
                    {p.status !== "pending" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateStatus(p.id, "pending")}
                        className="text-xs text-slate-400 gap-1"
                      >
                        <Clock size={12} /> Undo
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
        </TabsContent>

        <TabsContent value="manual" className="space-y-6 mt-4">
          <PaymentMethodsManager />
          <WalletSettingsManager />
        </TabsContent>

        <TabsContent value="gateway" className="space-y-4 mt-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-teal-400" />
              <h2 className="text-white font-semibold text-sm">Payment Gateway Integrations</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Link to="/ceo/bkash-pgw" className="border border-slate-800 hover:border-pink-500/40 bg-slate-950 rounded-xl p-4 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-pink-400 font-bold">bKash PGW</span>
                  <ExternalLink size={14} className="text-slate-500 group-hover:text-pink-400" />
                </div>
                <p className="text-slate-400 text-xs">Live merchant payments via bKash Payment Gateway. Configure App Key, Secret, callback URLs and view trx logs.</p>
              </Link>
              <div className="border border-slate-800 bg-slate-950 rounded-xl p-4 opacity-75">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-orange-400 font-bold">Nagad / Rocket / Upay</span>
                  <Badge variant="outline" className="text-[10px] text-slate-400">Manual</Badge>
                </div>
                <p className="text-slate-400 text-xs">Currently handled via Manual Payment numbers — configure receiver numbers in the Manual Payment tab.</p>
              </div>
            </div>
            <p className="text-slate-500 text-[11px] mt-4">Verification mode (manual vs auto API) is controlled in the Verification tab.</p>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4 mt-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                {(["all", "submission", "bkash", "wallet"] as const).map(s => (
                  <button key={s} onClick={() => setTxSourceFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${txSourceFilter === s ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                    {s === "all" ? "All Sources" : s === "submission" ? "Manual" : s === "bkash" ? "bKash" : "Wallet"}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <Input value={txSearch} onChange={e => setTxSearch(e.target.value)} placeholder="Search trx / name / ref" className="pl-7 h-8 w-56 text-xs bg-slate-950 border-slate-800" />
                </div>
                <Button size="sm" variant="outline" onClick={fetchTransactions} className="h-8 gap-1 border-slate-700 text-slate-300"><RefreshCw size={12} />Sync</Button>
                <Button size="sm" variant="outline" onClick={exportTxCsv} className="h-8 gap-1 border-slate-700 text-slate-300"><Download size={12} />CSV</Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-slate-500 uppercase text-[10px]">
                  <tr className="border-b border-slate-800">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Source</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Method</th>
                    <th className="text-right p-2">Amount</th>
                    <th className="text-center p-2">Status</th>
                    <th className="text-left p-2">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {txLoading ? (
                    <tr><td colSpan={7} className="text-center p-6 text-slate-500">Loading…</td></tr>
                  ) : filteredTx.length === 0 ? (
                    <tr><td colSpan={7} className="text-center p-6 text-slate-500">No transactions</td></tr>
                  ) : filteredTx.slice(0, 300).map(r => (
                    <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="p-2 text-slate-400">{new Date(r.date).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</td>
                      <td className="p-2"><Badge variant="outline" className="text-[10px]">{r.source}</Badge></td>
                      <td className="p-2 text-white">{r.name}</td>
                      <td className="p-2 text-slate-400">{r.method}</td>
                      <td className={`p-2 text-right font-semibold ${r.direction === "credit" ? "text-green-400" : "text-rose-400"}`}>
                        <span className="inline-flex items-center gap-1">
                          {r.direction === "credit" ? <ArrowDownToLine size={10} /> : <ArrowUpFromLine size={10} />}
                          ৳{r.amount.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="p-2 text-center"><span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_PILL[r.status] ?? "border-slate-700 text-slate-400"}`}>{r.status}</span></td>
                      <td className="p-2 font-mono text-[10px] text-slate-500">{r.reference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredTx.length > 300 && <p className="text-[10px] text-slate-500 text-center mt-2">Showing first 300 of {filteredTx.length} — refine filters or export CSV.</p>}
          </div>
        </TabsContent>

        <TabsContent value="refunds" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Requests", value: refundStats.total, color: "text-white" },
              { label: "Pending", value: refundStats.pending, color: "text-yellow-400" },
              { label: "Approved", value: refundStats.approved, color: "text-green-400" },
              { label: "Rejected", value: refundStats.rejected, color: "text-red-400" },
            ].map(s => (
              <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-slate-500 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold text-sm flex items-center gap-2"><RefreshCcw size={14} className="text-rose-400" />Recent Refund History</h2>
              <Link to="/ceo/refunds"><Button size="sm" variant="outline" className="gap-1 h-8 border-slate-700 text-slate-300"><ExternalLink size={12} />Manage Refunds</Button></Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-slate-500 uppercase text-[10px]">
                  <tr className="border-b border-slate-800">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Request #</th>
                    <th className="text-left p-2">Customer</th>
                    <th className="text-left p-2">Reason</th>
                    <th className="text-center p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {refunds.length === 0 ? (
                    <tr><td colSpan={5} className="text-center p-6 text-slate-500">No refund requests</td></tr>
                  ) : refunds.slice(0, 50).map(r => (
                    <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="p-2 text-slate-400">{new Date(r.created_at).toLocaleDateString("en-IN")}</td>
                      <td className="p-2 font-mono text-[10px] text-slate-300">{r.request_number || r.id.slice(0, 8)}</td>
                      <td className="p-2 text-white">{r.name} <span className="text-slate-500">· {r.email}</span></td>
                      <td className="p-2 text-slate-400 max-w-xs truncate">{r.reason}</td>
                      <td className="p-2 text-center"><span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_PILL[r.status] ?? "border-slate-700 text-slate-400"}`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPayments;
