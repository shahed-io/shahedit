import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";
import {
  Sparkles, FileText, MessageSquare, Mail, DollarSign, Copy, Upload, Activity,
  Bell, AlertTriangle, Heart, Moon, Keyboard, LayoutGrid, Search, QrCode,
  KeyRound, Webhook, Clock, Folder, ArrowUp, ArrowDown, Eye, Trash2,
} from "lucide-react";

// ---------- AI Tools ----------
function AiTool({ action, label, placeholder, icon: Icon }: any) {
  const [input, setInput] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);
  const run = async () => {
    if (!input.trim()) return toast.error("ইনপুট দিন");
    setLoading(true); setOut("");
    try {
      const { data, error } = await supabase.functions.invoke("ai-admin-tools", { body: { action, input } });
      if (error) throw error;
      if (data?.error === "rate_limited") return toast.error("Rate limit — একটু পরে চেষ্টা করুন");
      if (data?.error === "credits_exhausted") return toast.error("AI credit শেষ");
      setOut(data?.text || "");
    } catch (e: any) { toast.error(e.message || "ব্যর্থ"); }
    finally { setLoading(false); }
  };
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Icon className="w-5 h-5" /> {label}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Textarea rows={4} placeholder={placeholder} value={input} onChange={(e) => setInput(e.target.value)} />
        <Button onClick={run} disabled={loading}>{loading ? "Generating..." : "Generate"}</Button>
        {out && (
          <div className="space-y-2">
            <Textarea rows={10} value={out} onChange={(e) => setOut(e.target.value)} />
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(out); toast.success("Copied"); }}>
              <Copy className="w-4 h-4 mr-1" /> Copy
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Bulk Price ----------
function BulkPrice() {
  const [mode, setMode] = useState("percent");
  const [dir, setDir] = useState("increase");
  const [value, setValue] = useState(10);
  const [count, setCount] = useState<number | null>(null);
  const preview = async () => {
    const { count: c } = await supabase.from("service_packages").select("*", { count: "exact", head: true });
    setCount(c ?? 0);
  };
  const apply = async () => {
    if (!confirm(`সকল ${count ?? "?"} package-এ price update করবেন?`)) return;
    const { data } = await supabase.from("service_packages").select("id, price");
    if (!data) return;
    let ok = 0;
    for (const p of data) {
      const cur = Number(p.price || 0);
      let next = cur;
      if (mode === "percent") next = dir === "increase" ? cur * (1 + value/100) : cur * (1 - value/100);
      else if (mode === "flat") next = dir === "increase" ? cur + value : Math.max(0, cur - value);
      else if (mode === "set") next = value;
      const { error } = await supabase.from("service_packages").update({ price: Math.round(next) }).eq("id", p.id);
      if (!error) ok++;
    }
    toast.success(`${ok} package updated`);
  };
  return (
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5" /> Bulk Price Update</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid sm:grid-cols-3 gap-3">
          <div><Label>Mode</Label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">Percent (%)</SelectItem>
                <SelectItem value="flat">Flat (৳)</SelectItem>
                <SelectItem value="set">Set Exact (৳)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Direction</Label>
            <Select value={dir} onValueChange={setDir} disabled={mode === "set"}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="increase">Increase</SelectItem>
                <SelectItem value="decrease">Decrease</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Value</Label><Input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} /></div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={preview}>Preview ({count ?? "?"} packages)</Button>
          <Button onClick={apply} disabled={count === null}>Apply</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Duplicate Product ----------
function DuplicateProduct() {
  const [pkgs, setPkgs] = useState<any[]>([]);
  const [id, setId] = useState("");
  useEffect(() => { supabase.from("service_packages").select("id,title").order("created_at",{ascending:false}).limit(200).then(({ data }) => setPkgs(data || [])); }, []);
  const dup = async () => {
    if (!id) return;
    const { data } = await supabase.from("service_packages").select("*").eq("id", id).maybeSingle();
    if (!data) return toast.error("Not found");
    const { id: _i, created_at: _c, updated_at: _u, slug, ...rest } = data as any;
    const { error } = await supabase.from("service_packages").insert({ ...rest, title: `${rest.title} (Copy)`, is_published: false } as any);
    if (error) return toast.error(error.message);
    toast.success("Duplicated");
  };
  return (
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Copy className="w-5 h-5" /> One-Click Duplicate</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Select value={id} onValueChange={setId}>
          <SelectTrigger><SelectValue placeholder="Select a package" /></SelectTrigger>
          <SelectContent>{pkgs.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
        </Select>
        <Button onClick={dup} disabled={!id}>Duplicate</Button>
      </CardContent>
    </Card>
  );
}

// ---------- Bulk License Import ----------
function BulkLicense() {
  const [pkgs, setPkgs] = useState<any[]>([]);
  const [pkgId, setPkgId] = useState("");
  const [keys, setKeys] = useState("");
  useEffect(() => { supabase.from("service_packages").select("id,title").order("title").then(({ data }) => setPkgs(data || [])); }, []);
  const submit = async () => {
    const lines = keys.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    if (!pkgId || lines.length === 0) return toast.error("Package + keys দিন");
    const rows = lines.map((k) => ({ package_id: pkgId, key_value: k, status: "available" as const }));
    const { error } = await supabase.from("license_keys").insert(rows as any);
    if (error) return toast.error(error.message);
    toast.success(`${lines.length} keys imported`);
    setKeys("");
  };
  return (
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5" /> Bulk License Import</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Select value={pkgId} onValueChange={setPkgId}>
          <SelectTrigger><SelectValue placeholder="Package নির্বাচন করুন" /></SelectTrigger>
          <SelectContent>{pkgs.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
        </Select>
        <Textarea rows={10} placeholder="প্রতি line-এ একটি key অথবা comma-separated" value={keys} onChange={(e) => setKeys(e.target.value)} />
        <Button onClick={submit}>Import</Button>
      </CardContent>
    </Card>
  );
}

// ---------- Activity Timeline ----------
function ActivityTimeline() {
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => { (async () => {
    const [a, o, l] = await Promise.all([
      supabase.from("audit_logs").select("id,action,created_at,details").order("created_at",{ascending:false}).limit(50),
      supabase.from("order_timeline").select("id,event,message,created_at").order("created_at",{ascending:false}).limit(50),
      supabase.from("license_history").select("id,event,message,created_at").order("created_at",{ascending:false}).limit(50),
    ]);
    const all = [
      ...(a.data || []).map((x: any) => ({ ...x, source: "audit", label: x.action })),
      ...(o.data || []).map((x: any) => ({ ...x, source: "order", label: x.event })),
      ...(l.data || []).map((x: any) => ({ ...x, source: "license", label: x.event })),
    ].sort((x, y) => +new Date(y.created_at) - +new Date(x.created_at)).slice(0, 100);
    setEvents(all);
  })(); }, []);
  return (
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" /> Activity Timeline</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[60vh] overflow-auto">
          {events.map((e, i) => (
            <div key={i} className="flex gap-3 text-sm border-b border-border/40 pb-2">
              <Badge variant="outline">{e.source}</Badge>
              <div className="flex-1">
                <div className="font-medium">{e.label}</div>
                {e.message && <div className="text-muted-foreground text-xs">{e.message}</div>}
              </div>
              <div className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString("bn-BD")}</div>
            </div>
          ))}
          {events.length === 0 && <p className="text-muted-foreground text-sm">কোনো event নেই</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Live Visitor + Sales ----------
function LiveCounter() {
  const [visitors, setVisitors] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    const tick = async () => {
      const since = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { count } = await supabase.from("analytics_events").select("*", { head: true, count: "exact" }).gte("created_at", since);
      setVisitors(count || 0);
    };
    tick();
    const id = setInterval(tick, 15000);
    const ch = supabase.channel("orders-live").on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (p) => {
      setOrders((prev) => [p.new, ...prev].slice(0, 20));
      toast.success(`নতুন অর্ডার: ${(p.new as any).order_number}`);
    }).subscribe();
    return () => { clearInterval(id); supabase.removeChannel(ch); };
  }, []);
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Heart className="w-5 h-5 text-rose-500" /> Live Visitors (5 min)</CardTitle></CardHeader>
        <CardContent><div className="text-5xl font-bold">{visitors}</div></CardContent></Card>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-amber-500" /> Real-time Sales</CardTitle></CardHeader>
        <CardContent>
          {orders.length === 0 ? <p className="text-muted-foreground text-sm">নতুন অর্ডারের জন্য অপেক্ষমান…</p> :
            <ul className="space-y-1 text-sm">{orders.map((o, i) => <li key={i}>✅ {o.order_number} — ৳{o.amount}</li>)}</ul>}
        </CardContent></Card>
    </div>
  );
}

