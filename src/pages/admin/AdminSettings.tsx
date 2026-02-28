import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Save, BarChart3, Search, Globe, Info, CheckCircle2, ExternalLink, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { SiteSetting } from "@/lib/supabase-types";

const groups = ["general", "social", "branding", "seo", "analytics"];

const AnalyticsSettings = ({
  values,
  setValues,
  saving,
  onSave,
}: {
  values: Record<string, string>;
  setValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  saving: boolean;
  onSave: () => void;
}) => {
  const ga4Id = values["ga4_measurement_id"] ?? "";
  const gscCode = values["gsc_verification_code"] ?? "";
  const sitemapUrl = values["gsc_sitemap_url"] ?? "";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("কপি হয়েছে!");
  };

  return (
    <div className="space-y-8">
      {/* Google Analytics 4 */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <BarChart3 size={20} className="text-orange-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">Google Analytics 4</h3>
            <p className="text-slate-400 text-xs">ওয়েবসাইটের ট্র্যাফিক ও ভিজিটর ট্র্যাক করুন</p>
          </div>
          {ga4Id && ga4Id.startsWith("G-") && (
            <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
              <CheckCircle2 size={12} /> Active
            </span>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-slate-300 text-sm">Measurement ID</Label>
          <Input
            value={ga4Id}
            onChange={e => setValues(p => ({ ...p, ga4_measurement_id: e.target.value }))}
            placeholder="G-XXXXXXXXXX"
            className="bg-slate-900 border-slate-600 text-white font-mono"
            maxLength={20}
          />
          <p className="text-slate-500 text-xs flex items-center gap-1.5">
            <Info size={11} />
            Google Analytics → Admin → Data Streams → আপনার সাইট → Measurement ID
          </p>
        </div>

        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 space-y-2">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">কীভাবে পাবেন?</p>
          <ol className="space-y-1.5 text-slate-400 text-xs list-none">
            {[
              "analytics.google.com → Sign in করুন",
              "Admin → Property Settings → Data Streams",
              "আপনার ওয়েবসাইট stream-এ ক্লিক করুন",
              "Measurement ID কপি করুন (G- দিয়ে শুরু)",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-orange-400 text-xs hover:text-orange-300 transition-colors mt-1">
            Google Analytics খুলুন <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* Google Search Console */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Search size={20} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">Google Search Console</h3>
            <p className="text-slate-400 text-xs">সার্চ র‍্যাংকিং ও ইম্প্রেশন মনিটর করুন</p>
          </div>
          {gscCode && (
            <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
              <CheckCircle2 size={12} /> Configured
            </span>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-slate-300 text-sm">Verification Code</Label>
          <Input
            value={gscCode}
            onChange={e => setValues(p => ({ ...p, gsc_verification_code: e.target.value }))}
            placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            className="bg-slate-900 border-slate-600 text-white font-mono text-xs"
          />
          <p className="text-slate-500 text-xs flex items-center gap-1.5">
            <Info size={11} />
            HTML tag method-এর content="" এর ভেতরের কোডটুকু এখানে দিন
          </p>
        </div>

        {gscCode && (
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-3">
            <p className="text-slate-500 text-[11px] mb-1.5 font-semibold">আপনার সাইটে এই meta tag যোগ হয়েছে:</p>
            <div className="flex items-center gap-2">
              <code className="text-green-400 text-[11px] flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                {`<meta name="google-site-verification" content="${gscCode}" />`}
              </code>
              <button onClick={() => copyToClipboard(`<meta name="google-site-verification" content="${gscCode}" />`)}
                className="text-slate-400 hover:text-white shrink-0">
                <Copy size={13} />
              </button>
            </div>
          </div>
        )}

        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 space-y-2">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">কীভাবে verify করবেন?</p>
          <ol className="space-y-1.5 text-slate-400 text-xs">
            {[
              "search.google.com/search-console → Add Property",
              "আপনার domain দিন (shahedit.com)",
              "HTML tag method select করুন",
              'content="..." এর ভেতরের কোডটুকু এখানে paste করুন',
              "Save করুন — তারপর Search Console-এ Verify করুন",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-blue-400 text-xs hover:text-blue-300 transition-colors mt-1">
            Search Console খুলুন <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* Sitemap */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
            <Globe size={20} className="text-teal-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">Sitemap URL</h3>
            <p className="text-slate-400 text-xs">Search Console-এ submit করার জন্য</p>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300 text-sm">Sitemap URL</Label>
          <div className="flex gap-2">
            <Input
              value={sitemapUrl}
              onChange={e => setValues(p => ({ ...p, gsc_sitemap_url: e.target.value }))}
              placeholder="https://shahedit.com/sitemap.xml"
              className="bg-slate-900 border-slate-600 text-white font-mono text-sm flex-1"
            />
            <button onClick={() => copyToClipboard(sitemapUrl)}
              className="px-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl border border-slate-600 transition-colors">
              <Copy size={14} />
            </button>
          </div>
          <p className="text-slate-500 text-xs">এই URL টি Google Search Console → Sitemaps-এ submit করুন</p>
        </div>
      </div>

      <Button onClick={onSave} disabled={saving} className="bg-teal-600 hover:bg-teal-500 gap-2 w-full sm:w-auto">
        <Save size={15} /> {saving ? "সংরক্ষণ হচ্ছে..." : "Analytics Settings সংরক্ষণ করুন"}
      </Button>
    </div>
  );
};

const AdminSettings = () => {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeGroup, setActiveGroup] = useState("general");

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("site_settings").select("*").order("group_name");
      setSettings(data ?? []);
      const v: Record<string, string> = {};
      (data ?? []).forEach(s => { v[s.key] = s.value ?? ""; });
      setValues(v);
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    const keysToSave = activeGroup === "analytics"
      ? ["ga4_measurement_id", "gsc_verification_code", "gsc_sitemap_url"]
      : settings.filter(s => s.group_name === activeGroup).map(s => s.key);

    const items = settings.filter(s => keysToSave.includes(s.key));
    await Promise.all(
      items.map(s =>
        supabase.from("site_settings").update({ value: values[s.key] ?? "" }).eq("id", s.id)
      )
    );
    setSaving(false);
    toast.success("Settings saved!");
  };

  const groupSettings = settings.filter(s => s.group_name === activeGroup);

  const tabLabels: Record<string, string> = {
    general: "General",
    social: "Social",
    branding: "Branding",
    seo: "SEO",
    analytics: "📊 Analytics",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Site Settings</h1>
          <p className="text-slate-400 text-sm">Manage your website configuration</p>
        </div>
        {activeGroup !== "analytics" && (
          <Button onClick={saveSettings} disabled={saving} className="bg-teal-600 hover:bg-teal-500 gap-2">
            <Save size={15} /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {groups.map(g => (
          <button key={g} onClick={() => setActiveGroup(g)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              activeGroup === g ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {tabLabels[g] ?? g}
          </button>
        ))}
      </div>

      {activeGroup === "analytics" ? (
        <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <AnalyticsSettings values={values} setValues={setValues} saving={saving} onSave={saveSettings} />
        </motion.div>
      ) : (
        <motion.div
          key={activeGroup}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
        >
          {loading ? (
            <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-slate-800 rounded-xl animate-pulse" />)}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {groupSettings.map(s => (
                <div key={s.key}>
                  <Label className="text-slate-300 text-xs mb-1.5 block">{s.label ?? s.key}</Label>
                  <Input
                    value={values[s.key] ?? ""}
                    onChange={e => setValues(p => ({ ...p, [s.key]: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-white h-10"
                    placeholder={`Enter ${s.label ?? s.key}...`}
                  />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AdminSettings;
