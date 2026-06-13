import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query } = await req.json();
    const q = (query ?? "").toString().trim();
    if (!q) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Pull catalog (compact)
    const [svcRes, pkgRes, blogRes, faqRes] = await Promise.all([
      supabase.from("services").select("title, slug, short_description").eq("is_published", true).limit(40),
      supabase.from("service_packages").select("title, slug, description, price, original_price, currency, badge, features").eq("is_published", true).limit(80),
      supabase.from("blog_posts").select("title, slug, excerpt").eq("is_published", true).order("published_at", { ascending: false }).limit(20),
      supabase.from("faqs").select("question, answer").eq("is_published", true).limit(30),
    ]);

    const services = svcRes.data ?? [];
    const packages = pkgRes.data ?? [];
    const blogs = blogRes.data ?? [];
    const faqs = faqRes.data ?? [];

    // Build catalog text + index of citable items
    type Cite = { kind: "service" | "package" | "blog"; title: string; href: string };
    const cites: Cite[] = [];
    let catalog = "## SERVICES\n";
    for (const s of services) {
      cites.push({ kind: "service", title: s.title, href: `/services/${s.slug}` });
      catalog += `- ${s.title}${s.short_description ? " — " + s.short_description : ""} [/services/${s.slug}]\n`;
    }
    catalog += "\n## PACKAGES\n";
    for (const p of packages) {
      cites.push({ kind: "package", title: p.title, href: `/packages/${p.slug}` });
      const price = p.price ? `${p.currency ?? "BDT"} ${p.price}` : "—";
      const feats = (p.features ?? []).slice(0, 3).join(", ");
      catalog += `- ${p.title} (${price})${p.badge ? " [" + p.badge + "]" : ""}${p.description ? " — " + p.description.slice(0, 100) : ""}${feats ? " | " + feats : ""} [/packages/${p.slug}]\n`;
    }
    catalog += "\n## BLOG\n";
    for (const b of blogs) {
      cites.push({ kind: "blog", title: b.title, href: `/blog/${b.slug}` });
      catalog += `- ${b.title}${b.excerpt ? " — " + b.excerpt.slice(0, 120) : ""} [/blog/${b.slug}]\n`;
    }
    catalog += "\n## FAQ\n";
    for (const f of faqs) catalog += `Q: ${f.question}\nA: ${(f.answer ?? "").slice(0, 200)}\n`;

    const system = `You are Shahed IT's AI search assistant. The user asks a question in Bangla or English about our services, packages, or topics.
Using ONLY the catalog below, produce a concise, helpful answer (2-5 sentences) in the SAME language the user used. Then recommend the most relevant matches.

Strict rules:
- Recommend ONLY items present in the catalog (use the exact title + href).
- If nothing matches, set "suggestions": [] and tell the user to contact us at 01820-060046.
- Output STRICT JSON: {"answer": string, "suggestions": [{"title": string, "href": string, "type": "service"|"package"|"blog", "reason": string}]}
- Maximum 5 suggestions.
- No markdown fences, no extra commentary outside the JSON.

CATALOG:
${catalog}`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: system },
          { role: "user", content: q },
        ],
        response_format: { type: "json_object" },
        max_tokens: 800,
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI quota exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const txt = await aiResp.text();
      throw new Error(`AI gateway ${aiResp.status}: ${txt}`);
    }

    const data = await aiResp.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: { answer?: string; suggestions?: Array<{ title: string; href: string; type: string; reason?: string }> } = {};
    try { parsed = JSON.parse(raw); } catch { parsed = { answer: raw, suggestions: [] }; }

    // Validate suggestions against catalog
    const validHrefs = new Set(cites.map(c => c.href));
    const suggestions = (parsed.suggestions ?? []).filter(s => s && validHrefs.has(s.href)).slice(0, 5);

    return new Response(
      JSON.stringify({
        answer: parsed.answer ?? "",
        suggestions,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("ai-search error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
