import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { ArrowRight, MessageCircle, Globe, Wrench, Palette, Facebook, TrendingUp, Building2, CheckCircle2 } from "lucide-react";

import catWebDev from "@/assets/cat-web-dev.jpg";
import catMaintenance from "@/assets/cat-maintenance.jpg";
import catGraphics from "@/assets/cat-graphics.jpg";
import catFacebook from "@/assets/cat-facebook.jpg";
import catDigitalMarketing from "@/assets/cat-digital-marketing.jpg";
import catBusiness from "@/assets/cat-business.jpg";

const categories = [
  {
    label: "Web Development",
    slug: "web-development",
    icon: Globe,
    img: catWebDev,
    accent: "270 92% 65%",
    desc: "Business website, E-commerce, WordPress, Custom Web Application — সব ধরনের আধুনিক ও দ্রুতগতির ওয়েবসাইট।",
    features: ["Responsive Design", "E-commerce Integration", "SEO Friendly", "Fast & Secure"],
  },
  {
    label: "Website Maintenance",
    slug: "website-maintenance",
    icon: Wrench,
    img: catMaintenance,
    accent: "210 90% 65%",
    desc: "Website Speed, Security, Backup, Update ও Bug Fix — আপনার সাইট সবসময় সুরক্ষিত ও আপডেটেড রাখুন।",
    features: ["Daily Backup", "Security Patch", "Speed Optimization", "24/7 Monitoring"],
  },
  {
    label: "Graphics Design",
    slug: "graphics-design",
    icon: Palette,
    img: catGraphics,
    accent: "320 90% 65%",
    desc: "Logo, Branding, Banner, Social Media Post, Video Editing — সৃজনশীল গ্রাফিক্স ডিজাইন সলিউশন।",
    features: ["Logo & Branding", "Social Media Design", "Print Design", "Video Editing"],
  },
  {
    label: "Facebook Services",
    slug: "facebook-services",
    icon: Facebook,
    img: catFacebook,
    accent: "220 95% 65%",
    desc: "Facebook Page Setup, Ads Campaign, Page Boost, Page Verification — সম্পূর্ণ ফেসবুক সলিউশন।",
    features: ["Page Setup & Design", "Ads Campaign", "Page Boost", "Verified Badge"],
  },
  {
    label: "Digital Marketing",
    slug: "digital-marketing",
    icon: TrendingUp,
    img: catDigitalMarketing,
    accent: "150 80% 55%",
    desc: "Facebook, Google, YouTube ও Instagram Ads, SEO ও Content Marketing — Lead ও Sales বাড়ান।",
    features: ["Facebook & Google Ads", "SEO Optimization", "Content Marketing", "Lead Generation"],
  },
  {
    label: "Business Solutions",
    slug: "business-solutions",
    icon: Building2,
    img: catBusiness,
    accent: "42 95% 60%",
    desc: "ERP, CRM, POS, Inventory ও Office Automation — আপনার ব্যবসা স্মার্ট ও অটোমেটেড করুন।",
    features: ["ERP & CRM", "POS System", "Inventory Management", "Office Automation"],
  },
];

const ServicesPage = () => {
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

      {/* Categories Grid */}
      <section className="pb-24 relative">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.slug}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, type: "spring", stiffness: 120 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative rounded-2xl overflow-hidden transition-all duration-500 flex group"
                  style={{
                    background: `hsl(${cat.accent} / 0.06)`,
                    border: `1px solid hsl(${cat.accent} / 0.22)`,
                  }}
                >
                  <Link to={`/services/${cat.slug}`} className="flex flex-col p-7 w-full">
                    {/* Hover top line */}
                    <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `linear-gradient(90deg, transparent, hsl(${cat.accent} / 0.7), transparent)` }} />

                    {/* Hover background glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ background: `radial-gradient(circle at 50% 0%, hsl(${cat.accent} / 0.15), transparent 70%)` }} />

                    {/* Image + Icon Badge */}
                    <div className="relative w-full h-36 rounded-xl overflow-hidden mb-5"
                      style={{ boxShadow: `0 6px 18px hsl(${cat.accent} / 0.25)` }}>
                      <img src={cat.img} alt={cat.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 40%, hsl(${cat.accent} / 0.55))` }} />
                      <div className="absolute top-3 left-3 w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md"
                        style={{ background: `hsl(${cat.accent} / 0.35)`, border: `1px solid hsl(${cat.accent} / 0.55)` }}>
                        <Icon size={18} className="text-white" />
                      </div>
                      <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md backdrop-blur-md text-white"
                        style={{ background: `hsl(${cat.accent} / 0.35)`, border: `1px solid hsl(${cat.accent} / 0.55)` }}>
                        Premium
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-black text-foreground mb-2 group-hover:text-white transition-colors leading-tight">
                      {cat.label}
                    </h3>

                    {/* Description */}
                    <p className="text-foreground/55 text-sm leading-relaxed mb-5 group-hover:text-foreground/75 transition-colors">
                      {cat.desc}
                    </p>

                    {/* Features */}
                    <ul className="space-y-2 mb-6 flex-1">
                      {cat.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/60 group-hover:text-foreground/80 transition-colors">
                          <CheckCircle2 size={15} className="shrink-0 mt-0.5" style={{ color: `hsl(${cat.accent})` }} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="flex items-center gap-3 mt-auto pt-4 border-t" style={{ borderColor: `hsl(${cat.accent} / 0.22)` }}>
                      <span className="flex items-center gap-1.5 text-sm font-semibold transition-all group-hover:gap-2.5"
                        style={{ color: `hsl(${cat.accent})` }}>
                        প্যাকেজ দেখুন <ArrowRight size={14} />
                      </span>
                      <a
                        href="https://wa.me/8801820060046"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="ml-auto flex items-center gap-1 text-xs text-foreground/40 hover:text-green-400 transition-colors"
                      >
                        <MessageCircle size={13} /> WhatsApp
                      </a>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
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
    </div>
  );
};

export default ServicesPage;
