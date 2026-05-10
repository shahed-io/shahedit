import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      // Check redirects table
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

      // Log broken link
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
    return <div className="flex min-h-screen items-center justify-center bg-background"><div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-amber-400">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Page not found</p>
        <a href="/" className="text-amber-400 underline hover:text-amber-300">Return to Home</a>
      </div>
    </div>
  );
};

export default NotFound;
