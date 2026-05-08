import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Zap, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import shahedLogo from "@/assets/shahed-it-logo.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("স্বাগতম! সফলভাবে লগইন হয়েছে।");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("অ্যাকাউন্ট তৈরি হয়েছে! ইমেইল যাচাই করুন।");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "কিছু একটা ভুল হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
    } catch (err: unknown) {
      toast.error("Google লগইন ব্যর্থ হয়েছে");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-16 px-4 relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(258,90%,66%) 0%, transparent 65%)', filter: 'blur(120px)', opacity: 0.08 }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(185,100%,48%) 0%, transparent 65%)', filter: 'blur(100px)', opacity: 0.07 }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative"
        >
          {/* Card */}
          <div className="rounded-3xl p-8 relative overflow-hidden"
            style={{ background: 'rgba(14,11,28,0.90)', border: '1px solid rgba(139,92,246,0.18)', backdropFilter: 'blur(20px)', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>

            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, hsl(258,90%,66%), hsl(185,100%,48%), transparent)' }} />

            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Link to="/">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, hsl(258,90%,66%), hsl(185,100%,48%))' }}>
                    <Zap size={20} className="text-white" fill="white" />
                  </div>
                  <span className="text-2xl font-black" style={{ fontFamily: "'Syne', sans-serif" }}>
                    <span className="gradient-text">Shahed</span>
                    <span className="text-foreground"> IT</span>
                  </span>
                </div>
              </Link>
            </div>

            {/* Tab switcher */}
            <div className="flex rounded-xl p-1 mb-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {(["login", "signup"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
                  style={tab === t ? {
                    background: 'linear-gradient(135deg, hsl(258,90%,66%), hsl(185,100%,48%))',
                    color: 'white',
                    boxShadow: '0 4px 15px hsl(258,90%,66%,0.3)',
                  } : { color: 'rgba(255,255,255,0.45)' }}>
                  {t === "login" ? "লগইন" : "নতুন অ্যাকাউন্ট"}
                </button>
              ))}
            </div>

            <h2 className="text-xl font-bold text-foreground mb-1 text-center">
              {tab === "login" ? "আবার স্বাগতম 👋" : "যোগ দিন আমাদের সাথে"}
            </h2>
            <p className="text-foreground/40 text-sm text-center mb-6">
              {tab === "login" ? "আপনার অ্যাকাউন্টে লগইন করুন" : "বিনামূল্যে অ্যাকাউন্ট তৈরি করুন"}
            </p>

            {/* Google button */}
            <motion.button
              onClick={handleGoogle}
              disabled={googleLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-semibold transition-all mb-5"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.85)' }}
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.1-.4-4.6H24v8.7h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.2 7.3-10.5 7.3-17.3z"/>
                  <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.1 1.4-4.9 2.2-8 2.2-6.1 0-11.3-4.1-13.2-9.7H2.7v6.2C6.7 42.9 14.8 48 24 48z"/>
                  <path fill="#FBBC05" d="M10.8 28.7c-.5-1.4-.7-2.9-.7-4.7s.3-3.3.7-4.7V13H2.7C1 16.3 0 20 0 24s1 7.7 2.7 11l8.1-6.3z"/>
                  <path fill="#EA4335" d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.7-6.7C35.9 2.2 30.5 0 24 0 14.8 0 6.7 5.1 2.7 13l8.1 6.3C12.7 13.6 17.9 9.5 24 9.5z"/>
                </svg>
              )}
              Google দিয়ে {tab === "login" ? "লগইন" : "সাইন আপ"} করুন
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <span className="text-xs text-foreground/30 font-medium">অথবা ইমেইল দিয়ে</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            </div>

            {/* Email form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {tab === "signup" && (
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="আপনার পুরো নাম"
                    required
                    className="w-full pl-4 pr-4 py-3 rounded-xl text-sm text-foreground placeholder:text-foreground/30 focus:outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', }}
                    onFocus={e => e.target.style.borderColor = 'hsl(258,90%,66%)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>
              )}

              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/35 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ইমেইল ঠিকানা"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-foreground placeholder:text-foreground/30 focus:outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onFocus={e => e.target.style.borderColor = 'hsl(258,90%,66%)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>

              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/35 pointer-events-none" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="পাসওয়ার্ড"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-foreground placeholder:text-foreground/30 focus:outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onFocus={e => e.target.style.borderColor = 'hsl(258,90%,66%)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/35 hover:text-foreground/70 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {tab === "login" && (
                <div className="text-right">
                  <Link to="/forgot-password" className="text-xs text-foreground/40 hover:text-primary transition-colors">
                    পাসওয়ার্ড ভুলে গেছেন?
                  </Link>
                </div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, hsl(258,90%,66%), hsl(185,100%,48%))', boxShadow: '0 8px 30px hsl(258,90%,66%,0.3)' }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {tab === "login" ? "লগইন করুন" : "অ্যাকাউন্ট তৈরি করুন"}
                    <ArrowRight size={15} />
                  </>
                )}
              </motion.button>
            </form>

            <p className="text-center text-xs text-foreground/35 mt-5">
              {tab === "login" ? "অ্যাকাউন্ট নেই? " : "ইতিমধ্যে অ্যাকাউন্ট আছে? "}
              <button onClick={() => setTab(tab === "login" ? "signup" : "login")}
                className="text-primary hover:underline font-semibold">
                {tab === "login" ? "নতুন অ্যাকাউন্ট তৈরি করুন" : "লগইন করুন"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
      <SiteFooter />
    </div>
  );
}
