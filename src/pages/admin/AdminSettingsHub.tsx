import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Settings as SettingsIcon, Save, Loader2, Globe, DollarSign, Languages, Clock, Receipt, Truck, Share2, KeyRound, Code2 } from "lucide-react";

type KV = Record<string, string>;

const DEFAULTS: KV = {
  site_name: "Shahed IT",
  site_tagline: "",
  site_email: "info.shahedit@gmail.com",
  site_phone: "01820-060046",
  site_address: "Rajshahi, Bangladesh",
  currency_code: "BDT",
  currency_symbol: "৳",
  currency_position: "before",
  default_language: "bn",
  timezone: "Asia/Dhaka",
  date_format: "DD/MM/YYYY",
  tax_enabled: "false",
  tax_rate: "0",
  tax_label: "VAT",
  tax_inclusive: "false",
  shipping_enabled: "false",
  shipping_flat_rate: "0",
  shipping_free_threshold: "0",
  shipping_zones: "",
  social_facebook: "",
  social_instagram: "",
  social_youtube: "",
  social_linkedin: "",
  social_twitter: "",
  social_whatsapp: "",
  api_google_maps_key: "",
  api_recaptcha_site_key: "",
  api_meta_pixel_id: "",
  api_tiktok_pixel_id: "",
  custom_head_code: "",
  custom_body_code: "",
  custom_footer_code: "",
};

const CURRENCIES = [
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
];

const LANGUAGES = [
  { code: "bn", name: "বাংলা" },
  { code: "en", name: "English" },
];

const TIMEZONES = [
  "Asia/Dhaka", "Asia/Kolkata", "Asia/Karachi", "Asia/Dubai",
  "UTC", "Europe/London", "America/New_York", "America/Los_Angeles", "Asia/Tokyo", "Asia/Singapore",
];

