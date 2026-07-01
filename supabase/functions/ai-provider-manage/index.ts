// Admin-only management endpoint for AI provider keys and active provider.
// Actions: list, set_key, set_active, test.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { chatCompletion } from "../_shared/ai-router.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PROVIDERS = ["lovable", "gemini", "openai", "anthropic", "xai"] as const;

const mask = (k: string | null | undefined) => {
  if (!k) return null;
  const s = String(k);
  if (s.length <= 8) return "••••";
  return s.slice(0, 4) + "••••" + s.slice(-4);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return json({ error: "Unauthorized" }, 401);

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: userData } = await sb.auth.getUser(token);
    const user = userData?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { data: isAdmin } = await sb.rpc("is_admin", { _user_id: user.id });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "list");

    if (action === "list") {
      const [{ data: settings }, { data: active }] = await Promise.all([
        sb.from("ai_provider_settings").select("provider, api_key, model, updated_at"),
        sb.from("ai_active_provider").select("provider").eq("id", 1).maybeSingle(),
      ]);
      const items = PROVIDERS.map((p) => {
        const row = settings?.find((s: any) => s.provider === p);
        return {
          provider: p,
          has_key: !!row?.api_key,
          key_masked: mask(row?.api_key),
          model: row?.model ?? null,
          updated_at: row?.updated_at ?? null,
        };
      });
      return json({ items, active: active?.provider ?? "lovable" });
    }

    if (action === "set_key") {
      const provider = String(body.provider ?? "");
      if (!PROVIDERS.includes(provider as any)) return json({ error: "Invalid provider" }, 400);
      const api_key = body.api_key === null || body.api_key === "" ? null : String(body.api_key ?? "").trim();
      const model = body.model ? String(body.model).trim() : null;
      const patch: Record<string, unknown> = { provider, updated_at: new Date().toISOString(), updated_by: user.id };
      if (api_key !== undefined) patch.api_key = api_key;
      if (model !== null) patch.model = model || null;
      const { error } = await sb.from("ai_provider_settings").upsert(patch, { onConflict: "provider" });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    if (action === "set_active") {
      const provider = String(body.provider ?? "");
      if (!PROVIDERS.includes(provider as any)) return json({ error: "Invalid provider" }, 400);
      const { error } = await sb.from("ai_active_provider").upsert(
        { id: 1, provider, updated_at: new Date().toISOString() },
        { onConflict: "id" },
      );
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    if (action === "test") {
      // Optionally test a specific provider without changing active
      const provider = body.provider ? String(body.provider) : null;
      let originalActive: string | null = null;
      if (provider) {
        const { data: cur } = await sb.from("ai_active_provider").select("provider").eq("id", 1).maybeSingle();
        originalActive = cur?.provider ?? "lovable";
        await sb.from("ai_active_provider").upsert({ id: 1, provider }, { onConflict: "id" });
      }
      try {
        const r = await chatCompletion({
          messages: [{ role: "user", content: "Reply with the single word: OK" }],
          max_tokens: 10,
          modelHint: "google/gemini-2.5-flash-lite",
        }, sb);
        const txt = await r.text();
        return json({ ok: r.ok, status: r.status, sample: txt.slice(0, 400) });
      } finally {
        if (provider && originalActive) {
          await sb.from("ai_active_provider").upsert({ id: 1, provider: originalActive }, { onConflict: "id" });
        }
      }
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
