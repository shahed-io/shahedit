import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { chatCompletion } from "../_shared/ai-router.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, session_id, visitor_info } = await req.json();

    // API key is resolved from ai_provider_settings by chatCompletion(); LOVABLE_API_KEY is fallback.

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch settings, services, and packages in parallel for speed
    const [settingsRes, servicesRes, packagesRes] = await Promise.all([
      supabase.from("ai_support_settings").select("*").eq("id", 1).single(),
      supabase.from("services").select("title, short_description, description, features, slug").eq("is_published", true).order("sort_order"),
      supabase.from("service_packages").select("title, description, price, original_price, currency, features, badge, service_id").eq("is_published", true).order("sort_order"),
    ]);

    const settings = settingsRes.data;
    const services = servicesRes.data ?? [];
    const packages = packagesRes.data ?? [];

    if (settings && !settings.is_enabled) {
      return new Response(
        JSON.stringify({ error: "AI support is currently disabled." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = settings?.system_prompt ??
      "You are a helpful customer support assistant for Shahed IT, a professional IT agency in Bangladesh.";

    const humanHandoff = settings?.human_handoff_message ??
      "আরও সাহায্যের জন্য আমাদের WhatsApp-এ যোগাযোগ করুন: 01820-060046";

    // Build services context string
    let servicesContext = "";
    if (services.length > 0) {
      servicesContext = "\n\n## Our Services:\n";
      for (const svc of services) {
        servicesContext += `\n### ${svc.title}\n`;
        if (svc.short_description) servicesContext += `${svc.short_description}\n`;
        if (svc.features && svc.features.length > 0) {
          servicesContext += `Features: ${svc.features.join(", ")}\n`;
        }
      }
    }

    // Build packages context string
    let packagesContext = "";
    if (packages.length > 0) {
      packagesContext = "\n\n## Our Service Packages & Pricing:\n";
      for (const pkg of packages) {
        const price = pkg.price ? `${pkg.currency ?? "BDT"} ${pkg.price}` : "Contact for price";
        const originalPrice = pkg.original_price ? ` (was ${pkg.currency ?? "BDT"} ${pkg.original_price})` : "";
        packagesContext += `\n- **${pkg.title}** — ${price}${originalPrice}`;
        if (pkg.badge) packagesContext += ` [${pkg.badge}]`;
        if (pkg.description) packagesContext += `\n  ${pkg.description}`;
        if (pkg.features && pkg.features.length > 0) {
          packagesContext += `\n  Includes: ${pkg.features.slice(0, 5).join(", ")}`;
        }
      }
    }

    const fullSystemPrompt = `${systemPrompt}

Company contact info:
- Phone/WhatsApp: 01820-060046 / 01840-099853
- Email: info@shahedit.com
- Website: shahedit.com
- Location: Dhaka, Bangladesh
${servicesContext}
${packagesContext}

IMPORTANT INSTRUCTIONS:
- Answer questions about our services and packages using ONLY the information provided above.
- If asked about pricing, provide exact prices from the packages list above.
- Keep answers concise (2-4 sentences or bullet points). Be direct and fast.
- Respond in the SAME language the customer uses (Bengali or English).
- Use markdown for formatting: **bold**, bullet points, etc.
- When customer needs human support, say: "${humanHandoff}"
- Do NOT make up prices or services not listed above.`;

    const response = await chatCompletion({
      messages: [
        { role: "system", content: fullSystemPrompt },
        ...messages,
      ],
      stream: true,
      max_tokens: 512,
      modelHint: "google/gemini-2.5-flash-lite",
    }, supabase);

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    // Save chat session async
    if (session_id) {
      supabase.from("support_chats").upsert({
        session_id,
        messages,
        ...(visitor_info ?? {}),
        updated_at: new Date().toISOString(),
      }, { onConflict: "session_id" }).then(() => {});
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (e) {
    console.error("ai-support error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