export default function AdminSettingsHub() {
  const [values, setValues] = useState<KV>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any).from("site_settings").select("key,value");
      const next: KV = { ...DEFAULTS };
      (data ?? []).forEach((r: any) => { next[r.key] = r.value ?? ""; });
      setValues(next);
      setLoading(false);
    })();
  }, []);

  const set = (k: string, v: string) => setValues(p => ({ ...p, [k]: v }));

  const save = async (group: string, keys: string[]) => {
    setSaving(true);
    const rows = keys.map(k => ({ key: k, value: values[k] ?? "", group_name: group, type: "text", label: k }));
    const { error } = await (supabase as any).from("site_settings").upsert(rows, { onConflict: "key" });
    setSaving(false);
    if (error) toast.error("Save failed: " + error.message);
    else toast.success("Settings saved");
  };

  if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Settings Hub</h1>
          <p className="text-sm text-muted-foreground">General, currency, language, timezone, tax, shipping, social, API ও custom code</p>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 h-auto">
          <TabsTrigger value="general"><Globe className="h-3.5 w-3.5 mr-1" />General</TabsTrigger>
          <TabsTrigger value="currency"><DollarSign className="h-3.5 w-3.5 mr-1" />Currency</TabsTrigger>
          <TabsTrigger value="language"><Languages className="h-3.5 w-3.5 mr-1" />Language</TabsTrigger>
          <TabsTrigger value="timezone"><Clock className="h-3.5 w-3.5 mr-1" />Timezone</TabsTrigger>
          <TabsTrigger value="tax"><Receipt className="h-3.5 w-3.5 mr-1" />Tax</TabsTrigger>
          <TabsTrigger value="shipping"><Truck className="h-3.5 w-3.5 mr-1" />Shipping</TabsTrigger>
          <TabsTrigger value="social"><Share2 className="h-3.5 w-3.5 mr-1" />Social</TabsTrigger>
          <TabsTrigger value="api"><KeyRound className="h-3.5 w-3.5 mr-1" />API Keys</TabsTrigger>
          <TabsTrigger value="code"><Code2 className="h-3.5 w-3.5 mr-1" />Custom Code</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader><CardTitle>General Settings</CardTitle><CardDescription>সাইটের মূল তথ্য</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Site Name" value={values.site_name} onChange={v => set("site_name", v)} />
                <Field label="Tagline" value={values.site_tagline} onChange={v => set("site_tagline", v)} />
                <Field label="Contact Email" value={values.site_email} onChange={v => set("site_email", v)} />
                <Field label="Contact Phone" value={values.site_phone} onChange={v => set("site_phone", v)} />
                <Field label="Address" value={values.site_address} onChange={v => set("site_address", v)} className="md:col-span-2" />
              </div>
              <SaveBtn onClick={() => save("general", ["site_name","site_tagline","site_email","site_phone","site_address"])} loading={saving} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="currency">
          <Card>
            <CardHeader><CardTitle>Currency</CardTitle><CardDescription>সাইটের ডিফল্ট মুদ্রা</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Currency</Label>
                  <Select value={values.currency_code} onValueChange={v => {
                    const c = CURRENCIES.find(x => x.code === v);
                    set("currency_code", v);
                    if (c) set("currency_symbol", c.symbol);
                  }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CURRENCIES.map(c => <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Field label="Symbol" value={values.currency_symbol} onChange={v => set("currency_symbol", v)} />
                <div>
                  <Label>Symbol Position</Label>
                  <Select value={values.currency_position} onValueChange={v => set("currency_position", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="before">Before — ৳100</SelectItem>
                      <SelectItem value="after">After — 100৳</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <SaveBtn onClick={() => save("currency", ["currency_code","currency_symbol","currency_position"])} loading={saving} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language">
          <Card>
            <CardHeader><CardTitle>Language</CardTitle><CardDescription>সাইটের ডিফল্ট ভাষা</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Default Language</Label>
                <Select value={values.default_language} onValueChange={v => set("default_language", v)}>
                  <SelectTrigger className="md:w-1/2"><SelectValue /></SelectTrigger>
                  <SelectContent>{LANGUAGES.map(l => <SelectItem key={l.code} value={l.code}>{l.name} ({l.code})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <SaveBtn onClick={() => save("language", ["default_language"])} loading={saving} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timezone">
          <Card>
            <CardHeader><CardTitle>Timezone & Date</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Timezone</Label>
                  <Select value={values.timezone} onValueChange={v => set("timezone", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TIMEZONES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date Format</Label>
                  <Select value={values.date_format} onValueChange={v => set("date_format", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      <SelectItem value="DD MMM YYYY">DD MMM YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <SaveBtn onClick={() => save("timezone", ["timezone","date_format"])} loading={saving} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax">
          <Card>
            <CardHeader><CardTitle>Tax / VAT</CardTitle><CardDescription>অর্ডারে ট্যাক্স যোগ</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div><div className="font-medium">Enable Tax</div><div className="text-xs text-muted-foreground">চেকআউটে ট্যাক্স যুক্ত হবে</div></div>
                <Switch checked={values.tax_enabled === "true"} onCheckedChange={v => set("tax_enabled", v ? "true" : "false")} />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <Field label="Tax Label" value={values.tax_label} onChange={v => set("tax_label", v)} />
                <Field label="Tax Rate (%)" type="number" value={values.tax_rate} onChange={v => set("tax_rate", v)} />
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div><div className="text-sm font-medium">Price Inclusive</div><div className="text-xs text-muted-foreground">দাম ট্যাক্স সহ</div></div>
                  <Switch checked={values.tax_inclusive === "true"} onCheckedChange={v => set("tax_inclusive", v ? "true" : "false")} />
                </div>
              </div>
              <SaveBtn onClick={() => save("tax", ["tax_enabled","tax_label","tax_rate","tax_inclusive"])} loading={saving} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping">
          <Card>
            <CardHeader><CardTitle>Shipping</CardTitle><CardDescription>ফিজিক্যাল ডেলিভারির জন্য (ডিজিটাল প্রোডাক্টে প্রযোজ্য নয়)</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div><div className="font-medium">Enable Shipping</div></div>
                <Switch checked={values.shipping_enabled === "true"} onCheckedChange={v => set("shipping_enabled", v ? "true" : "false")} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Flat Rate (৳)" type="number" value={values.shipping_flat_rate} onChange={v => set("shipping_flat_rate", v)} />
                <Field label="Free Shipping Threshold (৳)" type="number" value={values.shipping_free_threshold} onChange={v => set("shipping_free_threshold", v)} />
              </div>
              <div>
                <Label>Shipping Zones (JSON)</Label>
                <Textarea rows={5} value={values.shipping_zones} onChange={e => set("shipping_zones", e.target.value)}
                  placeholder='[{"name":"Dhaka","rate":60},{"name":"Outside Dhaka","rate":130}]' className="font-mono text-xs" />
              </div>
              <SaveBtn onClick={() => save("shipping", ["shipping_enabled","shipping_flat_rate","shipping_free_threshold","shipping_zones"])} loading={saving} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader><CardTitle>Social Media</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Facebook URL" value={values.social_facebook} onChange={v => set("social_facebook", v)} placeholder="https://facebook.com/..." />
                <Field label="Instagram URL" value={values.social_instagram} onChange={v => set("social_instagram", v)} placeholder="https://instagram.com/..." />
                <Field label="YouTube URL" value={values.social_youtube} onChange={v => set("social_youtube", v)} />
                <Field label="LinkedIn URL" value={values.social_linkedin} onChange={v => set("social_linkedin", v)} />
                <Field label="X / Twitter URL" value={values.social_twitter} onChange={v => set("social_twitter", v)} />
                <Field label="WhatsApp Number" value={values.social_whatsapp} onChange={v => set("social_whatsapp", v)} placeholder="8801820060046" />
              </div>
              <SaveBtn onClick={() => save("social", ["social_facebook","social_instagram","social_youtube","social_linkedin","social_twitter","social_whatsapp"])} loading={saving} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader><CardTitle>API Keys</CardTitle><CardDescription>Public/client-side keys। Server-side গোপন key গুলো Secrets-এ রাখুন।</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Google Maps API Key" value={values.api_google_maps_key} onChange={v => set("api_google_maps_key", v)} />
                <Field label="reCAPTCHA Site Key" value={values.api_recaptcha_site_key} onChange={v => set("api_recaptcha_site_key", v)} />
                <Field label="Meta Pixel ID" value={values.api_meta_pixel_id} onChange={v => set("api_meta_pixel_id", v)} />
                <Field label="TikTok Pixel ID" value={values.api_tiktok_pixel_id} onChange={v => set("api_tiktok_pixel_id", v)} />
              </div>
              <SaveBtn onClick={() => save("api", ["api_google_maps_key","api_recaptcha_site_key","api_meta_pixel_id","api_tiktok_pixel_id"])} loading={saving} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code">
          <Card>
            <CardHeader>
              <CardTitle>Custom Code</CardTitle>
              <CardDescription>Header, body open ও footer-এ custom HTML/JS inject করুন (Analytics, Chat widget, ইত্যাদি)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{"<head>"} Code</Label>
                <Textarea rows={6} value={values.custom_head_code} onChange={e => set("custom_head_code", e.target.value)}
                  placeholder="<!-- Google Analytics, meta tags -->" className="font-mono text-xs" />
              </div>
              <div>
                <Label>Body Start Code (after {"<body>"})</Label>
                <Textarea rows={6} value={values.custom_body_code} onChange={e => set("custom_body_code", e.target.value)}
                  placeholder="<!-- GTM noscript, Pixels -->" className="font-mono text-xs" />
              </div>
              <div>
                <Label>Footer Code (before {"</body>"})</Label>
                <Textarea rows={6} value={values.custom_footer_code} onChange={e => set("custom_footer_code", e.target.value)}
                  placeholder="<!-- Chat widgets, support scripts -->" className="font-mono text-xs" />
              </div>
              <SaveBtn onClick={() => save("custom_code", ["custom_head_code","custom_body_code","custom_footer_code"])} loading={saving} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, className }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; className?: string }) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function SaveBtn({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <Button onClick={onClick} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
      Save Changes
    </Button>
  );
}
