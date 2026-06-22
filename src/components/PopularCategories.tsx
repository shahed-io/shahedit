import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Code2, Smartphone, Palette, BarChart3, Cloud, ShieldCheck } from "lucide-react";

const categories = [
  { name: "Web Development", sub: "Business · E-commerce · WordPress", tag: "Most Popular", icon: Code2, href: "/services/web-development", color: "hsl(270,92%,65%)", bg: "rgba(168,85,247,0.10)", border: "rgba(168,85,247,0.30)" },
  { name: "Website Maintenance", sub: "Speed · Security · Backup", tag: "Reliable", icon: Smartphone, href: "/services/website-maintenance", color: "hsl(217,89%,61%)", bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.30)" },
  { name: "Graphics Design", sub: "Logo · Branding · Video", tag: "Creative", icon: Palette, href: "/services/graphics-design", color: "hsl(315,80%,65%)", bg: "rgba(236,72,153,0.10)", border: "rgba(236,72,153,0.30)" },
  { name: "Digital Marketing", sub: "Facebook · Google · SEO", tag: "Trending", icon: BarChart3, href: "/services/digital-marketing", color: "hsl(320,90%,55%)", bg: "rgba(236,72,153,0.10)", border: "rgba(236,72,153,0.30)" },
  { name: "Facebook Services", sub: "Page · Ads · Boost", tag: "Growth", icon: Cloud, href: "/services/facebook-services", color: "hsl(45,93%,58%)", bg: "rgba(234,179,8,0.10)", border: "rgba(234,179,8,0.30)" },
  { name: "Business Solutions", sub: "ERP · CRM · Automation", tag: "Enterprise", icon: ShieldCheck, href: "/services/business-solutions", color: "hsl(160,80%,55%)", bg: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.30)" },
];

const PopularCategories = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Seamless blend with Hero — same deep purple-black base */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[#0a0514]" />

      {/* Top fade-in from Hero so the seam disappears */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-40 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, #0a0514 0%, rgba(10,5,20,0.65) 55%, transparent 100%)" }} />

      {/* Ambient color wash matching the global cinematic background */}
      <div aria-hidden className="absolute inset-0 pointer-events-none opacity-80"
        style={{
          background:
            "radial-gradient(at 15% 20%, hsla(270,92%,55%,0.22) 0px, transparent 50%), radial-gradient(at 85% 80%, hsla(320,90%,55%,0.18) 0px, transparent 55%)",
        }} />

      {/* Subtle dot grid */}
      <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, hsl(270,92%,65%) 0%, transparent 70%)', opacity: 0.10 }} />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] px-5 py-2 rounded-full mb-5"
            style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.30)', color: 'hsl(320,90%,65%)', backdropFilter: 'blur(8px)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'hsl(320,90%,55%)', boxShadow: '0 0 10px hsl(320,90%,55%)' }} />
            Premium Services
          </motion.span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mt-2 tracking-tight">
            Explore Our <span className="gradient-text">Categories</span>
          </h2>
          <p className="mt-5 text-base md:text-lg text-foreground/60 max-w-2xl mx-auto leading-relaxed">
            World-class digital solutions crafted to elevate your brand and accelerate business growth.
          </p>
          <div className="mt-6 mx-auto w-24 h-[3px] rounded-full" style={{ background: 'linear-gradient(90deg, transparent, hsl(270,92%,65%), hsl(320,90%,55%), transparent)' }} />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 130 }}
              whileHover={{ y: -12, scale: 1.05 }}
              whileTap={{ scale: 0.94, y: 0, transition: { duration: 0.12 } }}
            >
              <Link
                to={cat.href}
                aria-label={`Explore ${cat.name}`}
                className="group flex flex-col items-center p-6 rounded-2xl cursor-pointer relative overflow-hidden transition-all duration-500 h-full"
                style={{
                  background: `linear-gradient(160deg, ${cat.bg}, rgba(10,10,20,0.45))`,
                  border: `1px solid ${cat.border}`,
                  backdropFilter: 'blur(12px)',
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.35)`,
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-px opacity-60"
                  style={{ background: `linear-gradient(90deg, transparent, ${cat.color}, transparent)` }} />

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${cat.color}30, transparent 70%)` }} />

                <span
                  className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                  style={{ background: `${cat.color}20`, color: cat.color, border: `1px solid ${cat.color}40` }}
                >
                  {cat.tag}
                </span>

                <motion.div
                  whileHover={{ rotate: [0, -8, 8, 0], scale: 1.15 }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mt-2 relative shimmer"
                  style={{
                    background: `linear-gradient(135deg, ${cat.color}30, ${cat.color}08)`,
                    border: `1px solid ${cat.color}40`,
                    boxShadow: `0 0 24px ${cat.color}25, inset 0 1px 0 ${cat.color}30`,
                  }}
                >
                  <cat.icon size={28} style={{ color: cat.color, filter: `drop-shadow(0 0 10px ${cat.color}80)` }} />
                </motion.div>

                <h3 className="text-sm font-bold text-foreground/90 text-center leading-tight group-hover:text-foreground transition-colors duration-300">
                  {cat.name}
                </h3>
                <p className="text-[11px] mt-2 font-semibold text-center transition-colors duration-300 tracking-wide" style={{ color: cat.color }}>
                  {cat.sub}
                </p>

                <div className="mt-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: cat.color }}>Explore</span>
                  <span className="text-[10px]" style={{ color: cat.color }}>→</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Smooth fade-out to keep section boundaries harmonious */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, hsl(var(--background)))" }} />
    </section>
  );
};

export default PopularCategories;
