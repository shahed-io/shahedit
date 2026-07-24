import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Code2, Smartphone, Palette, BarChart3, Cloud, ShieldCheck } from "lucide-react";

const categories = [
  { name: "Web Development", icon: Code2, href: "/services/web-development", color: "hsl(270,92%,65%)" },
  { name: "Website Maintenance", icon: Smartphone, href: "/services/website-maintenance", color: "hsl(217,89%,61%)" },
  { name: "Graphics Design", icon: Palette, href: "/services/graphics-design", color: "hsl(315,80%,65%)" },
  { name: "Digital Marketing", icon: BarChart3, href: "/services/digital-marketing", color: "hsl(320,90%,55%)" },
  { name: "Facebook Services", icon: Cloud, href: "/services/facebook-services", color: "hsl(45,93%,58%)" },
  { name: "Business Solutions", icon: ShieldCheck, href: "/services/business-solutions", color: "hsl(160,80%,55%)" },
];

const PopularCategories = () => {
  return (
    <section className="py-24 relative overflow-hidden">
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 24, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, type: "spring", stiffness: 140 }}
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.94 }}
            >
              <Link
                to={cat.href}
                aria-label={`Explore ${cat.name}`}
                title={cat.name}
                className="group flex flex-col items-center justify-center cursor-pointer relative py-6"
              >
                {/* Ambient glow */}
                <div
                  className="absolute inset-0 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${cat.color} 0%, transparent 65%)` }}
                />

                {/* Icon orb */}
                <motion.div
                  whileHover={{ rotate: [0, -6, 6, 0], scale: 1.08 }}
                  transition={{ duration: 0.6 }}
                  className="relative w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${cat.color}25, rgba(10,10,20,0.55) 70%)`,
                    border: `1px solid ${cat.color}55`,
                    boxShadow: `0 0 32px ${cat.color}30, inset 0 1px 0 ${cat.color}40, inset 0 -20px 40px rgba(0,0,0,0.4)`,
                    backdropFilter: 'blur(10px)',
                  }}
                >


                  <cat.icon
                    size={44}
                    strokeWidth={1.5}
                    style={{ color: cat.color, filter: `drop-shadow(0 0 12px ${cat.color}90)` }}
                  />
                </motion.div>

                {/* Minimal label */}
                <h3
                  className="mt-5 text-xs md:text-sm font-semibold uppercase tracking-[0.18em] text-center transition-colors duration-300"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  {cat.name}
                </h3>
                <div
                  className="mt-2 h-[2px] w-0 group-hover:w-10 transition-all duration-500 rounded-full"
                  style={{ background: `linear-gradient(90deg, transparent, ${cat.color}, transparent)` }}
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCategories;
