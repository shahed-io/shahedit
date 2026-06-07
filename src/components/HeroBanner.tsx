import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight, Sparkles, Zap, Code2, Globe, Smartphone, Play,
  ChevronLeft, ChevronRight, Star, Crown, Rocket, Palette,
  Megaphone, Cloud, Shield, Briefcase, Heart,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Icon registry — admin picks by name string
const ICONS: Record<string, any> = {
  Code2, Globe, Smartphone, Zap, Sparkles, Star, Crown, Rocket,
  Palette, Megaphone, Cloud, Shield, Briefcase, Heart, Play,
};

type SlideCard = {
  title: string;
  subtitle?: string;
  badge_text?: string;
  badge_color?: string; // tailwind color name e.g. "blue", "amber", "purple"
  price?: string;
  original_price?: string;
  link?: string;
  accent?: string; // hsl(...)
  icon?: string;
};

type SlideStat = { value: string; label: string };

type HeroSlide = {
  id: string;
  badge_text: string | null;
  headline: string;
  highlight: string | null;
  description: string | null;
  primary_cta_label: string | null;
  primary_cta_link: string | null;
  secondary_cta_label: string | null;
  secondary_cta_link: string | null;
  show_countdown: boolean;
  countdown_label: string | null;
  countdown_end_at: string | null;
  stats: SlideStat[];
  cards: SlideCard[];
  background_image_url: string | null;
  autoplay_seconds: number;
};

const FALLBACK: HeroSlide = {
  id: "fallback",
  badge_text: "Professional IT Agency — Bangladesh",
  headline: "Build Your",
  highlight: "Digital Empire",
  description:
    "Premium web development, graphic design & digital marketing solutions for modern businesses — crafted to convert, impress & grow.",
  primary_cta_label: "Start Your Project",
  primary_cta_link: "/get-quote",
  secondary_cta_label: "View Portfolio",
  secondary_cta_link: "/portfolio",
  show_countdown: true,
  countdown_label: "Special Offer Ends In",
  countdown_end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  stats: [
    { value: "150+", label: "Projects" },
    { value: "98%", label: "Satisfaction" },
    { value: "5+", label: "Years" },
    { value: "24/7", label: "Support" },
  ],
  cards: [
    { title: "Web Development", subtitle: "92% Booked this month", badge_text: "#1 Best Seller", badge_color: "blue", price: "৳৫,০০০", original_price: "৳১০,০০০", link: "/services/web-development", accent: "hsl(270,92%,65%)", icon: "Code2" },
    { title: "Graphics Design", subtitle: "87% Booked this month", badge_text: "Trending", badge_color: "amber", price: "৳১,৫০০", original_price: "৳৩,৫০০", link: "/services/graphics-design", accent: "hsl(320,90%,55%)", icon: "Sparkles" },
  ],
  background_image_url: null,
  autoplay_seconds: 7,
};

const pad = (n: number) => String(n).padStart(2, "0");

// Generate a random countdown target between 1–7 days from now
const randomFutureTime = () => {
  const days = Math.floor(Math.random() * 7) + 1;
  const hours = Math.floor(Math.random() * 24);
  const mins = Math.floor(Math.random() * 60);
  const secs = Math.floor(Math.random() * 60);
  return Date.now() + days * 86400000 + hours * 3600000 + mins * 60000 + secs * 1000;
};

const useCountdown = (endsAt: string | null | undefined) => {
  const [target, setTarget] = useState<number>(() => {
    if (endsAt) {
      const t = new Date(endsAt).getTime();
      if (t > Date.now()) return t;
    }
    return randomFutureTime();
  });
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (endsAt) {
      const t = new Date(endsAt).getTime();
      if (t > Date.now()) {
        setTarget(t);
        return;
      }
    }
    setTarget(randomFutureTime());
  }, [endsAt]);

  useEffect(() => {
    const i = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= target) {
        // Auto-reset to a new random countdown when it expires
        setTarget(randomFutureTime());
      }
    }, 1000);
    return () => clearInterval(i);
  }, [target]);

  const diff = Math.max(0, target - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    mins: Math.floor((diff / 60000) % 60),
    secs: Math.floor((diff / 1000) % 60),
  };
};

