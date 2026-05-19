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
  Receipt, TrendingDown, ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logoImg from "@/assets/logo-glossy.png";

import { canAccess, type AdminSection } from "@/lib/admin-permissions";

type NavItem = { label: string; icon: any; href: string; badge?: string; section: AdminSection };
type NavGroup = { title: string; icon: any; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/admin", section: "dashboard" },
      { label: "Analytics", icon: BarChart3, href: "/admin/analytics", badge: "NEW", section: "analytics" },
      { label: "Activity Log", icon: History, href: "/admin/activity", section: "activity" },
    ],
  },
  {
    title: "Sales & CRM",
    icon: Inbox,
    items: [
      { label: "Leads", icon: Inbox, href: "/admin/leads", section: "leads" },
      { label: "Refund Requests", icon: RefreshCcw, href: "/admin/refunds", badge: "NEW", section: "refunds" },
      { label: "Payments", icon: CreditCard, href: "/admin/payments", section: "payments" },
      { label: "bKash PGW", icon: Zap, href: "/admin/bkash-pgw", badge: "NEW", section: "payments" },
      { label: "Orders & Delivery", icon: Package, href: "/admin/orders", section: "orders" },
      { label: "Custom Order", icon: ClipboardList, href: "/admin/custom-order", badge: "NEW", section: "custom-order" },
      { label: "Quotations", icon: FileText, href: "/admin/quotations", badge: "NEW", section: "quotations" },
      { label: "Invoices", icon: Receipt, href: "/admin/invoices", badge: "NEW", section: "invoices" },
      { label: "Coupons", icon: Tag, href: "/admin/coupons", badge: "NEW", section: "coupons" },
    ],
  },
  {
    title: "Operations",
    icon: ListChecks,
    items: [
      { label: "Projects & Tasks", icon: Briefcase, href: "/admin/projects", badge: "NEW", section: "projects" },
      { label: "Expenses", icon: TrendingDown, href: "/admin/expenses", badge: "NEW", section: "expenses" },
      { label: "Knowledge Base", icon: BookOpen, href: "/admin/knowledge-base", badge: "NEW", section: "knowledge-base" },
      { label: "Newsletter", icon: Mail, href: "/admin/newsletter", badge: "NEW", section: "newsletter" },
  },
  {
    title: "Catalog",
    icon: Briefcase,
    items: [
      { label: "Services", icon: Briefcase, href: "/admin/services", section: "services" },
      { label: "Service Packages", icon: Package, href: "/admin/service-packages", section: "service-packages" },
      { label: "Pricing", icon: DollarSign, href: "/admin/pricing", section: "pricing" },
      { label: "Portfolio", icon: FolderOpen, href: "/admin/portfolio", section: "portfolio" },
      { label: "Products", icon: Package, href: "/admin/products", badge: "NEW", section: "products" },
    ],
  },
  {
    title: "Content & Marketing",
    icon: FileText,
    items: [
      { label: "Blog Posts", icon: FileText, href: "/admin/blog", section: "blog" },
      { label: "Blog Categories", icon: FolderTree, href: "/admin/blog-categories", badge: "NEW", section: "blog-categories" },
      { label: "Media Library", icon: ImageIcon, href: "/admin/media", badge: "NEW", section: "media" },
      { label: "AI Writer", icon: Sparkles, href: "/admin/ai-writer", badge: "AI", section: "ai-writer" },
      { label: "Email Campaigns", icon: Mail, href: "/admin/campaigns", badge: "NEW", section: "campaigns" },
      { label: "Testimonials", icon: Star, href: "/admin/testimonials", section: "testimonials" },
      { label: "Clients", icon: Building2, href: "/admin/clients", section: "clients" },
      { label: "Team", icon: UserCheck, href: "/admin/team", section: "team" },
      { label: "Careers", icon: Users, href: "/admin/careers", section: "careers" },
      { label: "FAQ", icon: HelpCircle, href: "/admin/faq", section: "faq" },
    ],
  },
  {
    title: "SEO & Ranking",
    icon: Globe,
    items: [
      { label: "SEO Manager", icon: Search, href: "/admin/seo", section: "seo" },
      { label: "SEO Tools & Reports", icon: BarChart3, href: "/admin/seo-tools", badge: "NEW", section: "seo-tools" },
      { label: "Sitemap & Robots", icon: Globe, href: "/admin/sitemap", badge: "NEW", section: "sitemap" },
      { label: "Schema Builder", icon: Zap, href: "/admin/schema", badge: "NEW", section: "schema" },
      { label: "Redirects (301)", icon: ArrowLeftRight, href: "/admin/redirects", badge: "NEW", section: "redirects" },
      { label: "Popular Searches", icon: TrendingUp, href: "/admin/popular-searches", section: "popular-searches" },
    ],
  },
  {
    title: "System",
    icon: Settings,
    items: [
      { label: "AI Support", icon: MessageSquare, href: "/admin/ai-support", section: "ai-support" },
      { label: "Admin Users", icon: Shield, href: "/admin/users", section: "users" },
      { label: "Footer Editor", icon: LayoutTemplate, href: "/admin/footer", section: "footer" },
      { label: "Site Settings", icon: Settings, href: "/admin/settings", section: "settings" },
    ],
  },
];

