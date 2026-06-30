import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Save, Eye } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  useCopyProtectionSettings,
  DEFAULT_COPY_PROTECTION,
  type CopyProtectionSettings,
} from "@/hooks/useCopyProtection";

export default function AdminCopyProtection() {
  const { settings: loaded, loading } = useCopyProtectionSettings();
  const [s, setS] = useState<CopyProtectionSettings>(DEFAULT_COPY_PROTECTION);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading) setS(loaded);
  }, [loading, loaded]);

  const update = <K extends keyof CopyProtectionSettings>(k: K, v: CopyProtectionSettings[K]) =>
    setS((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    const payload = {
      key: "copy_protection",
      value: JSON.stringify(s),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from("site_settings")
      .upsert(payload, { onConflict: "key" });
    setSaving(false);
    if (error) {
      toast.error("Save failed: " + error.message);
    } else {
      toast.success("Copy Protection সেটিংস সংরক্ষিত হয়েছে");
    }
  };

  const Toggle = ({
    k,
    title,
    desc,
  }: {
    k: keyof CopyProtectionSettings;
    title: string;
    desc: string;
  }) => (
    <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
      <div className="space-y-1">
        <Label className="text-sm font-semibold">{title}</Label>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch
        checked={!!s[k]}
        onCheckedChange={(v) => update(k, v as never)}
      />
    </div>
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 p-3 text-white shadow-lg">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Copy Protection</h1>
            <p className="text-sm text-muted-foreground">
              পাবলিক ওয়েবসাইটে কন্টেন্ট কপি, রাইট-ক্লিক, DevTools ও স্ক্রিন গ্র্যাব থেকে রক্ষা করুন।
            </p>
          </div>
        </div>
        <Button onClick={save} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle>স্বাধীন নিয়ন্ত্রণ (Independent Toggles)</CardTitle>
          <CardDescription>
            নিচের প্রতিটি protection আলাদা আলাদা ভাবে কাজ করে — যেকোনোটা একা চালু/বন্ধ করতে পারেন।
            সবগুলো বন্ধ থাকলে কোনো protection apply হবে না; যেকোনো একটা চালু থাকলেই সেটা apply হবে।
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Protection Rules</CardTitle>
          <CardDescription>প্রতিটা rule আলাদাভাবে চালু/বন্ধ করা যাবে</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Toggle k="disableRightClick" title="Right-Click বন্ধ" desc="মাউস ডান-ক্লিক ও context menu ব্লক করবে" />
          <Toggle k="disableTextSelection" title="Text Selection বন্ধ" desc="লেখা select করা যাবে না" />
          <Toggle k="disableCopy" title="Copy / Cut বন্ধ" desc="Ctrl+C, Ctrl+X এবং copy event ব্লক" />
          <Toggle k="disablePaste" title="Paste বন্ধ" desc="Form input-এ Ctrl+V এবং paste event ব্লক" />
          <Toggle k="disableDevtoolsKeys" title="DevTools Shortcut বন্ধ" desc="F12, Ctrl+Shift+I/J/C, Ctrl+U ব্লক" />
          <Toggle k="detectDevtools" title="DevTools Detection" desc="DevTools খুললেই পুরো পেজ blur হয়ে যাবে" />
          <Toggle k="disableImageDrag" title="Image Drag বন্ধ" desc="ছবি drag করে save করা যাবে না" />
          <Toggle k="disablePrint" title="Print / Save Page বন্ধ" desc="Ctrl+P এবং Ctrl+S ব্লক" />
          <Toggle k="blockPrintScreen" title="PrintScreen Key Block" desc="PrintScreen চাপলে clipboard clear হবে" />
          <Toggle k="disableTouchCallout" title="Mobile Long-Press বন্ধ" desc="মোবাইলে long-press menu আসবে না" />
          <Toggle k="disableMiddleClick" title="Middle-Click বন্ধ" desc="মাউস scroll button click ব্লক" />
          <Toggle k="blurOnWindowBlur" title="Window Blur হলে Blur" desc="অন্য tab/app-এ গেলে content blur হবে (anti screen-share)" />
          <Toggle k="frameBuster" title="Frame Buster (iframe বন্ধ)" desc="অন্য সাইট iframe দিয়ে আপনার সাইট embed করতে পারবে না" />
          <Toggle k="consoleWarning" title="Console Warning Message" desc="ব্রাউজার Console-এ লাল warning bookmark করবে" />
          <Toggle k="excludeAdmin" title="Admin Panel-এ ছাড়" desc="/ceo রুটে protection apply হবে না (সুপারিশকৃত)" />
          <Toggle k="showWarning" title="Warning Toast দেখাও" desc="ইউজার চেষ্টা করলে notification আসবে" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Warning Message</CardTitle>
          <CardDescription>ইউজার কপি করার চেষ্টা করলে যে বার্তা দেখাবে</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={s.warningMessage}
            onChange={(e) => update("warningMessage", e.target.value)}
            rows={2}
            placeholder="এই কন্টেন্ট কপি করা যাবে না"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Watermark Overlay</span>
            <Switch
              checked={s.watermarkEnabled}
              onCheckedChange={(v) => update("watermarkEnabled", v)}
            />
          </CardTitle>
          <CardDescription>
            পেজের উপর হালকা watermark বসাবে — screenshot নিলে আপনার ব্র্যান্ড দেখা যাবে
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label className="text-sm">Watermark Text</Label>
          <Input
            value={s.watermarkText}
            onChange={(e) => update("watermarkText", e.target.value)}
            placeholder="© Shahed IT"
            disabled={!s.watermarkEnabled}
          />
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="h-4 w-4" /> দ্রষ্টব্য
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            🔒 Copy protection একটি <strong>deterrent</strong> — সাধারণ ইউজার, casual scraper ও বট প্রতিরোধে কার্যকর।
            কিন্তু অভিজ্ঞ ব্যবহারকারী DevTools বন্ধ থাকলেও content পেতে পারে।
          </p>
          <p>
            📷 সম্পূর্ণ সুরক্ষার জন্য সবচেয়ে গুরুত্বপূর্ণ image-এ watermark বসিয়ে রাখুন এবং DRM/server-side delivery ব্যবহার করুন।
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
