import { useState } from "react";
import { FileDown, Upload, Trash2 } from "lucide-react";
import { AdminPage, AdminPageHeader, GlassCard } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useDigitalFiles, useUploadDigitalFile, useDeleteDigitalFile, useServicePackagesLite } from "@/hooks/useProductMgmt";

export default function AdminDigitalFiles() {
  const { data: pkgs = [] } = useServicePackagesLite();
  const [pkgId, setPkgId] = useState<string>("");
  const { data: files = [], isLoading } = useDigitalFiles();
  const upload = useUploadDigitalFile();
  const del = useDeleteDigitalFile();
  const [file, setFile] = useState<File | null>(null);
  const [limit, setLimit] = useState(5);
  const [days, setDays] = useState(30);
  const [version, setVersion] = useState("");

  const doUpload = async () => {
    if (!pkgId) return toast.error("Package নির্বাচন করুন");
    if (!file) return toast.error("File select করুন");
    try {
      await upload.mutateAsync({ package_id: pkgId, file, download_limit: limit, expiry_days: days, version });
      toast.success("Uploaded"); setFile(null); setVersion("");
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <AdminPage>
      <AdminPageHeader title="Digital Files" subtitle="Product-এর জন্য downloadable file + limit + expiry" icon={FileDown} />
      <GlassCard className="p-4 mb-4">
        <h3 className="font-semibold mb-3">Upload new file</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <Label>Product / Package</Label>
            <Select value={pkgId} onValueChange={setPkgId}>
              <SelectTrigger><SelectValue placeholder="Select package" /></SelectTrigger>
              <SelectContent className="bg-popover max-h-72">{pkgs.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>File</Label><Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
          <div><Label>Download Limit</Label><Input type="number" value={limit} onChange={(e) => setLimit(Number(e.target.value))} /></div>
          <div><Label>Expiry Days (after assignment)</Label><Input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} /></div>
          <div className="md:col-span-2"><Label>Version (optional)</Label><Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="e.g. 1.0.0" /></div>
        </div>
        <Button className="mt-3" onClick={doUpload} disabled={upload.isPending}><Upload className="w-4 h-4" /> {upload.isPending ? "Uploading…" : "Upload"}</Button>
      </GlassCard>
      <GlassCard className="p-4">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted-foreground border-b border-border/40"><th className="p-2">Package</th><th className="p-2">File</th><th className="p-2">Size</th><th className="p-2">Version</th><th className="p-2">Limit</th><th className="p-2">Expiry</th><th className="p-2">Status</th><th className="p-2 text-right">Actions</th></tr></thead>
              <tbody>
                {files.map((f: any) => (
                  <tr key={f.id} className="border-b border-border/20 hover:bg-primary/5">
                    <td className="p-2 text-xs">{f.package?.title ?? "—"}</td>
                    <td className="p-2">{f.file_name}</td>
                    <td className="p-2 text-xs">{f.file_size_bytes ? `${(f.file_size_bytes/1024/1024).toFixed(2)} MB` : "—"}</td>
                    <td className="p-2 text-xs">{f.version ?? "—"}</td>
                    <td className="p-2">{f.download_limit}</td>
                    <td className="p-2">{f.expiry_days}d</td>
                    <td className="p-2"><Badge variant={f.is_active ? "default" : "secondary"}>{f.is_active ? "Active" : "Off"}</Badge></td>
                    <td className="p-2 text-right">
                      <Button variant="ghost" size="icon" onClick={async () => { if (confirm("Delete?")) { await del.mutateAsync({ id: f.id, storage_path: f.storage_path }); toast.success("Deleted"); } }}><Trash2 className="w-4 h-4 text-rose-400" /></Button>
                    </td>
                  </tr>
                ))}
                {!files.length && <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">কোনো file নেই</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </AdminPage>
  );
}
