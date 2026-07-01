// AI Admin Tools — Lovable AI Gateway powered helpers
// Actions: product_description | seo_meta | support_reply | email_writer
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { chatCompletion } from "../_shared/ai-router.ts";
import { requireAdmin } from "../_shared/require-admin.ts";

const PROMPTS: Record<string, string> = {
  product_description:
    "তুমি একজন প্রফেশনাল প্রোডাক্ট কপিরাইটার। ইনপুট থেকে আকর্ষণীয়, SEO-friendly Bengali প্রোডাক্ট description তৈরি করো (markdown, heading, bullet, CTA সহ)। ৩০০-৫০০ শব্দ।",
  seo_meta:
    "তুমি একজন SEO expert। ইনপুট থেকে JSON ফেরত দাও: {\"title\": (60 char max), \"description\": (155 char max), \"keywords\": [..], \"og_title\": .., \"og_description\": ..}। শুধু JSON, কোনো ব্যাখ্যা নয়।",
  support_reply:
    "তুমি একজন polite Bangladeshi customer support agent। গ্রাহকের message-এর জন্য সংক্ষিপ্ত, সহানুভূতিশীল Bengali reply লেখো। প্রয়োজনে next step suggest করো।",
  email_writer:
    "তুমি একজন email copywriter। brief থেকে professional Bengali email তৈরি করো। JSON ফেরত: {\"subject\": .., \"html\": .. (inline-styled, clean)}। শুধু JSON।",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { action, input, model } = await req.json();
    const system = PROMPTS[action];
    if (!system) return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!input || typeof input !== "string") return new Response(JSON.stringify({ error: "input required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const res = await chatCompletion({
      messages: [
        { role: "system", content: system },
        { role: "user", content: input },
      ],
      modelHint: model || "google/gemini-2.5-flash-lite",
    });
    if (res.status === 429) return new Response(JSON.stringify({ error: "rate_limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (res.status === 402) return new Response(JSON.stringify({ error: "credits_exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!res.ok) return new Response(JSON.stringify({ error: "ai_error", detail: await res.text() }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ text }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message || e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
