// Shared auth helpers for edge functions.
// requireAuthUser: rejects anon calls, returns the authenticated user.
// requireAdmin: additionally verifies the user has admin/super_admin role.
import { createClient } from "npm:@supabase/supabase-js@2";

const url = Deno.env.get("SUPABASE_URL")!;
const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

export type AuthResult =
  | { ok: true; user: { id: string; email?: string }; token: string }
  | { ok: false; status: number; error: string };

export async function requireAuthUser(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "Missing Authorization header" };
  }
  const token = authHeader.replace("Bearer ", "");
  const client = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }
  // Reject anon-role JWTs (they have no user).
  return { ok: true, user: { id: data.user.id, email: data.user.email ?? undefined }, token };
}

export async function requireAdmin(req: Request): Promise<AuthResult> {
  const auth = await requireAuthUser(req);
  if (!auth.ok) return auth;
  const admin = createClient(url, service);
  const { data, error } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", auth.user.id)
    .in("role", ["admin", "super_admin"])
    .maybeSingle();
  if (error || !data) {
    return { ok: false, status: 403, error: "Admin role required" };
  }
  return auth;
}
