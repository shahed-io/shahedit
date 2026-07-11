import { Phone, Mail, MapPin, Package, Info, FileText, Facebook, MessageCircle, Instagram, Send, ShieldCheck, BadgeCheck, ArrowUpRight, Sparkles } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import deeplIdLogo from "@/assets/deepl-id-logo.png";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const productLinks = [
  { label: "Web Development", to: "/services/web-development" },
  { label: "Graphics Design", to: "/services/graphics-design" },
  { label: "Digital Marketing", to: "/services/digital-marketing" },
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
  { label: "Category", to: "/services" },
];

const policyLinks = [
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms & Conditions", to: "/terms" },
  { label: "Refund & Return Policy", to: "/refund-policy" },
  { label: "Order & Cancellation", to: "/complaint-policy" },
  { label: "Delivery Info", to: "/delivery-policy" },
  { label: "Refund Request", to: "/refund-request" },
];

const socials = [
  { Icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { Icon: MessageCircle, href: "https://m.me", label: "Messenger" },
  { Icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { Icon: Send, href: "https://t.me", label: "Telegram" },
];

const payments = ["Bkash", "Nagad", "Rocket", "Upay", "Bkash Merchant"];

interface ColumnProps {
  title: string;
  Icon: typeof Package;
  accent: string; // tailwind hue eg "from-primary to-accent"
  items: { label: string; to: string }[];
}

const FooterColumn = ({ title, Icon, accent, items }: ColumnProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="group relative rounded-2xl p-6 sm:p-7 overflow-hidden transition-all duration-300 hover:-translate-y-1"
    style={{
      background:
        "linear-gradient(155deg, hsla(265, 55%, 12%, 0.85) 0%, hsla(280, 60%, 9%, 0.80) 50%, hsla(255, 50%, 7%, 0.88) 100%)",
      border: "1px solid hsla(280, 80%, 65%, 0.18)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      boxShadow:
        "0 10px 40px -12px hsla(270, 90%, 40%, 0.35), inset 0 1px 0 hsla(0, 0%, 100%, 0.05)",
    }}
  >
    {/* dotted overlay matching site background */}
    <div
      className="absolute inset-0 opacity-40 pointer-events-none"
      style={{
        backgroundImage:
          "radial-gradient(circle, hsla(285, 90%, 75%, 0.18) 1px, transparent 1.5px)",
        backgroundSize: "22px 22px",
      }}
    />
    {/* corner glow */}
    <div
      className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-50 pointer-events-none"
      style={{
        background:
          "radial-gradient(circle, hsla(285, 95%, 60%, 0.30), transparent 70%)",
        filter: "blur(30px)",
      }}
    />
    {/* hover shimmer */}
    <div
      className={`absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent ${accent.includes("primary") ? "via-primary" : accent.includes("blue") ? "via-accent" : "via-emerald-400"} to-transparent`}
    />
    <div className="relative">
      <div className="flex items-center gap-3 mb-5">
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${accent} shadow-lg`}>
          <Icon size={18} className="text-white" />
        </span>
        <h4 className="font-bold text-foreground/90 text-sm tracking-[0.18em] uppercase">{title}</h4>
      </div>
      <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent mb-4" />
      <ul className="space-y-3 text-sm">
        {items.map((it) => (
          <li key={it.label}>
            <Link
              to={it.to}
              className="group/link inline-flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${accent} transition-transform group-hover/link:scale-150`} />
              <span className="group-hover/link:translate-x-1 transition-transform">{it.label}</span>
              <ArrowUpRight size={12} className="opacity-0 -translate-x-1 group-hover/link:opacity-60 group-hover/link:translate-x-0 transition-all" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </motion.div>
);

const SiteFooter = () => {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/10">
      {/* Ambient background glows matching site theme */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, hsla(258, 90%, 66%, 0.18), transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute -top-20 right-0 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, hsla(185, 100%, 48%, 0.14), transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, hsla(315, 80%, 65%, 0.10), transparent 70%)", filter: "blur(80px)" }} />
      </div>

      {/* top hairline gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 pt-16 pb-8 relative">
        {/* Top centered brand card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl p-8 sm:p-10 mb-10 text-center overflow-hidden"
          style={{
            background:
              "linear-gradient(155deg, hsla(265, 55%, 12%, 0.88) 0%, hsla(280, 60%, 9%, 0.82) 50%, hsla(255, 50%, 7%, 0.90) 100%)",
            border: "1px solid hsla(280, 80%, 65%, 0.20)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow:
              "0 12px 50px -14px hsla(270, 90%, 40%, 0.45), inset 0 1px 0 hsla(0, 0%, 100%, 0.05)",
          }}
        >
          {/* dotted overlay matching site background */}
          <div
            className="absolute inset-0 opacity-50 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, hsla(285, 90%, 75%, 0.18) 1px, transparent 1.5px)",
              backgroundSize: "22px 22px",
            }}
          />
          {/* corner glow accents */}
          <div
            className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-60 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, hsla(285, 95%, 60%, 0.32), transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <div
            className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full opacity-50 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, hsla(320, 90%, 55%, 0.28), transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          {/* inner top glow */}
          <div className="absolute inset-0 pointer-events-none opacity-60"
            style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, hsla(285,95%,65%,0.18), transparent 70%)" }} />

          <div className="relative">
            {/* Logo + brand */}
            <Link to="/" className="inline-flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary/15 to-accent/15 border border-white/10 shadow-[0_0_24px_-4px_hsla(258,90%,66%,0.45)] shrink-0 backdrop-blur-sm">
                <BrandMark size={52} glow="soft" />
              </div>
              <div className="flex flex-col items-start">
                <div className="flex items-baseline gap-2 text-3xl sm:text-4xl font-black tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                  <span className="bg-gradient-to-r from-primary via-fuchsia-400 to-accent bg-clip-text text-transparent">Shahed</span>
                  <span className="bg-gradient-to-r from-accent to-cyan-300 bg-clip-text text-transparent">IT</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="h-px w-6 bg-gradient-to-r from-transparent to-primary" />
                  <span className="text-[11px] font-bold tracking-[0.25em] text-muted-foreground">SHAHEDIT.COM</span>
                  <span className="h-px w-6 bg-gradient-to-l from-transparent to-accent" />
                </div>
              </div>
            </Link>

            {/* Tagline */}
            <p className="text-sm sm:text-base mb-6 max-w-2xl mx-auto leading-relaxed">
              <span className="text-foreground/80">বাংলাদেশের সবচেয়ে </span>
              <span className="text-accent font-semibold">বিশ্বস্ত ডিজিটাল আইটি সলিউশন পার্টনার</span>
              <span className="text-foreground/80">। </span>
              <span className="bg-gradient-to-r from-primary to-fuchsia-400 bg-clip-text text-transparent font-semibold">এন্টারপ্রাইজ-গ্রেড টেকনোলজি</span>
              <span className="text-foreground/80">, </span>
              <span className="text-accent font-semibold">স্কেলেবল আর্কিটেকচার</span>
              <span className="text-foreground/80"> ও </span>
              <span className="bg-gradient-to-r from-accent to-emerald-400 bg-clip-text text-transparent font-semibold">২৪/৭ ডেডিকেটেড সাপোর্টে</span>
              <span className="text-foreground/80"> আপনার ব্যবসাকে পরবর্তী ধাপে নিয়ে যাচ্ছি।</span>
            </p>

            {/* Contact rows */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-6">
              <a href="tel:+8801820060046" className="group inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 hover:border-primary/40 hover:bg-primary/10 transition-colors">
                <span className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-fuchsia-500 shadow-md">
                  <Phone size={13} className="text-white" />
                </span>
                <span className="text-sm font-medium text-foreground/90">01820-060046</span>
              </a>
              <a href="mailto:info@shahedit.com" className="group inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 hover:border-accent/40 hover:bg-accent/10 transition-colors">
                <span className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-accent to-cyan-500 shadow-md">
                  <Mail size={13} className="text-white" />
                </span>
                <span className="text-sm font-medium text-foreground/90">info@shahedit.com</span>
              </a>
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10">
                <span className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md">
                  <MapPin size={13} className="text-white" />
                </span>
                <span className="text-sm font-medium text-foreground/90">Rajshahi, Bangladesh</span>
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
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.04] border border-white/10 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/15 transition-colors"
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 3-column links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <FooterColumn title="Products" Icon={Package} accent="from-primary to-fuchsia-500" items={productLinks} />
          <FooterColumn title="Information" Icon={Info} accent="from-blue-500 to-accent" items={infoLinks} />
          <FooterColumn title="Policies" Icon={FileText} accent="from-accent to-emerald-400" items={policyLinks} />
        </div>

        {/* Bottom bar: certified | payments | trust */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl p-5 sm:p-6 flex flex-col lg:flex-row items-center justify-between gap-5 overflow-hidden"
          style={{
            background:
              "linear-gradient(155deg, hsla(265, 55%, 12%, 0.85) 0%, hsla(280, 60%, 9%, 0.80) 50%, hsla(255, 50%, 7%, 0.88) 100%)",
            border: "1px solid hsla(280, 80%, 65%, 0.18)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            boxShadow:
              "0 10px 40px -12px hsla(270, 90%, 40%, 0.35), inset 0 1px 0 hsla(0, 0%, 100%, 0.05)",
          }}
        >
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, hsla(285, 90%, 75%, 0.18) 1px, transparent 1.5px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div
            className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-50 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, hsla(320, 90%, 55%, 0.28), transparent 70%)",
              filter: "blur(30px)",
            }}
          />
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {/* Rotating conic glow ring */}
              <span
                className="absolute -inset-1.5 rounded-full opacity-80 blur-[6px] animate-spin"
                style={{
                  background:
                    "conic-gradient(from 0deg, hsl(280,80%,60%), hsl(320,90%,55%), hsl(315,80%,65%), hsl(270,92%,65%), hsl(280,80%,60%))",
                  animationDuration: "6s",
                }}
                aria-hidden
              />
              {/* Soft pulsing halo */}
              <span
                className="absolute -inset-3 rounded-full animate-pulse"
                style={{
                  background:
                    "radial-gradient(circle, hsla(280,80%,60%,0.35), transparent 70%)",
                }}
                aria-hidden
              />
              {/* Logo badge */}
              <span className="relative block w-14 h-14 rounded-full bg-white border border-white/30 shadow-[0_0_24px_-2px_hsla(280,80%,60%,0.7)] overflow-hidden">
                <img src={deeplIdLogo} alt="DeepL ID" className="w-full h-full object-cover" />
                {/* Glossy highlight */}
                <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.55),transparent_55%)]" />
              </span>
              {/* Verified check chip */}
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-background flex items-center justify-center shadow-md">
                <BadgeCheck size={11} className="text-white" strokeWidth={3} />
              </span>
            </div>
            <div className="text-left">
              <div className="text-sm font-bold tracking-wider text-foreground/90 leading-tight">Certificate of Digital Business Identity (DBID)</div>
              <div className="text-xs text-muted-foreground mt-0.5">DBID: 623962552</div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase mr-1">Payments:</span>
            {payments.map((p) => (
              <span
                key={p}
                className="px-3 py-1 rounded-full text-xs font-semibold text-foreground/90 bg-white/[0.04] border border-white/10 hover:border-white/25 transition-colors"
              >
                {p}
              </span>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-400/30">
            <BadgeCheck size={16} className="text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-300">Trusted Digital IT Partner</span>
          </div>
        </motion.div>

        {/* Minimalist Hairline Copyright */}
        <div className="mt-12 w-full px-6">
          <div className="relative flex flex-col items-center justify-center py-8">
            {/* Subtle top hairline */}
            <div
              aria-hidden
              className="absolute top-0 left-0 right-0 h-px pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent, hsla(0,0%,100%,0.10), transparent)",
              }}
            />

            <p
              className="text-[11px] uppercase tracking-[0.25em] text-foreground/40 font-light text-center flex flex-wrap items-center justify-center gap-x-1 gap-y-1"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <span>&copy; {new Date().getFullYear()}</span>
              <Link
                to="/"
                className="text-foreground/70 font-normal hover:text-foreground transition-colors duration-300 mx-1"
              >
                Shahed IT
              </Link>
              <span className="text-foreground/20 mx-2 font-thin">&middot;</span>
              <span>All Rights Reserved</span>
              <span className="text-foreground/20 mx-2 font-thin">&middot;</span>
              <span>Crafted by</span>
              <Link
                to="/"
                className="text-foreground/70 font-normal hover:text-foreground transition-colors duration-300 mx-1"
              >
                Shahed IT
              </Link>
            </p>

            {/* Micro underglow accent */}
            <div
              aria-hidden
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-px pointer-events-none"
              style={{
                background: "hsla(0,0%,100%,0.08)",
                filter: "blur(2px)",
              }}
            />
          </div>
        </div>


      </div>
    </footer>
  );
};

export default SiteFooter;
