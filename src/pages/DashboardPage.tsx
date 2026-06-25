import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  LayoutDashboard, User, FileText, Clock, CheckCircle2,
  AlertCircle, MessageSquare, Star, Zap, ArrowRight,
  TrendingUp, Package, LogOut, ChevronRight, Calendar, Mail, Shield,
  CreditCard, Bell, FolderOpen, Upload, Download, Eye, X, Check,
  Banknote, Phone, Save, Camera, Receipt, Menu, Sparkles, ArrowUpRight,
  Wallet, ClipboardList,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { openInvoice } from "@/lib/invoice";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────
interface Lead {
  id: string; name: string; email: string;
  service_interested: string | null; budget_range: string | null;
  status: string | null; source: string | null; created_at: string;
}
interface Profile {
  full_name: string | null; username: string | null;
  avatar_url: string | null; phone: string | null; bio: string | null;
}
interface Payment {
  id: string; name: string; phone: string; email: string | null;
  service: string | null; amount: number; payment_method: string;
  transaction_id: string; status: string; created_at: string;
}
interface Notification {
  id: string; title: string; body: string; type: string;
  is_read: boolean; link: string | null; created_at: string;
}
interface ClientDocument {
  id: string; title: string; description: string | null; file_url: string;
  file_type: string; file_size: number | null; created_at: string;
}
interface Order {
  id: string; order_number: string; product_title: string;
  amount: number; currency: string; status: string;
  delivery_days: number | null; expected_delivery_at: string | null;
  delivered_at: string | null; delivery_notes: string | null;
  delivery_files: Array<{ url: string; name: string }> | null;
  payment_method: string | null; created_at: string;
}

type TabKey = "overview" | "orders" | "quotes" | "payments" | "documents" | "downloads" | "profile";

// ── Status maps using semantic tokens ────────────────────────────────────────
const statusConfig: Record<string, { label: string; tone: string; icon: React.ElementType }> = {
  new:         { label: "নতুন",          tone: "info",    icon: AlertCircle },
  in_progress: { label: "প্রক্রিয়াধীন",  tone: "warning", icon: Clock },
  contacted:   { label: "যোগাযোগ হয়েছে", tone: "primary", icon: MessageSquare },
  converted:   { label: "সম্পন্ন",        tone: "success", icon: CheckCircle2 },
  closed:      { label: "বন্ধ",           tone: "danger",  icon: AlertCircle },
};
const paymentStatusConfig: Record<string, { label: string; tone: string }> = {
  pending:  { label: "Pending",  tone: "warning" },
  verified: { label: "Verified", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
};

const toneClass = (tone: string) => {
  switch (tone) {
    case "success": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "warning": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "danger":  return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    case "info":    return "bg-sky-500/10 text-sky-400 border-sky-500/20";
    case "primary": return "bg-primary/10 text-primary border-primary/20";
    default:        return "bg-muted text-muted-foreground border-border";
  }
};
const toneIconBg = (tone: string) => {
  switch (tone) {
    case "success": return "bg-emerald-500/15 text-emerald-400";
    case "warning": return "bg-amber-500/15 text-amber-400";
    case "danger":  return "bg-rose-500/15 text-rose-400";
    case "info":    return "bg-sky-500/15 text-sky-400";
    case "primary": return "bg-primary/15 text-primary";
    case "accent":  return "bg-accent/15 text-accent";
    default:        return "bg-muted text-muted-foreground";
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } }),
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatBytes(b: number | null) {
  if (!b) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}
function fileIcon(type: string) {
  if (type.includes("pdf")) return "📄";
  if (type.includes("image")) return "🖼️";
  if (type.includes("zip")) return "📦";
  return "📁";
}
const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-BD", { year: "numeric", month: "short", day: "numeric" });

// ── Reusable UI ──────────────────────────────────────────────────────────────
const Panel = ({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_20px_40px_-20px_rgba(0,0,0,0.5)]",
      className
    )}
    {...rest}
  >
    {children}
  </div>
);

