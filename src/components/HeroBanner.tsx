import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Code2, Globe, Smartphone, Play } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const stats = [
  { value: "150+", label: "Projects Completed" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "5+", label: "Years Experience" },
  { value: "24/7", label: "Support" },
];

const floatingIcons = [
  { icon: Code2, x: "10%", y: "20%", delay: 0, color: "hsl(270,92%,65%)" },
  { icon: Globe, x: "85%", y: "15%", delay: 0.5, color: "hsl(320,90%,48%)" },
  { icon: Smartphone, x: "90%", y: "70%", delay: 1, color: "hsl(315,80%,65%)" },
  { icon: Zap, x: "5%", y: "75%", delay: 1.5, color: "hsl(45,93%,58%)" },
];

const HeroBanner = () => {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

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
      {/* Background layers */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, hsl(220,42%,5%) 0%, hsl(258,30%,8%) 50%, hsl(265,45%,4%) 100%)' }} />

      {/* Cross grid */}
      <div className="absolute inset-0 cross-grid opacity-60" />

      {/* Big glowing orbs */}
      <div className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full float-anim" style={{ background: 'radial-gradient(circle, hsl(270,92%,65%) 0%, transparent 65%)', filter: 'blur(100px)', opacity: 0.18, animationDuration: '8s' }} />
      <div className="absolute -top-20 right-[5%] w-[500px] h-[500px] rounded-full float-anim" style={{ background: 'radial-gradient(circle, hsl(320,90%,48%) 0%, transparent 65%)', filter: 'blur(90px)', opacity: 0.13, animationDelay: '3s', animationDuration: '10s' }} />
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

      {/* Scan line */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(168,85,247,0.012) 4px, rgba(168,85,247,0.012) 5px)' }} />

      <div className="container mx-auto px-4 relative z-10 py-20">
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-12 items-center">
          {/* LEFT */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-7 border text-sm font-medium"
              style={{ background: 'rgba(168,85,247,0.10)', borderColor: 'rgba(168,85,247,0.30)', color: 'hsl(270,92%,80%)' }}
            >
              <motion.span animate={{ rotate: [0, 20, -20, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }}>
                <Sparkles size={14} />
              </motion.span>
              Professional IT Agency — Bangladesh
            </motion.div>

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
                className="bg-clip-text text-transparent gradient-animate"
                style={{ backgroundImage: 'linear-gradient(90deg, hsl(270,92%,75%), hsl(320,90%,55%), hsl(315,80%,70%), hsl(270,92%,75%))', backgroundSize: '300% 100%' }}
              >
                Digital Empire
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-foreground/55 text-lg mb-9 max-w-xl leading-relaxed"
            >
              Premium web development, graphic design & digital marketing solutions for modern businesses — crafted to convert, impress & grow.
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
                  style={{ background: 'linear-gradient(135deg, hsl(270,92%,65%), hsl(320,90%,45%))', boxShadow: '0 6px 30px rgba(168,85,247,0.45), 0 0 60px rgba(168,85,247,0.15)' }}
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
                  className="flex flex-col"
                >
                  <span className="text-2xl font-black gradient-text">{stat.value}</span>
                  <span className="text-xs text-foreground/40 font-medium">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — Countdown + cards */}
          <div className="hidden lg:flex flex-col gap-5">
            {/* Countdown card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="rounded-2xl p-6"
              style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.22)', backdropFilter: 'blur(16px)' }}
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
                    style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.20)' }}>
                    <div className="text-2xl font-black gradient-text">{pad(item.val)}</div>
                    <div className="text-[10px] text-foreground/35 uppercase tracking-wider mt-0.5">{item.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Two info cards */}
            {[
              { tag: "🚀 Featured", title: "Web Development", desc: "Custom websites that convert visitors into customers", color: "hsl(270,92%,65%)" },
              { tag: "⚡ Popular", title: "Graphics Design", desc: "Creative logos, branding & visuals that make you stand out", color: "hsl(315,80%,65%)" },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.15, type: "spring" }}
                whileHover={{ scale: 1.02, y: -3 }}
                className="rounded-2xl p-5 cursor-pointer group"
                style={{ background: `linear-gradient(135deg, ${card.color}10, ${card.color}04)`, border: `1px solid ${card.color}20`, backdropFilter: 'blur(12px)' }}
              >
                <span className="text-xs font-bold mb-2 block" style={{ color: card.color }}>{card.tag}</span>
                <h3 className="text-base font-bold text-foreground mb-1">{card.title}</h3>
                <p className="text-sm text-foreground/45">{card.desc}</p>
                <ArrowRight size={14} className="mt-3 group-hover:translate-x-1 transition-transform" style={{ color: card.color }} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
