import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Trash2, Shield, ShieldCheck, Mail, Key, Eye, EyeOff, AlertTriangle, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ROLES = ["super_admin", "admin", "editor"] as const;
type Role = typeof ROLES[number];

const roleColors: Record<Role, string> = {
  super_admin: "bg-red-500/15 text-red-400 border-red-500/30",
  admin: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  editor: "bg-teal-500/15 text-teal-400 border-teal-500/30",
};

const roleLabels: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
};

interface AdminUser {
  user_id: string;
  role: Role;
  created_at: string;
  email?: string;
}

export default function AdminUsers() {
  const qc = useQueryClient();
  const { user: currentUser, role: currentRole } = useAuth();

  const [form, setForm] = useState({ email: "", password: "", role: "admin" as Role });
  const [showPwd, setShowPwd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch all admin users with their emails via profiles
  const { data: adminUsers = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("user_id, role, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Fetch profile info for each user
      const usersWithEmail = await Promise.all(
        (roles ?? []).map(async (r) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", r.user_id)
            .single();
          return { ...r, email: profile?.full_name ?? r.user_id.slice(0, 8) + "..." };
        })
      );
      return usersWithEmail as AdminUser[];
    },
  });

  // Create new admin user
  const handleCreate = async () => {
    if (!form.email.trim() || !form.password.trim()) {
      toast.error("ইমেইল এবং পাসওয়ার্ড দিন");
      return;
    }
    if (form.password.length < 6) {
      toast.error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে");
      return;
    }
    setLoading(true);
    try {
      // Sign up the new user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: { data: { full_name: form.email.split("@")[0] } },
      });

      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error("User creation failed");

      // Assign role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: signUpData.user.id, role: form.role });

      if (roleError) throw roleError;

      toast.success(`নতুন ${roleLabels[form.role]} তৈরি হয়েছে! ইমেইল ভেরিফিকেশন পাঠানো হয়েছে।`);
      setForm({ email: "", password: "", role: "admin" });
      setAdding(false);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err: any) {
      toast.error(err.message ?? "সমস্যা হয়েছে");
    }
    setLoading(false);
  };

  // Delete (remove role only — keeps auth user)
  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Admin অ্যাক্সেস সরিয়ে দেওয়া হয়েছে");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const isSuperAdmin = currentRole === "super_admin";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold flex items-center gap-2">
            <Shield size={22} className="text-purple-400" /> Admin Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">Admin ও Editor অ্যাকাউন্ট পরিচালনা করুন</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setAdding(v => !v)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, hsl(258,90%,60%), hsl(185,100%,40%))' }}
        >
          <UserPlus size={15} />
          নতুন Admin যোগ করুন
        </motion.button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-900 border border-purple-500/25 rounded-2xl p-6 space-y-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <UserPlus size={16} className="text-purple-400" /> নতুন Admin / Editor তৈরি করুন
              </h3>

              <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3 flex items-start gap-3">
                <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                <p className="text-amber-300/80 text-xs leading-relaxed">
                  নতুন ব্যবহারকারীর কাছে ইমেইল ভেরিফিকেশন লিংক পাঠানো হবে। তারা ভেরিফাই করলেই লগইন করতে পারবেন।
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                    <Mail size={11} /> ইমেইল *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="admin@example.com"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                    <Key size={11} /> পাসওয়ার্ড *
                  </label>
                  <div className="relative">
                    <input
                      type={showPwd ? "text" : "password"}
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="কমপক্ষে ৬ অক্ষর"
                      className="w-full px-3 py-2.5 pr-10 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                    <ShieldCheck size={11} /> ভূমিকা (Role)
                  </label>
                  <select
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
                  >
                    {ROLES.filter(r => r !== "super_admin" || isSuperAdmin).map(r => (
                      <option key={r} value={r}>{roleLabels[r]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCreate}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, hsl(258,90%,60%), hsl(185,100%,40%))' }}
                >
                  {loading ? "তৈরি হচ্ছে..." : <><UserPlus size={14} /> Admin তৈরি করুন</>}
                </motion.button>
                <button onClick={() => setAdding(false)}
                  className="px-5 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                  বাতিল
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users list */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
          <Users size={16} className="text-slate-400" />
          <h2 className="text-white font-semibold text-sm">বর্তমান Admin সদস্যরা</h2>
          <span className="ml-auto text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{adminUsers.length} জন</span>
        </div>

        {isLoading ? (
          <div className="p-5 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : adminUsers.length === 0 ? (
          <div className="text-center py-16">
            <Users size={40} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">কোনো admin নেই</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {adminUsers.map((u, i) => {
              const isCurrentUser = u.user_id === currentUser?.id;
              return (
                <motion.div
                  key={u.user_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between px-5 py-4 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-teal-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {u.email?.[0]?.toUpperCase() ?? "A"}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium flex items-center gap-2">
                        {u.email}
                        {isCurrentUser && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-500/15 text-teal-400 border border-teal-500/25">আপনি</span>
                        )}
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        যোগ দিয়েছেন: {new Date(u.created_at).toLocaleDateString("bn-BD")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${roleColors[u.role as Role] ?? ""}`}>
                      {roleLabels[u.role as Role] ?? u.role}
                    </span>
                    {!isCurrentUser && isSuperAdmin && (
                      <button
                        onClick={() => {
                          if (confirm(`"${u.email}" এর admin অ্যাক্সেস সরিয়ে দিতে চান?`)) {
                            deleteMutation.mutate(u.user_id);
                          }
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Admin অ্যাক্সেস সরান"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {!isSuperAdmin && (
        <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle size={15} className="text-amber-400 shrink-0" />
          <p className="text-amber-300/70 text-xs">Admin delete করতে Super Admin role প্রয়োজন।</p>
        </div>
      )}
    </div>
  );
}

