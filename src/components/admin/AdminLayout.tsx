import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Settings, Users, Briefcase, FolderOpen, FileText,
  MessageSquare, Star, UserCheck, Building2, DollarSign, HelpCircle,
  Inbox, ChevronLeft, Menu, LogOut, Bell, Shield, Package, CreditCard,
  LayoutTemplate, Search, TrendingUp, Sparkles, Globe, Tag, Mail,
  History, BarChart3, ArrowLeftRight, ChevronDown, Crown, ExternalLink,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logoImg from "@/assets/logo-glossy.png";

type NavItem = { label: string; icon: any; href: string; badge?: string };
type NavGroup = { title: string; icon: any; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
      { label: "Analytics", icon: BarChart3, href: "/admin/analytics", badge: "NEW" },
      { label: "Activity Log", icon: History, href: "/admin/activity" },
    ],
  },
  {
    title: "Sales & CRM",
    icon: Inbox,
    items: [
      { label: "Leads", icon: Inbox, href: "/admin/leads" },
      { label: "Payments", icon: CreditCard, href: "/admin/payments" },
      { label: "Orders & Delivery", icon: Package, href: "/admin/orders" },
      { label: "Coupons", icon: Tag, href: "/admin/coupons", badge: "NEW" },
    ],
  },
  {
    title: "Catalog",
    icon: Briefcase,
    items: [
      { label: "Services", icon: Briefcase, href: "/admin/services" },
      { label: "Service Packages", icon: Package, href: "/admin/service-packages" },
      { label: "Pricing", icon: DollarSign, href: "/admin/pricing" },
      { label: "Portfolio", icon: FolderOpen, href: "/admin/portfolio" },
    ],
  },
  {
    title: "Content & Marketing",
    icon: FileText,
    items: [
      { label: "Blog Posts", icon: FileText, href: "/admin/blog" },
      { label: "AI Writer", icon: Sparkles, href: "/admin/ai-writer", badge: "AI" },
      { label: "Email Campaigns", icon: Mail, href: "/admin/campaigns", badge: "NEW" },
      { label: "Testimonials", icon: Star, href: "/admin/testimonials" },
      { label: "Clients", icon: Building2, href: "/admin/clients" },
      { label: "Team", icon: UserCheck, href: "/admin/team" },
      { label: "Careers", icon: Users, href: "/admin/careers" },
      { label: "FAQ", icon: HelpCircle, href: "/admin/faq" },
    ],
  },
  {
    title: "SEO & Ranking",
    icon: Globe,
    items: [
      { label: "SEO Manager", icon: Search, href: "/admin/seo" },
      { label: "Sitemap & Robots", icon: Globe, href: "/admin/sitemap", badge: "NEW" },
      { label: "Schema Builder", icon: Zap, href: "/admin/schema", badge: "NEW" },
      { label: "Redirects (301)", icon: ArrowLeftRight, href: "/admin/redirects", badge: "NEW" },
      { label: "Popular Searches", icon: TrendingUp, href: "/admin/popular-searches" },
    ],
  },
  {
    title: "System",
    icon: Settings,
    items: [
      { label: "AI Support", icon: MessageSquare, href: "/admin/ai-support" },
      { label: "Admin Users", icon: Shield, href: "/admin/users" },
      { label: "Footer Editor", icon: LayoutTemplate, href: "/admin/footer" },
      { label: "Site Settings", icon: Settings, href: "/admin/settings" },
    ],
  },
];

