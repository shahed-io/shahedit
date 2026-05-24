import { supabase } from "@/integrations/supabase/client";

const SITE_URL = "https://shahedit.com/";
const SITEMAP_URL = "https://shahedit.com/sitemap.xml";

export type GscAction = "submit_sitemap" | "list_sitemaps" | "list_sites" | "inspect_url";

export async function callGsc(action: GscAction, extra: Record<string, any> = {}) {
  const { data, error } = await supabase.functions.invoke("gsc-submit", {
    body: { action, siteUrl: SITE_URL, sitemapUrl: SITEMAP_URL, ...extra },
  });
  if (error) throw error;
  if (!data?.success) throw new Error(data?.error || "GSC call failed");
  return data.result;
}

/**
 * Fire-and-forget sitemap resubmission. Call from any admin publish action.
 * Silently logs errors; never blocks the UI.
 */
export function notifyGscOnPublish(pageUrl?: string) {
  callGsc("submit_sitemap").catch((e) => console.warn("[GSC] sitemap submit failed:", e?.message || e));
  if (pageUrl) {
    callGsc("inspect_url", { pageUrl }).catch((e) => console.warn("[GSC] inspect failed:", e?.message || e));
  }
}
