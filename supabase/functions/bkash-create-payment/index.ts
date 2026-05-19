import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getMode(supabase: any): Promise<"sandbox" | "live"> {
  const { data } = await supabase.from("site_settings").select("value").eq("key", "bkash_pgw_mode").single();
  return (data?.value === "live" ? "live" : "sandbox");
}

function getBaseUrl(mode: string) {
  return mode === "live"
    ? "https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout"
    : "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout";
}

async function grantToken(mode: string) {
  const res = await fetch(`${getBaseUrl(mode)}/token/grant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "username": Deno.env.get("BKASH_USERNAME")!,
      "password": Deno.env.get("BKASH_PASSWORD")!,
    },
    body: JSON.stringify({
      app_key: Deno.env.get("BKASH_APP_KEY"),
      app_secret: Deno.env.get("BKASH_APP_SECRET"),
    }),
  });
  return await res.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const { amount, customer_name, customer_msisdn, email, service, note, callback_url } = body;

    if (!amount || Number(amount) <= 0) {
      return new Response(JSON.stringify({ success: false, error: "Invalid amount" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!Deno.env.get("BKASH_APP_KEY") || !Deno.env.get("BKASH_APP_SECRET") || !Deno.env.get("BKASH_USERNAME") || !Deno.env.get("BKASH_PASSWORD")) {
      return new Response(JSON.stringify({ success: false, error: "bKash credentials not configured", needs_config: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const mode = await getMode(supabase);

    const tokenData = await grantToken(mode);
    if (!tokenData.id_token) {
      return new Response(JSON.stringify({ success: false, error: "Token grant failed", details: tokenData }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const merchantInvoice = `INV-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const payerReference = customer_msisdn || customer_name || "guest";

    const createRes = await fetch(`${getBaseUrl(mode)}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": tokenData.id_token,
        "x-app-key": Deno.env.get("BKASH_APP_KEY")!,
      },
      body: JSON.stringify({
        mode: "0011",
        payerReference,
        callbackURL: callback_url,
        amount: String(Number(amount).toFixed(2)),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: merchantInvoice,
      }),
    });
    const createData = await createRes.json();

    if (!createData.paymentID) {
      return new Response(JSON.stringify({ success: false, error: createData.statusMessage || "Create payment failed", details: createData }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase.from("bkash_transactions").insert({
      payment_id: createData.paymentID,
      payer_reference: payerReference,
      customer_msisdn: customer_msisdn,
      amount: Number(amount),
      intent: "sale",
      merchant_invoice_number: merchantInvoice,
      status: "initiated",
      mode,
      payment_create_time: (() => {
        const raw = createData.paymentCreateTime;
        if (raw) {
          const d = new Date(raw);
          if (!isNaN(d.getTime())) return d.toISOString();
        }
        return new Date().toISOString();
      })(),
      user_email: email,
      customer_name,
      service,
      note,
      raw_payload: createData,
    });

    return new Response(JSON.stringify({
      success: true,
      paymentID: createData.paymentID,
      bkashURL: createData.bkashURL,
      merchantInvoice,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
