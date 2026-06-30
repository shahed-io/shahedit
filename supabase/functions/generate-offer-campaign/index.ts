// AI offer campaign generator. Body: { brief: string }
// Returns a full campaign config JSON the admin form can hydrate.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const aiKey = Deno.env.get("LOVABLE_API_KEY")!;

const SYSTEM = `তুমি একজন অভিজ্ঞ marketing campaign designer। ব্যবহারকারী একটা offer/giveaway-এর সংক্ষিপ্ত brief দিবে (বাংলা/English মিশ্র হতে পারে)। তোমার কাজ: brief বুঝে একটা সম্পূর্ণ campaign config তৈরি করো।

শুধুই JSON ফেরত দাও, এই শেপে:
{
  "title": string,
  "slug": string (lowercase, hyphen, ascii),
  "description": string (বাংলায় ২-৪ লাইন, আকর্ষণীয়),
  "prize_description": string (পুরস্কার বিস্তারিত),
  "winners_count": number (১-১০),
  "winner_prizes": string[] (winners_count সমান, প্রতি অবস্থানের পুরস্কার),
  "fields": [
    { "key": string (snake_case), "label": string (বাংলা), "type": "text"|"email"|"tel"|"textarea"|"select", "required": boolean, "options"?: string[], "placeholder"?: string }
  ],
  "thank_you_message": string (বাংলা),
  "meta_title": string,
  "meta_description": string,
  "duration_days": number (suggested, ৩-৩০),
  "max_entries": number | null
}

নিয়ম:
- fields-এ সবসময় name/email/phone অন্তত রাখো (brief এ অন্য কিছু চাইলে যোগ/বাদ দাও)
- brief যদি specific field চায় (যেমন "ঠিকানা", "ফেসবুক লিঙ্ক", "কেন জিততে চান") সেগুলো যোগ করো
- winners_count আর winner_prizes মিলতে হবে
- কোনো ব্যাখ্যা না, শুধু valid JSON।`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { brief } = await req.json();
    if (!brief || typeof brief !== "string" || brief.trim().length < 5) {
      return new Response(JSON.stringify({ error: "brief অন্তত কয়েক শব্দের হতে হবে" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${aiKey}` },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: brief },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      if (r.status === 429) return new Response(JSON.stringify({ error: "AI rate limit, কিছুক্ষণ পর চেষ্টা করুন" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (r.status === 402) return new Response(JSON.stringify({ error: "AI credit শেষ, workspace-এ credit যোগ করুন" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: `AI error: ${text}` }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await r.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    let cfg: any = {};
    try { cfg = JSON.parse(raw); } catch {
      return new Response(JSON.stringify({ error: "AI invalid JSON ফেরত দিয়েছে", raw }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Normalize / safe defaults
    const slug = String(cfg.slug || cfg.title || "offer").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
    const winners_count = Math.max(1, Math.min(10, Number(cfg.winners_count) || 1));
    const winner_prizes = Array.isArray(cfg.winner_prizes) ? cfg.winner_prizes.slice(0, winners_count) : [];
    while (winner_prizes.length < winners_count) winner_prizes.push(cfg.prize_description || "");
    const fields = Array.isArray(cfg.fields) && cfg.fields.length ? cfg.fields : [
      { key: "name", label: "নাম", type: "text", required: true },
      { key: "email", label: "ইমেইল", type: "email", required: true },
      { key: "phone", label: "মোবাইল", type: "tel", required: true },
    ];
    const days = Math.max(1, Math.min(60, Number(cfg.duration_days) || 7));
    const starts_at = new Date();
    const ends_at = new Date(Date.now() + days * 86400000);

    return new Response(JSON.stringify({
      title: String(cfg.title || "নতুন অফার"),
      slug,
      description: String(cfg.description || ""),
      prize_description: String(cfg.prize_description || ""),
      winners_count,
      winner_prizes,
      fields,
      thank_you_message: String(cfg.thank_you_message || "ধন্যবাদ! আপনার এন্ট্রি গৃহীত হয়েছে।"),
      meta_title: String(cfg.meta_title || cfg.title || ""),
      meta_description: String(cfg.meta_description || cfg.description || "").slice(0, 160),
      starts_at: starts_at.toISOString().slice(0, 16),
      ends_at: ends_at.toISOString().slice(0, 16),
      max_entries: cfg.max_entries ? Number(cfg.max_entries) : null,
      status: "draft",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message || e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
