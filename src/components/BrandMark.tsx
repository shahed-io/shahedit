import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import markAsset from "@/assets/shahed-it-mark.png.asset.json";

const FALLBACK = markAsset.url;

// Module-level cache + in-flight promise so multiple instances share one fetch
let cachedLogo: string | null = null;
let inflight: Promise<string> | null = null;

const fetchLogo = (): Promise<string> => {
  if (cachedLogo) return Promise.resolve(cachedLogo);
  if (inflight) return inflight;
  inflight = supabase
    .from("site_settings")
    .select("value")
    .eq("key", "logo_url")
    .maybeSingle()
    .then(({ data }) => {
      const v = data?.value?.trim();
      cachedLogo = v && v.length > 0 ? v : FALLBACK;
      return cachedLogo;
    })
    .catch(() => {
      cachedLogo = FALLBACK;
      return FALLBACK;
    });
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
  rounded?: boolean;        // clip to circle (default true)
  alt?: string;
};

/**
 * Premium, transparent-blending Shahed IT mark.
 * Soft purple halo behind a transparent PNG that adapts to any background
 * (dark, light, glass). Pulls logo_url from site_settings with a CDN fallback.
 */
const BrandMark = ({
  size = 44,
  className = "",
  glow = "soft",
  rounded = true,
  alt = "Shahed IT",
}: BrandMarkProps) => {
  const url = useSiteLogo();

  const haloOpacity = glow === "strong" ? 0.7 : glow === "soft" ? 0.45 : 0;
  const dropShadow =
    glow === "strong"
      ? "drop-shadow(0 0 12px rgba(192,132,252,0.65)) drop-shadow(0 4px 16px rgba(168,85,247,0.45))"
      : glow === "soft"
      ? "drop-shadow(0 0 8px rgba(192,132,252,0.45))"
      : "none";

  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {glow !== "none" && (
        <span
          aria-hidden
          className="absolute inset-0 pointer-events-none animate-[pulse_3.5s_ease-in-out_infinite]"
          style={{
            background: `radial-gradient(circle at 50% 50%, rgba(192,132,252,${haloOpacity}) 0%, rgba(168,85,247,${
              haloOpacity * 0.6
            }) 35%, rgba(236,72,153,${haloOpacity * 0.3}) 60%, rgba(0,0,0,0) 75%)`,
            filter: "blur(10px)",
            transform: "scale(1.4)",
            borderRadius: "9999px",
          }}
        />
      )}
      <img
        src={url}
        alt={alt}
        loading="eager"
        decoding="async"
        className={`relative w-full h-full object-contain ${rounded ? "rounded-full" : ""}`}
        style={{ filter: dropShadow }}
      />
    </span>
  );
};

export default BrandMark;
