import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Wallet, Save, ToggleLeft, ToggleRight } from "lucide-react";

interface SettingRow { key: string; value: string }

const FIELDS: { key: string; label: string; type: "toggle" | "text" | "number" | "textarea"; help?: string }[] = [
  { key: "wallet_topup_enabled",       label: "ওয়ালেট টপ-আপ সক্রিয়",            type: "toggle", help: "সাইটে Wallet Top-up option দেখানো হবে কি না" },
  { key: "wallet_topup_min",           label: "সর্বনিম্ন amount (BDT)",            type: "number" },
  { key: "wallet_topup_max",           label: "সর্বোচ্চ amount (BDT)",             type: "number" },
  { key: "wallet_topup_quick_amounts", label: "Quick amount preset (কমা-দিয়ে)",   type: "text",   help: "যেমন: 500,1000,2000,5000" },
  { key: "wallet_topup_note",          label: "Checkout-এ দেখানো নোট",            type: "textarea" },
];

export const WalletSettingsManager = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key,value")
        .in("key", FIELDS.map(f => f.key));
      const map: Record<string, string> = {};
      (data as SettingRow[] | null)?.forEach(r => { map[r.key] = r.value; });
      setValues(map);
      setLoading(false);
    })();
  }, []);

  const update = (key: string, v: string) => setValues(prev => ({ ...prev, [key]: v }));

  const save = async () => {
    setSaving(true);
    const rows = FIELDS.map(f => ({ key: f.key, value: values[f.key] ?? "" }));
    const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
    setSaving(false);
    if (error) { toast.error("সেভ ব্যর্থ হয়েছে: " + error.message); return; }
    toast.success("ওয়ালেট সেটিংস সেভ হয়েছে");
  };

  if (loading) {
    return <div className="rounded-2xl border border-white/10 p-6 text-sm text-foreground/60">লোড হচ্ছে...</div>;
  }

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.04] to-fuchsia-500/[0.04] p-6 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
            <Wallet size={18} />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Wallet Top-up Settings</h3>
            <p className="text-xs text-foreground/55">শুধু bKash Online (PGW) এর মাধ্যমে টপ-আপ হবে</p>
          </div>
        </div>
        <button onClick={save} disabled={saving}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center gap-2 disabled:opacity-60">
          <Save size={14} /> {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {FIELDS.map(f => {
          const v = values[f.key] ?? "";
          if (f.type === "toggle") {
            const on = v === "true";
            return (
              <div key={f.key} className="sm:col-span-2 rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{f.label}</p>
                  {f.help && <p className="text-[11px] text-foreground/50 mt-0.5">{f.help}</p>}
                </div>
                <button onClick={() => update(f.key, on ? "false" : "true")}
                  className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${on ? "bg-emerald-500/15 text-emerald-400" : "bg-foreground/10 text-foreground/60"}`}>
                  {on ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  {on ? "সক্রিয়" : "নিষ্ক্রিয়"}
                </button>
              </div>
            );
          }
          if (f.type === "textarea") {
            return (
              <div key={f.key} className="sm:col-span-2">
                <label className="text-xs font-semibold text-foreground/65 mb-1.5 block">{f.label}</label>
                <textarea value={v} onChange={e => update(f.key, e.target.value)} rows={2}
                  className="w-full rounded-xl px-3 py-2.5 text-sm bg-white/5 border border-white/10 text-foreground focus:outline-none focus:border-fuchsia-400/60 resize-none" />
              </div>
            );
          }
          return (
            <div key={f.key}>
              <label className="text-xs font-semibold text-foreground/65 mb-1.5 block">{f.label}</label>
              <input type={f.type === "number" ? "number" : "text"} value={v}
                onChange={e => update(f.key, e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm bg-white/5 border border-white/10 text-foreground focus:outline-none focus:border-fuchsia-400/60" />
              {f.help && <p className="text-[11px] text-foreground/45 mt-1">{f.help}</p>}
            </div>
          );
        })}
      </div>

      <div className="rounded-xl bg-pink-500/[0.07] border border-pink-500/20 p-3 text-[12px] text-foreground/70">
        ℹ️ বর্তমানে wallet top-up শুধু <strong className="text-pink-300">bKash Online (PGW)</strong> দিয়ে কাজ করবে। অন্য মেথড পরে যোগ করা যাবে।
      </div>
    </div>
  );
};
