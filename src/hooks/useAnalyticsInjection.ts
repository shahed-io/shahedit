import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Injects analytics & verification scripts based on DB-driven settings:
 * - Google Analytics 4 (gtag.js)
 * - Google Search Console verification meta
 * - Bing Webmaster verification meta
 * - Facebook Pixel
 */
export function useAnalyticsInjection() {
  useEffect(() => {
    supabase
      .from("site_settings")
      .select("key, value")
      .in("key", [
        "ga4_measurement_id",
        "gsc_verification_code",
        "bing_verification_code",
        "facebook_pixel_id",
      ])
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

        // --- Google Search Console ---
        const gscCode = map["gsc_verification_code"];
        if (gscCode && !document.querySelector('meta[name="google-site-verification"]')) {
          const meta = document.createElement("meta");
          meta.name = "google-site-verification";
          meta.content = gscCode;
          document.head.appendChild(meta);
        }

        // --- Bing Webmaster ---
        const bingCode = map["bing_verification_code"];
        if (bingCode && !document.querySelector('meta[name="msvalidate.01"]')) {
          const meta = document.createElement("meta");
          meta.name = "msvalidate.01";
          meta.content = bingCode;
          document.head.appendChild(meta);
        }

        // --- Facebook Pixel ---
        const fbId = map["facebook_pixel_id"];
        if (fbId && !document.getElementById("fb-pixel")) {
          const s = document.createElement("script");
          s.id = "fb-pixel";
          s.textContent = `
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
            document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${fbId}');
            fbq('track', 'PageView');
          `;
          document.head.appendChild(s);

          // Fallback img must NOT be in <head>; append to <body>
          const noscript = document.createElement("noscript");
          const img = document.createElement("img");
          img.height = 1; img.width = 1; img.style.display = "none";
          img.src = `https://www.facebook.com/tr?id=${fbId}&ev=PageView&noscript=1`;
          noscript.appendChild(img);
          document.body.appendChild(noscript);
        }
      });
  }, []);
}