// ---------- Error Log ----------
function ErrorLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const load = async () => {
    const { data } = await supabase.from("client_error_logs").select("*").order("created_at",{ascending:false}).limit(100);
    setLogs(data || []);
  };
  useEffect(() => { load(); }, []);
  return (
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" /> Error Log</CardTitle></CardHeader>
      <CardContent>
        <Button variant="outline" size="sm" onClick={load} className="mb-3">Refresh</Button>
        <div className="space-y-2 max-h-[60vh] overflow-auto text-xs font-mono">
          {logs.map((l) => (
            <div key={l.id} className="border border-red-500/20 rounded p-2 bg-red-500/5">
              <div className="font-bold text-red-400">{l.message}</div>
              {l.url && <div className="text-muted-foreground">{l.url}</div>}
              {l.stack && <pre className="text-[10px] mt-1 whitespace-pre-wrap opacity-70">{l.stack.slice(0, 400)}</pre>}
              <div className="text-[10px] mt-1 opacity-60">{new Date(l.created_at).toLocaleString()}</div>
            </div>
          ))}
          {logs.length === 0 && <p className="text-muted-foreground">কোনো error নেই 🎉</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- System Health ----------
function SystemHealth() {
  const [checks, setChecks] = useState<any[]>([]);
  const run = async () => {
    const results: any[] = [];
    try { await supabase.from("site_settings").select("key").limit(1); results.push({ name: "Database", ok: true }); } catch { results.push({ name: "Database", ok: false }); }
    try { const { data } = await supabase.auth.getUser(); results.push({ name: "Auth", ok: !!data.user }); } catch { results.push({ name: "Auth", ok: false }); }
    try { await supabase.storage.listBuckets(); results.push({ name: "Storage", ok: true }); } catch { results.push({ name: "Storage", ok: false }); }
    try { const r = await fetch("https://ai.gateway.lovable.dev"); results.push({ name: "AI Gateway", ok: r.ok || r.status < 500 }); } catch { results.push({ name: "AI Gateway", ok: false }); }
    setChecks(results);
  };
  useEffect(() => { run(); }, []);
  return (
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" /> System Health</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center justify-between border rounded p-3">
            <span className="font-medium">{c.name}</span>
            <Badge className={c.ok ? "bg-green-600" : "bg-red-600"}>{c.ok ? "OK" : "FAIL"}</Badge>
          </div>
        ))}
        <Button variant="outline" onClick={run}>Re-run</Button>
      </CardContent>
    </Card>
  );
}

