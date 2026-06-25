import { Download, Lock, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMyDownloads } from "@/hooks/useProductMgmt";

export default function MyDownloadsSection() {
  const { data: rows = [], isLoading, refetch } = useMyDownloads();

  const download = async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("digital-download", { body: { download_id: id } });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const url = (data as any).url; const name = (data as any).file_name || "download";
      if (!url) throw new Error("Signed URL missing");
      const a = document.createElement("a"); a.href = url; a.download = name; a.click();
      setTimeout(() => refetch(), 800);
    } catch (e: any) { toast.error(e.message ?? "Download failed"); }
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!rows.length) return (
    <div className="text-center py-12">
      <Lock className="w-10 h-10 mx-auto mb-3 text-muted-foreground/60" />
      <p className="text-muted-foreground">আপনার কোনো digital download নেই</p>
      <p className="text-xs text-muted-foreground mt-1">Order verify হলে এখানে দেখাবে</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {rows.map((r: any) => {
        const expired = r.expires_at && new Date(r.expires_at) < new Date();
        const limitReached = (r.download_count ?? 0) >= (r.download_limit ?? 0);
        const disabled = expired || limitReached || !r.file_id;
        return (
          <div key={r.id} className="p-4 rounded-xl border border-border/40 bg-card/50 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h4 className="font-semibold">{r.package?.title}</h4>
              <p className="text-xs text-muted-foreground">{r.file?.file_name ?? "—"}</p>
              {r.license?.key_value && (
                <p className="text-xs mt-1">License: <span className="font-mono">{r.license.key_value}</span></p>
              )}
              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground">
                <Badge variant="outline">Downloads: {r.download_count}/{r.download_limit}</Badge>
                {r.expires_at && <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(r.expires_at).toLocaleDateString()}</span>}
                {expired && <Badge variant="destructive">Expired</Badge>}
                {limitReached && !expired && <Badge variant="destructive">Limit reached</Badge>}
              </div>
            </div>
            <Button onClick={() => download(r.id)} disabled={disabled}><Download className="w-4 h-4" /> Download</Button>
          </div>
        );
      })}
    </div>
  );
}
