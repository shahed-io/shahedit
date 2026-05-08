import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Settings, Users, Briefcase, FolderOpen, FileText,
  MessageSquare, Star, UserCheck, Building2, DollarSign, HelpCircle,
  Inbox, ChevronLeft, Menu, LogOut, Bell, Shield, Cpu, Package, CreditCard, LayoutTemplate, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Leads", icon: Inbox, href: "/admin/leads" },
  { label: "Payments", icon: CreditCard, href: "/admin/payments" },
  { label: "Orders & Delivery", icon: Package, href: "/admin/orders" },
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
  { label: "SEO & Analytics", icon: Search, href: "/admin/seo" },
  { label: "Site Settings", icon: Settings, href: "/admin/settings" },
];

interface AdminLayoutProps { children: React.ReactNode; }

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

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col overflow-hidden"
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800 h-16">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center">
                  <Cpu size={16} className="text-white" />
                </div>
                <span className="text-white font-bold text-sm">Shahed IT</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors ml-auto"
          >
            {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {navItems.map((item) => {
            const active = location.pathname === item.href ||
              (item.href !== "/admin" && location.pathname.startsWith(item.href));
            return (
              <Link key={item.href} to={item.href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-purple-600/30 to-teal-600/20 text-white border border-purple-500/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <item.icon size={18} className={active ? "text-purple-400" : ""} />
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
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-slate-800">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-teal-500 text-white text-xs">
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
                  <p className="text-white text-xs font-medium truncate">{user?.email}</p>
                  <p className="text-slate-400 text-xs capitalize flex items-center gap-1">
                    <Shield size={10} />
                    {role ?? "admin"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="text-slate-400 hover:text-red-400 h-7 w-7 flex-shrink-0"
              >
                <LogOut size={14} />
              </Button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 flex-shrink-0">
          <div>
            <h2 className="text-white font-semibold text-sm">
              {navItems.find(n => location.pathname === n.href || (n.href !== "/admin" && location.pathname.startsWith(n.href)))?.label ?? "Admin Panel"}
            </h2>
            <p className="text-slate-500 text-xs">Shahed IT Management System</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" target="_blank" className="text-slate-400 hover:text-white text-xs bg-slate-800 px-3 py-1.5 rounded-lg transition-colors">
              View Site →
            </Link>
            <button className="text-slate-400 hover:text-white relative">
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
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
