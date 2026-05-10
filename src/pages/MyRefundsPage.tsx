import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCcw, Plus, Clock, CheckCircle2, XCircle, FileText, Image as ImageIcon, Loader2, Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Attachment = { name: string; path: string; size: number; type: string };

interface RefundRequest {
  id: string;
  request_number: string;
  name: string;
  email: string;
  phone: string;
  order_id: string | null;
  reason: string;
  status: string;
  admin_notes: string | null;
  attachments: Attachment[] | null;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<string, { label: string; bn: string; icon: any; color: string }> = {
  pending: { label: "Pending", bn: "অপেক্ষমাণ", icon: Clock, color: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  approved: { label: "Approved", bn: "অনুমোদিত", icon: CheckCircle2, color: "bg-green-500/15 text-green-600 border-green-500/30" },
  rejected: { label: "Rejected", bn: "প্রত্যাখ্যাত", icon: XCircle, color: "bg-red-500/15 text-red-600 border-red-500/30" },
  processing: { label: "Processing", bn: "প্রসেসিং", icon: Loader2, color: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
  completed: { label: "Completed", bn: "সম্পন্ন", icon: CheckCircle2, color: "bg-green-500/15 text-green-600 border-green-500/30" },
};

export default function MyRefundsPage() {
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("refund_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) toast.error("রিকোয়েস্ট লোড করা যায়নি");
      setRequests((data as any) ?? []);
      setLoading(false);
    })();
  }, [user]);

  const openAttachment = async (path: string) => {
    const { data, error } = await supabase.storage
      .from("refund-attachments")
      .createSignedUrl(path, 60 * 10);
    if (error || !data) {
      toast.error("ফাইল খোলা যায়নি");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  if (authLoading) return null;
  if (!user) return <Navigate to="/login?redirect=/my-refunds" replace />;

  return (
    <div className="min-h-screen bg-background">
      <SEO title="আমার রিফান্ড রিকোয়েস্ট — Shahed IT" description="আপনার সব রিফান্ড রিকোয়েস্টের স্ট্যাটাস ট্র্যাক করুন।" />
      <SiteHeader />

      <main className="container mx-auto px-4 py-12 md:py-16 max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
              <RefreshCcw className="w-4 h-4" /> My Refund Requests
            </div>
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              আমার রিফান্ড রিকোয়েস্ট
            </h1>
            <p className="text-muted-foreground mt-2">
              আপনার জমা দেওয়া সব রিফান্ড রিকোয়েস্টের বর্তমান স্ট্যাটাস দেখুন।
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/refund-request">
              <Plus className="w-4 h-4 mr-1" /> নতুন রিকোয়েস্ট
            </Link>
          </Button>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border border-border bg-card/60 backdrop-blur">
            <Inbox className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">কোনো রিকোয়েস্ট নেই</h2>
            <p className="text-muted-foreground mb-6">আপনি এখনও কোনো রিফান্ড রিকোয়েস্ট জমা দেননি।</p>
            <Button asChild>
              <Link to="/refund-request"><Plus className="w-4 h-4 mr-1" /> প্রথম রিকোয়েস্ট জমা দিন</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((r, idx) => {
              const cfg = statusConfig[r.status] ?? statusConfig.pending;
              const Icon = cfg.icon;
              const atts = Array.isArray(r.attachments) ? r.attachments : [];
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="rounded-2xl border border-border bg-card/60 backdrop-blur p-5 md:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Request ID</p>
                      <code className="text-base md:text-lg font-bold text-primary">{r.request_number}</code>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(r.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                    </div>
                    <Badge variant="outline" className={cn("gap-1.5 text-sm py-1.5 px-3", cfg.color)}>
                      <Icon className={cn("w-4 h-4", r.status === "processing" && "animate-spin")} />
                      {cfg.label} • {cfg.bn}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                    {r.order_id && (
                      <div>
                        <p className="text-xs text-muted-foreground">Order ID</p>
                        <p className="font-medium">{r.order_id}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">ফোন</p>
                      <p className="font-medium">{r.phone}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-1">কারণ</p>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">{r.reason}</p>
                  </div>

                  {r.admin_notes && (
                    <div className="mb-4 rounded-xl border border-primary/30 bg-primary/5 p-3">
                      <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">Admin Note</p>
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap">{r.admin_notes}</p>
                    </div>
                  )}

                  {atts.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">সংযুক্ত ফাইল ({atts.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {atts.map((a) => {
                          const isImg = a.type?.startsWith("image/");
                          return (
                            <button
                              key={a.path}
                              type="button"
                              onClick={() => openAttachment(a.path)}
                              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-1.5 text-xs hover:border-primary hover:bg-primary/5 transition-colors"
                            >
                              {isImg ? <ImageIcon className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                              <span className="max-w-[180px] truncate">{a.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
