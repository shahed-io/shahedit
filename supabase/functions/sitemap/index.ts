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

  // site URL
  const { data: settings } = await supabase
    .from("site_settings")
    .select("key,value")
    .eq("key", "site_url")
    .maybeSingle();
  const siteUrl = (settings?.value || "https://shahedit.com").replace(/\/$/, "");

  const urls: { loc: string; lastmod?: string; priority?: string }[] = [];

  // SEO pages (canonical routes)
  const { data: seoPages } = await supabase
    .from("seo_pages")
    .select("route_path, updated_at")
    .eq("is_active", true);
  seoPages?.forEach((p) =>
    urls.push({ loc: `${siteUrl}${p.route_path}`, lastmod: p.updated_at, priority: p.route_path === "/" ? "1.0" : "0.8" })
  );

  // Service packages
  const { data: pkgs } = await supabase
    .from("service_packages")
    .select("id, updated_at")
    .eq("is_published", true);
  pkgs?.forEach((p) => urls.push({ loc: `${siteUrl}/product/${p.id}`, lastmod: p.updated_at, priority: "0.7" }));

  // Blog posts
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("is_published", true);
  posts?.forEach((p) => urls.push({ loc: `${siteUrl}/blog/${p.slug}`, lastmod: p.updated_at, priority: "0.6" }));

  // Projects
  const { data: projects } = await supabase
    .from("projects")
    .select("slug, updated_at")
    .eq("is_published", true);
  projects?.forEach((p) => urls.push({ loc: `${siteUrl}/portfolio/${p.slug}`, lastmod: p.updated_at, priority: "0.6" }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ""}${u.priority ? `\n    <priority>${u.priority}</priority>` : ""}
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
});
