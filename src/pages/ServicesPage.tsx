import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
import type { Service } from "@/lib/supabase-types";
import { CheckCircle2, ArrowRight, MessageCircle, Star, Package } from "lucide-react";

interface ServicePackage {
  id: string;
  service_id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string;
  features: string[] | null;
  image_url: string | null;
  is_featured: boolean;
  sort_order: number;
}

const emojiColors: Record<string, { bg: string; border: string; glow: string; badge: string }> = {
  "💻": { bg: "rgba(168,85,247,0.10)", border: "rgba(168,85,247,0.25)", glow: "rgba(168,85,247,0.15)", badge: "rgba(168,85,247,0.15)" },
  "📱": { bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.25)", glow: "rgba(59,130,246,0.15)", badge: "rgba(59,130,246,0.15)" },
  "🎨": { bg: "rgba(236,72,153,0.10)", border: "rgba(236,72,153,0.25)", glow: "rgba(236,72,153,0.15)", badge: "rgba(236,72,153,0.15)" },
  "📊": { bg: "rgba(236,72,153,0.10)", border: "rgba(236,72,153,0.25)", glow: "rgba(236,72,153,0.15)", badge: "rgba(236,72,153,0.15)" },
  "☁️": { bg: "rgba(234,179,8,0.10)", border: "rgba(234,179,8,0.25)", glow: "rgba(234,179,8,0.15)", badge: "rgba(234,179,8,0.15)" },
  "🔐": { bg: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.25)", glow: "rgba(34,197,94,0.15)", badge: "rgba(34,197,94,0.15)" },
};

