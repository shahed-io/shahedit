import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { techNameToSlug } from "@/data/techDetails";

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
  return (
    <section id="tech-stack" className="py-24 relative overflow-hidden">
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
              <Sparkles size={14} /> যেকোনো technology এর নামে click করুন — বিস্তারিত page এ যান
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
            {techs.map((tech, i) => {
              const slug = techNameToSlug[tech.name];
              return (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 130 }}
                  whileHover={{ y: -6, scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={`/tech/${slug}`}
                    aria-label={`${tech.name} সম্পর্কে বিস্তারিত দেখুন`}
                    className="rounded-2xl p-4 flex flex-col items-center gap-3 cursor-pointer group transition-all duration-300 text-left h-full"
                    style={{ background: `${tech.color}10`, border: `1px solid ${tech.color}25` }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shimmer"
                      style={{ background: `${tech.color}18`, color: tech.color, boxShadow: `0 0 15px ${tech.color}20`, filter: `drop-shadow(0 0 4px ${tech.color}40)` }}>
                      {tech.symbol}
                    </div>
                    <span className="text-xs font-semibold text-foreground/55 group-hover:text-foreground transition-colors text-center">
                      {tech.name}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TechStack;
