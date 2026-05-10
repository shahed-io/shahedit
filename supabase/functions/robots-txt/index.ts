import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = Deno.env.get("PUBLIC_SITE_URL") || "https://shahedit.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data } = await supabase
    .from("site_settings")
    .select("key,value")
    .in("key", ["robots_enabled", "robots_index", "robots_custom", "sitemap_enabled"]);
  const map: Record<string, string> = {};
  (data ?? []).forEach((r: any) => { map[r.key] = r.value ?? ""; });

  const robotsEnabled = !("robots_enabled" in map) || map.robots_enabled === "true" || map.robots_enabled === "1";
  if (!robotsEnabled) {
    return new Response("User-agent: *\nDisallow: /\n", {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*" },
    });
  }

  const indexable = !("robots_index" in map) || map.robots_index === "true" || map.robots_index === "1";
  const sitemapEnabled = !("sitemap_enabled" in map) || map.sitemap_enabled === "true" || map.sitemap_enabled === "1";
  const custom = (map.robots_custom || "").trim();

  const lines: string[] = [
    "# Robots.txt for Shahed IT",
    "User-agent: *",
    indexable ? "Allow: /" : "Disallow: /",
    "Disallow: /admin",
    "Disallow: /admin/",
    "Disallow: /dashboard",
    "Disallow: /login",
    "Disallow: /reset-password",
    "Disallow: /forgot-password",
    "Disallow: /payment",
  ];
  if (custom) { lines.push("", "# Custom rules", custom); }
  if (sitemapEnabled) {
    lines.push("", "# Sitemap", `Sitemap: ${SUPABASE_URL}/functions/v1/sitemap-xml`, `Sitemap: ${SITE_URL}/sitemap.xml`);
  }

  return new Response(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=3600" },
  });
});
