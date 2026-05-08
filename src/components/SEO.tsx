import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface SeoOverride {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
  schema?: object | object[];
  keywords?: string;
  canonical?: string;
}

interface SeoRow {
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  canonical_url?: string | null;
  robots?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  twitter_card?: string | null;
  twitter_title?: string | null;
  twitter_description?: string | null;
  twitter_image?: string | null;
  schema_json?: any;
}

interface GlobalSeo {
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string;
  defaultOgImage: string;
  twitterHandle: string;
  organizationSchema: any;
}

let cachedGlobal: GlobalSeo | null = null;
let cachedRows: Map<string, SeoRow> | null = null;

async function loadGlobal(): Promise<GlobalSeo> {
  if (cachedGlobal) return cachedGlobal;
  const { data } = await supabase
    .from("site_settings")
    .select("key,value")
    .in("key", [
      "site_url",
      "default_meta_title",
      "default_meta_description",
      "default_meta_keywords",
      "default_og_image",
      "twitter_handle",
      "organization_schema",
    ]);
  const map: Record<string, string> = {};
  data?.forEach((r) => { if (r.value) map[r.key] = r.value; });
  let orgSchema: any = null;
  try { orgSchema = map["organization_schema"] ? JSON.parse(map["organization_schema"]) : null; } catch {}
  cachedGlobal = {
    siteUrl: (map["site_url"] || "https://shahedit.com").replace(/\/$/, ""),
    defaultTitle: map["default_meta_title"] || "Shahed IT",
    defaultDescription: map["default_meta_description"] || "",
    defaultKeywords: map["default_meta_keywords"] || "",
    defaultOgImage: map["default_og_image"] || "",
    twitterHandle: map["twitter_handle"] || "",
    organizationSchema: orgSchema,
  };
  return cachedGlobal;
}

async function loadRow(path: string): Promise<SeoRow | null> {
  if (!cachedRows) {
    const { data } = await supabase.from("seo_pages").select("*").eq("is_active", true);
    cachedRows = new Map();
    data?.forEach((r: any) => cachedRows!.set(r.route_path, r));
  }
  return cachedRows.get(path) || null;
}

export function SEO(props: SeoOverride) {
  const { pathname } = useLocation();
  const [row, setRow] = useState<SeoRow | null>(null);
  const [global, setGlobal] = useState<GlobalSeo | null>(null);

  useEffect(() => {
    loadGlobal().then(setGlobal);
    loadRow(pathname).then(setRow);
  }, [pathname]);

  if (!global) return null;

  const title = props.title || row?.meta_title || global.defaultTitle;
  const description = props.description || row?.meta_description || global.defaultDescription;
  const keywords = props.keywords || row?.meta_keywords || global.defaultKeywords;
  const image = props.image || row?.og_image || global.defaultOgImage;
  const canonical = props.canonical || row?.canonical_url || `${global.siteUrl}${pathname}`;
  const robots = row?.robots || "index,follow";
  const ogTitle = row?.og_title || title;
  const ogDescription = row?.og_description || description;
  const twitterCard = row?.twitter_card || "summary_large_image";
  const twitterTitle = row?.twitter_title || ogTitle;
  const twitterDescription = row?.twitter_description || ogDescription;
  const twitterImage = row?.twitter_image || image;

  const schemas: any[] = [];
  if (global.organizationSchema) schemas.push(global.organizationSchema);
  if (row?.schema_json) {
    if (Array.isArray(row.schema_json)) schemas.push(...row.schema_json);
    else schemas.push(row.schema_json);
  }
  if (props.schema) {
    if (Array.isArray(props.schema)) schemas.push(...props.schema);
    else schemas.push(props.schema);
  }

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />

      <meta property="og:title" content={ogTitle} />
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      <meta property="og:type" content={props.type || "website"} />
      <meta property="og:url" content={canonical} />
      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitle} />
      {twitterDescription && <meta name="twitter:description" content={twitterDescription} />}
      {twitterImage && <meta name="twitter:image" content={twitterImage} />}
      {global.twitterHandle && <meta name="twitter:site" content={global.twitterHandle} />}

      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(s)}</script>
      ))}
    </Helmet>
  );
}

export function clearSeoCache() {
  cachedGlobal = null;
  cachedRows = null;
}
