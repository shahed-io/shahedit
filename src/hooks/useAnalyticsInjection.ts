import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Injects ALL ranking / analytics / verification scripts based on DB-driven settings.
 * Managed from /admin/ranking-setup.
 *
 * Search-engine verifications: Google, Bing, Yandex, Pinterest, Naver, Baidu, Ahrefs, Norton.
 * Analytics & pixels: GA4, Google Tag Manager, Google Ads, Microsoft Clarity, Hotjar,
 *                     Facebook Pixel, TikTok Pixel, LinkedIn Insight, Twitter (X) Pixel,
 *                     Pinterest Tag, Snapchat Pixel, Yandex Metrica, AdSense.
 */
const KEYS = [
  // Google
  "ga4_measurement_id",
  "gtm_container_id",
  "google_ads_conversion_id",
  "adsense_publisher_id",
  "gsc_verification_code",
  // Other search engines
  "bing_verification_code",
  "yandex_verification_code",
  "pinterest_verification_code",
  "naver_verification_code",
  "baidu_verification_code",
  "ahrefs_verification_code",
  "norton_verification_code",
  // Analytics
  "microsoft_clarity_id",
  "hotjar_id",
  "yandex_metrica_id",
  // Marketing pixels
  "facebook_pixel_id",
  "fb_app_id",
  "tiktok_pixel_id",
  "linkedin_partner_id",
  "twitter_pixel_id",
  "pinterest_tag_id",
  "snapchat_pixel_id",
];

const addMeta = (name: string, content: string) => {
  if (!content) return;
  if (document.querySelector(`meta[name="${name}"]`)) return;
  const m = document.createElement("meta");
  m.name = name;
  m.content = content;
  document.head.appendChild(m);
};

const addScript = (id: string, build: () => HTMLScriptElement) => {
  if (document.getElementById(id)) return;
  document.head.appendChild(build());
};

