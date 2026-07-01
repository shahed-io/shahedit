import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { chatCompletion } from "../_shared/ai-router.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface MenuItem {
  label: string;
  href: string;
  group?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, items } = (await req.json()) as { query: string; items: MenuItem[] };
    if (!query?.trim() || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Build a compact menu catalog the model can reason over
    const catalog = items
      .map((it, i) => `${i + 1}. [${it.href}] ${it.label}${it.group ? ` (${it.group})` : ""}`)
      .join("\n");

    const systemPrompt = `You are an intelligent navigation assistant for the "Shahed IT" admin panel.
The user types a query in Bengali or English. Your job: pick the 1-5 most relevant menu items.

Rules:
- Match meaning, not just exact words. Bengali synonyms count (e.g. "টাকা/পেমেন্ট/অর্থ" → Payments/Wallets, "অর্ডার/বিক্রয়" → Orders, "ব্যবহারকারী/ইউজার" → Users, "সেটিং/কনফিগার" → Settings).
- Rank by relevance, most relevant first.
- Only return items from the catalog below. Use the exact href.
- Return STRICT JSON only — no markdown, no prose.

Format:
{"results":[{"href":"/ceo/...","label":"...","reason":"short Bengali why (max 8 words)"}]}

Menu catalog:
${catalog}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query.trim() },
        ],
        response_format: { type: "json_object" },
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "rate_limited", results: [] }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "credits_exhausted", results: [] }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    let parsed: { results?: Array<{ href: string; label: string; reason?: string }> } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) {
        try { parsed = JSON.parse(m[0]); } catch { /* ignore */ }
      }
    }

    // Validate against catalog so the model can't hallucinate links
    const allowed = new Map(items.map((i) => [i.href, i.label]));
    const results = (parsed.results ?? [])
      .filter((r) => r?.href && allowed.has(r.href))
      .slice(0, 5)
      .map((r) => ({ href: r.href, label: allowed.get(r.href)!, reason: r.reason || "" }));

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("admin-menu-ai-search error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", results: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
