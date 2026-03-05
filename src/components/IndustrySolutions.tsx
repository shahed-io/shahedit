import { ShoppingCart, UtensilsCrossed, Building2, Monitor, Ticket, FileText, Settings, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

const solutions = [
  { icon: ShoppingCart, title: "Ecommerce", desc: "Powerful online store platforms for growth.", color: "hsl(258,90%,66%)", glow: "rgba(139,92,246,0.35)", border: "rgba(139,92,246,0.30)" },
  { icon: UtensilsCrossed, title: "Restaurant", desc: "Digital menus & ordering management.", color: "hsl(25,95%,60%)", glow: "rgba(249,115,22,0.30)", border: "rgba(249,115,22,0.28)" },
  { icon: Building2, title: "ERP Systems", desc: "Integrated management for business ops.", color: "hsl(270,80%,65%)", glow: "rgba(147,51,234,0.30)", border: "rgba(147,51,234,0.28)" },
  { icon: Monitor, title: "POS Solutions", desc: "Fast & reliable point-of-sale systems.", color: "hsl(185,100%,50%)", glow: "rgba(0,188,212,0.28)", border: "rgba(0,188,212,0.28)" },
  { icon: Ticket, title: "Ticketing", desc: "Booking, reservation & event tools.", color: "hsl(315,80%,65%)", glow: "rgba(236,72,153,0.30)", border: "rgba(236,72,153,0.28)" },
  { icon: FileText, title: "Content CMS", desc: "Custom blogs & content management.", color: "hsl(155,70%,45%)", glow: "rgba(34,197,94,0.28)", border: "rgba(34,197,94,0.28)" },
  { icon: Settings, title: "Management", desc: "Bespoke workflow optimization tools.", color: "hsl(45,93%,58%)", glow: "rgba(234,179,8,0.28)", border: "rgba(234,179,8,0.28)" },
  { icon: Smartphone, title: "Mobile Apps", desc: "iOS & Android high-performance apps.", color: "hsl(210,100%,62%)", glow: "rgba(59,130,246,0.30)", border: "rgba(59,130,246,0.28)" },
];

const IndustrySolutions = () => {
  return (
    <section className="py-28 relative overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 dot-grid opacity-20" />
      <div className="absolute left-[-200px] top-[20%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(258,90%,66%) 0%, transparent 60%)', filter: 'blur(100px)', opacity: 0.10 }} />
      <div className="absolute right-[-200px] bottom-[10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(185,100%,50%) 0%, transparent 60%)', filter: 'blur(100px)', opacity: 0.08 }} />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] px-5 py-2 rounded-full mb-5"
            style={{
              background: 'rgba(6,182,212,0.08)',
              border: '1px solid rgba(6,182,212,0.25)',
              color: 'hsl(185,100%,55%)',
              backdropFilter: 'blur(10px)',
            }}
          >
            ◈ Industry Solutions
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mt-2">
            Solutions for <span className="gradient-text-cyan">Every Industry</span>
          </h2>
          <p className="text-foreground/45 mt-4 max-w-2xl mx-auto text-sm leading-relaxed">
            Robust, scalable & innovative technology services to modernize your business across all sectors.
          </p>
          <div className="mt-5 mx-auto w-20 h-[3px] rounded-full" style={{ background: 'linear-gradient(90deg, hsl(185,100%,48%), hsl(258,90%,66%))' }} />
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {solutions.map((sol, i) => (
            <motion.div
              key={sol.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.5, type: "spring", stiffness: 120 }}
              whileHover={{ y: -10, scale: 1.025 }}
              whileTap={{ scale: 0.91, y: 0, transition: { duration: 0.12 } }}
              className="group relative rounded-2xl p-6 cursor-pointer overflow-hidden"
              style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.02) 100%)`,
                border: `1px solid ${sol.border}`,
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                boxShadow: `0 4px 30px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07)`,
              }}
            >
              {/* Glow bg on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{ background: `radial-gradient(ellipse at 30% 30%, ${sol.glow} 0%, transparent 65%)` }}
              />

              {/* Top shimmer line */}
              <div
                className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-all duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${sol.color}, transparent)` }}
              />

              {/* Bottom corner glow */}
              <div
                className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-500"
                style={{ background: sol.glow, filter: 'blur(20px)' }}
              />

              {/* Icon */}
              <motion.div
                whileHover={{ rotate: 12, scale: 1.18 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{
                  background: `linear-gradient(135deg, ${sol.color}20 0%, ${sol.color}08 100%)`,
                  border: `1px solid ${sol.color}30`,
                  boxShadow: `0 0 18px ${sol.color}25, inset 0 1px 0 rgba(255,255,255,0.1)`,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <sol.icon size={22} style={{ color: sol.color, filter: `drop-shadow(0 0 8px ${sol.color})` }} />
              </motion.div>

              {/* Text */}
              <h3 className="relative font-bold text-foreground/90 mb-2 text-sm group-hover:text-white transition-colors duration-300">{sol.title}</h3>
              <p className="relative text-xs text-foreground/40 leading-relaxed group-hover:text-foreground/65 transition-colors duration-300">{sol.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndustrySolutions;
