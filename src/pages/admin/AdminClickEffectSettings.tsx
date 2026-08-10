import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Save, MousePointer2, Settings2, Image as ImageIcon, Power, Sliders, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ClickEffectConfig } from "@/hooks/useClickEffectSettings";

const AdminClickEffectSettings = () => {
  const [config, setConfig] = useState<ClickEffectConfig>({
    enabled: true,
    type: 'logo',
    opacity: 0.25,
    scale: 1.2
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingId, setSettingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("*")
        .eq("key", "click_effect_config")
        .maybeSingle();

      if (data) {
        setSettingId(data.id);
        if (data.value) {
          try {
            setConfig(JSON.parse(data.value));
          } catch (e) {}
        }
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const value = JSON.stringify(config);

    if (settingId) {
      await supabase
        .from("site_settings")
        .update({ value })
        .eq("id", settingId);
    } else {
      const { data } = await supabase
        .from("site_settings")
        .insert({
          key: "click_effect_config",
          value,
          group_name: "appearance",
          label: "Click Effect Configuration",
          type: "json"
        })
        .select()
        .single();
      if (data) setSettingId(data.id);
    }

    // Update local storage and dispatch event for immediate effect
    localStorage.setItem('click_effect_config', value);
    window.dispatchEvent(new Event('click-effect-settings-updated'));
    
    setSaving(false);
    toast.success("Click effect settings saved!");
  };

  if (loading) return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-32 bg-slate-800/50 rounded-2xl animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Master Toggle */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${config.enabled ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            <Power className={config.enabled ? 'text-green-400' : 'text-red-400'} size={24} />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Click Animation</h3>
            <p className="text-slate-400 text-sm">ওয়েবসাইটে মাউস ক্লিকে অ্যানিমেশন চালু বা বন্ধ করুন</p>
          </div>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
        />
      </div>

      <div className={`space-y-6 transition-all duration-300 ${config.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale'}`}>
        {/* Style Selection */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3">
             <Settings2 className="text-purple-400" size={20} />
             <h3 className="text-white font-bold text-base">Animation Style</h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { id: 'logo', label: 'Brand Logo', icon: <Sparkles size={16} /> },
              { id: 'apple', label: 'Apple Style', icon: <MousePointer2 size={16} /> },
              { id: 'ripple', label: 'Soft Ripple', icon: <Sliders size={16} /> },
              { id: 'custom_sticker', label: 'Custom Sticker', icon: <ImageIcon size={16} /> },
            ].map((style) => (
              <button
                key={style.id}
                onClick={() => setConfig(prev => ({ ...prev, type: style.id as any }))}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center ${
                  config.type === style.id 
                    ? 'border-purple-500 bg-purple-500/10 text-white' 
                    : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600'
                }`}
              >
                {style.icon}
                <span className="text-xs font-semibold">{style.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Sticker Input */}
        {config.type === 'custom_sticker' && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-4"
          >
            <div className="space-y-2">
              <Label className="text-slate-300">Sticker Image URL</Label>
              <Input
                value={config.customStickerUrl || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, customStickerUrl: e.target.value }))}
                placeholder="https://example.com/sticker.png"
                className="bg-slate-900 border-slate-600 text-white"
              />
              <p className="text-slate-500 text-xs italic">
                Transparent background PNG বা SVG ইমেজ ব্যবহার করার পরামর্শ দিচ্ছি।
              </p>
            </div>
          </motion.div>
        )}

        {/* Customization Sliders */}
        {(config.type === 'logo' || config.type === 'custom_sticker') && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label className="text-slate-300">Opacity (স্বচ্ছতা)</Label>
                <span className="text-purple-400 font-mono text-xs">{config.opacity}</span>
              </div>
              <Slider
                value={[config.opacity]}
                min={0.05}
                max={1}
                step={0.05}
                onValueChange={([val]) => setConfig(prev => ({ ...prev, opacity: val }))}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <Label className="text-slate-300">Scale (আকার)</Label>
                <span className="text-purple-400 font-mono text-xs">{config.scale}x</span>
              </div>
              <Slider
                value={[config.scale]}
                min={0.5}
                max={3}
                step={0.1}
                onValueChange={([val]) => setConfig(prev => ({ ...prev, scale: val }))}
              />
            </div>
          </div>
        )}
      </div>

      <Button 
        onClick={handleSave} 
        disabled={saving} 
        className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 gap-2 h-12 rounded-xl"
      >
        <Save size={18} />
        {saving ? "সংরক্ষণ হচ্ছে..." : "অ্যানিমেশন সেটিংস সংরক্ষণ করুন"}
      </Button>
    </div>
  );
};

export default AdminClickEffectSettings;
