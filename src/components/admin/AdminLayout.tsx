import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Settings, Users, Briefcase, FolderOpen, FileText,
  MessageSquare, Star, UserCheck, Building2, DollarSign, HelpCircle,
  Inbox, ChevronLeft, Menu, LogOut, Bell, Shield, Package, CreditCard,
  LayoutTemplate, Search, TrendingUp, Sparkles, Globe, Tag, Mail,
  History, BarChart3, ArrowLeftRight, ChevronDown, Crown, ExternalLink,
  Zap, RefreshCcw, Image as ImageIcon, FolderTree, BookOpen, ListChecks,
  Receipt, TrendingDown, ClipboardList, X, ChevronRight, Command, Wallet, Database, Gift,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import BrandMark from "@/components/BrandMark";
import AdminHeroHeader from "@/components/admin/AdminHeroHeader";

import { canAccess, type AdminSection } from "@/lib/admin-permissions";

type NavItem = { label: string; icon: any; href: string; badge?: string; section: AdminSection };
type NavGroup = { title: string; icon: any; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/ceo", section: "dashboard" },
    ],
  },
  {
    title: "Sales",
    icon: Inbox,
    items: [
      { label: "Orders", icon: Package, href: "/ceo/orders", section: "orders" },
      { label: "Payments", icon: CreditCard, href: "/ceo/payments", section: "payments" },
      { label: "Wallets", icon: Wallet, href: "/ceo/wallets", badge: "NEW", section: "wallets" },
      { label: "bKash PGW", icon: Zap, href: "/ceo/bkash-pgw", badge: "NEW", section: "payments" },
      { label: "Leads", icon: Inbox, href: "/ceo/leads", section: "leads" },
      { label: "Refund Requests", icon: RefreshCcw, href: "/ceo/refunds", badge: "NEW", section: "refunds" },
      { label: "Coupons", icon: Tag, href: "/ceo/coupons", badge: "NEW", section: "coupons" },
      { label: "Invoices", icon: Receipt, href: "/ceo/invoices", badge: "NEW", section: "invoices" },
      { label: "Custom Order", icon: ClipboardList, href: "/ceo/custom-order", badge: "NEW", section: "custom-order" },
      { label: "Quotations", icon: FileText, href: "/ceo/quotations", badge: "NEW", section: "quotations" },
    ],
  },
  {
    title: "Catalog",
    icon: Briefcase,
    items: [
      { label: "Products", icon: Package, href: "/ceo/service-packages", badge: "NEW", section: "service-packages" },
      { label: "Categories", icon: FolderTree, href: "/ceo/categories", badge: "NEW", section: "categories" },
      { label: "Pricing", icon: DollarSign, href: "/ceo/pricing", section: "pricing" },
      { label: "Portfolio", icon: FolderOpen, href: "/ceo/portfolio", section: "portfolio" },
      { label: "Digital Files", icon: Database, href: "/ceo/digital-files", badge: "NEW", section: "digital-files" },
    ],
  },
  {
    title: "Customers",
    icon: Users,
    items: [
      { label: "All Customers", icon: Users, href: "/ceo/customers", badge: "NEW", section: "customers" },
      { label: "Admin Users", icon: Shield, href: "/ceo/users", section: "users" },
      { label: "Staff Management", icon: Users, href: "/ceo/staff-management", badge: "NEW", section: "staff-management" },
    ],
  },
  {
    title: "Storefront",
    icon: LayoutTemplate,
    items: [
      { label: "Pages", icon: LayoutTemplate, href: "/ceo/website-cms", badge: "NEW", section: "website-cms" },
      { label: "Footer Settings", icon: LayoutTemplate, href: "/ceo/footer", section: "footer" },
      { label: "Hero Banner", icon: LayoutTemplate, href: "/ceo/banners", badge: "NEW", section: "banners" },
      { label: "Popup Banner", icon: ImageIcon, href: "/ceo/welcome-popups", badge: "NEW", section: "welcome-popups" },
      { label: "Testimonials", icon: Star, href: "/ceo/testimonials", section: "testimonials" },
      { label: "Clients", icon: Building2, href: "/ceo/clients", section: "clients" },
      { label: "Team", icon: UserCheck, href: "/ceo/team", section: "team" },
      { label: "Careers", icon: Users, href: "/ceo/careers", section: "careers" },
    ],
  },
  {
    title: "Marketing",
    icon: Megaphone,
    items: [
      { label: "Offers & Giveaways", icon: Gift, href: "/ceo/offers", badge: "NEW", section: "offers" },
      { label: "Email Campaigns", icon: Mail, href: "/ceo/campaigns", badge: "NEW", section: "campaigns" },
      { label: "AI Writer", icon: Sparkles, href: "/ceo/ai-writer", badge: "AI", section: "ai-writer" },
      { label: "Reviews", icon: Star, href: "/ceo/reviews", badge: "NEW", section: "reviews" },
    ],
  },
  {
    title: "Content & SEO",
    icon: FileText,
    items: [
      { label: "Blog Posts", icon: FileText, href: "/ceo/blog", section: "blog" },
      { label: "Blog Categories", icon: FolderTree, href: "/ceo/blog-categories", section: "blog-categories" },
      { label: "Media Library", icon: ImageIcon, href: "/ceo/media", badge: "NEW", section: "media" },
      { label: "FAQ", icon: HelpCircle, href: "/ceo/faq", section: "faq" },
      { label: "Tech Stack", icon: Sparkles, href: "/ceo/tech-details", badge: "NEW", section: "tech-details" },
      { label: "SEO Manager", icon: Search, href: "/ceo/seo-panel", badge: "HUB", section: "seo-panel" },
      { label: "Ranking Setup (All Google)", icon: Globe, href: "/ceo/ranking-setup", badge: "NEW", section: "ranking-setup" },
      { label: "SEO Tools & Reports", icon: BarChart3, href: "/ceo/seo-tools", badge: "NEW", section: "seo-tools" },
      { label: "Sitemap & Robots", icon: Globe, href: "/ceo/sitemap", badge: "NEW", section: "sitemap" },
      { label: "Schema Builder", icon: Zap, href: "/ceo/schema", badge: "NEW", section: "schema" },
      { label: "Redirects (301)", icon: ArrowLeftRight, href: "/ceo/redirects", badge: "NEW", section: "redirects" },
      { label: "Popular Searches", icon: TrendingUp, href: "/ceo/popular-searches", section: "popular-searches" },
    ],
  },
  {
    title: "Reports",
    icon: BarChart3,
    items: [
      { label: "Analytics", icon: BarChart3, href: "/ceo/analytics", badge: "NEW", section: "analytics" },
      { label: "Reports", icon: TrendingUp, href: "/ceo/reports", badge: "NEW", section: "reports" },
    ],
  },
  {
    title: "AI Tools",
    icon: Sparkles,
    items: [
      { label: "AI Support", icon: MessageSquare, href: "/ceo/ai-support", section: "ai-support" },
      { label: "AI Providers", icon: Sparkles, href: "/ceo/ai-providers", badge: "NEW", section: "ai-providers" },
    ],
  },
  {
    title: "System",
    icon: Settings,
    items: [
      { label: "Site Settings", icon: Settings, href: "/ceo/settings", section: "settings" },
      { label: "Backup & Restore", icon: Database, href: "/ceo/backup", badge: "NEW", section: "backup" },
      { label: "Security Audit", icon: Shield, href: "/ceo/security-audit", badge: "NEW", section: "security-audit" },
      { label: "Advanced Tools", icon: Sparkles, href: "/ceo/advanced-tools", badge: "NEW", section: "advanced-tools" },
      { label: "Copy Protection", icon: Shield, href: "/ceo/copy-protection", badge: "NEW", section: "copy-protection" },
    ],
  },
];

