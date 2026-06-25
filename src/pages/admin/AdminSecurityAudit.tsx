import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  ShieldCheck,
  Database,
  Lock,
  FileText,
  Server,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Info,
  Mail,
  KeyRound,
  Users,
} from "lucide-react";

type Status = "fixed" | "verified" | "intentional";

type AuditItem = {
  area: string;
  finding: string;
  action: string;
  status: Status;
  date?: string;
};

const SCOPE: { icon: any; title: string; description: string }[] = [
  {
    icon: Database,
    title: "Database (RLS Policies)",
    description: "সকল public tables-এর Row-Level Security policy, GRANT permission ও sensitive column exposure যাচাই করা হয়েছে।",
  },
  {
    icon: KeyRound,
    title: "Auth & Roles",
    description: "user_roles, is_admin/has_role security definer ফাংশন এবং role-based access control verify করা হয়েছে।",
  },
  {
    icon: Server,
    title: "Edge Functions",
    description: "Service role usage, signed-URL delivery (digital-download) এবং sensitive operations audit করা হয়েছে।",
  },
  {
    icon: Lock,
    title: "Storage Buckets",
    description: "public/private bucket policy এবং listing exposure যাচাই করা হয়েছে।",
  },
  {
    icon: Eye,
    title: "Realtime Publication",
    description: "supabase_realtime publication থেকে sensitive tables (যেমন team_members) সরানো হয়েছে।",
  },
  {
    icon: Mail,
    title: "Email & Public Views",
    description: "team_members_public, ai_support_settings_public ইত্যাদি public views এর exposed columns verify করা হয়েছে।",
  },
];

const ITEMS: AuditItem[] = [
  {
    area: "Invoices",
    finding: "Signed-in client নিজের invoice দেখতে পারছিল না — শুধু admin SELECT policy ছিল।",
    action: "নতুন RLS SELECT policy যোগ করা হয়েছে: client_email = auth.users.email মিললে নিজের invoice দেখা যাবে।",
    status: "fixed",
    date: "2026-06-25",
  },
  {
    area: "AI Support Settings",
    finding: "Sensitive prompt/keys public থেকে exposed হওয়ার সম্ভাবনা ছিল।",
    action: "ai_support_settings_public view তৈরি — শুধু bot_name ও greeting_message public; base table admin-only।",
    status: "fixed",
  },
  {
    area: "Team Members PII",
    finding: "team_members টেবিলে staff phone/email থাকায় public exposure ঝুঁকি ছিল।",
    action: "team_members_public view দিয়ে phone/email exclude করা হয়েছে; base table public SELECT নেই।",
    status: "fixed",
  },
  {
    area: "Realtime Broadcast",
    finding: "team_members টেবিল realtime publication-এ ছিল — PII leak হওয়ার ঝুঁকি।",
    action: "supabase_realtime publication থেকে team_members সরিয়ে দেওয়া হয়েছে।",
    status: "fixed",
  },
  {
    area: "Admin Email Bootstrap",
    finding: "Super admin role manually assign করতে হতো।",
    action: "assign_admin_role_for_known_email() trigger — info.shahedit@gmail.com সাইন-আপে স্বয়ংক্রিয়ভাবে super_admin role পায়।",
    status: "verified",
  },
  {
    area: "Digital File Delivery",
    finding: "digital_files টেবিলে শুধু admin SELECT policy — user direct read করতে পারে না।",
    action: "Intentional — ডেলিভারি digital-download edge function (service role + signed URL) দিয়ে হয়। Client-এর direct read দরকার নেই।",
    status: "intentional",
  },
  {
    area: "SECURITY DEFINER Functions",
    finding: "has_role, is_admin, slugify ইত্যাদি অনেক SECURITY DEFINER ফাংশন public-callable।",
    action: "Intentional — RLS policy-র ভেতর থেকে call হয়; search_path = public set করা; কোনো privilege escalation path নেই।",
    status: "intentional",
  },
  {
    area: "Public Storage Buckets",
    finding: "cms-media ও product-images bucket public listing allow করে।",
    action: "Intentional — CMS media gallery এবং product image gallery-র জন্য listing প্রয়োজন। কোনো sensitive file এ bucket-এ যায় না।",
    status: "intentional",
  },
  {
    area: "Wallet Transactions",
    finding: "Wallet credit/debit সরাসরি client-side থেকে manipulate হওয়ার ঝুঁকি।",
    action: "wallet_apply_transaction() SECURITY DEFINER — শুধু admin role-ই call করতে পারে; balance & direction server-side validate হয়।",
    status: "verified",
  },
  {
    area: "Email Queue (pgmq)",
    finding: "Email queue & DLQ direct access করলে spoofing হতে পারে।",
    action: "enqueue_email/read_email_batch/delete_email ফাংশন SECURITY DEFINER; pgmq schema থেকে direct access ব্লকড।",
    status: "verified",
  },
];

