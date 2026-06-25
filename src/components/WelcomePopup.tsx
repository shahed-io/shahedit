import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Popup = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_link: string | null;
  bg_color: string | null;
  text_color: string | null;
  button_bg_color: string | null;
  button_text_color: string | null;
  overlay_opacity: number | null;
  border_radius: number | null;
  targeting: string;
  target_paths: string[] | null;
  show_once: boolean;
  delay_seconds: number | null;
  priority: number;
};

const STORAGE_KEY = "welcome_popup_seen";

function pathMatches(popup: Popup, currentPath: string): boolean {
  if (popup.targeting === "all") return true;
  if (popup.targeting === "home") return currentPath === "/";
  if (popup.targeting === "specific") {
    const paths = popup.target_paths || [];
    return paths.some((p) => {
      if (!p) return false;
      if (p.endsWith("*")) return currentPath.startsWith(p.slice(0, -1));
      return currentPath === p;
    });
  }
  return false;
}

function getSeen(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function markSeen(id: string) {
  const seen = getSeen();
  seen[id] = Date.now();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
  } catch {}
}

export default function WelcomePopup() {
  const location = useLocation();
  const [popup, setPopup] = useState<Popup | null>(null);
  const [open, setOpen] = useState(false);

  // Don't show on admin pages
  const isAdminRoute = location.pathname.startsWith("/ceo");

  useEffect(() => {
    if (isAdminRoute) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await (supabase as any)
        .from("welcome_popups")
        .select("*")
        .eq("is_active", true)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });
      if (error || cancelled || !data) return;

      const seen = getSeen();
      const candidate = (data as Popup[]).find((p) => {
        if (!pathMatches(p, location.pathname)) return false;
        if (p.show_once && seen[p.id]) return false;
        return true;
      });
      if (!candidate) return;
      setPopup(candidate);
      const delay = Math.max(0, (candidate.delay_seconds ?? 2) * 1000);
      const t = setTimeout(() => setOpen(true), delay);
      return () => clearTimeout(t);
    })();
    return () => {
      cancelled = true;
    };
  }, [location.pathname, isAdminRoute]);

  const handleClose = () => {
    if (popup?.show_once) markSeen(popup.id);
    setOpen(false);
  };

  const handleCta = () => {
    if (popup?.show_once) markSeen(popup.id);
    setOpen(false);
  };

  if (isAdminRoute || !popup) return null;

  const bg = popup.bg_color || "#0a0510";
  const fg = popup.text_color || "#ffffff";
  const btnBg = popup.button_bg_color || "#7c3aed";
  const btnFg = popup.button_text_color || "#ffffff";
  const radius = popup.border_radius ?? 24;
  const overlayOpacity = popup.overlay_opacity ?? 0.7;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: `rgba(0,0,0,${overlayOpacity})` }}
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md overflow-hidden shadow-2xl"
            style={{
              background: bg,
              color: fg,
              borderRadius: radius,
              boxShadow: "0 25px 80px -10px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
            }}
          >
            <button
              onClick={handleClose}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: "rgba(0,0,0,0.45)",
                color: "#fff",
                backdropFilter: "blur(6px)",
              }}
            >
              <X size={18} />
            </button>

            {popup.image_url && (
              <div className="w-full aspect-[16/9] overflow-hidden">
                <img
                  src={popup.image_url}
                  alt={popup.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}

            <div className="p-6 sm:p-7 text-center">
              {popup.title && (
                <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-2" style={{ color: fg }}>
                  {popup.title}
                </h2>
              )}
              {popup.subtitle && (
                <p className="text-sm sm:text-base opacity-85 leading-relaxed mb-5" style={{ color: fg }}>
                  {popup.subtitle}
                </p>
              )}
              {popup.cta_label && popup.cta_link && (
                <a
                  href={popup.cta_link}
                  onClick={handleCta}
                  target={popup.cta_link.startsWith("http") ? "_blank" : undefined}
                  rel={popup.cta_link.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center justify-center px-7 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.03] hover:shadow-lg"
                  style={{
                    background: btnBg,
                    color: btnFg,
                    boxShadow: `0 8px 24px ${btnBg}55`,
                  }}
                >
                  {popup.cta_label}
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
