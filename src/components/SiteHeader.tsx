import { useState, useRef, useEffect } from "react";
import {
  Menu, X, ChevronRight, ChevronDown, LogIn, LogOut, Search,
  Globe, Wrench, Palette, Facebook, TrendingUp, Building2, Sparkles,
} from "lucide-react";
import logoImg from "@/assets/logo-glossy.png";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SmartSearch from "@/components/SmartSearch";

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
  { label: "Contact", href: "/contact" },
];

const SiteHeader = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const servicesTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive = (href: string) => location.pathname === href;
  const activeKey = navLinks.find(l => isActive(l.href))?.label || (servicesOpen ? "Services" : null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 90, damping: 18 }}
      className="sticky top-0 z-50 md:px-0 px-3 md:pt-0 pt-2"
    >
      <div
        className="relative transition-all duration-300 md:rounded-none rounded-full md:border-x-0"
        style={{
          background: scrolled
            ? "linear-gradient(180deg, rgba(10, 8, 26, 0.92) 0%, rgba(16, 12, 40, 0.88) 100%)"
            : "linear-gradient(180deg, rgba(14, 10, 32, 0.85) 0%, rgba(20, 15, 48, 0.78) 100%)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          border: "1px solid rgba(168, 85, 247, 0.22)",
          boxShadow: scrolled
            ? "0 12px 40px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(168,85,247,0.10), inset 0 1px 0 rgba(255,255,255,0.05)"
            : "0 8px 28px rgba(99, 39, 178, 0.30), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Aurora top edge */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.6) 18%, rgba(168, 85, 247, 0.95) 50%, rgba(236, 72, 153, 0.6) 82%, transparent 100%)",
          }}
        />
        {/* Floating glow blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-20 left-1/4 w-80 h-32 rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(ellipse, #a855f7, transparent 70%)" }}
            animate={{ x: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -top-20 right-1/4 w-72 h-32 rounded-full opacity-25 blur-3xl"
            style={{ background: "radial-gradient(ellipse, #ec4899, transparent 70%)" }}
            animate={{ x: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="container mx-auto px-3 md:px-4 lg:px-6 py-2 md:py-3 flex items-center gap-2 md:gap-3 lg:gap-5 relative">
          {/* ── Logo ── */}
          <Link to="/" className="shrink-0">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="flex items-center gap-2.5 group">
              <div className="relative shrink-0">
                <motion.div
                  className="absolute -inset-1.5 rounded-2xl opacity-60 blur-lg"
                  style={{ background: "conic-gradient(from 0deg, #6366f1, #a855f7, #ec4899, #6366f1)" }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                <div
                  className="relative w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #1a1233 0%, #251847 100%)",
                    border: "1px solid rgba(168, 85, 247, 0.45)",
                    boxShadow:
                      "0 8px 24px rgba(168, 85, 247, 0.45), inset 0 1px 0 rgba(255,255,255,0.10)",
                  }}
                >
                  <span
                    className="absolute inset-0 opacity-30 pointer-events-none"
                    style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 50%)" }}
                  />
                  <img src={logoImg} alt="Shahed IT" className="w-9 h-9 object-contain relative" />
                </div>
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-[20px] font-extrabold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                  <span style={{ color: "#fff" }}>Shahed </span>
                  <span style={{ background: "linear-gradient(135deg, #818cf8 0%, #c4b5fd 40%, #f0abfc 80%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    IT
                  </span>
                </span>
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: "#a78bfa" }}>
                  Digital Agency
                </span>
              </div>
            </motion.div>
          </Link>

          {/* ── Smart Search ── */}
          <SmartSearch variant="desktop" />

          {/* ── Premium Pill Nav ── */}
          <LayoutGroup id="header-nav">
            <nav
              className="hidden lg:flex items-center gap-1 p-1 rounded-full shrink-0 relative"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                backdropFilter: "blur(8px)",
              }}
            >
              {navLinks.map((link) => {
                const active = isActive(link.href) || (link.hasDropdown && servicesOpen);
                const showIndicator = activeKey === link.label;
                const content = (
                  <span className="relative px-3.5 py-1.5 text-sm font-semibold flex items-center gap-1 z-10">
                    {showIndicator && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: "linear-gradient(135deg, rgba(124, 58, 237, 0.35), rgba(236, 72, 153, 0.30))",
                          border: "1px solid rgba(168, 85, 247, 0.45)",
                          boxShadow: "0 4px 16px rgba(168, 85, 247, 0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
                        }}
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative" style={{ color: active ? "#fff" : "rgba(226, 218, 245, 0.78)" }}>
                      {link.label}
                    </span>
                    {link.hasDropdown && (
                      <ChevronDown size={12} className={`relative transition-transform duration-300 ${servicesOpen ? "rotate-180" : ""}`} style={{ color: active ? "#f0abfc" : "rgba(226, 218, 245, 0.6)" }} />
                    )}
                  </span>
                );

                return link.hasDropdown ? (
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
                    <Link
                      to={link.href}
                      className="nav-pill-link block rounded-full transition-all duration-200"
                    >{content}</Link>

                    <AnimatePresence>
                      {servicesOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 12, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 12, scale: 0.96 }}
                          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[440px] rounded-2xl overflow-hidden z-50"
                          style={{
                            background: "linear-gradient(180deg, rgba(20, 14, 44, 0.98), rgba(16, 10, 36, 0.98))",
                            backdropFilter: "blur(24px) saturate(180%)",
                            WebkitBackdropFilter: "blur(24px) saturate(180%)",
                            border: "1px solid rgba(168, 85, 247, 0.20)",
                            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(168, 85, 247, 0.10), inset 0 1px 0 rgba(255,255,255,0.05)",
                          }}
                        >
                          <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.6), rgba(236, 72, 153, 0.6), transparent)" }} />
                          <div className="p-3 grid grid-cols-2 gap-1.5">
                            {serviceCategories.map((cat) => (
                              <Link
                                key={cat.label}
                                to={cat.href}
                                onClick={() => setServicesOpen(false)}
                                className="group flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-white/[0.06]"
                              >
                                <div
                                  className="w-10 h-10 rounded-lg overflow-hidden shrink-0 relative"
                                  style={{ boxShadow: `0 4px 12px hsl(${cat.accent} / 0.35), inset 0 0 0 1px hsl(${cat.accent} / 0.40)` }}
                                >
                                  <img src={cat.img} alt={cat.label} className="w-full h-full object-cover" />
                                  <span className="absolute inset-0" style={{ background: `linear-gradient(135deg, hsl(${cat.accent} / 0.15), transparent)` }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold truncate text-white">{cat.label}</div>
                                  <div className="text-[10px] uppercase tracking-wider font-medium" style={{ color: `hsl(${cat.accent} / 0.85)` }}>Premium</div>
                                </div>
                                <ChevronRight size={13} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" style={{ color: `hsl(${cat.accent})` }} />
                              </Link>
                            ))}
                          </div>
                          <div className="p-3 pt-1">
                            <Link to="/services" onClick={() => setServicesOpen(false)}>
                              <div
                                className="text-center py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 text-white"
                                style={{
                                  background: "linear-gradient(135deg, #6366f1, #a855f7 55%, #ec4899)",
                                  boxShadow: "0 8px 20px rgba(168, 85, 247, 0.45), inset 0 1px 0 rgba(255,255,255,0.25)",
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
                  <Link key={link.label} to={link.href} className="nav-pill-link block rounded-full transition-all duration-200">
                    {content}
                  </Link>
                );
              })}
            </nav>
          </LayoutGroup>

          {/* ── Right cluster ── */}
          <div className="hidden md:flex items-center gap-2 shrink-0 ml-auto lg:ml-0">
            {user ? (
              <>
                <Link to="/dashboard">
                  <motion.div
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 pl-1 pr-3.5 py-1 rounded-full transition-all"
                    style={{
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.10)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="relative">
                      {(() => {
                        const meta: any = (user as any)?.user_metadata ?? {};
                        const avatarUrl: string | undefined =
                          meta.avatar_url || meta.picture || meta.avatar;
                        const fullName: string | undefined =
                          meta.full_name || meta.name || meta.user_name;
                        const initial =
                          (fullName?.trim()?.[0] || user.email?.[0] || "U").toUpperCase();
                        return avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={fullName || user.email || "User"}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                            style={{ boxShadow: "0 0 0 2px rgba(168, 85, 247, 0.45)" }}
                          />
                        ) : (
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                            style={{
                              background: "linear-gradient(135deg, #6366f1, #a855f7 55%, #ec4899)",
                              boxShadow: "0 0 0 2px rgba(168, 85, 247, 0.45), inset 0 1px 0 rgba(255,255,255,0.35)",
                            }}
                          >
                            {initial}
                          </div>
                        );
                      })()}
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                        style={{
                          background: "linear-gradient(135deg, #34d399, #10b981)",
                          boxShadow: "0 0 0 2px #110a26, 0 0 8px rgba(52, 211, 153, 0.7)",
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold text-white">Dashboard</span>
                  </motion.div>
                </Link>
                <motion.button
                  onClick={() => signOut()}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  title="Logout"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.10)",
                    color: "rgba(226, 218, 245, 0.85)",
                  }}
                >
                  <LogOut size={14} />
                </motion.button>
              </>
            ) : (
              <Link to="/login">
                <motion.button
                  whileHover={{ y: -1, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold text-white"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                  }}
                >
                  <LogIn size={14} /> Login
                </motion.button>
              </Link>
            )}

            {/* CTA — Premium Quote button */}
            <Link to="/get-quote">
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex items-center gap-1.5 pl-3.5 pr-4 py-2 rounded-full text-sm font-bold text-white overflow-hidden group"
                style={{
                  background: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
                  boxShadow:
                    "0 10px 28px rgba(168, 85, 247, 0.55), 0 2px 6px rgba(236, 72, 153, 0.30), inset 0 1px 0 rgba(255,255,255,0.30), inset 0 -1px 0 rgba(0,0,0,0.10)",
                }}
              >
                <span
                  className="absolute inset-0 opacity-60 pointer-events-none"
                  style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.30) 0%, transparent 55%)" }}
                />
                <span
                  className="absolute inset-y-0 -left-full w-1/2 opacity-70 pointer-events-none"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
                    animation: "header-shimmer 2.8s ease-in-out infinite",
                  }}
                />
                <Sparkles size={14} className="relative drop-shadow" />
                <span className="relative tracking-wide">Quote</span>
              </motion.button>
            </Link>
          </div>

          {/* keyframes */}
          <style>{`
            @keyframes header-shimmer {
              0% { transform: translateX(0); }
              60%, 100% { transform: translateX(400%); }
            }
          `}</style>

          {/* Mobile toggle */}
          <button
            className="md:hidden ml-auto p-2.5 rounded-xl text-white"
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
            }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ───── Mobile Menu ───── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden"
            style={{
              background: "linear-gradient(180deg, rgba(14, 10, 32, 0.98), rgba(20, 15, 48, 0.98))",
              backdropFilter: "blur(20px) saturate(160%)",
              WebkitBackdropFilter: "blur(20px) saturate(160%)",
              borderBottom: "1px solid rgba(168, 85, 247, 0.18)",
            }}
          >
            <div className="px-4 py-4 space-y-1.5">
              <div className="mb-3">
                <SmartSearch variant="mobile" onNavigate={() => setMobileOpen(false)} />
              </div>

              {navLinks.map((link) =>
                link.hasDropdown ? (
                  <div key={link.label}>
                    <div
                      onClick={() => setMobileServicesOpen(v => !v)}
                      className="flex items-center justify-between py-3 px-4 text-sm font-semibold rounded-xl cursor-pointer text-white"
                      style={{
                        background: mobileServicesOpen ? "rgba(168, 85, 247, 0.12)" : "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {link.label}
                      <ChevronDown size={14} className={`transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`} style={{ color: "#c4b5fd" }} />
                    </div>
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
                              <div className="flex items-center gap-3 py-2 px-3 rounded-xl">
                                <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0">
                                  <img src={cat.img} alt={cat.label} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-sm font-medium text-white">{cat.label}</span>
                                <ChevronRight size={12} className="ml-auto" style={{ color: "#c4b5fd" }} />
                              </div>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link key={link.label} to={link.href} onClick={() => setMobileOpen(false)}>
                    <div
                      className="flex items-center justify-between py-3 px-4 text-sm font-semibold rounded-xl text-white"
                      style={{
                        background: isActive(link.href) ? "linear-gradient(135deg, rgba(168, 85, 247, 0.20), rgba(236, 72, 153, 0.15))" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${isActive(link.href) ? "rgba(168, 85, 247, 0.35)" : "rgba(255,255,255,0.06)"}`,
                      }}
                    >
                      {link.label}
                      <ChevronRight size={14} style={{ color: "#c4b5fd" }} />
                    </div>
                  </Link>
                )
              )}

              <div className="pt-2 grid grid-cols-2 gap-2">
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                      <div
                        className="flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold text-white"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.12)",
                        }}
                      >
                        Dashboard
                      </div>
                    </Link>
                    <button
                      onClick={() => { signOut(); setMobileOpen(false); }}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold text-white"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="col-span-2">
                    <div
                      className="flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold text-white"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      <LogIn size={14} /> Login
                    </div>
                  </Link>
                )}
              </div>

              <Link to="/get-quote" onClick={() => setMobileOpen(false)} className="block pt-1">
                <div
                  className="flex items-center justify-center gap-1.5 py-3 rounded-full text-sm font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #a855f7 55%, #ec4899)",
                    boxShadow: "0 8px 24px rgba(168, 85, 247, 0.45), inset 0 1px 0 rgba(255,255,255,0.25)",
                  }}
                >
                  <Sparkles size={14} /> Get a Free Quote
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
