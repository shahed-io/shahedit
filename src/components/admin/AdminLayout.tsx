import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Settings, Users, Briefcase, FolderOpen, FileText,
  MessageSquare, Star, UserCheck, Building2, DollarSign, HelpCircle,
  Inbox, ChevronLeft, Menu, LogOut, Bell, Shield, Cpu, Package, CreditCard, LayoutTemplate
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Leads", icon: Inbox, href: "/admin/leads" },
  { label: "Payments", icon: CreditCard, href: "/admin/payments" },
  { label: "Services", icon: Briefcase, href: "/admin/services" },
  { label: "Service Packages", icon: Package, href: "/admin/service-packages" },
  { label: "Portfolio", icon: FolderOpen, href: "/admin/portfolio" },
  { label: "Blog Posts", icon: FileText, href: "/admin/blog" },
  { label: "Testimonials", icon: Star, href: "/admin/testimonials" },
  { label: "Team", icon: UserCheck, href: "/admin/team" },
  { label: "Clients", icon: Building2, href: "/admin/clients" },
  { label: "Pricing", icon: DollarSign, href: "/admin/pricing" },
  { label: "FAQ", icon: HelpCircle, href: "/admin/faq" },
  { label: "Careers", icon: Users, href: "/admin/careers" },
  { label: "AI Support", icon: MessageSquare, href: "/admin/ai-support" },
  { label: "Admin Users", icon: Shield, href: "/admin/users" },
  { label: "Footer Editor", icon: LayoutTemplate, href: "/admin/footer" },
  { label: "Client Docs", icon: FolderOpen, href: "/admin/client-docs" },
  { label: "Site Settings", icon: Settings, href: "/admin/settings" },
];

interface AdminLayoutProps { children: React.ReactNode; }

const FB_BLUE = "#1877F2";

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, role, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/admin/login");
  };

  const activeItem = navItems.find(
    (n) => location.pathname === n.href || (n.href !== "/admin" && location.pathname.startsWith(n.href))
  );

  return (
    <div className="fb-theme flex h-screen overflow-hidden" style={{ background: "#F1F4F7" }}>
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 248 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex-shrink-0 flex flex-col overflow-hidden"
        style={{
          background: "#FFFFFF",
          borderRight: "1px solid #E4E6EB",
        }}
      >
        {/* Logo */}
        <div
          className="px-4 flex items-center justify-between h-14"
          style={{ borderBottom: "1px solid #E4E6EB" }}
        >
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: FB_BLUE }}
                >
                  <Cpu size={16} className="text-white" />
                </div>
                <span className="font-semibold text-[15px]" style={{ color: "#111112" }}>
                  Shahed IT
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg ml-auto transition-colors"
            style={{ color: "#666A72" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F1F4F7")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            const active =
              location.pathname === item.href ||
              (item.href !== "/admin" && location.pathname.startsWith(item.href));
            return (
              <Link key={item.href} to={item.href}>
                <div
                  className="flex items-center gap-3 px-3 rounded-lg text-[14px] font-medium transition-colors"
                  style={{
                    minHeight: 44,
                    background: active ? "rgba(24,119,242,0.1)" : "transparent",
                    color: active ? FB_BLUE : "#1C1E21",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = "#F1F4F7";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <item.icon size={18} style={{ color: active ? FB_BLUE : "#666A72" }} />
                  <AnimatePresence mode="wait">
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="truncate"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3" style={{ borderTop: "1px solid #E4E6EB" }}>
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <Avatar className="w-9 h-9 flex-shrink-0">
              <AvatarFallback className="text-white text-xs" style={{ background: FB_BLUE }}>
                {user?.email?.[0]?.toUpperCase() ?? "A"}
              </AvatarFallback>
            </Avatar>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-[13px] font-medium truncate" style={{ color: "#111112" }}>
                    {user?.email}
                  </p>
                  <p className="text-[11px] capitalize flex items-center gap-1" style={{ color: "#666A72" }}>
                    <Shield size={10} />
                    {role ?? "admin"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            {!collapsed && (
              <button
                onClick={handleSignOut}
                className="rounded-lg flex items-center justify-center transition-colors"
                style={{ width: 36, height: 36, color: "#666A72" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(211,17,48,0.08)";
                  e.currentTarget.style.color = "#D31130";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#666A72";
                }}
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="h-14 flex items-center justify-between px-6 flex-shrink-0"
          style={{
            background: "#FFFFFF",
            borderBottom: "1px solid #E4E6EB",
          }}
        >
          <div>
            <h2 className="text-[15px] font-semibold" style={{ color: "#111112" }}>
              {activeItem?.label ?? "Admin Panel"}
            </h2>
            <p className="text-[12px]" style={{ color: "#666A72" }}>
              Shahed IT Management System
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              target="_blank"
              className="text-[13px] font-medium px-3 rounded-lg transition-colors flex items-center"
              style={{
                background: "#F1F4F7",
                color: FB_BLUE,
                height: 40,
                border: "1px solid #E4E6EB",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#E4E6EB")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#F1F4F7")}
            >
              View Site →
            </Link>
            <button
              className="rounded-full flex items-center justify-center transition-colors"
              style={{ width: 40, height: 40, background: "#F1F4F7", color: "#1C1E21" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#E4E6EB")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#F1F4F7")}
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6" style={{ background: "#F1F4F7" }}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
