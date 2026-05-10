import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage, AdminPageHeader, GlassCard } from "@/components/admin/ui";
import { History, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminActivityLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(200);
    setLogs(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  return (
    <AdminPage>
      <AdminPageHeader
        title="Activity Log"
        subtitle="Admin actions ও system changes এর সম্পূর্ণ trail"
        icon={History}
        actions={<Button variant="outline" onClick={load}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>}
      />

      <GlassCard className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-amber-400/10 text-amber-300/70 text-xs uppercase tracking-wider">
              <th className="text-left p-3">When</th>
              <th className="text-left p-3">Action</th>
              <th className="text-left p-3">Entity</th>
              <th className="text-left p-3">Actor</th>
              <th className="text-left p-3">Meta</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="text-center p-8 text-muted-foreground text-xs">Loading...</td></tr>}
            {!loading && logs.length === 0 && <tr><td colSpan={5} className="text-center p-8 text-muted-foreground text-xs">No activity logged yet</td></tr>}
            {logs.map((l) => (
              <tr key={l.id} className="border-b border-amber-400/5 hover:bg-amber-400/5">
                <td className="p-3 text-xs text-amber-300/80">{new Date(l.created_at).toLocaleString()}</td>
                <td className="p-3"><span className="text-xs px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">{l.action}</span></td>
                <td className="p-3 text-xs text-amber-100">{l.entity}{l.entity_id ? ` · ${String(l.entity_id).slice(0, 8)}` : ""}</td>
                <td className="p-3 text-xs font-mono text-muted-foreground">{String(l.actor_id).slice(0, 8)}</td>
                <td className="p-3 text-xs font-mono text-muted-foreground max-w-xs truncate">{l.meta ? JSON.stringify(l.meta) : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </AdminPage>
  );
}
