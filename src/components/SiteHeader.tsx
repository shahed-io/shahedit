import { useState, useRef, useEffect } from "react";
import {
  Phone, Mail, Menu, X, ChevronRight, ChevronDown,
  Globe, Wrench, Palette, Facebook, TrendingUp, Building2,
  LogIn, Sparkles, Waves, Gem,
} from "lucide-react";
import logoImg from "@/assets/logo-glossy.png";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

import catWebDev from "@/assets/cat-web-dev.jpg";
import catMaintenance from "@/assets/cat-maintenance.jpg";
import catGraphics from "@/assets/cat-graphics.jpg";
import catFacebook from "@/assets/cat-facebook.jpg";
import catDigitalMarketing from "@/assets/cat-digital-marketing.jpg";
import catBusiness from "@/assets/cat-business.jpg";

const serviceCategories = [
  { label: "Web Development", href: "/services#web-development", icon: Globe, img: catWebDev, accent: "270 92% 65%" },
  { label: "Website Maintenance", href: "/services#maintenance", icon: Wrench, img: catMaintenance, accent: "210 90% 65%" },
  { label: "Graphics Design", href: "/services#graphics", icon: Palette, img: catGraphics, accent: "320 90% 65%" },
  { label: "Facebook Services", href: "/services#facebook", icon: Facebook, img: catFacebook, accent: "220 95% 65%" },
  { label: "Digital Marketing", href: "/services#digital-marketing", icon: TrendingUp, img: catDigitalMarketing, accent: "150 80% 55%" },
  { label: "Business Solutions", href: "/services#business", icon: Building2, img: catBusiness, accent: "42 95% 60%" },
];

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services", hasDropdown: true },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Blog", href: "/blog" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const SiteHeader = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const servicesTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => location.pathname === href;

  const themeLabel =
    theme === "royal" ? "Royal Purple" : theme === "ocean" ? "Deep Ocean" : "Glass Premium";
  const ThemeIcon = theme === "royal" ? Sparkles : theme === "ocean" ? Waves : Gem;

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 80, damping: 20 }}
      className="sticky top-0 z-50"
    >
      {/* ───── Top Glass Bar ───── */}
      <div
        className="relative overflow-hidden border-b"
        style={{
          background: "linear-gradient(90deg, rgba(168,85,247,0.10), rgba(56,189,248,0.08) 50%, rgba(236,72,153,0.10))",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="container mx-auto px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <a href="tel:+8801820060046" className="flex items-center gap-1.5 text-foreground/75 hover:text-foreground transition-all group">
              <span
                className="w-6 h-6 rounded-md flex items-center justify-center transition-all"
                style={{
                  background: "linear-gradient(135deg, rgba(168,85,247,0.25), rgba(168,85,247,0.10))",
                  border: "1px solid rgba(168,85,247,0.35)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                <Phone size={11} className="text-primary" />
              </span>
              <span className="font-medium tracking-wide">01820-060046</span>
            </a>
            <a href="mailto:info@shahedit.com" className="hidden sm:flex items-center gap-1.5 text-foreground/75 hover:text-foreground transition-all group">
              <span
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(56,189,248,0.25), rgba(56,189,248,0.10))",
                  border: "1px solid rgba(56,189,248,0.35)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                <Mail size={11} className="text-accent" />
              </span>
              <span className="font-medium">info@shahedit.com</span>
            </a>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-foreground/60 text-[11px]">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
                <span className="relative rounded-full bg-emerald-400 w-1.5 h-1.5" />
              </span>
              Online · 24/7 Support
            </span>
            <span
              className="text-[11px] px-2.5 py-0.5 rounded-full font-bold tracking-wide"
              style={{
                background: "linear-gradient(135deg, rgba(168,85,247,0.95), rgba(236,72,153,0.95))",
                color: "white",
                boxShadow: "0 4px 14px rgba(168,85,247,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
              }}
            >
              ✦ Free Consultation
            </span>
          </div>
        </div>
      </div>

      {/* ───── Main Navbar — Glassmorphism Premium ───── */}
      <div
        className="relative transition-all duration-500"
        style={{
          background: scrolled
            ? "linear-gradient(180deg, rgba(20,16,40,0.72), rgba(20,16,40,0.55))"
            : "linear-gradient(180deg, rgba(20,16,40,0.55), rgba(20,16,40,0.35))",
          backdropFilter: "blur(32px) saturate(200%)",
          WebkitBackdropFilter: "blur(32px) saturate(200%)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          boxShadow: scrolled
            ? "0 12px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)"
            : "0 4px 24px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Aurora top edge gradient */}
        <div
          className="absolute top-0 left-0 right-0 h-px opacity-70 pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.6), rgba(56,189,248,0.6), rgba(236,72,153,0.6), transparent)" }}
        />
        {/* Floating aurora blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-8 left-1/4 w-48 h-16 rounded-full opacity-40 blur-3xl" style={{ background: "hsl(270,92%,65%)" }} />
          <div className="absolute -top-8 right-1/4 w-48 h-16 rounded-full opacity-40 blur-3xl" style={{ background: "hsl(195,100%,60%)" }} />
        </div>

        <div className="container mx-auto px-4 py-3.5 flex items-center justify-between gap-6 relative">
          {/* ── Logo ── */}
          <Link to="/" className="shrink-0">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center gap-3">
              <div
                className="relative w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  boxShadow: "0 6px 22px rgba(168,85,247,0.35), inset 0 1px 0 rgba(255,255,255,0.25)",
                }}
              >
                <img src={logoImg} alt="Shahed IT" className="w-9 h-9 object-contain" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xl font-extrabold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                  <span style={{ background: "linear-gradient(135deg, hsl(270,92%,72%), hsl(320,90%,70%) 50%, hsl(195,100%,65%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Shahed
                  </span>
                  <span className="text-foreground"> IT</span>
                </span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-foreground/45 font-semibold">
                  Premium Studio
                </span>
              </div>
            </motion.div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            {navLinks.map((link, i) =>
              link.hasDropdown ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => {
                    if (servicesTimeout.current) clearTimeout(servicesTimeout.current);
                    setServicesOpen(true);
                  }}
                  onMouseLeave={() => {
                    servicesTimeout.current = setTimeout(() => setServicesOpen(false), 160);
                  }}
                >
                  <Link to={link.href}>
                    <motion.span
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 + i * 0.05 }}
                      className={`relative px-4 py-2 text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 rounded-xl cursor-pointer ${
                        isActive(link.href) || servicesOpen ? "text-foreground" : "text-foreground/70 hover:text-foreground"
                      }`}
                      style={
                        isActive(link.href) || servicesOpen
                          ? {
                              background: "linear-gradient(135deg, rgba(168,85,247,0.20), rgba(56,189,248,0.15))",
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10), 0 2px 12px rgba(168,85,247,0.20)",
                            }
                          : undefined
                      }
                    >
                      {link.label}
                      <ChevronDown size={13} className={`transition-transform duration-300 ${servicesOpen ? "rotate-180" : ""}`} />
                    </motion.span>
                  </Link>

                  {/* Services Mega Dropdown */}
                  <AnimatePresence>
                    {servicesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[420px] rounded-2xl overflow-hidden z-50"
                        style={{
                          background: "linear-gradient(180deg, rgba(24,18,48,0.92), rgba(20,15,40,0.92))",
                          backdropFilter: "blur(40px) saturate(200%)",
                          WebkitBackdropFilter: "blur(40px) saturate(200%)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          boxShadow: "0 24px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(168,85,247,0.10), inset 0 1px 0 rgba(255,255,255,0.10)",
                        }}
                      >
                        {/* gradient header strip */}
                        <div className="h-px w-full opacity-80" style={{ background: "linear-gradient(90deg, transparent, hsl(270,92%,65%), hsl(320,90%,65%), hsl(195,100%,60%), transparent)" }} />
                        <div className="p-2.5 grid grid-cols-2 gap-1.5">
                          {serviceCategories.map((cat, idx) => (
                            <motion.div
                              key={cat.label}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.04 }}
                            >
                              <Link
                                to={cat.href}
                                onClick={() => setServicesOpen(false)}
                                className="group relative flex items-center gap-3 p-2.5 rounded-xl overflow-hidden transition-all duration-300"
                                style={{
                                  background: "rgba(255,255,255,0.03)",
                                  border: "1px solid rgba(255,255,255,0.05)",
                                }}
                              >
                                {/* hover glow */}
                                <span
                                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                  style={{ background: `radial-gradient(circle at 30% 50%, hsl(${cat.accent} / 0.20), transparent 70%)` }}
                                />
                                <div
                                  className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0"
                                  style={{
                                    boxShadow: `inset 0 0 0 1px hsl(${cat.accent} / 0.35), 0 4px 12px hsl(${cat.accent} / 0.25)`,
                                  }}
                                >
                                  <img src={cat.img} alt={cat.label} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, transparent, hsl(${cat.accent} / 0.25))` }} />
                                </div>
                                <div className="relative flex-1 min-w-0">
                                  <div className="text-sm font-semibold text-foreground/85 group-hover:text-foreground transition-colors truncate">
                                    {cat.label}
                                  </div>
                                  <div className="text-[10px] uppercase tracking-wider text-foreground/40 font-medium">
                                    Premium service
                                  </div>
                                </div>
                                <ChevronRight size={13} className="relative opacity-0 -translate-x-1 group-hover:opacity-70 group-hover:translate-x-0 transition-all" style={{ color: `hsl(${cat.accent})` }} />
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                        <div className="p-2.5 pt-1">
                          <Link to="/services" onClick={() => setServicesOpen(false)}>
                            <div
                              className="text-center py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                              style={{
                                background: "linear-gradient(135deg, hsl(270,92%,55%), hsl(320,90%,55%))",
                                color: "white",
                                boxShadow: "0 6px 18px hsl(270,92%,50%,0.40), inset 0 1px 0 rgba(255,255,255,0.25)",
                              }}
                            >
                              সকল সার্ভিস দেখুন <ChevronRight size={13} />
                            </div>
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link key={link.label} to={link.href}>
                  <motion.span
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + i * 0.05 }}
                    className={`relative px-4 py-2 text-sm font-semibold transition-all duration-300 flex items-center rounded-xl ${
                      isActive(link.href) ? "text-foreground" : "text-foreground/70 hover:text-foreground"
                    }`}
                    style={
                      isActive(link.href)
                        ? {
                            background: "linear-gradient(135deg, rgba(168,85,247,0.20), rgba(56,189,248,0.15))",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10), 0 2px 12px rgba(168,85,247,0.20)",
                          }
                        : undefined
                    }
                  >
                    {link.label}
                  </motion.span>
                </Link>
              )
            )}
          </nav>

          {/* ── CTA Cluster ── */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Theme toggle */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              title={`Theme: ${themeLabel} (click to switch)`}
              className="relative w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
              style={{
                background:
                  theme === "royal" ? "linear-gradient(135deg, hsl(270,92%,55%), hsl(320,90%,55%))"
                  : theme === "ocean" ? "linear-gradient(135deg, hsl(205,95%,55%), hsl(175,85%,45%))"
                  : "linear-gradient(135deg, hsl(280,95%,65%), hsl(195,100%,60%))",
                boxShadow: "0 4px 18px rgba(168,85,247,0.45), inset 0 1px 0 rgba(255,255,255,0.30)",
                border: "1px solid rgba(255,255,255,0.20)",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={theme}
                  initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <ThemeIcon size={16} className="text-white drop-shadow" />
                </motion.span>
              </AnimatePresence>
            </motion.button>

            {/* Login / Dashboard */}
            {user ? (
              <Link to="/dashboard">
                <motion.div
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: "linear-gradient(135deg, rgba(168,85,247,0.18), rgba(56,189,248,0.12))",
                    border: "1px solid rgba(168,85,247,0.30)",
                    color: "hsl(270,92%,82%)",
                    backdropFilter: "blur(14px)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)",
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white"
                    style={{
                      background: "linear-gradient(135deg, hsl(270,92%,60%), hsl(320,90%,55%))",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.30), 0 2px 8px rgba(168,85,247,0.40)",
                    }}
                  >
                    {user.email?.[0].toUpperCase()}
                  </div>
                  ড্যাশবোর্ড
                </motion.div>
              </Link>
            ) : (
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    color: "hsl(0,0%,95%)",
                    backdropFilter: "blur(14px)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)",
                  }}
                >
                  <LogIn size={14} /> লগইন
                </motion.button>
              </Link>
            )}

            {/* Get a Quote — premium glossy */}
            <Link to="/get-quote">
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white overflow-hidden group"
                style={{
                  background: "linear-gradient(135deg, hsl(270,92%,60%), hsl(320,90%,55%) 55%, hsl(195,100%,55%))",
                  boxShadow: "0 8px 28px hsl(270,92%,50%,0.45), 0 0 0 1px rgba(255,255,255,0.10), inset 0 1px 0 rgba(255,255,255,0.30)",
                }}
              >
                {/* Glossy sheen */}
                <span
                  className="absolute inset-0 opacity-60 pointer-events-none"
                  style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.22), transparent 50%)" }}
                />
                {/* Shimmer */}
                <span
                  className="absolute -inset-x-12 -top-1 h-full w-12 -skew-x-12 opacity-0 group-hover:opacity-60 transition-opacity"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                    animation: "shimmer 1.5s ease-in-out infinite",
                  }}
                />
                <span className="relative">Get a Quote</span>
                <ChevronRight size={14} className="relative group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2.5 rounded-xl text-foreground transition-all"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(14px)",
            }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ───── Mobile Menu — Glass ───── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden border-b"
            style={{
              background: "linear-gradient(180deg, rgba(20,16,40,0.85), rgba(16,12,32,0.85))",
              backdropFilter: "blur(32px) saturate(200%)",
              WebkitBackdropFilter: "blur(32px) saturate(200%)",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <div className="px-4 py-5 space-y-1">
              {navLinks.map((link, i) =>
                link.hasDropdown ? (
                  <div key={link.label}>
                    <motion.div
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setMobileServicesOpen(v => !v)}
                      className="flex items-center justify-between py-3 px-4 text-sm font-semibold text-foreground/80 hover:text-foreground rounded-xl transition-all cursor-pointer"
                      style={{
                        background: mobileServicesOpen ? "rgba(168,85,247,0.12)" : "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {link.label}
                      <ChevronDown size={14} className={`text-primary transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`} />
                    </motion.div>
                    <AnimatePresence>
                      {mobileServicesOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-2 mt-1 space-y-1 overflow-hidden"
                        >
                          {serviceCategories.map((cat) => (
                            <Link key={cat.label} to={cat.href} onClick={() => { setMobileOpen(false); setMobileServicesOpen(false); }}>
                              <div className="flex items-center gap-3 py-2 px-3 rounded-xl transition-all"
                                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                              >
                                <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0"
                                  style={{ boxShadow: `inset 0 0 0 1px hsl(${cat.accent} / 0.30)` }}
                                >
                                  <img src={cat.img} alt={cat.label} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-sm font-medium text-foreground/75">{cat.label}</span>
                                <ChevronRight size={12} className="ml-auto text-foreground/40" />
                              </div>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link key={link.label} to={link.href} onClick={() => setMobileOpen(false)}>
                    <motion.div
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between py-3 px-4 text-sm font-semibold text-foreground/80 hover:text-foreground rounded-xl transition-all"
                      style={{
                        background: isActive(link.href) ? "rgba(168,85,247,0.14)" : "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {link.label}
                      <ChevronRight size={14} className="text-foreground/40" />
                    </motion.div>
                  </Link>
                )
              )}

              {/* Mobile theme toggle */}
              <button
                onClick={toggleTheme}
                className="w-full mt-3 flex items-center justify-between py-3 px-4 rounded-xl text-sm font-semibold text-foreground/85 transition-all"
                style={{
                  background: "linear-gradient(135deg, rgba(168,85,247,0.12), rgba(56,189,248,0.10))",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <span className="flex items-center gap-2">
                  <ThemeIcon size={16} className="text-primary" /> Theme: {themeLabel}
                </span>
                <ChevronRight size={14} className="text-foreground/40" />
              </button>

              <Link to="/get-quote" className="block mt-2" onClick={() => setMobileOpen(false)}>
                <div
                  className="text-center py-3 px-4 text-sm font-bold text-white rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, hsl(270,92%,60%), hsl(320,90%,55%) 55%, hsl(195,100%,55%))",
                    boxShadow: "0 6px 22px hsl(270,92%,50%,0.40), inset 0 1px 0 rgba(255,255,255,0.30)",
                  }}
                >
                  Get a Free Quote →
                </div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* shimmer keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(700%) skewX(-12deg); }
        }
      `}</style>
    </motion.header>
  );
};

export default SiteHeader;
