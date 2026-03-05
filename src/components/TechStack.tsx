import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

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

// Animated code lines for the left panel
const codeLines = [
  { content: "const project = await build({", color: "hsl(210,30%,75%)" },
  { content: "  framework: 'React',", color: "hsl(155,70%,55%)" },
  { content: "  backend: 'Node.js',", color: "hsl(155,70%,55%)" },
  { content: "  database: 'MySQL',", color: "hsl(155,70%,55%)" },
  { content: "  deploy: 'production'", color: "hsl(45,93%,65%)" },
  { content: "});", color: "hsl(210,30%,75%)" },
  { content: "// ✓ Build successful!", color: "hsl(155,70%,45%)" },
];

const TechStack = () => {
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 cross-grid opacity-40" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.05) 0%, transparent 50%, rgba(6,182,212,0.05) 100%)' }} />
      <div className="absolute top-10 left-10 w-[500px] h-[400px] rounded-full float-anim"
        style={{ background: 'radial-gradient(ellipse, hsl(258,90%,66%) 0%, transparent 65%)', filter: 'blur(120px)', opacity: 0.10 }} />
      <div className="absolute bottom-10 right-10 w-[400px] h-[350px] rounded-full float-anim"
        style={{ background: 'radial-gradient(ellipse, hsl(185,100%,48%) 0%, transparent 65%)', filter: 'blur(100px)', opacity: 0.09, animationDelay: '3s' }} />

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-6"
              style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.25)', color: 'hsl(258,90%,75%)' }}
            >
              ◈ Our Tech Stack
            </motion.span>

            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-5">
              Powered by<br />
              <span className="gradient-text">Best-in-Class</span><br />
              Technology
            </h2>
            <div className="w-20 h-1 rounded-full mb-7" style={{ background: 'linear-gradient(90deg, hsl(258,90%,66%), hsl(185,100%,48%))' }} />

            {/* Animated code block */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="terminal-box rounded-xl p-5 mb-8 relative overflow-hidden"
            >
              {/* Window dots */}
              <div className="flex gap-1.5 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <span className="ml-2 text-xs font-mono" style={{ color: 'hsl(210,20%,40%)' }}>project.config.ts</span>
              </div>

              {codeLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.12, duration: 0.3 }}
                  className="text-xs font-mono leading-6 px-1"
                  style={{ color: line.color }}
                >
                  <span style={{ color: 'hsl(210,20%,35%)', marginRight: '12px', userSelect: 'none' }}>{i + 1}</span>
                  {line.content}
                </motion.div>
              ))}
            </motion.div>

            <Link to="/services">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-base font-bold group glossy-btn"
                style={{ background: 'linear-gradient(135deg, hsl(185,100%,48%), hsl(210,100%,55%))', boxShadow: '0 6px 25px rgba(6,182,212,0.40)', color: 'hsl(220,40%,5%)' }}
              >
                Explore Our Services <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Right - Tech grid */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-3 sm:grid-cols-4 gap-3"
          >
            {techs.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, type: "spring", stiffness: 130 }}
                whileHover={{ y: -8, scale: 1.10 }}
                whileTap={{ scale: 0.92, y: 0, transition: { duration: 0.1 } }}
                onHoverStart={() => setHoveredTech(tech.name)}
                onHoverEnd={() => setHoveredTech(null)}
                className="rounded-2xl p-4 flex flex-col items-center gap-3 cursor-pointer group transition-all duration-300 relative overflow-hidden"
                style={{
                  background: hoveredTech === tech.name
                    ? `linear-gradient(135deg, ${tech.color}20, ${tech.color}08)`
                    : `${tech.color}10`,
                  border: `1px solid ${hoveredTech === tech.name ? tech.color + '50' : tech.color + '25'}`,
                  boxShadow: hoveredTech === tech.name ? `0 0 20px ${tech.color}25` : 'none',
                }}
              >
                {/* Shimmer on hover */}
                <motion.div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${tech.color}15 0%, transparent 70%)` }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredTech === tech.name ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />

                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black relative z-10"
                  style={{
                    background: `${tech.color}18`,
                    color: tech.color,
                    boxShadow: `0 0 15px ${tech.color}20`,
                    filter: `drop-shadow(0 0 4px ${tech.color}40)`,
                    fontFamily: "'JetBrains Mono', monospace"
                  }}>
                  {tech.symbol}
                </div>
                <span className="text-xs font-semibold text-foreground/55 group-hover:text-foreground transition-colors text-center relative z-10 font-mono">
                  {tech.name}
                </span>

                {/* Active indicator */}
                {hoveredTech === tech.name && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-1 right-1"
                  >
                    <CheckCircle size={10} style={{ color: tech.color }} />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TechStack;
