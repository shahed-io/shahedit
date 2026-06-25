// Edge function: generate signed URL for user's digital download, enforcing limit + expiry.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return j({ error: "unauthorized" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: u } = await userClient.auth.getUser();
    if (!u?.user) return j({ error: "unauthorized" }, 401);

    const { download_id } = await req.json();
    if (!download_id || typeof download_id !== "string") return j({ error: "download_id required" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE);
    const { data: d, error } = await admin
      .from("digital_downloads")
      .select("*, file:digital_files(storage_path,file_name)")
      .eq("id", download_id)
      .maybeSingle();
    if (error || !d) return j({ error: "not_found" }, 404);
    if (d.user_id !== u.user.id) return j({ error: "forbidden" }, 403);
    if (d.expires_at && new Date(d.expires_at) < new Date()) return j({ error: "expired" }, 410);
    if (d.download_count >= d.download_limit) return j({ error: "limit_reached" }, 429);
    if (!d.file?.storage_path) return j({ error: "file_missing" }, 404);

    const { data: signed, error: sErr } = await admin.storage
      .from("digital-products")
      .createSignedUrl(d.file.storage_path, 60 * 10); // 10 min
    if (sErr || !signed) return j({ error: "sign_failed" }, 500);

    await admin
      .from("digital_downloads")
      .update({ download_count: (d.download_count ?? 0) + 1, last_downloaded_at: new Date().toISOString() })
      .eq("id", d.id);

    return j({ url: signed.signedUrl, file_name: d.file.file_name });
  } catch (e) {
    return j({ error: String(e?.message ?? e) }, 500);
  }
});

function j(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
