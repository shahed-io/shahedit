import { useState } from "react";
import { AdminPage, AdminPageHeader, GlassCard } from "@/components/admin/ui";
import { Zap, Copy, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type SchemaType = "Organization" | "LocalBusiness" | "Article" | "Product" | "FAQPage" | "BreadcrumbList" | "Service";

const TEMPLATES: Record<SchemaType, any> = {
  Organization: {
    "@context": "https://schema.org", "@type": "Organization",
    name: "Shahed IT", url: "https://shahedit.com", logo: "https://shahedit.com/logo.png",
    contactPoint: { "@type": "ContactPoint", telephone: "+8801820060046", contactType: "Customer Service", areaServed: "BD" },
    sameAs: ["https://facebook.com/shahedit"],
  },
  LocalBusiness: {
    "@context": "https://schema.org", "@type": "LocalBusiness",
    name: "Shahed IT", image: "https://shahedit.com/logo.png", telephone: "+8801820060046",
    address: { "@type": "PostalAddress", addressLocality: "Rajshahi", addressCountry: "BD" },
    openingHours: "Mo-Su 10:00-22:00", priceRange: "৳৳",
  },
  Article: {
    "@context": "https://schema.org", "@type": "Article",
    headline: "Article title", image: "https://...", author: { "@type": "Person", name: "Shahed IT" },
    publisher: { "@type": "Organization", name: "Shahed IT", logo: { "@type": "ImageObject", url: "https://shahedit.com/logo.png" } },
    datePublished: "2026-05-10", dateModified: "2026-05-10",
  },
  Product: {
    "@context": "https://schema.org", "@type": "Product",
    name: "Service Package", image: "https://...", description: "...",
    offers: { "@type": "Offer", priceCurrency: "BDT", price: "5000", availability: "https://schema.org/InStock" },
  },
  FAQPage: {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: [{ "@type": "Question", name: "Q?", acceptedAnswer: { "@type": "Answer", text: "A." } }],
  },
  BreadcrumbList: {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://shahedit.com/" }],
  },
  Service: {
    "@context": "https://schema.org", "@type": "Service",
    serviceType: "Web Development", provider: { "@type": "Organization", name: "Shahed IT" },
    areaServed: { "@type": "Country", name: "Bangladesh" },
  },
};

export default function AdminSchemaBuilder() {
  const [type, setType] = useState<SchemaType>("Organization");
  const [json, setJson] = useState(JSON.stringify(TEMPLATES.Organization, null, 2));

  const loadTemplate = (t: SchemaType) => {
    setType(t);
    setJson(JSON.stringify(TEMPLATES[t], null, 2));
  };

  const copyTag = () => {
    try {
      const parsed = JSON.parse(json);
      const tag = `<script type="application/ld+json">\n${JSON.stringify(parsed, null, 2)}\n</script>`;
      navigator.clipboard.writeText(tag);
      toast.success("JSON-LD <script> tag copied");
    } catch {
      toast.error("Invalid JSON");
    }
  };

  const validate = () => {
    try { JSON.parse(json); toast.success("✓ Valid JSON-LD"); }
    catch (e: any) { toast.error("Invalid: " + e.message); }
  };

  return (
    <AdminPage>
      <AdminPageHeader
        title="Schema (JSON-LD) Builder"
        subtitle="Rich snippets — Google ranking ও CTR বাড়ানোর জন্য structured data"
        icon={Zap}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <GlassCard className="p-4 lg:col-span-1">
          <h3 className="text-sm font-semibold text-amber-100 mb-3">Templates</h3>
          <div className="space-y-1">
            {(Object.keys(TEMPLATES) as SchemaType[]).map((t) => (
              <button key={t} onClick={() => loadTemplate(t)} className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${type === t ? "bg-amber-400/20 text-amber-200 border border-amber-400/30" : "text-muted-foreground hover:bg-amber-400/5"}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-amber-400/5 border border-amber-400/10 text-[11px] text-amber-200/80 space-y-1">
            <p><strong>Tip:</strong></p>
            <p>1. Template select করুন</p>
            <p>2. Edit JSON</p>
            <p>3. Validate ও Copy &lt;script&gt; tag</p>
            <p>4. পেজের HTML &lt;head&gt; এ paste করুন</p>
          </div>
        </GlassCard>

        <GlassCard className="p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-amber-100">{type} Schema</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={validate}>Validate</Button>
              <Button size="sm" onClick={copyTag}><Copy className="w-3 h-3 mr-1" />Copy &lt;script&gt;</Button>
            </div>
          </div>
          <Textarea rows={20} value={json} onChange={(e) => setJson(e.target.value)} className="font-mono text-xs bg-black/40" />
          <a
            href="https://search.google.com/test/rich-results"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-amber-300 underline mt-2 inline-block"
          >
            → Google Rich Results Test এ verify করুন
          </a>
        </GlassCard>
      </div>
    </AdminPage>
  );
}
