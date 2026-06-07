import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Wallet, RefreshCw, Search, Plus, Minus, ArrowDownCircle, ArrowUpCircle,
  ShoppingBag, RotateCcw, Gift, Banknote, Filter, X, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type WalletRow = {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  updated_at: string;
  created_at: string;
};

type TxRow = {
  id: string;
  wallet_id: string;
  user_id: string;
  type: string;
  direction: "credit" | "debit";
  amount: number;
  balance_after: number;
  description: string | null;
  reference_type: string | null;
  reference_id: string | null;
  product_title: string | null;
  payment_method: string | null;
  performed_by: string | null;
  created_at: string;
};

type ProfileLite = { user_id: string; full_name: string | null; avatar_url: string | null };

const TYPE_META: Record<string, { label: string; icon: any; tone: string }> = {
  topup:              { label: "টপ-আপ",        icon: ArrowDownCircle, tone: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  purchase:           { label: "ক্রয়",          icon: ShoppingBag,     tone: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  refund:             { label: "রিফান্ড",       icon: RotateCcw,       tone: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
  adjustment_credit:  { label: "Adjust +",      icon: Plus,            tone: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  adjustment_debit:   { label: "Adjust −",      icon: Minus,           tone: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  withdrawal:         { label: "উইথড্রয়াল",     icon: ArrowUpCircle,   tone: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  bonus:              { label: "বোনাস",         icon: Gift,            tone: "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20" },
};

const formatBDT = (n: number) =>
  `৳ ${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const AdminWallets = () => {
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({});
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [txs, setTxs] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWallet, setSelectedWallet] = useState<WalletRow | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjForm, setAdjForm] = useState({ type: "adjustment_credit", amount: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    const [{ data: w }, { data: t }] = await Promise.all([
      (supabase as any).from("wallets").select("*").order("updated_at", { ascending: false }),
      (supabase as any).from("wallet_transactions").select("*").order("created_at", { ascending: false }).limit(500),
    ]);
    const ws: WalletRow[] = w ?? [];
    const ts: TxRow[] = t ?? [];
    setWallets(ws);
    setTxs(ts);

    const ids = Array.from(new Set([...ws.map(x => x.user_id), ...ts.map(x => x.user_id)]));
    if (ids.length) {
      const { data: profs } = await (supabase as any)
        .from("profiles").select("user_id, full_name, avatar_url").in("user_id", ids);
      const pmap: Record<string, ProfileLite> = {};
      (profs ?? []).forEach((p: ProfileLite) => { pmap[p.user_id] = p; });
      setProfiles(pmap);
    }
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const userLabel = (uid: string) =>
    profiles[uid]?.full_name || emails[uid] || uid.slice(0, 8) + "…";

  const stats = useMemo(() => {
    const totalBalance = wallets.reduce((s, w) => s + Number(w.balance), 0);
    const credits = txs.filter(t => t.direction === "credit").reduce((s, t) => s + Number(t.amount), 0);
    const debits  = txs.filter(t => t.direction === "debit").reduce((s, t) => s + Number(t.amount), 0);
    return { totalBalance, credits, debits, txCount: txs.length, walletCount: wallets.length };
  }, [wallets, txs]);

  const filteredTxs = useMemo(() => {
    let arr = txs;
    if (selectedWallet) arr = arr.filter(t => t.wallet_id === selectedWallet.id);
    if (typeFilter !== "all") arr = arr.filter(t => t.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(t =>
        (t.description ?? "").toLowerCase().includes(q) ||
        (t.product_title ?? "").toLowerCase().includes(q) ||
        (t.reference_id ?? "").toLowerCase().includes(q) ||
        userLabel(t.user_id).toLowerCase().includes(q)
      );
    }
    return arr;
  }, [txs, selectedWallet, typeFilter, search, profiles]);

  const filteredWallets = useMemo(() => {
    if (!search.trim()) return wallets;
    const q = search.toLowerCase();
    return wallets.filter(w => userLabel(w.user_id).toLowerCase().includes(q));
  }, [wallets, search, profiles]);

  const submitAdjust = async () => {
    if (!selectedWallet) return;
    const amt = Number(adjForm.amount);
    if (!amt || amt <= 0) { toast.error("সঠিক amount দিন"); return; }
    setSubmitting(true);
    const { error } = await (supabase as any).rpc("wallet_apply_transaction", {
      _user_id: selectedWallet.user_id,
      _type: adjForm.type,
      _amount: amt,
      _description: adjForm.description || null,
      _reference_type: "manual",
      _reference_id: null,
      _product_title: null,
      _payment_method: null,
      _metadata: {},
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("ওয়ালেট আপডেট হয়েছে");
    setAdjustOpen(false);
    setAdjForm({ type: "adjustment_credit", amount: "", description: "" });
    loadAll();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wallet size={22} className="text-violet-400" />
            ওয়ালেট ম্যানেজমেন্ট
          </h1>
          <p className="text-slate-400 text-sm">প্রতিটি ইউজারের ওয়ালেট ব্যালেন্স ও সম্পূর্ণ ট্রানজেকশন হিস্ট্রি</p>
        </div>
        <Button onClick={loadAll} variant="outline" size="sm" className="gap-2 border-slate-700 text-slate-300">
          <RefreshCw size={14} /> রিফ্রেশ
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "মোট ওয়ালেট",      value: stats.walletCount,                color: "text-white" },
          { label: "মোট ব্যালেন্স (৳)", value: stats.totalBalance.toLocaleString("en-IN"), color: "text-violet-300" },
          { label: "মোট ক্রেডিট (৳)",  value: stats.credits.toLocaleString("en-IN"),     color: "text-emerald-400" },
          { label: "মোট ডেবিট (৳)",   value: stats.debits.toLocaleString("en-IN"),      color: "text-rose-400" },
          { label: "ট্রানজেকশন",        value: stats.txCount,                          color: "text-sky-400" },
        ].map(s => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ইউজার, description, order ID..."
            className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48 bg-slate-900 border-slate-800 text-white">
            <Filter size={14} className="mr-1 text-slate-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব ধরনের</SelectItem>
            {Object.entries(TYPE_META).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedWallet && (
          <Button variant="outline" size="sm" onClick={() => setSelectedWallet(null)}
            className="gap-1 border-violet-500/30 text-violet-300">
            <X size={14} /> ফিল্টার ক্লিয়ার
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-4">
        {/* Wallets list */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 text-slate-300 text-sm font-semibold">
            ইউজার ওয়ালেট ({filteredWallets.length})
          </div>
          <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-800">
            {loading ? (
              <div className="p-6 text-center text-slate-500 text-sm">লোড হচ্ছে...</div>
            ) : filteredWallets.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">কোনো ওয়ালেট নেই</div>
            ) : (
              filteredWallets.map(w => {
                const active = selectedWallet?.id === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => setSelectedWallet(active ? null : w)}
                    className={`w-full text-left p-3 transition-colors ${active ? "bg-violet-500/10" : "hover:bg-slate-800/50"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white grid place-items-center text-xs font-bold flex-shrink-0">
                          {userLabel(w.user_id).slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-white font-medium truncate">{userLabel(w.user_id)}</p>
                          <p className="text-[10px] text-slate-500 truncate">{w.user_id}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-emerald-400 whitespace-nowrap">{formatBDT(w.balance)}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-2">
            <div className="text-slate-300 text-sm font-semibold flex items-center gap-2">
              {selectedWallet ? (
                <>
                  <User size={14} className="text-violet-400" />
                  {userLabel(selectedWallet.user_id)} — ট্রানজেকশন
                </>
              ) : (
                <>সব ট্রানজেকশন ({filteredTxs.length})</>
              )}
            </div>
            {selectedWallet && (
              <Button size="sm" onClick={() => setAdjustOpen(true)}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white gap-1">
                <Banknote size={14} /> Adjust Balance
              </Button>
            )}
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-500 text-sm">লোড হচ্ছে...</div>
            ) : filteredTxs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">কোনো ট্রানজেকশন নেই</div>
            ) : (
              <div className="divide-y divide-slate-800">
                {filteredTxs.map((t, i) => {
                  const meta = TYPE_META[t.type] ?? { label: t.type, icon: Wallet, tone: "text-slate-300 bg-slate-700/30 border-slate-700" };
                  const Icon = meta.icon;
                  const sign = t.direction === "credit" ? "+" : "−";
                  return (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.015, 0.3) }}
                      className="p-3.5 hover:bg-slate-800/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className={`w-9 h-9 rounded-xl border grid place-items-center flex-shrink-0 ${meta.tone}`}>
                            <Icon size={15} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold ${meta.tone}`}>
                                {meta.label}
                              </span>
                              {!selectedWallet && (
                                <span className="text-xs text-slate-400">{userLabel(t.user_id)}</span>
                              )}
                              <span className="text-[11px] text-slate-500">
                                {new Date(t.created_at).toLocaleString("bn-BD")}
                              </span>
                            </div>
                            <p className="text-sm text-slate-200 mt-1 truncate">
                              {t.product_title || t.description || (t.reference_type ? `${t.reference_type}` : "—")}
                            </p>
                            <div className="flex gap-3 mt-1 flex-wrap text-[11px] text-slate-500">
                              {t.payment_method && <span>মেথড: {t.payment_method}</span>}
                              {t.reference_id && <span>Ref: {t.reference_id}</span>}
                              <span>Balance after: {formatBDT(t.balance_after)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-base font-bold ${t.direction === "credit" ? "text-emerald-400" : "text-rose-400"}`}>
                            {sign} {formatBDT(t.amount)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Adjust modal */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Wallet Balance Adjust করুন</DialogTitle>
          </DialogHeader>
          {selectedWallet && (
            <div className="space-y-3">
              <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-3 text-sm">
                <p className="text-slate-400">ইউজার</p>
                <p className="font-semibold">{userLabel(selectedWallet.user_id)}</p>
                <p className="text-emerald-400 mt-1">বর্তমান: {formatBDT(selectedWallet.balance)}</p>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">ধরন</label>
                <Select value={adjForm.type} onValueChange={v => setAdjForm({ ...adjForm, type: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adjustment_credit">Credit (+)</SelectItem>
                    <SelectItem value="adjustment_debit">Debit (−)</SelectItem>
                    <SelectItem value="bonus">Bonus</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Amount (BDT)</label>
                <Input type="number" min="1" step="0.01" value={adjForm.amount}
                  onChange={e => setAdjForm({ ...adjForm, amount: e.target.value })}
                  className="bg-slate-800 border-slate-700" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Description / কারণ</label>
                <Input value={adjForm.description}
                  onChange={e => setAdjForm({ ...adjForm, description: e.target.value })}
                  placeholder="যেমন: প্রমোশনাল বোনাস"
                  className="bg-slate-800 border-slate-700" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustOpen(false)} className="border-slate-700 text-slate-300">বাতিল</Button>
            <Button onClick={submitAdjust} disabled={submitting}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">
              {submitting ? "প্রসেস হচ্ছে..." : "Apply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWallets;
