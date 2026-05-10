import { useState } from "react";
import { motion } from "framer-motion";
import { X, Send, CheckCircle, MessageCircle, Package as PackageIcon } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatBdt } from "@/lib/utils";

interface QuickQuoteProduct {
  id: string;
  title: string;
  price: number | null;
  image_url?: string | null;
  service_title?: string | null;
}

const schema = z.object({
  name: z.string().trim().min(2, "নাম দিন").max(80),
  phone: z.string().trim().min(10, "সঠিক ফোন নম্বর দিন").max(20),
  email: z.string().trim().email("সঠিক ইমেইল দিন").max(120).optional().or(z.literal("")),
  message: z.string().trim().max(500).optional().or(z.literal("")),
});

interface Props {
  product: QuickQuoteProduct;
  onClose: () => void;
  accent?: string; // hsl values e.g. "270 92% 65%"
}

export const QuickQuoteModal = ({ product, onClose, accent = "270 92% 65%" }: Props) => {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "ফর্ম সঠিকভাবে পূরণ করুন");
      return;
    }
    setLoading(true);
    const desc = `Product: ${product.title}${product.service_title ? ` (${product.service_title})` : ""}${product.price != null ? ` — ৳${formatBdt(product.price)}` : ""}\n\n${form.message ?? ""}`.trim();
    const { error } = await supabase.from("leads").insert({
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || `noemail+${Date.now()}@shahedit.com`,
      service_interested: product.title,
      project_description: desc,
      source: "contact_form",
      status: "new",
    });
    setLoading(false);
    if (error) { toast.error("সমস্যা হয়েছে, আবার চেষ্টা করুন"); return; }
    setDone(true);
  };

  const waMessage = encodeURIComponent(
    `আস্সালামু আলাইকুম! আমি "${product.title}" সম্পর্কে জানতে আগ্রহী।\nনাম: ${form.name || "—"}\nফোন: ${form.phone || "—"}`
  );

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto"
        style={{ background: "hsl(265,45%,6%)", border: `1px solid hsla(${accent}, 0.35)` }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div className="flex items-center gap-3 min-w-0">
            {product.image_url ? (
              <img src={product.image_url} alt="" className="w-11 h-11 rounded-xl object-cover" />
            ) : (
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `hsla(${accent}, 0.18)` }}>
                <PackageIcon size={18} style={{ color: `hsl(${accent})` }} />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-foreground/40">কুইক কোট</p>
              <h3 className="font-black text-foreground text-sm leading-tight truncate">{product.title}</h3>
              {product.price != null && (
                <p className="text-xs font-bold" style={{ color: `hsl(${accent})` }}>৳{formatBdt(product.price)}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-white/8 transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5">
          {done ? (
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-6">
              <div className="w-16 h-16 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h4 className="text-lg font-bold text-foreground mb-1">অনুরোধ পাঠানো হয়েছে! ✅</h4>
              <p className="text-foreground/55 text-sm mb-5">আমাদের টিম শীঘ্রই যোগাযোগ করবে।</p>
              <div className="flex flex-col gap-2">
                <a
                  href={`https://wa.me/8801820060046?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border"
                  style={{ borderColor: "rgba(34,197,94,0.4)", color: "hsl(142,71%,55%)", background: "rgba(34,197,94,0.08)" }}
                >
                  <MessageCircle size={15} /> WhatsApp-এ ফলো-আপ
                </a>
                <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-foreground/60 hover:text-foreground">
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <p className="text-xs text-foreground/55 mb-1">নিচের তথ্য দিন — আমরা ১-২ ঘন্টার মধ্যে ফোন/WhatsApp-এ যোগাযোগ করব।</p>

              <div className="space-y-1">
                <label className="text-foreground/60 text-xs">আপনার নাম *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  maxLength={80}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm focus:outline-none focus:border-white/30"
                  placeholder="যেমন: রহিম উদ্দিন"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-foreground/60 text-xs">ফোন *</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    maxLength={20}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm focus:outline-none focus:border-white/30"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-foreground/60 text-xs">ইমেইল</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    maxLength={120}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm focus:outline-none focus:border-white/30"
                    placeholder="optional"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-foreground/60 text-xs">বার্তা / প্রয়োজন</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  maxLength={500}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm focus:outline-none focus:border-white/30 resize-none"
                  placeholder="আপনার প্রজেক্ট সম্পর্কে সংক্ষেপে লিখুন..."
                />
                <p className="text-[10px] text-foreground/35 text-right">{(form.message ?? "").length}/500</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-50 inline-flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, hsl(${accent}), hsl(320,90%,48%))` }}
              >
                <Send size={14} /> {loading ? "পাঠানো হচ্ছে..." : "অনুরোধ পাঠান"}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default QuickQuoteModal;
