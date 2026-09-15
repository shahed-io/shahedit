import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Zap, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে!");
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
          style={{ background: 'rgba(14,11,28,0.90)', border: '1px solid rgba(168,85,247,0.18)', backdropFilter: 'blur(20px)' }}>
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, hsl(270,92%,65%), hsl(320,90%,48%), transparent)' }} />

          <div className="flex justify-center mb-6">
            <Link to="/">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, hsl(270,92%,65%), hsl(320,90%,48%))' }}>
                  <Zap size={20} className="text-white" fill="white" />
                </div>
                <span className="text-2xl font-black" style={{ fontFamily: "'Sora', 'Manrope', sans-serif" }}>
                  <span className="gradient-text">Shahed</span>
                  <span className="text-foreground"> IT</span>
                </span>
              </div>
            </Link>
          </div>

          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <Mail size={28} style={{ color: 'hsl(155,70%,50%)' }} />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">ইমেইল পাঠানো হয়েছে!</h2>
              <p className="text-foreground/50 text-sm mb-6">
                <strong className="text-foreground/80">{email}</strong> ঠিকানায় পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে।
              </p>
              <Link to="/login" className="text-primary text-sm hover:underline flex items-center justify-center gap-1">
                <ArrowLeft size={14} /> লগইন পেজে ফিরে যান
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-foreground mb-1 text-center">পাসওয়ার্ড রিসেট</h2>
              <p className="text-foreground/40 text-sm text-center mb-6">আপনার ইমেইল দিন, আমরা লিংক পাঠাব</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/35 pointer-events-none" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ইমেইল ঠিকানা" required
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-foreground placeholder:text-foreground/30 focus:outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onFocus={e => e.target.style.borderColor = 'hsl(270,92%,65%)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </div>
                <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, hsl(270,92%,65%), hsl(320,90%,48%))' }}>
                  {loading ? "পাঠানো হচ্ছে..." : "রিসেট লিংক পাঠান"}
                </motion.button>
              </form>

              <div className="text-center mt-4">
                <Link to="/login" className="text-xs text-foreground/40 hover:text-primary transition-colors flex items-center justify-center gap-1">
                  <ArrowLeft size={12} /> লগইনে ফিরে যান
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
