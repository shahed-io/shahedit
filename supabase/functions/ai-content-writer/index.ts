import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  blog: `You are an SEO content writer for Shahed IT — a professional IT agency in Bangladesh (Rajshahi). Write high-quality, original, SEO-optimized blog content as semantic HTML (h2, h3, p, ul, strong). Include keyword-rich headings, internal-linking-friendly anchor cues, scannable structure, and a clear conclusion with CTA. Length: 700-1200 words. Output HTML only, no markdown, no code fences.`,
  meta: `You are an SEO meta description writer. Write a compelling 150-160 character meta description and a 50-60 character title separated by a single line break. Format: "TITLE: ...\nDESCRIPTION: ..."`,
  social: `You are a social media copywriter for Shahed IT. Write 3 short, engaging social media posts (Facebook + LinkedIn style) with relevant emojis and hashtags. Format as numbered list 1. ... 2. ... 3. ...`,
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // --- AuthN/AuthZ ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json(401, { error: "Unauthorized" });
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await admin.auth.getUser(token);
    if (authErr || !user) return json(401, { error: "Unauthorized" });
    const { data: roles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const allowed = new Set(["admin", "super_admin", "editor"]);
    if (!roles?.some((r: any) => allowed.has(r.role))) {
      return json(403, { error: "Forbidden" });
    }

    const { mode, topic, keywords, tone, language } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json(500, { error: "AI gateway not configured" });

    const langText = language === "bn" ? "Write in Bengali (বাংলা)." : language === "en" ? "Write in English." : "Use a natural mix of English and Bengali (mostly English with Bengali for emphasis).";
    const systemPrompt = (SYSTEM_PROMPTS[mode] ?? SYSTEM_PROMPTS.blog) + " " + langText + ` Tone: ${tone || "professional"}.`;
    const userPrompt = `Topic: ${topic}\nKeywords: ${keywords || "(none)"}\n\nGenerate the content now.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      if (resp.status === 429) return json(429, { error: "Rate limit exceeded. Try again shortly." });
      if (resp.status === 402) return json(402, { error: "AI credits exhausted. Add credits in Lovable workspace." });
      return json(resp.status, { error: text });
    }

    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    return json(200, { text });
  } catch (e: any) {
    return json(500, { error: e.message });
  }
});
