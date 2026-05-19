import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface WalletSettings {
  enabled: boolean;
  method: string;           // 'bkash_online' for now (only supported)
  min: number;
  max: number;
  quickAmounts: number[];
  note: string;
}

const DEFAULTS: WalletSettings = {
  enabled: true,
  method: "bkash_online",
  min: 100,
  max: 100000,
  quickAmounts: [500, 1000, 2000, 5000],
  note: "সফল পেমেন্টের পর আপনার ওয়ালেটে টাকা যোগ হবে।",
};

const KEYS = [
  "wallet_topup_enabled",
  "wallet_topup_method",
  "wallet_topup_min",
  "wallet_topup_max",
  "wallet_topup_quick_amounts",
  "wallet_topup_note",
];

export const useWalletSettings = () => {
  const [settings, setSettings] = useState<WalletSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key,value")
        .in("key", KEYS);
      if (cancelled) return;
      if (data) {
        const map = Object.fromEntries(data.map((r: any) => [r.key, r.value]));
        setSettings({
          enabled: (map.wallet_topup_enabled ?? "true") === "true",
          method: map.wallet_topup_method ?? "bkash_online",
          min: Number(map.wallet_topup_min ?? 100),
          max: Number(map.wallet_topup_max ?? 100000),
          quickAmounts: String(map.wallet_topup_quick_amounts ?? "500,1000,2000,5000")
            .split(",").map((s: string) => Number(s.trim())).filter(n => !isNaN(n) && n > 0),
          note: map.wallet_topup_note ?? DEFAULTS.note,
        });
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return { settings, loading };
};