const SectionHead = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => (
  <div className="flex items-end justify-between gap-3 mb-5">
    <div>
      <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">{title}</h2>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

const EmptyState = ({ icon: Icon, title, desc, cta }: { icon: React.ElementType; title: string; desc: string; cta?: React.ReactNode }) => (
  <Panel className="p-12 text-center">
    <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
      <Icon size={24} />
    </div>
    <h3 className="font-bold text-foreground mb-1.5">{title}</h3>
    <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">{desc}</p>
    {cta}
  </Panel>
);

// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const [editProfile, setEditProfile] = useState<Profile>({ full_name: null, username: null, avatar_url: null, phone: null, bio: null });
  const [savingProfile, setSavingProfile] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    Promise.all([
      supabase.from("profiles").select("full_name,username,avatar_url,phone,bio").eq("user_id", user.id).single(),
      supabase.from("leads").select("*").eq("email", user.email ?? "").order("created_at", { ascending: false }),
      supabase.from("payment_submissions").select("*").eq("email", user.email ?? "").order("created_at", { ascending: false }),
      supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("client_documents").select("*").eq("client_email", user.email ?? "").eq("is_visible", true).order("created_at", { ascending: false }),
      supabase.from("user_roles").select("role").eq("user_id", user.id),
      (supabase as any).from("orders").select("*").eq("customer_email", user.email ?? "").order("created_at", { ascending: false }),
    ]).then(([profileRes, leadsRes, paymentsRes, notifRes, docsRes, rolesRes, ordersRes]) => {
      if (profileRes.data) {
        setProfile(profileRes.data as Profile);
        setEditProfile(profileRes.data as Profile);
      }
      if (leadsRes.data) setLeads(leadsRes.data as Lead[]);
      if (paymentsRes.data) setPayments(paymentsRes.data as Payment[]);
      if (notifRes.data) setNotifications(notifRes.data as Notification[]);
      if (docsRes.data) setDocuments(docsRes.data as ClientDocument[]);
      if (ordersRes?.data) setOrders(ordersRes.data as Order[]);
      if (rolesRes.data?.length) {
        setIsAdmin(rolesRes.data.some(r => ["super_admin", "admin", "editor"].includes(r.role)));
      }
      setLoading(false);
    });
  }, [user, navigate]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("লগআউট হয়েছে");
    navigate("/");
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (!unreadIds.length) return;
    await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const markOneRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase.from("profiles")
      .update({
        full_name: editProfile.full_name,
        username: editProfile.username,
        phone: editProfile.phone,
        bio: editProfile.bio,
      })
      .eq("user_id", user.id);
    setSavingProfile(false);
    if (error) { toast.error("সংরক্ষণ ব্যর্থ হয়েছে"); return; }
    setProfile({ ...editProfile });
    toast.success("প্রোফাইল আপডেট হয়েছে ✅");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const ext = file.name.split(".").pop();
    const path = `avatars/${user.id}.${ext}`;
    const { error: upErr } = await supabase.storage.from("cms-media").upload(path, file, { upsert: true });
    if (upErr) { toast.error("ছবি আপলোড ব্যর্থ হয়েছে"); return; }
    const { data } = supabase.storage.from("cms-media").getPublicUrl(path);
    const url = data.publicUrl;
    await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", user.id);
    setEditProfile(p => ({ ...p, avatar_url: url }));
    setProfile(p => p ? { ...p, avatar_url: url } : p);
    toast.success("ছবি আপডেট হয়েছে ✅");
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const initials = profile?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    || user?.email?.[0].toUpperCase() || "?";

  const statusCounts = leads.reduce((acc, l) => {
    const s = l.status ?? "new"; acc[s] = (acc[s] || 0) + 1; return acc;
  }, {} as Record<string, number>);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const totalSpent = payments.filter(p => p.status === "verified").reduce((a, p) => a + p.amount, 0);
  const activeOrders = orders.filter(o => o.status === "in_progress" || o.status === "pending").length;

  const stats = [
    { label: "Active Orders",   value: activeOrders,                    sub: `${orders.length} মোট অর্ডার`, icon: Package,      tone: "primary" },
    { label: "মোট কোটেশন",      value: leads.length,                    sub: `${statusCounts["converted"] || 0} সম্পন্ন`, icon: ClipboardList, tone: "info" },
    { label: "Verified Payment", value: payments.filter(p => p.status === "verified").length, sub: `৳${totalSpent.toLocaleString("en-IN")} মোট`, icon: Wallet,        tone: "success" },
    { label: "Documents",        value: documents.length,                sub: "Admin-shared files", icon: FolderOpen, tone: "accent" },
  ];

  const tabs: { key: TabKey; label: string; icon: React.ElementType; badge?: number }[] = [
    { key: "overview",  label: "Overview",   icon: LayoutDashboard },
    { key: "orders",    label: "My Orders",  icon: Package, badge: activeOrders || undefined },
    { key: "quotes",    label: "Quotations", icon: FileText, badge: leads.length || undefined },
    { key: "payments",  label: "Payments",   icon: CreditCard },
    { key: "documents", label: "Documents",  icon: FolderOpen, badge: documents.length || undefined },
    { key: "downloads", label: "My Downloads", icon: Package },
    { key: "profile",   label: "Profile",    icon: User },
  ];

  // ── Side Nav (used desktop + mobile sheet) ─────────────────────────────────
  const SideNav = ({ onPick }: { onPick?: () => void }) => (
    <nav className="flex flex-col gap-1">
      {tabs.map(({ key, label, icon: Icon, badge }) => {
        const active = activeTab === key;
        return (
          <button
            key={key}
            onClick={() => { setActiveTab(key); onPick?.(); }}
            className={cn(
              "group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all relative",
              active
                ? "bg-primary/12 text-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.25)]"
                : "text-muted-foreground hover:text-foreground hover:bg-card/60"
            )}
          >
            {active && (
              <motion.span
                layoutId="dash-active-pill"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Icon size={16} className={active ? "text-primary" : ""} />
            <span className="flex-1 text-left">{label}</span>
            {badge !== undefined && (
              <span className={cn(
                "min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full inline-flex items-center justify-center",
                active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>{badge}</span>
            )}
          </button>
        );
      })}

      <div className="h-px bg-border/60 my-3" />

      <Link to="/get-quote" onClick={onPick}
        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card/60 transition-all">
        <Sparkles size={16} className="text-accent" /> নতুন কোটেশন
      </Link>
      <Link to="/services" onClick={onPick}
        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card/60 transition-all">
        <Zap size={16} className="text-amber-400" /> Services
      </Link>
      {isAdmin && (
        <Link to="/ceo" onClick={onPick}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card/60 transition-all">
          <Shield size={16} className="text-emerald-400" /> Admin Panel
        </Link>
      )}
      <button onClick={handleLogout}
        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-300/80 hover:text-rose-200 hover:bg-rose-500/10 transition-all">
        <LogOut size={16} /> Logout
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* ─── Background gradient mesh ─── */}
      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-24 w-[480px] h-[480px] rounded-full bg-primary/15 blur-[120px]" />
          <div className="absolute top-40 -right-32 w-[420px] h-[420px] rounded-full bg-accent/15 blur-[120px]" />
        </div>

        <div className="relative container mx-auto px-4 py-8 max-w-7xl">

          {/* ─── Topbar (greeting + actions) ─── */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 min-w-0">
              <button
                className="lg:hidden w-10 h-10 rounded-xl border border-border bg-card/60 flex items-center justify-center text-foreground"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={18} />
              </button>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-11 h-11 rounded-2xl object-cover ring-2 ring-primary/30" />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-accent text-white font-black flex items-center justify-center shrink-0">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight truncate">
                  স্বাগতম, {profile?.full_name?.split(" ")[0] || "User"} 👋
                </h1>
                <p className="text-[11px] sm:text-xs text-muted-foreground flex items-center gap-1 truncate">
                  <Mail size={11} /> {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(v => !v)}
                  className="relative w-10 h-10 rounded-xl border border-border bg-card/60 hover:bg-card text-foreground/80 hover:text-foreground transition-all flex items-center justify-center"
                >
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full inline-flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 top-12 w-80 rounded-2xl overflow-hidden z-50 shadow-2xl bg-popover border border-border"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <span className="text-sm font-bold text-foreground">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs font-semibold text-primary flex items-center gap-1">
                            <Check size={11} /> সব পড়া হয়েছে
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="py-10 text-center text-muted-foreground text-sm">কোনো notification নেই</div>
                        ) : notifications.map(n => (
                          <button key={n.id}
                            onClick={() => { markOneRead(n.id); if (n.link) navigate(n.link); setNotifOpen(false); }}
                            className={cn(
                              "w-full flex items-start gap-3 px-4 py-3 text-left transition-all hover:bg-muted/40 border-b border-border/50 last:border-0",
                              !n.is_read && "bg-primary/5"
                            )}
                          >
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", toneIconBg(
                              n.type === "success" ? "success" : n.type === "warning" ? "warning" : n.type === "error" ? "danger" : "primary"
                            ))}>
                              <Bell size={13} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-foreground leading-snug">{n.title}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                              <p className="text-[10px] text-muted-foreground/70 mt-1">
                                {new Date(n.created_at).toLocaleDateString("en-BD", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                            {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to="/get-quote" className="hidden sm:inline-flex">
                <button className="inline-flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-semibold text-primary-foreground bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                  <Sparkles size={14} /> নতুন অনুরোধ
                </button>
              </Link>
            </div>
          </div>

          {/* ─── Main grid: sidebar + content ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-6">

            {/* Desktop sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <Panel className="p-3">
                  <div className="px-3 py-2 mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Dashboard</p>
                  </div>
                  <SideNav />
                </Panel>
              </div>
            </aside>

            {/* Mobile drawer */}
            <AnimatePresence>
              {mobileNavOpen && (
                <>
                  <motion.div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setMobileNavOpen(false)}
                  />
                  <motion.aside
                    className="fixed left-0 top-0 bottom-0 w-72 z-50 lg:hidden bg-card border-r border-border p-4 overflow-y-auto"
                    initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
                    transition={{ type: "spring", stiffness: 320, damping: 32 }}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <p className="text-sm font-bold text-foreground">Menu</p>
                      <button onClick={() => setMobileNavOpen(false)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <X size={16} />
                      </button>
                    </div>
                    <SideNav onPick={() => setMobileNavOpen(false)} />
                  </motion.aside>
                </>
              )}
            </AnimatePresence>

            {/* ── Content area ── */}
            <main className="min-w-0">

              {/* ══════════════════ OVERVIEW TAB ══════════════════ */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Stat cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((s, i) => (
                      <motion.div key={s.label} custom={i} variants={cardVariants} initial="hidden" animate="visible">
                        <Panel className="p-5 h-full">
                          <div className="flex items-start justify-between mb-4">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", toneIconBg(s.tone))}>
                              <s.icon size={18} />
                            </div>
                            <ArrowUpRight size={16} className="text-muted-foreground/50" />
                          </div>
                          <p className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">{s.value}</p>
                          <p className="text-xs font-semibold text-foreground/80 mt-1">{s.label}</p>
                          <p className="text-[11px] text-muted-foreground mt-1">{s.sub}</p>
                        </Panel>
                      </motion.div>
                    ))}
                  </div>

                  {/* Main grid: actions + recent */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* Quick actions */}
                    <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible" className="xl:col-span-1">
                      <Panel className="p-6 h-full">
                        <SectionHead title="Quick Actions" subtitle="দ্রুত কাজ" />
                        <div className="space-y-2.5">
                          {[
                            { label: "নতুন কোটেশন অনুরোধ", href: "/get-quote",  icon: FileText,  tone: "primary" },
                            { label: "Services দেখুন",      href: "/services",   icon: Package,   tone: "accent" },
                            { label: "Portfolio",            href: "/portfolio",  icon: Star,      tone: "warning" },
                            { label: "Payment করুন",        href: "/payment",    icon: CreditCard, tone: "success" },
                          ].map(({ label, href, icon: Icon, tone }) => (
                            <Link key={href} to={href}>
                              <motion.div whileHover={{ x: 4 }}
                                className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-primary/30 transition-all group">
                                <div className="flex items-center gap-3">
                                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", toneIconBg(tone))}>
                                    <Icon size={15} />
                                  </div>
                                  <span className="text-sm font-medium text-foreground">{label}</span>
                                </div>
                                <ChevronRight size={15} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                              </motion.div>
                            </Link>
                          ))}
                        </div>
                      </Panel>
                    </motion.div>

                    {/* Recent quotes */}
                    <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible" className="xl:col-span-2">
                      <Panel className="p-6 h-full">
                        <SectionHead
                          title="সাম্প্রতিক কোটেশন"
                          subtitle={`${leads.length} টি অনুরোধ`}
                          action={leads.length > 0 && (
                            <button onClick={() => setActiveTab("quotes")}
                              className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1">
                              সব দেখুন <ArrowRight size={12} />
                            </button>
                          )}
                        />
                        {leads.length === 0 ? (
                          <div className="text-center py-10">
                            <FileText size={32} className="mx-auto text-muted-foreground/40 mb-3" />
                            <p className="text-sm text-muted-foreground mb-4">এখনও কোনো কোটেশন নেই</p>
                            <Link to="/get-quote">
                              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-primary-foreground bg-gradient-to-r from-primary to-accent">
                                <FileText size={12} /> কোটেশন অনুরোধ
                              </button>
                            </Link>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {leads.slice(0, 5).map(lead => {
                              const cfg = statusConfig[lead.status ?? "new"] || statusConfig.new;
                              const SIcon = cfg.icon;
                              return (
                                <div key={lead.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/50 bg-muted/15 hover:bg-muted/30 transition-colors">
                                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", toneIconBg(cfg.tone))}>
                                    <SIcon size={14} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-foreground truncate">{lead.service_interested || "Service Request"}</p>
                                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                      <Calendar size={10} /> {fmtDate(lead.created_at)}
                                    </p>
                                  </div>
                                  <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-lg border", toneClass(cfg.tone))}>
                                    {cfg.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </Panel>
                    </motion.div>
                  </div>

                  {/* Two-column: payments + documents */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent payments */}
                    <motion.div custom={6} variants={cardVariants} initial="hidden" animate="visible">
                      <Panel className="p-6 h-full">
                        <SectionHead
                          title="সাম্প্রতিক Payment"
                          subtitle={`মোট spent: ৳${totalSpent.toLocaleString("en-IN")}`}
                          action={payments.length > 0 && (
                            <button onClick={() => setActiveTab("payments")}
                              className="text-xs font-semibold text-primary flex items-center gap-1">
                              সব দেখুন <ArrowRight size={12} />
                            </button>
                          )}
                        />
                        {payments.length === 0 ? (
                          <div className="text-center py-10">
                            <Banknote size={32} className="mx-auto text-muted-foreground/40 mb-3" />
                            <p className="text-sm text-muted-foreground">কোনো payment পাওয়া যায়নি</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {payments.slice(0, 4).map(p => {
                              const cfg = paymentStatusConfig[p.status] || paymentStatusConfig.pending;
                              return (
                                <div key={p.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/50 bg-muted/15">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", toneIconBg("primary"))}>
                                      <CreditCard size={14} />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-foreground truncate">{p.service || "Payment"}</p>
                                      <p className="text-[11px] text-muted-foreground">{p.payment_method} · {fmtDate(p.created_at)}</p>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-sm font-black text-emerald-400">৳{p.amount.toLocaleString("en-IN")}</p>
                                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-md border inline-block mt-0.5", toneClass(cfg.tone))}>
                                      {cfg.label}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </Panel>
                    </motion.div>

                    {/* Documents */}
                    <motion.div custom={7} variants={cardVariants} initial="hidden" animate="visible">
                      <Panel className="p-6 h-full">
                        <SectionHead
                          title="Shared Documents"
                          subtitle="Admin শেয়ার করা files"
                          action={documents.length > 0 && (
                            <button onClick={() => setActiveTab("documents")}
                              className="text-xs font-semibold text-primary flex items-center gap-1">
                              সব দেখুন <ArrowRight size={12} />
                            </button>
                          )}
                        />
                        {documents.length === 0 ? (
                          <div className="text-center py-10">
                            <FolderOpen size={32} className="mx-auto text-muted-foreground/40 mb-3" />
                            <p className="text-sm text-muted-foreground">কোনো document নেই</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {documents.slice(0, 4).map(doc => (
                              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/15">
                                <span className="text-xl">{fileIcon(doc.file_type)}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                                  <p className="text-[11px] text-muted-foreground">{formatBytes(doc.file_size)}</p>
                                </div>
                                <a href={doc.file_url} target="_blank" rel="noreferrer"
                                  className="w-8 h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors">
                                  <Download size={14} />
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </Panel>
                    </motion.div>
                  </div>
                </div>
              )}

              {/* ══════════════════ ORDERS TAB ══════════════════ */}
              {activeTab === "orders" && (
                <div className="space-y-4">
                  <SectionHead title="আমার অর্ডার ও ডেলিভারি" subtitle="প্রতিটি অর্ডারের timeline ও status" />

                  {orders.length === 0 ? (
                    <EmptyState icon={Package} title="কোনো অর্ডার নেই"
                      desc="পেমেন্ট সম্পন্ন হলে আপনার অর্ডার এখানে দেখাবে।" />
                  ) : orders.map((o, i) => {
                    const orderStatus: Record<string, { label: string; tone: string; icon: React.ElementType }> = {
                      pending:     { label: "Payment Pending", tone: "warning", icon: Clock },
                      in_progress: { label: "প্রক্রিয়াধীন",   tone: "primary", icon: Zap },
                      delivered:   { label: "Delivered",       tone: "success", icon: CheckCircle2 },
                      cancelled:   { label: "Cancelled",       tone: "danger",  icon: X },
                    };
                    const cfg = orderStatus[o.status] || orderStatus.pending;
                    const SIcon = cfg.icon;
                    const eta = o.expected_delivery_at ? new Date(o.expected_delivery_at) : null;
                    const daysLeft = eta ? Math.ceil((eta.getTime() - Date.now()) / 86400000) : null;
                    const totalDays = o.delivery_days ?? 7;
                    const elapsed = eta ? Math.max(0, totalDays - (daysLeft ?? 0)) : 0;
                    const progress = o.status === "delivered" ? 100
                      : o.status === "cancelled" ? 0
                      : o.status === "in_progress" ? Math.min(95, Math.max(8, (elapsed / totalDays) * 100))
                      : 5;
                    return (
                      <motion.div key={o.id} custom={i} variants={cardVariants} initial="hidden" animate="visible">
                        <Panel className="p-5">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", toneIconBg(cfg.tone))}>
                                <SIcon size={18} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-foreground truncate">{o.product_title}</p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground mt-1">
                                  <span className="font-mono">#{o.order_number}</span>
                                  <span className="flex items-center gap-1"><Calendar size={10} /> {fmtDate(o.created_at)}</span>
                                  {o.payment_method && <span>{o.payment_method}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col sm:items-end gap-2 shrink-0">
                              <p className="text-xl font-black text-emerald-400">৳{o.amount.toLocaleString("en-IN")}</p>
                              <span className={cn("text-[11px] font-semibold px-3 py-1 rounded-lg border w-fit", toneClass(cfg.tone))}>
                                {cfg.label}
                              </span>
                            </div>
                          </div>

                          {o.status !== "cancelled" && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-2">
                                <span className="flex items-center gap-1.5"><Clock size={11} /> ডেলিভারি timeline</span>
                                <span className="font-semibold text-foreground/80">
                                  {o.status === "delivered" && o.delivered_at
                                    ? `Delivered: ${fmtDate(o.delivered_at)}`
                                    : eta ? `ETA: ${eta.toLocaleDateString("en-BD", { month: "short", day: "numeric" })} (${daysLeft! > 0 ? daysLeft + " দিন বাকি" : "Today"})`
                                    : `${totalDays} দিন (পেমেন্ট verify-এর পর শুরু)`}
                                </span>
                              </div>
                              <div className="h-2 rounded-full overflow-hidden bg-muted">
                                <motion.div
                                  initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                                  transition={{ duration: 0.8, ease: "easeOut" }}
                                  className={cn("h-full rounded-full",
                                    o.status === "delivered"
                                      ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                                      : "bg-gradient-to-r from-primary to-accent"
                                  )}
                                />
                              </div>
                            </div>
                          )}

                          {o.delivery_notes && (
                            <div className="mt-4 p-3 rounded-xl text-sm text-foreground/85 bg-primary/5 border border-primary/15">
                              <p className="text-[11px] font-semibold text-primary mb-1">📋 Admin থেকে বার্তা</p>
                              {o.delivery_notes}
                            </div>
                          )}

                          {o.delivery_files && o.delivery_files.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <p className="text-[11px] font-semibold text-muted-foreground">📦 Delivered files</p>
                              <div className="grid sm:grid-cols-2 gap-2">
                                {o.delivery_files.map((f, idx) => (
                                  <a key={idx} href={f.url} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-2 p-2.5 rounded-xl text-xs bg-muted/30 border border-border hover:bg-muted/50 transition">
                                    <Download size={13} className="text-primary shrink-0" />
                                    <span className="truncate flex-1 text-foreground/85">{f.name}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </Panel>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* ══════════════════ QUOTES TAB ══════════════════ */}
              {activeTab === "quotes" && (
                <div className="space-y-4">
                  <SectionHead
                    title="আপনার সব কোটেশন অনুরোধ"
                    subtitle={`${leads.length} টি অনুরোধ`}
                    action={
                      <Link to="/get-quote">
                        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-primary-foreground bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/20">
                          <FileText size={12} /> নতুন অনুরোধ
                        </button>
                      </Link>
                    }
                  />
                  {leads.length === 0 ? (
                    <EmptyState icon={FileText} title="কোনো কোটেশন পাওয়া যায়নি"
                      desc="আপনার প্রথম কোটেশন অনুরোধ পাঠান এবং দ্রুত মূল্য পান।"
                      cta={<Link to="/get-quote"><button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-primary-foreground bg-gradient-to-r from-primary to-accent">
                        <FileText size={14} /> কোটেশন অনুরোধ
                      </button></Link>}
                    />
                  ) : leads.map((lead, i) => {
                    const cfg = statusConfig[lead.status ?? "new"] || statusConfig.new;
                    const SIcon = cfg.icon;
                    return (
                      <motion.div key={lead.id} custom={i} variants={cardVariants} initial="hidden" animate="visible">
                        <Panel className="p-5">
                          <div className="flex items-start gap-4">
                            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", toneIconBg(cfg.tone))}>
                              <SIcon size={18} />
                            </div>
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-foreground">{lead.service_interested || "Service Request"}</h3>
                                <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-lg border", toneClass(cfg.tone))}>
                                  {cfg.label}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-4 text-[11px] text-muted-foreground">
                                {lead.budget_range && (
                                  <span className="flex items-center gap-1"><TrendingUp size={11} /> Budget: {lead.budget_range}</span>
                                )}
                                <span className="flex items-center gap-1"><Calendar size={11} /> {fmtDate(lead.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        </Panel>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* ══════════════════ PAYMENTS TAB ══════════════════ */}
              {activeTab === "payments" && (
                <div className="space-y-4">
                  <SectionHead
                    title="Payment ইতিহাস"
                    subtitle="সব transactions ও invoice"
                    action={
                      <Link to="/payment">
                        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-primary-foreground bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/20">
                          <CreditCard size={12} /> নতুন Payment
                        </button>
                      </Link>
                    }
                  />

                  {payments.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "মোট পেমেন্ট",  value: `৳${payments.reduce((a, p) => a + p.amount, 0).toLocaleString("en-IN")}`, tone: "primary", icon: Wallet },
                        { label: "Verified",      value: payments.filter(p => p.status === "verified").length, tone: "success", icon: CheckCircle2 },
                        { label: "Pending",       value: payments.filter(p => p.status === "pending").length,  tone: "warning", icon: Clock },
                      ].map(s => (
                        <Panel key={s.label} className="p-4">
                          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-2", toneIconBg(s.tone))}>
                            <s.icon size={16} />
                          </div>
                          <p className="text-xl font-black text-foreground">{s.value}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
                        </Panel>
                      ))}
                    </div>
                  )}

                  {payments.length === 0 ? (
                    <EmptyState icon={Banknote} title="কোনো payment নেই"
                      desc="আপনার payment history এখানে দেখাবে।" />
                  ) : payments.map((p, i) => {
                    const cfg = paymentStatusConfig[p.status] || paymentStatusConfig.pending;
                    return (
                      <motion.div key={p.id} custom={i} variants={cardVariants} initial="hidden" animate="visible">
                        <Panel className="p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-4 min-w-0">
                              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", toneIconBg("primary"))}>
                                <CreditCard size={18} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-foreground truncate">{p.service || "Payment"}</p>
                                <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground mt-1">
                                  <span className="flex items-center gap-1"><Phone size={10} /> {p.phone}</span>
                                  <span>{p.payment_method}</span>
                                  <span className="flex items-center gap-1"><Calendar size={10} /> {fmtDate(p.created_at)}</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground/70 mt-1">TxID: {p.transaction_id}</p>
                              </div>
                            </div>
                            <div className="flex flex-col sm:items-end gap-2 shrink-0">
                              <p className="text-xl font-black text-emerald-400">৳{p.amount.toLocaleString("en-IN")}</p>
                              <span className={cn("text-[11px] font-semibold px-3 py-1 rounded-lg border w-fit", toneClass(cfg.tone))}>
                                {cfg.label}
                              </span>
                              <button onClick={() => openInvoice(p as any)}
                                className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
                                <Receipt size={12} /> Invoice
                              </button>
                            </div>
                          </div>
                        </Panel>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* ══════════════════ DOCUMENTS TAB ══════════════════ */}
              {activeTab === "documents" && (
                <div className="space-y-4">
                  <SectionHead title="Shared Documents" subtitle="Admin শেয়ার করা files ও documents" />
                  {documents.length === 0 ? (
                    <EmptyState icon={FolderOpen} title="কোনো document নেই"
                      desc="Admin আপনার সাথে কোনো document শেয়ার করেনি।" />
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {documents.map((doc, i) => (
                        <motion.div key={doc.id} custom={i} variants={cardVariants} initial="hidden" animate="visible">
                          <Panel className="p-5 h-full flex flex-col">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-muted">
                                {fileIcon(doc.file_type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-foreground truncate">{doc.title}</p>
                                {doc.description && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.description}</p>
                                )}
                                <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                                  {doc.file_size && <span>{formatBytes(doc.file_size)}</span>}
                                  <span>{fmtDate(doc.created_at)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <a href={doc.file_url} target="_blank" rel="noreferrer" className="flex-1">
                                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
                                  <Eye size={14} /> View
                                </button>
                              </a>
                              <a href={doc.file_url} download className="flex-1">
                                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground bg-gradient-to-r from-primary to-accent">
                                  <Download size={14} /> Download
                                </button>
                              </a>
                            </div>
                          </Panel>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ══════════════════ MY DOWNLOADS TAB ══════════════════ */}
              {activeTab === "downloads" && (
                <div className="space-y-6">
                  <SectionHead title="My Downloads" subtitle="Digital file ও license key" />
                  <MyDownloadsSection />
                </div>
              )}

              {/* ══════════════════ PROFILE TAB ══════════════════ */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <SectionHead title="Profile সম্পাদনা" subtitle="আপনার তথ্য ও account settings" />

                  <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
                    <Panel className="p-6">
                      <h3 className="text-[11px] font-bold text-muted-foreground mb-4 uppercase tracking-wider">Profile Photo</h3>
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          {editProfile.avatar_url ? (
                            <img src={editProfile.avatar_url} alt="" className="w-20 h-20 rounded-2xl object-cover ring-2 ring-primary/30" />
                          ) : (
                            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white bg-gradient-to-br from-primary to-accent">
                              {initials}
                            </div>
                          )}
                          <button onClick={() => avatarInputRef.current?.click()}
                            className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl flex items-center justify-center text-white bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/40">
                            <Camera size={14} />
                          </button>
                          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{editProfile.full_name || "নাম যোগ করুন"}</p>
                          <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
                          <button onClick={() => avatarInputRef.current?.click()}
                            className="text-xs font-semibold mt-2 flex items-center gap-1 text-primary hover:text-primary/80">
                            <Upload size={11} /> ছবি পরিবর্তন করুন
                          </button>
                        </div>
                      </div>
                    </Panel>
                  </motion.div>

                  <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
                    <Panel className="p-6">
                      <h3 className="text-[11px] font-bold text-muted-foreground mb-4 uppercase tracking-wider">Personal Info</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {[
                          { key: "full_name", label: "পূর্ণ নাম", placeholder: "আপনার নাম", type: "text" },
                          { key: "username",  label: "Username",  placeholder: "username",   type: "text" },
                          { key: "phone",     label: "Phone",     placeholder: "01XXXXXXXXX", type: "tel" },
                        ].map(({ key, label, placeholder, type }) => (
                          <div key={key}>
                            <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">{label}</label>
                            <input
                              type={type}
                              value={(editProfile as unknown as Record<string, string | null>)[key] || ""}
                              onChange={e => setEditProfile(p => ({ ...p, [key]: e.target.value }))}
                              placeholder={placeholder}
                              className="w-full px-4 py-2.5 rounded-xl text-sm text-foreground bg-input/50 border border-border focus:border-primary focus:outline-none transition-colors"
                            />
                          </div>
                        ))}
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">Bio</label>
                          <textarea
                            value={editProfile.bio || ""}
                            onChange={e => setEditProfile(p => ({ ...p, bio: e.target.value }))}
                            placeholder="আপনার সম্পর্কে কিছু লিখুন..."
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl text-sm text-foreground bg-input/50 border border-border focus:border-primary focus:outline-none transition-colors resize-none"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end mt-5">
                        <motion.button
                          onClick={handleSaveProfile} disabled={savingProfile}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-primary-foreground bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/25 disabled:opacity-60"
                        >
                          {savingProfile
                            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <Save size={14} />}
                          {savingProfile ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তন সংরক্ষণ"}
                        </motion.button>
                      </div>
                    </Panel>
                  </motion.div>

                  <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
                    <Panel className="p-6">
                      <h3 className="text-[11px] font-bold text-muted-foreground mb-4 uppercase tracking-wider">Account Info</h3>
                      <div className="space-y-3">
                        {[
                          { label: "Email",        value: user?.email || "—" },
                          { label: "Account Type", value: isAdmin ? "Admin ব্যবহারকারী" : "Regular User" },
                          { label: "Member Since", value: user?.created_at ? new Date(user.created_at).toLocaleDateString("en-BD", { year: "numeric", month: "long", day: "numeric" }) : "—" },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                            <span className="text-xs text-muted-foreground">{label}</span>
                            <span className="text-sm font-medium text-foreground">{value}</span>
                          </div>
                        ))}
                      </div>
                    </Panel>
                  </motion.div>
                </div>
              )}

            </main>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
