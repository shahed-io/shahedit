import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, CheckCircle2, AlertCircle, Sparkles, BookOpen, Target, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { techDetails } from "@/data/techDetails";

const techs = [
  { name: "React", color: "#61DAFB", symbol: "⚛" },
  { name: "Next.js", color: "#a0aec0", symbol: "N" },
  { name: "Node.js", color: "#68D391", symbol: "⬡" },
  { name: "TypeScript", color: "#63B3ED", symbol: "TS" },
  { name: "WordPress", color: "#63AEDE", symbol: "W" },
  { name: "PHP", color: "#A78BFA", symbol: "<?>" },
  { name: "Laravel", color: "#FC8181", symbol: "L" },
  { name: "MongoDB", color: "#68D391", symbol: "M" },
  { name: "MySQL", color: "#63B3ED", symbol: "⊏" },
  { name: "Figma", color: "#F6AD55", symbol: "▣" },
  { name: "Flutter", color: "#63B3ED", symbol: "◇" },
  { name: "Python", color: "#F6E05E", symbol: "🐍" },
];

const TechStack = () => {
  const [activeTech, setActiveTech] = useState<string | null>(null);
  const detail = activeTech ? techDetails[activeTech] : null;
  const activeMeta = activeTech ? techs.find((t) => t.name === activeTech) : null;

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 cross-grid opacity-40" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.05) 0%, transparent 50%, rgba(236,72,153,0.05) 100%)' }} />
      <div className="absolute top-10 left-10 w-[500px] h-[400px] rounded-full float-anim"
        style={{ background: 'radial-gradient(ellipse, hsl(270,92%,65%) 0%, transparent 65%)', opacity: 0.10 }} />
      <div className="absolute bottom-10 right-10 w-[400px] h-[350px] rounded-full float-anim"
        style={{ background: 'radial-gradient(ellipse, hsl(320,90%,48%) 0%, transparent 65%)', opacity: 0.09, animationDelay: '3s' }} />

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-6"
              style={{ background: 'rgba(168,85,247,0.10)', border: '1px solid rgba(168,85,247,0.25)', color: 'hsl(270,92%,75%)' }}
            >
              ◈ Our Tech Stack
            </motion.span>

            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-5">
              Powered by<br />
              <span className="gradient-text">Best-in-Class</span><br />
              Technology
            </h2>
            <div className="w-20 h-1 rounded-full mb-7" style={{ background: 'linear-gradient(90deg, hsl(270,92%,65%), hsl(320,90%,48%))' }} />

            <p className="text-foreground/50 leading-relaxed mb-4 text-base">
              We leverage the latest and most powerful technologies to build scalable, high-performance solutions. Our tech stack is carefully selected for reliability, speed, and flexibility.
            </p>
            <p className="text-foreground/50 leading-relaxed mb-4 text-base">
              From cutting-edge frontend frameworks to robust backend infrastructure — your project is built on a solid foundation ready for the future.
            </p>
            <p className="text-[hsl(320,90%,68%)] text-sm font-semibold mb-9 inline-flex items-center gap-2">
              <Sparkles size={14} /> যেকোনো technology এর নামে click করুন — বিস্তারিত পড়ুন
            </p>

            <Link to="/services">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-base font-bold text-hsl group glossy-btn"
                style={{ background: 'linear-gradient(135deg, hsl(320,90%,48%), hsl(210,100%,55%))', boxShadow: '0 6px 25px rgba(236,72,153,0.40)', color: 'hsl(265,45%,4%)' }}
              >
                Explore Our Services <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Right - Tech grid */}
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="grid grid-cols-3 sm:grid-cols-4 gap-3"
          >
            {techs.map((tech, i) => (
              <motion.button
                key={tech.name}
                type="button"
                onClick={() => setActiveTech(tech.name)}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, type: "spring", stiffness: 130 }}
                whileHover={{ y: -6, scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`${tech.name} সম্পর্কে বিস্তারিত দেখুন`}
                className="rounded-2xl p-4 flex flex-col items-center gap-3 cursor-pointer group transition-all duration-300 text-left"
                style={{ background: `${tech.color}10`, border: `1px solid ${tech.color}25` }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shimmer"
                  style={{ background: `${tech.color}18`, color: tech.color, boxShadow: `0 0 15px ${tech.color}20`, filter: `drop-shadow(0 0 4px ${tech.color}40)` }}>
                  {tech.symbol}
                </div>
                <span className="text-xs font-semibold text-foreground/55 group-hover:text-foreground transition-colors text-center">
                  {tech.name}
                </span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {detail && activeMeta && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveTech(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md"
            style={{ background: "rgba(5, 2, 12, 0.75)" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/[0.08]"
              style={{
                background: "linear-gradient(180deg, #1a0b2e 0%, #0f0620 100%)",
                boxShadow: "0 40px 100px -30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              {/* Decorative glow */}
              <div
                className="absolute -top-32 -right-32 w-72 h-72 rounded-full pointer-events-none opacity-40"
                style={{ background: `radial-gradient(circle, ${activeMeta.color}40, transparent 70%)` }}
              />

              {/* Close */}
              <button
                onClick={() => setActiveTech(null)}
                aria-label="বন্ধ করুন"
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 text-white transition-all"
              >
                <X size={18} />
              </button>

              {/* Header */}
              <div className="p-7 pb-5 border-b border-white/[0.06] relative">
                <div className="flex items-start gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0"
                    style={{
                      background: `${activeMeta.color}20`,
                      color: activeMeta.color,
                      boxShadow: `0 10px 30px -10px ${activeMeta.color}60`,
                      border: `1px solid ${activeMeta.color}35`,
                    }}
                  >
                    {activeMeta.symbol}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.18em] uppercase px-2.5 py-1 rounded-full"
                        style={{
                          background: `${activeMeta.color}18`,
                          color: activeMeta.color,
                          border: `1px solid ${activeMeta.color}30`,
                        }}
                      >
                        <Tag size={9} /> {detail.category}
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-extrabold font-syne text-white leading-tight">
                      {detail.name}
                    </h3>
                    <p className="text-sm text-white/55 mt-1.5">{detail.tagline}</p>
                  </div>
                </div>
              </div>

              {/* Scrollable content */}
              <div className="overflow-y-auto p-7 space-y-6" style={{ maxHeight: "calc(90vh - 180px)" }}>
                {/* What is it */}
                <section>
                  <h4 className="flex items-center gap-2 text-sm font-bold tracking-[0.15em] uppercase text-[hsl(320,90%,68%)] mb-3">
                    <BookOpen size={14} /> এটা কী?
                  </h4>
                  <p className="text-white/80 leading-relaxed text-[15px]">{detail.whatIsIt}</p>
                </section>

                {/* History */}
                <section>
                  <h4 className="flex items-center gap-2 text-sm font-bold tracking-[0.15em] uppercase text-[hsl(320,90%,68%)] mb-3">
                    <Sparkles size={14} /> ইতিহাস ও উৎপত্তি
                  </h4>
                  <p className="text-white/80 leading-relaxed text-[15px]">{detail.history}</p>
                </section>

                {/* Pros & Cons grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  <section
                    className="rounded-2xl p-5 border border-white/[0.06]"
                    style={{ background: "rgba(34,197,94,0.05)" }}
                  >
                    <h4 className="flex items-center gap-2 text-sm font-bold tracking-[0.15em] uppercase text-emerald-400 mb-3">
                      <CheckCircle2 size={14} /> সুবিধা
                    </h4>
                    <ul className="space-y-2.5">
                      {detail.pros.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/80 leading-relaxed">
                          <CheckCircle2 size={14} className="shrink-0 mt-1 text-emerald-400" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section
                    className="rounded-2xl p-5 border border-white/[0.06]"
                    style={{ background: "rgba(244,114,182,0.05)" }}
                  >
                    <h4 className="flex items-center gap-2 text-sm font-bold tracking-[0.15em] uppercase text-pink-400 mb-3">
                      <AlertCircle size={14} /> অসুবিধা
                    </h4>
                    <ul className="space-y-2.5">
                      {detail.cons.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/80 leading-relaxed">
                          <AlertCircle size={14} className="shrink-0 mt-1 text-pink-400" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                {/* Best for */}
                <section
                  className="rounded-2xl p-5 border border-white/[0.06]"
                  style={{ background: "linear-gradient(135deg, hsla(320,90%,55%,0.08), hsla(270,92%,55%,0.08))" }}
                >
                  <h4 className="flex items-center gap-2 text-sm font-bold tracking-[0.15em] uppercase text-[hsl(320,90%,75%)] mb-3">
                    <Target size={14} /> কোন কোন কাজে আদর্শ
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {detail.bestFor.map((b, i) => (
                      <span
                        key={i}
                        className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-white/85"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </section>

                {/* CTA */}
                <div className="pt-2">
                  <Link
                    to="/get-quote"
                    onClick={() => setActiveTech(null)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:scale-[1.02]"
                    style={{
                      background: "linear-gradient(135deg, hsl(320,90%,55%), hsl(270,92%,55%))",
                      boxShadow: "0 10px 30px -10px hsla(320,90%,55%,0.55)",
                    }}
                  >
                    {detail.name} দিয়ে project শুরু করুন <ArrowRight size={15} />
                  </Link>
                </div>
              </div>

              {/* Bottom edge */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[3px] pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, ${activeMeta.color}, hsl(270,92%,55%))`,
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default TechStack;
