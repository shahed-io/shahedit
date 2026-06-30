import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json(401, { error: "Unauthorized" });
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await admin.auth.getUser(token);
    if (authErr || !user) return json(401, { error: "Unauthorized" });
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", user.id);
    const allowed = new Set(["admin", "super_admin", "editor"]);
    if (!roles?.some((r: any) => allowed.has(r.role))) return json(403, { error: "Forbidden" });

    const { prompt, language = "bn", tone = "formal", category = "general", recipient_name = "", reference = "" } = await req.json();
    if (!prompt || !prompt.trim()) return json(400, { error: "Prompt required" });

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json(500, { error: "AI gateway not configured" });

    const lang = language === "en" ? "English" : language === "mixed" ? "Bengali with English technical terms" : "Bengali (বাংলা)";
    const system = `You are an official notice writer for Shahed IT (Rajshahi, Bangladesh). Generate a clear, professional ${tone} notice in ${lang}.

OUTPUT STRICT JSON ONLY (no markdown, no code fences) with this exact shape:
{
  "title": "Short notice title (max 80 chars)",
  "subject": "One-line subject line",
  "body": "Full notice body as plain text with proper paragraphs separated by \\n\\n. Include salutation, main content, action items, and closing. Do NOT include date/notice number/signature block — those are added by the template."
}

Category: ${category}. ${recipient_name ? `Recipient: ${recipient_name}.` : ""} ${reference ? `Reference: ${reference}.` : ""}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      if (resp.status === 429) return json(429, { error: "Rate limit exceeded. Try again shortly." });
      if (resp.status === 402) return json(402, { error: "AI credits exhausted." });
      return json(resp.status, { error: text });
    }

    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(raw); } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) { try { parsed = JSON.parse(m[0]); } catch {} }
    }
    return json(200, {
      title: parsed.title ?? "",
      subject: parsed.subject ?? "",
      body: parsed.body ?? raw,
    });
  } catch (e: any) {
    return json(500, { error: e.message });
  }
});
