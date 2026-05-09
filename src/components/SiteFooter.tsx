import { Phone, Mail, MapPin, Package, Info, FileText, Facebook, MessageCircle, Instagram, Send, ShieldCheck, BadgeCheck } from "lucide-react";
import logoImg from "@/assets/logo-glossy.png";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const productLinks = [
  { label: "Web Development", to: "/services" },
  { label: "Graphics Design", to: "/services" },
  { label: "Digital Marketing", to: "/services" },
  { label: "All Products", to: "/services" },
  { label: "Pricing", to: "/pricing" },
  { label: "Get Quote", to: "/get-quote" },
];

const infoLinks = [
  { label: "FAQs", to: "/faq" },
  { label: "About Us", to: "/about" },
  { label: "My Account", to: "/dashboard" },
  { label: "Contact Us", to: "/contact" },
  { label: "Blog", to: "/blog" },
  { label: "Portfolio", to: "/portfolio" },
];

const policyLinks = [
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms & Conditions", to: "/terms" },
  { label: "Refund & Return Policy", to: "/refund-policy" },
  { label: "Order & Cancellation", to: "/complaint-policy" },
  { label: "Delivery Info", to: "/delivery-policy" },
  { label: "Refund Request", to: "/refund-policy" },
];

const socials = [
  { Icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { Icon: MessageCircle, href: "https://m.me", label: "Messenger" },
  { Icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { Icon: Send, href: "https://t.me", label: "Telegram" },
];

const payments = ["bKash", "Nagad", "Rocket", "Upay", "bKash Merchant"];

interface ColumnProps {
  title: string;
  Icon: typeof Package;
  iconBg: string;
  iconColor: string;
  dotColor: string;
  items: { label: string; to: string }[];
}

const FooterColumn = ({ title, Icon, iconBg, iconColor, dotColor, items }: ColumnProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="rounded-2xl p-6 sm:p-7 bg-white/70 backdrop-blur-xl border border-slate-200/70 shadow-[0_4px_24px_-8px_rgba(99,102,241,0.10)]"
  >
    <div className="flex items-center gap-3 mb-4">
      <span
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: iconBg }}
      >
        <Icon size={18} style={{ color: iconColor }} />
      </span>
      <h4 className="font-bold text-slate-700 text-sm tracking-[0.18em] uppercase">{title}</h4>
    </div>
    <div className="h-px bg-gradient-to-r from-slate-200 via-slate-200/60 to-transparent mb-4" />
    <ul className="space-y-3 text-sm">
      {items.map((it) => (
        <li key={it.label}>
          <Link
            to={it.to}
            className="group inline-flex items-center gap-2.5 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <span
              className="w-1.5 h-1.5 rounded-full transition-transform group-hover:scale-150"
              style={{ background: dotColor }}
            />
            <span className="group-hover:translate-x-0.5 transition-transform">{it.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  </motion.div>
);

const SiteFooter = () => {
  return (
    <footer className="relative mt-20 overflow-hidden" style={{ background: "linear-gradient(180deg, #f7f6ff 0%, #f3f4ff 50%, #eef2ff 100%)" }}>
      {/* subtle ambient blobs */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.10), transparent 70%)", filter: "blur(80px)" }} />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(20,184,166,0.10), transparent 70%)", filter: "blur(80px)" }} />

      <div className="container mx-auto px-4 sm:px-6 pt-14 pb-8 relative">
        {/* Top centered brand card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl p-8 sm:p-10 mb-8 bg-white/75 backdrop-blur-xl border border-slate-200/70 shadow-[0_8px_32px_-12px_rgba(99,102,241,0.15)] text-center"
        >
          {/* Logo + brand */}
          <Link to="/" className="inline-flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-orange-50 to-purple-50 border border-purple-200/60 shadow-sm shrink-0">
              <img src={logoImg} alt="Shahed IT" className="w-12 h-12 object-contain drop-shadow-[0_2px_6px_rgba(20,184,166,0.4)]" />
            </div>
            <div className="flex flex-col items-start">
              <div className="flex items-baseline gap-2 text-3xl sm:text-4xl font-black tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <span style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Shahed</span>
                <span style={{ background: "linear-gradient(135deg, #2563eb, #4f46e5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>IT</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="h-px w-6 bg-orange-400" />
                <span className="text-[11px] font-bold tracking-[0.25em] text-slate-500">SHAHEDIT.COM</span>
                <span className="h-px w-6 bg-teal-400" />
              </div>
            </div>
          </Link>

          {/* Tagline */}
          <p className="text-sm sm:text-base mb-6">
            <span className="text-emerald-600 font-medium">বাংলাদেশের সবচেয়ে </span>
            <span className="text-teal-600 font-semibold italic">বিশ্বস্ত ডিজিটাল আইটি সলিউশন</span>
            <span className="text-slate-700">। </span>
            <span className="text-rose-500 font-semibold italic">প্রিমিয়াম কোয়ালিটি</span>
            <span className="text-slate-700">, </span>
            <span className="text-emerald-600 font-medium">সেরা দামে</span>
            <span className="text-slate-700">, </span>
            <span className="text-teal-600 font-semibold italic">ইনস্ট্যান্ট ডেলিভারি।</span>
          </p>

          {/* Contact rows */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <a href="tel:+8801820060046" className="inline-flex items-center gap-3 text-slate-700 hover:text-purple-600 transition-colors group">
              <span className="w-9 h-9 rounded-full flex items-center justify-center bg-purple-100 border border-purple-200">
                <Phone size={14} className="text-purple-600" />
              </span>
              <span className="text-sm font-medium">01820-060046</span>
            </a>
            <a href="mailto:info.shahedit@gmail.com" className="inline-flex items-center gap-3 text-slate-700 hover:text-blue-600 transition-colors">
              <span className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-100 border border-blue-200">
                <Mail size={14} className="text-blue-600" />
              </span>
              <span className="text-sm font-medium">info.shahedit@gmail.com</span>
            </a>
            <div className="inline-flex items-center gap-3 text-slate-700">
              <span className="w-9 h-9 rounded-full flex items-center justify-center bg-emerald-100 border border-emerald-200">
                <MapPin size={14} className="text-emerald-600" />
              </span>
              <span className="text-sm font-medium">Sopura, Rajshahi, Bangladesh</span>
            </div>
          </div>

          {/* Social */}
          <div className="flex items-center justify-center gap-3">
            {socials.map(({ Icon, href, label }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                whileHover={{ y: -3, scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-purple-600 hover:border-purple-300 shadow-sm transition-colors"
              >
                <Icon size={16} />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* 3-column links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <FooterColumn
            title="Products"
            Icon={Package}
            iconBg="rgba(168,85,247,0.12)"
            iconColor="#9333ea"
            dotColor="#a855f7"
            items={productLinks}
          />
          <FooterColumn
            title="Information"
            Icon={Info}
            iconBg="rgba(59,130,246,0.12)"
            iconColor="#2563eb"
            dotColor="#60a5fa"
            items={infoLinks}
          />
          <FooterColumn
            title="Policies"
            Icon={FileText}
            iconBg="rgba(20,184,166,0.12)"
            iconColor="#0d9488"
            dotColor="#14b8a6"
            items={policyLinks}
          />
        </div>

        {/* Bottom bar: certified | payments | trust */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl p-5 sm:p-6 bg-white/75 backdrop-blur-xl border border-slate-200/70 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-5"
        >
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-teal-100 border border-purple-200/60">
              <ShieldCheck size={20} className="text-purple-600" />
            </span>
            <div className="text-left">
              <div className="text-sm font-bold tracking-wider text-slate-700">GOVT. CERTIFIED BUSINESS</div>
              <div className="text-xs text-slate-500 mt-0.5">DBID: 586772174</div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">Payments:</span>
            {payments.map((p) => (
              <span
                key={p}
                className="px-3 py-1 rounded-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 shadow-sm"
              >
                {p}
              </span>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200">
            <BadgeCheck size={16} className="text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700">Trusted Digital IT Partner</span>
          </div>
        </motion.div>

        {/* Copyright */}
        <div className="text-center text-xs text-slate-500 mt-6">
          © {new Date().getFullYear()}{" "}
          <span className="font-bold" style={{ background: "linear-gradient(90deg, #f97316, #2563eb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Shahed IT
          </span>{" "}
          · All Rights Reserved · Designed &amp; Developed by{" "}
          <span className="font-semibold text-purple-600">Shahed IT</span>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
