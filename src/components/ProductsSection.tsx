import { Star, ArrowRight, Zap, CreditCard, MessageCircle, X, Copy, Smartphone, Send, CheckCircle, ChevronRight, Info, PenLine, Search } from "lucide-react";
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

const paymentMethods = [
  { id: "bkash_send", label: "বিকাশ", sublabel: "Send Money", number: "01820060046", color: "#E2136E", short: "bK" },
  { id: "nagad_send", label: "নগদ", sublabel: "Send Money", number: "01820060046", color: "#F6821F", short: "NG" },
  { id: "rocket_send", label: "রকেট", sublabel: "Send Money", number: "01820060046", color: "#8B1FA8", short: "RK" },
  { id: "upay_send", label: "উপায়", sublabel: "Send Money", number: "01820060046", color: "#00A651", short: "UP" },
  { id: "bkash_merchant", label: "বিকাশ মার্চেন্ট", sublabel: "Merchant", number: "01820060046", color: "#E2136E", short: "bM" },
];

export const formatPrice = (price: number) => `৳ ${price.toLocaleString("en-IN")}`;

export const cardColors = [
  { color: "hsl(270,92%,65%)", bg: "rgba(168,85,247,0.10)", border: "rgba(168,85,247,0.22)" },
  { color: "hsl(320,90%,48%)", bg: "rgba(236,72,153,0.10)", border: "rgba(236,72,153,0.22)" },
  { color: "hsl(315,80%,65%)", bg: "rgba(236,72,153,0.10)", border: "rgba(236,72,153,0.22)" },
  { color: "hsl(270,92%,65%)", bg: "rgba(168,85,247,0.10)", border: "rgba(168,85,247,0.22)" },
  { color: "hsl(45,93%,58%)", bg: "rgba(234,179,8,0.10)", border: "rgba(234,179,8,0.22)" },
];

