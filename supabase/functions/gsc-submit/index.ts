// Submit/resubmit sitemap to Google Search Console and (optionally) request indexing for a URL.
// Auth: caller must be an authenticated admin user (verified via service-role lookup of user_roles).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GSC_KEY = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!GSC_KEY) throw new Error("GOOGLE_SEARCH_CONSOLE_API_KEY not configured — connect Google Search Console");

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const isAdmin = (roles || []).some((r: any) => ["super_admin", "admin", "manager", "editor"].includes(r.role));
    if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json().catch(() => ({}));
    const action: "submit_sitemap" | "list_sitemaps" | "list_sites" | "inspect_url" = body.action || "submit_sitemap";
    const siteUrl: string = body.siteUrl || "https://shahedit.com/";
    const sitemapUrl: string = body.sitemapUrl || `${siteUrl.replace(/\/$/, "")}/sitemap.xml`;

    const gscFetch = async (path: string, init: RequestInit = {}) => {
      const res = await fetch(`${GATEWAY}${path}`, {
        ...init,
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": GSC_KEY,
          "Content-Type": "application/json",
          ...(init.headers || {}),
        },
      });
      const text = await res.text();
      let data: any = text;
      try { data = text ? JSON.parse(text) : {}; } catch { /* keep text */ }
      if (!res.ok) throw new Error(`GSC ${path} [${res.status}]: ${typeof data === "string" ? data : JSON.stringify(data)}`);
      return data;
    };

    let result: any;
    const enc = encodeURIComponent;

    if (action === "list_sites") {
      result = await gscFetch(`/webmasters/v3/sites`);
    } else if (action === "list_sitemaps") {
      result = await gscFetch(`/webmasters/v3/sites/${enc(siteUrl)}/sitemaps`);
    } else if (action === "submit_sitemap") {
      // PUT submits/resubmits the sitemap (also acts as ping for re-crawl)
      await gscFetch(`/webmasters/v3/sites/${enc(siteUrl)}/sitemaps/${enc(sitemapUrl)}`, { method: "PUT" });
      result = { submitted: sitemapUrl, site: siteUrl };
    } else if (action === "inspect_url") {
      const pageUrl: string = body.pageUrl;
      if (!pageUrl) throw new Error("pageUrl required for inspect_url");
      result = await gscFetch(`/v1/urlInspection/index:inspect`, {
        method: "POST",
        body: JSON.stringify({ inspectionUrl: pageUrl, siteUrl, languageCode: "en-US" }),
      });
    } else {
      throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify({ success: true, action, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("gsc-submit error", e);
    return new Response(JSON.stringify({ success: false, error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
