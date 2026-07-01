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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import BrandMark from "@/components/BrandMark";
import "@/styles/admin-theme.css";

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
      { label: "Analytics Hub", icon: BarChart3, href: "/ceo/analytics-hub", badge: "NEW", section: "analytics-hub" },
      { label: "Reports", icon: BarChart3, href: "/ceo/reports", badge: "NEW", section: "reports" },
      { label: "KPI & Goals", icon: TrendingUp, href: "/ceo/kpi", badge: "NEW", section: "kpi" },
      { label: "Notifications", icon: Bell, href: "/ceo/notifications", badge: "NEW", section: "notifications" },
      { label: "Activity Log", icon: History, href: "/ceo/activity", section: "activity" },
    ],
  },
  {
    title: "People",
    icon: Users,
    items: [
      { label: "Customer Management", icon: Users, href: "/ceo/customers", badge: "NEW", section: "customers" },
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
      { label: "Task Board (Kanban)", icon: ListChecks, href: "/ceo/task-board", badge: "NEW", section: "task-board" },
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
    title: "Product Management",
    icon: Package,
    items: [
      { label: "Categories", icon: FolderTree, href: "/ceo/categories", badge: "NEW", section: "categories" },
      { label: "Brands", icon: Building2, href: "/ceo/brands", badge: "NEW", section: "brands" },
      { label: "Tags", icon: Tag, href: "/ceo/product-tags", badge: "NEW", section: "product-tags" },
      { label: "Digital Files", icon: Database, href: "/ceo/digital-files", badge: "NEW", section: "digital-files" },
      { label: "License Keys", icon: Shield, href: "/ceo/license-keys", badge: "NEW", section: "license-keys" },
      { label: "Bulk Import / Edit", icon: ListChecks, href: "/ceo/bulk-products", badge: "NEW", section: "bulk-products" },
    ],
  },
  {
    title: "Content & Marketing",
    icon: FileText,
    items: [
      { label: "Blog Management", icon: FileText, href: "/ceo/blog-management", badge: "HUB", section: "blog-management" },
      { label: "Blog Posts", icon: FileText, href: "/ceo/blog", section: "blog" },
      { label: "Blog Categories", icon: FolderTree, href: "/ceo/blog-categories", section: "blog-categories" },
      { label: "Media Library", icon: ImageIcon, href: "/ceo/media", badge: "NEW", section: "media" },
      { label: "AI Writer", icon: Sparkles, href: "/ceo/ai-writer", badge: "AI", section: "ai-writer" },
      { label: "Email System", icon: Mail, href: "/ceo/email-system", badge: "HUB", section: "email-system" },
      { label: "Email Campaigns", icon: Mail, href: "/ceo/campaigns", badge: "NEW", section: "campaigns" },
      { label: "Reviews", icon: Star, href: "/ceo/reviews", badge: "NEW", section: "reviews" },
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
      { label: "SEO Panel", icon: Search, href: "/ceo/seo-panel", badge: "HUB", section: "seo-panel" },
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
      { label: "Staff Management", icon: Users, href: "/ceo/staff-management", badge: "NEW", section: "staff-management" },
      { label: "Website CMS", icon: LayoutTemplate, href: "/ceo/website-cms", badge: "NEW", section: "website-cms" },
      { label: "Footer Editor", icon: LayoutTemplate, href: "/ceo/footer", section: "footer" },
      { label: "Hero Banners", icon: LayoutTemplate, href: "/ceo/banners", badge: "NEW", section: "banners" },
      { label: "Welcome Popups", icon: ImageIcon, href: "/ceo/welcome-popups", badge: "NEW", section: "welcome-popups" },
      { label: "Site Settings", icon: Settings, href: "/ceo/settings", section: "settings" },
      { label: "Settings Hub", icon: Settings, href: "/ceo/settings-hub", badge: "NEW", section: "settings-hub" },
      { label: "Backup & Export", icon: Database, href: "/ceo/backup", badge: "NEW", section: "backup" },
      { label: "Backup & Maintenance", icon: Database, href: "/ceo/backup-maintenance", badge: "NEW", section: "backup-maintenance" },
      { label: "Security Audit", icon: Shield, href: "/ceo/security-audit", badge: "NEW", section: "security-audit" },
      { label: "Security Center", icon: Shield, href: "/ceo/security-center", badge: "NEW", section: "security-center" },
      { label: "Advanced Tools", icon: Sparkles, href: "/ceo/advanced-tools", badge: "NEW", section: "advanced-tools" },
      { label: "Offers & Giveaways", icon: Gift, href: "/ceo/offers", badge: "NEW", section: "offers" },
      { label: "Copy Protection", icon: Shield, href: "/ceo/copy-protection", badge: "NEW", section: "copy-protection" },
      { label: "AI Providers", icon: Sparkles, href: "/ceo/ai-providers", badge: "NEW", section: "ai-providers" },
    ],
  },
];

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

  useEffect(() => {
    try { sessionStorage.setItem("admin:collapsed", collapsed ? "1" : "0"); } catch {}
  }, [collapsed]);
  useEffect(() => {
    try { sessionStorage.setItem("admin:openGroups", JSON.stringify(openGroups)); } catch {}
  }, [openGroups]);

  useEffect(() => {
    const el = sidebarScrollRef.current;
    if (!el) return;
    restoreSidebarScroll();
    const onScroll = () => {
      try { sessionStorage.setItem(ADMIN_SIDEBAR_SCROLL_KEY, String(el.scrollTop)); } catch {}
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { onScroll(); el.removeEventListener("scroll", onScroll); };
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(restoreSidebarScroll);
    return () => cancelAnimationFrame(frame);
  }, [location.pathname]);

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

  const filteredGroups = useMemo(() => {
    if (!query.trim()) return visibleGroups;
    const q = query.toLowerCase();
    return visibleGroups
      .map((g) => ({ ...g, items: g.items.filter((it) => it.label.toLowerCase().includes(q)) }))
      .filter((g) => g.items.length > 0);
  }, [visibleGroups, query]);

  const noLocalMatch = query.trim().length >= 2 && filteredGroups.length === 0;
  useEffect(() => {
    if (!noLocalMatch) { setAiResults([]); setAiError(null); setAiLoading(false); return; }
    let cancelled = false;
    setAiLoading(true); setAiError(null);
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
      } catch { if (!cancelled) { setAiError("AI search ব্যর্থ হয়েছে"); setAiResults([]); } }
      finally { if (!cancelled) setAiLoading(false); }
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

  const renderSidebarInner = (isMobile = false) => (
    <>
      {/* Brand block */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b" style={{ borderColor: "hsl(var(--a-line))" }}>
        <AnimatePresence mode="wait">
          {(!collapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
              className="flex items-center gap-3"
            >
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--a-emerald) / 0.18), hsl(var(--a-emerald-deep) / 0.35))",
                  boxShadow: "inset 0 0 0 1px hsl(var(--a-emerald) / 0.35), inset 0 1px 0 hsl(150 100% 100% / 0.05)",
                }}
              >
                <BrandMark size={22} glow="soft" />
              </div>
              <div className="leading-tight">
                <p className="a-display text-[15px]" style={{ color: "hsl(var(--a-text))" }}>SHAHED<span style={{ color: "hsl(var(--a-emerald))" }}>.</span>IT</p>
                <p className="text-[9.5px] mt-0.5 flex items-center gap-1 uppercase tracking-[0.24em] a-mono" style={{ color: "hsl(var(--a-mute-2))" }}>
                  <span className="w-1 h-1 rounded-full inline-block" style={{ background: "hsl(var(--a-emerald))" }} />
                  Command
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md transition-colors ml-auto"
            style={{ color: "hsl(var(--a-muted))" }}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <Menu size={15} /> : <ChevronLeft size={15} />}
          </button>
        )}
        {isMobile && (
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-md" style={{ color: "hsl(var(--a-muted))" }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Search */}
      {(!collapsed || isMobile) && (
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--a-mute-2))" }} />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search menu"
              className="h-9 pl-8 pr-8 text-[12px] a-mono rounded-md border-0"
              style={{
                background: "hsl(var(--a-panel-2))",
                boxShadow: "inset 0 0 0 1px hsl(var(--a-line))",
                color: "hsl(var(--a-text))",
              }}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {noLocalMatch && <Sparkles size={11} className={aiLoading ? "animate-pulse" : ""} style={{ color: "hsl(var(--a-gold))" }} />}
              {query && <button onClick={() => setQuery("")} style={{ color: "hsl(var(--a-mute-2))" }}><X size={11} /></button>}
            </div>
          </div>

          {noLocalMatch && (
            <div className="mt-2 rounded-md overflow-hidden" style={{ background: "hsl(var(--a-panel-2))", boxShadow: "inset 0 0 0 1px hsl(var(--a-line))" }}>
              <div className="px-3 py-1.5 flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.2em] a-mono" style={{ color: "hsl(var(--a-gold))", borderBottom: "1px solid hsl(var(--a-line))" }}>
                <Sparkles size={9} />
                AI Suggests
                {aiLoading && <span className="ml-auto normal-case tracking-normal" style={{ color: "hsl(var(--a-mute-2))" }}>খুঁজছি…</span>}
              </div>
              {aiLoading && aiResults.length === 0 ? (
                <div className="px-3 py-3 space-y-1.5">
                  {[0, 1, 2].map((i) => (<div key={i} className="h-7 rounded" style={{ background: "hsl(var(--a-line))" }} />))}
                </div>
              ) : aiResults.length > 0 ? (
                <div className="py-1">
                  {aiResults.map((r) => (
                    <button key={r.href}
                      onClick={() => { persistSidebarScroll(); navigate(r.href); setQuery(""); setMobileOpen(false); }}
                      className="w-full text-left px-3 py-2 transition-colors group"
                      style={{ color: "hsl(var(--a-text))" }}
                    >
                      <div className="flex items-center gap-2">
                        <ChevronRight size={10} style={{ color: "hsl(var(--a-emerald))" }} className="group-hover:translate-x-0.5 transition-transform" />
                        <span className="text-[12px] truncate">{r.label}</span>
                      </div>
                      {r.reason && <p className="text-[10px] mt-0.5 ml-[16px] line-clamp-1" style={{ color: "hsl(var(--a-mute-2))" }}>{r.reason}</p>}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-3 text-[11px] text-center" style={{ color: "hsl(var(--a-mute-2))" }}>{aiError ?? "কোনো মিল পাওয়া যায়নি"}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <nav ref={sidebarScrollRef as React.RefObject<HTMLElement>} className="flex-1 overflow-y-auto a-scroll py-2 px-2">
        {loading ? (
          <div className="space-y-1.5 px-2 pt-2">
            {Array.from({ length: 10 }).map((_, i) => (<div key={i} className="h-7 rounded" style={{ background: "hsl(var(--a-line))" }} />))}
          </div>
        ) : filteredGroups.map((group, gi) => {
          const isOpen = (collapsed && !isMobile) ? false : (query.trim() ? true : (openGroups[group.title] ?? false));
          const groupActive = group.items.some((i) => isItemActive(i.href));
          return (
            <div key={group.title} className="mb-1">
              {(!collapsed || isMobile) && (
                <button
                  onClick={() => setOpenGroups({ ...openGroups, [group.title]: !isOpen })}
                  className="w-full group flex items-center justify-between px-3 py-2 mt-2 a-mono text-[9.5px] uppercase tracking-[0.22em] transition-colors"
                  style={{ color: groupActive ? "hsl(var(--a-emerald))" : "hsl(var(--a-mute-2))" }}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="a-mono opacity-50">{String(gi + 1).padStart(2, "0")}</span>
                    <span>{group.title}</span>
                  </span>
                  <ChevronDown size={10} className={`transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                </button>
              )}
              <AnimatePresence initial={false}>
                {(isOpen || (collapsed && !isMobile)) && (
                  <motion.div
                    initial={(collapsed && !isMobile) ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    {group.items.map((item) => {
                      const active = isItemActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={persistSidebarScroll}
                          title={(collapsed && !isMobile) ? item.label : undefined}
                          className="block w-full cursor-pointer select-none a-rail-item"
                          data-active={active}
                        >
                          <div
                            className="relative flex items-center gap-3 pl-3 pr-2 py-1.5 mx-1 rounded-md transition-all duration-150"
                            style={{
                              background: active ? "linear-gradient(90deg, hsl(var(--a-emerald) / 0.10), transparent 70%)" : "transparent",
                              color: active ? "hsl(var(--a-text))" : "hsl(var(--a-muted))",
                            }}
                          >
                            {active && (
                              <motion.span
                                layoutId="activeNav"
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r"
                                style={{ background: "hsl(var(--a-emerald))", boxShadow: "0 0 12px hsl(var(--a-emerald) / 0.8)" }}
                              />
                            )}
                            <span
                              className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center transition-colors"
                              style={{
                                color: active ? "hsl(var(--a-emerald))" : "hsl(var(--a-muted))",
                                background: active ? "hsl(var(--a-emerald) / 0.10)" : "transparent",
                                boxShadow: active ? "inset 0 0 0 1px hsl(var(--a-emerald) / 0.25)" : "none",
                              }}
                            >
                              <item.icon size={13} strokeWidth={1.9} />
                            </span>
                            {(!collapsed || isMobile) && (
                              <span className="truncate flex-1 text-[12.5px] a-body">{item.label}</span>
                            )}
                            {(!collapsed || isMobile) && item.badge && (
                              <span
                                className="text-[8.5px] a-mono px-1.5 py-0.5 rounded uppercase tracking-wider"
                                style={
                                  item.badge === "AI"
                                    ? { color: "hsl(var(--a-gold))", background: "hsl(var(--a-gold) / 0.08)", boxShadow: "inset 0 0 0 1px hsl(var(--a-gold) / 0.35)" }
                                    : item.badge === "HUB"
                                    ? { color: "hsl(var(--a-emerald-soft))", background: "hsl(var(--a-emerald) / 0.08)", boxShadow: "inset 0 0 0 1px hsl(var(--a-emerald) / 0.3)" }
                                    : { color: "hsl(var(--a-mute-2))", background: "transparent", boxShadow: "inset 0 0 0 1px hsl(var(--a-line-strong))" }
                                }
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
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
          <p className="text-xs text-center py-6" style={{ color: "hsl(var(--a-mute-2))" }}>No matching items</p>
        )}
      </nav>

      {/* User card */}
      <div className="p-3 border-t" style={{ borderColor: "hsl(var(--a-line))" }}>
        <div
          className={`rounded-md p-2.5 flex items-center gap-3 ${(collapsed && !isMobile) ? "justify-center" : ""}`}
          style={{ background: "hsl(var(--a-panel-2))", boxShadow: "inset 0 0 0 1px hsl(var(--a-line))" }}
        >
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback
              className="text-[11px] a-display"
              style={{ background: "hsl(var(--a-emerald-deep))", color: "hsl(var(--a-emerald-soft))" }}
            >
              {user?.email?.[0]?.toUpperCase() ?? "A"}
            </AvatarFallback>
          </Avatar>
          {(!collapsed || isMobile) && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-[11.5px] truncate a-body" style={{ color: "hsl(var(--a-text))" }}>{user?.email}</p>
                <p className="text-[9.5px] capitalize a-mono uppercase tracking-[0.18em] flex items-center gap-1" style={{ color: "hsl(var(--a-emerald))" }}>
                  <Crown size={8} /> {role ?? "admin"}
                </p>
              </div>
              <Button
                variant="ghost" size="icon" onClick={handleSignOut}
                className="h-7 w-7 flex-shrink-0 rounded-md hover:bg-transparent"
                style={{ color: "hsl(var(--a-muted))" }}
                title="Sign out"
              >
                <LogOut size={13} />
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div
      data-admin-layout
      data-admin-theme
      className="relative h-screen overflow-hidden a-body"
      style={{ color: "hsl(var(--a-text))", background: "hsl(var(--a-bg))" }}
    >
      {/* Ambient editorial background */}
      <div aria-hidden className="fixed inset-0 pointer-events-none overflow-hidden z-0 a-grain">
        <div className="absolute inset-0 a-dot-grid opacity-70" />
      </div>

      <div className="relative z-10 flex h-full overflow-hidden">
        {/* Desktop sidebar */}
        <motion.aside
          animate={{ width: collapsed ? 72 : 272 }}
          transition={{ type: "spring", stiffness: 300, damping: 34 }}
          className="hidden md:flex flex-shrink-0 flex-col overflow-hidden border-r"
          style={{
            background: "linear-gradient(180deg, hsl(var(--a-panel) / 0.85), hsl(var(--a-bg) / 0.9))",
            backdropFilter: "blur(20px)",
            borderColor: "hsl(var(--a-line))",
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
                className="md:hidden fixed inset-0 z-40"
                style={{ background: "hsl(var(--a-bg) / 0.75)", backdropFilter: "blur(4px)" }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
                transition={{ type: "spring", stiffness: 300, damping: 34 }}
                className="md:hidden fixed top-0 left-0 bottom-0 w-[280px] z-50 flex flex-col border-r"
                style={{
                  background: "linear-gradient(180deg, hsl(var(--a-panel) / 0.98), hsl(var(--a-bg) / 0.98))",
                  backdropFilter: "blur(20px)",
                  borderColor: "hsl(var(--a-line))",
                }}
              >
                {renderSidebarInner(true)}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar — editorial masthead */}
          <header
            className="h-[64px] border-b flex items-center justify-between gap-3 px-4 md:px-8 flex-shrink-0"
            style={{
              background: "linear-gradient(180deg, hsl(var(--a-panel) / 0.72), hsl(var(--a-bg) / 0.5))",
              backdropFilter: "blur(16px)",
              borderColor: "hsl(var(--a-line))",
            }}
          >
            <div className="flex items-center gap-4 min-w-0">
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-2 -ml-2 rounded-md"
                style={{ color: "hsl(var(--a-text))" }}
                aria-label="Open menu"
              >
                <Menu size={19} />
              </button>

              <div className="min-w-0 flex items-center gap-4">
                {/* Rule + issue-style label */}
                <div className="hidden md:flex flex-col items-end pr-4 border-r a-mono text-[9.5px] uppercase tracking-[0.22em]" style={{ borderColor: "hsl(var(--a-line))", color: "hsl(var(--a-mute-2))" }}>
                  <span>Issue №</span>
                  <span style={{ color: "hsl(var(--a-emerald))" }}>{new Date().getFullYear()}.{String(new Date().getMonth()+1).padStart(2,'0')}</span>
                </div>
                <div className="min-w-0">
                  <div className="hidden sm:flex items-center gap-2 a-mono text-[9.5px] uppercase tracking-[0.22em]" style={{ color: "hsl(var(--a-mute-2))" }}>
                    <Link to="/ceo" className="hover:opacity-100 opacity-70">Admin</Link>
                    {currentGroup && (<><span className="opacity-40">/</span><span className="opacity-80">{currentGroup.title}</span></>)}
                    {currentItem && (<><span className="opacity-40">/</span><span style={{ color: "hsl(var(--a-emerald))" }}>{currentItem.label}</span></>)}
                  </div>
                  <h2 className="a-display text-[17px] md:text-[19px] leading-tight truncate" style={{ color: "hsl(var(--a-text))" }}>
                    {currentTitle}
                  </h2>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const el = document.querySelector<HTMLInputElement>('input[placeholder="Search menu"]');
                  el?.focus();
                }}
                className="hidden lg:inline-flex items-center gap-2 text-[11px] a-mono uppercase tracking-[0.16em] pl-3 pr-2 py-1.5 rounded-md transition-colors"
                style={{
                  color: "hsl(var(--a-muted))",
                  background: "hsl(var(--a-panel-2))",
                  boxShadow: "inset 0 0 0 1px hsl(var(--a-line))",
                }}
              >
                <Search size={12} />
                <span>Search</span>
                <kbd className="ml-2 text-[9px] px-1.5 py-0.5 rounded" style={{ background: "hsl(var(--a-bg))", boxShadow: "inset 0 0 0 1px hsl(var(--a-line-strong))" }}>
                  <Command size={9} className="inline -mt-0.5" /> K
                </kbd>
              </button>

              <Link
                to="/" target="_blank"
                className="hidden md:inline-flex items-center gap-1.5 text-[11px] a-mono uppercase tracking-[0.16em] px-3 py-1.5 rounded-md transition-colors"
                style={{
                  color: "hsl(var(--a-emerald-soft))",
                  background: "hsl(var(--a-emerald) / 0.06)",
                  boxShadow: "inset 0 0 0 1px hsl(var(--a-emerald) / 0.28)",
                }}
              >
                View Site <ExternalLink size={10} />
              </Link>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="relative p-2 rounded-md transition-colors"
                    style={{ color: "hsl(var(--a-text))", background: "hsl(var(--a-panel-2))", boxShadow: "inset 0 0 0 1px hsl(var(--a-line))" }}
                  >
                    <Bell size={15} />
                    {unreadCount > 0 && (
                      <span
                        className="absolute top-0.5 right-0.5 min-w-[14px] h-3.5 px-1 rounded-full text-[9px] a-mono flex items-center justify-center"
                        style={{ background: "hsl(var(--a-emerald))", color: "hsl(var(--a-bg))", fontWeight: 700 }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-80 p-0 rounded-md overflow-hidden border-0"
                  style={{ background: "hsl(var(--a-panel))", boxShadow: "0 24px 60px -20px hsl(0 0% 0% / 0.6), inset 0 0 0 1px hsl(var(--a-line))" }}
                >
                  <div className="p-3 flex items-center justify-between" style={{ borderBottom: "1px solid hsl(var(--a-line))" }}>
                    <h3 className="a-display text-[13px]" style={{ color: "hsl(var(--a-text))" }}>Notifications</h3>
                    <Badge variant="outline" className="text-[9.5px] a-mono uppercase tracking-[0.15em] border-0" style={{ color: "hsl(var(--a-emerald))", boxShadow: "inset 0 0 0 1px hsl(var(--a-emerald) / 0.3)" }}>
                      {unreadCount} new
                    </Badge>
                  </div>
                  <div className="max-h-80 overflow-y-auto a-scroll">
                    {notifications.length === 0 ? (
                      <div className="text-center py-10 px-4">
                        <Bell size={20} className="mx-auto mb-2" style={{ color: "hsl(var(--a-mute-2))" }} />
                        <p className="text-xs" style={{ color: "hsl(var(--a-mute-2))" }}>No new activity</p>
                      </div>
                    ) : (
                      notifications.map((n, i) => (
                        <Link key={i} to={n.link}>
                          <div className="px-3 py-2.5 cursor-pointer transition-colors" style={{ borderBottom: "1px solid hsl(var(--a-line))" }}>
                            <p className="text-[12px] leading-snug a-body" style={{ color: "hsl(var(--a-text))" }}>{n.title}</p>
                            <p className="text-[10px] mt-0.5 a-mono" style={{ color: "hsl(var(--a-mute-2))" }}>{new Date(n.time).toLocaleString()}</p>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <div className="hidden md:flex items-center gap-2 pl-3 ml-1 border-l" style={{ borderColor: "hsl(var(--a-line))" }}>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-[11px] a-display" style={{ background: "hsl(var(--a-emerald-deep))", color: "hsl(var(--a-emerald-soft))" }}>
                    {user?.email?.[0]?.toUpperCase() ?? "A"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          {/* Content */}
          <main ref={mainScrollRef as React.RefObject<HTMLElement>} className="flex-1 overflow-y-auto a-scroll">
            <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
