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



const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, user, isAdmin, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // If already logged in as an admin, skip login entirely.
  // If logged in but NOT an admin, send them to home (do NOT sign them out — that breaks their website session).
  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    if (isAdmin) {
      navigate("/ceo", { replace: true });
    } else {
      toast.error("এই অ্যাকাউন্টে admin panel access নেই।");
      navigate("/", { replace: true });
    }
  }, [user, isAdmin, role, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error("Invalid credentials");
    } else {
      toast.success("Welcome back!");
      // Navigation handled by the useEffect above once role loads
    }
  };

  // While we're checking session OR an existing logged-in user is being redirected,
  // show a spinner instead of the login form (prevents the "double login" feel).
  if (authLoading || user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }


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

          <p className="text-center text-white/40 text-xs mt-6">
            🔒 Protected access — Unauthorized entry is prohibited
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
