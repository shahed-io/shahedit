import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Star, MessageSquare, ShieldAlert, BarChart3, CheckCircle2, XCircle,
  Trash2, Search, Reply, Loader2,
} from "lucide-react";

type Review = {
  id: string; package_id: string; user_id: string; rating: number;
  title: string | null; comment: string | null; admin_reply: string | null;
  status: "pending" | "approved" | "rejected" | "spam";
  is_spam: boolean; spam_score: number | null; spam_reasons: string[] | null;
  created_at: string;
};
type Pkg = { id: string; title: string };
type Summary = {
  package_id: string; package_title: string; total: number; approved: number;
  pending: number; spam: number; avg_rating: number;
  r5: number; r4: number; r3: number; r2: number; r1: number;
};

const STATUS_BADGE: Record<Review["status"], string> = {
  approved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  rejected: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border-zinc-500/30",
  spam: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
};

function Stars({ n }: { n: number }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < n ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
      ))}
    </div>
  );
}

/* ----- Reviews List (Approve/Reject + Spam tabs share this) ----- */
function ReviewList({ statusFilter }: { statusFilter: "all" | Review["status"] | "spam_only" }) {
  const [rows, setRows] = useState<Review[]>([]);
  const [pkgs, setPkgs] = useState<Record<string, string>>({});
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [replyOpen, setReplyOpen] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const load = async () => {
    setLoading(true);
    let query = supabase.from("product_reviews").select("*").order("created_at", { ascending: false }).limit(500);
    if (statusFilter === "spam_only") query = query.or("status.eq.spam,is_spam.eq.true");
    else if (statusFilter !== "all") query = query.eq("status", statusFilter);
    const { data, error } = await query;
    if (error) toast.error(error.message);
    const list = (data as Review[]) || [];
    setRows(list);
    const ids = [...new Set(list.map(r => r.package_id))];
    if (ids.length) {
      const { data: p } = await supabase.from("service_packages").select("id,title").in("id", ids);
      const m: Record<string, string> = {};
      (p || []).forEach((x: any) => { m[x.id] = x.title; });
      setPkgs(m);
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, [statusFilter]);

  const filtered = useMemo(() =>
    rows.filter(r => !q || `${r.title || ""} ${r.comment || ""} ${pkgs[r.package_id] || ""}`.toLowerCase().includes(q.toLowerCase())),
  [rows, q, pkgs]);

  const setStatus = async (id: string, status: Review["status"]) => {
    const patch: any = { status };
    if (status === "spam") patch.is_spam = true;
    if (status === "approved") patch.is_spam = false;
    const { error } = await supabase.from("product_reviews").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${status}`);
    load();
  };

  const saveReply = async (id: string) => {
    const { error } = await supabase.from("product_reviews").update({
      admin_reply: replyText || null,
      replied_at: replyText ? new Date().toISOString() : null,
    }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Reply saved");
    setReplyOpen(null); setReplyText("");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    const { error } = await supabase.from("product_reviews").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Reviews</CardTitle>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search review or product…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 justify-center py-10 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">No reviews</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(r => (
              <div key={r.id} className="rounded-lg border p-3 bg-card/50">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Stars n={r.rating} />
                      <Badge variant="outline" className={STATUS_BADGE[r.status]}>{r.status}</Badge>
                      {r.is_spam && r.status !== "spam" && <Badge variant="outline" className={STATUS_BADGE.spam}>spam-flagged</Badge>}
                      {r.spam_score != null && Number(r.spam_score) > 0 && (
                        <span className="text-xs text-muted-foreground">spam score: {Number(r.spam_score).toFixed(2)}</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      on <span className="text-foreground">{pkgs[r.package_id] || r.package_id.slice(0, 8)}</span> · {new Date(r.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                {r.title && <div className="font-medium mt-2">{r.title}</div>}
                {r.comment && <p className="text-sm mt-1 whitespace-pre-wrap">{r.comment}</p>}
                {r.spam_reasons?.length ? (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {r.spam_reasons.map(x => <Badge key={x} variant="outline" className="text-xs">{x}</Badge>)}
                  </div>
                ) : null}
                {r.admin_reply && (
                  <div className="mt-2 rounded-md bg-muted/50 p-2 text-sm border-l-2 border-primary">
                    <div className="text-xs font-medium text-primary mb-0.5">Admin reply</div>
                    {r.admin_reply}
                  </div>
                )}
                {replyOpen === r.id ? (
                  <div className="mt-2 space-y-2">
                    <Textarea rows={2} placeholder="Write a public reply…" value={replyText} onChange={e => setReplyText(e.target.value)} />
                    <div className="flex gap-1">
                      <Button size="sm" onClick={() => saveReply(r.id)}>Save reply</Button>
                      <Button size="sm" variant="outline" onClick={() => { setReplyOpen(null); setReplyText(""); }}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {r.status !== "approved" && <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "approved")}><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve</Button>}
                    {r.status !== "rejected" && <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "rejected")}><XCircle className="h-3.5 w-3.5 mr-1" /> Reject</Button>}
                    {r.status !== "spam" && <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "spam")}><ShieldAlert className="h-3.5 w-3.5 mr-1" /> Spam</Button>}
                    {r.status !== "pending" && <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "pending")}>Pending</Button>}
                    <Button size="sm" variant="outline" onClick={() => { setReplyOpen(r.id); setReplyText(r.admin_reply || ""); }}><Reply className="h-3.5 w-3.5 mr-1" /> Reply</Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ----- Rating Summary ----- */
function SummaryTab() {
  const [rows, setRows] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase.rpc as any)("review_rating_summary", { _package_id: null });
    if (error) toast.error(error.message);
    setRows((data as Summary[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const totals = rows.reduce((a, r) => ({
    total: a.total + Number(r.total || 0),
    approved: a.approved + Number(r.approved || 0),
    pending: a.pending + Number(r.pending || 0),
    spam: a.spam + Number(r.spam || 0),
  }), { total: 0, approved: 0, pending: 0, spam: 0 });

  const overallAvg = rows.length
    ? (rows.reduce((s, r) => s + (Number(r.avg_rating) || 0) * Number(r.approved || 0), 0) /
        Math.max(1, totals.approved)).toFixed(2)
    : "0";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Avg Rating", value: overallAvg, icon: Star, cls: "text-amber-500" },
          { label: "Total", value: totals.total, icon: MessageSquare, cls: "text-blue-500" },
          { label: "Approved", value: totals.approved, icon: CheckCircle2, cls: "text-emerald-500" },
          { label: "Pending", value: totals.pending, icon: BarChart3, cls: "text-amber-500" },
          { label: "Spam", value: totals.spam, icon: ShieldAlert, cls: "text-red-500" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-6 w-6 ${s.cls}`} />
              <div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="text-xl font-bold">{s.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Per-Product Ratings</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 justify-center py-8 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
          ) : rows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No review data yet</div>
          ) : (
            <div className="space-y-3">
              {rows.map(r => {
                const totalRated = r.r1 + r.r2 + r.r3 + r.r4 + r.r5 || 1;
                return (
                  <div key={r.package_id} className="rounded-lg border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium truncate">{r.package_title || "—"}</div>
                      <div className="flex items-center gap-2 text-sm">
                        <Stars n={Math.round(Number(r.avg_rating || 0))} />
                        <span className="font-semibold">{Number(r.avg_rating || 0).toFixed(2)}</span>
                        <span className="text-muted-foreground">({r.approved} approved · {r.pending} pending · {r.spam} spam)</span>
                      </div>
                    </div>
                    <div className="mt-2 space-y-1">
                      {[5, 4, 3, 2, 1].map(star => {
                        const v = (r as any)["r" + star] as number;
                        const pct = (v / totalRated) * 100;
                        return (
                          <div key={star} className="flex items-center gap-2 text-xs">
                            <div className="w-8 text-right">{star}★</div>
                            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                              <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="w-10 text-right text-muted-foreground">{v}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ----- Page ----- */
export default function AdminReviews() {
  const [tab, setTab] = useState<"all" | "pending" | "spam" | "summary">("pending");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Reviews</h1>
          <p className="text-sm text-muted-foreground">Approve, reject, fight spam, and watch your rating health.</p>
        </div>
      </div>
      <Tabs value={tab} onValueChange={(v: any) => setTab(v)}>
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="pending"><MessageSquare className="h-4 w-4 mr-1" /> Approve / Reject</TabsTrigger>
          <TabsTrigger value="all"><Star className="h-4 w-4 mr-1" /> Product Reviews</TabsTrigger>
          <TabsTrigger value="spam"><ShieldAlert className="h-4 w-4 mr-1" /> Spam Detection</TabsTrigger>
          <TabsTrigger value="summary"><BarChart3 className="h-4 w-4 mr-1" /> Rating Summary</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4"><ReviewList statusFilter="pending" /></TabsContent>
        <TabsContent value="all" className="mt-4"><ReviewList statusFilter="all" /></TabsContent>
        <TabsContent value="spam" className="mt-4"><ReviewList statusFilter="spam_only" /></TabsContent>
        <TabsContent value="summary" className="mt-4"><SummaryTab /></TabsContent>
      </Tabs>
    </div>
  );
}
