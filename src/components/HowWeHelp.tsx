import { Headset, LayoutGrid, Hammer, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: Headset, step: "01", title: "Consultation",
    desc: "We take time to understand your business, goals, and challenges through an in-depth discovery session.",
    color: "hsl(42,70%,65%)", bg: "rgba(201,161,74,0.10)", border: "rgba(201,161,74,0.22)",
  },
  {
    icon: LayoutGrid, step: "02", title: "Customization",
    desc: "We architect tailored solutions designed precisely around your unique business requirements.",
    color: "hsl(45,85%,48%)", bg: "rgba(244,215,122,0.10)", border: "rgba(244,215,122,0.22)",
  },
  {
    icon: Hammer, step: "03", title: "Implementation",
    desc: "Our expert engineers bring your solution to life — on time, on budget, and beyond expectations.",
    color: "hsl(315,80%,65%)", bg: "rgba(244,215,122,0.10)", border: "rgba(244,215,122,0.22)",
  },
  {
    icon: ShieldCheck, step: "04", title: "Ongoing Support",
    desc: "We provide continued support and maintenance so your solutions grow with your business.",
    color: "hsl(45,93%,58%)", bg: "rgba(234,179,8,0.10)", border: "rgba(234,179,8,0.22)",
  },
];

const HowWeHelp = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 tech-grid-bg opacity-40" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(10,8,20,0.4) 50%, transparent 100%)' }} />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, hsl(45,85%,48%) 0%, transparent 65%)', filter: 'blur(120px)', opacity: 0.07 }} />

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
            style={{ background: 'rgba(201,161,74,0.10)', border: '1px solid rgba(201,161,74,0.25)', color: 'hsl(42,70%,75%)' }}
          >
            ◈ Our Process
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mt-2">
            How We <span className="gradient-text">Help You Grow</span>
          </h2>
          <p className="text-foreground/45 mt-4 max-w-xl mx-auto text-base">
            4 proven steps Shahed IT takes to transform your ideas into successful digital products.
          </p>
          <div className="mt-5 mx-auto w-20 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(42,70%,65%), hsl(45,85%,48%))' }} />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, type: "spring", stiffness: 110 }}
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.93, y: 0, transition: { duration: 0.12 } }}
              className="relative rounded-2xl p-7 group cursor-pointer overflow-hidden transition-all duration-500"
              style={{ background: step.bg, border: `1px solid ${step.border}` }}
            >
              {/* Top glow on hover */}
              <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${step.color}, transparent)` }} />

              {/* Step number background */}
              <div className="absolute top-4 right-4 text-6xl font-black opacity-5 select-none" style={{ color: step.color }}>
                {step.step}
              </div>

              <motion.div
                whileHover={{ scale: 1.15, rotate: [0, -8, 8, 0] }}
                transition={{ duration: 0.5 }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shimmer"
                style={{ background: `linear-gradient(135deg, ${step.color}25, ${step.color}10)`, boxShadow: `0 0 25px ${step.color}25, inset 0 1px 0 rgba(255,255,255,0.1)` }}
              >
                <step.icon size={26} style={{ color: step.color, filter: `drop-shadow(0 0 8px ${step.color})` }} />
              </motion.div>

              <span className="text-xs font-black uppercase tracking-[0.2em] mb-2 block" style={{ color: step.color }}>
                Step {step.step}
              </span>
              <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-white transition-colors">
                {step.title}
              </h3>
              <p className="text-sm text-foreground/50 leading-relaxed group-hover:text-foreground/65 transition-colors">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowWeHelp;
