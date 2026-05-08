import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, CheckCircle, CreditCard, MessageCircle, Info, PenLine, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  PaymentModal,
  CustomOrderForm,
  formatPrice,
  cardColors,
  type ServicePackageRow,
} from "@/components/ProductsSection";
import { sanitizeHtml } from "@/lib/sanitize";

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<ServicePackageRow | null>(null);
  const [related, setRelated] = useState<ServicePackageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "custom">("details");
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase
      .from("service_packages")
      .select("*, services(title)")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        const row = data as ServicePackageRow | null;
        setPkg(row);
        setLoading(false);
        if (row) {
          supabase
            .from("service_packages")
            .select("*, services(title)")
            .eq("is_published", true)
            .eq("service_id", row.service_id)
            .neq("id", row.id)
            .order("sort_order")
            .limit(4)
            .then(({ data: rel }) => setRelated((rel as ServicePackageRow[]) ?? []));
        }
        // Scroll to top on load
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
  }, [id]);

  const c = cardColors[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto px-4 py-32 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-4xl font-black text-foreground mb-4">প্রোডাক্ট পাওয়া যায়নি</h1>
          <Link to="/" className="text-primary hover:underline">← হোমে ফিরে যান</Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const discount = pkg.original_price && pkg.price
    ? Math.round((1 - pkg.price / pkg.original_price) * 100)
    : null;

  const waMessage = encodeURIComponent(
    `হ্যালো! আমি "${pkg.title}" প্যাকেজটি সম্পর্কে জানতে চাই।${pkg.price ? ` মূল্য: ৳${pkg.price.toLocaleString()}` : ""}`
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-10 md:py-16 max-w-6xl">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> পেছনে যান
        </button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Image / Visual */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative rounded-3xl overflow-hidden h-[280px] sm:h-[380px] md:h-[460px] flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${c.color}25, ${c.color}08)`, border: `1px solid ${c.border}` }}
          >
            {pkg.image_url ? (
              <img src={pkg.image_url} alt={pkg.title} className="w-full h-full object-cover" />
            ) : (
              <>
                <div
                  className="text-[12rem] font-black select-none opacity-10"
                  style={{ color: c.color, fontFamily: "'Syne', sans-serif" }}
                >
                  {pkg.title.charAt(0)}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-20 h-20 rounded-3xl flex items-center justify-center"
                    style={{ background: `${c.color}18`, border: `1px solid ${c.color}30`, boxShadow: `0 0 50px ${c.color}30` }}
                  >
                    <Zap size={32} style={{ color: c.color }} />
                  </div>
                </div>
              </>
            )}
            {discount && discount > 0 && (
              <div
                className="absolute top-4 left-4 px-3 py-1.5 text-sm font-black rounded-full text-white"
                style={{ background: 'linear-gradient(135deg, hsl(0,84%,60%), hsl(15,90%,55%))' }}
              >
                -{discount}% ছাড়
              </div>
            )}
            {pkg.badge === "hot" && (
              <div className="absolute top-4 right-4 px-3 py-1.5 text-sm font-black rounded-full text-white badge-hot">🔥 HOT</div>
            )}
            {pkg.badge === "new" && (
              <div className="absolute top-4 right-4 px-3 py-1.5 text-sm font-black rounded-full badge-new">✨ NEW</div>
            )}
          </motion.div>

          {/* Right: Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: c.color }}>
              {pkg.services?.title ?? ""}
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-3 leading-tight">
              {pkg.title}
            </h1>

            <div className="flex items-center gap-1 mb-5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} style={{ color: 'hsl(45,93%,58%)' }} fill="hsl(45,93%,58%)" />
              ))}
              <span className="text-sm text-foreground/50 ml-2">৫.০ রেটিং</span>
            </div>

            {/* Price */}
            <div
              className="flex items-baseline gap-3 mb-6 p-5 rounded-2xl"
              style={{ background: `${c.color}12`, border: `1px solid ${c.color}25` }}
            >
              {pkg.original_price && (
                <span className="text-base text-foreground/35 line-through">{formatPrice(pkg.original_price)}</span>
              )}
              {pkg.price ? (
                <span className="text-4xl font-black" style={{ color: c.color }}>{formatPrice(pkg.price)}</span>
              ) : (
                <span className="text-xl font-semibold text-foreground/50">মূল্য: যোগাযোগ করুন</span>
              )}
              {discount && discount > 0 && (
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full text-white ml-auto"
                  style={{ background: 'hsl(0,84%,55%)' }}
                >
                  {discount}% সাশ্রয়
                </span>
              )}
            </div>

            {/* Tabs */}
            <div
              className="flex gap-1 p-1 rounded-2xl mb-6"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab("details")}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={
                  activeTab === "details"
                    ? { background: `linear-gradient(135deg, ${c.color}30, ${c.color}15)`, color: c.color, border: `1px solid ${c.color}30` }
                    : { color: 'rgba(255,255,255,0.4)' }
                }
              >
                <Info size={14} /> প্যাকেজ বিবরণ
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab("custom")}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={
                  activeTab === "custom"
                    ? { background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(6,182,212,0.15))', color: 'hsl(258,90%,75%)', border: '1px solid rgba(139,92,246,0.3)' }
                    : { color: 'rgba(255,255,255,0.4)' }
                }
              >
                <PenLine size={14} /> কাস্টম অর্ডার
              </motion.button>
            </div>

            {/* Action buttons (visible on details tab) */}
            {activeTab === "details" && (
              <div className="flex gap-3 mb-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowPayment(true)}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 glossy-btn"
                  style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}BB)`, boxShadow: `0 4px 22px ${c.color}40` }}
                >
                  <CreditCard size={16} /> পেমেন্ট করুন
                </motion.button>
                <motion.a
                  href={`https://wa.me/8801820060046?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all text-sm font-bold"
                  style={{ background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.35)', color: '#25D366' }}
                >
                  <MessageCircle size={16} /> WhatsApp
                </motion.a>
              </div>
            )}
          </motion.div>
        </div>

        {/* Tab Content */}
        <div className="mt-10 md:mt-14">
          <AnimatePresence mode="wait">
            {activeTab === "details" ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="grid md:grid-cols-3 gap-6 lg:gap-8"
              >
                {/* Description */}
                <div className="md:col-span-2">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-3">বিবরণ</h2>
                  {pkg.description ? (
                    <div
                      className="text-base text-foreground/80 leading-relaxed rich-description prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(pkg.description) }}
                    />
                  ) : (
                    <p className="text-foreground/50 italic">কোনো বিবরণ যুক্ত করা হয়নি।</p>
                  )}
                </div>

                {/* Features */}
                <div>
                  {pkg.features && (pkg.features as string[]).length > 0 && (
                    <div
                      className="rounded-2xl p-5"
                      style={{ background: `${c.color}10`, border: `1px solid ${c.color}25` }}
                    >
                      <h2 className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-4">কী কী পাবেন</h2>
                      <ul className="space-y-3">
                        {(pkg.features as string[]).map((f, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="flex items-start gap-2.5 text-sm text-foreground/80"
                          >
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                              style={{ background: `${c.color}25` }}
                            >
                              <CheckCircle size={11} style={{ color: c.color }} />
                            </div>
                            {f}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="custom"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="max-w-2xl mx-auto rounded-3xl p-6 md:p-8"
                style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)' }}
              >
                <h2 className="text-2xl font-black text-foreground mb-2">কাস্টম অর্ডার দিন</h2>
                <CustomOrderForm pkg={pkg} c={c} onClose={() => setActiveTab("details")} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl md:text-3xl font-black text-foreground mb-6">
              একই ক্যাটাগরির অন্যান্য প্যাকেজ
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((r, i) => {
                const rc = cardColors[i % cardColors.length];
                return (
                  <Link
                    key={r.id}
                    to={`/product/${r.id}`}
                    className="group rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
                    style={{ background: rc.bg, border: `1px solid ${rc.border}` }}
                  >
                    <div
                      className="h-28 flex items-center justify-center overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${rc.color}15, ${rc.color}05)` }}
                    >
                      {r.image_url ? (
                        <img src={r.image_url} alt={r.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-5xl font-black opacity-20" style={{ color: rc.color }}>
                          {r.title.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-bold text-foreground/90 leading-tight mb-1 line-clamp-2">
                        {r.title}
                      </h3>
                      {r.price && (
                        <p className="text-base font-black" style={{ color: rc.color }}>
                          {formatPrice(r.price)}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <SiteFooter />

      <AnimatePresence>
        {showPayment && <PaymentModal pkg={pkg} onClose={() => setShowPayment(false)} />}
      </AnimatePresence>
    </div>
  );
}
