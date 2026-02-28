import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, session_id, visitor_info } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch AI settings from DB
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: settings } = await supabase
      .from("ai_support_settings")
      .select("*")
      .eq("id", 1)
      .single();

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

    const fullSystemPrompt = `${systemPrompt}

Company contact info:
- Phone/WhatsApp: 01820-060046
- Email: info@shahedit.com
- Location: Dhaka, Bangladesh

When customer needs human support or you cannot help, say: "${humanHandoff}"

Always be concise (max 3-4 sentences per reply). Use bullet points for lists. Respond in the same language the customer uses (Bengali or English).`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

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

    // Save/update chat session async (don't await to avoid blocking stream)
    if (session_id) {
      const lastUserMsg = messages[messages.length - 1];
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
