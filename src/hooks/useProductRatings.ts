import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RatingStat {
  average: number;
  count: number;
}

const EMPTY: RatingStat = { average: 0, count: 0 };

/** Fetch rating stats for a single package id. */
export function useProductRating(packageId: string | undefined) {
  const [stat, setStat] = useState<RatingStat>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!packageId) {
      setStat(EMPTY);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("product_review_stats" as any)
      .select("average_rating, review_count")
      .eq("package_id", packageId)
      .maybeSingle()
      .then(({ data }) => {
        const row = data as unknown as
          | { average_rating: number | null; review_count: number | null }
          | null;
        setStat({
          average: Number(row?.average_rating ?? 0),
          count: Number(row?.review_count ?? 0),
        });
        setLoading(false);
      });
  }, [packageId, reloadKey]);

  return { stat, loading, refresh: () => setReloadKey((k) => k + 1) };
}

/** Fetch rating stats for many package ids at once. */
export function useProductRatings(packageIds: string[]) {
  const [map, setMap] = useState<Record<string, RatingStat>>({});
  const key = packageIds.slice().sort().join(",");

  useEffect(() => {
    if (packageIds.length === 0) {
      setMap({});
      return;
    }
    supabase
      .from("product_review_stats" as any)
      .select("package_id, average_rating, review_count")
      .in("package_id", packageIds)
      .then(({ data }) => {
        const next: Record<string, RatingStat> = {};
        (data as unknown as any[] | null)?.forEach((r) => {
          next[r.package_id] = {
            average: Number(r.average_rating ?? 0),
            count: Number(r.review_count ?? 0),
          };
        });
        setMap(next);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return map;
}