const defaultColors = { bg: "rgba(168,85,247,0.10)", border: "rgba(168,85,247,0.25)", glow: "rgba(168,85,247,0.15)", badge: "rgba(168,85,247,0.15)" };

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("services").select("*").eq("is_published", true).order("sort_order"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from("service_packages").select("*").eq("is_published", true).order("sort_order"),
    ]).then(([{ data: svcs }, { data: pkgs }]) => {
      setServices(svcs ?? []);
      setPackages((pkgs ?? []) as ServicePackage[]);
      setLoading(false);
    });
  }, []);

  const packagesFor = (serviceId: string) =>
    packages.filter(p => p.service_id === serviceId);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, hsl(270,92%,65%) 0%, transparent 65%)', filter: 'blur(130px)', opacity: 0.09 }} />
        <div className="container mx-auto px-4 relative text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-5"
              style={{ background: 'rgba(236,72,153,0.10)', border: '1px solid rgba(236,72,153,0.25)', color: 'hsl(320,90%,55%)' }}
            >
              ◈ What We Offer
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-foreground mt-2 mb-4">
              আমাদের <span className="gradient-text">সার্ভিসগুলো</span>
            </h1>
            <p className="text-foreground/50 max-w-2xl mx-auto text-lg">
              আপনার ব্যবসার ডিজিটাল রূপান্তরের জন্য প্রয়োজনীয় সকল IT সমাধান এক ছাদের নিচে।
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="pb-24 relative">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <div key={i} className="h-64 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />)}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-foreground/40 text-lg">সার্ভিস শীঘ্রই আসছে...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, i) => {
                const clr = emojiColors[service.icon ?? ""] ?? defaultColors;
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.09, type: "spring", stiffness: 120 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="relative rounded-2xl p-7 group cursor-pointer overflow-hidden transition-all duration-500 flex flex-col"
                    style={{ background: clr.bg, border: `1px solid ${clr.border}` }}
                  >
                    {/* Top glow line */}
                    <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `linear-gradient(90deg, transparent, ${clr.border.replace('0.25','0.7')}, transparent)` }} />

                    {/* Hover background glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
                      style={{ background: `radial-gradient(circle at 50% 0%, ${clr.glow}, transparent 70%)` }} />

                    {/* Icon */}
                    <div className="relative text-5xl mb-5 w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: clr.badge }}>
                      {service.icon || "💻"}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-black text-foreground mb-2 group-hover:text-white transition-colors leading-tight">
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p className="text-foreground/50 text-sm leading-relaxed mb-5 group-hover:text-foreground/70 transition-colors">
                      {service.short_description}
                    </p>

                    {/* Features list */}
                    {service.features && service.features.length > 0 && (
                      <ul className="space-y-2 mb-6 flex-1">
                        {service.features.map((f, j) => (
                          <li key={j} className="flex items-start gap-2.5 text-sm text-foreground/60 group-hover:text-foreground/75 transition-colors">
                            <CheckCircle2
                              size={15}
                              className="shrink-0 mt-0.5"
                              style={{ color: clr.border.replace('rgba(','hsl(').replace(',0.25)',')')  }}
                            />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Packages */}
                    {packagesFor(service.id).length > 0 && (
                      <div className="mt-4 mb-2 space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-foreground/35 flex items-center gap-1.5">
                          <Package size={11} /> প্যাকেজসমূহ
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {packagesFor(service.id).map(pkg => (
                            <div
                              key={pkg.id}
                              className={`relative rounded-xl px-4 py-3 border transition-all ${
                                pkg.is_featured
                                  ? "border-amber-500/50 bg-amber-500/8"
                                  : "border-white/8 bg-white/4"
                              }`}
                            >
                              {pkg.is_featured && (
                                <span className="absolute -top-2.5 right-3 inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg">
                                  <Star size={8} fill="currentColor" /> Most Popular
                                </span>
                              )}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  {pkg.image_url && (
                                    <img src={pkg.image_url} alt={pkg.title} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                                  )}
                                  <div className="min-w-0">
                                    <p className={`text-sm font-semibold truncate ${pkg.is_featured ? "text-amber-300" : "text-foreground/85"}`}>
                                      {pkg.title}
                                    </p>
                                    {pkg.description && (
                                      <p className="text-foreground/45 text-xs truncate">{pkg.description}</p>
                                    )}
                                  </div>
                                </div>
                                {pkg.price !== null && (
                                  <span className={`text-sm font-black shrink-0 ${pkg.is_featured ? "text-amber-400" : "text-foreground/70"}`}>
                                    {pkg.currency} {pkg.price.toLocaleString()}
                                  </span>
                                )}
                              </div>
                              {pkg.features && pkg.features.length > 0 && (
                                <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5">
                                  {pkg.features.slice(0, 4).map((f, fi) => (
                                    <li key={fi} className="text-foreground/45 text-[11px] flex items-center gap-1">
                                      <span className="w-1 h-1 rounded-full bg-current inline-block shrink-0" />
                                      {f}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="flex items-center gap-3 mt-auto pt-4 border-t" style={{ borderColor: clr.border }}>
                      <Link
                        to="/get-quote"
                        className="flex items-center gap-1.5 text-sm font-semibold transition-all hover:gap-2.5"
                        style={{ color: clr.border.replace(',0.25)',',0.85)') }}
                      >
                        কোটেশন নিন <ArrowRight size={14} />
                      </Link>
                      <a
                        href="https://wa.me/8801820060046"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto flex items-center gap-1 text-xs text-foreground/40 hover:text-green-400 transition-colors"
                      >
                        <MessageCircle size={13} /> WhatsApp
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-16"
          >
            <p className="text-foreground/50 mb-6 text-base">কোন সার্ভিসটি আপনার প্রয়োজন, জানতে যোগাযোগ করুন</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/get-quote"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:scale-105 hover:shadow-xl"
                style={{ background: 'linear-gradient(135deg, hsl(270,92%,60%), hsl(320,90%,48%))' }}
              >
                ফ্রি কোটেশন নিন <ArrowRight size={16} />
              </Link>
              <a
                href="https://wa.me/8801820060046"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm border transition-all hover:scale-105"
                style={{ borderColor: 'rgba(34,197,94,0.35)', color: 'hsl(142,71%,55%)', background: 'rgba(34,197,94,0.06)' }}
              >
                <MessageCircle size={16} /> WhatsApp করুন
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
};

export default ServicesPage;
