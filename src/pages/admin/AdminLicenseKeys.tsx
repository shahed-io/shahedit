import { useMemo, useState } from "react";
import { KeyRound, Plus, Trash2, Ban, UserPlus, Send, History, Upload, Search, Download } from "lucide-react";
import { AdminPage, AdminPageHeader, GlassCard } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  useLicenseKeys,
  useBulkInsertLicenseKeys,
  useDeleteLicenseKey,
  useRevokeLicenseKey,
  useServicePackagesLite,
  useLicensePoolStats,
  useLicenseHistory,
  useManualAssignLicense,
  useResendLicense,
} from "@/hooks/useProductMgmt";

export default function AdminLicenseKeys() {
  const { data: pkgs = [] } = useServicePackagesLite();
  const [filterPkg, setFilterPkg] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const { data: keys = [], isLoading } = useLicenseKeys({
    package_id: filterPkg || undefined,
    status: filterStatus || undefined,
  });
  const { data: stats = [] } = useLicensePoolStats(filterPkg || undefined);
  const bulkAdd = useBulkInsertLicenseKeys();
  const del = useDeleteLicenseKey();
  const revoke = useRevokeLicenseKey();
  const assign = useManualAssignLicense();
  const resend = useResendLicense();

  const [addPkgId, setAddPkgId] = useState("");
  const [bulk, setBulk] = useState("");
  const [historyKey, setHistoryKey] = useState<any>(null);
  const [assignKey, setAssignKey] = useState<any>(null);
  const [assignEmail, setAssignEmail] = useState("");
  const [assignNote, setAssignNote] = useState("");
  const { data: history = [] } = useLicenseHistory(historyKey?.id);

  const filteredKeys = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return keys;
    return (keys as any[]).filter((k) =>
      [k.key_value, k.assigned_to_email, k.package?.title].some((v) => v && String(v).toLowerCase().includes(q)),
    );
  }, [keys, search]);

  const submit = async () => {
    if (!addPkgId) return toast.error("Package নির্বাচন করুন");
    const lines = bulk.split(/\r?\n|,/).map((s) => s.trim()).filter(Boolean);
    if (!lines.length) return toast.error("Key দরকার");
    try {
      const r = await bulkAdd.mutateAsync({ package_id: addPkgId, keys: lines });
      toast.success(`${r.inserted}টি key যোগ হয়েছে`);
      setBulk("");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const onFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!addPkgId) {
      toast.error("আগে Package নির্বাচন করুন");
      e.target.value = "";
      return;
    }
    const text = await f.text();
    const lines = text
      .split(/\r?\n/)
      .map((s) => s.split(",")[0].trim())
      .filter((s) => s && !s.toLowerCase().startsWith("key"));
    if (!lines.length) return toast.error("ফাইলে কোনো key নেই");
    try {
      const r = await bulkAdd.mutateAsync({ package_id: addPkgId, keys: lines });
      toast.success(`${r.inserted}টি key import হয়েছে`);
    } catch (err: any) {
      toast.error(err.message);
    }
    e.target.value = "";
  };

  const exportCsv = () => {
    const rows = [["key_value", "package", "status", "assigned_email", "activations", "assigned_at"]];
    (filteredKeys as any[]).forEach((k) =>
      rows.push([
        k.key_value,
        k.package?.title ?? "",
        k.status,
        k.assigned_to_email ?? "",
        `${k.activation_count}/${k.max_activations}`,
        k.assigned_at ?? "",
      ]),
    );
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `license-keys-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doAssign = async () => {
    if (!assignKey) return;
    if (!assignEmail) return toast.error("Email দরকার");
    try {
      await assign.mutateAsync({ key_id: assignKey.id, user_email: assignEmail, note: assignNote || undefined });
      toast.success("Assigned");
      setAssignKey(null);
      setAssignEmail("");
      setAssignNote("");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const doResend = async (k: any) => {
    const to = k.assigned_to_email || prompt("Recipient email?") || "";
    if (!to) return;
    try {
      await resend.mutateAsync({
        key_id: k.id,
        to_email: to,
        template_data: {
          productTitle: k.package?.title ?? "Product",
          licenseKey: k.key_value,
          orderNumber: k.order_id ?? "",
          activations: String(k.max_activations ?? 1),
        },
      });
      toast.success("License email পাঠানো হয়েছে");
    } catch (e: any) {
      toast.error(e.message ?? "Send failed");
    }
  };

  const totals = useMemo(() => {
    return (stats as any[]).reduce(
      (a, s) => ({
        total: a.total + Number(s.total),
        available: a.available + Number(s.available),
        assigned: a.assigned + Number(s.assigned),
        revoked: a.revoked + Number(s.revoked),
      }),
      { total: 0, available: 0, assigned: 0, revoked: 0 },
    );
  }, [stats]);

  return (
    <AdminPage>
      <AdminPageHeader title="License Manager" subtitle="Pool, auto-assign, manual assign, resend, history & activation tracking" icon={KeyRound} />

      {/* Pool stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Total Keys", value: totals.total, color: "from-primary/20 to-primary/5" },
          { label: "Available", value: totals.available, color: "from-emerald-500/20 to-emerald-500/5" },
          { label: "Assigned/Used", value: totals.assigned, color: "from-blue-500/20 to-blue-500/5" },
          { label: "Revoked", value: totals.revoked, color: "from-rose-500/20 to-rose-500/5" },
        ].map((s) => (
          <GlassCard key={s.label} className={`p-4 bg-gradient-to-br ${s.color}`}>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </GlassCard>
        ))}
      </div>

      <Tabs defaultValue="pool" className="w-full">
        <TabsList>
          <TabsTrigger value="pool">Pool by Package</TabsTrigger>
          <TabsTrigger value="keys">All Keys</TabsTrigger>
          <TabsTrigger value="add">Bulk Add / Import</TabsTrigger>
        </TabsList>

        <TabsContent value="pool" className="mt-4">
          <GlassCard className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border/40">
                    <th className="p-2">Package</th>
                    <th className="p-2">Total</th>
                    <th className="p-2">Available</th>
                    <th className="p-2">Assigned</th>
                    <th className="p-2">Revoked</th>
                    <th className="p-2 min-w-[160px]">Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats as any[]).map((s) => {
                    const used = Number(s.assigned) + Number(s.revoked);
                    const pct = s.total > 0 ? Math.round((used / Number(s.total)) * 100) : 0;
                    return (
                      <tr key={s.package_id} className="border-b border-border/20">
                        <td className="p-2">{s.package_title ?? "—"}</td>
                        <td className="p-2">{s.total}</td>
                        <td className="p-2 text-emerald-400">{s.available}</td>
                        <td className="p-2 text-blue-400">{s.assigned}</td>
                        <td className="p-2 text-rose-400">{s.revoked}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <Progress value={pct} className="h-2" />
                            <span className="text-xs">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!stats.length && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-muted-foreground">
                        কোনো pool data নেই
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="keys" className="mt-4">
          <GlassCard className="p-4">
            <div className="flex flex-wrap gap-3 mb-3 items-end">
              <div className="min-w-[220px]">
                <Label>Package</Label>
                <Select value={filterPkg || "all"} onValueChange={(v) => setFilterPkg(v === "all" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover max-h-72">
                    <SelectItem value="all">All</SelectItem>
                    {pkgs.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-[160px]">
                <Label>Status</Label>
                <Select value={filterStatus || "all"} onValueChange={(v) => setFilterStatus(v === "all" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-8" placeholder="Key, email, package…" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
              </div>
              <Button variant="outline" onClick={exportCsv}>
                <Download className="w-4 h-4" /> Export CSV
              </Button>
            </div>

            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b border-border/40">
                      <th className="p-2">Key</th>
                      <th className="p-2">Package</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Assigned To</th>
                      <th className="p-2">Activations</th>
                      <th className="p-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(filteredKeys as any[]).map((k) => (
                      <tr key={k.id} className="border-b border-border/20 hover:bg-primary/5">
                        <td className="p-2 font-mono text-xs">{k.key_value}</td>
                        <td className="p-2 text-xs">{k.package?.title ?? "—"}</td>
                        <td className="p-2">
                          <Badge variant={k.status === "available" ? "default" : k.status === "assigned" ? "secondary" : "destructive"}>{k.status}</Badge>
                        </td>
                        <td className="p-2 text-xs">{k.assigned_to_email ?? (k.assigned_to_user_id ? "user" : "—")}</td>
                        <td className="p-2 text-xs">
                          {k.activation_count ?? 0}/{k.max_activations ?? 1}
                        </td>
                        <td className="p-2 text-right whitespace-nowrap">
                          {k.status === "available" && (
                            <Button variant="ghost" size="icon" title="Manually Assign" onClick={() => setAssignKey(k)}>
                              <UserPlus className="w-4 h-4 text-primary" />
                            </Button>
                          )}
                          {k.status === "assigned" && (
                            <Button variant="ghost" size="icon" title="Resend License" onClick={() => doResend(k)} disabled={resend.isPending}>
                              <Send className="w-4 h-4 text-blue-400" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" title="History" onClick={() => setHistoryKey(k)}>
                            <History className="w-4 h-4 text-amber-300" />
                          </Button>
                          {k.status !== "revoked" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Revoke"
                              onClick={async () => {
                                await revoke.mutateAsync(k.id);
                                toast.success("Revoked");
                              }}
                            >
                              <Ban className="w-4 h-4 text-amber-400" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={async () => {
                              if (confirm("Delete?")) {
                                await del.mutateAsync(k.id);
                                toast.success("Deleted");
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-rose-400" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {!filteredKeys.length && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-muted-foreground">
                          কোনো key নেই
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </TabsContent>

        <TabsContent value="add" className="mt-4">
          <GlassCard className="p-4">
            <h3 className="font-semibold mb-3">Bulk add / Import keys</h3>
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <Label>Package</Label>
                <Select value={addPkgId} onValueChange={setAddPkgId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select package" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover max-h-72">
                    {pkgs.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-3">
                  <Label className="text-xs">CSV/TXT import (1st column = key)</Label>
                  <Input type="file" accept=".csv,.txt" onChange={onFileImport} />
                </div>
              </div>
              <div className="md:col-span-2">
                <Label>Keys (এক লাইনে একটি, বা কমা দিয়ে — হাজার হাজার Key paste করা যাবে)</Label>
                <Textarea rows={10} value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder="XXXX-YYYY-ZZZZ&#10;AAAA-BBBB-CCCC" />
                <p className="text-xs text-muted-foreground mt-1">{bulk.split(/\r?\n|,/).filter((s) => s.trim()).length} key prepared</p>
              </div>
            </div>
            <Button className="mt-3" onClick={submit} disabled={bulkAdd.isPending}>
              <Plus className="w-4 h-4" /> {bulkAdd.isPending ? "Adding…" : "Add Keys"}
            </Button>
          </GlassCard>
        </TabsContent>
      </Tabs>

      {/* History dialog */}
      <Dialog open={!!historyKey} onOpenChange={(o) => !o && setHistoryKey(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>License History — <span className="font-mono text-sm">{historyKey?.key_value}</span></DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {!history.length && <p className="text-sm text-muted-foreground p-4">কোনো history নেই</p>}
            <ul className="space-y-2">
              {(history as any[]).map((h) => (
                <li key={h.id} className="border border-border/30 rounded-md p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{h.event}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString()}</span>
                  </div>
                  {h.message && <p className="mt-1">{h.message}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    Actor: {h.actor}{h.actor_id ? ` · ${h.actor_id.slice(0, 8)}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual assign dialog */}
      <Dialog open={!!assignKey} onOpenChange={(o) => !o && setAssignKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manually Assign License</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Key</Label>
              <Input value={assignKey?.key_value ?? ""} readOnly className="font-mono" />
            </div>
            <div>
              <Label>Customer Email</Label>
              <Input type="email" value={assignEmail} onChange={(e) => setAssignEmail(e.target.value)} placeholder="customer@example.com" />
            </div>
            <div>
              <Label>Note (optional)</Label>
              <Textarea rows={3} value={assignNote} onChange={(e) => setAssignNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignKey(null)}>Cancel</Button>
            <Button onClick={doAssign} disabled={assign.isPending}>
              <UserPlus className="w-4 h-4" /> {assign.isPending ? "Assigning…" : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}