// ---------- Dark Mode + Shortcuts ----------
function DarkModeTab() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("admin-dark", dark ? "1" : "0");
  }, [dark]);
  return (
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Moon className="w-5 h-5" /> Dark Mode</CardTitle></CardHeader>
      <CardContent className="flex items-center gap-3">
        <Switch checked={dark} onCheckedChange={setDark} />
        <span>{dark ? "Dark mode চালু" : "Light mode"}</span>
      </CardContent>
    </Card>
  );
}

const SHORTCUTS = [
  { keys: "g then d", action: "Go to Dashboard" },
  { keys: "g then o", action: "Go to Orders" },
  { keys: "g then p", action: "Go to Products" },
  { keys: "g then c", action: "Go to Customers" },
  { keys: "/", action: "Focus sidebar search" },
  { keys: "?", action: "Show shortcuts" },
];
function ShortcutsTab() {
  return (
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Keyboard className="w-5 h-5" /> Keyboard Shortcuts</CardTitle></CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <tbody>{SHORTCUTS.map((s) => (
            <tr key={s.keys} className="border-b border-border/40">
              <td className="py-2"><kbd className="px-2 py-1 bg-muted rounded text-xs">{s.keys}</kbd></td>
              <td className="py-2">{s.action}</td>
            </tr>
          ))}</tbody>
        </table>
      </CardContent>
    </Card>
  );
}

