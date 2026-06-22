import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribe to Postgres changes on one or more tables and call onChange on any change.
 * Usage:
 *   useRealtimeSync(["products", "service_packages"], () => loadData());
 *
 * - Auto-throttles bursts (only one callback per 800ms).
 * - Cleans up channel on unmount.
 */
export function useRealtimeSync(
  tables: string | string[],
  onChange: () => void,
  enabled: boolean = true
) {
  const cbRef = useRef(onChange);
  cbRef.current = onChange;

  useEffect(() => {
    if (!enabled) return;
    const list = Array.isArray(tables) ? tables : [tables];
    if (!list.length) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const trigger = () => {
      if (timer) return;
      timer = setTimeout(() => {
        timer = null;
        try { cbRef.current?.(); } catch { /* ignore */ }
      }, 800);
    };

    const channelName = `rt-${list.join("-")}-${Math.random().toString(36).slice(2, 7)}`;
    let channel = supabase.channel(channelName);
    list.forEach((tbl) => {
      channel = channel.on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: tbl },
        () => trigger()
      );
    });
    channel.subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Array.isArray(tables) ? tables.join("|") : tables, enabled]);
}
