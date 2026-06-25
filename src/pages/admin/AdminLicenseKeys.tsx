import { useState } from "react";
import { KeyRound, Plus, Trash2, Ban } from "lucide-react";
import { AdminPage, AdminPageHeader, GlassCard } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useLicenseKeys, useBulkInsertLicenseKeys, useDeleteLicenseKey, useRevokeLicenseKey, useServicePackagesLite } from "@/hooks/useProductMgmt";

export default function AdminLicenseKeys() {
  const { data: pkgs = [] } = useServicePackagesLite();
  const [filterPkg, setFilterPkg] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const { data: keys = [], isLoading } = useLicenseKeys({ package_id: filterPkg || undefined, status: filterStatus || undefined });
  const bulkAdd = useBulkInsertLicenseKeys();
  const del = useDeleteLicenseKey();
  const revoke = useRevokeLicenseKey();

  const [addPkgId, setAddPkgId] = useState("");
  const [bulk, setBulk] = useState("");
  const submit = async () => {
    if (!addPkgId) return toast.error("Package নির্বাচন করুন");
    const lines = bulk.split(/\r?\n|,/).map((s) => s.trim()).filter(Boolean);
    if (!lines.length) return toast.error("Key দরকার");
    try {
      const r = await bulkAdd.mutateAsync({ package_id: addPkgId, keys: lines });
      toast.success(`${r.inserted}টি key যোগ হয়েছে`); setBulk("");
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <AdminPage>
      <AdminPageHeader title="License Keys" subtitle="Pool থেকে order verify হলে auto-assign হবে" icon={KeyRound} />
      <GlassCard className="p-4 mb-4">
        <h3 className="font-semibold mb-3">Bulk add keys</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <Label>Package</Label>
            <Select value={addPkgId} onValueChange={setAddPkgId}>
              <SelectTrigger><SelectValue placeholder="Select package" /></SelectTrigger>
              <SelectContent className="bg-popover max-h-72">{pkgs.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Keys (এক লাইনে একটি, বা কমা দিয়ে)</Label>
            <Textarea rows={6} value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder="XXXX-YYYY-ZZZZ&#10;AAAA-BBBB-CCCC" />
          </div>
        </div>
        <Button className="mt-3" onClick={submit} disabled={bulkAdd.isPending}><Plus className="w-4 h-4" /> {bulkAdd.isPending ? "Adding…" : "Add Keys"}</Button>
      </GlassCard>
      <GlassCard className="p-4">
        <div className="flex flex-wrap gap-3 mb-3">
          <div className="min-w-[220px]">
            <Label>Filter by package</Label>
            <Select value={filterPkg || "all"} onValueChange={(v) => setFilterPkg(v === "all" ? "" : v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover max-h-72"><SelectItem value="all">All</SelectItem>{pkgs.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="min-w-[180px]">
            <Label>Status</Label>
            <Select value={filterStatus || "all"} onValueChange={(v) => setFilterStatus(v === "all" ? "" : v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover"><SelectItem value="all">All</SelectItem><SelectItem value="available">Available</SelectItem><SelectItem value="assigned">Assigned</SelectItem><SelectItem value="revoked">Revoked</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted-foreground border-b border-border/40"><th className="p-2">Key</th><th className="p-2">Package</th><th className="p-2">Status</th><th className="p-2">Assigned</th><th className="p-2 text-right">Actions</th></tr></thead>
              <tbody>
                {keys.map((k: any) => (
                  <tr key={k.id} className="border-b border-border/20 hover:bg-primary/5">
                    <td className="p-2 font-mono text-xs">{k.key_value}</td>
                    <td className="p-2 text-xs">{k.package?.title ?? "—"}</td>
                    <td className="p-2"><Badge variant={k.status === "available" ? "default" : k.status === "assigned" ? "secondary" : "destructive"}>{k.status}</Badge></td>
                    <td className="p-2 text-xs">{k.assigned_at ? new Date(k.assigned_at).toLocaleDateString() : "—"}</td>
                    <td className="p-2 text-right">
                      {k.status !== "revoked" && <Button variant="ghost" size="icon" title="Revoke" onClick={async () => { await revoke.mutateAsync(k.id); toast.success("Revoked"); }}><Ban className="w-4 h-4 text-amber-400" /></Button>}
                      <Button variant="ghost" size="icon" onClick={async () => { if (confirm("Delete?")) { await del.mutateAsync(k.id); toast.success("Deleted"); } }}><Trash2 className="w-4 h-4 text-rose-400" /></Button>
                    </td>
                  </tr>
                ))}
                {!keys.length && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">কোনো key নেই</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </AdminPage>
  );
}
