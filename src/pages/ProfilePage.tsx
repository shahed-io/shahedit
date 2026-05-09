import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Phone, FileText, LogOut, Save, Camera, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

interface Profile {
  full_name: string | null;
  username: string | null;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>({ full_name: "", username: "", phone: "", bio: "", avatar_url: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    supabase.from("profiles").select("*").eq("user_id", user.id).single()
      .then(({ data }) => {
        if (data) setProfile({
          full_name: data.full_name ?? "",
          username: (data as Profile & { username?: string }).username ?? "",
          phone: (data as Profile & { phone?: string }).phone ?? "",
          bio: (data as Profile & { bio?: string }).bio ?? "",
          avatar_url: data.avatar_url ?? "",
        });
        setLoading(false);
      });
  }, [user, navigate]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        user_id: user.id,
        full_name: profile.full_name,
        // @ts-ignore - extra columns added via migration
        username: profile.username,
        phone: profile.phone,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      if (error) throw error;
      toast.success("প্রোফাইল সংরক্ষিত হয়েছে!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "সংরক্ষণ ব্যর্থ হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `avatars/${user.id}.${ext}`;
      const { error: upErr } = await supabase.storage.from("cms-media").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("cms-media").getPublicUrl(path);
      setProfile(p => ({ ...p, avatar_url: publicUrl }));
      toast.success("ছবি আপলোড হয়েছে");
    } catch (err: unknown) {
      toast.error("ছবি আপলোড ব্যর্থ");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("লগআউট হয়েছে");
    navigate("/");
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const initials = profile.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || user?.email?.[0].toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-foreground">আমার প্রোফাইল</h1>
              <p className="text-foreground/40 text-sm mt-1">{user?.email}</p>
            </div>
            <motion.button onClick={handleLogout} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'hsl(0,84%,70%)' }}>
              <LogOut size={14} /> লগআউট
            </motion.button>
          </div>

          {/* Profile card */}
          <div className="rounded-3xl p-8 space-y-6"
            style={{ background: 'rgba(14,11,28,0.80)', border: '1px solid rgba(168,85,247,0.15)', backdropFilter: 'blur(20px)' }}>

            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="relative">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="avatar" className="w-20 h-20 rounded-2xl object-cover ring-2 ring-primary/30" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
                    style={{ background: 'linear-gradient(135deg, hsl(270,92%,65%), hsl(320,90%,48%))' }}>
                    {initials}
                  </div>
                )}
                <label className="absolute -bottom-2 -right-2 w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                  style={{ background: 'linear-gradient(135deg, hsl(270,92%,65%), hsl(320,90%,48%))', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                  {uploading ? <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <Camera size={13} className="text-white" />}
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                </label>
              </div>
              <div>
                <p className="text-foreground font-bold text-lg">{profile.full_name || "নাম দিন"}</p>
                <p className="text-foreground/40 text-sm">{user?.email}</p>
                <p className="text-xs mt-1" style={{ color: 'hsl(155,70%,50%)' }}>● Active</p>
              </div>
            </div>

            <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

            {/* Form fields */}
            <div className="grid gap-4">
              {[
                { icon: User, label: "পুরো নাম", key: "full_name", placeholder: "আপনার পুরো নাম", type: "text" },
                { icon: User, label: "ইউজারনেম", key: "username", placeholder: "@username", type: "text" },
                { icon: Phone, label: "ফোন নম্বর", key: "phone", placeholder: "01XXXXXXXXX", type: "tel" },
              ].map(({ icon: Icon, label, key, placeholder, type }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-xs text-foreground/40 font-medium">{label}</label>
                  <div className="relative">
                    <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/30 pointer-events-none" />
                    <input type={type} value={(profile as unknown as Record<string, string | null>)[key] ?? ""}
                      onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-foreground placeholder:text-foreground/25 focus:outline-none transition-all"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                      onFocus={e => e.target.style.borderColor = 'hsl(270,92%,65%)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'} />
                  </div>
                </div>
              ))}

              <div className="space-y-1.5">
                <label className="text-xs text-foreground/40 font-medium">বায়ো</label>
                <div className="relative">
                  <FileText size={14} className="absolute left-3.5 top-3.5 text-foreground/30 pointer-events-none" />
                  <textarea value={profile.bio ?? ""} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                    placeholder="আপনার সম্পর্কে কিছু লিখুন..." rows={3}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-foreground placeholder:text-foreground/25 focus:outline-none transition-all resize-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                    onFocus={e => e.target.style.borderColor = 'hsl(270,92%,65%)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'} />
                </div>
              </div>
            </div>

            <motion.button onClick={handleSave} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, hsl(270,92%,65%), hsl(320,90%,48%))', boxShadow: '0 8px 30px hsl(258,90%,66%,0.25)' }}>
              {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Save size={15} /> প্রোফাইল সেভ করুন</>}
            </motion.button>
          </div>
        </motion.div>
      </div>
      <SiteFooter />
    </div>
  );
}
