const SITE_URL = Deno.env.get("PUBLIC_SITE_URL") || "https://shahedit.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";

Deno.serve(() => {
  const robots = `# Robots.txt for Shahed IT
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /dashboard
Disallow: /login
Disallow: /reset-password
Disallow: /forgot-password
Disallow: /payment

# Sitemap
Sitemap: ${SUPABASE_URL}/functions/v1/sitemap-xml
Sitemap: ${SITE_URL}/sitemap.xml
`;
  return new Response(robots, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=86400" },
  });
});
