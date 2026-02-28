import { useState } from "react";
import { Phone, Mail, Menu, X, Zap, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Blog", href: "/blog" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const SiteHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
        style={{ background: 'linear-gradient(90deg, hsl(258,90%,20%) 0%, hsl(220,40%,8%) 50%, hsl(185,60%,15%) 100%)' }}
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
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold" style={{ background: 'linear-gradient(90deg, hsl(258,90%,66%), hsl(185,100%,48%))', color: 'hsl(220,40%,5%)' }}>
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
          style={{ background: 'linear-gradient(90deg, transparent, hsl(258,90%,66%), hsl(185,100%,48%), transparent)' }} />

        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, hsl(258,90%,66%), hsl(185,100%,48%))' }}>
                <Zap size={18} className="text-white" fill="white" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 60%)' }} />
              </div>
              <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                <span className="gradient-text">Shahed</span>
                <span className="text-foreground"> IT</span>
              </span>
            </motion.div>
          </Link>

          {/* Nav links - desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link, i) => (
              <Link key={link.label} to={link.href}>
                <motion.span
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  className="relative px-4 py-2 text-sm font-medium text-foreground/65 hover:text-foreground transition-all duration-300 group flex items-center rounded-lg hover:bg-white/5"
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-0 group-hover:w-3/4 rounded-full transition-all duration-300"
                    style={{ background: 'linear-gradient(90deg, hsl(258,90%,66%), hsl(185,100%,48%))' }} />
                </motion.span>
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/get-quote">
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white glossy-btn relative overflow-hidden group"
                style={{ background: 'linear-gradient(135deg, hsl(258,90%,66%), hsl(258,90%,55%))', boxShadow: '0 4px 20px hsl(258,90%,66%,0.35), 0 0 40px hsl(258,90%,66%,0.12)' }}
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
              {navLinks.map((link, i) => (
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
              ))}
              <Link to="/get-quote" className="block mt-3" onClick={() => setMobileOpen(false)}>
                <div className="text-center py-3 px-4 text-sm font-bold text-white rounded-xl"
                  style={{ background: 'linear-gradient(135deg, hsl(258,90%,66%), hsl(185,100%,48%,0.8))' }}>
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