interface AdminLayoutProps { children: React.ReactNode }

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, role, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const initializedGroups = useRef(false);

  // Filter nav items by current role permissions — memoized to keep stable
  // reference and avoid effect loops while role is loading.
  const visibleGroups = useMemo(
    () =>
      navGroups
        .map((g) => ({ ...g, items: g.items.filter((it) => canAccess(role, it.section)) }))
        .filter((g) => g.items.length > 0),
    [role]
  );

  // Open all groups by default — only once, after auth has finished loading,
  // to prevent the nav from "jumping" as role-gated items appear.
  useEffect(() => {
    if (loading || initializedGroups.current) return;
    const next: Record<string, boolean> = {};
    visibleGroups.forEach((g) => { next[g.title] = true; });
    setOpenGroups(next);
    initializedGroups.current = true;
  }, [loading, visibleGroups]);

  // Notifications: poll latest leads + payments + orders
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
        leads.data?.forEach((l) => items.push({ type: "lead", title: `নতুন lead: ${l.name}`, link: "/admin/leads", time: l.created_at }));
        pays.data?.forEach((p) => items.push({ type: "payment", title: `Pending payment: ${p.name} (৳${p.amount})`, link: "/admin/payments", time: p.created_at }));
        orders.data?.forEach((o) => items.push({ type: "order", title: `Order ${o.order_number} — ${o.status}`, link: "/admin/orders", time: o.created_at }));
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
    navigate("/admin/login");
  };

  const isItemActive = (href: string) =>
    location.pathname === href || (href !== "/admin" && location.pathname.startsWith(href));

  const currentTitle =
    visibleGroups.flatMap((g) => g.items).find((i) => isItemActive(i.href))?.label ?? "Admin Panel";

  return (
    <div
      className="flex h-screen overflow-hidden font-inter text-foreground"
      style={{
        background:
          "radial-gradient(ellipse 75% 65% at -5% -5%, hsl(var(--primary) / 0.22) 0%, transparent 60%), radial-gradient(ellipse 60% 55% at 105% 0%, hsl(var(--accent) / 0.18) 0%, transparent 55%), radial-gradient(ellipse 70% 60% at 50% 110%, hsl(var(--primary) / 0.14) 0%, transparent 60%), hsl(var(--background))",
      }}
    >
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 76 : 270 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex-shrink-0 flex flex-col overflow-hidden border-r border-primary/15"
        style={{
          background:
            "linear-gradient(180deg, hsl(var(--card) / 0.85) 0%, hsl(var(--background) / 0.95) 100%)",
          backdropFilter: "blur(24px)",
        }}
      >
        {/* Logo */}
        <div className="px-4 py-4 flex items-center justify-between border-b border-primary/15 h-16">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2.5"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent p-0.5 shadow-[0_4px_18px_-4px_hsl(var(--primary)/0.7)]">
                  <div className="w-full h-full rounded-[10px] bg-background flex items-center justify-center">
                    <img src={logoImg} alt="Shahed IT" className="w-6 h-6 object-contain" />
                  </div>
                </div>
                <div>
                  <p className="text-foreground font-bold text-sm font-syne leading-none">Shahed IT</p>
                  <p className="text-primary/80 text-[10px] mt-0.5 flex items-center gap-1">
                    <Crown size={9} /> Admin Suite
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-primary/80 hover:text-primary p-1.5 rounded-lg hover:bg-primary/10 transition-colors ml-auto"
          >
            {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav Groups */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-thin scrollbar-thumb-primary/20">
          {loading ? (
            <div className="space-y-2 px-2 pt-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-7 rounded-md bg-primary/5 animate-pulse" />
              ))}
            </div>
          ) : visibleGroups.map((group) => {
            const isOpen = collapsed ? false : (openGroups[group.title] ?? false);
            return (
              <div key={group.title} className="mb-1">
                {!collapsed && (
                  <button
                    onClick={() => setOpenGroups({ ...openGroups, [group.title]: !isOpen })}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground hover:text-primary transition-colors"
                  >
                    <span>{group.title}</span>
                    <ChevronDown size={12} className={`transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                  </button>
                )}
                <AnimatePresence initial={false}>
                  {(isOpen || collapsed) && (
                    <motion.div
                      initial={collapsed ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-0.5"
                    >
                      {group.items.map((item) => {
                        const active = isItemActive(item.href);
                        return (
                          <Link key={item.href} to={item.href}>
                            <motion.div
                              whileHover={{ x: 2 }}
                              className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                active
                                  ? "bg-gradient-to-r from-primary/25 via-accent/15 to-transparent text-foreground border border-primary/30 shadow-[0_4px_18px_-8px_hsl(var(--primary)/0.6)]"
                                  : "text-muted-foreground hover:text-foreground hover:bg-primary/8"
                              }`}
                            >
                              {active && (
                                <motion.span
                                  layoutId="activeNav"
                                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-primary to-accent rounded-r-full"
                                />
                              )}
                              <item.icon size={16} className={active ? "text-primary" : ""} />
                              <AnimatePresence mode="wait">
                                {!collapsed && (
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
                              {!collapsed && item.badge && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-accent/20 text-accent border border-accent/30">
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
        </nav>

        {/* User */}
        <div className="p-3 border-t border-primary/15">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <Avatar className="w-9 h-9 flex-shrink-0 ring-2 ring-primary/40">
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs font-bold">
                {user?.email?.[0]?.toUpperCase() ?? "A"}
              </AvatarFallback>
            </Avatar>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                  <p className="text-foreground text-xs font-medium truncate">{user?.email}</p>
                  <p className="text-primary/80 text-[10px] capitalize flex items-center gap-1">
                    <Crown size={9} /> {role ?? "admin"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            {!collapsed && (
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground hover:text-rose-400 h-7 w-7 flex-shrink-0">
                <LogOut size={14} />
              </Button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="h-16 border-b border-primary/15 flex items-center justify-between px-6 flex-shrink-0"
          style={{ background: "hsl(var(--background) / 0.6)", backdropFilter: "blur(16px)" }}
        >
          <div>
            <h2 className="text-foreground font-semibold text-sm font-syne">{currentTitle}</h2>
            <p className="text-muted-foreground text-xs">Shahed IT — Admin Suite</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              target="_blank"
              className="hidden md:inline-flex items-center gap-1.5 text-foreground/90 hover:text-foreground text-xs bg-primary/10 hover:bg-primary/20 border border-primary/25 px-3 py-1.5 rounded-lg transition-colors"
            >
              View Site <ExternalLink size={12} />
            </Link>

            <Popover>
              <PopoverTrigger asChild>
                <button className="relative text-primary/90 hover:text-primary p-2 rounded-lg hover:bg-primary/10 transition-colors">
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-80 p-0 bg-card/95 backdrop-blur-xl border-primary/25"
              >
                <div className="p-3 border-b border-primary/15 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground font-syne">Notifications</h3>
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                    {unreadCount} new
                  </Badge>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-8">No new activity</p>
                  ) : (
                    notifications.map((n, i) => (
                      <Link key={i} to={n.link}>
                        <div className="px-3 py-2.5 hover:bg-primary/5 border-b border-primary/10 cursor-pointer">
                          <p className="text-xs text-foreground">{n.title}</p>
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
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