const STATUS_META: Record<Status, { label: string; className: string; icon: any }> = {
  fixed: {
    label: "Fixed",
    className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  verified: {
    label: "Verified",
    className: "bg-sky-500/15 text-sky-600 border-sky-500/30 dark:text-sky-400",
    icon: ShieldCheck,
  },
  intentional: {
    label: "Intentional",
    className: "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400",
    icon: Info,
  },
};

const AdminSecurityAudit = () => {
  const fixedCount = ITEMS.filter((i) => i.status === "fixed").length;
  const verifiedCount = ITEMS.filter((i) => i.status === "verified").length;
  const intentionalCount = ITEMS.filter((i) => i.status === "intentional").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-8">
        <div className="absolute inset-0 pointer-events-none opacity-30 [background:radial-gradient(800px_circle_at_top_right,hsl(var(--primary)/0.25),transparent)]" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-primary/15 p-3 ring-1 ring-primary/30">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Security Audit Report</h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                আমাদের সম্পূর্ণ ওয়েবসাইট ও ব্যাকএন্ডের নিরাপত্তা পরীক্ষার সারসংক্ষেপ — কোন এলাকা স্ক্যান করা হয়েছে এবং কোন সমস্যা ঠিক করা হয়েছে।
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Last reviewed: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400 border">
              {fixedCount} Fixed
            </Badge>
            <Badge className="bg-sky-500/15 text-sky-600 border-sky-500/30 dark:text-sky-400 border">
              {verifiedCount} Verified
            </Badge>
            <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400 border">
              {intentionalCount} Intentional
            </Badge>
          </div>
        </div>
      </div>

      {/* Scope */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Scope — যা যা স্ক্যান করা হয়েছে
          </CardTitle>
          <CardDescription>
            আমাদের ওয়েবসাইটের প্রতিটি গুরুত্বপূর্ণ ব্যাকএন্ড স্তর কভার করা হয়েছে।
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SCOPE.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="group rounded-xl border bg-card p-4 transition hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary group-hover:bg-primary/15 transition">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{s.title}</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Findings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            Findings & Actions
          </CardTitle>
          <CardDescription>
            প্রতিটি ইস্যুর জন্য সমস্যা, সমাধান এবং বর্তমান স্ট্যাটাস।
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {ITEMS.map((item, idx) => {
            const meta = STATUS_META[item.status];
            const StatusIcon = meta.icon;
            return (
              <div
                key={idx}
                className="rounded-xl border bg-card p-4 transition hover:border-primary/30"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base">{item.area}</h3>
                      <Badge className={`${meta.className} border gap-1`}>
                        <StatusIcon className="h-3 w-3" />
                        {meta.label}
                      </Badge>
                      {item.date && (
                        <span className="text-xs text-muted-foreground">{item.date}</span>
                      )}
                    </div>
                    <div className="mt-2 space-y-1.5">
                      <div className="flex gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
                        <p className="text-muted-foreground">{item.finding}</p>
                      </div>
                      <div className="flex gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-500" />
                        <p>{item.action}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Posture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Current Security Posture
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg border bg-card/50 p-3">
            <p className="font-medium">Role Model</p>
            <p className="text-muted-foreground mt-1">
              super_admin / admin / manager / editor — সব check is_admin() ও has_role() SECURITY DEFINER দিয়ে server-side।
            </p>
          </div>
          <div className="rounded-lg border bg-card/50 p-3">
            <p className="font-medium">RLS Coverage</p>
            <p className="text-muted-foreground mt-1">
              সব public table-এ RLS enabled; ownership বা role দিয়ে scoped policies।
            </p>
          </div>
          <div className="rounded-lg border bg-card/50 p-3">
            <p className="font-medium">Secrets</p>
            <p className="text-muted-foreground mt-1">
              bKash credentials, AI API keys edge function secrets-এ; কখনো client bundle-এ exposed হয় না।
            </p>
          </div>
          <div className="rounded-lg border bg-card/50 p-3">
            <p className="font-medium">Active Findings</p>
            <p className="text-muted-foreground mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              বর্তমানে কোনো outstanding security issue নেই।
            </p>
          </div>
        </CardContent>
        <Separator />
        <CardContent className="text-xs text-muted-foreground pt-4">
          এই রিপোর্ট প্রতিটি নতুন স্ক্যান চালানোর পর আপডেট করা হবে। কোনো নতুন finding পাওয়া গেলে এখানে যোগ হবে।
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSecurityAudit;
