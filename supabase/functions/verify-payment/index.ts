import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { transaction_id, payment_method } = await req.json();

    if (!transaction_id) {
      return new Response(JSON.stringify({ success: false, error: "Transaction ID required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const BKASH_APP_KEY = Deno.env.get("BKASH_APP_KEY");
    const BKASH_APP_SECRET = Deno.env.get("BKASH_APP_SECRET");
    const BKASH_USERNAME = Deno.env.get("BKASH_USERNAME");
    const BKASH_PASSWORD = Deno.env.get("BKASH_PASSWORD");
    const NAGAD_MERCHANT_ID = Deno.env.get("NAGAD_MERCHANT_ID");
    const NAGAD_API_KEY = Deno.env.get("NAGAD_API_KEY");

    const method = (payment_method || "").toLowerCase();
    let verified = false;
    let verifyMessage = "";

    if (method.includes("বিকাশ") || method.includes("bkash")) {
      if (!BKASH_APP_KEY || !BKASH_APP_SECRET || !BKASH_USERNAME || !BKASH_PASSWORD) {
        return new Response(JSON.stringify({
          success: false,
          error: "bKash API credentials কনফিগার করা নেই। Admin Settings → bKash API-তে যোগ করুন।",
          needs_config: true
        }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      try {
        // Step 1: Get bKash token (production endpoint)
        const tokenRes = await fetch("https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "username": BKASH_USERNAME,
            "password": BKASH_PASSWORD,
          },
          body: JSON.stringify({ app_key: BKASH_APP_KEY, app_secret: BKASH_APP_SECRET }),
        });
        const tokenData = await tokenRes.json();

        if (!tokenData.id_token) {
          verifyMessage = `bKash token তৈরি ব্যর্থ: ${tokenData.statusMessage || "অজানা ত্রুটি"}`;
        } else {
          // Step 2: Query transaction (production endpoint)
          const queryRes = await fetch(`https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/general/searchTransaction?trxID=${transaction_id}`, {
            method: "GET",
            headers: {
              "Authorization": tokenData.id_token,
              "x-app-key": BKASH_APP_KEY,
            },
          });
          const queryData = await queryRes.json();

          if (queryData.transactionStatus === "Completed") {
            verified = true;
            verifyMessage = `✅ bKash লেনদেন সফল — পরিমাণ: ৳${queryData.amount} | TrxID: ${queryData.trxID}`;
          } else {
            verifyMessage = `bKash লেনদেন স্ট্যাটাস: ${queryData.transactionStatus || queryData.statusMessage || "পাওয়া যায়নি"}`;
          }
        }
      } catch (e) {
        verifyMessage = `bKash API সংযোগে সমস্যা: ${String(e)}`;
      }

    } else if (method.includes("নগদ") || method.includes("nagad")) {
      if (!NAGAD_MERCHANT_ID || !NAGAD_API_KEY) {
        return new Response(JSON.stringify({
          success: false,
          error: "Nagad API credentials কনফিগার করা নেই।",
          needs_config: true
        }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      try {
        const nagadRes = await fetch(`https://api.nagad.com.bd/api/dfs/check/transaction/${transaction_id}`, {
          method: "GET",
          headers: {
            "X-KM-Api-Version": "v-0.2.0",
            "X-KM-IP-V4": "127.0.0.1",
            "X-KM-Client-Type": "PC_WEB",
            "X-KM-Api-Key": NAGAD_API_KEY,
          },
        });
        const nagadData = await nagadRes.json();

        if (nagadData.status === "Success") {
          verified = true;
          verifyMessage = `✅ নগদ লেনদেন সফল — পরিমাণ: ৳${nagadData.amount}`;
        } else {
          verifyMessage = `নগদ লেনদেন পাওয়া যায়নি`;
        }
      } catch (e) {
        verifyMessage = `Nagad API সংযোগে সমস্যা: ${String(e)}`;
      }

    } else {
      verifyMessage = "এই পেমেন্ট মেথডের জন্য ম্যানুয়াল ভেরিফিকেশন প্রয়োজন";
    }

    // Update DB
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (verified) {
      await supabase
        .from("payment_submissions")
        .update({ status: "confirmed", note: verifyMessage })
        .eq("transaction_id", transaction_id);
    }

    return new Response(JSON.stringify({ success: true, verified, message: verifyMessage }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
