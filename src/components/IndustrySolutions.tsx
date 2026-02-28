import { ShoppingCart, UtensilsCrossed, Building2, Monitor, Ticket, FileText, Settings, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

const solutions = [
  { icon: ShoppingCart, title: "Ecommerce", desc: "Powerful online store platforms for growth.", color: "hsl(258,90%,66%)", bg: "rgba(139,92,246,0.10)", border: "rgba(139,92,246,0.22)" },
  { icon: UtensilsCrossed, title: "Restaurant", desc: "Digital menus & ordering management.", color: "hsl(25,95%,60%)", bg: "rgba(249,115,22,0.10)", border: "rgba(249,115,22,0.22)" },
  { icon: Building2, title: "ERP Systems", desc: "Integrated management for business ops.", color: "hsl(270,80%,65%)", bg: "rgba(147,51,234,0.10)", border: "rgba(147,51,234,0.22)" },
  { icon: Monitor, title: "POS Solutions", desc: "Fast & reliable point-of-sale systems.", color: "hsl(195,100%,50%)", bg: "rgba(0,188,212,0.10)", border: "rgba(0,188,212,0.22)" },
  { icon: Ticket, title: "Ticketing", desc: "Booking, reservation & event tools.", color: "hsl(315,80%,65%)", bg: "rgba(236,72,153,0.10)", border: "rgba(236,72,153,0.22)" },
  { icon: FileText, title: "Content CMS", desc: "Custom blogs & content management.", color: "hsl(155,70%,45%)", bg: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.22)" },
  { icon: Settings, title: "Management", desc: "Bespoke workflow optimization tools.", color: "hsl(45,93%,58%)", bg: "rgba(234,179,8,0.10)", border: "rgba(234,179,8,0.22)" },
  { icon: Smartphone, title: "Mobile Apps", desc: "iOS & Android high-performance apps.", color: "hsl(210,100%,62%)", bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.22)" },
];

const IndustrySolutions = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-30" />
      <div className="absolute left-0 top-1/3 w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, hsl(258,90%,66%) 0%, transparent 65%)', filter: 'blur(120px)', opacity: 0.08 }} />

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
            ◈ Industry Solutions
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mt-2">
            Solutions for <span className="gradient-text-cyan">Every Industry</span>
          </h2>
          <p className="text-foreground/45 mt-4 max-w-2xl mx-auto">
            Robust, scalable & innovative technology services to modernize your business across all sectors.
          </p>
          <div className="mt-5 mx-auto w-20 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(185,100%,48%), hsl(258,90%,66%))' }} />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {solutions.map((sol, i) => (
            <motion.div
              key={sol.title}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, type: "spring", stiffness: 130 }}
              whileHover={{ y: -8, scale: 1.03 }}
              className="group relative rounded-2xl p-6 cursor-pointer overflow-hidden transition-all duration-500"
              style={{ background: sol.bg, border: `1px solid ${sol.border}` }}
            >
              {/* Top glow line */}
              <div className="absolute top-0 left-4 right-4 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${sol.color}, transparent)` }} />

              <motion.div
                whileHover={{ rotate: 360, scale: 1.15 }}
                transition={{ duration: 0.6 }}
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shimmer"
                style={{ background: `linear-gradient(135deg, ${sol.color}22, ${sol.color}08)`, boxShadow: `0 0 20px ${sol.color}20` }}
              >
                <sol.icon size={22} style={{ color: sol.color, filter: `drop-shadow(0 0 6px ${sol.color})` }} />
              </motion.div>
              <h3 className="font-bold text-foreground/90 mb-2 group-hover:text-white transition-colors">{sol.title}</h3>
              <p className="text-xs text-foreground/45 leading-relaxed group-hover:text-foreground/60 transition-colors">{sol.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndustrySolutions;
