import { useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

/**
 * Global cinematic background matching the HeroBanner aesthetic.
 * - Deep #0a0514 base
 * - Two animated purple/magenta glow orbs (pulse)
 * - Subtle dot-grid mesh
 * Hidden on admin routes (/ceo, /admin).
 */
const SiteBackground = () => {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith("/ceo") || pathname.startsWith("/admin");

  useEffect(() => {
    document.body.classList.toggle("site-cinematic-bg", !isAdminRoute);
    return () => document.body.classList.remove("site-cinematic-bg");
  }, [isAdminRoute]);

  if (isAdminRoute) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#0a0514]"
      style={{ contain: "strict", transform: "translateZ(0)" }}
    >
      <div className="absolute inset-0 opacity-50">
        <motion.div
          className="absolute -top-[15%] -left-[10%] w-[55%] h-[60%] rounded-full bg-[hsl(270,92%,65%)] blur-[140px]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.45, 0.7, 0.45] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-[15%] -right-[10%] w-[55%] h-[60%] rounded-full bg-[hsl(320,90%,55%)] blur-[140px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute top-[40%] left-[45%] w-[40%] h-[45%] rounded-full bg-[hsl(290,85%,60%)] blur-[160px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.06) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>
    </div>
  );
};

export default SiteBackground;
