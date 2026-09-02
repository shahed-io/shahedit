import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { chatCompletion } from "../_shared/ai-router.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const MODES: Record<string, string> = {
  items: `You are an invoicing assistant for an IT agency in Bangladesh (currency BDT ৳).
From the user's brief, produce invoice line items with realistic Bangladeshi market pricing.
Return STRICT JSON only, no markdown fences:
{"items":[{"description":"string","quantity":number,"unit_price":number}],"notes":"string","terms":"string","tax_rate":number,"suggested_total_note":"string"}`,
  notes: `You write short, polite invoice notes for clients. Return STRICT JSON only: {"notes":"string"}`,
  terms: `You write clear invoice payment terms & conditions (3-5 short lines). Return STRICT JSON only: {"terms":"string"}`,
  reminder: `You write a short, polite payment reminder email body (plain text, max 120 words). Return STRICT JSON only: {"message":"string"}`,
  summary: `You summarize an invoice for internal records in 2 sentences. Return STRICT JSON only: {"summary":"string"}`,
};

function parseJson(text: string) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json(401, { error: "Unauthorized" });
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await admin.auth.getUser(token);
    if (authErr || !user) return json(401, { error: "Unauthorized" });
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", user.id);
    if (!roles?.some((r: any) => r.role === "admin" || r.role === "super_admin")) {
      return json(403, { error: "Forbidden" });
    }

    const body = await req.json().catch(() => ({}));
    const mode = typeof body?.mode === "string" ? body.mode : "items";
    const prompt = typeof body?.prompt === "string" ? body.prompt.slice(0, 4000) : "";
    const language = body?.language === "bn" ? "bn" : body?.language === "mix" ? "mix" : "en";
    const context = body?.context ? JSON.stringify(body.context).slice(0, 4000) : "";
    if (!MODES[mode]) return json(400, { error: "Invalid mode" });
    if (!prompt && !context) return json(400, { error: "prompt or context required" });

    const langText = language === "bn"
      ? "Write all human-readable text in Bengali (বাংলা)."
      : language === "mix"
      ? "Write in a natural mix of English and Bengali."
      : "Write all human-readable text in English.";

    const resp = await chatCompletion({
      messages: [
        { role: "system", content: `${MODES[mode]} ${langText} Never invent client personal data.` },
        { role: "user", content: `Brief: ${prompt || "(none)"}\n\nInvoice context: ${context || "(none)"}` },
      ],
      modelHint: "google/gemini-2.5-flash",
    }, admin);

    if (!resp.ok) {
      const text = await resp.text();
      if (resp.status === 429) return json(429, { error: "Rate limit exceeded. Try again shortly." });
      if (resp.status === 402) return json(402, { error: "AI credits exhausted." });
      return json(resp.status, { error: text });
    }

    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    const parsed = parseJson(text);
    return json(200, { result: parsed, raw: text });
  } catch (e: any) {
    return json(500, { error: e.message });
  }
});
