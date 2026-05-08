import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  LayoutDashboard, User, FileText, Clock, CheckCircle2,
  AlertCircle, MessageSquare, Star, Zap, ArrowRight,
  TrendingUp, Package, LogOut, ChevronRight, Calendar, Mail, Shield,
  CreditCard, Bell, FolderOpen, Upload, Download, Eye, X, Check,
  Banknote, Phone, Edit3, Save, Camera
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

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

// ── Configs ──────────────────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  new:         { label: "নতুন",          color: "hsl(210,90%,65%)",  bg: "rgba(59,130,246,0.12)",  icon: AlertCircle },
  in_progress: { label: "প্রক্রিয়াধীন",  color: "hsl(35,90%,60%)",  bg: "rgba(251,146,60,0.12)",  icon: Clock },
  contacted:   { label: "যোগাযোগ হয়েছে", color: "hsl(258,90%,66%)", bg: "rgba(139,92,246,0.12)", icon: MessageSquare },
  converted:   { label: "সম্পন্ন",        color: "hsl(145,70%,50%)",  bg: "rgba(34,197,94,0.12)",  icon: CheckCircle2 },
  closed:      { label: "বন্ধ",           color: "hsl(0,70%,60%)",   bg: "rgba(239,68,68,0.12)",  icon: AlertCircle },
};
const paymentStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: "Pending",  color: "hsl(35,90%,60%)",  bg: "rgba(251,146,60,0.12)" },
  verified: { label: "Verified", color: "hsl(145,70%,50%)", bg: "rgba(34,197,94,0.12)" },
  rejected: { label: "Rejected", color: "hsl(0,70%,60%)",  bg: "rgba(239,68,68,0.12)" },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }),
};

const CARD_STYLE = { background: '#FFFFFF', border: '1px solid #E4E6EB', boxShadow: '0 1px 2px rgba(0,0,0,0.06)' };
const EMPTY_STYLE = { background: '#F1F4F7', border: '1px dashed #D0D3D6' };
const GRAD = 'linear-gradient(135deg, #1877F2, #0866FF)';
const FB_BLUE = '#1877F2';

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

// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [activeTab, setActiveTab] = useState<"overview" | "quotes" | "payments" | "documents" | "profile">("overview");
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Profile edit state
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
    ]).then(([profileRes, leadsRes, paymentsRes, notifRes, docsRes, rolesRes]) => {
      if (profileRes.data) {
        setProfile(profileRes.data as Profile);
        setEditProfile(profileRes.data as Profile);
      }
      if (leadsRes.data) setLeads(leadsRes.data as Lead[]);
      if (paymentsRes.data) setPayments(paymentsRes.data as Payment[]);
      if (notifRes.data) setNotifications(notifRes.data as Notification[]);
      if (docsRes.data) setDocuments(docsRes.data as ClientDocument[]);
      if (rolesRes.data?.length) {
        setIsAdmin(rolesRes.data.some(r => ["super_admin", "admin", "editor"].includes(r.role)));
      }
      setLoading(false);
    });
  }, [user, navigate]);

  // Close notif dropdown on outside click
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
    <div className="fb-theme min-h-screen flex items-center justify-center" style={{ background: "#F1F4F7" }}>
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const initials = profile?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    || user?.email?.[0].toUpperCase() || "?";

  const statusCounts = leads.reduce((acc, l) => {
    const s = l.status ?? "new"; acc[s] = (acc[s] || 0) + 1; return acc;
  }, {} as Record<string, number>);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const stats = [
    { label: "মোট কোটেশন",      value: leads.length,                     icon: FileText,    color: "hsl(258,90%,66%)" },
    { label: "সম্পন্ন",          value: statusCounts["converted"] || 0,   icon: CheckCircle2, color: "hsl(145,70%,50%)" },
    { label: "পেমেন্ট",          value: payments.length,                  icon: CreditCard,  color: "hsl(185,100%,48%)" },
    { label: "ডকুমেন্ট",         value: documents.length,                 icon: FolderOpen,  color: "hsl(35,90%,60%)" },
  ];

  const tabs = [
    { key: "overview",  label: "Overview",  icon: LayoutDashboard },
    { key: "quotes",    label: "Quotations", icon: FileText },
    { key: "payments",  label: "Payments",  icon: CreditCard },
    { key: "documents", label: "Documents", icon: FolderOpen },
    { key: "profile",   label: "Profile",   icon: User },
  ] as const;

  return (
    <div className="fb-theme min-h-screen" style={{ background: "#F1F4F7" }}>
      <SiteHeader />
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* ── Top header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              {(profile?.avatar_url || editProfile.avatar_url) ? (
                <img src={profile?.avatar_url ?? ""} alt="avatar"
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-primary/30" />
              ) : (
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shrink-0"
                  style={{ background: GRAD }}>
                  {initials}
                </div>
              )}
              <div>
                <h1 className="text-xl font-black text-foreground">
                  আস্সালামু আলাইকুম, {profile?.full_name?.split(" ")[0] || "User"} 👋
                </h1>
                <p className="text-foreground/40 text-sm mt-0.5 flex items-center gap-1.5">
                  <Mail size={12} /> {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <motion.button
                  whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                  onClick={() => setNotifOpen(v => !v)}
                  className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                  style={{ background: '#F1F4F7', border: '1px solid #E4E6EB' }}>
                  <Bell size={17} className="text-foreground/70" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white rounded-full flex items-center justify-center"
                      style={{ background: 'hsl(0,84%,60%)' }}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-12 w-80 rounded-2xl overflow-hidden z-50 shadow-2xl"
                      style={{ background: '#FFFFFF', border: '1px solid #E4E6EB' }}>
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                        <span className="text-sm font-bold text-foreground">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead}
                            className="text-xs font-semibold flex items-center gap-1 transition-colors"
                            style={{ color: 'hsl(258,90%,70%)' }}>
                            <Check size={11} /> সব পড়া হয়েছে
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="py-10 text-center text-foreground/35 text-sm">কোনো notification নেই</div>
                        ) : notifications.map(n => (
                          <div key={n.id}
                            onClick={() => { markOneRead(n.id); if (n.link) navigate(n.link); setNotifOpen(false); }}
                            className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-all hover:bg-white/5 border-b border-white/4 last:border-0"
                            style={!n.is_read ? { background: 'rgba(139,92,246,0.06)' } : {}}>
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                              style={{
                                background: n.type === 'success' ? 'rgba(34,197,94,0.15)' :
                                  n.type === 'warning' ? 'rgba(251,146,60,0.15)' :
                                  n.type === 'error'   ? 'rgba(239,68,68,0.15)' : 'rgba(139,92,246,0.15)'
                              }}>
                              <Bell size={13} style={{
                                color: n.type === 'success' ? 'hsl(145,70%,50%)' :
                                  n.type === 'warning' ? 'hsl(35,90%,60%)' :
                                  n.type === 'error'   ? 'hsl(0,70%,60%)' : 'hsl(258,90%,70%)'
                              }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-foreground leading-snug">{n.title}</p>
                              <p className="text-[11px] text-foreground/45 mt-0.5 line-clamp-2">{n.body}</p>
                              <p className="text-[10px] text-foreground/25 mt-1">
                                {new Date(n.created_at).toLocaleDateString("en-BD", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                            {!n.is_read && (
                              <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: 'hsl(258,90%,66%)' }} />
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {isAdmin && (
                <Link to="/admin">
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{ background: GRAD, boxShadow: '0 4px 15px rgba(139,92,246,0.3)' }}>
                    <Shield size={14} /> Admin
                  </motion.button>
                </Link>
              )}
              <motion.button onClick={handleLogout} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ background: '#FEE7EA', border: '1px solid #F4C7CD', color: '#D31130' }}>
                <LogOut size={14} /> Logout
              </motion.button>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex gap-1 p-1 rounded-2xl mb-8 overflow-x-auto"
            style={{ background: '#FFFFFF', border: '1px solid #E4E6EB' }}>
            {tabs.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap"
                style={activeTab === key ? {
                  background: GRAD, color: 'white', boxShadow: '0 4px 15px rgba(139,92,246,0.3)',
                } : { color: 'rgba(255,255,255,0.45)' }}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {/* ══════════════════ OVERVIEW TAB ══════════════════ */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                  <motion.div key={s.label} custom={i} variants={cardVariants} initial="hidden" animate="visible"
                    className="rounded-2xl p-5" style={CARD_STYLE}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: `${s.color}20` }}>
                        <s.icon size={17} style={{ color: s.color }} />
                      </div>
                      <span className="text-2xl font-black" style={{ color: s.color }}>{s.value}</span>
                    </div>
                    <p className="text-xs text-foreground/45 font-medium">{s.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Quick actions */}
              <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible"
                className="rounded-2xl p-6" style={CARD_STYLE}>
                <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <Zap size={16} className="text-primary" /> Quick Actions
                </h2>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { label: "নতুন কোটেশন অনুরোধ", href: "/get-quote",  icon: FileText,  color: "hsl(258,90%,66%)" },
                    { label: "আমাদের Services",     href: "/services",   icon: Package,   color: "hsl(185,100%,48%)" },
                    { label: "Portfolio দেখুন",      href: "/portfolio",  icon: Star,      color: "hsl(35,90%,60%)" },
                  ].map(({ label, href, icon: Icon, color }) => (
                    <Link key={href} to={href}>
                      <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                        className="flex items-center justify-between p-4 rounded-xl cursor-pointer group transition-all"
                        style={{ background: `${color}0d`, border: `1px solid ${color}25` }}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: `${color}20` }}>
                            <Icon size={15} style={{ color }} />
                          </div>
                          <span className="text-sm font-medium text-foreground/70 group-hover:text-foreground transition-colors">{label}</span>
                        </div>
                        <ChevronRight size={14} className="text-foreground/30 group-hover:text-foreground/70 transition-colors" />
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </motion.div>

              {/* Recent quotes preview */}
              {leads.length > 0 && (
                <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible"
                  className="rounded-2xl p-6" style={CARD_STYLE}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <TrendingUp size={16} className="text-primary" /> সাম্প্রতিক কোটেশন
                    </h2>
                    <button onClick={() => setActiveTab("quotes")}
                      className="text-xs font-semibold flex items-center gap-1"
                      style={{ color: 'hsl(258,90%,70%)' }}>
                      সব দেখুন <ArrowRight size={12} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {leads.slice(0, 3).map(lead => {
                      const cfg = statusConfig[lead.status ?? "new"] || statusConfig["new"];
                      return (
                        <div key={lead.id} className="flex items-center justify-between p-3 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{lead.service_interested || "Service Request"}</p>
                            <p className="text-xs text-foreground/40 mt-0.5 flex items-center gap-1">
                              <Calendar size={10} /> {new Date(lead.created_at).toLocaleDateString("en-BD")}
                            </p>
                          </div>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                            style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Recent payments preview */}
              {payments.length > 0 && (
                <motion.div custom={6} variants={cardVariants} initial="hidden" animate="visible"
                  className="rounded-2xl p-6" style={CARD_STYLE}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <CreditCard size={16} className="text-primary" /> সাম্প্রতিক Payment
                    </h2>
                    <button onClick={() => setActiveTab("payments")}
                      className="text-xs font-semibold flex items-center gap-1"
                      style={{ color: 'hsl(258,90%,70%)' }}>
                      সব দেখুন <ArrowRight size={12} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {payments.slice(0, 3).map(p => {
                      const cfg = paymentStatusConfig[p.status] || paymentStatusConfig["pending"];
                      return (
                        <div key={p.id} className="flex items-center justify-between p-3 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{p.service || "Payment"}</p>
                            <p className="text-xs text-foreground/40 mt-0.5">{p.payment_method} · {new Date(p.created_at).toLocaleDateString("en-BD")}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold" style={{ color: 'hsl(145,70%,50%)' }}>৳{p.amount.toLocaleString()}</p>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                              style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Documents preview */}
              {documents.length > 0 && (
                <motion.div custom={7} variants={cardVariants} initial="hidden" animate="visible"
                  className="rounded-2xl p-6" style={CARD_STYLE}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <FolderOpen size={16} className="text-primary" /> Shared Documents
                    </h2>
                    <button onClick={() => setActiveTab("documents")}
                      className="text-xs font-semibold flex items-center gap-1"
                      style={{ color: 'hsl(258,90%,70%)' }}>
                      সব দেখুন <ArrowRight size={12} />
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {documents.slice(0, 4).map(doc => (
                      <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span className="text-2xl">{fileIcon(doc.file_type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                          <p className="text-xs text-foreground/35">{formatBytes(doc.file_size)}</p>
                        </div>
                        <a href={doc.file_url} target="_blank" rel="noreferrer">
                          <Download size={14} className="text-foreground/40 hover:text-primary transition-colors" />
                        </a>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {leads.length === 0 && (
                <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible"
                  className="rounded-2xl p-12 text-center"
                  style={EMPTY_STYLE}>
                  <FileText size={36} className="mx-auto mb-4 text-primary/40" />
                  <h3 className="text-foreground font-bold mb-2">এখনও কোনো কোটেশন নেই</h3>
                  <p className="text-foreground/40 text-sm mb-5">প্রজেক্টের জন্য একটি কোটেশন অনুরোধ করুন</p>
                  <Link to="/get-quote">
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white"
                      style={{ background: GRAD }}>
                      <FileText size={14} /> কোটেশন অনুরোধ
                    </motion.button>
                  </Link>
                </motion.div>
              )}
            </div>
          )}

          {/* ══════════════════ QUOTES TAB ══════════════════ */}
          {activeTab === "quotes" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-black text-foreground">আপনার সব কোটেশন অনুরোধ</h2>
                <Link to="/get-quote">
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                    style={{ background: GRAD }}>
                    <FileText size={13} /> নতুন অনুরোধ
                  </motion.button>
                </Link>
              </div>
              {leads.length === 0 ? (
                <div className="rounded-2xl p-12 text-center"
                  style={EMPTY_STYLE}>
                  <FileText size={36} className="mx-auto mb-3 text-primary/30" />
                  <p className="text-foreground/50 text-sm">কোনো কোটেশন পাওয়া যায়নি।</p>
                </div>
              ) : leads.map((lead, i) => {
                const cfg = statusConfig[lead.status ?? "new"] || statusConfig["new"];
                const StatusIcon = cfg.icon;
                return (
                  <motion.div key={lead.id} custom={i} variants={cardVariants} initial="hidden" animate="visible"
                    className="rounded-2xl p-5" style={CARD_STYLE}>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-foreground">{lead.service_interested || "Service Request"}</h3>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1"
                            style={{ background: cfg.bg, color: cfg.color }}>
                            <StatusIcon size={11} /> {cfg.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-foreground/40">
                          {lead.budget_range && (
                            <span className="flex items-center gap-1">
                              <TrendingUp size={11} /> Budget: {lead.budget_range}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {new Date(lead.created_at).toLocaleDateString("en-BD", { year: "numeric", month: "long", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* ══════════════════ PAYMENTS TAB ══════════════════ */}
          {activeTab === "payments" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-black text-foreground">Payment ইতিহাস</h2>
                <Link to="/payment">
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                    style={{ background: GRAD }}>
                    <CreditCard size={13} /> নতুন Payment
                  </motion.button>
                </Link>
              </div>

              {/* Payment Summary Cards */}
              {payments.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "মোট পেমেন্ট",  value: `৳${payments.reduce((a, p) => a + p.amount, 0).toLocaleString()}`, color: "hsl(185,100%,48%)" },
                    { label: "Verified",      value: payments.filter(p => p.status === "verified").length, color: "hsl(145,70%,50%)" },
                    { label: "Pending",       value: payments.filter(p => p.status === "pending").length,  color: "hsl(35,90%,60%)" },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-4 text-center" style={CARD_STYLE}>
                      <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-xs text-foreground/40 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {payments.length === 0 ? (
                <div className="rounded-2xl p-12 text-center"
                  style={EMPTY_STYLE}>
                  <Banknote size={36} className="mx-auto mb-3 text-primary/30" />
                  <p className="text-foreground/50 text-sm">কোনো payment পাওয়া যায়নি।</p>
                </div>
              ) : payments.map((p, i) => {
                const cfg = paymentStatusConfig[p.status] || paymentStatusConfig["pending"];
                return (
                  <motion.div key={p.id} custom={i} variants={cardVariants} initial="hidden" animate="visible"
                    className="rounded-2xl p-5" style={CARD_STYLE}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: 'rgba(139,92,246,0.12)' }}>
                          <CreditCard size={18} className="text-primary/70" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{p.service || "Payment"}</p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-foreground/40 mt-1">
                            <span className="flex items-center gap-1"><Phone size={10} /> {p.phone}</span>
                            <span>{p.payment_method}</span>
                            <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(p.created_at).toLocaleDateString("en-BD", { year: "numeric", month: "long", day: "numeric" })}</span>
                          </div>
                          <p className="text-xs text-foreground/25 mt-1">TxID: {p.transaction_id}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end gap-2">
                        <p className="text-xl font-black" style={{ color: 'hsl(145,70%,50%)' }}>৳{p.amount.toLocaleString()}</p>
                        <span className="text-xs font-semibold px-3 py-1 rounded-lg w-fit"
                          style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* ══════════════════ DOCUMENTS TAB ══════════════════ */}
          {activeTab === "documents" && (
            <div className="space-y-4">
              <div className="mb-2">
                <h2 className="text-lg font-black text-foreground">Shared Documents</h2>
                <p className="text-sm text-foreground/40 mt-1">Admin আপনার সাথে শেয়ার করা files ও documents</p>
              </div>
              {documents.length === 0 ? (
                <div className="rounded-2xl p-14 text-center"
                  style={EMPTY_STYLE}>
                  <FolderOpen size={40} className="mx-auto mb-4 text-primary/25" />
                  <h3 className="text-foreground font-bold mb-2">কোনো document নেই</h3>
                  <p className="text-foreground/40 text-sm">Admin আপনার সাথে কোনো document শেয়ার করেনি।</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {documents.map((doc, i) => (
                    <motion.div key={doc.id} custom={i} variants={cardVariants} initial="hidden" animate="visible"
                      className="rounded-2xl p-5" style={CARD_STYLE}>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                          style={{ background: 'rgba(255,255,255,0.05)' }}>
                          {fileIcon(doc.file_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-foreground truncate">{doc.title}</p>
                          {doc.description && (
                            <p className="text-xs text-foreground/45 mt-1 line-clamp-2">{doc.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-foreground/30">
                            {doc.file_size && <span>{formatBytes(doc.file_size)}</span>}
                            <span>{new Date(doc.created_at).toLocaleDateString("en-BD")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <a href={doc.file_url} target="_blank" rel="noreferrer" className="flex-1">
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                            style={{ background: 'rgba(139,92,246,0.15)', color: 'hsl(258,90%,75%)', border: '1px solid rgba(139,92,246,0.2)' }}>
                            <Eye size={14} /> View
                          </motion.button>
                        </a>
                        <a href={doc.file_url} download className="flex-1">
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                            style={{ background: GRAD }}>
                            <Download size={14} /> Download
                          </motion.button>
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════ PROFILE TAB ══════════════════ */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="text-lg font-black text-foreground">Profile সম্পাদনা</h2>

              {/* Avatar */}
              <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible"
                className="rounded-2xl p-6" style={CARD_STYLE}>
                <h3 className="text-sm font-bold text-foreground/60 mb-4 uppercase tracking-wider">Profile Photo</h3>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {(editProfile.avatar_url) ? (
                      <img src={editProfile.avatar_url} alt="avatar"
                        className="w-20 h-20 rounded-2xl object-cover ring-2 ring-primary/30" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
                        style={{ background: GRAD }}>{initials}</div>
                    )}
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                      style={{ background: GRAD, boxShadow: '0 2px 10px rgba(139,92,246,0.4)' }}>
                      <Camera size={14} className="text-white" />
                    </button>
                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{editProfile.full_name || "নাম যোগ করুন"}</p>
                    <p className="text-xs text-foreground/40 mt-1">{user?.email}</p>
                    <button onClick={() => avatarInputRef.current?.click()}
                      className="text-xs font-semibold mt-2 flex items-center gap-1 transition-colors"
                      style={{ color: 'hsl(258,90%,70%)' }}>
                      <Upload size={11} /> ছবি পরিবর্তন করুন
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Edit form */}
              <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible"
                className="rounded-2xl p-6" style={CARD_STYLE}>
                <h3 className="text-sm font-bold text-foreground/60 mb-4 uppercase tracking-wider">Personal Info</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { key: "full_name", label: "পূর্ণ নাম", placeholder: "আপনার নাম", type: "text" },
                    { key: "username",  label: "Username",  placeholder: "username",   type: "text" },
                    { key: "phone",     label: "Phone",     placeholder: "01XXXXXXXXX", type: "tel" },
                  ].map(({ key, label, placeholder, type }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-foreground/50 mb-1.5">{label}</label>
                      <input
                        type={type}
                        value={(editProfile as unknown as Record<string, string | null>)[key] || ""}
                        onChange={e => setEditProfile(p => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full px-4 py-2.5 rounded-xl text-sm text-foreground outline-none transition-all"
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #E4E6EB',
                        }}
                        onFocus={e => (e.target.style.borderColor = '#1877F2')}
                        onBlur={e => (e.target.style.borderColor = '#E4E6EB')}
                      />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-foreground/50 mb-1.5">Bio</label>
                    <textarea
                      value={editProfile.bio || ""}
                      onChange={e => setEditProfile(p => ({ ...p, bio: e.target.value }))}
                      placeholder="আপনার সম্পর্কে কিছু লিখুন..."
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-foreground outline-none resize-none transition-all"
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E4E6EB',
                      }}
                      onFocus={e => (e.target.style.borderColor = '#1877F2')}
                      onBlur={e => (e.target.style.borderColor = '#E4E6EB')}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-5">
                  <motion.button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                    style={{ background: GRAD }}>
                    {savingProfile
                      ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <Save size={14} />}
                    {savingProfile ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তন সংরক্ষণ করুন"}
                  </motion.button>
                </div>
              </motion.div>

              {/* Account info */}
              <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible"
                className="rounded-2xl p-6" style={CARD_STYLE}>
                <h3 className="text-sm font-bold text-foreground/60 mb-4 uppercase tracking-wider">Account Info</h3>
                <div className="space-y-3">
                  {[
                    { label: "Email",        value: user?.email || "—" },
                    { label: "Account Type", value: isAdmin ? "Admin ব্যবহারকারী" : "Regular User" },
                    { label: "Member Since", value: user?.created_at ? new Date(user.created_at).toLocaleDateString("en-BD", { year: "numeric", month: "long", day: "numeric" }) : "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-white/4 last:border-0">
                      <span className="text-xs text-foreground/40">{label}</span>
                      <span className="text-sm font-medium text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

        </motion.div>
      </div>
      <SiteFooter />
    </div>
  );
}
