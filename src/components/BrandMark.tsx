import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SITE_LOGO_FALLBACK } from "@/lib/site-logo";
import { useIsMobile } from "@/hooks/use-mobile";

const FALLBACK = SITE_LOGO_FALLBACK;

// Module-level cache + in-flight promise so multiple instances share one fetch
let cachedLogo: string | null = null;
let inflight: Promise<string> | null = null;

const fetchLogo = (): Promise<string> => {
  if (cachedLogo) return Promise.resolve(cachedLogo);
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "logo_url")
        .maybeSingle();
      const v = data?.value?.trim();
      cachedLogo = v && v.length > 0 ? v : FALLBACK;
    } catch {
      cachedLogo = FALLBACK;
    }
    return cachedLogo!;
  })();
  return inflight;
};


export const useSiteLogo = () => {
  const [url, setUrl] = useState<string>(cachedLogo ?? FALLBACK);
  useEffect(() => {
    let alive = true;
    fetchLogo().then((u) => {
      if (alive) setUrl(u);
    });
    return () => {
      alive = false;
    };
  }, []);
  return url;
};

type BrandMarkProps = {
  size?: number;            // px
  className?: string;
  glow?: "soft" | "strong" | "none";
  rounded?: boolean;        // optional clipping for special surfaces
  alt?: string;
};

/**
 * Transparent Shahed IT logo that always pulls logo_url from site_settings
 * with only a matching transparent CDN fallback while the DB request loads.
 */
const BrandMark = ({
  size = 44,
  className = "",
  glow = "soft",
  rounded = false,
  alt = "Shahed IT",
}: BrandMarkProps) => {
  const url = useSiteLogo();
  const isMobile = useIsMobile();

  const haloOpacity = (glow === "strong" ? 0.7 : glow === "soft" ? 0.45 : 0) * (isMobile ? 0.58 : 1);
  const dropShadow =
    glow === "strong"
      ? isMobile
        ? "drop-shadow(0 0 5px rgba(192,132,252,0.42))"
        : "drop-shadow(0 0 12px rgba(192,132,252,0.65)) drop-shadow(0 4px 16px rgba(168,85,247,0.45))"
      : glow === "soft"
      ? isMobile
        ? "drop-shadow(0 0 4px rgba(192,132,252,0.30))"
        : "drop-shadow(0 0 8px rgba(192,132,252,0.45))"
      : "none";

  // The DB logo is a transparent wide wordmark. Render at the given `size` as
  // HEIGHT and let width follow the natural aspect ratio — never crop it square.
  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ height: size }}
    >
      {glow !== "none" && (
        <span
          aria-hidden
          className={`absolute inset-0 pointer-events-none ${isMobile ? "" : "animate-[pulse_3.5s_ease-in-out_infinite]"}`}
          style={{
            background: `radial-gradient(ellipse at 50% 50%, rgba(192,132,252,${haloOpacity}) 0%, rgba(168,85,247,${
              haloOpacity * 0.6
            }) 35%, rgba(236,72,153,${haloOpacity * 0.3}) 60%, rgba(0,0,0,0) 75%)`,
            filter: isMobile ? "blur(6px)" : "blur(12px)",
            transform: isMobile ? "scale(1.10)" : "scale(1.20)",
            borderRadius: "9999px",
          }}
        />
      )}
      <img
        src={url}
        alt={alt}
        loading="eager"
        decoding="async"
        className={`relative h-full w-auto object-contain ${rounded ? "rounded-xl" : ""}`}
        style={{ filter: dropShadow, maxWidth: "none" }}
      />
    </span>
  );
};

export default BrandMark;
