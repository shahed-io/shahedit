import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Global cinematic background.
 * On mobile we render static gradients (no animation, smaller blur)
 * to avoid heavy repaints / "buffering" on low-end devices.
 */
const SiteBackground = () => {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const isAdminRoute = pathname.startsWith("/ceo") || pathname.startsWith("/admin");

  useEffect(() => {
    document.body.classList.toggle("site-cinematic-bg", !isAdminRoute);
    return () => document.body.classList.remove("site-cinematic-bg");
  }, [isAdminRoute]);

  if (isAdminRoute) return null;

  if (isMobile) {
    return (
      <div
        aria-hidden
        className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#0a0514]"
        style={{ contain: "strict" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(at 20% 10%, hsla(270,92%,55%,0.28) 0px, transparent 45%), radial-gradient(at 85% 85%, hsla(320,90%,55%,0.22) 0px, transparent 50%)",
          }}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#0a0514]"
      style={{ contain: "strict", transform: "translateZ(0)" }}
    >
      <div className="absolute inset-0 opacity-50">
        <div
          className="absolute -top-[15%] -left-[10%] w-[55%] h-[60%] rounded-full bg-[hsl(270,92%,65%)] blur-[140px]"
        />
        <div
          className="absolute -bottom-[15%] -right-[10%] w-[55%] h-[60%] rounded-full bg-[hsl(320,90%,55%)] blur-[140px]"
        />
        <div
          className="absolute top-[40%] left-[45%] w-[40%] h-[45%] rounded-full bg-[hsl(290,85%,60%)] blur-[160px]"
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