interface AdminLayoutProps { children: React.ReactNode }

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, role, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-open the group containing the active route
  useEffect(() => {
    const next: Record<string, boolean> = {};
    navGroups.forEach((g) => {
      next[g.title] = g.items.some(
        (it) =>
          location.pathname === it.href ||
          (it.href !== "/admin" && location.pathname.startsWith(it.href))
      );
    });
    setOpenGroups((prev) => ({ ...prev, ...next }));
  }, [location.pathname]);

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
    navGroups.flatMap((g) => g.items).find((i) => isItemActive(i.href))?.label ?? "Admin Panel";

  return (
    <div
      className="flex h-screen overflow-hidden font-inter text-foreground"
      style={{
        background:
          "radial-gradient(at 20% 0%, hsl(43 70% 12% / 0.35) 0px, transparent 50%), radial-gradient(at 80% 100%, hsl(43 50% 8% / 0.3) 0px, transparent 50%), #08080b",
      }}
    >
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 76 : 270 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex-shrink-0 flex flex-col overflow-hidden border-r border-amber-400/10"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,16,8,0.85) 0%, rgba(8,8,11,0.95) 100%)",
          backdropFilter: "blur(24px)",
        }}
      >
        {/* Logo */}
        <div className="px-4 py-4 flex items-center justify-between border-b border-amber-400/10 h-16">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2.5"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-300 to-amber-600 p-0.5 shadow-[0_4px_16px_-4px_rgba(245,158,11,0.6)]">
                  <div className="w-full h-full rounded-[10px] bg-black flex items-center justify-center">
                    <img src={logoImg} alt="Shahed IT" className="w-6 h-6 object-contain" />
                  </div>
                </div>
                <div>
                  <p className="text-white font-bold text-sm font-syne leading-none">Shahed IT</p>
                  <p className="text-amber-300/70 text-[10px] mt-0.5 flex items-center gap-1">
                    <Crown size={9} /> Admin Suite
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-amber-300/70 hover:text-amber-300 p-1.5 rounded-lg hover:bg-amber-400/10 transition-colors ml-auto"
          >
            {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav Groups */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-thin scrollbar-thumb-amber-400/20">
          {navGroups.map((group) => {
            const isOpen = collapsed ? false : (openGroups[group.title] ?? false);
            return (
              <div key={group.title} className="mb-1">
                {!collapsed && (
                  <button
                    onClick={() => setOpenGroups({ ...openGroups, [group.title]: !isOpen })}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-amber-300/50 hover:text-amber-300/80 transition-colors"
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
                                  ? "bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent text-amber-100 border border-amber-400/30 shadow-[0_4px_16px_-8px_rgba(245,158,11,0.5)]"
                                  : "text-slate-400 hover:text-amber-100 hover:bg-amber-400/5"
                              }`}
                            >
                              {active && (
                                <motion.span
                                  layoutId="activeNav"
                                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-amber-300 to-amber-600 rounded-r-full"
                                />
                              )}
                              <item.icon size={16} className={active ? "text-amber-300" : ""} />
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
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
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
        <div className="p-3 border-t border-amber-400/10">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <Avatar className="w-9 h-9 flex-shrink-0 ring-2 ring-amber-400/30">
              <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-700 text-black text-xs font-bold">
                {user?.email?.[0]?.toUpperCase() ?? "A"}
              </AvatarFallback>
            </Avatar>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                  <p className="text-amber-100 text-xs font-medium truncate">{user?.email}</p>
                  <p className="text-amber-300/60 text-[10px] capitalize flex items-center gap-1">
                    <Crown size={9} /> {role ?? "admin"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            {!collapsed && (
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-slate-400 hover:text-rose-400 h-7 w-7 flex-shrink-0">
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
          className="h-16 border-b border-amber-400/10 flex items-center justify-between px-6 flex-shrink-0"
          style={{ background: "rgba(8,8,11,0.6)", backdropFilter: "blur(16px)" }}
        >
          <div>
            <h2 className="text-amber-100 font-semibold text-sm font-syne">{currentTitle}</h2>
            <p className="text-amber-300/50 text-xs">Shahed IT — Admin Suite</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              target="_blank"
              className="hidden md:inline-flex items-center gap-1.5 text-amber-200 hover:text-amber-100 text-xs bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              View Site <ExternalLink size={12} />
            </Link>

            <Popover>
              <PopoverTrigger asChild>
                <button className="relative text-amber-300/80 hover:text-amber-200 p-2 rounded-lg hover:bg-amber-400/10 transition-colors">
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-80 p-0 bg-zinc-950/95 backdrop-blur-xl border-amber-400/20"
              >
                <div className="p-3 border-b border-amber-400/10 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-amber-100 font-syne">Notifications</h3>
                  <Badge variant="outline" className="text-[10px] border-amber-400/30 text-amber-300">
                    {unreadCount} new
                  </Badge>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-8">No new activity</p>
                  ) : (
                    notifications.map((n, i) => (
                      <Link key={i} to={n.link}>
                        <div className="px-3 py-2.5 hover:bg-amber-400/5 border-b border-amber-400/5 cursor-pointer">
                          <p className="text-xs text-amber-100">{n.title}</p>
                          <p className="text-[10px] text-amber-300/50 mt-0.5">
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
