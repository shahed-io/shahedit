import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Inbox, Briefcase, FolderOpen, FileText, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const StatCard = ({ icon: Icon, label, value, color, href }: any) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <Link to={href}>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-600 transition-all duration-300 cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={20} className="text-white" />
          </div>
          <TrendingUp size={16} className="text-teal-400" />
        </div>
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        <p className="text-white text-3xl font-bold">{value}</p>
      </div>
    </Link>
  </motion.div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({ leads: 0, services: 0, projects: 0, blog: 0 });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [l, s, p, b, rl] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("services").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(5),
      ]);
      setStats({
        leads: l.count ?? 0,
        services: s.count ?? 0,
        projects: p.count ?? 0,
        blog: b.count ?? 0,
      });
      setRecentLeads(rl.data ?? []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const statusColor: Record<string, string> = {
    new: "text-yellow-400 bg-yellow-400/10",
    in_progress: "text-blue-400 bg-blue-400/10",
    contacted: "text-purple-400 bg-purple-400/10",
    converted: "text-teal-400 bg-teal-400/10",
    closed: "text-slate-400 bg-slate-400/10",
  };

  const cards = [
    { icon: Inbox, label: "Total Leads", value: stats.leads, color: "bg-purple-600", href: "/admin/leads" },
    { icon: Briefcase, label: "Services", value: stats.services, color: "bg-teal-600", href: "/admin/services" },
    { icon: FolderOpen, label: "Projects", value: stats.projects, color: "bg-blue-600", href: "/admin/portfolio" },
    { icon: FileText, label: "Blog Posts", value: stats.blog, color: "bg-orange-600", href: "/admin/blog" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-slate-400 text-sm">Welcome back! Here's what's happening.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <StatCard {...c} />
          </motion.div>
        ))}
      </div>

      {/* Recent Leads */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold">Recent Leads</h2>
          <Link to="/admin/leads" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentLeads.length === 0 ? (
          <div className="text-center py-10">
            <Inbox size={40} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500">No leads yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-xl hover:bg-slate-750 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {lead.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{lead.name}</p>
                    <p className="text-slate-400 text-xs">{lead.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-xs">{lead.service_interested || "—"}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColor[lead.status] ?? ""}`}>
                    {lead.status?.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
