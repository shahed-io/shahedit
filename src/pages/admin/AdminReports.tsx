import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage, AdminPageHeader, GlassCard } from "@/components/admin/ui";
import { BarChart3, Download, FileSpreadsheet, FileText, TrendingUp, Users, Package, Receipt, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Row = Record<string, any>;
type ReportKey = "sales" | "profit" | "customers" | "products" | "tax";

const REPORTS: { key: ReportKey; label: string; icon: any; desc: string }[] = [
  { key: "sales", label: "Sales Report", icon: TrendingUp, desc: "Revenue from orders by date" },
  { key: "profit", label: "Profit Report", icon: DollarSign, desc: "Revenue − Expenses" },
  { key: "customers", label: "Customer Report", icon: Users, desc: "Top customers and spend" },
  { key: "products", label: "Product Report", icon: Package, desc: "Units sold per product" },
  { key: "tax", label: "Tax Report", icon: Receipt, desc: "VAT/TAX collected on invoices" },
];

const fmtMoney = (v: number) => `৳${(v ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const today = new Date().toISOString().slice(0, 10);
const monthAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);

export default function AdminReports() {
  const [tab, setTab] = useState<ReportKey>("sales");
  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(today);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [columns, setColumns] = useState<{ key: string; label: string; numeric?: boolean }[]>([]);
  const [summary, setSummary] = useState<{ label: string; value: string; tone?: string }[]>([]);

  const fromIso = useMemo(() => new Date(from + "T00:00:00").toISOString(), [from]);
  const toIso = useMemo(() => new Date(to + "T23:59:59").toISOString(), [to]);

  const runSales = async () => {
    const { data: orders } = await supabase.from("orders").select("order_number,customer_name,customer_email,product_title,amount,status,payment_method,created_at")
      .gte("created_at", fromIso).lte("created_at", toIso).order("created_at", { ascending: false });
    const list = (orders ?? []).filter(o => ["in_progress", "completed", "delivered"].includes(o.status));
    const total = list.reduce((s, o) => s + Number(o.amount || 0), 0);
    setColumns([
      { key: "order_number", label: "Order #" },
      { key: "created_at", label: "Date" },
      { key: "customer_name", label: "Customer" },
      { key: "product_title", label: "Product" },
      { key: "payment_method", label: "Method" },
      { key: "status", label: "Status" },
      { key: "amount", label: "Amount (৳)", numeric: true },
    ]);
    setRows(list.map(o => ({ ...o, created_at: new Date(o.created_at).toLocaleDateString("en-IN") })));
    setSummary([
      { label: "Orders", value: String(list.length) },
      { label: "Gross Sales", value: fmtMoney(total), tone: "text-emerald-400" },
      { label: "Avg Order", value: fmtMoney(list.length ? total / list.length : 0) },
    ]);
  };

  const runProfit = async () => {
    const [oRes, eRes] = await Promise.all([
      supabase.from("orders").select("amount,status,created_at").gte("created_at", fromIso).lte("created_at", toIso),
      supabase.from("expenses").select("title,category,amount,expense_date,vendor").gte("expense_date", from).lte("expense_date", to),
    ]);
    const revenueList = (oRes.data ?? []).filter(o => ["in_progress", "completed", "delivered"].includes(o.status));
    const revenue = revenueList.reduce((s, o) => s + Number(o.amount || 0), 0);
    const expenses = (eRes.data ?? []).reduce((s, e: any) => s + Number(e.amount || 0), 0);
    const profit = revenue - expenses;
    const buckets: Record<string, { revenue: number; expenses: number }> = {};
    revenueList.forEach(o => {
      const k = (o.created_at as string).slice(0, 7);
      buckets[k] = buckets[k] ?? { revenue: 0, expenses: 0 };
      buckets[k].revenue += Number(o.amount || 0);
    });
    (eRes.data ?? []).forEach((e: any) => {
      const k = (e.expense_date as string).slice(0, 7);
      buckets[k] = buckets[k] ?? { revenue: 0, expenses: 0 };
      buckets[k].expenses += Number(e.amount || 0);
    });
    setColumns([
      { key: "month", label: "Month" },
      { key: "revenue", label: "Revenue (৳)", numeric: true },
      { key: "expenses", label: "Expenses (৳)", numeric: true },
      { key: "profit", label: "Profit (৳)", numeric: true },
      { key: "margin", label: "Margin %", numeric: true },
    ]);
    setRows(Object.entries(buckets).sort().map(([month, v]) => ({
      month, revenue: v.revenue, expenses: v.expenses, profit: v.revenue - v.expenses,
      margin: v.revenue ? Number(((v.revenue - v.expenses) / v.revenue * 100).toFixed(2)) : 0,
    })));
    setSummary([
      { label: "Revenue", value: fmtMoney(revenue), tone: "text-emerald-400" },
      { label: "Expenses", value: fmtMoney(expenses), tone: "text-rose-400" },
      { label: "Net Profit", value: fmtMoney(profit), tone: profit >= 0 ? "text-emerald-400" : "text-rose-400" },
      { label: "Margin", value: `${revenue ? ((profit / revenue) * 100).toFixed(1) : 0}%` },
    ]);
  };

  const runCustomers = async () => {
    const { data } = await supabase.from("orders").select("customer_name,customer_email,customer_phone,amount,status,created_at")
      .gte("created_at", fromIso).lte("created_at", toIso);
    const map: Record<string, Row> = {};
    (data ?? []).forEach(o => {
      const k = (o.customer_email || o.customer_name || "—").toLowerCase();
      const r = map[k] ?? { customer_name: o.customer_name, customer_email: o.customer_email, customer_phone: o.customer_phone, orders: 0, total_spent: 0, last_order: o.created_at };
      r.orders += 1;
      if (["in_progress", "completed", "delivered"].includes(o.status)) r.total_spent += Number(o.amount || 0);
      if (new Date(o.created_at) > new Date(r.last_order)) r.last_order = o.created_at;
      map[k] = r;
    });
    const list = Object.values(map).sort((a, b) => b.total_spent - a.total_spent);
    setColumns([
      { key: "customer_name", label: "Customer" },
      { key: "customer_email", label: "Email" },
      { key: "customer_phone", label: "Phone" },
      { key: "orders", label: "Orders", numeric: true },
      { key: "total_spent", label: "Total Spent (৳)", numeric: true },
      { key: "last_order", label: "Last Order" },
    ]);
    setRows(list.map(r => ({ ...r, last_order: new Date(r.last_order).toLocaleDateString("en-IN") })));
    setSummary([
      { label: "Unique Customers", value: String(list.length) },
      { label: "Total Spend", value: fmtMoney(list.reduce((s, r) => s + r.total_spent, 0)), tone: "text-emerald-400" },
      { label: "Avg / Customer", value: fmtMoney(list.length ? list.reduce((s, r) => s + r.total_spent, 0) / list.length : 0) },
    ]);
  };

  const runProducts = async () => {
    const { data } = await supabase.from("orders").select("product_title,package_id,amount,status,created_at")
      .gte("created_at", fromIso).lte("created_at", toIso);
    const map: Record<string, Row> = {};
    (data ?? []).forEach(o => {
      const k = o.product_title || "Untitled";
      const r = map[k] ?? { product_title: k, units: 0, revenue: 0, cancelled: 0 };
      r.units += 1;
      if (["in_progress", "completed", "delivered"].includes(o.status)) r.revenue += Number(o.amount || 0);
      if (o.status === "cancelled") r.cancelled += 1;
      map[k] = r;
    });
    const list = Object.values(map).sort((a, b) => b.revenue - a.revenue);
    setColumns([
      { key: "product_title", label: "Product" },
      { key: "units", label: "Orders", numeric: true },
      { key: "cancelled", label: "Cancelled", numeric: true },
      { key: "revenue", label: "Revenue (৳)", numeric: true },
    ]);
    setRows(list);
    setSummary([
      { label: "Products Sold", value: String(list.length) },
      { label: "Total Units", value: String(list.reduce((s, r) => s + r.units, 0)) },
      { label: "Total Revenue", value: fmtMoney(list.reduce((s, r) => s + r.revenue, 0)), tone: "text-emerald-400" },
    ]);
  };

  const runTax = async () => {
    const { data } = await (supabase as any).from("invoices").select("invoice_number,client_name,issue_date,subtotal,tax_rate,tax_amount,discount,total,status")
      .gte("issue_date", from).lte("issue_date", to).order("issue_date", { ascending: false });
    const list = data ?? [];
    const totalTax = list.reduce((s: number, i: any) => s + Number(i.tax_amount || 0), 0);
    const subtotal = list.reduce((s: number, i: any) => s + Number(i.subtotal || 0), 0);
    const grand = list.reduce((s: number, i: any) => s + Number(i.total || 0), 0);
    setColumns([
      { key: "invoice_number", label: "Invoice #" },
      { key: "issue_date", label: "Date" },
      { key: "client_name", label: "Client" },
      { key: "status", label: "Status" },
      { key: "subtotal", label: "Subtotal (৳)", numeric: true },
      { key: "tax_rate", label: "Tax %", numeric: true },
      { key: "tax_amount", label: "Tax (৳)", numeric: true },
      { key: "total", label: "Total (৳)", numeric: true },
    ]);
    setRows(list);
    setSummary([
      { label: "Invoices", value: String(list.length) },
      { label: "Taxable Subtotal", value: fmtMoney(subtotal) },
      { label: "VAT / TAX Collected", value: fmtMoney(totalTax), tone: "text-amber-400" },
      { label: "Grand Total", value: fmtMoney(grand), tone: "text-emerald-400" },
    ]);
  };

  const run = async () => {
    setLoading(true);
    try {
      if (tab === "sales") await runSales();
      else if (tab === "profit") await runProfit();
      else if (tab === "customers") await runCustomers();
      else if (tab === "products") await runProducts();
      else if (tab === "tax") await runTax();
    } catch (e: any) {
      toast.error(e?.message ?? "Report failed");
    } finally { setLoading(false); }
  };

  useEffect(() => { run(); /* eslint-disable-next-line */ }, [tab]);

  const exportExcel = () => {
    if (!rows.length) return toast.error("No data");
    const sheetData = [columns.map(c => c.label), ...rows.map(r => columns.map(c => r[c.key] ?? ""))];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, REPORTS.find(r => r.key === tab)!.label);
    XLSX.writeFile(wb, `${tab}-report-${from}_to_${to}.xlsx`);
    toast.success("Excel exported");
  };

  const exportPdf = () => {
    if (!rows.length) return toast.error("No data");
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const meta = REPORTS.find(r => r.key === tab)!;
    doc.setFontSize(16); doc.setTextColor(40);
    doc.text(`Shahed IT — ${meta.label}`, 40, 40);
    doc.setFontSize(10); doc.setTextColor(110);
    doc.text(`Period: ${from} to ${to}    Generated: ${new Date().toLocaleString("en-IN")}`, 40, 58);
    summary.forEach((s, i) => doc.text(`${s.label}: ${s.value}`, 40 + i * 200, 78));
    autoTable(doc, {
      startY: 100,
      head: [columns.map(c => c.label)],
      body: rows.map(r => columns.map(c => {
        const v = r[c.key];
        return c.numeric && typeof v === "number" ? v.toLocaleString("en-IN") : String(v ?? "");
      })),
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [120, 53, 15], textColor: [255, 250, 230] },
      alternateRowStyles: { fillColor: [250, 245, 230] },
    });
    doc.save(`${tab}-report-${from}_to_${to}.pdf`);
    toast.success("PDF exported");
  };

  const meta = REPORTS.find(r => r.key === tab)!;

  return (
    <AdminPage>
      <AdminPageHeader title="Reports" subtitle="Sales · Profit · Customer · Product · Tax — Excel / PDF export" icon={BarChart3} />

      <GlassCard className="p-4 mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-[11px] text-muted-foreground flex items-center gap-1"><Calendar size={11} /> From</label>
            <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-44" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground flex items-center gap-1"><Calendar size={11} /> To</label>
            <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-44" />
          </div>
          <Button onClick={run} disabled={loading}>{loading ? "Loading…" : "Run Report"}</Button>
          <div className="flex-1" />
          <Button variant="outline" onClick={exportExcel} className="gap-1.5 border-emerald-500/30 text-emerald-300"><FileSpreadsheet size={14} />Excel</Button>
          <Button variant="outline" onClick={exportPdf} className="gap-1.5 border-rose-500/30 text-rose-300"><FileText size={14} />PDF</Button>
        </div>
      </GlassCard>

      <Tabs value={tab} onValueChange={v => setTab(v as ReportKey)} className="w-full">
        <TabsList className="flex flex-wrap h-auto">
          {REPORTS.map(r => (
            <TabsTrigger key={r.key} value={r.key} className="gap-1.5">
              <r.icon size={14} />{r.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {REPORTS.map(r => (
          <TabsContent key={r.key} value={r.key} className="space-y-4 mt-4">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">{r.label}</Badge>{r.desc}
            </p>

            {summary.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {summary.map(s => (
                  <GlassCard key={s.label} className="p-4 text-center">
                    <p className={`text-xl font-bold ${s.tone ?? "text-amber-100"}`}>{s.value}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{s.label}</p>
                  </GlassCard>
                ))}
              </div>
            )}

            <GlassCard className="p-3">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-muted-foreground uppercase text-[10px]">
                    <tr className="border-b border-amber-500/10">
                      {columns.map(c => (
                        <th key={c.key} className={`p-2 ${c.numeric ? "text-right" : "text-left"}`}>{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={columns.length || 1} className="p-6 text-center text-muted-foreground">Loading…</td></tr>
                    ) : rows.length === 0 ? (
                      <tr><td colSpan={columns.length || 1} className="p-6 text-center text-muted-foreground">No data for selected range</td></tr>
                    ) : rows.slice(0, 500).map((row, i) => (
                      <tr key={i} className="border-b border-amber-500/5 hover:bg-amber-500/5">
                        {columns.map(c => (
                          <td key={c.key} className={`p-2 ${c.numeric ? "text-right font-mono" : ""}`}>
                            {c.numeric && typeof row[c.key] === "number" ? row[c.key].toLocaleString("en-IN") : String(row[c.key] ?? "—")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 500 && <p className="text-[10px] text-muted-foreground text-center mt-2">Showing first 500 of {rows.length} — export for full data.</p>}
              </div>
            </GlassCard>
          </TabsContent>
        ))}
      </Tabs>
    </AdminPage>
  );
}
