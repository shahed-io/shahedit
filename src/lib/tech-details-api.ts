import { supabase } from "@/integrations/supabase/client";
import {
  techDetails as staticTechDetails,
  techSlugMap as staticSlugMap,
  type TechDetail,
} from "@/data/techDetails";

export type TechRow = {
  id: string;
  slug: string;
  name: string;
  category: TechDetail["category"];
  tagline: string;
  color: string;
  symbol: string;
  what_is_it: string;
  history: string;
  pros: string[];
  cons: string[];
  best_for: string[];
  sort_order: number;
  is_published: boolean;
};

const FALLBACK_META: Record<string, { color: string; symbol: string }> = {
  React: { color: "#61DAFB", symbol: "⚛" },
  "Next.js": { color: "#a0aec0", symbol: "N" },
  "Node.js": { color: "#68D391", symbol: "⬡" },
  TypeScript: { color: "#63B3ED", symbol: "TS" },
  WordPress: { color: "#63AEDE", symbol: "W" },
  PHP: { color: "#A78BFA", symbol: "<?>" },
  Laravel: { color: "#FC8181", symbol: "L" },
  MongoDB: { color: "#68D391", symbol: "M" },
  MySQL: { color: "#63B3ED", symbol: "⊏" },
  Figma: { color: "#F6AD55", symbol: "▣" },
  Flutter: { color: "#63B3ED", symbol: "◇" },
  Python: { color: "#F6E05E", symbol: "🐍" },
};

const nameToSlug = Object.fromEntries(
  Object.entries(staticSlugMap).map(([s, n]) => [n, s])
);

export const fallbackRows: TechRow[] = Object.values(staticTechDetails).map(
  (d, i) => {
    const m = FALLBACK_META[d.name] ?? { color: "#a78bfa", symbol: "•" };
    return {
      id: `static-${i}`,
      slug: nameToSlug[d.name] ?? d.name.toLowerCase(),
      name: d.name,
      category: d.category,
      tagline: d.tagline,
      color: m.color,
      symbol: m.symbol,
      what_is_it: d.whatIsIt,
      history: d.history,
      pros: d.pros,
      cons: d.cons,
      best_for: d.bestFor,
      sort_order: i,
      is_published: true,
    };
  }
);

export async function fetchPublishedTechs(): Promise<TechRow[]> {
  const { data } = await supabase
    .from("tech_details" as any)
    .select("*")
    .eq("is_published", true)
    .order("sort_order");
  if (data && data.length > 0) return data as unknown as TechRow[];
  return fallbackRows;
}

export async function fetchAllTechs(): Promise<TechRow[]> {
  const { data } = await supabase
    .from("tech_details" as any)
    .select("*")
    .order("sort_order");
  if (data && data.length > 0) return data as unknown as TechRow[];
  return fallbackRows;
}

export async function fetchTechBySlug(slug: string): Promise<TechRow | null> {
  const { data } = await supabase
    .from("tech_details" as any)
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (data) return data as unknown as TechRow;
  return fallbackRows.find((r) => r.slug === slug) ?? null;
}
