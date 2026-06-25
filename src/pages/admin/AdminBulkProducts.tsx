import { useMemo, useState } from "react";
import { Upload, Download, Edit3, CheckSquare } from "lucide-react";
import { AdminPage, AdminPageHeader, GlassCard } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useServicePackagesLite, useBulkImportPackages, useBulkUpdatePackages } from "@/hooks/useProductMgmt";

const CSV_HEADERS = ["title","slug","short_description","description","price","original_price","currency","sku","delivery_days","is_published","is_featured","publish_status","meta_title","meta_description","is_digital"];

function parseCsv(text: string): Array<Record<string, string>> {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    // simple CSV (no quoted commas handling for brevity)
    const cells = line.split(",");
    const r: Record<string, string> = {};
    headers.forEach((h, i) => { r[h] = (cells[i] ?? "").trim(); });
    return r;
  });
}

export default function AdminBulkProducts() {
  const { data: pkgs = [] } = useServicePackagesLite();
  const bulkImport = useBulkImportPackages();
  const bulkUpdate = useBulkUpdatePackages();

  const [csvRows, setCsvRows] = useState<Array<Record<string, string>>>([]);
  const handleFile = (f: File | null) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setCsvRows(parseCsv(String(reader.result || "")));
    reader.readAsText(f);
  };
  const doImport = async () => {
    if (!csvRows.length) return toast.error("CSV নেই");
    try { const r = await bulkImport.mutateAsync(csvRows); toast.success(`${r.inserted}টি product imported`); setCsvRows([]); }
    catch (e: any) { toast.error(e.message); }
  };
  const downloadTemplate = () => {
    const csv = CSV_HEADERS.join(",") + "\n" + 'Example Product,example-product,Short desc,Full desc,1000,1500,BDT,SKU-001,7,true,false,published,Meta Title,Meta desc,false';
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "products-template.csv"; a.click();
  };

  // Bulk edit
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [field, setField] = useState<string>("is_published");
  const [value, setValue] = useState<string>("true");
  const toggleAll = (on: boolean) => setSel(on ? new Set(pkgs.map((p: any) => p.id)) : new Set());
  const toggleOne = (id: string) => { const n = new Set(sel); n.has(id) ? n.delete(id) : n.add(id); setSel(n); };
  const applyEdit = async () => {
    if (!sel.size) return toast.error("Product select করুন");
    const patch: any = {};
    if (field === "is_published") patch.is_published = value === "true";
    else if (field === "is_featured") patch.is_featured = value === "true";
    else if (field === "publish_status") patch.publish_status = value;
    else if (field === "price_percent") {
      const pct = Number(value);
      if (!Number.isFinite(pct)) return toast.error("সংখ্যা দিন");
      // fetch and update each (small loop OK for moderate counts)
      const targets = pkgs.filter((p: any) => sel.has(p.id));
      try {
        const updates = targets.map((p: any) => ({ id: p.id, price: Number(p.price ?? 0) * (1 + pct / 100) }));
        for (const u of updates) await bulkUpdate.mutateAsync({ ids: [u.id], patch: { price: u.price } });
        toast.success(`${updates.length}টি product update হয়েছে`); return;
      } catch (e: any) { return toast.error(e.message); }
    }
    try { const n = await bulkUpdate.mutateAsync({ ids: Array.from(sel), patch }); toast.success(`${n}টি product update হয়েছে`); setSel(new Set()); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <AdminPage>
      <AdminPageHeader title="Bulk Import / Edit" subtitle="CSV upload, bulk edit pricing & status" icon={Upload} />
      <Tabs defaultValue="import">
        <TabsList><TabsTrigger value="import">CSV Import</TabsTrigger><TabsTrigger value="edit">Bulk Edit</TabsTrigger></TabsList>
        <TabsContent value="import">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Button variant="outline" onClick={downloadTemplate}><Download className="w-4 h-4" /> Download Template</Button>
              <Input type="file" accept=".csv" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} className="max-w-md" />
              <Button onClick={doImport} disabled={!csvRows.length || bulkImport.isPending}>{bulkImport.isPending ? "Importing…" : `Import ${csvRows.length}`}</Button>
            </div>
            {csvRows.length > 0 && (
              <div className="overflow-x-auto max-h-96 overflow-y-auto border border-border/30 rounded-md">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-background/95"><tr>{CSV_HEADERS.map((h) => <th key={h} className="p-1.5 text-left">{h}</th>)}</tr></thead>
                  <tbody>{csvRows.slice(0, 50).map((r, i) => (<tr key={i} className="border-t border-border/20">{CSV_HEADERS.map((h) => <td key={h} className="p-1.5">{r[h] ?? ""}</td>)}</tr>))}</tbody>
                </table>
                {csvRows.length > 50 && <p className="p-2 text-xs text-muted-foreground">Preview: প্রথম 50 row</p>}
              </div>
            )}
          </GlassCard>
        </TabsContent>
        <TabsContent value="edit">
          <GlassCard className="p-4">
            <div className="flex flex-wrap items-end gap-3 mb-4">
              <div><Label>Field</Label>
                <Select value={field} onValueChange={setField}>
                  <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="is_published">Published (true/false)</SelectItem>
                    <SelectItem value="is_featured">Featured (true/false)</SelectItem>
                    <SelectItem value="publish_status">Publish status</SelectItem>
                    <SelectItem value="price_percent">Price change (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Value</Label>
                {field === "publish_status" ? (
                  <Select value={value} onValueChange={setValue}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover"><SelectItem value="draft">draft</SelectItem><SelectItem value="scheduled">scheduled</SelectItem><SelectItem value="published">published</SelectItem></SelectContent>
                  </Select>
                ) : <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={field === "price_percent" ? "+10 or -15" : "true / false"} className="w-40" />}
              </div>
              <Button onClick={applyEdit}><Edit3 className="w-4 h-4" /> Apply to {sel.size}</Button>
              <Button variant="outline" onClick={() => toggleAll(sel.size !== pkgs.length)}><CheckSquare className="w-4 h-4" /> {sel.size === pkgs.length ? "Unselect all" : "Select all"}</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-muted-foreground border-b border-border/40"><th className="p-2 w-10"></th><th className="p-2">Title</th><th className="p-2">SKU</th><th className="p-2">Price</th><th className="p-2">Status</th></tr></thead>
                <tbody>
                  {pkgs.map((p: any) => (
                    <tr key={p.id} className="border-b border-border/20 hover:bg-primary/5">
                      <td className="p-2"><Checkbox checked={sel.has(p.id)} onCheckedChange={() => toggleOne(p.id)} /></td>
                      <td className="p-2 font-medium">{p.title}</td>
                      <td className="p-2 text-xs font-mono">{p.sku ?? "—"}</td>
                      <td className="p-2">{p.price ?? "—"}</td>
                      <td className="p-2 text-xs">{p.publish_status ?? (p.is_published ? "published" : "draft")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </AdminPage>
  );
}
