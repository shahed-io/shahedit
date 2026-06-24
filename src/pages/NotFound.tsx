import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Home, LayoutDashboard, ArrowLeft, AlertTriangle, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SEO } from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("redirects")
        .select("to_path,is_active")
        .eq("from_path", location.pathname)
        .eq("is_active", true)
        .maybeSingle();

      if (data?.to_path) {
        const cur = await supabase.from("redirects").select("hits").eq("from_path", location.pathname).maybeSingle();
        await supabase.from("redirects").update({ hits: (cur.data?.hits ?? 0) + 1 }).eq("from_path", location.pathname);
        navigate(data.to_path, { replace: true });
        return;
      }

      const { data: existing } = await supabase
        .from("broken_links")
        .select("id,hits")
        .eq("path", location.pathname)
        .maybeSingle();
      if (existing) {
        await supabase.from("broken_links").update({ hits: (existing.hits || 0) + 1, last_seen_at: new Date().toISOString(), resolved: false }).eq("id", existing.id);
      } else {
        await supabase.from("broken_links").insert({ path: location.pathname, referrer: document.referrer, user_agent: navigator.userAgent });
      }
      setChecking(false);
    })();
  }, [location.pathname, navigate]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = role === "super_admin" || role === "admin";
  const dashboardHref = isAdmin ? "/ceo" : "/dashboard";

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background px-4 py-12 font-inter">
      <SEO title="404 — পেজ পাওয়া যায়নি | Shahed IT" description="দুঃখিত, আপনি যে পেজটি খুঁজছেন সেটি পাওয়া যায়নি। হোম বা ড্যাশবোর্ডে ফিরে যান।" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ contain: "strict" }}>
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-primary/20 blur-[140px]" />
        <div className="absolute -bottom-32 -right-32 w-[520px] h-[520px] rounded-full bg-accent/20 blur-[140px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="relative rounded-3xl border border-primary/25 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-accent/[0.04] backdrop-blur-2xl p-8 md:p-12 text-center shadow-[0_24px_80px_-24px_hsl(var(--primary)/0.55)] overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
          <div className="pointer-events-none absolute -right-20 -top-20 w-60 h-60 rounded-full bg-primary/25 blur-[90px]" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 w-60 h-60 rounded-full bg-accent/25 blur-[90px]" />

          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 14 }}
            className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/40 via-primary/15 to-accent/30 border border-primary/40 flex items-center justify-center shadow-[0_12px_40px_-12px_hsl(var(--primary)/0.7)]"
          >
            <AlertTriangle className="w-10 h-10 text-primary drop-shadow-[0_0_12px_hsl(var(--primary)/0.8)]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-6 font-syne font-extrabold tracking-tighter text-[88px] md:text-[120px] leading-none bg-gradient-to-br from-primary via-accent to-primary bg-clip-text text-transparent"
          >
            404
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-2 font-syne font-bold text-xl md:text-2xl text-foreground"
          >
            পেজটি খুঁজে পাওয়া যায়নি
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-3 text-sm md:text-base text-muted-foreground max-w-md mx-auto"
          >
            দুঃখিত, আপনি যে URL-টি অনুসরণ করেছেন সেটি সঠিক নয় অথবা পেজটি সরিয়ে ফেলা হয়েছে।
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-5 inline-flex items-center gap-2 max-w-full px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            <span className="truncate">{location.pathname}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to="/"
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.7)] hover:shadow-[0_14px_36px_-10px_hsl(var(--primary)/0.9)] hover:scale-[1.03] active:scale-95 transition-all"
            >
              <Home size={16} />
              হোমপেজে ফিরে যান
            </Link>

            {user && !isAdmin && (
              <Link
                to={dashboardHref}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-primary/30 text-foreground font-semibold hover:bg-primary/10 hover:border-primary/50 hover:scale-[1.03] active:scale-95 transition-all backdrop-blur-md"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
            )}

            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 hover:scale-[1.03] active:scale-95 transition-all backdrop-blur-md"
            >
              <ArrowLeft size={16} />
              পেছনে যান
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 pt-6 border-t border-primary/15"
          >
            <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-muted-foreground mb-3 flex items-center justify-center gap-2">
              <Search size={12} />
              দরকারি লিংক
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
              {[
                { label: "Services", href: "/services" },
                { label: "Pricing", href: "/pricing" },
                { label: "Portfolio", href: "/portfolio" },
                { label: "Blog", href: "/blog" },
                { label: "Contact", href: "/contact" },
                { label: "FAQ", href: "/faq" },
              ].map((l) => (
                <Link
                  key={l.href}
                  to={l.href}
                  className="text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
