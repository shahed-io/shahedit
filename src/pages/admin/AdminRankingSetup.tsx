import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Save, ShieldCheck, BarChart3, Target, Eye, CheckCircle2, AlertCircle, ExternalLink, Activity, Send } from "lucide-react";
import { motion } from "framer-motion";
import { InjectionStatusPanel } from "@/components/admin/InjectionStatusPanel";
import GscSubmitPanel from "@/components/admin/GscSubmitPanel";

type FieldDef = {
  key: string;
  label: string;
  placeholder?: string;
  hint?: string;
  validator?: RegExp;
  helpUrl?: string;
};

type GroupDef = { id: string; title: string; icon: any; description: string; fields: FieldDef[] };

const GROUPS: GroupDef[] = [
  {
    id: "verification",
    title: "Search Engine Verification",
    icon: ShieldCheck,
    description: "প্রতিটি search engine-কে প্রমাণ করুন যে আপনি সাইটের মালিক। verification code পেস্ট করলে meta tag automatic inject হবে।",
    fields: [
      { key: "gsc_verification_code", label: "Google Search Console", placeholder: "abc123…", hint: "search.google.com/search-console → Add Property → HTML tag", helpUrl: "https://search.google.com/search-console" },
      { key: "bing_verification_code", label: "Bing Webmaster Tools", placeholder: "XXXX…", helpUrl: "https://www.bing.com/webmasters" },
      { key: "yandex_verification_code", label: "Yandex Webmaster", placeholder: "XXXX…", helpUrl: "https://webmaster.yandex.com/" },
      { key: "pinterest_verification_code", label: "Pinterest Domain Verify", placeholder: "XXXX…", helpUrl: "https://help.pinterest.com/en/business/article/claim-your-website" },
      { key: "naver_verification_code", label: "Naver Webmaster (Korea)", placeholder: "XXXX…" },
      { key: "baidu_verification_code", label: "Baidu Webmaster (China)", placeholder: "XXXX…" },
      { key: "ahrefs_verification_code", label: "Ahrefs Site Audit", placeholder: "XXXX…" },
      { key: "norton_verification_code", label: "Norton Safe Web", placeholder: "XXXX…" },
    ],
  },
  {
    id: "analytics",
    title: "Analytics & Tag Management",
    icon: BarChart3,
    description: "Visitor traffic, behaviour, conversion — সবকিছু track করার জন্য।",
    fields: [
      { key: "gtm_container_id", label: "Google Tag Manager", placeholder: "GTM-XXXXXX", validator: /^GTM-/i, hint: "GTM একবার সেট করলে ভিতরে সব pixel/tag manage করা যায়", helpUrl: "https://tagmanager.google.com/" },
      { key: "ga4_measurement_id", label: "Google Analytics 4", placeholder: "G-XXXXXXXXXX", validator: /^G-/i, helpUrl: "https://analytics.google.com/" },
      { key: "microsoft_clarity_id", label: "Microsoft Clarity (Heatmaps — FREE)", placeholder: "abc123def", helpUrl: "https://clarity.microsoft.com/" },
      { key: "hotjar_id", label: "Hotjar Site ID", placeholder: "1234567" },
      { key: "yandex_metrica_id", label: "Yandex Metrica Counter ID", placeholder: "12345678", helpUrl: "https://metrica.yandex.com/" },
    ],
  },
  {
    id: "ads",
    title: "Marketing & Conversion Pixels",
    icon: Target,
    description: "Paid ads থেকে conversion track এবং retargeting audience তৈরি।",
    fields: [
      { key: "google_ads_conversion_id", label: "Google Ads Conversion ID", placeholder: "AW-XXXXXXXXX", validator: /^AW-/i },
      { key: "adsense_publisher_id", label: "Google AdSense Publisher", placeholder: "ca-pub-XXXXXXXXXXXXXXXX", validator: /^ca-pub-/i },
      { key: "facebook_pixel_id", label: "Meta (Facebook/Instagram) Pixel", placeholder: "1234567890123456" },
      { key: "fb_app_id", label: "Facebook App ID (for fb:app_id meta)", placeholder: "1234567890123456" },
      { key: "tiktok_pixel_id", label: "TikTok Pixel", placeholder: "CXXXXXXXXXXXXXXXX" },
      { key: "linkedin_partner_id", label: "LinkedIn Insight Partner ID", placeholder: "1234567" },
      { key: "twitter_pixel_id", label: "Twitter / X Pixel", placeholder: "o1abc" },
      { key: "pinterest_tag_id", label: "Pinterest Tag ID", placeholder: "2612345678901" },
      { key: "snapchat_pixel_id", label: "Snapchat Pixel ID", placeholder: "abcd-1234-..." },
    ],
  },
  {
    id: "social",
    title: "Open Graph & Social Defaults",
    icon: Eye,
    description: "Facebook / WhatsApp / LinkedIn / Twitter-এ link share করলে যা দেখাবে।",
    fields: [
      { key: "default_og_image", label: "Default OG Image URL (1200x630)", placeholder: "https://shahedit.com/og.png" },
      { key: "twitter_handle", label: "Twitter / X Handle", placeholder: "@shahedit" },
      { key: "og_locale", label: "OG Locale", placeholder: "bn_BD" },
      { key: "og_site_name", label: "OG Site Name", placeholder: "Shahed IT" },
    ],
  },
];

const ALL_KEYS = GROUPS.flatMap((g) => g.fields.map((f) => f.key));

