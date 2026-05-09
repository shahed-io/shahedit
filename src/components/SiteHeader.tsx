import { useState, useEffect, useRef, FormEvent } from "react";
import {
  Search, Menu, X, ChevronRight, ChevronDown, LogIn, LogOut,
  Globe, Wrench, Palette, Facebook, TrendingUp, Building2, Sparkles, Waves, Gem,
} from "lucide-react";
import logoImg from "@/assets/logo-glossy.png";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

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
  const { theme, toggleTheme } = useTheme();
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

  const themeLabel =
    theme === "royal" ? "Royal Purple" : theme === "ocean" ? "Deep Ocean" : "Glass Premium";
  const ThemeIcon = theme === "royal" ? Sparkles : theme === "ocean" ? Waves : Gem;

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
          background: "linear-gradient(180deg, rgba(252, 250, 255, 0.92), rgba(248, 246, 252, 0.86))",
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
          borderBottom: "1px solid rgba(120, 100, 180, 0.10)",
          boxShadow: "0 2px 14px rgba(80, 50, 140, 0.04)",
        }}
      >
        <div className="container mx-auto px-4 lg:px-6 py-3 flex items-center gap-3 lg:gap-5">
          {/* ── Logo ── */}
          <Link to="/" className="shrink-0">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2.5">
              <div
                className="relative w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden shrink-0"
                style={{
                  background: "linear-gradient(135deg, #ffffff, #f5f1fb)",
                  border: "1px solid rgba(168, 85, 247, 0.20)",
                  boxShadow: "0 4px 14px rgba(168, 85, 247, 0.18), inset 0 1px 0 rgba(255,255,255,0.9)",
                }}
              >
                <img src={logoImg} alt="Shahed IT" className="w-9 h-9 object-contain" />
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-[20px] font-extrabold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                  <span style={{ color: "#1a1233" }}>Shahed </span>
                  <span style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    IT
                  </span>
                </span>
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] font-semibold" style={{ color: "#f97316" }}>
                  <span className="block w-2.5 h-px" style={{ background: "#f97316" }} />
                  SHAHEDIT.COM.BD
                </span>
              </div>
            </motion.div>
          </Link>

          {/* ── Search Bar ── */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-auto">
            <div
              className="group relative w-full flex items-center gap-2 px-4 py-2.5 rounded-full transition-all"
              style={{
                background: "rgba(245, 242, 250, 0.85)",
                border: "1px solid rgba(120, 100, 180, 0.12)",
                boxShadow: "inset 0 1px 2px rgba(80, 50, 140, 0.04)",
              }}
            >
              <Search size={16} className="shrink-0" style={{ color: "#9b8fb5" }} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="প্রোডাক্ট খুঁজুন..."
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-[#9b8fb5]"
                style={{ color: "#2a1f4a" }}
              />
              <kbd
                className="hidden lg:flex items-center gap-0.5 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded"
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(120, 100, 180, 0.16)",
                  color: "#6b5b8e",
                  boxShadow: "0 1px 0 rgba(80, 50, 140, 0.06)",
                }}
              >
                Ctrl K
              </kbd>
            </div>
          </form>

          {/* ── Pill Nav ── */}
          <nav
            className="hidden lg:flex items-center gap-1 p-1 rounded-full shrink-0"
            style={{
              background: "rgba(245, 242, 250, 0.8)",
              border: "1px solid rgba(120, 100, 180, 0.10)",
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
                      className="px-3.5 py-1.5 text-sm font-semibold rounded-full flex items-center gap-1 transition-all cursor-pointer"
                      style={
                        isActive(link.href) || servicesOpen
                          ? {
                              background: "#ffffff",
                              color: "#7c3aed",
                              boxShadow: "0 2px 8px rgba(124, 58, 237, 0.12), 0 0 0 1px rgba(124, 58, 237, 0.08)",
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
                    className="px-3.5 py-1.5 text-sm font-semibold rounded-full transition-all"
                    style={
                      isActive(link.href)
                        ? {
                            background: "#ffffff",
                            color: "#7c3aed",
                            boxShadow: "0 2px 8px rgba(124, 58, 237, 0.12), 0 0 0 1px rgba(124, 58, 237, 0.08)",
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
            {/* Theme toggle (compact) */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              title={`Theme: ${themeLabel}`}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(245, 242, 250, 0.85)",
                border: "1px solid rgba(120, 100, 180, 0.14)",
              }}
            >
              <ThemeIcon size={14} style={{ color: "#7c3aed" }} />
            </motion.button>

            {user ? (
              <>
                <Link to="/dashboard">
                  <motion.div
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full"
                    style={{
                      background: "transparent",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                      style={{
                        background: "linear-gradient(135deg, #a855f7, #ec4899)",
                        boxShadow: "0 2px 8px rgba(168, 85, 247, 0.35), inset 0 1px 0 rgba(255,255,255,0.30)",
                      }}
                    >
                      {user.email?.[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold" style={{ color: "#2a1f4a" }}>Dashboard</span>
                  </motion.div>
                </Link>
                <button
                  onClick={() => signOut()}
                  title="Logout"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-[rgba(168,85,247,0.08)]"
                  style={{ color: "#5b4d7e" }}
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <Link to="/login">
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold"
                  style={{
                    background: "rgba(245, 242, 250, 0.85)",
                    border: "1px solid rgba(120, 100, 180, 0.14)",
                    color: "#5b4d7e",
                  }}
                >
                  <LogIn size={14} /> Login
                </motion.button>
              </Link>
            )}

            {/* CTA — Quote */}
            <Link to="/get-quote">
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                className="relative flex items-center gap-1.5 pl-3 pr-4 py-2 rounded-full text-sm font-bold text-white overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #a855f7 55%, #ec4899)",
                  boxShadow: "0 6px 20px rgba(168, 85, 247, 0.40), inset 0 1px 0 rgba(255,255,255,0.25)",
                }}
              >
                <span
                  className="absolute inset-0 opacity-50 pointer-events-none"
                  style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.22), transparent 55%)" }}
                />
                <Sparkles size={14} className="relative" />
                <span className="relative">Quote</span>
              </motion.button>
            </Link>
          </div>

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
