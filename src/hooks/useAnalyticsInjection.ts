import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches GA4 & GSC settings from DB and injects:
 * - gtag.js script for Google Analytics 4
 * - google-site-verification meta tag for Search Console
 */
export function useAnalyticsInjection() {
  useEffect(() => {
    supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["ga4_measurement_id", "gsc_verification_code"])
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, string> = {};
        data.forEach(r => { if (r.value) map[r.key] = r.value; });

        // --- Google Analytics 4 ---
        const ga4Id = map["ga4_measurement_id"];
        if (ga4Id && ga4Id.startsWith("G-") && !document.getElementById("ga4-script")) {
          const s1 = document.createElement("script");
          s1.id = "ga4-script";
          s1.async = true;
          s1.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
          document.head.appendChild(s1);

          const s2 = document.createElement("script");
          s2.id = "ga4-init";
          s2.textContent = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${ga4Id}');
          `;
          document.head.appendChild(s2);
        }

        // --- Google Search Console verification ---
        const gscCode = map["gsc_verification_code"];
        if (gscCode && !document.querySelector('meta[name="google-site-verification"]')) {
          const meta = document.createElement("meta");
          meta.name = "google-site-verification";
          meta.content = gscCode;
          document.head.appendChild(meta);
        }
      });
  }, []);
}
