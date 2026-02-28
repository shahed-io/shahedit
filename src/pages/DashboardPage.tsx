import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  LayoutDashboard, User, FileText, Clock, CheckCircle2,
  AlertCircle, MessageSquare, Star, Zap, ArrowRight,
  TrendingUp, Package, LogOut, ChevronRight, Calendar, Mail, Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

interface Lead {
  id: string;
  name: string;
  email: string;
  service_interested: string | null;
  budget_range: string | null;
  status: string | null;
  source: string | null;
  created_at: string;
}

interface Profile {
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  new:         { label: "নতুন",         color: "hsl(210,90%,65%)",  bg: "rgba(59,130,246,0.12)",  icon: AlertCircle },
  in_progress: { label: "প্রক্রিয়াধীন", color: "hsl(35,90%,60%)",   bg: "rgba(251,146,60,0.12)",  icon: Clock },
  contacted:   { label: "যোগাযোগ হয়েছে",color: "hsl(258,90%,66%)", bg: "rgba(139,92,246,0.12)", icon: MessageSquare },
  converted:   { label: "সম্পন্ন",       color: "hsl(145,70%,50%)",  bg: "rgba(34,197,94,0.12)",   icon: CheckCircle2 },
  closed:      { label: "বন্ধ",          color: "hsl(0,70%,60%)",    bg: "rgba(239,68,68,0.12)",   icon: AlertCircle },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }),
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "quotes">("overview");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    Promise.all([
      supabase.from("profiles").select("full_name,username,avatar_url").eq("user_id", user.id).single(),
      supabase.from("leads").select("*").eq("email", user.email ?? "").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("role").eq("user_id", user.id),
    ]).then(([profileRes, leadsRes, rolesRes]) => {
      if (profileRes.data) setProfile(profileRes.data);
      if (leadsRes.data) setLeads(leadsRes.data as Lead[]);
      if (rolesRes.data && rolesRes.data.length > 0) {
        const adminRoles = ["super_admin", "admin", "editor"];
        setIsAdmin(rolesRes.data.some(r => adminRoles.includes(r.role)));
      }
      setLoading(false);
    });
  }, [user, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("লগআউট হয়েছে");
    navigate("/");
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const initials = profile?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    || user?.email?.[0].toUpperCase() || "?";

  const statusCounts = leads.reduce((acc, l) => {
    const s = l.status ?? "new";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stats = [
    { label: "মোট কোটেশন",     value: leads.length,                       icon: FileText,   color: "hsl(258,90%,66%)" },
    { label: "সম্পন্ন প্রজেক্ট", value: statusCounts["converted"] || 0,    icon: CheckCircle2,color: "hsl(145,70%,50%)" },
    { label: "প্রক্রিয়াধীন",    value: statusCounts["in_progress"] || 0,  icon: Clock,      color: "hsl(35,90%,60%)" },
    { label: "যোগাযোগ হয়েছে",  value: statusCounts["contacted"] || 0,    icon: MessageSquare,color: "hsl(185,100%,48%)" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* Top header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar"
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-primary/30" />
              ) : (
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, hsl(258,90%,66%), hsl(185,100%,48%))' }}>
                  {initials}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-black text-foreground">
                  আস্সালামু আলাইকুম, {profile?.full_name?.split(" ")[0] || "ব্যবহারকারী"} 👋
                </h1>
                <p className="text-foreground/40 text-sm mt-0.5 flex items-center gap-1.5">
                  <Mail size={12} /> {user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link to="/admin">
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: 'linear-gradient(135deg, hsl(258,90%,60%), hsl(185,100%,42%))', color: 'white', boxShadow: '0 4px 15px hsl(258,90%,60%,0.3)' }}>
                    <Shield size={14} /> অ্যাডমিন প্যানেল
                  </motion.button>
                </Link>
              )}
              <Link to="/profile">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', color: 'hsl(258,90%,75%)' }}>
                  <User size={14} /> প্রোফাইল সম্পাদনা
                </motion.button>
              </Link>
              <motion.button onClick={handleLogout} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: 'hsl(0,84%,70%)' }}>
                <LogOut size={14} /> লগআউট
              </motion.button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-2xl mb-8 w-fit"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { key: "overview", label: "ওভারভিউ", icon: LayoutDashboard },
              { key: "quotes",   label: "কোটেশন অনুরোধ", icon: FileText },
            ].map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setActiveTab(key as typeof activeTab)}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                style={activeTab === key ? {
                  background: 'linear-gradient(135deg, hsl(258,90%,66%), hsl(185,100%,48%))',
                  color: 'white', boxShadow: '0 4px 15px hsl(258,90%,66%,0.3)',
                } : { color: 'rgba(255,255,255,0.45)' }}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                  <motion.div key={s.label} custom={i} variants={cardVariants} initial="hidden" animate="visible"
                    className="rounded-2xl p-5"
                    style={{ background: 'rgba(14,11,28,0.80)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}>
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
                className="rounded-2xl p-6"
                style={{ background: 'rgba(14,11,28,0.80)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <Zap size={16} className="text-primary" /> দ্রুত অ্যাকশন
                </h2>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { label: "নতুন কোটেশন অনুরোধ", href: "/get-quote", icon: FileText, color: "hsl(258,90%,66%)" },
                    { label: "আমাদের সার্ভিস দেখুন",  href: "/services",   icon: Package,  color: "hsl(185,100%,48%)" },
                    { label: "পোর্টফোলিও দেখুন",     href: "/portfolio",  icon: Star,     color: "hsl(35,90%,60%)" },
                  ].map(({ label, href, icon: Icon, color }) => (
                    <Link key={href} to={href}>
                      <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                        className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all group"
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
                  className="rounded-2xl p-6"
                  style={{ background: 'rgba(14,11,28,0.80)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <TrendingUp size={16} className="text-primary" /> সাম্প্রতিক কোটেশন
                    </h2>
                    <button onClick={() => setActiveTab("quotes")}
                      className="text-xs font-semibold flex items-center gap-1 transition-colors"
                      style={{ color: 'hsl(258,90%,70%)' }}>
                      সব দেখুন <ArrowRight size={12} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {leads.slice(0, 3).map((lead) => {
                      const cfg = statusConfig[lead.status ?? "new"] || statusConfig["new"];
                      return (
                        <div key={lead.id} className="flex items-center justify-between p-3 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{lead.service_interested || "সার্ভিস অনুরোধ"}</p>
                            <p className="text-xs text-foreground/40 mt-0.5 flex items-center gap-1">
                              <Calendar size={10} />
                              {new Date(lead.created_at).toLocaleDateString("bn-BD")}
                            </p>
                          </div>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                            style={{ background: cfg.bg, color: cfg.color }}>
                            {cfg.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Empty state if no leads */}
              {leads.length === 0 && (
                <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible"
                  className="rounded-2xl p-12 text-center"
                  style={{ background: 'rgba(14,11,28,0.80)', border: '1px dashed rgba(139,92,246,0.2)' }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(139,92,246,0.1)' }}>
                    <FileText size={28} className="text-primary/60" />
                  </div>
                  <h3 className="text-foreground font-bold mb-2">এখনও কোনো কোটেশন নেই</h3>
                  <p className="text-foreground/40 text-sm mb-5">আপনার প্রজেক্টের জন্য একটি কোটেশন অনুরোধ করুন</p>
                  <Link to="/get-quote">
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, hsl(258,90%,66%), hsl(185,100%,48%))' }}>
                      <FileText size={14} /> কোটেশন অনুরোধ করুন
                    </motion.button>
                  </Link>
                </motion.div>
              )}
            </div>
          )}

          {/* ── QUOTES TAB ── */}
          {activeTab === "quotes" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-black text-foreground">আপনার সব কোটেশন অনুরোধ</h2>
                <Link to="/get-quote">
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, hsl(258,90%,66%), hsl(185,100%,48%))' }}>
                    <FileText size={13} /> নতুন অনুরোধ
                  </motion.button>
                </Link>
              </div>

              {leads.length === 0 ? (
                <div className="rounded-2xl p-12 text-center"
                  style={{ background: 'rgba(14,11,28,0.80)', border: '1px dashed rgba(139,92,246,0.2)' }}>
                  <FileText size={36} className="mx-auto mb-3 text-primary/30" />
                  <p className="text-foreground/50 text-sm">কোনো কোটেশন পাওয়া যায়নি।</p>
                </div>
              ) : (
                leads.map((lead, i) => {
                  const cfg = statusConfig[lead.status ?? "new"] || statusConfig["new"];
                  const StatusIcon = cfg.icon;
                  return (
                    <motion.div key={lead.id} custom={i} variants={cardVariants} initial="hidden" animate="visible"
                      className="rounded-2xl p-5"
                      style={{ background: 'rgba(14,11,28,0.80)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-foreground">
                              {lead.service_interested || "সার্ভিস অনুরোধ"}
                            </h3>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1"
                              style={{ background: cfg.bg, color: cfg.color }}>
                              <StatusIcon size={11} /> {cfg.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-xs text-foreground/40">
                            {lead.budget_range && (
                              <span className="flex items-center gap-1">
                                <TrendingUp size={11} /> বাজেট: {lead.budget_range}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar size={11} />
                              {new Date(lead.created_at).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail size={11} /> {lead.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          )}

        </motion.div>
      </div>

      <SiteFooter />
    </div>
  );
}
