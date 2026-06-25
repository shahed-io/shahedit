import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Global admin-only keyboard shortcuts + frontend error capture.
 * Active only on /ceo routes.
 */
export function useAdminGlobals() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!location.pathname.startsWith("/ceo")) return;
    let lastG = 0;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.key === "?") { navigate("/ceo/advanced-tools"); return; }
      if (e.key === "/") {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>('input[type="search"], input[placeholder*="search" i], input[placeholder*="খুঁজুন"]');
        input?.focus();
        return;
      }
      if (e.key === "g") { lastG = Date.now(); return; }
      if (Date.now() - lastG < 800) {
        const map: Record<string, string> = { d: "/ceo", o: "/ceo/orders", p: "/ceo/products", c: "/ceo/customers", a: "/ceo/advanced-tools" };
        const dest = map[e.key];
        if (dest) { e.preventDefault(); navigate(dest); }
        lastG = 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [location.pathname, navigate]);

  // Restore dark-mode pref
  useEffect(() => {
    if (localStorage.getItem("admin-dark") === "1") document.documentElement.classList.add("dark");
  }, []);

  // Capture frontend errors
  useEffect(() => {
    const log = (message: string, stack?: string) => {
      supabase.from("client_error_logs").insert({
        message: message.slice(0, 1000),
        stack: stack?.slice(0, 4000),
        url: window.location.href,
        user_agent: navigator.userAgent,
      } as any).then(() => {});
    };
    const onErr = (e: ErrorEvent) => log(e.message || "Unknown error", e.error?.stack);
    const onRej = (e: PromiseRejectionEvent) => log(`Unhandled rejection: ${String(e.reason)}`, e.reason?.stack);
    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);
    return () => { window.removeEventListener("error", onErr); window.removeEventListener("unhandledrejection", onRej); };
  }, []);
}
