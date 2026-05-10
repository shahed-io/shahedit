import { useParams, Link, Navigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Globe, Wrench, Palette, Facebook, TrendingUp, Building2,
  CheckCircle2, ArrowRight, MessageCircle, Sparkles, Star, Package as PackageIcon,
  Search, X,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { formatBdt } from "@/lib/utils";

interface DbPackage {
  id: string;
  title: string;
  description: string | null;
  short_description: string | null;
  price: number | null;
  original_price: number | null;
  currency: string;
  features: string[] | null;
  image_url: string | null;
  is_featured: boolean;
  badge: string | null;
  delivery_days: number | null;
  slug: string | null;
}

import catWebDev from "@/assets/cat-web-dev.jpg";
import catMaintenance from "@/assets/cat-maintenance.jpg";
import catGraphics from "@/assets/cat-graphics.jpg";
import catFacebook from "@/assets/cat-facebook.jpg";
import catDigitalMarketing from "@/assets/cat-digital-marketing.jpg";
import catBusiness from "@/assets/cat-business.jpg";

type Category = {
  slug: string;
  label: string;
  bnTitle: string;
  tagline: string;
  intro: string;
  icon: typeof Globe;
  img: string;
  accent: string; // hsl
  bg: string;
  border: string;
  features: string[];
  packages: { title: string; price: string; desc: string; popular?: boolean }[];
  process: string[];
};

const categories: Record<string, Category> = {
  "web-development": {
    slug: "web-development",
    label: "Web Development",
    bnTitle: "ওয়েব ডেভেলপমেন্ট",
    tagline: "Modern · Fast · Scalable",
    intro:
      "WordPress থেকে শুরু করে Custom MERN/Django—আপনার ব্যবসার জন্য পারফরমেন্ট, সিকিউর এবং SEO-ফ্রেন্ডলি ওয়েবসাইট তৈরি করি যা আপনার গ্রাহকদের মুগ্ধ করবে।",
    icon: Globe,
    img: catWebDev,
    accent: "270 92% 65%",
    bg: "rgba(168,85,247,0.10)",
    border: "rgba(168,85,247,0.30)",
    features: [
      "WordPress, React, Next.js, MERN ও Django সাপোর্ট",
      "Mobile Responsive ও Lightning-Fast পারফরমেন্স",
      "SEO অপটিমাইজড কোডিং স্ট্রাকচার",
      "Admin Panel ও Database ইন্টিগ্রেশন",
      "Free SSL ও 1 বছর ফ্রি সাপোর্ট",
    ],
    packages: [
      { title: "WordPress Starter", price: "৳ 5,000", desc: "Landing page · 5 sections" },
      { title: "Business Pro", price: "৳ 15,000", desc: "Multi-page · CMS", popular: true },
      { title: "Custom MERN App", price: "৳ 1,50,000", desc: "Full-stack solution" },
    ],
    process: [
      "Requirement Analysis ও Wireframe",
      "UI/UX Design Approval",
      "Development ও QA Testing",
      "Live Deployment ও Training",
    ],
  },
  "website-maintenance": {
    slug: "website-maintenance",
    label: "Website Maintenance",
    bnTitle: "ওয়েবসাইট মেইনটেনেন্স",
    tagline: "24/7 · Secure · Reliable",
    intro:
      "আপনার ওয়েবসাইটকে রাখুন আপডেটেড, নিরাপদ এবং দ্রুত। নিয়মিত backup, security patch, bug fix এবং speed অপটিমাইজেশন—সবকিছু এক প্ল্যানে।",
    icon: Wrench,
    img: catMaintenance,
    accent: "210 90% 65%",
    bg: "rgba(59,130,246,0.10)",
    border: "rgba(59,130,246,0.30)",
    features: [
      "Daily/Weekly Backup ও Restore",
      "Security Patch ও Malware Removal",
      "Plugin/Theme Update ম্যানেজমেন্ট",
      "Speed অপটিমাইজেশন ও Caching",
      "Uptime Monitoring 24/7",
    ],
    packages: [
      { title: "Basic Care", price: "৳ 1,500/mo", desc: "Backup + Updates" },
      { title: "Pro Care", price: "৳ 3,500/mo", desc: "All-in-one + Security", popular: true },
      { title: "Enterprise", price: "৳ 8,000/mo", desc: "Priority + Custom Dev" },
    ],
    process: [
      "Site Audit ও Report",
      "Backup Setup ও Monitoring চালু",
      "Monthly Maintenance Cycle",
      "Performance Report পাঠানো",
    ],
  },
  "graphics-design": {
    slug: "graphics-design",
    label: "Graphics Design",
    bnTitle: "গ্রাফিক্স ডিজাইন",
    tagline: "Creative · Brand-First · Premium",
    intro:
      "Logo, Business Card, Brochure থেকে শুরু করে সম্পূর্ণ Brand Identity—আপনার ব্যবসাকে প্রিমিয়াম লুক দিতে আমাদের ডিজাইনাররা প্রস্তুত।",
    icon: Palette,
    img: catGraphics,
    accent: "320 90% 65%",
    bg: "rgba(236,72,153,0.10)",
    border: "rgba(236,72,153,0.30)",
    features: [
      "Premium Logo ও Brand Identity",
      "Business Card, Letterhead, Brochure",
      "Social Media Post Design Pack",
      "Banner, Poster, Flyer Design",
      "Source File সহ Unlimited Revision",
    ],
    packages: [
      { title: "Logo Only", price: "৳ 2,000", desc: "3 Concept · Source File" },
      { title: "Brand Pack", price: "৳ 8,000", desc: "Logo + Card + Letterhead", popular: true },
      { title: "Social Bundle", price: "৳ 12,000", desc: "30 Posts + Banners" },
    ],
    process: [
      "Brand Brief ও Inspiration",
      "Concept Sketch ও Preview",
      "Revision ও Final Approval",
      "Source File Delivery",
    ],
  },
  "facebook-services": {
    slug: "facebook-services",
    label: "Facebook Services",
    bnTitle: "ফেসবুক সার্ভিস",
    tagline: "Boost · Engage · Grow",
    intro:
      "Facebook Page Setup, Verified Badge, Boost Campaign, Targeted Ads—আপনার ব্যবসাকে Facebook-এ স্কেল করার সম্পূর্ণ সমাধান।",
    icon: Facebook,
    img: catFacebook,
    accent: "220 95% 65%",
    bg: "rgba(59,130,246,0.10)",
    border: "rgba(59,130,246,0.30)",
    features: [
      "Page Setup ও সম্পূর্ণ Optimization",
      "Targeted Boost ও Ads Campaign",
      "Pixel ও Conversion API Setup",
      "Daily/Weekly Engagement Strategy",
      "Detailed Analytics Report",
    ],
    packages: [
      { title: "Page Setup", price: "৳ 1,500", desc: "Branding + Cover + About" },
      { title: "Boost Manager", price: "৳ 5,000/mo", desc: "Ad Setup + Optimization", popular: true },
      { title: "Full Marketing", price: "৳ 12,000/mo", desc: "Content + Ads + Reports" },
    ],
    process: [
      "Page Audit ও Strategy",
      "Campaign Setup ও Pixel Install",
      "Live Optimization ও A/B Test",
      "Monthly Performance Report",
    ],
  },
  "digital-marketing": {
    slug: "digital-marketing",
    label: "Digital Marketing",
    bnTitle: "ডিজিটাল মার্কেটিং",
    tagline: "SEO · SMM · ROI Focused",
    intro:
      "SEO, Google Ads, Social Media Marketing, Email Campaign—Data-driven ডিজিটাল মার্কেটিং কৌশল দিয়ে আপনার ব্যবসার ROI বাড়ান।",
    icon: TrendingUp,
    img: catDigitalMarketing,
    accent: "150 80% 55%",
    bg: "rgba(34,197,94,0.10)",
    border: "rgba(34,197,94,0.30)",
    features: [
      "SEO ও Keyword Research",
      "Google Ads ও Search Campaign",
      "Social Media Marketing (FB, IG, TikTok)",
      "Email Marketing ও Automation",
      "Monthly Analytics ও Growth Report",
    ],
    packages: [
      { title: "SEO Starter", price: "৳ 6,000/mo", desc: "On-page + Off-page" },
      { title: "Growth Pack", price: "৳ 15,000/mo", desc: "SEO + SMM + Ads", popular: true },
      { title: "Enterprise", price: "৳ 35,000/mo", desc: "Full Funnel Marketing" },
    ],
    process: [
      "Market Research ও Strategy",
      "Campaign Launch ও Optimization",
      "Content Calendar Execution",
      "ROI Tracking ও Scaling",
    ],
  },
  "business-solutions": {
    slug: "business-solutions",
    label: "Business Solutions",
    bnTitle: "বিজনেস সলিউশন",
    tagline: "Custom · Enterprise · ERP",
    intro:
      "POS, Inventory Management, CRM, ERP—আপনার ব্যবসার বিশেষ চাহিদা অনুযায়ী Custom Software ও Cloud Solution তৈরি করি।",
    icon: Building2,
    img: catBusiness,
    accent: "42 95% 60%",
    bg: "rgba(234,179,8,0.10)",
    border: "rgba(234,179,8,0.30)",
    features: [
      "Custom POS ও Inventory System",
      "CRM ও Lead Management",
      "ERP ও HR Management Software",
      "Cloud Hosting ও Domain সেটআপ",
      "API Integration ও Automation",
    ],
    packages: [
      { title: "POS Lite", price: "৳ 25,000", desc: "Single shop · Inventory" },
      { title: "CRM Pro", price: "৳ 60,000", desc: "Lead + Pipeline + Email", popular: true },
      { title: "Enterprise ERP", price: "৳ 1,50,000+", desc: "Custom Modules" },
    ],
    process: [
      "Business Workflow Analysis",
      "Custom Module Design",
      "Development ও User Training",
      "Ongoing Support ও Updates",
    ],
  },
  "app-development": {
    slug: "app-development",
    label: "App Development",
    bnTitle: "অ্যাপ ডেভেলপমেন্ট",
    tagline: "Android · iOS · Cross-platform",
    intro:
      "Android, iOS, ও Cross-platform অ্যাপ তৈরি করি React Native, Flutter ও Native টেকনোলজি দিয়ে—দ্রুত, সিকিউর এবং স্কেলেবল।",
    icon: Globe,
    img: catWebDev,
    accent: "217 89% 61%",
    bg: "rgba(59,130,246,0.10)",
    border: "rgba(59,130,246,0.30)",
    features: [
      "Android App Development",
      "iOS App Development",
      "Flutter / React Native App",
      "অ্যাপ ব্যাকএন্ড ও ডাটাবেইস",
      "Play Store / App Store পাবলিশিং",
    ],
    packages: [
      { title: "Starter App", price: "৳ 35,000", desc: "Single platform · Basic" },
      { title: "Cross-Platform", price: "৳ 80,000", desc: "Android + iOS", popular: true },
      { title: "Enterprise App", price: "৳ 2,00,000+", desc: "Custom + Backend" },
    ],
    process: [
      "Requirement ও UX Plan",
      "UI Design ও Prototype",
      "Development ও QA",
      "Store Publish ও Support",
    ],
  },
  "cloud-hosting-service": {
    slug: "cloud-hosting-service",
    label: "Cloud & Hosting Service",
    bnTitle: "ক্লাউড ও হোস্টিং",
    tagline: "Domain · Hosting · VPS",
    intro:
      "Domain, Shared Hosting, VPS ও Cloud Server সেটআপ—আপনার সাইটের জন্য দ্রুত ও নির্ভরযোগ্য হোস্টিং সমাধান।",
    icon: Globe,
    img: catBusiness,
    accent: "45 93% 58%",
    bg: "rgba(234,179,8,0.10)",
    border: "rgba(234,179,8,0.30)",
    features: [
      "Domain Registration",
      "cPanel Shared Hosting",
      "VPS ও Cloud Server",
      "Email Hosting Setup",
      "SSL ও Migration সাপোর্ট",
    ],
    packages: [
      { title: "Starter Hosting", price: "৳ 1,500/yr", desc: "1 GB · Free SSL" },
      { title: "Business Hosting", price: "৳ 4,500/yr", desc: "10 GB · Email", popular: true },
      { title: "VPS / Cloud", price: "৳ 1,200/mo+", desc: "Custom Resource" },
    ],
    process: [
      "প্ল্যান নির্বাচন",
      "Domain ও SSL Setup",
      "Migration / Deployment",
      "Ongoing Monitoring",
    ],
  },
  "it-support-security": {
    slug: "it-support-security",
    label: "IT Support & Security",
    bnTitle: "আইটি সাপোর্ট ও সিকিউরিটি",
    tagline: "Cyber · Network · Repair",
    intro:
      "Cyber Security, Network সেটআপ, কম্পিউটার রিপেয়ার ও IT কনসালটেন্সি—আপনার অফিসের সম্পূর্ণ IT সাপোর্ট।",
    icon: Wrench,
    img: catMaintenance,
    accent: "160 80% 55%",
    bg: "rgba(34,197,94,0.10)",
    border: "rgba(34,197,94,0.30)",
    features: [
      "Cyber Security Audit",
      "Network ও Wi-Fi সেটআপ",
      "PC / Laptop রিপেয়ার",
      "Server ও Backup Setup",
      "Remote IT Support",
    ],
    packages: [
      { title: "Basic Support", price: "৳ 2,000/mo", desc: "Remote Help · Updates" },
      { title: "Office Care", price: "৳ 6,000/mo", desc: "On-site + Network", popular: true },
      { title: "Enterprise Security", price: "৳ 15,000/mo+", desc: "Audit + Monitoring" },
    ],
    process: [
      "IT Audit ও Risk Check",
      "সমাধান প্ল্যান",
      "Implementation",
      "Continuous Monitoring",
    ],
  },
};

const ServiceCategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const cat = slug ? categories[slug] : null;
  const [dbPackages, setDbPackages] = useState<DbPackage[]>([]);
  const [loadingPkgs, setLoadingPkgs] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "featured" | string>("all"); // 'all' | 'featured' | badge
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc" | "name_asc">("default");

  const availableBadges = useMemo(() => {
    const set = new Set<string>();
    dbPackages.forEach(p => { if (p.badge) set.add(p.badge); });
    return Array.from(set);
  }, [dbPackages]);

  const visiblePackages = useMemo(() => {
    let list = [...dbPackages];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.short_description ?? "").toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q) ||
        (p.features ?? []).some(f => f.toLowerCase().includes(q))
      );
    }
    if (filter === "featured") list = list.filter(p => p.is_featured);
    else if (filter !== "all") list = list.filter(p => p.badge === filter);

    if (sortBy === "price_asc") list.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    else if (sortBy === "price_desc") list.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    else if (sortBy === "name_asc") list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [dbPackages, query, filter, sortBy]);

  useEffect(() => {
    if (!slug) return;
    setLoadingPkgs(true);
    (async () => {
      const { data: svc } = await supabase
        .from("services")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .select("id" as any)
        .eq("slug" as never, slug as never)
        .maybeSingle();
      const svcId = (svc as { id?: string } | null)?.id;
      if (!svcId) { setDbPackages([]); setLoadingPkgs(false); return; }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: pkgs } = await (supabase as any)
        .from("service_packages")
        .select("*")
        .eq("service_id", svcId)
        .eq("is_published", true)
        .order("sort_order");
      setDbPackages((pkgs ?? []) as DbPackage[]);
      setLoadingPkgs(false);
    })();
  }, [slug]);

  if (!cat) return <Navigate to="/services" replace />;

  const Icon = cat.icon;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${cat.label} — Shahed IT`}
        description={cat.intro.slice(0, 160)}
      />
      <SiteHeader />

      {/* Hero */}
      <section className="pt-28 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px] rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(ellipse, hsl(${cat.accent}) 0%, transparent 65%)`,
            filter: "blur(140px)",
            opacity: 0.18,
          }}
        />
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <Link to="/services" className="text-xs text-foreground/50 hover:text-foreground/80 inline-flex items-center gap-1 mb-4">
                ← All Services
              </Link>
              <span
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-5"
                style={{ background: cat.bg, border: `1px solid ${cat.border}`, color: `hsl(${cat.accent})` }}
              >
                <Sparkles size={12} /> {cat.tagline}
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-foreground mb-3 leading-tight">
                {cat.bnTitle}
              </h1>
              <p className="text-foreground/70 text-lg mb-2 font-semibold">{cat.label}</p>
              <p className="text-foreground/55 text-base leading-relaxed mb-8 max-w-xl">{cat.intro}</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/get-quote"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:scale-105 hover:shadow-xl"
                  style={{ background: `linear-gradient(135deg, hsl(${cat.accent}), hsl(320,90%,48%))` }}
                >
                  ফ্রি কোটেশন নিন <ArrowRight size={16} />
                </Link>
                <a
                  href="https://wa.me/8801820060046"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm border transition-all hover:scale-105"
                  style={{ borderColor: "rgba(34,197,94,0.35)", color: "hsl(142,71%,55%)", background: "rgba(34,197,94,0.06)" }}
                >
                  <MessageCircle size={16} /> WhatsApp করুন
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="relative rounded-3xl overflow-hidden border"
              style={{ borderColor: cat.border, background: cat.bg }}
            >
              <img src={cat.img} alt={cat.label} className="w-full h-80 object-cover" />
              <div className="absolute top-4 left-4 w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-md"
                style={{ background: `hsla(${cat.accent}, 0.25)`, border: `1px solid hsla(${cat.accent}, 0.5)` }}>
                <Icon size={24} style={{ color: `hsl(${cat.accent})` }} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-10 text-center">
            কী কী <span className="gradient-text">পাবেন</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {cat.features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl p-5 border flex items-start gap-3"
                style={{ background: cat.bg, borderColor: cat.border }}
              >
                <CheckCircle2 size={20} style={{ color: `hsl(${cat.accent})` }} className="shrink-0 mt-0.5" />
                <span className="text-foreground/80 text-sm leading-relaxed">{f}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages / Products from DB */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-3 text-center">
            <span className="gradient-text">প্যাকেজ</span> ও প্রোডাক্ট
          </h2>
          <p className="text-foreground/50 text-center mb-8 text-sm">এই ক্যাটাগরির সকল প্রোডাক্ট ও প্যাকেজ</p>

          {/* Search · Filter · Sort toolbar */}
          {!loadingPkgs && dbPackages.length > 0 && (
            <div className="max-w-6xl mx-auto mb-8 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="প্রোডাক্ট খুঁজুন..."
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm placeholder:text-foreground/40 focus:outline-none focus:border-white/30"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground">
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                {/* Filter chips */}
                <div className="flex flex-wrap gap-1.5">
                  {[{ key: "all", label: "সব" }, { key: "featured", label: "⭐ Featured" }, ...availableBadges.map(b => ({ key: b, label: b.toUpperCase() }))].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setFilter(opt.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        filter === opt.key
                          ? "text-white shadow-md"
                          : "bg-white/5 text-foreground/60 border border-white/10 hover:text-foreground"
                      }`}
                      style={filter === opt.key ? { background: `hsl(${cat.accent})` } : undefined}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as typeof sortBy)}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-foreground text-xs font-semibold focus:outline-none focus:border-white/30"
                >
                  <option value="default">সর্বশেষ</option>
                  <option value="price_asc">কম দাম</option>
                  <option value="price_desc">বেশি দাম</option>
                  <option value="name_asc">নাম (A→Z)</option>
                </select>
              </div>
            </div>
          )}

          {!loadingPkgs && dbPackages.length > 0 && (
            <p className="text-center text-foreground/45 text-xs mb-5">
              {visiblePackages.length} টি প্রোডাক্ট দেখানো হচ্ছে {dbPackages.length !== visiblePackages.length ? `(মোট ${dbPackages.length})` : ""}
            </p>
          )}

          {loadingPkgs ? (
            <div className="grid md:grid-cols-3 gap-5 max-w-6xl mx-auto">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-72 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
              ))}
            </div>
          ) : dbPackages.length === 0 ? (
            <div className="max-w-md mx-auto text-center rounded-2xl p-10 border" style={{ background: cat.bg, borderColor: cat.border }}>
              <PackageIcon size={36} className="mx-auto mb-4" style={{ color: `hsl(${cat.accent})` }} />
              <p className="text-foreground/70 font-semibold mb-2">এই ক্যাটাগরিতে এখনো কোনো প্রোডাক্ট যোগ করা হয়নি</p>
              <p className="text-foreground/45 text-sm mb-5">কাস্টম অর্ডারের জন্য যোগাযোগ করুন</p>
              <Link to="/get-quote" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white text-sm"
                style={{ background: `linear-gradient(135deg, hsl(${cat.accent}), hsl(320,90%,48%))` }}>
                ফ্রি কোটেশন নিন <ArrowRight size={14} />
              </Link>
            </div>
          ) : visiblePackages.length === 0 ? (
            <div className="max-w-md mx-auto text-center rounded-2xl p-8 border" style={{ background: cat.bg, borderColor: cat.border }}>
              <Search size={28} className="mx-auto mb-3" style={{ color: `hsl(${cat.accent})` }} />
              <p className="text-foreground/70 font-semibold mb-1">কোনো প্রোডাক্ট পাওয়া যায়নি</p>
              <p className="text-foreground/45 text-sm mb-4">সার্চ বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
              <button
                onClick={() => { setQuery(""); setFilter("all"); setSortBy("default"); }}
                className="text-xs font-bold px-4 py-2 rounded-lg border border-white/15 text-foreground/80 hover:bg-white/5"
              >
                ফিল্টার রিসেট করুন
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
              {visiblePackages.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -6 }}
                  className={`relative rounded-2xl border overflow-hidden transition-all flex flex-col ${p.is_featured ? "shadow-2xl" : ""}`}
                  style={{
                    background: p.is_featured ? `hsla(${cat.accent}, 0.12)` : cat.bg,
                    borderColor: p.is_featured ? `hsl(${cat.accent})` : cat.border,
                  }}
                >
                  {p.is_featured && (
                    <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                      <Star size={9} fill="currentColor" /> Featured
                    </span>
                  )}
                  {p.badge && !p.is_featured && (
                    <span className="absolute top-3 right-3 z-10 inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full text-white"
                      style={{ background: `hsl(${cat.accent})` }}>
                      {p.badge}
                    </span>
                  )}

                  {p.image_url ? (
                    <div className="w-full h-44 overflow-hidden">
                      <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ) : (
                    <div className="w-full h-44 flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, hsla(${cat.accent}, 0.25), hsla(${cat.accent}, 0.05))` }}>
                      <Icon size={48} style={{ color: `hsl(${cat.accent})` }} />
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-black text-foreground mb-1 leading-tight">{p.title}</h3>
                    {p.short_description && (
                      <p className="text-foreground/55 text-xs mb-3 line-clamp-2">{p.short_description}</p>
                    )}

                    <div className="flex items-baseline gap-2 mb-3">
                      <p className="text-2xl font-black" style={{ color: `hsl(${cat.accent})` }}>
                        {p.price != null ? `৳${formatBdt(p.price)}` : "—"}
                      </p>
                      {p.original_price != null && p.price != null && p.original_price > p.price && (
                        <p className="text-xs text-foreground/40 line-through">৳{formatBdt(p.original_price)}</p>
                      )}
                    </div>

                    {p.features && p.features.length > 0 && (
                      <ul className="space-y-1.5 mb-5 flex-1">
                        {p.features.slice(0, 4).map((f, j) => (
                          <li key={j} className="flex items-start gap-2 text-xs text-foreground/65">
                            <CheckCircle2 size={13} className="shrink-0 mt-0.5" style={{ color: `hsl(${cat.accent})` }} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}

                    <Link
                      to={`/product/${p.slug ?? p.id}`}
                      className="block text-center w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] mt-auto"
                      style={{ background: `linear-gradient(135deg, hsl(${cat.accent}), hsl(320,90%,48%))` }}
                    >
                      বিস্তারিত দেখুন
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Process */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-10 text-center">
            আমাদের <span className="gradient-text">প্রসেস</span>
          </h2>
          <div className="grid md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {cat.process.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl p-5 border text-center"
                style={{ background: cat.bg, borderColor: cat.border }}
              >
                <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center font-black text-sm mb-3"
                  style={{ background: `hsla(${cat.accent}, 0.25)`, color: `hsl(${cat.accent})` }}>
                  {i + 1}
                </div>
                <p className="text-foreground/75 text-sm leading-relaxed">{step}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
            শুরু করতে প্রস্তুত? <span className="gradient-text">আজই যোগাযোগ করুন</span>
          </h2>
          <p className="text-foreground/55 mb-8 max-w-xl mx-auto">
            ফ্রি কনসালটেশন ও কাস্টম কোটেশনের জন্য আমাদের টিমের সাথে কথা বলুন।
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/get-quote"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:scale-105 hover:shadow-xl"
              style={{ background: `linear-gradient(135deg, hsl(${cat.accent}), hsl(320,90%,48%))` }}
            >
              ফ্রি কোটেশন নিন <ArrowRight size={16} />
            </Link>
            <a
              href="https://wa.me/8801820060046"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm border transition-all hover:scale-105"
              style={{ borderColor: "rgba(34,197,94,0.35)", color: "hsl(142,71%,55%)", background: "rgba(34,197,94,0.06)" }}
            >
              <MessageCircle size={16} /> WhatsApp করুন
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default ServiceCategoryPage;
