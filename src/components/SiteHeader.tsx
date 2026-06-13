import { useState, useRef, useEffect } from "react";
import {
  Menu, X, ChevronRight, ChevronDown, LogIn, LogOut, Search,
  Globe, Wrench, Palette, Facebook, TrendingUp, Building2, Sparkles,
  FileText, Receipt, FolderOpen, User as UserIcon, Flame, MessageCircle,
  Briefcase, Phone, Shield, BadgeCheck,
} from "lucide-react";
import logoAsset from "@/assets/shahed-it-logo-v3.png.asset.json";
const logoFallback = logoAsset.url;
import { supabase } from "@/integrations/supabase/client";
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
  { label: "Web Development", href: "/services/web-development", icon: Globe, img: catWebDev, accent: "270 92% 65%" },
  { label: "Website Maintenance", href: "/services/website-maintenance", icon: Wrench, img: catMaintenance, accent: "210 90% 65%" },
  { label: "Graphics Design", href: "/services/graphics-design", icon: Palette, img: catGraphics, accent: "320 90% 65%" },
  { label: "Facebook Services", href: "/services/facebook-services", icon: Facebook, img: catFacebook, accent: "220 95% 65%" },
  { label: "Digital Marketing", href: "/services/digital-marketing", icon: TrendingUp, img: catDigitalMarketing, accent: "150 80% 55%" },
  { label: "Business Solutions", href: "/services/business-solutions", icon: Building2, img: catBusiness, accent: "42 95% 60%" },
];

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services", hasDropdown: true },
  { label: "Category", href: "/services" },
  { label: "Blog", href: "/blog" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

const SiteHeader = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>(logoFallback);

  useEffect(() => {
    let active = true;
    supabase.from("site_settings").select("value").eq("key", "logo_url").maybeSingle()
      .then(({ data }) => {
        if (active && data?.value && data.value.trim()) setLogoUrl(data.value);
      });
    return () => { active = false; };
  }, []);

  const [searchOpen, setSearchOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const servicesTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drawerRef = useRef<HTMLElement | null>(null);
  const searchModalRef = useRef<HTMLDivElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const searchTriggerRef = useRef<HTMLButtonElement | null>(null);

  const isActive = (href: string) => location.pathname === href;
  const activeKey = navLinks.find(l => isActive(l.href))?.label || (servicesOpen ? "Services" : null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while mobile drawer or search modal is open (iOS-safe)
  useEffect(() => {
    const lock = mobileOpen || searchOpen;
    if (!lock) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;

    const prev = {
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyOverflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
      htmlOverscroll: (html.style as any).overscrollBehavior,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    (html.style as any).overscrollBehavior = "none";

    // Block touch scroll on background; allow inside elements with [data-scroll-lock-allow]
    const onTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const scrollable = target.closest('[data-scroll-lock-allow]') as HTMLElement | null;
      if (!scrollable) {
        e.preventDefault();
        return;
      }
      const { scrollTop, scrollHeight, clientHeight } = scrollable;
      const atTop = scrollTop <= 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight;
      // Prevent rubber-band at edges
      if ((atTop && (e as any).touches?.[0] && scrollable.dataset._lastY !== undefined)) {
        // no-op; rely on overscroll-contain
      }
      if (atTop || atBottom) {
        // Let overscroll-behavior handle it; only stop if it would scroll the page
        if (scrollHeight <= clientHeight) e.preventDefault();
      }
    };
    document.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      document.removeEventListener("touchmove", onTouchMove);
      body.style.position = prev.bodyPosition;
      body.style.top = prev.bodyTop;
      body.style.left = prev.bodyLeft;
      body.style.right = prev.bodyRight;
      body.style.width = prev.bodyWidth;
      body.style.overflow = prev.bodyOverflow;
      html.style.overflow = prev.htmlOverflow;
      (html.style as any).overscrollBehavior = prev.htmlOverscroll ?? "";
      window.scrollTo(0, scrollY);
    };
  }, [mobileOpen, searchOpen]);

  // Keyboard: Escape to close + focus trap (Tab cycles within drawer/modal)
  useEffect(() => {
    if (!mobileOpen && !searchOpen) return;

    const container: HTMLElement | null =
      mobileOpen ? drawerRef.current : searchModalRef.current;
    const trigger: HTMLButtonElement | null =
      mobileOpen ? menuTriggerRef.current : searchTriggerRef.current;

    const getFocusables = () =>
      container
        ? Array.from(
            container.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
          )
        : [];

    const t = window.setTimeout(() => {
      const f = getFocusables();
      (f[0] ?? container)?.focus();
    }, 60);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        if (mobileOpen) setMobileOpen(false);
        if (searchOpen) setSearchOpen(false);
        return;
      }
      if (e.key !== "Tab" || !container) return;
      const focusables = getFocusables();
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus?.();
    };
  }, [mobileOpen, searchOpen]);


  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 90, damping: 18 }}
      className="sticky top-0 z-50 lg:px-0 px-3 lg:pt-0 pt-2"
    >
      <div
        className="relative transition-all duration-300 lg:rounded-none rounded-full lg:border-x-0"
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

        <div className="container mx-auto px-2.5 sm:px-3 md:px-4 lg:px-6 py-1.5 sm:py-2 md:py-3 flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-5 relative min-w-0">
          {/* ── Logo ── */}
          <Link
            to="/"
            className="shrink-0 min-w-0 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:static lg:translate-x-0 lg:translate-y-0 pointer-events-auto"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 group min-w-0">
              <div className="relative shrink-0 w-10 h-10 sm:w-11 sm:h-11 md:w-14 md:h-14">
                {/* Outer glow halo matching the gradient border */}
                <motion.div
                  aria-hidden
                  className="absolute -inset-1.5 rounded-[18px] opacity-70 blur-lg pointer-events-none"
                  style={{ background: "linear-gradient(135deg, #fb923c 0%, #ec4899 50%, #a855f7 100%)" }}
                  animate={{ opacity: [0.5, 0.85, 0.5] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Gradient border frame (orange → pink → purple) */}
                <div
                  className="relative w-full h-full rounded-[14px] p-[2px] overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #fb923c 0%, #f43f5e 45%, #a855f7 100%)" }}
                >
                  {/* Inner white tile */}
                  <div className="relative w-full h-full rounded-[12px] bg-white flex items-center justify-center overflow-hidden">
                    {/* Shine sweep */}
                    <motion.span
                      aria-hidden
                      className="absolute top-0 -left-1/2 w-1/2 h-full pointer-events-none"
                      style={{ background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.7) 50%, transparent 70%)", filter: "blur(2px)" }}
                      animate={{ x: ["0%", "320%"] }}
                      transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.4 }}
                    />
                    <motion.img
                      src={logoUrl}
                      alt="Shahed IT"
                      className="relative w-[78%] h-[78%] object-contain"
                      animate={{ y: [0, -1.5, 0] }}
                      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col leading-[1.0] min-w-0 gap-0.5">
                <span
                  className="text-[14px] sm:text-[17px] md:text-[21px] font-bold tracking-tight whitespace-nowrap uppercase"
                  style={{
                    fontFamily: "'Saira', sans-serif",
                    fontWeight: 900,
                    letterSpacing: "0.02em",
                    background: "linear-gradient(135deg, #ffffff 0%, #e9d5ff 35%, #c4b5fd 60%, #f0abfc 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0 0 12px rgba(192,132,252,0.45))",
                  }}
                >
                  SHAHED{"\u00a0"}
                  <span style={{ background: "linear-gradient(135deg, #a78bfa 0%, #f0abfc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    IT
                  </span>
                </span>
                <span
                  className="hidden xs:flex items-center font-semibold whitespace-nowrap"
                  style={{
                    fontFamily: "'Saira', sans-serif",
                    fontSize: "clamp(7px, 0.9vw, 9px)",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                  }}
                >
                  <span
                    style={{
                      background: "linear-gradient(90deg, #c4b5fd 0%, #f0abfc 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Smart IT Solution
                  </span>
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
          <div className="hidden lg:flex items-center gap-2 shrink-0 ml-auto xl:ml-0">
            {authLoading ? (
              <div className="h-9 w-32 rounded-full bg-white/5 animate-pulse" />
            ) : user ? (
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

          {/* Mobile actions */}
          <div className="lg:hidden ml-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
            <motion.button
              ref={searchTriggerRef as any}
              whileTap={{ scale: 0.92 }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.18), rgba(236,72,153,0.14))",
                border: "1px solid rgba(168, 85, 247, 0.40)",
                color: "#f0abfc",
                boxShadow: "0 4px 14px rgba(168, 85, 247, 0.30), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
              onClick={() => setSearchOpen(true)}
              aria-label={searchOpen ? "Close search" : "Open search"}
              aria-haspopup="dialog"
              aria-expanded={searchOpen}
              aria-controls="mobile-search-dialog"
            >
              <Search size={16} className="sm:hidden" />
              <Search size={17} className="hidden sm:block" />
            </motion.button>
            <motion.button
              ref={menuTriggerRef as any}
              whileTap={{ scale: 0.92 }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white shrink-0"
              style={{
                background: mobileOpen
                  ? "linear-gradient(135deg, #6366f1, #a855f7 55%, #ec4899)"
                  : "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(168, 85, 247, 0.35)",
                boxShadow: mobileOpen
                  ? "0 6px 18px rgba(168, 85, 247, 0.45), inset 0 1px 0 rgba(255,255,255,0.20)"
                  : "inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-haspopup="dialog"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-drawer"
            >
              {mobileOpen ? <X size={17} /> : <Menu size={17} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* ───── Mobile Search Modal ───── */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-[60] bg-black/70 backdrop-blur-md"
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              ref={searchModalRef}
              role="dialog"
              aria-modal="true"
              aria-label="Search the website"
              id="mobile-search-dialog"
              tabIndex={-1}
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden fixed left-3 right-3 top-4 z-[61] rounded-3xl overflow-hidden focus:outline-none"
              style={{
                background: "linear-gradient(180deg, rgba(16, 11, 38, 0.98), rgba(22, 14, 52, 0.98))",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
                border: "1px solid rgba(168, 85, 247, 0.30)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.60), 0 0 0 1px rgba(168,85,247,0.12), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.7), rgba(168,85,247,0.95), rgba(236,72,153,0.7), transparent)" }} />
              <div className="flex items-center gap-2 p-3">
                <div className="flex-1 min-w-0">
                  <SmartSearch variant="mobile" onNavigate={() => setSearchOpen(false)} />
                </div>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(168, 85, 247, 0.35)",
                  }}
                  aria-label="Close search dialog"
                >
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ───── Mobile Drawer (Premium Side Sheet) ───── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden fixed inset-0 z-40"
              style={{
                background: "radial-gradient(ellipse at top right, rgba(168,85,247,0.25), rgba(0,0,0,0.78) 60%)",
                backdropFilter: "blur(10px) saturate(150%)",
                WebkitBackdropFilter: "blur(10px) saturate(150%)",
              }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Side Sheet */}
            <motion.aside
              ref={drawerRef as any}
              role="dialog"
              aria-modal="true"
              aria-label="Main navigation menu"
              id="mobile-nav-drawer"
              tabIndex={-1}
              initial={{ x: "100%", opacity: 0.6 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.4 }}
              transition={{ type: "spring", stiffness: 320, damping: 36 }}
              className="lg:hidden fixed top-0 right-0 bottom-0 z-50 w-[88%] max-w-[400px] flex flex-col overflow-hidden focus:outline-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(14, 9, 32, 0.97) 0%, rgba(20, 12, 48, 0.97) 50%, rgba(14, 9, 32, 0.98) 100%)",
                backdropFilter: "blur(28px) saturate(180%)",
                WebkitBackdropFilter: "blur(28px) saturate(180%)",
                borderLeft: "1px solid rgba(168, 85, 247, 0.35)",
                boxShadow: "-24px 0 60px rgba(0,0,0,0.65), inset 1px 0 0 rgba(255,255,255,0.06)",
              }}
            >
              {/* Aurora ambient blobs */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                  className="absolute -top-24 -right-16 w-72 h-72 rounded-full blur-3xl opacity-40"
                  style={{ background: "radial-gradient(circle, #a855f7, transparent 70%)" }}
                  animate={{ scale: [1, 1.15, 1], rotate: [0, 30, 0] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute -bottom-20 -left-12 w-64 h-64 rounded-full blur-3xl opacity-30"
                  style={{ background: "radial-gradient(circle, #ec4899, transparent 70%)" }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              {/* Aurora left edge */}
              <div
                className="absolute top-0 bottom-0 left-0 w-px pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, transparent, rgba(99,102,241,0.6) 20%, rgba(168,85,247,0.95) 50%, rgba(236,72,153,0.6) 80%, transparent)",
                }}
              />

              {/* ── Sticky Header ── */}
              <div
                className="relative shrink-0 px-4 pt-4 pb-3 flex items-center justify-between"
                style={{
                  background: "linear-gradient(180deg, rgba(20,14,44,0.85), rgba(20,14,44,0.0))",
                  borderBottom: "1px solid rgba(168,85,247,0.18)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <motion.div
                      className="absolute -inset-1 rounded-xl opacity-70 blur-md"
                      style={{ background: "conic-gradient(from 0deg, #6366f1, #a855f7, #ec4899, #6366f1)" }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                    <div
                      className="relative w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden"
                      style={{
                        background: "linear-gradient(135deg, #1a1233, #251847)",
                        border: "1px solid rgba(168, 85, 247, 0.45)",
                      }}
                    >
                      <img src={logoUrl} alt="Shahed IT" className="w-7 h-7 object-contain" />
                    </div>
                  </div>
                  <div className="leading-tight">
                    <div className="text-[14px] font-extrabold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                      Shahed <span style={{ background: "linear-gradient(135deg, #818cf8, #f0abfc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>IT</span>
                    </div>
                    <div className="text-[8px] uppercase tracking-[0.22em] font-bold" style={{ color: "#a78bfa" }}>
                      Premium Menu
                    </div>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9, rotate: 90 }}
                  onClick={() => setMobileOpen(false)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                  style={{
                    background: "linear-gradient(135deg, rgba(244,63,94,0.18), rgba(168,85,247,0.18))",
                    border: "1px solid rgba(168,85,247,0.40)",
                    boxShadow: "0 4px 14px rgba(168,85,247,0.25), inset 0 1px 0 rgba(255,255,255,0.10)",
                  }}
                  aria-label="Close navigation menu"
                >
                  <X size={16} />
                </motion.button>
              </div>

              {/* ── Scrollable body ── */}
              <div
                data-scroll-lock-allow
                className="relative flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4"
                style={{ scrollbarWidth: "thin", WebkitOverflowScrolling: "touch" }}
              >
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } } }}
                  className="space-y-4"
                >
                  {/* Welcome / Login Card */}
                  <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
                    {user ? (
                      <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                        <div
                          className="relative rounded-2xl p-4 overflow-hidden"
                          style={{
                            background: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 45%, #c026d3 100%)",
                            boxShadow: "0 14px 32px rgba(124,58,237,0.50), inset 0 1px 0 rgba(255,255,255,0.20)",
                          }}
                        >
                          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full opacity-35 blur-2xl" style={{ background: "radial-gradient(circle, #f0abfc, transparent 70%)" }} />
                          <div className="absolute inset-0 opacity-25 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.30), transparent 50%)" }} />
                          <div className="relative flex items-center gap-3">
                            {(() => {
                              const meta: any = (user as any)?.user_metadata ?? {};
                              const avatarUrl = meta.avatar_url || meta.picture;
                              const fullName = meta.full_name || meta.name || user.email?.split("@")[0];
                              const initial = (fullName?.[0] || "U").toUpperCase();
                              return avatarUrl ? (
                                <img src={avatarUrl} alt={fullName} referrerPolicy="no-referrer" className="w-14 h-14 rounded-full object-cover" style={{ boxShadow: "0 0 0 3px rgba(255,255,255,0.35)" }} />
                              ) : (
                                <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black text-white" style={{ background: "linear-gradient(135deg, #ec4899, #6366f1)", boxShadow: "0 0 0 3px rgba(255,255,255,0.35)" }}>
                                  {initial}
                                </div>
                              );
                            })()}
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-white/80 flex items-center gap-1">
                                Welcome Back <Sparkles size={9} />
                              </div>
                              <div className="text-base font-extrabold text-white truncate flex items-center gap-1.5">
                                {(user as any)?.user_metadata?.full_name || user.email?.split("@")[0]}
                                <BadgeCheck size={14} className="text-cyan-300" />
                              </div>
                              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-200" style={{ background: "rgba(0,0,0,0.30)", border: "1px solid rgba(251,191,36,0.45)" }}>
                                <Sparkles size={9} /> Premium Client
                              </span>
                            </div>
                            <ChevronRight size={18} className="text-white/85" />
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <Link to="/login" onClick={() => setMobileOpen(false)}>
                        <div
                          className="relative rounded-2xl p-4 overflow-hidden flex items-center gap-3"
                          style={{
                            background: "linear-gradient(135deg, #4c1d95, #7c3aed 55%, #c026d3)",
                            boxShadow: "0 14px 32px rgba(124,58,237,0.50), inset 0 1px 0 rgba(255,255,255,0.20)",
                          }}
                        >
                          <div className="absolute inset-0 opacity-25 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.30), transparent 50%)" }} />
                          <div className="relative w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.20)", border: "1px solid rgba(255,255,255,0.25)" }}>
                            <LogIn size={20} className="text-white" />
                          </div>
                          <div className="relative flex-1">
                            <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-white/80">Get Started</div>
                            <div className="text-base font-extrabold text-white">Login / Sign Up</div>
                          </div>
                          <ChevronRight size={18} className="text-white/85 relative" />
                        </div>
                      </Link>
                    )}
                  </motion.div>

                  {/* Quick Tiles */}
                  <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: "Quotes", icon: FileText, to: "/dashboard?tab=quote", grad: "linear-gradient(135deg, #6366f1, #4338ca)" },
                        { label: "Payments", icon: Receipt, to: "/dashboard?tab=payment", grad: "linear-gradient(135deg, #10b981, #059669)" },
                        { label: "Documents", icon: FolderOpen, to: "/dashboard?tab=docs", grad: "linear-gradient(135deg, #ec4899, #be185d)" },
                        { label: "Profile", icon: UserIcon, to: "/dashboard?tab=profile", grad: "linear-gradient(135deg, #f59e0b, #d97706)" },
                      ].map((t) => (
                        <Link key={t.label} to={t.to} onClick={() => setMobileOpen(false)}>
                          <motion.div
                            whileTap={{ scale: 0.94 }}
                            className="rounded-2xl p-2.5 flex flex-col items-center gap-1.5 h-full"
                            style={{
                              background: "rgba(255,255,255,0.045)",
                              border: "1px solid rgba(255,255,255,0.09)",
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                            }}
                          >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: t.grad, boxShadow: "0 6px 14px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.25)" }}>
                              <t.icon size={16} />
                            </div>
                            <span className="text-[10px] font-bold text-white/85 text-center leading-tight">{t.label}</span>
                          </motion.div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>

                  {/* Promo Cards */}
                  <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
                    <div className="grid grid-cols-2 gap-2.5">
                      <Link to="/pricing" onClick={() => setMobileOpen(false)}>
                        <motion.div whileTap={{ scale: 0.96 }} className="relative rounded-2xl p-3 overflow-hidden h-full" style={{ background: "linear-gradient(135deg, #f97316, #dc2626)", boxShadow: "0 12px 26px rgba(249,115,22,0.45), inset 0 1px 0 rgba(255,255,255,0.20)" }}>
                          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-xl opacity-50" style={{ background: "radial-gradient(circle, #fde68a, transparent 70%)" }} />
                          <div className="relative flex items-center gap-1.5">
                            <Flame size={14} className="text-amber-200" />
                            <span className="text-[10px] font-black text-white uppercase tracking-wider">Hot Deals</span>
                          </div>
                          <div className="relative text-base font-extrabold text-white mt-1.5 leading-tight">Up to 50% OFF</div>
                          <div className="relative text-[11px] text-white/85 mt-0.5">প্যাকেজ দেখুন →</div>
                        </motion.div>
                      </Link>
                      <a href="https://wa.me/8801820060046" target="_blank" rel="noopener noreferrer">
                        <motion.div whileTap={{ scale: 0.96 }} className="relative rounded-2xl p-3 overflow-hidden h-full" style={{ background: "linear-gradient(135deg, #10b981, #047857)", boxShadow: "0 12px 26px rgba(16,185,129,0.45), inset 0 1px 0 rgba(255,255,255,0.20)" }}>
                          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-xl opacity-50" style={{ background: "radial-gradient(circle, #a7f3d0, transparent 70%)" }} />
                          <div className="relative flex items-center gap-1.5">
                            <MessageCircle size={14} className="text-emerald-100" />
                            <span className="text-[10px] font-black text-white uppercase tracking-wider">Live 24/7</span>
                          </div>
                          <div className="relative text-base font-extrabold text-white mt-1.5 leading-tight">সাহায্য নিন</div>
                          <div className="relative text-[11px] text-white/85 mt-0.5">WhatsApp চ্যাট →</div>
                        </motion.div>
                      </a>
                    </div>
                  </motion.div>

                  {/* Trending Categories */}
                  <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.40))" }} />
                      <Sparkles size={11} style={{ color: "#f0abfc" }} />
                      <span className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: "#c4b5fd" }}>Trending</span>
                      <Sparkles size={11} style={{ color: "#f0abfc" }} />
                      <span className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(168,85,247,0.40), transparent)" }} />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
                      {serviceCategories.map((cat) => (
                        <Link key={cat.label} to={cat.href} onClick={() => setMobileOpen(false)} className="shrink-0">
                          <div className="flex items-center gap-2 px-3 py-2 rounded-full whitespace-nowrap" style={{ background: `linear-gradient(135deg, hsl(${cat.accent} / 0.14), rgba(255,255,255,0.04))`, border: `1px solid hsl(${cat.accent} / 0.40)`, boxShadow: `0 4px 12px hsl(${cat.accent} / 0.20)` }}>
                            <cat.icon size={13} style={{ color: `hsl(${cat.accent})` }} />
                            <span className="text-xs font-semibold text-white">{cat.label}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>

                  {/* Navigation Section */}
                  <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.40))" }} />
                      <Sparkles size={11} style={{ color: "#a78bfa" }} />
                      <span className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: "#c4b5fd" }}>Navigation</span>
                      <Sparkles size={11} style={{ color: "#a78bfa" }} />
                      <span className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(168,85,247,0.40), transparent)" }} />
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { label: "Home", to: "/", icon: Globe, grad: "linear-gradient(135deg, #f59e0b, #ea580c)" },
                        { label: "Services", to: "/services", icon: Briefcase, grad: "linear-gradient(135deg, #3b82f6, #1d4ed8)" },
                        { label: "Category", to: "/services", icon: FolderOpen, grad: "linear-gradient(135deg, #f59e0b, #d97706)" },
                        { label: "Blog", to: "/blog", icon: FileText, grad: "linear-gradient(135deg, #a855f7, #7e22ce)" },
                        { label: "Pricing", to: "/pricing", icon: Receipt, grad: "linear-gradient(135deg, #6366f1, #4338ca)" },
                        { label: "Contact", to: "/contact", icon: Phone, grad: "linear-gradient(135deg, #14b8a6, #0d9488)" },
                      ].map((item) => {
                        const active = isActive(item.to);
                        return (
                          <Link key={item.label} to={item.to} onClick={() => setMobileOpen(false)}>
                            <motion.div
                              whileTap={{ scale: 0.97 }}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl relative overflow-hidden"
                              style={{
                                background: active
                                  ? "linear-gradient(135deg, rgba(168,85,247,0.22), rgba(236,72,153,0.14))"
                                  : "rgba(255,255,255,0.04)",
                                border: `1px solid ${active ? "rgba(168,85,247,0.50)" : "rgba(255,255,255,0.07)"}`,
                                boxShadow: active ? "0 6px 18px rgba(168,85,247,0.25), inset 0 1px 0 rgba(255,255,255,0.06)" : "inset 0 1px 0 rgba(255,255,255,0.04)",
                              }}
                            >
                              {active && (
                                <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r" style={{ background: "linear-gradient(180deg, #a855f7, #ec4899)" }} />
                              )}
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: item.grad, boxShadow: "0 4px 12px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.20)" }}>
                                <item.icon size={15} />
                              </div>
                              <span className="text-sm font-bold text-white flex-1">{item.label}</span>
                              {active && (
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background: "rgba(168,85,247,0.30)", color: "#f0abfc", border: "1px solid rgba(168,85,247,0.50)" }}>NOW</span>
                              )}
                              <ChevronRight size={14} style={{ color: active ? "#f0abfc" : "#c4b5fd" }} />
                            </motion.div>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>

                  {user?.email === "info.shahedit@gmail.com" && (
                    <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
                      <Link to="/ceo" onClick={() => setMobileOpen(false)}>
                        <div
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-sm font-extrabold text-white"
                          style={{
                            background: "linear-gradient(135deg, #1e293b, #334155)",
                            border: "1px solid rgba(168,85,247,0.40)",
                            boxShadow: "0 6px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.10)",
                          }}
                        >
                          <Shield size={14} className="text-purple-300" /> Admin Panel
                        </div>
                      </Link>
                    </motion.div>
                  )}

                  {/* Spacer for sticky footer overlap */}
                  <div className="h-2" />
                </motion.div>
              </div>

              {/* ── Sticky Footer ── */}
              <div
                className="relative shrink-0 px-4 pt-3 pb-4 grid grid-cols-2 gap-2"
                style={{
                  background: "linear-gradient(180deg, rgba(20,14,44,0.0), rgba(14,9,32,0.95) 40%)",
                  borderTop: "1px solid rgba(168,85,247,0.20)",
                }}
              >
                <Link to="/get-quote" onClick={() => setMobileOpen(false)}>
                  <motion.div
                    whileTap={{ scale: 0.96 }}
                    className="relative flex items-center justify-center gap-1.5 py-3 rounded-full text-sm font-extrabold text-white overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, #6366f1, #a855f7 55%, #ec4899)",
                      boxShadow: "0 12px 28px rgba(168, 85, 247, 0.55), inset 0 1px 0 rgba(255,255,255,0.30)",
                    }}
                  >
                    <span
                      className="absolute inset-y-0 -left-full w-1/2 opacity-70 pointer-events-none"
                      style={{
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
                        animation: "header-shimmer 2.8s ease-in-out infinite",
                      }}
                    />
                    <Sparkles size={14} /> Get Quote
                  </motion.div>
                </Link>
                {user ? (
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => { signOut(); setMobileOpen(false); }}
                    className="flex items-center justify-center gap-1.5 py-3 rounded-full text-sm font-extrabold"
                    style={{
                      background: "linear-gradient(135deg, rgba(244,63,94,0.15), rgba(244,63,94,0.05))",
                      border: "1px solid rgba(244, 63, 94, 0.45)",
                      color: "#fda4af",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                    }}
                  >
                    <LogOut size={14} /> Logout
                  </motion.button>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <motion.div
                      whileTap={{ scale: 0.96 }}
                      className="flex items-center justify-center gap-1.5 py-3 rounded-full text-sm font-extrabold text-white"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.18)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                      }}
                    >
                      <LogIn size={14} /> Login
                    </motion.div>
                  </Link>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

    </motion.header>
  );
};

export default SiteHeader;
