import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { SiteSetting } from "@/lib/supabase-types";

const groups = ["general", "social", "branding", "seo"];

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
    const currentGroup = settings.filter(s => s.group_name === activeGroup);
    await Promise.all(
      currentGroup.map(s =>
        supabase.from("site_settings").update({ value: values[s.key] ?? "" }).eq("id", s.id)
      )
    );
    setSaving(false);
    toast.success("Settings saved!");
  };

  const groupSettings = settings.filter(s => s.group_name === activeGroup);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Site Settings</h1>
          <p className="text-slate-400 text-sm">Manage your website configuration</p>
        </div>
        <Button onClick={saveSettings} disabled={saving} className="bg-teal-600 hover:bg-teal-500 gap-2">
          <Save size={15} /> {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {groups.map(g => (
          <button key={g} onClick={() => setActiveGroup(g)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              activeGroup === g ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

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
    </div>
  );
};

export default AdminSettings;
