import { useState, useRef } from "react";
import { Phone, Mail, Menu, X, ChevronRight, ChevronDown, Globe, Wrench, Palette, Facebook, TrendingUp, Building2, LogIn, Sparkles, Waves } from "lucide-react";
import logoImg from "@/assets/logo-glossy.png";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

import catWebDev from "@/assets/cat-web-dev.jpg";
import catMaintenance from "@/assets/cat-maintenance.jpg";
import catGraphics from "@/assets/cat-graphics.jpg";
import catFacebook from "@/assets/cat-facebook.jpg";
import catDigitalMarketing from "@/assets/cat-digital-marketing.jpg";
import catBusiness from "@/assets/cat-business.jpg";

const serviceCategories = [
  { label: "Web Development", href: "/services#web-development", icon: Globe, img: catWebDev, color: "hsl(42,70%,65%)" },
  { label: "Website Maintenance", href: "/services#maintenance", icon: Wrench, img: catMaintenance, color: "hsl(210,80%,60%)" },
  { label: "Graphics Design", href: "/services#graphics", icon: Palette, img: catGraphics, color: "hsl(320,80%,60%)" },
  { label: "Facebook Services", href: "/services#facebook", icon: Facebook, img: catFacebook, color: "hsl(220,90%,55%)" },
  { label: "Digital Marketing", href: "/services#digital-marketing", icon: TrendingUp, img: catDigitalMarketing, color: "hsl(145,70%,45%)" },
  { label: "Business Solutions", href: "/services#business", icon: Building2, img: catBusiness, color: "hsl(35,90%,55%)" },
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const servicesTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 80, damping: 20 }}
      className="sticky top-0 z-50"
    >
      {/* Top bar */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(90deg, hsl(42,70%,20%) 0%, hsl(220,40%,8%) 50%, hsl(185,60%,15%) 100%)' }}
      >
        {/* Moving gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
        <div className="container mx-auto px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-5">
            <a href="tel:+8801820060046" className="flex items-center gap-1.5 text-foreground/70 hover:text-primary transition-all duration-300 group">
              <span className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center group-hover:bg-primary/40 transition-colors">
                <Phone size={11} className="text-primary" />
              </span>
              <span>01820-060046</span>
            </a>
            <a href="mailto:info@shahedit.com" className="hidden sm:flex items-center gap-1.5 text-foreground/70 hover:text-accent transition-all duration-300 group">
              <span className="w-6 h-6 rounded-md bg-accent/20 flex items-center justify-center group-hover:bg-accent/40 transition-colors">
                <Mail size={11} className="text-accent" />
              </span>
              <span>info@shahedit.com</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1 text-foreground/50 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> 24/7 Support
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold" style={{ background: 'linear-gradient(90deg, hsl(42,70%,65%), hsl(45,85%,48%))', color: 'hsl(240,22%,4%)' }}>
              🎯 Free Consultation
            </span>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div
        className="relative border-b border-white/5"
        style={{ background: 'rgba(12, 10, 22, 0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
      >
        {/* Subtle top glow line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px opacity-50"
          style={{ background: 'linear-gradient(90deg, transparent, hsl(42,70%,65%), hsl(45,85%,48%), transparent)' }} />

        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="flex items-center gap-2.5 shrink-0">
              <div className="w-10 h-10 shrink-0" style={{ filter: 'drop-shadow(0 4px 16px hsl(185,100%,48%,0.5))' }}>
                <img src={logoImg} alt="Shahed IT Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                <span style={{ background: 'linear-gradient(135deg, hsl(45,85%,48%), hsl(165,80%,45%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Shahed</span>
                <span className="text-foreground"> IT</span>
              </span>
            </motion.div>
          </Link>

          {/* Nav links - desktop */}
          <nav className="hidden lg:flex items-center gap-1">
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
                    servicesTimeout.current = setTimeout(() => setServicesOpen(false), 150);
                  }}
                >
                  <Link to={link.href}>
                    <motion.span
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.07 }}
                      className="relative px-4 py-2 text-sm font-medium text-foreground/65 hover:text-foreground transition-all duration-300 group flex items-center gap-1 rounded-lg hover:bg-white/5 cursor-pointer"
                    >
                      {link.label}
                      <ChevronDown size={13} className={`transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`} />
                      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-0 group-hover:w-3/4 rounded-full transition-all duration-300"
                        style={{ background: 'linear-gradient(90deg, hsl(42,70%,65%), hsl(45,85%,48%))' }} />
                    </motion.span>
                  </Link>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {servicesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute top-full left-0 mt-2 w-64 rounded-2xl shadow-2xl overflow-hidden z-50"
                        style={{
                          background: "rgba(14, 11, 28, 0.97)",
                          backdropFilter: "blur(20px)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,161,74,0.1)",
                        }}
                      >
                        <div className="p-2">
                          {serviceCategories.map((cat) => (
                            <Link
                              key={cat.label}
                              to={cat.href}
                              onClick={() => setServicesOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all duration-200 group"
                            >
                              {/* Thumbnail */}
                              <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 ring-1 ring-white/10">
                                <img src={cat.img} alt={cat.label} className="w-full h-full object-cover" />
                              </div>
                              <span className="text-sm font-medium text-foreground/70 group-hover:text-foreground transition-colors">
                                {cat.label}
                              </span>
                              <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-60 transition-opacity text-primary" />
                            </Link>
                          ))}
                        </div>
                        {/* Footer link */}
                        <div className="px-3 pb-3">
                          <Link to="/services" onClick={() => setServicesOpen(false)}>
                            <div className="text-center py-2 text-xs font-semibold rounded-xl transition-all"
                              style={{ background: "linear-gradient(135deg, hsl(258,90%,66%,0.15), hsl(185,100%,48%,0.15))", color: "hsl(42,70%,75%)", border: "1px solid hsl(258,90%,66%,0.2)" }}>
                              সকল সার্ভিস দেখুন →
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
                    transition={{ delay: 0.1 + i * 0.07 }}
                    className="relative px-4 py-2 text-sm font-medium text-foreground/65 hover:text-foreground transition-all duration-300 group flex items-center rounded-lg hover:bg-white/5"
                  >
                    {link.label}
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-0 group-hover:w-3/4 rounded-full transition-all duration-300"
                      style={{ background: 'linear-gradient(90deg, hsl(42,70%,65%), hsl(45,85%,48%))' }} />
                  </motion.span>
                </Link>
              )
            )}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.08, rotate: 12 }}
              whileTap={{ scale: 0.92 }}
              title={theme === "royal" ? "Switch to Ocean theme" : "Switch to Midnight Gold theme"}
              className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all overflow-hidden group"
              style={{
                background: theme === "royal"
                  ? "linear-gradient(135deg, hsl(42,70%,50%), hsl(45,85%,60%))"
                  : "linear-gradient(135deg, hsl(205,95%,55%), hsl(175,85%,45%))",
                boxShadow: theme === "royal"
                  ? "0 4px 18px hsl(42,70%,50%,0.5), inset 0 1px 0 rgba(255,255,255,0.22)"
                  : "0 4px 18px hsl(205,95%,55%,0.45), inset 0 1px 0 rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <AnimatePresence mode="wait">
                {theme === "royal" ? (
                  <motion.span
                    key="royal"
                    initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Sparkles size={16} className="text-white drop-shadow" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="ocean"
                    initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Waves size={16} className="text-white drop-shadow" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            {user ? (
              <Link to="/dashboard">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'rgba(201,161,74,0.12)', border: '1px solid rgba(201,161,74,0.25)', color: 'hsl(42,70%,75%)' }}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black text-white"
                    style={{ background: 'linear-gradient(135deg, hsl(42,70%,65%), hsl(45,85%,48%))' }}>
                    {user.email?.[0].toUpperCase()}
                  </div>
                  ড্যাশবোর্ড
                </motion.div>
              </Link>
            ) : (
              <Link to="/login">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'rgba(201,161,74,0.10)', border: '1px solid rgba(201,161,74,0.22)', color: 'hsl(42,70%,75%)' }}>
                  <LogIn size={14} /> লগইন
                </motion.button>
              </Link>
            )}
            <Link to="/get-quote">
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white glossy-btn relative overflow-hidden group"
                style={{ background: 'linear-gradient(135deg, hsl(42,70%,65%), hsl(42,70%,55%))', boxShadow: '0 4px 20px hsl(258,90%,66%,0.35), 0 0 40px hsl(258,90%,66%,0.12)' }}
              >
                <span>Get a Quote</span>
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
            </Link>
          </div>

          <button className="lg:hidden p-2 text-foreground/70 hover:text-foreground rounded-lg hover:bg-white/5 transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden border-b border-white/5 overflow-hidden"
            style={{ background: 'rgba(10, 8, 20, 0.97)', backdropFilter: 'blur(24px)' }}
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
                      className="flex items-center justify-between py-3 px-4 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-xl transition-all cursor-pointer"
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
                          className="ml-3 mt-1 space-y-0.5 overflow-hidden"
                        >
                          {serviceCategories.map((cat) => (
                            <Link key={cat.label} to={cat.href} onClick={() => { setMobileOpen(false); setMobileServicesOpen(false); }}>
                              <div className="flex items-center gap-3 py-2.5 px-4 rounded-xl hover:bg-white/5 transition-all">
                                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 ring-1 ring-white/10">
                                  <img src={cat.img} alt={cat.label} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-sm text-foreground/65">{cat.label}</span>
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
                      className="flex items-center justify-between py-3 px-4 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-xl transition-all group"
                    >
                      {link.label}
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </motion.div>
                  </Link>
                )
              )}
              <Link to="/get-quote" className="block mt-3" onClick={() => setMobileOpen(false)}>
                <div className="text-center py-3 px-4 text-sm font-bold text-white rounded-xl"
                  style={{ background: 'linear-gradient(135deg, hsl(42,70%,65%), hsl(185,100%,48%,0.8))' }}>
                  Get a Free Quote →
                </div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default SiteHeader;
