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
  Receipt, TrendingDown, ClipboardList, X, ChevronRight, Command, Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import BrandMark from "@/components/BrandMark";

import { canAccess, type AdminSection } from "@/lib/admin-permissions";

type NavItem = { label: string; icon: any; href: string; badge?: string; section: AdminSection };
type NavGroup = { title: string; icon: any; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/ceo", section: "dashboard" },
      { label: "Analytics", icon: BarChart3, href: "/ceo/analytics", badge: "NEW", section: "analytics" },
      { label: "Activity Log", icon: History, href: "/ceo/activity", section: "activity" },
    ],
  },
  {
    title: "Sales & CRM",
    icon: Inbox,
    items: [
      { label: "Leads", icon: Inbox, href: "/ceo/leads", section: "leads" },
      { label: "Refund Requests", icon: RefreshCcw, href: "/ceo/refunds", badge: "NEW", section: "refunds" },
      { label: "Payments", icon: CreditCard, href: "/ceo/payments", section: "payments" },
      { label: "Wallets", icon: Wallet, href: "/ceo/wallets", badge: "NEW", section: "wallets" },
      { label: "bKash PGW", icon: Zap, href: "/ceo/bkash-pgw", badge: "NEW", section: "payments" },
      { label: "Orders & Delivery", icon: Package, href: "/ceo/orders", section: "orders" },
      { label: "Custom Order", icon: ClipboardList, href: "/ceo/custom-order", badge: "NEW", section: "custom-order" },
      { label: "Quotations", icon: FileText, href: "/ceo/quotations", badge: "NEW", section: "quotations" },
      { label: "Invoices", icon: Receipt, href: "/ceo/invoices", badge: "NEW", section: "invoices" },
      { label: "Coupons", icon: Tag, href: "/ceo/coupons", badge: "NEW", section: "coupons" },
    ],
  },
  {
    title: "Operations",
    icon: ListChecks,
    items: [
      { label: "Projects & Tasks", icon: Briefcase, href: "/ceo/projects", badge: "NEW", section: "projects" },
      { label: "Expenses", icon: TrendingDown, href: "/ceo/expenses", badge: "NEW", section: "expenses" },
      { label: "Knowledge Base", icon: BookOpen, href: "/ceo/knowledge-base", badge: "NEW", section: "knowledge-base" },
      { label: "Newsletter", icon: Mail, href: "/ceo/newsletter", badge: "NEW", section: "newsletter" },
    ],
  },
  {
    title: "Catalog",
    icon: Briefcase,
    items: [
      { label: "Services", icon: Briefcase, href: "/ceo/services", section: "services" },
      { label: "Service Packages", icon: Package, href: "/ceo/service-packages", section: "service-packages" },
      { label: "Pricing", icon: DollarSign, href: "/ceo/pricing", section: "pricing" },
      { label: "Portfolio", icon: FolderOpen, href: "/ceo/portfolio", section: "portfolio" },
      { label: "Products", icon: Package, href: "/ceo/products", badge: "NEW", section: "products" },
    ],
  },
  {
    title: "Content & Marketing",
    icon: FileText,
    items: [
      { label: "Blog Posts", icon: FileText, href: "/ceo/blog", section: "blog" },
      { label: "Blog Categories", icon: FolderTree, href: "/ceo/blog-categories", badge: "NEW", section: "blog-categories" },
      { label: "Media Library", icon: ImageIcon, href: "/ceo/media", badge: "NEW", section: "media" },
      { label: "AI Writer", icon: Sparkles, href: "/ceo/ai-writer", badge: "AI", section: "ai-writer" },
      { label: "Email Campaigns", icon: Mail, href: "/ceo/campaigns", badge: "NEW", section: "campaigns" },
      { label: "Testimonials", icon: Star, href: "/ceo/testimonials", section: "testimonials" },
      { label: "Clients", icon: Building2, href: "/ceo/clients", section: "clients" },
      { label: "Team", icon: UserCheck, href: "/ceo/team", section: "team" },
      { label: "Careers", icon: Users, href: "/ceo/careers", section: "careers" },
      { label: "FAQ", icon: HelpCircle, href: "/ceo/faq", section: "faq" },
      { label: "Tech Stack", icon: Sparkles, href: "/ceo/tech-details", badge: "NEW", section: "tech-details" },
    ],
  },
  {
    title: "SEO & Ranking",
    icon: Globe,
    items: [
      { label: "Ranking Setup (All Google)", icon: Globe, href: "/ceo/ranking-setup", badge: "NEW", section: "ranking-setup" },
      { label: "SEO Manager", icon: Search, href: "/ceo/seo", section: "seo" },
      { label: "SEO Tools & Reports", icon: BarChart3, href: "/ceo/seo-tools", badge: "NEW", section: "seo-tools" },
      { label: "Sitemap & Robots", icon: Globe, href: "/ceo/sitemap", badge: "NEW", section: "sitemap" },
      { label: "Schema Builder", icon: Zap, href: "/ceo/schema", badge: "NEW", section: "schema" },
      { label: "Redirects (301)", icon: ArrowLeftRight, href: "/ceo/redirects", badge: "NEW", section: "redirects" },
      { label: "Popular Searches", icon: TrendingUp, href: "/ceo/popular-searches", section: "popular-searches" },
    ],
  },
  {
    title: "System",
    icon: Settings,
    items: [
      { label: "AI Support", icon: MessageSquare, href: "/ceo/ai-support", section: "ai-support" },
      { label: "Admin Users", icon: Shield, href: "/ceo/users", section: "users" },
      { label: "Footer Editor", icon: LayoutTemplate, href: "/ceo/footer", section: "footer" },
      { label: "Hero Banners", icon: LayoutTemplate, href: "/ceo/banners", badge: "NEW", section: "banners" },
      { label: "Site Settings", icon: Settings, href: "/ceo/settings", section: "settings" },
    ],
  },
];

