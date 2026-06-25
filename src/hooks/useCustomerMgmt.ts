import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type CustomerRow = {
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  total_spent: number;
  order_count: number;
  wallet_balance: number;
  reward_points: number;
  is_blocked: boolean;
  last_login_at: string | null;
};

export function useCustomers() {
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    // Profiles + email via auth admin not available; use profiles with embedded email column if exists
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url, phone, email, created_at")
      .order("created_at", { ascending: false })
      .limit(500);

    const ids = (profiles ?? []).map((p: any) => p.user_id);
    if (!ids.length) { setRows([]); setLoading(false); return; }

    const [ordersRes, walletsRes, pointsRes, statusRes, loginsRes] = await Promise.all([
      supabase.from("orders").select("user_id, amount, status").in("user_id", ids),
      supabase.from("wallets").select("user_id, balance").in("user_id", ids),
      supabase.from("customer_reward_points").select("user_id, points").in("user_id", ids),
      supabase.from("customer_status").select("user_id, is_blocked").in("user_id", ids),
      supabase.from("customer_login_history").select("user_id, logged_in_at").in("user_id", ids).order("logged_in_at", { ascending: false }).limit(1000),
    ]);

    const sums: Record<string, { total: number; count: number }> = {};
    (ordersRes.data ?? []).forEach((o: any) => {
      if (!o.user_id) return;
      sums[o.user_id] = sums[o.user_id] || { total: 0, count: 0 };
      sums[o.user_id].count += 1;
      if (o.status === "in_progress" || o.status === "completed" || o.status === "delivered")
        sums[o.user_id].total += Number(o.amount || 0);
    });
    const wmap = Object.fromEntries((walletsRes.data ?? []).map((w: any) => [w.user_id, Number(w.balance || 0)]));
    const pmap = Object.fromEntries((pointsRes.data ?? []).map((p: any) => [p.user_id, Number(p.points || 0)]));
    const bmap = Object.fromEntries((statusRes.data ?? []).map((s: any) => [s.user_id, !!s.is_blocked]));
    const lmap: Record<string, string> = {};
    (loginsRes.data ?? []).forEach((l: any) => { if (!lmap[l.user_id]) lmap[l.user_id] = l.logged_in_at; });

    setRows((profiles ?? []).map((p: any) => ({
      user_id: p.user_id,
      email: p.email ?? "",
      full_name: p.full_name,
      avatar_url: p.avatar_url,
      phone: p.phone,
      created_at: p.created_at,
      total_spent: sums[p.user_id]?.total || 0,
      order_count: sums[p.user_id]?.count || 0,
      wallet_balance: wmap[p.user_id] || 0,
      reward_points: pmap[p.user_id] || 0,
      is_blocked: bmap[p.user_id] || false,
      last_login_at: lmap[p.user_id] || null,
    })));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  return { rows, loading, reload: load };
}

// Track current device & login on sign-in
export async function trackLoginAndDevice(userId: string) {
  try {
    const ua = navigator.userAgent;
    const screen = `${window.screen.width}x${window.screen.height}`;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const fpRaw = `${ua}|${screen}|${tz}`;
    let hash = 0;
    for (let i = 0; i < fpRaw.length; i++) hash = ((hash << 5) - hash) + fpRaw.charCodeAt(i) | 0;
    const fingerprint = "fp_" + Math.abs(hash).toString(36);

    const browser =
      /Edg\//.test(ua) ? "Edge" :
      /Chrome\//.test(ua) ? "Chrome" :
      /Firefox\//.test(ua) ? "Firefox" :
      /Safari\//.test(ua) ? "Safari" : "Unknown";
    const os =
      /Windows/.test(ua) ? "Windows" :
      /Mac OS X|Macintosh/.test(ua) ? "macOS" :
      /Android/.test(ua) ? "Android" :
      /iPhone|iPad|iOS/.test(ua) ? "iOS" :
      /Linux/.test(ua) ? "Linux" : "Unknown";
    const device = /Mobi|Android|iPhone/.test(ua) ? "Mobile" : "Desktop";

    await supabase.from("customer_login_history").insert({
      user_id: userId, user_agent: ua, browser, os, device,
    } as never);

    const { data: existing } = await supabase
      .from("customer_devices")
      .select("id")
      .eq("user_id", userId)
      .eq("device_fingerprint", fingerprint)
      .maybeSingle();
    if (existing?.id) {
      await supabase.from("customer_devices").update({
        last_seen_at: new Date().toISOString(), is_active: true,
      } as never).eq("id", existing.id);
    } else {
      await supabase.from("customer_devices").insert({
        user_id: userId, device_fingerprint: fingerprint,
        device_name: `${browser} on ${os}`, browser, os,
      } as never);
    }
  } catch (e) {
    console.warn("trackLoginAndDevice failed", e);
  }
}
