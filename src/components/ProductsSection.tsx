import { Star, ArrowRight, Zap, CreditCard, MessageCircle, X, Copy, Smartphone, Send, CheckCircle, ChevronRight, ChevronLeft, Info, PenLine, Search, User as UserIcon, Mail, Phone, Tag, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { useWalletSettings } from "@/hooks/useWalletSettings";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sanitizeHtml } from "@/lib/sanitize";
import { StarRating } from "@/components/StarRating";
import { useProductRating } from "@/hooks/useProductRatings";

export interface ServicePackageRow {
  id: string;
  slug?: string | null;
  title: string;
  description: string | null;
  short_description?: string | null;
  price: number | null;
  original_price: number | null;
  currency: string;
  badge: string | null;
  is_featured: boolean;
  sort_order: number;
  service_id: string;
  image_url: string | null;
  features: string[] | null;
  services?: { title: string } | null;
}

// Hardcoded fallback removed — payment methods now come from `payment_methods` table
// (see usePaymentMethods hook). Admin can edit numbers from Admin → Payments page.


export const formatPrice = (price: number) => `৳ ${price.toLocaleString("en-IN")}`;

export const cardColors = [
  { color: "hsl(270,92%,65%)", bg: "rgba(168,85,247,0.10)", border: "rgba(168,85,247,0.22)" },
  { color: "hsl(320,90%,48%)", bg: "rgba(236,72,153,0.10)", border: "rgba(236,72,153,0.22)" },
  { color: "hsl(315,80%,65%)", bg: "rgba(236,72,153,0.10)", border: "rgba(236,72,153,0.22)" },
  { color: "hsl(270,92%,65%)", bg: "rgba(168,85,247,0.10)", border: "rgba(168,85,247,0.22)" },
  { color: "hsl(45,93%,58%)", bg: "rgba(234,179,8,0.10)", border: "rgba(234,179,8,0.22)" },
];

// ─── Premium Light-Theme Checkout Modal ──────────────────────────────────────
type CheckoutStep = "info" | "pay" | "done";

type PayMethodId = "bkash_online" | "wallet";

interface PayMethodTile {
  id: PayMethodId;
  label: string;
  sublabel: string;
  iconBg: string;
  iconText: string;
}

const CHECKOUT_METHODS: PayMethodTile[] = [
  { id: "bkash_online", label: "bKash (Online)", sublabel: "Instant Pay", iconBg: "linear-gradient(135deg,#E2136E,#a8104f)", iconText: "bK" },
  { id: "wallet",       label: "Wallet",          sublabel: "Top-up / Send", iconBg: "linear-gradient(135deg,#7c3aed,#a855f7)", iconText: "Wt" },
];