interface AdminLayoutProps { children: React.ReactNode }

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [query, setQuery] = useState("");
  const { user, role, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const initializedGroups = useRef(false);

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
  const SidebarInner = ({ isMobile = false }: { isMobile?: boolean }) => (
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
                <p className="text-foreground font-bold text-[15px] font-syne tracking-tight">Shahed IT</p>
                <p className="text-[10px] text-primary/90 mt-0.5 flex items-center gap-1 font-medium uppercase tracking-[0.12em]">
                  <Crown size={9} className="text-accent" /> Admin Suite
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
              placeholder="Search menu…"
              className="h-9 pl-8 pr-8 text-xs bg-card/40 border-primary/15 focus:border-primary/40 placeholder:text-muted-foreground/50 rounded-lg"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground">
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto py-1 px-2.5 space-y-0.5 scrollbar-thin scrollbar-thumb-primary/20">
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
                      return (
                        <Link key={item.href} to={item.href} title={(collapsed && !isMobile) ? item.label : undefined}>
                          <motion.div
                            whileHover={{ x: (collapsed && !isMobile) ? 0 : 2 }}
                            transition={{ type: "spring", stiffness: 400, damping: 28 }}
                            className={`relative flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                              active
                                ? "bg-gradient-to-r from-primary/25 via-primary/10 to-transparent text-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]"
                            }`}
                          >
                            {active && (
                              <motion.span
                                layoutId="activeNav"
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-primary to-accent rounded-r-full shadow-[0_0_10px_hsl(var(--primary)/0.9)]"
                              />
                            )}
                            <span className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                              active
                                ? "bg-gradient-to-br from-primary/30 to-accent/20 text-primary shadow-[inset_0_1px_0_hsl(var(--primary)/0.3)]"
                                : "text-muted-foreground/80 group-hover:text-foreground"
                            }`}>
                              <item.icon size={15} />
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
                                  : "bg-primary/15 text-primary border border-primary/30"
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
    <div data-admin-layout className="relative h-screen overflow-hidden font-inter text-foreground bg-[#0a0514]">
      {/* Ambient background — matches Hero Banner */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden z-0"
        style={{ contain: "strict", transform: "translateZ(0)" }}
      >
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(at 15% 10%, hsla(270,92%,55%,0.45) 0px, transparent 50%), radial-gradient(at 85% 90%, hsla(320,90%,55%,0.40) 0px, transparent 55%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04] hidden md:block"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
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
          <SidebarInner />
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
                <SidebarInner isMobile />
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
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-7 max-w-[1600px] mx-auto">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
