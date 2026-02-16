import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
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
    <section className="relative overflow-hidden">
      {/* Background */}
      <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/90 via-foreground/70 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center min-h-[520px] py-16">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 mb-6">
              <Sparkles size={14} className="text-accent" />
              <span className="text-xs font-medium text-primary-foreground/90">Professional Web Development</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-4">
              Build Your
              <br />
              <span className="bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--primary))] bg-clip-text text-transparent">
                Digital Presence
              </span>
            </h1>

            <p className="text-primary-foreground/70 text-lg mb-8 max-w-lg">
              Professional web development & graphic design services for modern businesses and growing brands.
            </p>

            {/* Countdown */}
            <div className="flex gap-3 mb-8">
              {[
                { val: countdown.days, label: "Days" },
                { val: countdown.hours, label: "Hours" },
                { val: countdown.mins, label: "Min" },
                { val: countdown.secs, label: "Sec" },
              ].map((item) => (
                <div key={item.label} className="glass-card rounded-xl px-4 py-3 text-center min-w-[65px]">
                  <div className="text-xl font-bold text-primary-foreground">{pad(item.val)}</div>
                  <div className="text-[10px] text-primary-foreground/50 uppercase tracking-wider">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 shadow-lg shadow-primary/30">
                Buy Now <ArrowRight size={16} className="ml-1" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                View Details
              </Button>
            </div>
          </motion.div>

          {/* Right side cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:grid grid-rows-2 gap-4"
          >
            <div className="glass-card rounded-2xl p-6 flex flex-col justify-center hover:border-primary/40 transition-colors">
              <p className="text-accent text-sm font-semibold mb-1">Shop Now</p>
              <p className="font-bold text-primary-foreground text-lg">Latest Services</p>
              <p className="text-primary-foreground/50 text-sm mt-1">Explore our newest offerings</p>
              <Button variant="outline" size="sm" className="mt-4 w-fit rounded-full border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                View Details
              </Button>
            </div>
            <div className="glass-card rounded-2xl p-6 flex flex-col justify-center hover:border-accent/40 transition-colors">
              <p className="text-accent text-sm font-semibold mb-1">Pre-Order</p>
              <p className="font-bold text-primary-foreground text-lg">Upcoming Projects</p>
              <p className="text-primary-foreground/50 text-sm mt-1">Reserve your spot early</p>
              <Button variant="outline" size="sm" className="mt-4 w-fit rounded-full border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                View Details
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
