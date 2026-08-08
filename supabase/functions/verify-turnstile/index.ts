import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const body = await req.json().catch(() => ({}));
    const token = typeof body?.token === "string" ? body.token : "";
    if (!token || token.length > 4096) {
      return json({ success: false, error: "Missing captcha token" }, 400);
    }

    const secret = Deno.env.get("TURNSTILE_SECRET_KEY");
    if (!secret) {
      // Not configured yet — fail closed with a clear message.
      return json({ success: false, error: "Captcha not configured" }, 500);
    }

    const form = new FormData();
    form.append("secret", secret);
    form.append("response", token);
    const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0];
    if (ip) form.append("remoteip", ip.trim());

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    });
    const data = await res.json();

    if (!data.success) {
      return json({ success: false, error: "Captcha verification failed", codes: data["error-codes"] }, 400);
    }

    return json({ success: true });
  } catch (_e) {
    return json({ success: false, error: "Verification error" }, 500);
  }
});
