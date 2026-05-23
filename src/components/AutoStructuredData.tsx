import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Auto-injects FAQPage JSON-LD on homepage + BreadcrumbList on every page.
 * Reads FAQs from DB so admin edits flow through automatically.
 */
export function AutoStructuredData() {
  const { pathname } = useLocation();
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);

  useEffect(() => {
    if (pathname !== "/") return;
    supabase
      .from("faqs")
      .select("question,answer")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .limit(20)
      .then(({ data }) => setFaqs(data || []));
  }, [pathname]);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://shahedit.com";

  // ---- BreadcrumbList ----
  const segs = pathname.split("/").filter(Boolean);
  const breadcrumbItems = [
    { name: "Home", item: `${origin}/` },
    ...segs.map((seg, i) => ({
      name: seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      item: `${origin}/${segs.slice(0, i + 1).join("/")}`,
    })),
  ];
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.name,
      item: b.item,
    })),
  };

  // ---- FAQPage (homepage only) ----
  const faqSchema =
    pathname === "/" && faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null;

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
    </Helmet>
  );
}
