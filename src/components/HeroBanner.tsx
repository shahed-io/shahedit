import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";

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
    <section className="relative overflow-hidden min-h-[560px]">
      {/* Background */}
      <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover scale-105" />
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/95 via-foreground/80 to-[hsl(var(--primary)/0.3)]" />

      {/* Floating orbs */}
      <div className="absolute top-20 right-[20%] w-64 h-64 bg-primary/20 rounded-full blur-[100px] float-anim" />
      <div className="absolute bottom-10 left-[10%] w-48 h-48 bg-accent/20 rounded-full blur-[80px] float-anim" style={{ animationDelay: "2s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center min-h-[520px] py-16">
          {/* Left content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-6 shimmer"
            >
              <Sparkles size={14} className="text-accent" />
              <span className="text-xs font-medium text-primary-foreground/90">Professional Web Development</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-5"
            >
              Build Your
              <br />
              <span className="bg-gradient-to-r from-[hsl(var(--accent))] via-[hsl(var(--primary))] to-[hsl(var(--accent))] bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient-shift_4s_ease_infinite]">
                Digital Presence
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-primary-foreground/60 text-lg mb-8 max-w-lg"
            >
              Professional web development & graphic design services for modern businesses and growing brands.
            </motion.p>

            {/* Countdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65 }}
              className="flex gap-3 mb-8"
            >
              {[
                { val: countdown.days, label: "Days" },
                { val: countdown.hours, label: "Hours" },
                { val: countdown.mins, label: "Min" },
                { val: countdown.secs, label: "Sec" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7 + i * 0.1, type: "spring" }}
                  className="glass-card rounded-xl px-4 py-3 text-center min-w-[68px] glow-pulse"
                  style={{ animationDelay: `${i * 0.5}s` }}
                >
                  <div className="text-xl font-bold text-primary-foreground">{pad(item.val)}</div>
                  <div className="text-[10px] text-primary-foreground/40 uppercase tracking-wider">{item.label}</div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="flex gap-3"
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 rounded-full px-8 shadow-lg shadow-primary/30 glossy-btn group"
              >
                <Zap size={16} className="mr-1.5 group-hover:animate-bounce" /> Buy Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 backdrop-blur-sm"
              >
                View Details <ArrowRight size={16} className="ml-1.5" />
              </Button>
            </motion.div>
          </div>

          {/* Right side cards */}
          <div className="hidden lg:grid grid-rows-2 gap-4">
            {[
              { tag: "Shop Now", title: "Latest Services", desc: "Explore our newest offerings", delay: 0.4 },
              { tag: "Pre-Order", title: "Upcoming Projects", desc: "Reserve your spot early", delay: 0.6 },
            ].map((card) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: card.delay }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="glass-card rounded-2xl p-7 flex flex-col justify-center cursor-pointer group shimmer"
              >
                <p className="text-accent text-sm font-semibold mb-1 group-hover:translate-x-1 transition-transform duration-300">{card.tag}</p>
                <p className="font-bold text-primary-foreground text-lg">{card.title}</p>
                <p className="text-primary-foreground/40 text-sm mt-1">{card.desc}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-fit rounded-full border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 group-hover:border-accent/40 transition-all duration-300"
                >
                  View Details <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }
      `}</style>
    </section>
  );
};

export default HeroBanner;
