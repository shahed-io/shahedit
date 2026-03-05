import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Code2, Globe, Smartphone, Play, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const stats = [
  { value: "150+", label: "Projects Completed" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "5+", label: "Years Experience" },
  { value: "24/7", label: "Support" },
];

const floatingIcons = [
  { icon: Code2, x: "10%", y: "20%", delay: 0, color: "hsl(258,90%,66%)" },
  { icon: Globe, x: "85%", y: "15%", delay: 0.5, color: "hsl(185,100%,48%)" },
  { icon: Smartphone, x: "90%", y: "70%", delay: 1, color: "hsl(315,80%,65%)" },
  { icon: Zap, x: "5%", y: "75%", delay: 1.5, color: "hsl(45,93%,58%)" },
];

// Typewriter hook
function useTypewriter(words: string[], speed = 80, pause = 1800) {
  const [displayed, setDisplayed] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx((c) => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx((c) => c - 1), speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setWordIdx((w) => (w + 1) % words.length);
    }
    setDisplayed(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return displayed;
}

// Terminal lines
const terminalLines = [
  { text: "$ npm run build", color: "hsl(185,100%,60%)", delay: 0.2 },
  { text: "> Building for production...", color: "hsl(210,30%,70%)", delay: 0.6 },
  { text: "✓ Compiled successfully!", color: "hsl(155,70%,55%)", delay: 1.1 },
  { text: "$ git push origin main", color: "hsl(185,100%,60%)", delay: 1.6 },
  { text: "> Deploying to production ✓", color: "hsl(155,70%,55%)", delay: 2.1 },
];

const HeroBanner = () => {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const typed = useTypewriter(["Digital Empire", "Modern Website", "Mobile App", "Brand Identity"], 70, 2000);

  useEffect(() => {
    const target = new Date();
    target.setDate(target.getDate() + 7);
    const interval = setInterval(() => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) return;
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / (1000 * 60)) % 60),
        secs: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="relative overflow-hidden min-h-[700px] flex items-center">
      {/* Scan line */}
      <div className="scan-line" />

      {/* Background layers */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, hsl(220,42%,5%) 0%, hsl(258,30%,8%) 50%, hsl(220,40%,5%) 100%)' }} />

      {/* Cross grid */}
      <div className="absolute inset-0 cross-grid opacity-60" />

      {/* Big glowing orbs */}
      <div className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full float-anim" style={{ background: 'radial-gradient(circle, hsl(258,90%,66%) 0%, transparent 65%)', filter: 'blur(100px)', opacity: 0.18, animationDuration: '8s' }} />
      <div className="absolute -top-20 right-[5%] w-[500px] h-[500px] rounded-full float-anim" style={{ background: 'radial-gradient(circle, hsl(185,100%,48%) 0%, transparent 65%)', filter: 'blur(90px)', opacity: 0.13, animationDelay: '3s', animationDuration: '10s' }} />
      <div className="absolute bottom-0 left-[35%] w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, hsl(315,80%,65%) 0%, transparent 65%)', filter: 'blur(80px)', opacity: 0.10 }} />

      {/* Floating tech icons */}
      {floatingIcons.map((item, i) => (
        <motion.div
          key={i}
          className="absolute hidden lg:flex items-center justify-center w-12 h-12 rounded-2xl"
          style={{ left: item.x, top: item.y, background: `${item.color}18`, border: `1px solid ${item.color}30` }}
          animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
        >
          <item.icon size={20} style={{ color: item.color }} />
        </motion.div>
      ))}

      {/* Scan line overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(139,92,246,0.012) 4px, rgba(139,92,246,0.012) 5px)' }} />

      <div className="container mx-auto px-4 relative z-10 py-20">
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-12 items-center">
          {/* LEFT */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-7 border text-sm font-medium"
              style={{ background: 'rgba(139,92,246,0.10)', borderColor: 'rgba(139,92,246,0.30)', color: 'hsl(258,90%,80%)' }}
            >
              <motion.span animate={{ rotate: [0, 20, -20, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }}>
                <Sparkles size={14} />
              </motion.span>
              Professional IT Agency — Bangladesh
            </motion.div>

            {/* Typewriter heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] mb-6"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Build Your
              <br />
              <span
                className="bg-clip-text text-transparent gradient-animate glitch-text"
                data-text={typed}
                style={{
                  backgroundImage: 'linear-gradient(90deg, hsl(258,90%,75%), hsl(185,100%,55%), hsl(315,80%,70%), hsl(258,90%,75%))',
                  backgroundSize: '300% 100%',
                }}
              >
                {typed}
              </span>
              <span className="cursor-blink" />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-foreground/55 text-lg mb-9 max-w-xl leading-relaxed"
            >
              Premium web development, graphic design &amp; digital marketing solutions for modern businesses — crafted to convert, impress &amp; grow.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-4 mb-10"
            >
              <Link to="/get-quote">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-base font-bold text-white glossy-btn"
                  style={{ background: 'linear-gradient(135deg, hsl(258,90%,66%), hsl(185,100%,45%))', boxShadow: '0 6px 30px rgba(139,92,246,0.45), 0 0 60px rgba(139,92,246,0.15)' }}
                >
                  <Zap size={18} fill="white" /> Start Your Project
                </motion.button>
              </Link>
              <Link to="/portfolio">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-base font-semibold"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'hsl(210,30%,90%)', backdropFilter: 'blur(12px)' }}
                >
                  <Play size={16} /> View Portfolio
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-6"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 + i * 0.1 }}
                  whileHover={{ y: -3, scale: 1.05 }}
                  className="flex flex-col"
                >
                  <span className="text-2xl font-black gradient-text flicker-in">{stat.value}</span>
                  <span className="text-xs text-foreground/40 font-medium">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — Terminal + Countdown + cards */}
          <div className="hidden lg:flex flex-col gap-5">
            {/* Terminal Card */}
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 100 }}
              className="terminal-box rounded-2xl p-5 overflow-hidden relative"
            >
              {/* Terminal header */}
              <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid rgba(139,92,246,0.15)' }}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <div className="flex items-center gap-1.5 ml-2">
                  <Terminal size={11} style={{ color: 'hsl(185,100%,55%)' }} />
                  <span className="text-xs font-mono" style={{ color: 'hsl(210,20%,50%)' }}>shahedit ~ deploy</span>
                </div>
              </div>

              {/* Terminal lines */}
              <div className="space-y-1.5 font-mono text-xs">
                {terminalLines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: line.delay, duration: 0.3 }}
                    className={i === 2 || i === 4 ? "code-highlight-line rounded px-1" : "px-1"}
                    style={{ color: line.color }}
                  >
                    {line.text}
                  </motion.div>
                ))}
                <motion.div
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="flex items-center gap-1 px-1 mt-2"
                  style={{ color: 'hsl(185,100%,60%)' }}
                >
                  <span>$</span>
                  <span className="cursor-blink" style={{ height: '0.75em', marginLeft: '2px' }} />
                </motion.div>
              </div>
            </motion.div>

            {/* Countdown card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="rounded-2xl p-6"
              style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.22)', backdropFilter: 'blur(16px)' }}
            >
              <p className="text-xs text-foreground/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Special Offer Ends In
              </p>
              <div className="flex gap-3">
                {[
                  { val: countdown.days, label: "Days" },
                  { val: countdown.hours, label: "Hours" },
                  { val: countdown.mins, label: "Mins" },
                  { val: countdown.secs, label: "Secs" },
                ].map((item, i) => (
                  <div key={item.label} className="flex-1 rounded-xl p-3 text-center"
                    style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.20)' }}>
                    <AnimatePresence mode="popLayout">
                      <motion.div
                        key={item.val}
                        initial={{ y: -8, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 8, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-2xl font-black gradient-text font-mono"
                      >
                        {pad(item.val)}
                      </motion.div>
                    </AnimatePresence>
                    <div className="text-[10px] text-foreground/35 uppercase tracking-wider mt-0.5">{item.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Two info cards */}
            {[
              { tag: "🚀 Featured", title: "Web Development", desc: "Custom websites that convert visitors into customers", color: "hsl(258,90%,66%)" },
              { tag: "⚡ Popular", title: "Graphics Design", desc: "Creative logos, branding & visuals that make you stand out", color: "hsl(315,80%,65%)" },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.15, type: "spring" }}
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
                className="rounded-2xl p-5 cursor-pointer group relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${card.color}10, ${card.color}04)`, border: `1px solid ${card.color}20`, backdropFilter: 'blur(12px)' }}
              >
                {/* Shimmer on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer pointer-events-none rounded-2xl" />
                <span className="text-xs font-bold mb-2 block" style={{ color: card.color }}>{card.tag}</span>
                <h3 className="text-base font-bold text-foreground mb-1">{card.title}</h3>
                <p className="text-sm text-foreground/45">{card.desc}</p>
                <ArrowRight size={14} className="mt-3 group-hover:translate-x-2 transition-transform duration-300" style={{ color: card.color }} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
