import { useState, useEffect, useRef, FormEvent } from "react";
import {
  Search, Menu, X, ChevronRight, ChevronDown, LogIn, LogOut,
  Globe, Wrench, Palette, Facebook, TrendingUp, Building2, Sparkles,
} from "lucide-react";
import logoImg from "@/assets/logo-glossy.png";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";


import catWebDev from "@/assets/cat-web-dev.jpg";
import catMaintenance from "@/assets/cat-maintenance.jpg";
import catGraphics from "@/assets/cat-graphics.jpg";
import catFacebook from "@/assets/cat-facebook.jpg";
import catDigitalMarketing from "@/assets/cat-digital-marketing.jpg";
import catBusiness from "@/assets/cat-business.jpg";

const serviceCategories = [
  { label: "Web Development", href: "/services#web-development", icon: Globe, img: catWebDev, accent: "270 92% 60%" },
  { label: "Website Maintenance", href: "/services#maintenance", icon: Wrench, img: catMaintenance, accent: "210 90% 60%" },
  { label: "Graphics Design", href: "/services#graphics", icon: Palette, img: catGraphics, accent: "320 90% 60%" },
  { label: "Facebook Services", href: "/services#facebook", icon: Facebook, img: catFacebook, accent: "220 95% 60%" },
  { label: "Digital Marketing", href: "/services#digital-marketing", icon: TrendingUp, img: catDigitalMarketing, accent: "150 80% 50%" },
  { label: "Business Solutions", href: "/services#business", icon: Building2, img: catBusiness, accent: "42 95% 55%" },
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
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const servicesTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ctrl+K to focus search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) => location.pathname === href;


  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/services?q=${encodeURIComponent(q)}`);
    setSearchQuery("");
    searchInputRef.current?.blur();
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 80, damping: 20 }}
      className="sticky top-0 z-50"
    >
      <div
        className="relative"
        style={{
          background:
            "linear-gradient(180deg, rgba(253, 251, 255, 0.94) 0%, rgba(248, 245, 253, 0.88) 100%)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.9) inset, 0 4px 24px rgba(80, 50, 140, 0.06), 0 1px 0 rgba(120, 100, 180, 0.08)",
        }}
      >
        {/* Premium aurora top edge */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none opacity-80"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.5) 20%, rgba(168, 85, 247, 0.7) 50%, rgba(236, 72, 153, 0.5) 80%, transparent 100%)",
          }}
        />
        {/* Soft floating glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-16 left-1/3 w-72 h-32 rounded-full opacity-[0.18] blur-3xl"
            style={{ background: "radial-gradient(ellipse, #a855f7, transparent 70%)" }}
          />
          <div
            className="absolute -top-16 right-1/4 w-64 h-32 rounded-full opacity-[0.14] blur-3xl"
            style={{ background: "radial-gradient(ellipse, #ec4899, transparent 70%)" }}
          />
        </div>

        <div className="container mx-auto px-4 lg:px-6 py-3 flex items-center gap-3 lg:gap-5 relative">
          {/* ── Logo ── */}
          <Link to="/" className="shrink-0">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2.5 group">
              <div className="relative shrink-0">
                {/* Animated halo */}
                <motion.div
                  className="absolute -inset-1.5 rounded-2xl opacity-50 blur-md"
                  style={{ background: "conic-gradient(from 0deg, #a855f7, #ec4899, #6366f1, #a855f7)" }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                <div
                  className="relative w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #ffffff 0%, #faf7ff 100%)",
                    border: "1px solid rgba(168, 85, 247, 0.25)",
                    boxShadow:
                      "0 6px 18px rgba(168, 85, 247, 0.22), inset 0 1px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(168, 85, 247, 0.06)",
                  }}
                >
                  {/* Glossy sheen */}
                  <span
                    className="absolute inset-0 opacity-60 pointer-events-none"
                    style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.7) 0%, transparent 50%)" }}
                  />
                  <img src={logoImg} alt="Shahed IT" className="w-9 h-9 object-contain relative" />
                </div>
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="flex items-center">
                  <span className="text-[20px] font-extrabold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                    <span style={{ color: "#1a1233" }}>Shahed </span>
                    <span style={{ background: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      IT
                    </span>
                  </span>
                </span>
              </div>
            </motion.div>
          </Link>

          {/* ── Premium Search Bar ── */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-auto">
            <div
              className="group relative w-full flex items-center gap-2 px-4 py-2.5 rounded-full transition-all focus-within:scale-[1.01]"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(245, 242, 250, 0.85))",
                border: "1px solid rgba(120, 100, 180, 0.14)",
                boxShadow:
                  "inset 0 1px 2px rgba(80, 50, 140, 0.05), 0 1px 0 rgba(255,255,255,0.9)",
              }}
            >
              {/* Focus glow ring */}
              <span
                className="absolute -inset-px rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(168, 85, 247, 0.35), rgba(236, 72, 153, 0.35))",
                  padding: "1px",
                  WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                }}
              />
              <Search size={16} className="shrink-0 transition-colors group-focus-within:text-[#7c3aed]" style={{ color: "#9b8fb5" }} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="প্রোডাক্ট খুঁজুন..."
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-[#9b8fb5] font-medium"
                style={{ color: "#2a1f4a" }}
              />
              <kbd
                className="hidden lg:flex items-center gap-0.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md"
                style={{
                  background: "linear-gradient(180deg, #ffffff, #f8f5fd)",
                  border: "1px solid rgba(120, 100, 180, 0.18)",
                  color: "#7c3aed",
                  boxShadow: "0 1px 0 rgba(80, 50, 140, 0.08), inset 0 1px 0 rgba(255,255,255,1)",
                }}
              >
                ⌘ K
              </kbd>
            </div>
          </form>


          {/* ── Premium Pill Nav ── */}
          <nav
            className="hidden lg:flex items-center gap-0.5 p-1 rounded-full shrink-0 relative"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.7), rgba(245, 242, 250, 0.85))",
              border: "1px solid rgba(120, 100, 180, 0.12)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.95), 0 2px 8px rgba(80, 50, 140, 0.04)",
            }}
          >
            {navLinks.map((link) =>
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
                    <span
                      className="nav-pill relative px-4 py-1.5 text-sm font-semibold rounded-full flex items-center gap-1 cursor-pointer"
                      style={
                        isActive(link.href) || servicesOpen
                          ? {
                              background: "linear-gradient(180deg, #ffffff, #faf7ff)",
                              color: "#7c3aed",
                              boxShadow:
                                "0 4px 12px rgba(124, 58, 237, 0.18), 0 0 0 1px rgba(124, 58, 237, 0.12), inset 0 1px 0 rgba(255,255,255,1)",
                            }
                          : { color: "#5b4d7e" }
                      }
                    >
                      {link.label}
                      <ChevronDown size={12} className={`transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
                    </span>
                  </Link>

                  <AnimatePresence>
                    {servicesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[420px] rounded-2xl overflow-hidden z-50"
                        style={{
                          background: "rgba(255, 255, 255, 0.98)",
                          backdropFilter: "blur(20px) saturate(180%)",
                          WebkitBackdropFilter: "blur(20px) saturate(180%)",
                          border: "1px solid rgba(120, 100, 180, 0.14)",
                          boxShadow: "0 20px 60px rgba(80, 50, 140, 0.18), 0 0 0 1px rgba(168, 85, 247, 0.05)",
                        }}
                      >
                        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.4), rgba(236, 72, 153, 0.4), transparent)" }} />
                        <div className="p-2.5 grid grid-cols-2 gap-1.5">
                          {serviceCategories.map((cat) => (
                            <Link
                              key={cat.label}
                              to={cat.href}
                              onClick={() => setServicesOpen(false)}
                              className="group flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-[rgba(168,85,247,0.06)]"
                            >
                              <div
                                className="w-10 h-10 rounded-lg overflow-hidden shrink-0"
                                style={{ boxShadow: `inset 0 0 0 1px hsl(${cat.accent} / 0.30)` }}
                              >
                                <img src={cat.img} alt={cat.label} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold truncate" style={{ color: "#2a1f4a" }}>{cat.label}</div>
                                <div className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "#9b8fb5" }}>Premium service</div>
                              </div>
                              <ChevronRight size={13} className="opacity-0 -translate-x-1 group-hover:opacity-70 group-hover:translate-x-0 transition-all" style={{ color: `hsl(${cat.accent})` }} />
                            </Link>
                          ))}
                        </div>
                        <div className="p-2.5 pt-1">
                          <Link to="/services" onClick={() => setServicesOpen(false)}>
                            <div
                              className="text-center py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 text-white"
                              style={{
                                background: "linear-gradient(135deg, #a855f7, #ec4899)",
                                boxShadow: "0 6px 18px rgba(168, 85, 247, 0.35), inset 0 1px 0 rgba(255,255,255,0.25)",
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
                  <span
                    className="nav-pill relative px-4 py-1.5 text-sm font-semibold rounded-full"
                    style={
                      isActive(link.href)
                        ? {
                            background: "linear-gradient(180deg, #ffffff, #faf7ff)",
                            color: "#7c3aed",
                            boxShadow:
                              "0 4px 12px rgba(124, 58, 237, 0.18), 0 0 0 1px rgba(124, 58, 237, 0.12), inset 0 1px 0 rgba(255,255,255,1)",
                          }
                        : { color: "#5b4d7e" }
                    }
                  >
                    {link.label}
                  </span>
                </Link>
              )
            )}
          </nav>

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
                      background: "linear-gradient(180deg, rgba(255,255,255,0.7), rgba(245, 242, 250, 0.85))",
                      border: "1px solid rgba(120, 100, 180, 0.12)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.95)",
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
                            style={{
                              boxShadow:
                                "0 3px 10px rgba(168, 85, 247, 0.40), 0 0 0 2px #ffffff",
                            }}
                          />
                        ) : (
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                            style={{
                              background:
                                "linear-gradient(135deg, #6366f1, #a855f7 55%, #ec4899)",
                              boxShadow:
                                "0 3px 10px rgba(168, 85, 247, 0.40), inset 0 1px 0 rgba(255,255,255,0.35), 0 0 0 2px #ffffff",
                            }}
                          >
                            {initial}
                          </div>
                        );
                      })()}
                      {/* online indicator */}
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                        style={{
                          background: "linear-gradient(135deg, #10b981, #059669)",
                          boxShadow: "0 0 0 2px #ffffff, 0 0 6px rgba(16, 185, 129, 0.6)",
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold" style={{ color: "#2a1f4a" }}>Dashboard</span>
                  </motion.div>
                </Link>
                <motion.button
                  onClick={() => signOut()}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  title="Logout"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: "linear-gradient(180deg, #ffffff, #f8f5fd)",
                    border: "1px solid rgba(120, 100, 180, 0.14)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,1)",
                    color: "#5b4d7e",
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
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold"
                  style={{
                    background: "linear-gradient(180deg, #ffffff, #f8f5fd)",
                    border: "1px solid rgba(120, 100, 180, 0.16)",
                    color: "#2a1f4a",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,1), 0 2px 6px rgba(80, 50, 140, 0.05)",
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
                    "0 8px 24px rgba(168, 85, 247, 0.45), 0 2px 6px rgba(236, 72, 153, 0.25), inset 0 1px 0 rgba(255,255,255,0.30), inset 0 -1px 0 rgba(0,0,0,0.10)",
                }}
              >
                {/* Glossy top sheen */}
                <span
                  className="absolute inset-0 opacity-60 pointer-events-none"
                  style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.30) 0%, transparent 55%)" }}
                />
                {/* Animated shimmer sweep */}
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
            className="md:hidden ml-auto p-2.5 rounded-xl"
            style={{
              background: "rgba(245, 242, 250, 0.85)",
              border: "1px solid rgba(120, 100, 180, 0.14)",
              color: "#2a1f4a",
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
              background: "rgba(252, 250, 255, 0.98)",
              backdropFilter: "blur(20px) saturate(160%)",
              WebkitBackdropFilter: "blur(20px) saturate(160%)",
              borderBottom: "1px solid rgba(120, 100, 180, 0.12)",
            }}
          >
            <div className="px-4 py-4 space-y-1.5">
              {/* Mobile search */}
              <form onSubmit={handleSearch} className="mb-3">
                <div
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-full"
                  style={{
                    background: "rgba(245, 242, 250, 0.85)",
                    border: "1px solid rgba(120, 100, 180, 0.12)",
                  }}
                >
                  <Search size={16} style={{ color: "#9b8fb5" }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="প্রোডাক্ট খুঁজুন..."
                    className="flex-1 bg-transparent outline-none text-sm placeholder:text-[#9b8fb5]"
                    style={{ color: "#2a1f4a" }}
                  />
                </div>
              </form>

              {navLinks.map((link) =>
                link.hasDropdown ? (
                  <div key={link.label}>
                    <div
                      onClick={() => setMobileServicesOpen(v => !v)}
                      className="flex items-center justify-between py-3 px-4 text-sm font-semibold rounded-xl cursor-pointer"
                      style={{
                        background: mobileServicesOpen ? "rgba(168, 85, 247, 0.08)" : "transparent",
                        color: "#2a1f4a",
                      }}
                    >
                      {link.label}
                      <ChevronDown size={14} className={`transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`} style={{ color: "#7c3aed" }} />
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
                                <span className="text-sm font-medium" style={{ color: "#2a1f4a" }}>{cat.label}</span>
                                <ChevronRight size={12} className="ml-auto" style={{ color: "#9b8fb5" }} />
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
                      className="flex items-center justify-between py-3 px-4 text-sm font-semibold rounded-xl"
                      style={{
                        background: isActive(link.href) ? "rgba(168, 85, 247, 0.10)" : "transparent",
                        color: isActive(link.href) ? "#7c3aed" : "#2a1f4a",
                      }}
                    >
                      {link.label}
                      <ChevronRight size={14} style={{ color: "#9b8fb5" }} />
                    </div>
                  </Link>
                )
              )}

              <div className="pt-2 grid grid-cols-2 gap-2">
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                      <div
                        className="flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold"
                        style={{
                          background: "rgba(245, 242, 250, 0.85)",
                          border: "1px solid rgba(120, 100, 180, 0.14)",
                          color: "#2a1f4a",
                        }}
                      >
                        Dashboard
                      </div>
                    </Link>
                    <button
                      onClick={() => { signOut(); setMobileOpen(false); }}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold"
                      style={{
                        background: "rgba(245, 242, 250, 0.85)",
                        border: "1px solid rgba(120, 100, 180, 0.14)",
                        color: "#5b4d7e",
                      }}
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="col-span-2">
                    <div
                      className="flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold"
                      style={{
                        background: "rgba(245, 242, 250, 0.85)",
                        border: "1px solid rgba(120, 100, 180, 0.14)",
                        color: "#2a1f4a",
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
                    boxShadow: "0 6px 20px rgba(168, 85, 247, 0.40), inset 0 1px 0 rgba(255,255,255,0.25)",
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