// ─── Payment Modal ───────────────────────────────────────────────────────────
export const PaymentModal = ({ pkg, onClose }: { pkg: ServicePackageRow; onClose: () => void }) => {
  const [step, setStep] = useState<"method" | "form" | "done">("method");
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", transaction_id: "", note: "",
  });

  const selectedMethod = paymentMethods.find(m => m.id === selected);
  const price = pkg.price ?? 0;
  const serviceName = `${pkg.services?.title ?? ""} — ${pkg.title}`;

  const copyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    toast.success("নম্বর কপি হয়েছে!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) { toast.error("পেমেন্ট মেথড বেছে নিন"); return; }
    if (!form.transaction_id.trim()) { toast.error("Transaction ID দিন"); return; }
    setLoading(true);
    const { error } = await supabase.from("payment_submissions" as any).insert({
      name: form.name,
      phone: form.phone,
      email: form.email || null,
      service: serviceName,
      amount: price,
      payment_method: selectedMethod?.label,
      transaction_id: form.transaction_id,
      note: form.note || null,
      status: "pending",
    });
    setLoading(false);
    if (error) { toast.error("সমস্যা হয়েছে, আবার চেষ্টা করুন"); return; }
    setStep("done");
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ background: 'hsl(265,45%,6%)', border: '1px solid rgba(168,85,247,0.25)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          <div>
            <p className="text-xs text-foreground/40 uppercase tracking-widest mb-1">পেমেন্ট করুন</p>
            <h3 className="font-black text-foreground text-lg leading-tight">{pkg.title}</h3>
            {price > 0 && (
              <span className="text-2xl font-black mt-1 block" style={{ color: 'hsl(320,90%,55%)' }}>
                {formatPrice(price)}
              </span>
            )}
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-white/8 transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          {step === "done" ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h4 className="text-xl font-bold text-foreground mb-2">সফলভাবে জমা হয়েছে! ✅</h4>
              <p className="text-foreground/50 text-sm mb-1">আপনার পেমেন্ট তথ্য পাওয়া গেছে।</p>
              <p className="text-foreground/40 text-xs">২৪ ঘন্টার মধ্যে WhatsApp/Email-এ কনফার্মেশন পাবেন।</p>
              <button onClick={onClose} className="mt-6 px-6 py-2.5 rounded-xl text-sm font-bold text-white glossy-btn"
                style={{ background: 'linear-gradient(135deg, hsl(270,92%,65%), hsl(320,90%,48%))' }}>
                বন্ধ করুন
              </button>
            </motion.div>
          ) : step === "method" ? (
            <>
              <p className="text-sm font-semibold text-foreground/70 mb-4">পেমেন্ট মেথড বেছে নিন</p>
              <div className="grid grid-cols-5 gap-2 mb-6">
                {paymentMethods.map(m => (
                  <motion.button
                    key={m.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelected(m.id)}
                    className={`rounded-2xl p-3 text-center transition-all border ${selected === m.id ? "border-primary shadow-lg shadow-primary/20 bg-primary/10" : "border-white/8 bg-white/4 hover:border-white/20"}`}
                  >
                    <div className="w-9 h-9 rounded-xl mx-auto mb-1.5 flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: m.color }}>
                      {m.short}
                    </div>
                    <p className="text-[10px] font-semibold text-foreground/70 leading-tight">{m.label}</p>
                    <p className="text-[9px] text-foreground/40">{m.sublabel}</p>
                  </motion.button>
                ))}
              </div>

              {selectedMethod && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-primary/25 p-4 flex items-center justify-between gap-3 mb-5"
                  style={{ background: 'rgba(168,85,247,0.08)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: selectedMethod.color }}>
                      <Smartphone size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-foreground/45">{selectedMethod.label} · {selectedMethod.sublabel}</p>
                      <p className="text-lg font-black text-foreground tracking-wide">{selectedMethod.number}</p>
                    </div>
                  </div>
                  <button onClick={() => copyNumber(selectedMethod.number)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/12 text-foreground/60 hover:text-foreground hover:bg-white/8 transition-all">
                    <Copy size={12} /> কপি
                  </button>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: selected ? 1.02 : 1 }}
                whileTap={{ scale: selected ? 0.98 : 1 }}
                onClick={() => selected && setStep("form")}
                disabled={!selected}
                className={`w-full py-3 rounded-2xl text-sm font-bold text-white transition-all ${selected ? "glossy-btn" : "opacity-40 cursor-not-allowed"}`}
                style={{ background: selected ? 'linear-gradient(135deg, hsl(270,92%,65%), hsl(320,90%,48%))' : 'rgba(255,255,255,0.08)' }}>
                পরের ধাপ →
              </motion.button>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="rounded-2xl border border-primary/20 p-3 mb-2 flex items-center gap-3"
                style={{ background: 'rgba(236,72,153,0.07)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: selectedMethod?.color }}>
                  {selectedMethod?.short}
                </div>
                <div>
                  <p className="text-xs text-foreground/45">{selectedMethod?.label}</p>
                  <p className="text-sm font-black text-foreground">{selectedMethod?.number}</p>
                </div>
                <button type="button" onClick={() => setStep("method")} className="ml-auto text-xs text-foreground/40 hover:text-foreground/70 underline">পরিবর্তন</button>
              </div>

              <p className="text-xs text-foreground/50 -mt-1 mb-2">
                উপরের নম্বরে <strong className="text-foreground/80">{price > 0 ? formatPrice(price) : "পরিমাণ"}</strong> পাঠান, তারপর নিচের ফর্ম পূরণ করুন।
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground/60 mb-1 block">নাম *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="পূর্ণ নাম"
                    className="w-full rounded-xl px-3 py-2.5 text-sm bg-white/5 border border-white/10 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground/60 mb-1 block">মোবাইল *</label>
                  <input required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="01XXXXXXXXX"
                    className="w-full rounded-xl px-3 py-2.5 text-sm bg-white/5 border border-white/10 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground/60 mb-1 block">Transaction ID *</label>
                <input required value={form.transaction_id} onChange={e => setForm(f => ({ ...f, transaction_id: e.target.value }))}
                  placeholder="যেমন: 8JK2FT1X9P"
                  className="w-full rounded-xl px-3 py-2.5 text-sm bg-white/5 border border-white/10 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50" />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground/60 mb-1 block">ইমেইল (ঐচ্ছিক)</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="example@email.com"
                  className="w-full rounded-xl px-3 py-2.5 text-sm bg-white/5 border border-white/10 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50" />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground/60 mb-1 block">বিশেষ নোট (ঐচ্ছিক)</label>
                <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="কোনো বিশেষ তথ্য..."
                  className="w-full rounded-xl px-3 py-2.5 text-sm bg-white/5 border border-white/10 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50" />
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-2xl text-sm font-bold text-white glossy-btn flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, hsl(270,92%,65%), hsl(320,90%,48%))' }}>
                {loading ? "জমা হচ্ছে..." : <><Send size={15} /> পেমেন্ট জমা দিন</>}
              </button>
              <p className="text-[10px] text-foreground/35 text-center">পেমেন্ট যাচাই হলে ২৪ ঘন্টার মধ্যে কনফার্মেশন পাবেন।</p>
            </form>
          )}
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
    <div className="fixed inset-0 z-[998] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 30 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl max-h-[88vh] overflow-y-auto"
        style={{ background: 'hsl(265,45%,6%)', border: `1px solid ${c.border}` }}
        onClick={e => e.stopPropagation()}
      >
        {/* Hero image or gradient */}
        <div className="relative h-44 flex items-center justify-center overflow-hidden"
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
  const { stat: ratingStat } = useProductRating(pkg.id);

  const waMessage = encodeURIComponent(
    `হ্যালো! আমি "${pkg.title}" প্যাকেজটি অর্ডার করতে চাই।${pkg.price ? ` মূল্য: ৳${pkg.price.toLocaleString("en-IN")}` : ""} অনুগ্রহ করে আরও তথ্য দিন।`
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, type: "spring", stiffness: 120 }}
        whileHover={{ y: -8, scale: 1.015 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate(`/product/${pkg.slug || pkg.id}`)}
        className="group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 flex flex-col backdrop-blur-xl"
        style={{
          background: `linear-gradient(160deg, ${c.color}10 0%, rgba(10,6,24,0.85) 45%, rgba(6,3,16,0.95) 100%)`,
          border: `1px solid ${c.color}30`,
          boxShadow: `0 10px 40px -12px ${c.color}30, inset 0 1px 0 rgba(255,255,255,0.06)`,
        }}
      >
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
        <div className="relative h-40 flex items-center justify-center overflow-hidden"
          style={{ background: `radial-gradient(120% 100% at 50% 0%, ${c.color}28 0%, ${c.color}08 45%, transparent 80%)` }}>
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
