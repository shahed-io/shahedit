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
    const { data, error } = await (supabase as any).rpc("admin_list_customers");
    if (error) {
      console.error("admin_list_customers failed", error);
      setRows([]); setLoading(false); return;
    }
    setRows((data || []).map((r: any) => ({
      ...r,
      total_spent: Number(r.total_spent || 0),
      wallet_balance: Number(r.wallet_balance || 0),
      reward_points: Number(r.reward_points || 0),
      order_count: Number(r.order_count || 0),
    })));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  return { rows, loading, reload: load };
}

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

    await (supabase as any).from("customer_login_history").insert({
      user_id: userId, user_agent: ua, browser, os, device,
    });

    const { data: existing } = await (supabase as any)
      .from("customer_devices").select("id")
      .eq("user_id", userId).eq("device_fingerprint", fingerprint).maybeSingle();
    if (existing?.id) {
      await (supabase as any).from("customer_devices").update({
        last_seen_at: new Date().toISOString(), is_active: true,
      }).eq("id", existing.id);
    } else {
      await (supabase as any).from("customer_devices").insert({
        user_id: userId, device_fingerprint: fingerprint,
        device_name: `${browser} on ${os}`, browser, os,
      });
    }
  } catch (e) {
    console.warn("trackLoginAndDevice failed", e);
  }
}

export async function checkBlocked(userId: string): Promise<boolean> {
  const { data } = await (supabase as any)
    .from("customer_status").select("is_blocked").eq("user_id", userId).maybeSingle();
  return !!data?.is_blocked;
}
