import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Save, TrendingUp, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Row {
  id: string;
  term: string;
  sort_order: number;
  is_active: boolean;
}

export default function AdminPopularSearches() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTerm, setNewTerm] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("popular_searches")
      .select("id,term,sort_order,is_active")
      .order("sort_order", { ascending: true });
    if (error) toast.error(error.message);
    setRows((data || []) as Row[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    const t = newTerm.trim();
    if (!t) return;
    const next = (rows[rows.length - 1]?.sort_order || 0) + 1;
    const { error } = await supabase.from("popular_searches").insert({ term: t, sort_order: next });
    if (error) return toast.error(error.message);
    setNewTerm("");
    toast.success("যোগ করা হয়েছে");
    load();
  };

  const update = (id: string, patch: Partial<Row>) => {
    setRows(rs => rs.map(r => r.id === id ? { ...r, ...patch } : r));
  };

  const saveRow = async (r: Row) => {
    setSaving(true);
    const { error } = await supabase
      .from("popular_searches")
      .update({ term: r.term, sort_order: r.sort_order, is_active: r.is_active })
      .eq("id", r.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("সংরক্ষিত");
  };

  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("popular_searches").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("মুছে ফেলা হয়েছে");
    load();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp size={22} className="text-purple-400" /> জনপ্রিয় সার্চ
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          সার্চ dropdown-এ "জনপ্রিয় সার্চ" section-এ এই keyword গুলো দেখানো হবে।
        </p>
      </div>

      {/* Add new */}
      <div className="flex gap-2 mb-6 p-4 bg-slate-800/60 border border-slate-700 rounded-xl">
        <input
          value={newTerm}
          onChange={e => setNewTerm(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder="নতুন keyword (যেমন: Windows 11)"
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500"
        />
        <button
          onClick={add}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:opacity-90"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="animate-spin" size={16} /> Loading...
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-12 text-slate-400 border border-dashed border-slate-700 rounded-xl">
          কোনো keyword যোগ করা হয়নি
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map(r => (
            <li key={r.id} className="flex items-center gap-2 p-3 bg-slate-800/60 border border-slate-700 rounded-xl">
              <input
                type="number"
                value={r.sort_order}
                onChange={e => update(r.id, { sort_order: parseInt(e.target.value) || 0 })}
                className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-sm text-center"
                title="Sort order"
              />
              <input
                value={r.term}
                onChange={e => update(r.id, { term: e.target.value })}
                className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-sm"
              />
              <button
                onClick={() => update(r.id, { is_active: !r.is_active })}
                className={`p-2 rounded-lg ${r.is_active ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-slate-400"}`}
                title={r.is_active ? "Active" : "Hidden"}
              >
                {r.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              <button
                onClick={() => saveRow(r)}
                disabled={saving}
                className="p-2 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/30"
                title="Save"
              >
                <Save size={16} />
              </button>
              <button
                onClick={() => remove(r.id)}
                className="p-2 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
