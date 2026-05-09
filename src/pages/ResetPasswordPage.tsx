import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    } else {
      // Check for session from URL
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) setIsRecovery(true);
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("পাসওয়ার্ড মিলছে না"); return; }
    if (password.length < 6) { toast.error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("পাসওয়ার্ড পরিবর্তন হয়েছে!");
      navigate("/");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "কিছু একটা ভুল হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="rounded-3xl p-8"
          style={{ background: 'rgba(14,11,28,0.90)', border: '1px solid rgba(201,161,74,0.18)', backdropFilter: 'blur(20px)' }}>
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, hsl(42,70%,65%), hsl(45,85%,48%))' }}>
                <Zap size={20} className="text-white" fill="white" />
              </div>
              <span className="text-2xl font-black" style={{ fontFamily: "'Syne', sans-serif" }}>
                <span className="gradient-text">Shahed</span>
                <span className="text-foreground"> IT</span>
              </span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-foreground mb-1 text-center">নতুন পাসওয়ার্ড</h2>
          <p className="text-foreground/40 text-sm text-center mb-6">নিরাপদ নতুন পাসওয়ার্ড দিন</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/35" />
              <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="নতুন পাসওয়ার্ড" required minLength={6}
                className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-foreground placeholder:text-foreground/30 focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocus={e => e.target.style.borderColor = 'hsl(42,70%,65%)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/35 hover:text-foreground/70">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/35" />
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="পাসওয়ার্ড নিশ্চিত করুন" required
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-foreground placeholder:text-foreground/30 focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocus={e => e.target.style.borderColor = 'hsl(42,70%,65%)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
            </div>
            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, hsl(42,70%,65%), hsl(45,85%,48%))' }}>
              {loading ? "আপডেট হচ্ছে..." : "পাসওয়ার্ড পরিবর্তন করুন"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
