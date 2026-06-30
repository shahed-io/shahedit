// AI-assisted random winner picker for offer campaigns.
// Body: { campaign_id: string, count?: number, prompt?: string }
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const url = Deno.env.get("SUPABASE_URL")!;
const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const aiKey = Deno.env.get("LOVABLE_API_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { campaign_id, count, prompt } = await req.json();
    if (!campaign_id) {
      return new Response(JSON.stringify({ error: "campaign_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supa = createClient(url, service);
    const { data: campaign, error: cErr } = await supa.from("offer_campaigns").select("*").eq("id", campaign_id).single();
    if (cErr || !campaign) {
      return new Response(JSON.stringify({ error: "Campaign not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: subs, error: sErr } = await supa
      .from("offer_submissions")
      .select("id,name,email,phone,answers")
      .eq("campaign_id", campaign_id)
      .eq("is_disqualified", false);
    if (sErr) throw sErr;
    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ error: "কোনো এন্ট্রি নেই" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const n = Math.max(1, Math.min(count ?? campaign.winners_count ?? 1, subs.length));
    const prizes: string[] = Array.isArray(campaign.winner_prizes) ? campaign.winner_prizes : [];

    // Ask AI to pick a fair, random-feeling shortlist with short reasons.
    const list = subs.map((s, i) => ({ idx: i, id: s.id, name: s.name, email: s.email }));
    const sys = `তুমি একজন নিরপেক্ষ ও সৎ judge। প্রদত্ত entry list থেকে ${n} জন winner বেছে নাও। শুধু JSON ফেরত দাও: {"winners":[{"id":"<id>","reason":"<short Bengali reason>"}]}`;
    const userMsg = `Campaign: ${campaign.title}\nPrize: ${campaign.prize_description ?? ""}\nExtra rule: ${prompt ?? "এলোমেলোভাবে fair pick"}\nEntries: ${JSON.stringify(list)}`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${aiKey}` },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: sys }, { role: "user", content: userMsg }],
        response_format: { type: "json_object" },
      }),
    });
    let picked: { id: string; reason: string }[] = [];
    if (r.ok) {
      const data = await r.json();
      try {
        const parsed = JSON.parse(data?.choices?.[0]?.message?.content ?? "{}");
        if (Array.isArray(parsed?.winners)) picked = parsed.winners.filter((w: any) => w?.id);
      } catch { /* fall through */ }
    }
    // Fallback: random pick if AI fails or returns invalid ids
    const validIds = new Set(subs.map((s) => s.id));
    picked = picked.filter((w) => validIds.has(w.id));
    if (picked.length < n) {
      const remaining = subs.filter((s) => !picked.find((w) => w.id === s.id));
      for (let i = remaining.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
      }
      for (const s of remaining) {
        if (picked.length >= n) break;
        picked.push({ id: s.id, reason: "এলোমেলোভাবে নির্বাচিত (AI fallback)" });
      }
    }
    picked = picked.slice(0, n);

    // Clear previous winners (re-pick allowed)
    await supa.from("offer_winners").delete().eq("campaign_id", campaign_id);

    const rows = picked.map((w, i) => ({
      campaign_id,
      submission_id: w.id,
      position: i + 1,
      prize: prizes[i] ?? campaign.prize_description ?? null,
      reason: w.reason,
      selected_by: "ai",
      is_published: false,
    }));
    const { data: inserted, error: iErr } = await supa.from("offer_winners").insert(rows).select();
    if (iErr) throw iErr;

    return new Response(JSON.stringify({ winners: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message || e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
