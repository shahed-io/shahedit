// Shared AI router — resolves the currently active AI provider from the DB
// (`ai_active_provider` + `ai_provider_settings`) and dispatches OpenAI-compatible
// chat completion requests. Falls back to Lovable AI Gateway if no admin key set.

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

type Provider = "lovable" | "gemini" | "openai" | "anthropic" | "xai";

interface ProviderConfig {
  provider: Provider;
  apiKey: string;
  model: string;
  url: string;
  authHeader: Record<string, string>;
}

const DEFAULTS: Record<Provider, { url: string; model: string }> = {
  lovable:   { url: "https://ai.gateway.lovable.dev/v1/chat/completions",                   model: "google/gemini-2.5-flash-lite" },
  gemini:    { url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", model: "gemini-2.0-flash" },
  openai:    { url: "https://api.openai.com/v1/chat/completions",                            model: "gpt-4o-mini" },
  anthropic: { url: "https://api.anthropic.com/v1/chat/completions",                         model: "claude-3-5-haiku-20241022" },
  xai:       { url: "https://api.x.ai/v1/chat/completions",                                  model: "grok-2-latest" },
};

export function getSharedSupabase(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

export async function getAiConfig(supabase?: SupabaseClient): Promise<ProviderConfig> {
  const sb = supabase ?? getSharedSupabase();
  let provider: Provider = "lovable";
  let apiKey = "";
  let model = "";

  try {
    const { data: active } = await sb.from("ai_active_provider").select("provider").eq("id", 1).maybeSingle();
    if (active?.provider) provider = active.provider as Provider;

    const { data: cfg } = await sb.from("ai_provider_settings").select("api_key, model").eq("provider", provider).maybeSingle();
    apiKey = (cfg?.api_key ?? "").trim();
    model = (cfg?.model ?? "").trim();
  } catch (_) { /* ignore, fall through to Lovable */ }

  // Fallback: Lovable gateway with LOVABLE_API_KEY
  if (!apiKey) {
    provider = "lovable";
    apiKey = Deno.env.get("LOVABLE_API_KEY") ?? "";
    if (!apiKey) throw new Error("No AI API key configured. Set one in Admin → AI Providers.");
    model = model || DEFAULTS.lovable.model;
  } else {
    model = model || DEFAULTS[provider].model;
  }

  const def = DEFAULTS[provider];
  return {
    provider,
    apiKey,
    model,
    url: def.url,
    authHeader: { Authorization: `Bearer ${apiKey}` },
  };
}

/**
 * OpenAI-compatible chat completion. Returns raw response JSON in OpenAI shape.
 * `modelHint` — legacy hardcoded model string (e.g. "google/gemini-2.5-flash");
 * used only when the active provider is Lovable. Other providers use their own default/override.
 */
export async function chatCompletion(
  opts: {
    messages: Array<{ role: string; content: unknown }>;
    temperature?: number;
    max_tokens?: number;
    response_format?: unknown;
    stream?: boolean;
    modelHint?: string;
  },
  supabase?: SupabaseClient,
): Promise<Response> {
  const cfg = await getAiConfig(supabase);
  const model = cfg.provider === "lovable" && opts.modelHint ? opts.modelHint : cfg.model;

  const body: Record<string, unknown> = {
    model,
    messages: opts.messages,
  };
  if (opts.temperature !== undefined) body.temperature = opts.temperature;
  if (opts.max_tokens !== undefined) body.max_tokens = opts.max_tokens;
  if (opts.response_format !== undefined) body.response_format = opts.response_format;
  if (opts.stream) body.stream = true;

  return await fetch(cfg.url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...cfg.authHeader },
    body: JSON.stringify(body),
  });
}

export type { Provider, ProviderConfig };
