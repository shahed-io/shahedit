import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Sparkles, Trash2, Save, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { removeBackground } from "@/lib/remove-bg";

type Props = {
  value: string;
  onChange: (url: string) => void;
};

const SiteLogoManager = ({ value, onChange }: Props) => {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (localPreview) URL.revokeObjectURL(localPreview); }, [localPreview]);

  const uploadBlob = async (blob: Blob, ext = "png") => {
    const path = `site-logo/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("cms-media").upload(path, blob, {
      cacheControl: "3600",
      upsert: false,
      contentType: blob.type || "image/png",
    });
    if (error) throw error;
    const { data } = supabase.storage.from("cms-media").getPublicUrl(path);
    return data.publicUrl;
  };

  const handlePick = (file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("সর্বোচ্চ 5MB"); return; }
    if (localPreview) URL.revokeObjectURL(localPreview);
    setPickedFile(file);
    setLocalPreview(URL.createObjectURL(file));
  };

  const handleUploadOriginal = async () => {
    if (!pickedFile) return;
    setUploading(true);
    try {
      const ext = (pickedFile.name.split(".").pop() || "png").toLowerCase();
      const url = await uploadBlob(pickedFile, ext);
      onChange(url);
      toast.success("লোগো আপলোড হয়েছে — Save Changes চাপুন");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAIAdjust = async () => {
    if (!pickedFile) return;
    setProcessing(true);
    toast.info("AI ব্যাকগ্রাউন্ড সরাচ্ছে... একটু সময় লাগবে");
    try {
      const transparent = await removeBackground(pickedFile);
      // Update local preview to the transparent version
      if (localPreview) URL.revokeObjectURL(localPreview);
      setLocalPreview(URL.createObjectURL(transparent));
      setPickedFile(new File([transparent], "logo.png", { type: "image/png" }));
      // Upload directly
      const url = await uploadBlob(transparent, "png");
      onChange(url);
      toast.success("✨ ব্যাকগ্রাউন্ড সরানো হয়েছে ও আপলোড সম্পন্ন!");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Background removal failed");
    } finally {
      setProcessing(false);
    }
  };

  const saveToSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .update({ value })
        .eq("key", "logo_url");
      if (error) throw error;
      toast.success("লোগো সংরক্ষিত হয়েছে! পেজ রিফ্রেশ করুন");
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const clearLogo = () => {
    onChange("");
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    setPickedFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const displayUrl = localPreview || value;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 flex items-center justify-center">
          <ImageIcon size={20} className="text-fuchsia-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-base">সাইট লোগো (Site Logo)</h3>
          <p className="text-slate-400 text-xs">PNG/JPG আপলোড করুন — AI স্বয়ংক্রিয়ভাবে ব্যাকগ্রাউন্ড সরিয়ে ওয়েবসাইটের সাথে ম্যাচ করবে</p>
        </div>
      </div>

      {/* Preview on dark + light backgrounds */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="aspect-[3/1] rounded-xl border border-white/10 flex items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(135deg,#0a0514,#1a0a2e)" }}
        >
          {displayUrl ? (
            <img src={displayUrl} alt="Dark preview" className="max-h-full max-w-full object-contain p-3" />
          ) : (
            <span className="text-slate-500 text-xs">Dark BG preview</span>
          )}
        </div>
        <div
          className="aspect-[3/1] rounded-xl border border-slate-300/40 flex items-center justify-center overflow-hidden bg-white"
          style={{
            backgroundImage:
              "linear-gradient(45deg,#e5e7eb 25%,transparent 25%),linear-gradient(-45deg,#e5e7eb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e7eb 75%),linear-gradient(-45deg,transparent 75%,#e5e7eb 75%)",
            backgroundSize: "16px 16px",
            backgroundPosition: "0 0,0 8px,8px -8px,-8px 0",
          }}
        >
          {displayUrl ? (
            <img src={displayUrl} alt="Light preview" className="max-h-full max-w-full object-contain p-3" />
          ) : (
            <span className="text-slate-500 text-xs">Transparency preview</span>
          )}
        </div>
      </div>

      {/* File picker */}
      <div className="space-y-2">
        <Label className="text-slate-300 text-xs">নতুন লোগো নির্বাচন করুন</Label>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
          onChange={(e) => handlePick(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-fuchsia-600 file:text-white file:cursor-pointer hover:file:bg-fuchsia-500"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={handleUploadOriginal}
          disabled={!pickedFile || uploading || processing}
          variant="secondary"
          className="gap-2"
        >
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          মূল আপলোড
        </Button>
        <Button
          onClick={handleAIAdjust}
          disabled={!pickedFile || uploading || processing}
          className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 gap-2"
        >
          {processing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
          AI ব্যাকগ্রাউন্ড সরিয়ে ফিট করো
        </Button>
        {value && (
          <Button onClick={clearLogo} variant="outline" className="gap-2 border-red-500/40 text-red-300 hover:bg-red-500/10">
            <Trash2 size={15} /> ক্লিয়ার
          </Button>
        )}
      </div>

      {/* Direct URL */}
      <div className="space-y-2">
        <Label className="text-slate-300 text-xs">অথবা ডাইরেক্ট ইমেজ URL</Label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="bg-slate-900 border-slate-600 text-white font-mono text-xs"
        />
      </div>

      <Button onClick={saveToSettings} disabled={saving} className="bg-teal-600 hover:bg-teal-500 gap-2 w-full sm:w-auto">
        <Save size={15} /> {saving ? "সংরক্ষণ হচ্ছে..." : "Site Logo সংরক্ষণ করুন"}
      </Button>

      <p className="text-[11px] text-slate-500 leading-relaxed">
        💡 টিপ: "AI ব্যাকগ্রাউন্ড সরিয়ে ফিট করো" বোতামটি লোগোর ব্যাকগ্রাউন্ড স্বয়ংক্রিয়ভাবে স্বচ্ছ (transparent) করে দেবে, যাতে এটি যেকোনো ব্যাকগ্রাউন্ডে নিখুঁতভাবে ফিট হয়। প্রথমবার একটু সময় লাগবে (AI মডেল ডাউনলোড)।
      </p>
    </div>
  );
};

export default SiteLogoManager;