export const PaymentModal = ({ pkg, onClose }: { pkg: ServicePackageRow; onClose: () => void }) => {
  const { user } = useAuth();
  const { methods: dbMethods } = usePaymentMethods();
  const { settings: wallet } = useWalletSettings();
  // Kept for reference but no longer surfaced in checkout — wallet now goes via bKash PGW.
  void dbMethods;

  const [step, setStep] = useState<CheckoutStep>("info");
  const [selected, setSelected] = useState<PayMethodId>("bkash_online");
  const [loading, setLoading] = useState(false);
  const [bkashLoading, setBkashLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState<{ code: string; amount: number } | null>(null);
  const [topupAmount, setTopupAmount] = useState<number>(0);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", transaction_id: "", note: "",
  });

  // Initialize default top-up amount once settings load
  useEffect(() => {
    if (!topupAmount && wallet.quickAmounts.length > 0) {
      setTopupAmount(wallet.quickAmounts[0]);
    }
  }, [wallet.quickAmounts, topupAmount]);

  // Hide Wallet method if admin disabled it
  const availableMethods = useMemo(
    () => CHECKOUT_METHODS.filter(m => m.id !== "wallet" || wallet.enabled),
    [wallet.enabled]
  );

  // If wallet was selected but admin disabled it, fall back to bKash online
  useEffect(() => {
    if (selected === "wallet" && !wallet.enabled) setSelected("bkash_online");
  }, [selected, wallet.enabled]);

  // Prefill from logged-in user
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("user_id", user.id)
        .maybeSingle();
      setForm(f => ({
        ...f,
        email: f.email || user.email || "",
        name: f.name || data?.full_name || (user.user_metadata as any)?.full_name || "",
        phone: f.phone || (data as any)?.phone || "",
      }));
    })();
  }, [user]);

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const basePrice = pkg.price ?? 0;
  const finalPrice = Math.max(0, basePrice - (discount?.amount ?? 0));
  const serviceName = `${pkg.services?.title ?? ""} — ${pkg.title}`;

  const copyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    toast.success("নম্বর কপি হয়েছে!");
  };

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) { toast.error("কুপন কোড দিন"); return; }
    setCouponLoading(true);
    const { data, error } = await supabase
      .from("coupons" as any).select("*").eq("code", code).eq("is_active", true).maybeSingle();
    setCouponLoading(false);
    if (error || !data) { toast.error("কুপন কোড সঠিক নয়"); return; }
    const c: any = data;
    const now = new Date();
    if (c.valid_from && new Date(c.valid_from) > now) { toast.error("কুপন এখনো সক্রিয় হয়নি"); return; }
    if (c.valid_until && new Date(c.valid_until) < now) { toast.error("কুপনের মেয়াদ শেষ"); return; }
    if (c.max_uses && c.used_count >= c.max_uses) { toast.error("কুপনের সীমা শেষ"); return; }
    if (c.min_order_amount && basePrice < Number(c.min_order_amount)) {
      toast.error(`এই কুপনের জন্য সর্বনিম্ন অর্ডার ৳${c.min_order_amount}`); return;
    }
    const amount = c.discount_type === "percentage"
      ? Math.round((basePrice * Number(c.discount_value)) / 100)
      : Number(c.discount_value);
    setDiscount({ code: c.code, amount: Math.min(amount, basePrice) });
    toast.success(`কুপন প্রয়োগ হয়েছে! ৳${Math.min(amount, basePrice)} ছাড়`);
  };

  const goNextFromInfo = () => {
    if (!form.name.trim()) { toast.error("নাম লিখুন"); return; }
    if (!form.phone.trim() || form.phone.trim().length < 11) { toast.error("সঠিক মোবাইল নম্বর দিন"); return; }
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) { toast.error("সঠিক ইমেইল দিন"); return; }
    setStep("pay");
  };

  // bKash PGW: redirect to hosted checkout.
  // `mode` selects label: "purchase" for product checkout, "topup" for wallet top-up.
  const payWithBkashOnline = async (mode: "purchase" | "topup" = "purchase") => {
    const isTopup = mode === "topup";
    const amount = isTopup ? topupAmount : finalPrice;
    if (isTopup) {
      if (!amount || amount < wallet.min) { toast.error(`সর্বনিম্ন টপ-আপ ৳${wallet.min}`); return; }
      if (amount > wallet.max) { toast.error(`সর্বোচ্চ টপ-আপ ৳${wallet.max}`); return; }
    }
    setBkashLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("bkash-create-payment", {
        body: {
          amount,
          customer_name: form.name,
          customer_msisdn: form.phone,
          email: form.email || null,
          service: isTopup ? `Wallet Top-up — ৳${amount}` : serviceName,
          note: [
            isTopup ? `Wallet Top-up for ${serviceName}` : null,
            discount ? `Coupon: ${discount.code} (-৳${discount.amount})` : null,
            form.note,
          ].filter(Boolean).join(" | ") || null,
          callback_url: `${window.location.origin}/payment/bkash/callback`,
        },
      });
      if (error || !data?.success) {
        toast.error(data?.error || "bKash পেমেন্ট শুরু করা যায়নি");
        return;
      }
      window.location.href = data.bkashURL;
    } catch {
      toast.error("সমস্যা হয়েছে, আবার চেষ্টা করুন");
    } finally {
      setBkashLoading(false);
    }
  };

  const handlePay = () => {
    if (selected === "bkash_online") payWithBkashOnline("purchase");
    else payWithBkashOnline("topup");
  };
  void loading; void setLoading;


  // Light-theme input class
  const inputCls = "w-full rounded-xl pl-10 pr-3 py-3 text-sm bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-100 transition-all";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Locked backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative w-full max-w-md rounded-[28px] overflow-hidden max-h-[92vh] overflow-y-auto bg-white"
        style={{
          boxShadow: '0 30px 80px -20px rgba(124,58,237,0.25), 0 8px 30px -8px rgba(0,0,0,0.15)',
          border: '1px solid rgba(226,232,240,0.9)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,#fce7f3,#ede9fe)' }}>
              <Sparkles size={18} className="text-fuchsia-500" />
            </div>
            <h3 className="font-bold text-slate-800 text-[15px] leading-tight truncate">{pkg.title}</h3>
          </div>
          <button onClick={onClose} aria-label="বন্ধ করুন"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pt-5 pb-6">
          {/* Step pill row */}
          {step !== "done" && (
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)' }}>
                  {step === "info" ? "1" : "2"}
                </div>
                <p className="text-[15px] font-bold text-slate-800">
                  {step === "info" ? "আপনার তথ্য দিন" : "পেমেন্ট করুন"}
                </p>
              </div>
              {step === "pay" && (
                <button onClick={() => setStep("info")}
                  className="text-xs font-semibold text-slate-500 hover:text-fuchsia-600 transition flex items-center gap-1">
                  <ChevronLeft size={14} /> পিছনে
                </button>
              )}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === "done" && (
              <motion.div key="done" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-10">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: 'linear-gradient(135deg,#22c55e,#10b981)', boxShadow: '0 0 40px rgba(34,197,94,0.3)' }}>
                  <CheckCircle size={40} className="text-white" />
                </motion.div>
                <h4 className="text-2xl font-black text-slate-800 mb-2">অর্ডার সফল! 🎉</h4>
                <p className="text-slate-500 text-sm mb-1">আপনার পেমেন্ট তথ্য আমরা পেয়েছি।</p>
                <p className="text-slate-400 text-xs">২৪ ঘন্টার মধ্যে WhatsApp/Email-এ কনফার্মেশন পাবেন।</p>
                <button onClick={onClose}
                  className="mt-7 px-8 py-3 rounded-2xl text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#ec4899,#d946ef)', boxShadow: '0 10px 25px -10px rgba(236,72,153,0.5)' }}>
                  বন্ধ করুন
                </button>
              </motion.div>
            )}

            {step === "info" && (
              <motion.div key="info" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-3.5">
                {user && (
                  <div className="flex items-center gap-2 text-[11px] font-semibold px-3 py-1.5 rounded-full w-fit bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle size={12} /> লগইন আছেন
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">পুরো নাম *</label>
                  <div className="relative">
                    <UserIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="আপনার নাম" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">ইমেইল *</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="example@email.com" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">ফোন নম্বর *</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="01XXXXXXXXX" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">কুপন কোড (ঐচ্ছিক)</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input value={couponCode} onChange={e => setCouponCode(e.target.value)}
                        disabled={!!discount} placeholder="SAVE20" className={inputCls + " uppercase disabled:opacity-60"} />
                    </div>
                    {discount ? (
                      <button type="button" onClick={() => { setDiscount(null); setCouponCode(""); }}
                        className="px-4 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                        সরান
                      </button>
                    ) : (
                      <button type="button" onClick={applyCoupon} disabled={couponLoading}
                        className="px-5 rounded-xl text-xs font-bold text-white transition"
                        style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)' }}>
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Price summary card */}
                <div className="rounded-2xl p-4 space-y-2 bg-gradient-to-br from-fuchsia-50 to-violet-50 border border-fuchsia-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">মূল্য</span>
                    <span className="font-bold text-slate-800">{formatPrice(basePrice)}</span>
                  </div>
                  {discount && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-emerald-600">কুপন ({discount.code})</span>
                      <span className="font-bold text-emerald-600">− {formatPrice(discount.amount)}</span>
                    </div>
                  )}
                  <div className="h-px bg-fuchsia-200/60" />
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-slate-800">মোট</span>
                    <span className="text-2xl font-black text-fuchsia-600">{formatPrice(finalPrice)}</span>
                  </div>
                </div>

                <motion.button whileTap={{ scale: 0.98 }} onClick={goNextFromInfo}
                  className="w-full py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#ec4899,#d946ef)', boxShadow: '0 10px 25px -10px rgba(236,72,153,0.5)' }}>
                  পেমেন্টে যান <ChevronRight size={16} />
                </motion.button>
              </motion.div>
            )}

            {step === "pay" && (
              <motion.div key="pay" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
                {/* Method tiles */}
                <div className={`grid gap-3 ${availableMethods.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                  {availableMethods.map(m => {
                    const active = selected === m.id;
                    return (
                      <motion.button key={m.id} whileTap={{ scale: 0.97 }}
                        onClick={() => setSelected(m.id)}
                        className={`rounded-2xl p-4 text-center border-2 transition-all ${active ? "border-fuchsia-500 bg-fuchsia-50/60 shadow-md shadow-fuchsia-100" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                        <div className="w-12 h-12 rounded-2xl mx-auto mb-2 flex items-center justify-center text-white text-sm font-black shadow-sm"
                          style={{ background: m.iconBg }}>{m.iconText}</div>
                        <p className="text-[13px] font-bold text-slate-800 leading-tight">{m.label}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{m.sublabel}</p>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Info panel for selected method */}
                {selected === "bkash_online" && (
                  <div className="rounded-2xl p-4 border border-pink-200 bg-pink-50/60">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                        style={{ background: '#E2136E' }}>
                        <Send size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800">bKash Online Payment</p>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          সফল পেমেন্টের পর অর্ডার স্বয়ংক্রিয়ভাবে কনফার্ম হবে।
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-pink-400" /> পেমেন্ট সফল হলেই সরাসরি ডেলিভারি প্রসেসে যাবে
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selected === "wallet" && (
                  <div className="rounded-2xl p-4 border border-violet-200 bg-violet-50/60 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                        style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
                        <Send size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800">Wallet Top-up <span className="text-[10px] font-semibold text-pink-600 ml-1">via bKash Online</span></p>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{wallet.note}</p>
                      </div>
                    </div>

                    {/* Quick amounts */}
                    {wallet.quickAmounts.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {wallet.quickAmounts.map(amt => {
                          const active = topupAmount === amt;
                          return (
                            <button key={amt} type="button" onClick={() => setTopupAmount(amt)}
                              className={`rounded-xl py-2 text-xs font-bold transition-all border ${active ? "border-violet-500 bg-violet-500 text-white shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}>
                              ৳{amt.toLocaleString("en-IN")}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Custom amount */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                        নিজে amount লিখুন (৳{wallet.min.toLocaleString("en-IN")} – ৳{wallet.max.toLocaleString("en-IN")})
                      </label>
                      <input type="number" value={topupAmount || ""}
                        onChange={e => setTopupAmount(Number(e.target.value))}
                        min={wallet.min} max={wallet.max}
                        placeholder={`যেমন: ${wallet.min}`}
                        className="w-full rounded-xl px-3 py-2.5 text-sm bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition" />
                    </div>
                  </div>
                )}

                {/* Total row */}
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                  <span className="text-sm font-semibold text-slate-700">
                    {selected === "wallet" ? "টপ-আপ পরিমাণ" : "পেমেন্ট মোট"}
                  </span>
                  <span className="text-xl font-black text-fuchsia-600">
                    {formatPrice(selected === "wallet" ? (topupAmount || 0) : finalPrice)}
                  </span>
                </div>

                {/* Big CTA */}
                <motion.button whileTap={{ scale: 0.98 }} onClick={handlePay}
                  disabled={bkashLoading}
                  className="w-full py-4 rounded-full text-[15px] font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{
                    background: selected === "bkash_online"
                      ? 'linear-gradient(135deg,#ec4899,#E2136E)'
                      : 'linear-gradient(135deg,#a855f7,#7c3aed)',
                    boxShadow: selected === "bkash_online"
                      ? '0 12px 30px -10px rgba(226,19,110,0.55)'
                      : '0 12px 30px -10px rgba(124,58,237,0.5)',
                  }}>
                  {bkashLoading ? (
                    "প্রসেস হচ্ছে..."
                  ) : selected === "bkash_online" ? (
                    <>
                      <span className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center"><Send size={12} /></span>
                      bKash দিয়ে পরিশোধ করুন <span className="opacity-90">{formatPrice(finalPrice)}</span>
                    </>
                  ) : (
                    <>
                      <span className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center"><Send size={12} /></span>
                      Wallet Top-up <span className="opacity-90">{formatPrice(topupAmount || 0)}</span>
                    </>
                  )}
                </motion.button>

                <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
                  <ShieldCheck size={12} /> নিরাপদ পেমেন্ট — আপনার তথ্য সুরক্ষিত
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};



// ─── Custom Order Form ────────────────────────────────────────────────────────
export const CustomOrderForm = ({ pkg, c, onClose }: {
  pkg: ServicePackageRow;
  c: { color: string; bg: string; border: string };
  onClose: () => void;
}) => {
  const [form, setForm] = useState({ name: "", phone: "", email: "", requirements: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.requirements.trim()) {
      toast.error("নাম, মোবাইল ও চাহিদা পূরণ করা বাধ্যতামূলক");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("leads").insert({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      service_interested: `${pkg.services?.title ?? ""} — ${pkg.title}`,
      project_description: form.requirements.trim(),
      source: "quote_form" as const,
      status: "new" as const,
    });
    setLoading(false);
    if (error) { toast.error("সমস্যা হয়েছে, আবার চেষ্টা করুন"); return; }
    setDone(true);
  };

  if (done) {
    return (
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-6">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ background: `${c.color}20` }}>
          <CheckCircle size={28} style={{ color: c.color }} />
        </div>
        <h4 className="text-lg font-black text-foreground mb-1">অর্ডার পাঠানো হয়েছে! ✅</h4>
        <p className="text-sm text-foreground/50 mb-1">আপনার চাহিদা আমরা পেয়েছি।</p>
        <p className="text-xs text-foreground/35">শীঘ্রই WhatsApp/ফোনে যোগাযোগ করা হবে।</p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onClose}
          className="mt-5 px-6 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}BB)` }}>
          ঠিক আছে
        </motion.button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-1">
      <p className="text-xs text-foreground/50 mb-3 leading-relaxed">
        আপনার প্রজেক্টের বিস্তারিত চাহিদা লিখুন — আমরা কাস্টম কোটেশন দিয়ে যোগাযোগ করব।
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-foreground/55 mb-1 block">নাম *</label>
          <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="পূর্ণ নাম"
            className="w-full rounded-xl px-3 py-2.5 text-sm bg-white/5 border border-white/10 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50" />
        </div>
        <div>
          <label className="text-xs font-semibold text-foreground/55 mb-1 block">মোবাইল *</label>
          <input required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="01XXXXXXXXX"
            className="w-full rounded-xl px-3 py-2.5 text-sm bg-white/5 border border-white/10 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50" />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-foreground/55 mb-1 block">ইমেইল (ঐচ্ছিক)</label>
        <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="example@email.com"
          className="w-full rounded-xl px-3 py-2.5 text-sm bg-white/5 border border-white/10 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50" />
      </div>
      <div>
        <label className="text-xs font-semibold text-foreground/55 mb-1 block">আপনার চাহিদা বিস্তারিত লিখুন *</label>
        <textarea required rows={4} value={form.requirements} onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))}
          placeholder="যেমন: আমার একটি ই-কমার্স ওয়েবসাইট দরকার, ৫০০ প্রোডাক্ট থাকবে, বাংলা ও ইংরেজি ভাষায়, পেমেন্ট গেটওয়ে সহ..."
          className="w-full rounded-xl px-3 py-2.5 text-sm bg-white/5 border border-white/10 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 resize-none" />
      </div>
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2"
        style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}BB)`, boxShadow: `0 4px 18px ${c.color}35` }}>
        {loading ? "পাঠানো হচ্ছে..." : <><Send size={14} /> কাস্টম অর্ডার পাঠান</>}
      </motion.button>
    </form>
  );
};

// ─── Details Modal ───────────────────────────────────────────────────────────
const DetailsModal = ({ pkg, onClose, onPay, c }: {
  pkg: ServicePackageRow;
  onClose: () => void;
  onPay: () => void;
  c: { color: string; bg: string; border: string };
}) => {
  const [activeTab, setActiveTab] = useState<"details" | "custom">("details");
  const discount = pkg.original_price && pkg.price
    ? Math.round((1 - pkg.price / pkg.original_price) * 100) : null;

  const waMessage = encodeURIComponent(
    `হ্যালো! আমি "${pkg.title}" প্যাকেজটি সম্পর্কে জানতে চাই।${pkg.price ? ` মূল্য: ৳${pkg.price.toLocaleString("en-IN")}` : ""}`
  );

  return (
    <div className="fixed inset-0 z-[998] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Locked backdrop — outside click does NOT close */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 30 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl max-h-[88vh] overflow-y-auto"
        style={{ background: 'hsl(265,45%,6%)', border: `1px solid ${c.border}` }}
      >
        {/* Hero image or gradient */}
        <div className="relative aspect-square w-full flex items-center justify-center overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${c.color}20, ${c.color}08)` }}>
          {pkg.image_url ? (
            <img src={pkg.image_url} alt={pkg.title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-8xl font-black select-none opacity-10"
              style={{ color: c.color, fontFamily: "'Syne', sans-serif" }}>
              {pkg.title.charAt(0)}
            </div>
          )}
          {/* Overlay gradient at bottom */}
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 40%, hsl(265,45%,6%) 100%)` }} />

          {/* Badges */}
          {discount && discount > 0 && (
            <div className="absolute top-3 left-3 px-2.5 py-1 text-xs font-black rounded-full text-white"
              style={{ background: 'linear-gradient(135deg, hsl(0,84%,60%), hsl(15,90%,55%))' }}>
              -{discount}% ছাড়
            </div>
          )}
          {pkg.badge === "hot" && (
            <div className="absolute top-3 right-3 px-2.5 py-1 text-xs font-black rounded-full text-white badge-hot">🔥 HOT</div>
          )}

          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-all"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: c.color }}>
            {pkg.services?.title ?? ""}
          </p>
          <h2 className="text-2xl font-black text-foreground mb-2 leading-tight">{pkg.title}</h2>

          {/* Stars */}
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} style={{ color: 'hsl(45,93%,58%)' }} fill="hsl(45,93%,58%)" />
            ))}
            <span className="text-xs text-foreground/40 ml-1">৫.০</span>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-1 p-1 rounded-2xl mb-5"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab("details")}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all"
              style={activeTab === "details"
                ? { background: `linear-gradient(135deg, ${c.color}30, ${c.color}15)`, color: c.color, border: `1px solid ${c.color}30` }
                : { color: 'rgba(255,255,255,0.4)' }}>
              <Info size={12} /> প্যাকেজ বিবরণ
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab("custom")}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all"
              style={activeTab === "custom"
                ? { background: 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(236,72,153,0.15))', color: 'hsl(270,92%,75%)', border: '1px solid rgba(168,85,247,0.3)' }
                : { color: 'rgba(255,255,255,0.4)' }}>
              <PenLine size={12} /> কাস্টম অর্ডার
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "details" ? (
              <motion.div key="details" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>
                {/* Price */}
                <div className="flex items-baseline gap-3 mb-5 p-4 rounded-2xl"
                  style={{ background: `${c.color}12`, border: `1px solid ${c.color}25` }}>
                  {pkg.original_price && (
                    <span className="text-sm text-foreground/35 line-through">{formatPrice(pkg.original_price)}</span>
                  )}
                  {pkg.price ? (
                    <span className="text-3xl font-black" style={{ color: c.color }}>{formatPrice(pkg.price)}</span>
                  ) : (
                    <span className="text-lg font-semibold text-foreground/50">মূল্য: যোগাযোগ করুন</span>
                  )}
                  {discount && discount > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white ml-auto"
                      style={{ background: 'hsl(0,84%,55%)' }}>
                      {discount}% সাশ্রয়
                    </span>
                  )}
                </div>

          {/* Short description for card — concise tagline */}
                {(pkg.short_description || pkg.description) && (
                  <div className="mb-5">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-2">বিবরণ</h4>
                    {pkg.short_description ? (
                      <p className="text-sm text-foreground/75 leading-relaxed">
                        {pkg.short_description}
                      </p>
                    ) : (
                      <div
                        className="text-sm text-foreground/75 leading-relaxed rich-description line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(pkg.description!) }}
                      />
                    )}
                  </div>
                )}

                {/* Features */}
                {pkg.features && (pkg.features as string[]).length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-3">কী কী পাবেন</h4>
                    <ul className="space-y-2">
                      {(pkg.features as string[]).map((f, i) => (
                        <motion.li key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex items-start gap-2.5 text-sm text-foreground/75">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: `${c.color}20` }}>
                            <CheckCircle size={11} style={{ color: c.color }} />
                          </div>
                          {f}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onPay}
                    className="flex-1 py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 glossy-btn"
                    style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}BB)`, boxShadow: `0 4px 18px ${c.color}40` }}>
                    <CreditCard size={15} /> পেমেন্ট করুন
                  </motion.button>
                  <motion.a
                    href={`https://wa.me/8801820060046?text=${waMessage}`}
                    target="_blank" rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all"
                    style={{ background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.35)', color: '#25D366' }}>
                    <MessageCircle size={18} />
                  </motion.a>
                </div>
              </motion.div>
            ) : (
              <motion.div key="custom" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.18 }}>
                <CustomOrderForm pkg={pkg} c={c} onClose={onClose} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Product Card ────────────────────────────────────────────────────────────
const ProductCard = ({ pkg, index }: { pkg: ServicePackageRow; index: number }) => {
  const c = cardColors[index % cardColors.length];
  const navigate = useNavigate();
  const discount = pkg.original_price && pkg.price
    ? Math.round((1 - pkg.price / pkg.original_price) * 100)
    : null;
  const [showPayment, setShowPayment] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);
  const { stat: ratingStat } = useProductRating(pkg.id);

  const waMessage = encodeURIComponent(
    `হ্যালো! আমি "${pkg.title}" প্যাকেজটি অর্ডার করতে চাই।${pkg.price ? ` মূল্য: ৳${pkg.price.toLocaleString("en-IN")}` : ""} অনুগ্রহ করে আরও তথ্য দিন।`
  );

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipple({ x, y, id: Date.now() });
    // Let the ripple flash briefly before navigating
    setTimeout(() => navigate(`/product/${pkg.slug || pkg.id}`), 280);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, type: "spring", stiffness: 120 }}
        whileHover={{ y: -8, scale: 1.015 }}
        whileTap={{ scale: 0.94, rotate: -0.4, transition: { type: "spring", stiffness: 500, damping: 18 } }}
        onClick={handleCardClick}
        className="group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 flex flex-col backdrop-blur-xl"
        style={{
          background: `linear-gradient(160deg, ${c.color}10 0%, rgba(10,6,24,0.85) 45%, rgba(6,3,16,0.95) 100%)`,
          border: `1px solid ${c.color}30`,
          boxShadow: `0 10px 40px -12px ${c.color}30, inset 0 1px 0 rgba(255,255,255,0.06)`,
        }}
      >
        {/* Click ripple + flash */}
        <AnimatePresence>
          {ripple && (
            <>
              <motion.span
                key={`r-${ripple.id}`}
                initial={{ scale: 0, opacity: 0.55 }}
                animate={{ scale: 6, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                onAnimationComplete={() => setRipple(null)}
                className="pointer-events-none absolute rounded-full z-20"
                style={{
                  left: ripple.x - 60,
                  top: ripple.y - 60,
                  width: 120,
                  height: 120,
                  background: `radial-gradient(circle, ${c.color}aa 0%, ${c.color}55 40%, transparent 70%)`,
                  mixBlendMode: "screen",
                }}
              />
              <motion.span
                key={`f-${ripple.id}`}
                initial={{ opacity: 0.35 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="pointer-events-none absolute inset-0 z-20"
                style={{
                  background: `radial-gradient(circle at ${ripple.x}px ${ripple.y}px, ${c.color}55, transparent 60%)`,
                  mixBlendMode: "screen",
                }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Animated gradient glow border */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, ${c.color}55 90deg, transparent 180deg, ${c.color}55 270deg, transparent 360deg)`,
            mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            padding: '1px',
          }}
        />

        {/* Top visual area */}
        <div className="relative aspect-square w-full flex items-center justify-center overflow-hidden"
          style={{ background: `linear-gradient(180deg, #ffffff 0%, #f4f1fb 100%)` }}>
          {/* Shine sweep on hover */}
          <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1400ms] ease-out"
            style={{ background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)' }} />
          {pkg.image_url ? (
            <img
              src={pkg.image_url}
              alt={pkg.title}
              className="w-full h-full object-cover absolute inset-0"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <>
              <motion.div
                className="text-7xl font-black select-none"
                style={{ color: `${c.color}20`, fontFamily: "'Syne', sans-serif" }}
              >
                {pkg.title.charAt(0)}
              </motion.div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: `${c.color}18`, border: `1px solid ${c.color}30`, boxShadow: `0 0 25px ${c.color}20` }}>
                  <Zap size={20} style={{ color: c.color }} />
                </div>
              </div>
            </>
          )}

          {discount && discount > 0 && (
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: -8 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="absolute top-3 left-3 px-3 py-1.5 text-xs font-black rounded-full text-white shadow-lg"
              style={{
                background: 'linear-gradient(135deg, hsl(0,84%,60%), hsl(15,90%,55%))',
                boxShadow: '0 6px 20px -4px hsl(0 84% 60% / 0.6), inset 0 1px 0 rgba(255,255,255,0.3)',
              }}
            >
              -{discount}% OFF
            </motion.div>
          )}
          {pkg.badge === "hot" && (
            <div className="absolute top-3 right-3 px-2.5 py-1 text-xs font-black rounded-full text-white badge-hot">
              🔥 HOT
            </div>
          )}
          {pkg.badge === "new" && (
            <div className="absolute top-3 right-3 px-2.5 py-1 text-xs font-black rounded-full badge-new">
              ✨ NEW
            </div>
          )}

          {/* Info hover hint */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg"
              style={{ background: 'rgba(0,0,0,0.55)', color: c.color, backdropFilter: 'blur(6px)' }}>
              <Info size={9} /> বিবরণ দেখুন
            </div>
          </div>

          {/* Bottom fade for legibility */}
          <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(6,3,16,0.95), transparent)' }} />
        </div>

        {/* Glass shelf divider — separates image area from content with premium glow */}
        <div className="relative h-[14px] -mt-px pointer-events-none">
          {/* Frosted glass strip */}
          <div
            className="absolute inset-x-0 inset-y-0 backdrop-blur-md"
            style={{
              background: `linear-gradient(180deg, rgba(255,255,255,0.06) 0%, ${c.color}14 50%, rgba(0,0,0,0.35) 100%)`,
              borderTop: `1px solid ${c.color}40`,
              borderBottom: `1px solid rgba(255,255,255,0.04)`,
              boxShadow: `0 1px 0 rgba(255,255,255,0.06) inset, 0 -8px 18px -8px ${c.color}55, 0 6px 14px -6px rgba(0,0,0,0.6)`,
            }}
          />
          {/* Center accent glow line */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[1.5px] w-2/3 rounded-full opacity-80 group-hover:opacity-100 group-hover:w-[85%] transition-all duration-500"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${c.color}cc 50%, transparent 100%)`,
              boxShadow: `0 0 12px ${c.color}90`,
            }}
          />
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1 relative">

          <p className="text-[10px] text-foreground/50 mb-1.5 font-semibold uppercase tracking-wider"
            style={{ color: `${c.color}CC` }}>
            {pkg.services?.title ?? ""}
          </p>
          <h3 className="font-bold text-foreground text-[15px] mb-2 group-hover:text-white transition-colors leading-snug line-clamp-2"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            {pkg.title}
          </h3>

          <div className="mb-3">
            <StarRating
              average={ratingStat.average}
              count={ratingStat.count}
              size={11}
              showText={ratingStat.count > 0}
            />
          </div>

          {/* Premium price chip */}
          <div className="mb-4 mt-auto rounded-2xl px-3 py-2.5 flex items-center justify-between gap-2"
            style={{
              background: `linear-gradient(135deg, ${c.color}1A, ${c.color}08)`,
              border: `1px solid ${c.color}25`,
            }}>
            <div className="flex flex-col">
              {pkg.original_price && (
                <span className="text-[10px] text-foreground/40 line-through leading-none">{formatPrice(pkg.original_price)}</span>
              )}
              {pkg.price ? (
                <span className="text-xl font-black leading-tight" style={{ color: c.color, fontFamily: "'Syne', sans-serif" }}>
                  {formatPrice(pkg.price)}
                </span>
              ) : (
                <span className="text-sm font-semibold text-foreground/60">যোগাযোগ করুন</span>
              )}
            </div>
            {pkg.price && (
              <div className="text-[9px] font-bold uppercase tracking-wider opacity-70 text-right leading-tight"
                style={{ color: c.color }}>
                সেরা<br />অফার
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2" onClick={e => e.stopPropagation()}>
            {/* Payment button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowPayment(true)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white glossy-btn flex items-center justify-center gap-1.5 transition-all duration-300 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${c.color}, ${c.color}AA)`,
                boxShadow: `0 6px 20px -4px ${c.color}55, inset 0 1px 0 rgba(255,255,255,0.25)`,
              }}
            >
              <CreditCard size={13} /> পেমেন্ট
            </motion.button>

            {/* WhatsApp button */}
            <motion.a
              href={`https://wa.me/8801820060046?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(37,211,102,0.25), rgba(37,211,102,0.1))',
                border: '1px solid rgba(37,211,102,0.45)',
                color: '#25D366',
                boxShadow: '0 4px 14px -4px rgba(37,211,102,0.4)',
              }}
              title="WhatsApp-এ অর্ডার করুন"
            >
              <MessageCircle size={16} />
            </motion.a>
          </div>
        </div>
      </motion.div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && <PaymentModal pkg={pkg} onClose={() => setShowPayment(false)} />}
      </AnimatePresence>
    </>
  );
};

interface ServiceGroup {
  service_id: string;
  service_title: string;
  packages: ServicePackageRow[];
}

const FilterChip = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
    style={
      active
        ? {
            background: "linear-gradient(135deg, hsl(270,92%,65%), hsl(320,90%,48%))",
            color: "white",
            boxShadow: "0 4px 16px rgba(168,85,247,0.35)",
          }
        : {
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.10)",
            color: "rgba(255,255,255,0.7)",
          }
    }
  >
    {label}
  </motion.button>
);

// ─── Products Section ────────────────────────────────────────────────────────
const ProductsSection = () => {
  const [groups, setGroups] = useState<ServiceGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    supabase
      .from("service_packages")
      .select("*, services(title)")
      .eq("is_published", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data) {
          const map = new Map<string, ServiceGroup>();
          (data as ServicePackageRow[]).forEach(pkg => {
            const sid = pkg.service_id;
            const stitle = pkg.services?.title ?? "Other";
            if (!map.has(sid)) map.set(sid, { service_id: sid, service_title: stitle, packages: [] });
            map.get(sid)!.packages.push(pkg);
          });
          setGroups(Array.from(map.values()));
        }
        setLoading(false);
      });
  }, []);

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    return groups
      .filter(g => activeCategory === "all" || g.service_id === activeCategory)
      .map(g => ({
        ...g,
        packages: g.packages.filter(p => {
          if (!q) return true;
          const hay = `${p.title} ${p.description ?? ""} ${g.service_title}`.toLowerCase();
          return hay.includes(q);
        }),
      }))
      .filter(g => g.packages.length > 0);
  }, [groups, search, activeCategory]);

  const totalMatches = filteredGroups.reduce((sum, g) => sum + g.packages.length, 0);

  if (loading) return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-72 rounded-2xl animate-pulse" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.12)' }} />
          ))}
        </div>
      </div>
    </section>
  );

  if (groups.length === 0) return null;

  const sectionColors = [
    { accent: 'hsl(270,92%,65%)', glow: 'rgba(168,85,247,0.08)' },
    { accent: 'hsl(320,90%,48%)', glow: 'rgba(236,72,153,0.08)' },
    { accent: 'hsl(315,80%,65%)', glow: 'rgba(236,72,153,0.08)' },
    { accent: 'hsl(45,93%,58%)', glow: 'rgba(234,179,8,0.08)' },
    { accent: 'hsl(142,76%,55%)', glow: 'rgba(34,197,94,0.08)' },
    { accent: 'hsl(21,90%,60%)', glow: 'rgba(249,115,22,0.08)' },
  ];

  return (
    <section id="services" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-20" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-16">
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4"
              style={{ background: 'rgba(234,179,8,0.10)', border: '1px solid rgba(234,179,8,0.25)', color: 'hsl(45,93%,65%)' }}
            >
              ◈ Pricing Plans
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-black text-foreground mt-2">
              আমাদের <span className="gradient-text">সার্ভিস</span> প্যাকেজ
            </h2>
            <div className="mt-4 w-20 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(270,92%,65%), hsl(45,93%,58%))' }} />
          </motion.div>
          <motion.a
            href="/pricing"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden md:flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl group transition-all"
            style={{ background: 'rgba(168,85,247,0.10)', border: '1px solid rgba(168,85,247,0.22)', color: 'hsl(270,92%,75%)' }}
          >
            All Plans <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </div>

        {/* Per-service groups */}
        {filteredGroups.length === 0 ? (
          <div className="text-center py-20 text-foreground/50">
            <p className="text-lg mb-2">কোনো প্রোডাক্ট পাওয়া যায়নি</p>
            <button
              onClick={() => { setSearch(""); setActiveCategory("all"); }}
              className="text-sm font-semibold text-primary hover:underline"
            >
              ফিল্টার রিসেট করুন
            </button>
          </div>
        ) : (
          <div className="space-y-20">
            {filteredGroups.map((group, gi) => {
              const sc = sectionColors[gi % sectionColors.length];
              return (
                <motion.div
                  key={group.service_id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Group heading */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-px flex-1 max-w-8 rounded-full" style={{ background: sc.accent }} />
                    <h3 className="text-xl md:text-2xl font-black" style={{ color: sc.accent }}>
                      {group.service_title}
                    </h3>
                    <div className="h-px flex-1 rounded-full" style={{ background: `linear-gradient(90deg, ${sc.accent}50, transparent)` }} />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {group.packages.map((pkg, i) => (
                      <ProductCard key={pkg.id} pkg={pkg} index={i} />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;