export default function AdminRankingSetup() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("site_settings").select("key,value").in("key", ALL_KEYS);
    const map: Record<string, string> = {};
    data?.forEach((r: any) => { map[r.key] = r.value || ""; });
    setValues(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveGroup = async (group: GroupDef) => {
    setSaving(true);
    for (const f of group.fields) {
      const val = (values[f.key] || "").trim();
      if (val && f.validator && !f.validator.test(val)) {
        toast.error(`${f.label}: format ভুল — example "${f.placeholder}"`);
        setSaving(false);
        return;
      }
      await supabase.from("site_settings").upsert(
        { key: f.key, value: val, type: "text", group_name: group.id, label: f.label } as any,
        { onConflict: "key" },
      );
    }
    setSaving(false);
    toast.success(`${group.title} saved — refresh করলে live হবে`);
  };

  const totalConfigured = Object.values(values).filter((v) => v && v.trim()).length;
  const completion = Math.round((totalConfigured / ALL_KEYS.length) * 100);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent flex items-center gap-3">
            <ShieldCheck size={28} /> Ranking Setup — সব Google System এক জায়গায়
          </h1>
          <p className="text-white/60 mt-1 max-w-3xl">
            Search engine verification, analytics, pixel — সব ranking tool এক page থেকে control করুন।
            পেস্ট করুন → save → automatically inject হবে।
          </p>
        </div>
        <Card className="bg-white/5 border-white/10 p-4 min-w-[200px]">
          <div className="text-xs text-white/50 uppercase tracking-wider">Setup Complete</div>
          <div className="text-3xl font-bold text-amber-300 mt-1">{completion}%</div>
          <div className="text-xs text-white/60 mt-1">{totalConfigured} / {ALL_KEYS.length} configured</div>
          <div className="h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all" style={{ width: `${completion}%` }} />
          </div>
        </Card>
      </motion.div>

      <Tabs defaultValue="status">
        <TabsList className="bg-white/5 border border-white/10 flex-wrap h-auto">
          <TabsTrigger value="status" className="data-[state=active]:bg-emerald-500/20">
            <Activity size={14} className="mr-2" />
            Live Status
          </TabsTrigger>
          <TabsTrigger value="gsc" className="data-[state=active]:bg-blue-500/20">
            <Send size={14} className="mr-2" />
            GSC Submit
          </TabsTrigger>
          {GROUPS.map((g) => {
            const Icon = g.icon;
            const configured = g.fields.filter((f) => values[f.key]?.trim()).length;
            return (
              <TabsTrigger key={g.id} value={g.id} className="data-[state=active]:bg-amber-500/20">
                <Icon size={14} className="mr-2" />
                {g.title}
                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-white/10">{configured}/{g.fields.length}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="status" className="mt-4">
          <InjectionStatusPanel />
        </TabsContent>

        <TabsContent value="gsc" className="mt-4">
          <GscSubmitPanel />
        </TabsContent>

        {GROUPS.map((group) => {
          const Icon = group.icon;
          return (
            <TabsContent key={group.id} value={group.id} className="mt-4">
              <Card className="bg-white/5 border-white/10 p-5 md:p-6 space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-amber-300" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{group.title}</h2>
                    <p className="text-sm text-white/60 mt-0.5">{group.description}</p>
                  </div>
                </div>

                {loading ? (
                  <p className="text-white/50 text-sm">Loading…</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {group.fields.map((f) => {
                      const val = values[f.key] || "";
                      const isValid = !val || !f.validator || f.validator.test(val);
                      return (
                        <div key={f.key}>
                          <div className="flex items-center justify-between mb-1">
                            <Label className="text-white/80 text-sm">{f.label}</Label>
                            {val && (
                              isValid
                                ? <CheckCircle2 size={14} className="text-emerald-400" />
                                : <AlertCircle size={14} className="text-rose-400" />
                            )}
                          </div>
                          <Input
                            value={val}
                            placeholder={f.placeholder}
                            onChange={(e) => setValues((s) => ({ ...s, [f.key]: e.target.value }))}
                            className="bg-white/5 border-white/10 text-white"
                          />
                          {(f.hint || f.helpUrl) && (
                            <p className="text-xs text-white/40 mt-1 flex items-center gap-1.5">
                              {f.hint && <span>{f.hint}</span>}
                              {f.helpUrl && (
                                <a href={f.helpUrl} target="_blank" rel="noopener noreferrer" className="text-amber-300 hover:text-amber-200 inline-flex items-center gap-0.5">
                                  Open <ExternalLink size={10} />
                                </a>
                              )}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-end pt-2 border-t border-white/10">
                  <Button onClick={() => saveGroup(group)} disabled={saving || loading} className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold hover:from-amber-400 hover:to-yellow-400">
                    <Save size={14} className="mr-1.5" />
                    {saving ? "Saving…" : `Save ${group.title}`}
                  </Button>
                </div>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border-amber-500/20 p-5">
        <h3 className="text-amber-300 font-semibold flex items-center gap-2 mb-2">
          <CheckCircle2 size={18} /> Auto-Generated SEO Features
        </h3>
        <ul className="text-sm text-white/70 space-y-1.5 list-disc list-inside">
          <li>Organization, WebSite & LocalBusiness JSON-LD — sitewide</li>
          <li>BreadcrumbList JSON-LD — automatically every page</li>
          <li>FAQPage JSON-LD — homepage থেকে DB faqs auto-pull</li>
          <li>Per-page meta override — <code className="text-amber-300">/admin/seo</code></li>
          <li>Sitemap & robots.txt — <code className="text-amber-300">/admin/sitemap</code></li>
          <li>301 Redirects — <code className="text-amber-300">/admin/redirects</code></li>
          <li>Schema Builder (Product, Article, Event…) — <code className="text-amber-300">/admin/schema</code></li>
        </ul>
      </Card>
    </div>
  );
}