// Colorful gradient palette for per-item icon tiles (inspired by the reference design).
const TILE_GRADIENTS = [
  "from-rose-500 to-pink-500",
  "from-fuchsia-500 to-purple-600",
  "from-violet-500 to-indigo-600",
  "from-indigo-500 to-blue-600",
  "from-sky-500 to-cyan-500",
  "from-cyan-500 to-teal-500",
  "from-teal-500 to-emerald-500",
  "from-emerald-500 to-green-500",
  "from-lime-500 to-green-500",
  "from-amber-500 to-orange-500",
  "from-orange-500 to-red-500",
  "from-pink-500 to-rose-600",
  "from-purple-500 to-fuchsia-600",
  "from-blue-500 to-violet-600",
  "from-yellow-500 to-amber-600",
];
const tileGradient = (href: string) => {
  let h = 0;
  for (let i = 0; i < href.length; i++) h = (h * 31 + href.charCodeAt(i)) >>> 0;
  return TILE_GRADIENTS[h % TILE_GRADIENTS.length];
};

const ADMIN_SIDEBAR_SCROLL_KEY = "admin:sidebarScroll";


interface AdminLayoutProps { children: React.ReactNode }

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return sessionStorage.getItem("admin:collapsed") === "1"; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(sessionStorage.getItem("admin:openGroups") || "{}"); } catch { return {}; }
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [query, setQuery] = useState("");
  const [aiResults, setAiResults] = useState<Array<{ href: string; label: string; reason: string }>>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const { user, role, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const initializedGroups = useRef(false);
  const sidebarScrollRef = useRef<HTMLElement | null>(null);
  const mainScrollRef = useRef<HTMLElement | null>(null);

  const persistSidebarScroll = () => {
    const el = sidebarScrollRef.current;
    if (!el) return;
    try { sessionStorage.setItem(ADMIN_SIDEBAR_SCROLL_KEY, String(el.scrollTop)); } catch {}
  };

  const restoreSidebarScroll = () => {
    const el = sidebarScrollRef.current;
    if (!el) return;
    try {
      const saved = Number(sessionStorage.getItem(ADMIN_SIDEBAR_SCROLL_KEY) || "0");
      if (Number.isFinite(saved)) el.scrollTop = saved;
    } catch {}
  };

  // Persist sidebar UI state
  useEffect(() => {
    try { sessionStorage.setItem("admin:collapsed", collapsed ? "1" : "0"); } catch {}
  }, [collapsed]);
  useEffect(() => {
    try { sessionStorage.setItem("admin:openGroups", JSON.stringify(openGroups)); } catch {}
  }, [openGroups]);

  // Restore sidebar scroll across route changes (only run once on mount)
  useEffect(() => {
    const el = sidebarScrollRef.current;
    if (!el) return;
    restoreSidebarScroll();
    const onScroll = () => {
      try { sessionStorage.setItem(ADMIN_SIDEBAR_SCROLL_KEY, String(el.scrollTop)); } catch {}
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      onScroll();
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(restoreSidebarScroll);
    return () => cancelAnimationFrame(frame);
  }, [location.pathname]);

  // Save main scroll per route; restore on revisit
  useEffect(() => {
    const el = mainScrollRef.current;
    if (!el) return;
    const key = `admin:scroll:${location.pathname}`;
    const saved = Number(sessionStorage.getItem(key) || "0");
    el.scrollTop = saved;
    const onScroll = () => {
      try { sessionStorage.setItem(key, String(el.scrollTop)); } catch {}
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [location.pathname]);



  const visibleGroups = useMemo(
    () =>
      navGroups
        .map((g) => ({ ...g, items: g.items.filter((it) => canAccess(role, it.section)) }))
        .filter((g) => g.items.length > 0),
    [role]
  );

  // Filtered groups for sidebar search
  const filteredGroups = useMemo(() => {
    if (!query.trim()) return visibleGroups;
    const q = query.toLowerCase();
    return visibleGroups
      .map((g) => ({ ...g, items: g.items.filter((it) => it.label.toLowerCase().includes(q)) }))
      .filter((g) => g.items.length > 0);
  }, [visibleGroups, query]);

  // AI fallback search — when local filter finds nothing, ask the model
  const noLocalMatch = query.trim().length >= 2 && filteredGroups.length === 0;
  useEffect(() => {
    if (!noLocalMatch) {
      setAiResults([]);
      setAiError(null);
      setAiLoading(false);
      return;
    }
    let cancelled = false;
    setAiLoading(true);
    setAiError(null);
    const handle = setTimeout(async () => {
      try {
        const items = visibleGroups.flatMap((g) =>
          g.items.map((it) => ({ label: it.label, href: it.href, group: g.title }))
        );
        const { data, error } = await supabase.functions.invoke("admin-menu-ai-search", {
          body: { query: query.trim(), items },
        });
        if (cancelled) return;
        if (error) throw error;
        if (data?.error === "rate_limited") setAiError("একটু পরে আবার চেষ্টা করুন");
        else if (data?.error === "credits_exhausted") setAiError("AI credit শেষ");
        setAiResults(Array.isArray(data?.results) ? data.results : []);
      } catch (e) {
        if (!cancelled) {
          setAiError("AI search ব্যর্থ হয়েছে");
          setAiResults([]);
        }
      } finally {
        if (!cancelled) setAiLoading(false);
      }
    }, 450);
    return () => { cancelled = true; clearTimeout(handle); };
  }, [query, noLocalMatch, visibleGroups]);

  useEffect(() => {
    if (loading || initializedGroups.current) return;
    const next: Record<string, boolean> = {};
    visibleGroups.forEach((g) => { next[g.title] = true; });
    setOpenGroups(next);
    initializedGroups.current = true;
  }, [loading, visibleGroups]);

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const [leads, pays, orders] = await Promise.all([
          supabase.from("leads").select("id,name,created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(5),
          supabase.from("payment_submissions").select("id,name,amount,status,created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(5),
          supabase.from("orders").select("id,order_number,status,created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(5),
        ]);
        const items: any[] = [];
        leads.data?.forEach((l) => items.push({ type: "lead", title: `নতুন lead: ${l.name}`, link: "/ceo/leads", time: l.created_at }));
        pays.data?.forEach((p) => items.push({ type: "payment", title: `Pending payment: ${p.name} (৳${p.amount})`, link: "/ceo/payments", time: p.created_at }));
        orders.data?.forEach((o) => items.push({ type: "order", title: `Order ${o.order_number} — ${o.status}`, link: "/ceo/orders", time: o.created_at }));
        items.sort((a, b) => +new Date(b.time) - +new Date(a.time));
        setNotifications(items.slice(0, 10));
        setUnreadCount(items.length);
      } catch { /* ignore */ }
    };
    fetchNotifs();
    const id = setInterval(fetchNotifs, 60000);
    return () => clearInterval(id);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/ceo/login");
  };

  const isItemActive = (href: string) =>
    location.pathname === href || (href !== "/ceo" && location.pathname.startsWith(href));

  const currentItem = visibleGroups.flatMap((g) => g.items).find((i) => isItemActive(i.href));
  const currentGroup = visibleGroups.find((g) => g.items.some((i) => isItemActive(i.href)));
  const currentTitle = currentItem?.label ?? "Dashboard";

  // Sidebar markup (shared between desktop + mobile drawer)
  const renderSidebarInner = (isMobile = false) => (
    <>
      {/* Brand */}
      <div className="px-4 pt-5 pb-4 flex items-center justify-between">
        <AnimatePresence mode="wait">
          {(!collapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="flex items-center gap-3"
            >
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/80 via-primary/60 to-accent/70 p-[2px] shadow-[0_8px_28px_-8px_hsl(var(--primary)/0.85)]">
                <div className="w-full h-full rounded-[14px] bg-background/80 backdrop-blur-sm flex items-center justify-center">
                  <BrandMark size={28} glow="soft" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-accent ring-2 ring-background animate-pulse" />
              </div>
              <div className="leading-tight">
                <p className="text-foreground font-bold text-[15px] font-syne tracking-tight">SHAHED STORE</p>
                <p className="text-[10px] text-primary/90 mt-0.5 flex items-center gap-1 font-medium uppercase tracking-[0.12em]">
                  <Crown size={9} className="text-accent" /> Store Admin
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-muted-foreground hover:text-primary p-1.5 rounded-lg hover:bg-primary/10 transition-colors ml-auto"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
        {isMobile && (
          <button onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-primary p-1.5 rounded-lg hover:bg-primary/10">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Search */}
      {(!collapsed || isMobile) && (
        <div className="px-4 pb-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search menu… (AI দিয়ে খুঁজুন)"
              className="h-9 pl-8 pr-8 text-xs bg-card/40 border-primary/15 focus:border-primary/40 placeholder:text-muted-foreground/50 rounded-lg"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {noLocalMatch && (
                <Sparkles size={12} className={`text-accent ${aiLoading ? "animate-pulse" : ""}`} />
              )}
              {query && (
                <button onClick={() => setQuery("")} className="text-muted-foreground/70 hover:text-foreground">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* AI search results — only when local filter is empty */}
          {noLocalMatch && (
            <div className="mt-2 rounded-lg border border-primary/20 bg-card/60 backdrop-blur-sm overflow-hidden">
              <div className="px-3 py-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] font-bold text-primary/90 border-b border-primary/10">
                <Sparkles size={10} className="text-accent" />
                AI Suggestions
                {aiLoading && <span className="ml-auto text-muted-foreground/60 normal-case tracking-normal">খুঁজছি…</span>}
              </div>
              {aiLoading && aiResults.length === 0 ? (
                <div className="px-3 py-3 space-y-1.5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-7 rounded bg-primary/5 animate-pulse" />
                  ))}
                </div>
              ) : aiResults.length > 0 ? (
                <div className="py-1">
                  {aiResults.map((r) => (
                    <button
                      key={r.href}
                      onClick={() => { persistSidebarScroll(); navigate(r.href); setQuery(""); setMobileOpen(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-primary/10 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <ChevronRight size={11} className="text-primary/60 group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
                        <span className="text-xs font-medium text-foreground truncate">{r.label}</span>
                      </div>
                      {r.reason && (
                        <p className="text-[10px] text-muted-foreground/70 mt-0.5 ml-[18px] line-clamp-1">{r.reason}</p>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-3 text-[11px] text-muted-foreground/70 text-center">
                  {aiError ?? "কোনো মিল পাওয়া যায়নি"}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Nav Groups */}
      <nav ref={sidebarScrollRef as React.RefObject<HTMLElement>} className="flex-1 overflow-y-auto py-1 px-2.5 space-y-0.5 scrollbar-thin scrollbar-thumb-primary/20">
        {loading ? (
          <div className="space-y-2 px-2 pt-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-8 rounded-lg bg-primary/5 animate-pulse" />
            ))}
          </div>
        ) : filteredGroups.map((group) => {
          const isOpen = (collapsed && !isMobile) ? false : (query.trim() ? true : (openGroups[group.title] ?? false));
          const groupActive = group.items.some((i) => isItemActive(i.href));
          return (
            <div key={group.title} className="mb-1">
              {(!collapsed || isMobile) && (
                <button
                  onClick={() => setOpenGroups({ ...openGroups, [group.title]: !isOpen })}
                  className={`w-full group flex items-center justify-between px-2.5 py-1.5 mt-2 text-[10px] uppercase tracking-[0.14em] font-bold transition-colors ${
                    groupActive ? "text-primary" : "text-muted-foreground/70 hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <group.icon size={11} className={groupActive ? "text-primary" : ""} />
                    {group.title}
                  </span>
                  <ChevronDown size={11} className={`transition-transform opacity-60 group-hover:opacity-100 ${isOpen ? "" : "-rotate-90"}`} />
                </button>
              )}
              <AnimatePresence initial={false}>
                {(isOpen || (collapsed && !isMobile)) && (
                  <motion.div
                    initial={(collapsed && !isMobile) ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-0.5 mt-0.5"
                  >
                    {group.items.map((item) => {
                      const active = isItemActive(item.href);
                      const grad = tileGradient(item.href);
                      return (
                        <Link key={item.href} to={item.href} onClick={persistSidebarScroll} title={(collapsed && !isMobile) ? item.label : undefined} className="block w-full cursor-pointer select-none">
                          <motion.div
                            whileHover={{ x: (collapsed && !isMobile) ? 0 : 2 }}
                            transition={{ type: "spring", stiffness: 400, damping: 28 }}
                            className={`group/item relative flex items-center gap-3 px-2 py-1.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                              active
                                ? "bg-gradient-to-r from-primary/25 via-primary/10 to-transparent text-foreground"
                                : "text-foreground/85 hover:text-foreground hover:bg-foreground/[0.04]"
                            }`}
                          >
                            {active && (
                              <motion.span
                                layoutId="activeNav"
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-primary to-accent rounded-r-full shadow-[0_0_10px_hsl(var(--primary)/0.9)]"
                              />
                            )}
                            <span
                              className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${grad} shadow-[0_4px_12px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.25)] ring-1 ring-white/10 transition-transform duration-300 ${
                                active ? "scale-110" : "group-hover/item:scale-110"
                              }`}
                            >
                              <item.icon size={15} strokeWidth={2.2} />
                            </span>
                            <AnimatePresence mode="wait">
                              {(!collapsed || isMobile) && (
                                <motion.span
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="truncate flex-1"
                                >
                                  {item.label}
                                </motion.span>
                              )}
                            </AnimatePresence>
                            {(!collapsed || isMobile) && item.badge && (
                              <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded-md tracking-wider ${
                                item.badge === "AI"
                                  ? "bg-gradient-to-r from-accent/30 to-primary/30 text-accent border border-accent/40"
                                  : "bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 text-pink-300 border border-pink-400/40"
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </motion.div>
                        </Link>
                      );
                    })}

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        {filteredGroups.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">No matching items</p>
        )}
      </nav>

      {/* User card */}
      <div className="p-3 mt-1">
        <div className={`relative rounded-xl border border-primary/15 bg-gradient-to-br from-card/60 to-background/30 backdrop-blur-xl p-2.5 flex items-center gap-3 ${(collapsed && !isMobile) ? "justify-center" : ""}`}>
          <Avatar className="w-9 h-9 flex-shrink-0 ring-2 ring-primary/40">
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs font-bold">
              {user?.email?.[0]?.toUpperCase() ?? "A"}
            </AvatarFallback>
          </Avatar>
          {(!collapsed || isMobile) && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-xs font-semibold truncate">{user?.email}</p>
                <p className="text-[10px] capitalize flex items-center gap-1 text-primary/90 font-medium">
                  <Crown size={9} className="text-accent" /> {role ?? "admin"}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground hover:text-rose-400 h-8 w-8 flex-shrink-0 rounded-lg" title="Sign out">
                <LogOut size={14} />
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div data-admin-layout className="admin-reference-theme relative h-screen overflow-hidden font-inter text-foreground bg-background">
      {/* Ambient background — matches the public site (SiteBackground) */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none overflow-hidden z-0"
        style={{ contain: "strict", transform: "translateZ(0)" }}
      >
        {/* Mobile: lightweight static gradients */}
        <div
          className="absolute inset-0 md:hidden"
          style={{
            background:
              "radial-gradient(at 20% 10%, hsla(270,92%,55%,0.28) 0px, transparent 45%), radial-gradient(at 85% 85%, hsla(320,90%,55%,0.22) 0px, transparent 50%)",
          }}
        />
        {/* Desktop: animated cinematic blobs + dot grid */}
        <div className="absolute inset-0 opacity-50 hidden md:block">
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
          <motion.div
            className="absolute top-[40%] left-[45%] w-[40%] h-[45%] rounded-full bg-[hsl(290,85%,60%)] blur-[160px]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.06) 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>
      </div>

      <div className="relative z-10 flex h-full overflow-hidden">
        {/* Desktop sidebar */}
        <motion.aside
          animate={{ width: collapsed ? 80 : 280 }}
          transition={{ type: "spring", stiffness: 280, damping: 32 }}
          className="hidden md:flex flex-shrink-0 flex-col overflow-hidden border-r border-primary/10"
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--card) / 0.55) 0%, hsl(var(--background) / 0.4) 100%)",
            backdropFilter: "blur(28px)",
          }}
        >
          {renderSidebarInner()}
        </motion.aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="md:hidden fixed inset-0 bg-background/70 backdrop-blur-sm z-40"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
                transition={{ type: "spring", stiffness: 280, damping: 32 }}
                className="md:hidden fixed top-0 left-0 bottom-0 w-[280px] z-50 flex flex-col border-r border-primary/15"
                style={{
                  background:
                    "linear-gradient(180deg, hsl(var(--card) / 0.95) 0%, hsl(var(--background) / 0.92) 100%)",
                  backdropFilter: "blur(28px)",
                }}
              >
                {renderSidebarInner(true)}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <header
            className="h-[68px] border-b border-primary/10 flex items-center justify-between gap-3 px-4 md:px-7 flex-shrink-0"
            style={{ background: "hsl(var(--background) / 0.55)", backdropFilter: "blur(18px)" }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden text-foreground p-2 -ml-2 rounded-lg hover:bg-primary/10"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0">
                {/* Breadcrumb */}
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground/80 font-medium">
                  <Link to="/ceo" className="hover:text-primary transition-colors">Admin</Link>
                  {currentGroup && (
                    <>
                      <ChevronRight size={11} className="opacity-50" />
                      <span className="opacity-90">{currentGroup.title}</span>
                    </>
                  )}
                  {currentItem && (
                    <>
                      <ChevronRight size={11} className="opacity-50" />
                      <span className="text-primary">{currentItem.label}</span>
                    </>
                  )}
                </div>
                <h2 className="text-foreground font-semibold text-[15px] md:text-base font-syne leading-tight truncate">
                  {currentTitle}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Quick search hint (visual only) */}
              <button
                onClick={() => {
                  const el = document.querySelector<HTMLInputElement>('input[placeholder="Search menu…"]');
                  el?.focus();
                }}
                className="hidden lg:inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs bg-card/40 hover:bg-card/60 border border-primary/15 hover:border-primary/30 pl-3 pr-2 py-1.5 rounded-lg transition-colors"
              >
                <Search size={13} />
                <span>Quick search</span>
                <kbd className="ml-2 text-[9px] font-semibold bg-background/60 border border-primary/20 px-1.5 py-0.5 rounded">
                  <Command size={9} className="inline -mt-0.5" /> K
                </kbd>
              </button>

              <Link
                to="/"
                target="_blank"
                className="hidden md:inline-flex items-center gap-1.5 text-foreground/90 hover:text-primary text-xs bg-card/40 hover:bg-primary/10 border border-primary/15 hover:border-primary/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                View Site <ExternalLink size={11} />
              </Link>

              <Popover>
                <PopoverTrigger asChild>
                  <button className="relative text-foreground/80 hover:text-primary p-2 rounded-lg hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-colors">
                    <Bell size={17} />
                    {unreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-gradient-to-br from-accent to-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center shadow-[0_0_10px_hsl(var(--accent)/0.6)]">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-80 p-0 bg-card/95 backdrop-blur-xl border-primary/25 rounded-xl overflow-hidden"
                >
                  <div className="p-3 border-b border-primary/15 flex items-center justify-between bg-gradient-to-r from-primary/10 to-transparent">
                    <h3 className="text-sm font-semibold text-foreground font-syne">Notifications</h3>
                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                      {unreadCount} new
                    </Badge>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center py-10 px-4">
                        <Bell size={20} className="mx-auto text-muted-foreground/50 mb-2" />
                        <p className="text-xs text-muted-foreground">No new activity</p>
                      </div>
                    ) : (
                      notifications.map((n, i) => (
                        <Link key={i} to={n.link}>
                          <div className="px-3 py-2.5 hover:bg-primary/5 border-b border-primary/10 cursor-pointer transition-colors">
                            <p className="text-xs text-foreground leading-snug">{n.title}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {new Date(n.time).toLocaleString()}
                            </p>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Compact user chip on top bar */}
              <div className="hidden md:flex items-center gap-2 pl-2 ml-1 border-l border-primary/15">
                <Avatar className="w-8 h-8 ring-2 ring-primary/30">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-[11px] font-bold">
                    {user?.email?.[0]?.toUpperCase() ?? "A"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          {/* Content */}
          <main ref={mainScrollRef as React.RefObject<HTMLElement>} className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-7 max-w-[1600px] mx-auto">
              <AdminHeroHeader
                title={currentTitle}
                section={currentGroup?.title ?? "Overview"}
                Icon={currentItem?.icon ?? LayoutDashboard}
              />
              {children}
            </div>
          </main>

        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
