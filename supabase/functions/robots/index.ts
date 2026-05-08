import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const { data } = await supabase
    .from("site_settings")
    .select("key,value")
    .in("key", ["site_url", "robots_extra"]);
  const map: Record<string, string> = {};
  data?.forEach((r) => { if (r.value) map[r.key] = r.value; });
  const siteUrl = (map["site_url"] || "https://shahedit.com").replace(/\/$/, "");

  const projectRef = (Deno.env.get("SUPABASE_URL") ?? "").match(/https:\/\/([^.]+)\./)?.[1];
  const sitemapUrl = `https://${projectRef}.functions.supabase.co/sitemap`;

  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /cms
Disallow: /dashboard
Disallow: /login
Disallow: /reset-password

${map["robots_extra"] || ""}

Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${sitemapUrl}
`;

  return new Response(body, {
    headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
});
