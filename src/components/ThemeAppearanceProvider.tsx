import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Reads `theme_glow_intensity` and `theme_dot_opacity` from site_settings
 * and applies them to <html> as CSS variables: --glow-mult, --dot-opacity.
 * The body background in index.css multiplies its alphas by these vars.
 */
const ThemeAppearanceProvider = () => {
  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key,value")
        .in("key", ["theme_glow_intensity", "theme_dot_opacity"]);
      if (!active || !data) return;
      const map = Object.fromEntries(data.map((r) => [r.key, r.value]));
      const root = document.documentElement;
      const glow = parseFloat(map.theme_glow_intensity ?? "1");
      const dot = parseFloat(map.theme_dot_opacity ?? "0.18");
      if (!Number.isNaN(glow)) root.style.setProperty("--glow-mult", String(glow));
      if (!Number.isNaN(dot)) root.style.setProperty("--dot-opacity", String(dot));
    })();
    return () => { active = false; };
  }, []);
  return null;
};

export default ThemeAppearanceProvider;
