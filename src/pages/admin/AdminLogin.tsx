import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import logoImg from "@/assets/logo-glossy.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable";

const ADMIN_EMAIL = "info.shahedit@gmail.com";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signOut, user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // If already logged in as admin, skip login. If logged in but not admin, kick them out.
  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    if (isAdmin && user.email?.toLowerCase() === ADMIN_EMAIL) {
      navigate("/admin", { replace: true });
    } else {
      toast.error("This account is not authorized to access the admin panel.");
      signOut();
    }
  }, [user, isAdmin, authLoading, navigate, signOut]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill in all fields"); return; }
    if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
      toast.error("Only the authorized admin email can sign in here.");
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error("Invalid credentials");
    } else {
      toast.success("Welcome back!");
      navigate("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, hsl(245,58%,60%), transparent)`,
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 180, delay: 0.2 }}
              className="relative mb-5"
            >
              {/* Soft aurora glow matching brand background */}
              <div className="absolute -inset-6 bg-[conic-gradient(from_180deg_at_50%_50%,#a855f7_0deg,#14b8a6_120deg,#6366f1_240deg,#a855f7_360deg)] opacity-40 blur-3xl rounded-full animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-teal-400/30 blur-2xl rounded-full" />
              <img
                src={logoImg}
                alt="Shahed IT Logo"
                className="relative w-24 h-24 object-contain drop-shadow-[0_8px_24px_rgba(20,184,166,0.55)]"
              />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Admin Panel</h1>
            <p className="text-white/60 text-sm">Shahed IT — Secure Login</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-white/80 text-sm">Email Address</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@shahedit.com"
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-purple-400 h-12 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 text-sm">Password</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-purple-400 h-12 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-500 hover:to-teal-400 text-white font-semibold text-base shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
            >
              {loading ? "Signing in..." : "Sign In to Admin"}
            </Button>
          </form>

          <div className="relative my-5 flex items-center">
            <div className="flex-1 h-px bg-white/15" />
            <span className="px-3 text-white/40 text-xs uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/15" />
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              const result = await lovable.auth.signInWithOAuth("google", {
                redirect_uri: window.location.origin + "/admin",
              });
              if (result.error) {
                setLoading(false);
                toast.error("Google sign-in failed");
                return;
              }
              if (result.redirected) return;
              navigate("/admin");
            }}
            className="w-full h-12 rounded-xl bg-white/10 hover:bg-white/15 border-white/20 text-white font-medium gap-3 backdrop-blur-sm"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.2C41.4 35.6 44 30.2 44 24c0-1.3-.1-2.3-.4-3.5z"/>
            </svg>
            Continue with Google
          </Button>

          <p className="text-center text-white/40 text-xs mt-6">
            🔒 Protected access — Unauthorized entry is prohibited
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