const badgeColorMap: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  purple: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  pink: "bg-pink-500/10 text-pink-300 border-pink-500/20",
  emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  rose: "bg-rose-500/10 text-rose-300 border-rose-500/20",
};

const SlideContent = ({ slide }: { slide: HeroSlide }) => {
  const cd = useCountdown(slide.countdown_end_at);
  return (
    <div className="container mx-auto px-4 sm:px-5 md:px-6 relative z-10 grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center py-10 sm:py-14 lg:py-20">
      {/* LEFT */}
      <div className="space-y-6 sm:space-y-8 lg:space-y-10 min-w-0">
        {slide.badge_text && (
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[hsl(270,92%,65%)] opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(320,90%,55%)]" />
            </span>
            <span className="text-[11px] md:text-xs font-semibold tracking-[0.18em] uppercase text-white/80">
              {slide.badge_text}
            </span>
          </motion.div>
        )}

        <div className="space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[2.25rem] xs:text-5xl sm:text-6xl lg:text-7xl xl:text-[88px] font-extrabold leading-[1.02] sm:leading-[0.95] tracking-tight text-white break-words"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {slide.headline}
            {slide.highlight && (
              <>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[hsl(270,92%,65%)] via-[hsl(320,90%,55%)] to-[hsl(315,80%,65%)]">
                  {slide.highlight}
                </span>
              </>
            )}
          </motion.h1>
          {slide.description && (
            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
              className="text-sm sm:text-base md:text-lg text-white/60 max-w-xl leading-relaxed"
            >
              {slide.description}
            </motion.p>
          )}
        </div>

        {(slide.primary_cta_label || slide.secondary_cta_label) && (
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-wrap gap-3 sm:gap-4"
          >
            {slide.primary_cta_label && (
              <Link to={slide.primary_cta_link || "/"} className="flex-1 sm:flex-none min-w-[160px]">
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}
                  className="group relative w-full sm:w-auto px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl font-bold text-white shadow-[0_10px_40px_-8px_rgba(217,70,239,0.45)] overflow-hidden"
                  style={{ background: "linear-gradient(135deg, hsl(270,92%,65%), hsl(320,90%,55%))" }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 text-sm sm:text-base">
                    <Zap size={18} fill="white" /> {slide.primary_cta_label}
                  </span>
                  <span className="absolute inset-0 bg-white/0 group-hover:bg-white/15 transition-colors" />
                </motion.button>
              </Link>
            )}
            {slide.secondary_cta_label && (
              <Link to={slide.secondary_cta_link || "/"} className="flex-1 sm:flex-none min-w-[140px]">
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}
                  className="w-full sm:w-auto px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl font-semibold border border-white/15 bg-white/[0.04] backdrop-blur-md text-white/90 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Play size={16} /> {slide.secondary_cta_label}
                </motion.button>
              </Link>
            )}
          </motion.div>
        )}

        {slide.stats && slide.stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-5 sm:pt-6 border-t border-white/10"
          >
            {slide.stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 + i * 0.06 }}
                className="space-y-1 min-w-0"
              >
                <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white truncate" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {s.value}
                </div>
                <div className="text-[10px] md:text-xs uppercase tracking-wider text-white/40 font-medium truncate">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* RIGHT */}
      <div className="relative flex flex-col gap-4 sm:gap-5 min-w-0">
        {slide.show_countdown && (
          <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
            className="bg-white/[0.04] border border-white/10 backdrop-blur-2xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-[hsl(270,92%,65%)]/15 blur-3xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-4 sm:mb-5 relative">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
              <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-white/60 truncate">
                {slide.countdown_label || "Offer Ends In"}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 md:gap-3 relative">
              {[
                { v: cd.days, l: "Days" }, { v: cd.hours, l: "Hours" },
                { v: cd.mins, l: "Mins" }, { v: cd.secs, l: "Secs" },
              ].map((u) => (
                <div key={u.l} className="text-center py-2.5 sm:py-3.5 bg-white/5 rounded-xl sm:rounded-2xl border border-white/5">
                  <div className="text-lg sm:text-2xl md:text-3xl font-black text-white leading-none">{pad(u.v)}</div>
                  <div className="text-[8px] sm:text-[9px] uppercase tracking-widest text-white/40 mt-1">{u.l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {slide.cards?.map((card, i) => {
          const Icon = ICONS[card.icon || "Sparkles"] || Sparkles;
          const accent = card.accent || "hsl(270,92%,65%)";
          const badgeCls = badgeColorMap[card.badge_color || "purple"] || badgeColorMap.purple;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.12, type: "spring", stiffness: 80 }}
              whileHover={{ y: -6 }}
              className="group bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 backdrop-blur-2xl p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl transition-all duration-500"
              style={{ borderColor: undefined }}
            >
              <Link to={card.link || "/"} className="block">
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
                      style={{ background: `linear-gradient(135deg, ${accent}, hsl(265,50%,15%))`, boxShadow: `0 10px 24px -8px ${accent}` }}
                    >
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm sm:text-base md:text-lg text-white leading-tight truncate" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {card.title}
                      </h3>
                      {card.subtitle && <p className="text-[11px] text-white/40 mt-0.5">{card.subtitle}</p>}
                    </div>
                  </div>
                  {card.badge_text && (
                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeCls}`}>
                      {card.badge_text}
                    </span>
                  )}
                </div>
                {(card.price || card.original_price) && (
                  <div className="flex items-end justify-between border-t border-white/5 pt-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-white/40 block">Starting from</span>
                      <div className="flex items-center gap-2 font-bold mt-1">
                        {card.price && <span className="text-xl md:text-2xl" style={{ color: accent }}>{card.price}</span>}
                        {card.original_price && <span className="text-sm line-through text-white/30">{card.original_price}</span>}
                      </div>
                    </div>
                    <motion.span whileHover={{ x: 3 }} className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest" style={{ color: accent }}>
                      Order Now <ArrowRight size={14} />
                    </motion.span>
                  </div>
                )}
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const HeroBanner = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([FALLBACK]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase
      .from("hero_slides")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (!mounted) return;
        if (data && data.length > 0) {
          setSlides(
            data.map((r: any) => ({
              ...r,
              stats: Array.isArray(r.stats) ? r.stats : [],
              cards: Array.isArray(r.cards) ? r.cards : [],
            })) as HeroSlide[]
          );
        }
      });
    return () => { mounted = false; };
  }, []);

  const current = slides[index] || FALLBACK;
  const autoplayMs = Math.max(3, current.autoplay_seconds || 7) * 1000;

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % slides.length), autoplayMs);
    return () => clearTimeout(t);
  }, [index, paused, slides.length, autoplayMs]);

  const bgStyle = useMemo(
    () => current.background_image_url
      ? { backgroundImage: `linear-gradient(rgba(10,5,20,0.78), rgba(10,5,20,0.92)), url(${current.background_image_url})`, backgroundSize: "cover", backgroundPosition: "center" }
      : undefined,
    [current.background_image_url]
  );

  return (
    <section
      className="relative overflow-hidden min-h-[760px] lg:min-h-[820px] flex items-center bg-[#0a0514]"
      style={bgStyle}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Animated mesh background */}
      <div className="absolute inset-0 opacity-50 pointer-events-none">
        <motion.div
          className="absolute -top-[15%] -left-[10%] w-[55%] h-[60%] rounded-full bg-[hsl(270,92%,65%)] blur-[140px]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.45, 0.7, 0.45] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-[15%] -right-[10%] w-[55%] h-[60%] rounded-full bg-[hsl(320,90%,55%)] blur-[140px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.06) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          <SlideContent slide={current} />
        </motion.div>
      </AnimatePresence>

      {/* Slider controls */}
      {slides.length > 1 && (
        <>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
            <button
              onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-gradient-to-r from-[hsl(270,92%,65%)] to-[hsl(320,90%,55%)]" : "w-1.5 bg-white/20 hover:bg-white/40"}`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => setIndex((i) => (i + 1) % slides.length)}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default HeroBanner;
