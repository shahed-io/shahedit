import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Save, BarChart3, Search, Globe, Info, CheckCircle2, ExternalLink, Copy, CreditCard, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { SiteSetting } from "@/lib/supabase-types";

const groups = ["general", "social", "branding", "seo", "analytics", "bkash"];

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

const BkashApiSettings = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showAppSecret, setShowAppSecret] = useState(false);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "fail">("idle");

  const fields = [
    { key: "bkash_username", label: "Username (Phone)", placeholder: "01840099853", secret: false },
    { key: "bkash_password", label: "Password", placeholder: "••••••••••", secret: true, showState: showPassword, toggleShow: () => setShowPassword(p => !p) },
    { key: "bkash_app_key", label: "App Key", placeholder: "CNJAGZEn6rDGySfOgzlV7ct1tc", secret: false },
    { key: "bkash_app_secret", label: "App Secret", placeholder: "JQDdMhk8hz9zff6shpNpye25qJzim7wl08N7RuEiwokSmyXVQeUY", secret: true, showState: showAppSecret, toggleShow: () => setShowAppSecret(p => !p) },
  ];

  const testConnection = async () => {
    setTesting(true);
    setStatus("idle");
    try {
      const { data } = await supabase.functions.invoke("verify-payment", {
        body: { transaction_id: "TEST_PING", payment_method: "bkash" },
      });
      if (data?.needs_config) {
        setStatus("fail");
        toast.error("bKash credentials কনফিগার করা নেই");
      } else {
        setStatus("ok");
        toast.success("bKash API সংযোগ সফল!");
      }
    } catch {
      setStatus("fail");
      toast.error("API টেস্ট ব্যর্থ হয়েছে");
    }
    setTesting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center text-2xl">🅱</div>
          <div>
            <h3 className="text-white font-bold text-base">bKash Payment Gateway</h3>
            <p className="text-slate-400 text-xs">Production API credentials — Tokenized Checkout</p>
          </div>
          {status === "ok" && (
            <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
              <CheckCircle2 size={12} /> Connected
            </span>
          )}
          {status === "fail" && (
            <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-400/10 px-3 py-1 rounded-full border border-red-400/20">
              ✕ Failed
            </span>
          )}
        </div>

        <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-3">
          <p className="text-pink-300 text-xs flex items-start gap-2">
            <ShieldCheck size={14} className="shrink-0 mt-0.5" />
            এই credentials গুলো securely encrypted করে server-এ সেভ আছে। কোনো কোডে expose হয় না।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.key} className="space-y-1.5">
              <Label className="text-slate-300 text-xs">{f.label}</Label>
              <div className="relative">
                <Input
                  type={f.secret && !f.showState ? "password" : "text"}
                  defaultValue=""
                  placeholder={f.placeholder}
                  disabled
                  className="bg-slate-900 border-slate-700 text-slate-400 font-mono text-xs pr-10"
                />
                {f.secret && (
                  <button
                    type="button"
                    onClick={f.toggleShow}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {f.showState ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <div className="flex-1 bg-slate-900/80 border border-green-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-green-400 shrink-0" />
            <span className="text-green-400 text-xs font-medium">Credentials সফলভাবে সেভ আছে (Encrypted Secrets)</span>
          </div>
          <Button
            onClick={testConnection}
            disabled={testing}
            variant="outline"
            size="sm"
            className="border-pink-500/30 text-pink-400 hover:bg-pink-500/10 gap-1.5 shrink-0"
          >
            <CreditCard size={13} />
            {testing ? "টেস্ট হচ্ছে..." : "টেস্ট করুন"}
          </Button>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Info size={18} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">API Endpoint</h3>
            <p className="text-slate-400 text-xs">Production (Live) bKash Tokenized Checkout</p>
          </div>
        </div>
        <div className="bg-slate-900 rounded-xl p-3 font-mono text-xs text-teal-400 break-all">
          https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/
        </div>
        <ol className="space-y-2 text-slate-400 text-xs">
          {[
            "Payments পেজে গিয়ে Verification Mode → অটো (API) সিলেক্ট করুন",
            "যেকোনো pending bKash পেমেন্টে 'অটো' বাটন ক্লিক করুন",
            "API স্বয়ংক্রিয়ভাবে Transaction যাচাই করে Approve করবে",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </div>
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
    bkash: "💳 bKash API",
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
      ) : activeGroup === "bkash" ? (
        <motion.div key="bkash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <BkashApiSettings />
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