// ---------- Dashboard Widgets ----------
const DEFAULT_WIDGETS = ["Revenue", "Orders", "Customers", "Leads", "Visitors", "Reviews"];
function DashboardWidgets() {
  const [items, setItems] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("dash-widgets") || "null") || DEFAULT_WIDGETS; } catch { return DEFAULT_WIDGETS; }
  });
  useEffect(() => { localStorage.setItem("dash-widgets", JSON.stringify(items)); }, [items]);
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const arr = [...items]; [arr[i], arr[j]] = [arr[j], arr[i]]; setItems(arr);
  };
  return (
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><LayoutGrid className="w-5 h-5" /> Dashboard Widgets Order</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {items.map((w, i) => (
          <div key={w} className="flex items-center justify-between border rounded p-3">
            <span>{i + 1}. {w}</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => move(i, -1)}><ArrowUp className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => move(i, 1)}><ArrowDown className="w-4 h-4" /></Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ---------- Advanced Search ----------
function AdvancedSearch() {
  const [q, setQ] = useState("");
  const [res, setRes] = useState<any>({});
  const run = async () => {
    if (!q.trim()) return;
    const [o, c, i, l] = await Promise.all([
      supabase.from("orders").select("id,order_number,customer_name,customer_email,amount").or(`order_number.ilike.%${q}%,customer_name.ilike.%${q}%,customer_email.ilike.%${q}%`).limit(10),
      supabase.from("profiles").select("user_id,full_name,phone").or(`full_name.ilike.%${q}%,phone.ilike.%${q}%`).limit(10),
      supabase.from("invoices").select("id,invoice_number,total").ilike("invoice_number", `%${q}%`).limit(10),
      supabase.from("license_keys").select("id,key_value,status").ilike("key_value", `%${q}%`).limit(10),
    ]);
    setRes({ orders: o.data || [], customers: c.data || [], invoices: i.data || [], licenses: l.data || [] });
  };
  return (
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Search className="w-5 h-5" /> Advanced Search</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input placeholder="Order #, customer, invoice, license…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run()} />
          <Button onClick={run}>Search</Button>
        </div>
        {Object.entries(res).map(([k, arr]: any) => arr.length > 0 && (
          <div key={k}>
            <h4 className="font-semibold capitalize mb-1">{k} ({arr.length})</h4>
            <div className="space-y-1 text-sm">{arr.map((x: any, i: number) => <div key={i} className="p-2 border rounded">{JSON.stringify(x)}</div>)}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ---------- QR Invoice ----------
function QrInvoice() {
  const [num, setNum] = useState("INV-000001");
  const url = `${window.location.origin}/invoice/${num}`;
  return (
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><QrCode className="w-5 h-5" /> QR Code Invoice</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Input value={num} onChange={(e) => setNum(e.target.value)} placeholder="Invoice number" />
        <div className="p-4 bg-white inline-block rounded"><QRCodeCanvas value={url} size={200} /></div>
        <div className="text-xs text-muted-foreground break-all">{url}</div>
      </CardContent>
    </Card>
  );
}

// ---------- API Tokens ----------
function ApiTokens() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [name, setName] = useState("");
  const load = async () => { const { data } = await supabase.from("api_tokens").select("*").order("created_at",{ascending:false}); setTokens(data || []); };
  useEffect(() => { load(); }, []);
  const gen = async () => {
    if (!name.trim()) return toast.error("Name দিন");
    const raw = `sk_${crypto.randomUUID().replace(/-/g, "")}`;
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
    const hash = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    const { error } = await supabase.from("api_tokens").insert({ name, prefix: raw.slice(0, 10), token_hash: hash } as any);
    if (error) return toast.error(error.message);
    await navigator.clipboard.writeText(raw);
    toast.success("Token copied — শুধু এখনই দেখাবে: " + raw);
    setName(""); load();
  };
  const revoke = async (id: string) => {
    await supabase.from("api_tokens").update({ revoked_at: new Date().toISOString() } as any).eq("id", id);
    load();
  };
  return (
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5" /> API Access Tokens</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2"><Input placeholder="Token name" value={name} onChange={(e) => setName(e.target.value)} /><Button onClick={gen}>Generate</Button></div>
        <div className="space-y-2">
          {tokens.map((t) => (
            <div key={t.id} className="flex justify-between items-center border rounded p-2">
              <div><b>{t.name}</b> <code className="text-xs ml-2">{t.prefix}…</code></div>
              {t.revoked_at ? <Badge variant="destructive">Revoked</Badge> :
                <Button size="sm" variant="outline" onClick={() => revoke(t.id)}>Revoke</Button>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Webhooks ----------
const EVENTS = ["order.created", "order.status_changed", "payment.verified", "license.assigned", "lead.created"];
function Webhooks() {
  const [hooks, setHooks] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", url: "", events: [] as string[] });
  const load = async () => { const { data } = await supabase.from("webhooks").select("*").order("created_at",{ascending:false}); setHooks(data || []); };
  useEffect(() => { load(); }, []);
  const add = async () => {
    if (!form.url || !form.name) return toast.error("Name + URL দিন");
    const secret = crypto.randomUUID();
    const { error } = await supabase.from("webhooks").insert({ ...form, secret, is_active: true } as any);
    if (error) return toast.error(error.message);
    setForm({ name: "", url: "", events: [] }); load();
  };
  const toggleEvent = (ev: string) => setForm((f) => ({ ...f, events: f.events.includes(ev) ? f.events.filter(x => x !== ev) : [...f.events, ev] }));
  const del = async (id: string) => { await supabase.from("webhooks").delete().eq("id", id); load(); };
  const toggle = async (h: any) => { await supabase.from("webhooks").update({ is_active: !h.is_active } as any).eq("id", h.id); load(); };
  return (
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Webhook className="w-5 h-5" /> Webhooks</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 border rounded p-3">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="https://your-webhook.example.com" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          <div className="flex flex-wrap gap-2">{EVENTS.map((e) => (
            <Badge key={e} variant={form.events.includes(e) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleEvent(e)}>{e}</Badge>
          ))}</div>
          <Button onClick={add}>Add Webhook</Button>
        </div>
        <div className="space-y-2">
          {hooks.map((h) => (
            <div key={h.id} className="border rounded p-3 flex justify-between items-center gap-2 flex-wrap">
              <div><b>{h.name}</b> — <code className="text-xs">{h.url}</code><div className="text-xs text-muted-foreground">{(h.events || []).join(", ")}</div></div>
              <div className="flex gap-2">
                <Switch checked={h.is_active} onCheckedChange={() => toggle(h)} />
                <Button size="sm" variant="destructive" onClick={() => del(h.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Cron Manager ----------
function CronManager() {
  const jobs = [
    { name: "Email queue processor", schedule: "Every minute", endpoint: "/functions/v1/process-email-queue" },
    { name: "Scheduled publish", schedule: "Every 5 minutes", endpoint: "run_scheduled_publish()" },
    { name: "Sitemap refresh", schedule: "Daily 03:00", endpoint: "/functions/v1/sitemap-xml" },
  ];
  return (
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" /> Cron Jobs</CardTitle></CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead><tr className="text-left border-b"><th className="py-2">Name</th><th>Schedule</th><th>Endpoint</th></tr></thead>
          <tbody>{jobs.map((j) => (
            <tr key={j.name} className="border-b border-border/40">
              <td className="py-2">{j.name}</td><td>{j.schedule}</td><td><code className="text-xs">{j.endpoint}</code></td>
            </tr>
          ))}</tbody>
        </table>
        <p className="text-xs text-muted-foreground mt-3">Cron management Lovable Cloud-এ auto-managed। নতুন job define করতে DB migration ব্যবহার করুন।</p>
      </CardContent>
    </Card>
  );
}

// ---------- File Manager ----------
const BUCKETS = ["cms-media", "product-images", "client-docs", "digital-products"];
function FileManager() {
  const [bucket, setBucket] = useState(BUCKETS[0]);
  const [files, setFiles] = useState<any[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const load = async () => { const { data } = await supabase.storage.from(bucket).list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } }); setFiles(data || []); };
  useEffect(() => { load(); }, [bucket]);
  const upload = async (e: any) => {
    const f = e.target.files?.[0]; if (!f) return;
    const { error } = await supabase.storage.from(bucket).upload(`${Date.now()}-${f.name}`, f);
    if (error) toast.error(error.message); else { toast.success("Uploaded"); load(); }
  };
  const del = async (name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    await supabase.storage.from(bucket).remove([name]); load();
  };
  return (
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Folder className="w-5 h-5" /> File Manager</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Select value={bucket} onValueChange={setBucket}><SelectTrigger className="w-60"><SelectValue /></SelectTrigger>
            <SelectContent>{BUCKETS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select>
          <input ref={fileRef} type="file" hidden onChange={upload} />
          <Button onClick={() => fileRef.current?.click()}><Upload className="w-4 h-4 mr-1" /> Upload</Button>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
          {files.map((f) => (
            <div key={f.name} className="border rounded p-2 text-sm flex justify-between items-center gap-2">
              <span className="truncate">{f.name}</span>
              <Button size="sm" variant="destructive" onClick={() => del(f.name)}><Trash2 className="w-3 h-3" /></Button>
            </div>
          ))}
          {files.length === 0 && <p className="text-muted-foreground col-span-full">খালি</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Main ----------
export default function AdminAdvancedTools() {
  return (
    <div className="space-y-4">
      <Helmet><title>Advanced Tools — Admin</title></Helmet>
      <div>
        <h1 className="text-2xl font-bold">Advanced Tools</h1>
        <p className="text-muted-foreground text-sm">AI, automation, monitoring এবং developer tools একসাথে।</p>
      </div>
      <Tabs defaultValue="ai-desc">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="ai-desc"><Sparkles className="w-4 h-4 mr-1" />AI Product</TabsTrigger>
          <TabsTrigger value="ai-seo"><Search className="w-4 h-4 mr-1" />AI SEO</TabsTrigger>
          <TabsTrigger value="ai-support"><MessageSquare className="w-4 h-4 mr-1" />AI Reply</TabsTrigger>
          <TabsTrigger value="ai-email"><Mail className="w-4 h-4 mr-1" />AI Email</TabsTrigger>
          <TabsTrigger value="bulk-price">Bulk Price</TabsTrigger>
          <TabsTrigger value="dup">Duplicate</TabsTrigger>
          <TabsTrigger value="bulk-lic">Bulk License</TabsTrigger>
          <TabsTrigger value="timeline">Activity</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="dark">Dark Mode</TabsTrigger>
          <TabsTrigger value="kbd">Shortcuts</TabsTrigger>
          <TabsTrigger value="widgets">Widgets</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="qr">QR Invoice</TabsTrigger>
          <TabsTrigger value="api">API Tokens</TabsTrigger>
          <TabsTrigger value="hooks">Webhooks</TabsTrigger>
          <TabsTrigger value="cron">Cron</TabsTrigger>
          <TabsTrigger value="files">File Manager</TabsTrigger>
        </TabsList>
        <TabsContent value="ai-desc"><AiTool action="product_description" label="AI Product Description" placeholder="Title + features লিখুন" icon={Sparkles} /></TabsContent>
        <TabsContent value="ai-seo"><AiTool action="seo_meta" label="AI SEO Generator" placeholder="Page topic / product description" icon={Search} /></TabsContent>
        <TabsContent value="ai-support"><AiTool action="support_reply" label="AI Support Reply" placeholder="গ্রাহকের message paste করুন" icon={MessageSquare} /></TabsContent>
        <TabsContent value="ai-email"><AiTool action="email_writer" label="AI Email Writer" placeholder="Email-এর উদ্দেশ্য, audience, tone" icon={Mail} /></TabsContent>
        <TabsContent value="bulk-price"><BulkPrice /></TabsContent>
        <TabsContent value="dup"><DuplicateProduct /></TabsContent>
        <TabsContent value="bulk-lic"><BulkLicense /></TabsContent>
        <TabsContent value="timeline"><ActivityTimeline /></TabsContent>
        <TabsContent value="live"><LiveCounter /></TabsContent>
        <TabsContent value="errors"><ErrorLog /></TabsContent>
        <TabsContent value="health"><SystemHealth /></TabsContent>
        <TabsContent value="dark"><DarkModeTab /></TabsContent>
        <TabsContent value="kbd"><ShortcutsTab /></TabsContent>
        <TabsContent value="widgets"><DashboardWidgets /></TabsContent>
        <TabsContent value="search"><AdvancedSearch /></TabsContent>
        <TabsContent value="qr"><QrInvoice /></TabsContent>
        <TabsContent value="api"><ApiTokens /></TabsContent>
        <TabsContent value="hooks"><Webhooks /></TabsContent>
        <TabsContent value="cron"><CronManager /></TabsContent>
        <TabsContent value="files"><FileManager /></TabsContent>
      </Tabs>
    </div>
  );
}
