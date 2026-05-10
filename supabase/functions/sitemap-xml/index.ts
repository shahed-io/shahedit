import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = Deno.env.get("PUBLIC_SITE_URL") || "https://shahedit.com";

const STATIC_PAGES = [
  { path: "/", priority: 1.0, changefreq: "daily" },
  { path: "/services", priority: 0.9, changefreq: "weekly" },
  { path: "/portfolio", priority: 0.8, changefreq: "weekly" },
  { path: "/blog", priority: 0.9, changefreq: "daily" },
  { path: "/about", priority: 0.7, changefreq: "monthly" },
  { path: "/contact", priority: 0.7, changefreq: "monthly" },
  { path: "/faq", priority: 0.6, changefreq: "monthly" },
  { path: "/pricing", priority: 0.8, changefreq: "weekly" },
  { path: "/careers", priority: 0.6, changefreq: "weekly" },
  { path: "/get-quote", priority: 0.7, changefreq: "monthly" },
  { path: "/terms", priority: 0.3, changefreq: "yearly" },
  { path: "/privacy-policy", priority: 0.3, changefreq: "yearly" },
  { path: "/refund-policy", priority: 0.3, changefreq: "yearly" },
  { path: "/delivery-policy", priority: 0.3, changefreq: "yearly" },
];

const xmlEscape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const urlEntry = (loc: string, lastmod?: string, priority = 0.5, changefreq = "weekly") =>
  `  <url>
    <loc>${xmlEscape(loc)}</loc>${lastmod ? `
    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : ""}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const [blogs, services, packages, projects] = await Promise.all([
    supabase.from("blog_posts").select("slug,updated_at").eq("is_published", true),
    supabase.from("services").select("slug,updated_at").eq("is_published", true),
    supabase.from("service_packages").select("slug,updated_at").eq("is_published", true),
    supabase.from("projects").select("slug,updated_at").eq("is_published", true),
  ]);

  const urls: string[] = [];
  STATIC_PAGES.forEach((p) => urls.push(urlEntry(`${SITE_URL}${p.path}`, undefined, p.priority, p.changefreq)));
  blogs.data?.forEach((b: any) => urls.push(urlEntry(`${SITE_URL}/blog/${b.slug}`, b.updated_at, 0.8, "weekly")));
  services.data?.forEach((s: any) => urls.push(urlEntry(`${SITE_URL}/services/${s.slug}`, s.updated_at, 0.8, "weekly")));
  packages.data?.forEach((p: any) => p.slug && urls.push(urlEntry(`${SITE_URL}/product/${p.slug}`, p.updated_at, 0.7, "weekly")));
  projects.data?.forEach((p: any) => urls.push(urlEntry(`${SITE_URL}/portfolio/${p.slug}`, p.updated_at, 0.6, "monthly")));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=3600" },
  });
});
