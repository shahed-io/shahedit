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
    const { paymentID } = await req.json();
    if (!paymentID) {
      return new Response(JSON.stringify({ success: false, error: "paymentID required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const mode = await getMode(supabase);

    const tokenData = await grantToken(mode);
    if (!tokenData.id_token) {
      return new Response(JSON.stringify({ success: false, error: "Token grant failed" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const execRes = await fetch(`${getBaseUrl(mode)}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": tokenData.id_token,
        "x-app-key": Deno.env.get("BKASH_APP_KEY")!,
      },
      body: JSON.stringify({ paymentID }),
    });
    const execData = await execRes.json();

    const status = execData.transactionStatus === "Completed" ? "completed" : (execData.statusCode === "0000" ? "completed" : "failed");

    const update: any = {
      status,
      trx_id: execData.trxID || null,
      customer_msisdn: execData.customerMsisdn || null,
      payment_execute_time: execData.paymentExecuteTime ? new Date(execData.paymentExecuteTime).toISOString() : new Date().toISOString(),
      raw_payload: execData,
    };
    await supabase.from("bkash_transactions").update(update).eq("payment_id", paymentID);

    // Mirror to payment_submissions for unified admin view
    if (status === "completed") {
      const { data: txn } = await supabase.from("bkash_transactions").select("*").eq("payment_id", paymentID).single();
      if (txn) {
        await supabase.from("payment_submissions").insert({
          name: txn.customer_name || "bKash Customer",
          phone: txn.customer_msisdn || txn.payer_reference || "",
          email: txn.user_email,
          service: txn.service,
          amount: txn.amount,
          payment_method: `বিকাশ PGW (${txn.mode})`,
          transaction_id: execData.trxID || paymentID,
          note: `bKash PGW • Invoice: ${txn.merchant_invoice_number}`,
          status: "confirmed",
        });
      }
    }

    return new Response(JSON.stringify({ success: true, status, data: execData }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
