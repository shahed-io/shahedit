import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, RefreshCw, Settings, Zap, User, Phone, CreditCard, Hash, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { openInvoice } from "@/lib/invoice";

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

  useEffect(() => { fetchPayments(); fetchMode(); }, []);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">পেমেন্ট ম্যানেজমেন্ট</h1>
          <p className="text-slate-400 text-sm">সকল পেমেন্ট দেখুন ও যাচাই করুন</p>
        </div>
        <Button onClick={fetchPayments} variant="outline" size="sm" className="gap-2 border-slate-700 text-slate-300">
          <RefreshCw size={14} /> রিফ্রেশ
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "মোট", value: stats.total, color: "text-white" },
          { label: "অপেক্ষামান", value: stats.pending, color: "text-yellow-400" },
          { label: "নিশ্চিত", value: stats.confirmed, color: "text-green-400" },
          { label: "বাতিল", value: stats.rejected, color: "text-red-400" },
          { label: "আয় (৳)", value: stats.totalAmount.toLocaleString(), color: "text-purple-400" },
        ].map(s => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

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
            <p className="text-slate-500 text-xs">bKash/Nagad API দিয়ে স্বয়ংক্রিয়ভাবে ভেরিফাই হবে (API credentials লাগবে)</p>
          </button>
        </div>
        <Button onClick={saveMode} disabled={savingMode} size="sm" className="bg-gradient-to-r from-purple-600 to-teal-600 text-white">
          {savingMode ? "সেভ হচ্ছে..." : "মোড সেভ করুন"}
        </Button>
        {mode === "auto" && (
          <p className="text-yellow-400 text-xs mt-3 flex items-center gap-1.5">
            ⚠️ Auto মোডের জন্য Admin Settings-এ bKash/Nagad API credentials যোগ করুন
          </p>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
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
                      <span className="text-green-400 font-bold">৳ {Number(p.amount).toLocaleString()}</span>
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
    </div>
  );
};

export default AdminPayments;