export function useAnalyticsInjection() {
  useEffect(() => {
    supabase.from("site_settings").select("key,value").in("key", KEYS).then(({ data }) => {
      if (!data) return;
      const m: Record<string, string> = {};
      data.forEach((r: any) => { if (r.value) m[r.key] = r.value.trim(); });

      // ---- Search engine verifications (META tags) ----
      addMeta("google-site-verification", m.gsc_verification_code);
      addMeta("msvalidate.01", m.bing_verification_code);
      addMeta("yandex-verification", m.yandex_verification_code);
      addMeta("p:domain_verify", m.pinterest_verification_code);
      addMeta("naver-site-verification", m.naver_verification_code);
      addMeta("baidu-site-verification", m.baidu_verification_code);
      addMeta("ahrefs-site-verification", m.ahrefs_verification_code);
      addMeta("norton-safeweb-site-verification", m.norton_verification_code);
      if (m.fb_app_id) addMeta("fb:app_id", m.fb_app_id);

      // ---- Google Tag Manager (loads everything else via GTM if configured) ----
      if (m.gtm_container_id && /^GTM-/i.test(m.gtm_container_id) && !document.getElementById("gtm-script")) {
        const s = document.createElement("script");
        s.id = "gtm-script";
        s.textContent = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${m.gtm_container_id}');`;
        document.head.appendChild(s);
        const ns = document.createElement("noscript");
        ns.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${m.gtm_container_id}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
        document.body.insertBefore(ns, document.body.firstChild);
      }

      // ---- Google Analytics 4 ----
      const ga4 = m.ga4_measurement_id;
      const gAds = m.google_ads_conversion_id;
      const needsGtag = (ga4 && /^G-/i.test(ga4)) || (gAds && /^AW-/i.test(gAds));
      if (needsGtag && !document.getElementById("gtag-loader")) {
        const id = ga4 || gAds;
        addScript("gtag-loader", () => {
          const s = document.createElement("script");
          s.id = "gtag-loader"; s.async = true;
          s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
          return s;
        });
        const init = document.createElement("script");
        init.id = "gtag-init";
        init.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());${ga4 ? `gtag('config','${ga4}');` : ""}${gAds ? `gtag('config','${gAds}');` : ""}`;
        document.head.appendChild(init);
      }

      // ---- Google AdSense ----
      if (m.adsense_publisher_id && /^ca-pub-/i.test(m.adsense_publisher_id)) {
        addScript("adsense-script", () => {
          const s = document.createElement("script");
          s.id = "adsense-script"; s.async = true; s.crossOrigin = "anonymous";
          s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${m.adsense_publisher_id}`;
          return s;
        });
      }

      // ---- Microsoft Clarity ----
      if (m.microsoft_clarity_id) {
        addScript("clarity-script", () => {
          const s = document.createElement("script");
          s.id = "clarity-script";
          s.textContent = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${m.microsoft_clarity_id}");`;
          return s;
        });
      }

      // ---- Hotjar ----
      if (m.hotjar_id) {
        addScript("hotjar-script", () => {
          const s = document.createElement("script");
          s.id = "hotjar-script";
          s.textContent = `(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:${m.hotjar_id},hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`;
          return s;
        });
      }

      // ---- Yandex Metrica ----
      if (m.yandex_metrica_id) {
        addScript("ym-script", () => {
          const s = document.createElement("script");
          s.id = "ym-script";
          s.textContent = `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${m.yandex_metrica_id},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true});`;
          return s;
        });
      }

      // ---- Facebook Pixel ----
      if (m.facebook_pixel_id) {
        addScript("fb-pixel", () => {
          const s = document.createElement("script");
          s.id = "fb-pixel";
          s.textContent = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${m.facebook_pixel_id}');fbq('track','PageView');`;
          return s;
        });
        const ns = document.createElement("noscript");
        const img = document.createElement("img");
        img.height = 1; img.width = 1; img.style.display = "none";
        img.src = `https://www.facebook.com/tr?id=${m.facebook_pixel_id}&ev=PageView&noscript=1`;
        ns.appendChild(img);
        document.body.appendChild(ns);
      }

      // ---- TikTok Pixel ----
      if (m.tiktok_pixel_id) {
        addScript("tiktok-pixel", () => {
          const s = document.createElement("script");
          s.id = "tiktok-pixel";
          s.textContent = `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${m.tiktok_pixel_id}');ttq.page();}(window,document,'ttq');`;
          return s;
        });
      }

      // ---- LinkedIn Insight Tag ----
      if (m.linkedin_partner_id) {
        addScript("linkedin-insight", () => {
          const s = document.createElement("script");
          s.id = "linkedin-insight";
          s.textContent = `_linkedin_partner_id="${m.linkedin_partner_id}";window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(_linkedin_partner_id);(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];var b=document.createElement("script");b.type="text/javascript";b.async=true;b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";s.parentNode.insertBefore(b,s);})(window.lintrk);`;
          return s;
        });
      }

      // ---- Twitter / X Pixel ----
      if (m.twitter_pixel_id) {
        addScript("twitter-pixel", () => {
          const s = document.createElement("script");
          s.id = "twitter-pixel";
          s.textContent = `!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments)},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');twq('config','${m.twitter_pixel_id}');`;
          return s;
        });
      }

      // ---- Pinterest Tag ----
      if (m.pinterest_tag_id) {
        addScript("pinterest-tag", () => {
          const s = document.createElement("script");
          s.id = "pinterest-tag";
          s.textContent = `!function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");pintrk('load','${m.pinterest_tag_id}');pintrk('page');`;
          return s;
        });
      }

      // ---- Snapchat Pixel ----
      if (m.snapchat_pixel_id) {
        addScript("snap-pixel", () => {
          const s = document.createElement("script");
          s.id = "snap-pixel";
          s.textContent = `(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};a.queue=[];var s='script';var r=t.createElement(s);r.async=!0;r.src=n;var u=t.getElementsByTagName(s)[0];u.parentNode.insertBefore(r,u)})(window,document,'https://sc-static.net/scevent.min.js');snaptr('init','${m.snapchat_pixel_id}');snaptr('track','PAGE_VIEW');`;
          return s;
        });
      }
    });
  }, []);
}
