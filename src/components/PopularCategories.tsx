import { motion } from "framer-motion";
import { Code2, Smartphone, Palette, BarChart3, Cloud, ShieldCheck } from "lucide-react";

const categories = [
  { name: "Web Design & Development", sub: "বিজনেস · ই-কমার্স · WordPress", icon: Code2, color: "hsl(258,90%,66%)", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.25)" },
  { name: "App Development", sub: "Android · iOS · Flutter", icon: Smartphone, color: "hsl(217,89%,61%)", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)" },
  { name: "Graphic Design", sub: "Logo · Branding · Video", icon: Palette, color: "hsl(315,80%,65%)", bg: "rgba(236,72,153,0.12)", border: "rgba(236,72,153,0.25)" },
  { name: "Digital Marketing", sub: "Facebook · Google · SEO", icon: BarChart3, color: "hsl(185,100%,48%)", bg: "rgba(6,182,212,0.12)", border: "rgba(6,182,212,0.25)" },
  { name: "Cloud & Hosting", sub: "Domain · Hosting · VPS", icon: Cloud, color: "hsl(45,93%,58%)", bg: "rgba(234,179,8,0.12)", border: "rgba(234,179,8,0.25)" },
  { name: "IT Support & Security", sub: "Cyber · Network · Repair", icon: ShieldCheck, color: "hsl(160,80%,55%)", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.25)" },
];

const PopularCategories = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Section divider top */}
      <div className="absolute top-0 left-0 right-0 section-divider" />

      {/* Background */}
      <div className="absolute inset-0 dot-grid opacity-25" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full"
        style={{ background: 'radial-gradient(ellipse, hsl(258,90%,66%) 0%, transparent 70%)', filter: 'blur(120px)', opacity: 0.07 }} />

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
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4"
            style={{ background: 'rgba(6,182,212,0.10)', border: '1px solid rgba(6,182,212,0.25)', color: 'hsl(185,100%,55%)' }}
          >
            ◈ Our Services
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mt-2">
            Popular <span className="gradient-text">Categories</span>
          </h2>
          <div className="mt-4 mx-auto w-20 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(258,90%,66%), hsl(185,100%,48%))' }} />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.a
              key={cat.name}
              href="/services"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 130 }}
              whileHover={{ y: -10, scale: 1.04 }}
              whileTap={{ scale: 0.92, y: 0, transition: { duration: 0.12 } }}
              className="group flex flex-col items-center p-6 rounded-2xl cursor-pointer relative overflow-hidden transition-all duration-500"
              style={{ background: cat.bg, border: `1px solid ${cat.border}` }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{ background: `radial-gradient(circle at 50% 0%, ${cat.color}20, transparent 70%)` }} />

              <motion.div
                whileHover={{ rotate: [0, -8, 8, 0], scale: 1.15 }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 relative shimmer"
                style={{ background: `linear-gradient(135deg, ${cat.color}25, ${cat.color}10)`, border: `1px solid ${cat.color}30`, boxShadow: `0 0 20px ${cat.color}20` }}
              >
                <cat.icon size={26} style={{ color: cat.color, filter: `drop-shadow(0 0 8px ${cat.color}60)` }} />
              </motion.div>

              <h3 className="text-sm font-bold text-foreground/85 text-center leading-tight group-hover:text-foreground transition-colors duration-300">
                {cat.name}
              </h3>
              <p className="text-xs mt-1.5 font-medium text-center transition-colors duration-300" style={{ color: cat.color }}>
                {cat.sub}
              </p>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Section divider bottom */}
      <div className="absolute bottom-0 left-0 right-0 section-divider" />
    </section>
  );
};

export default PopularCategories;
