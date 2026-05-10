import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
  Search,
  Wallet,
  LogIn,
  ChevronDown,
} from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SEO } from "@/components/SEO";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(2, "নাম লিখুন"),
  email: z.string().trim().email("সঠিক ইমেইল দিন"),
  phone: z.string().trim().min(8, "ফোন নাম্বার দিন"),
  orderId: z.string().trim().optional(),
  reason: z.string().trim().min(10, "কারণ বিস্তারিত লিখুন"),
});

const eligibleList = [
  "ডেলিভার করা লাইসেন্স কী সম্পূর্ণ কাজ না করলে",
  "অর্ডার করা পণ্যের বদলে ভিন্ন পণ্য ডেলিভার হলে",
  "পেমেন্ট সফল হলেও ২৪ ঘণ্টার মধ্যে পণ্য না পেলে",
  "একই অর্ডারে ডাবল পেমেন্ট হয়ে গেলে",
  "স্টক শেষ হওয়ায় সরবরাহ সম্ভব না হলে",
];

const notEligibleList = [
  "লাইসেন্স কী সফলভাবে ব্যবহার করা হয়ে গেলে",
  "ডেলিভারির ২৪ ঘণ্টার পরে অভিযোগ করলে",
  "ক্রেতার ভুলে পণ্য ব্যবহার করতে না পারলে",
  "ইন্টারনেট বা ডিভাইস সমস্যার কারণে কাজ না করলে",
];

const specialRules = [
  "সাবস্ক্রিপশন: অব্যবহৃত মাসের সমানুপাতিক রিফান্ড বিবেচনা করা হয়",
  "বান্ডেল অফার: শুধু সমস্যাযুক্ত পণ্যের রিফান্ড প্রযোজ্য",
  "ডিসকাউন্ট মূল্যে কেনা পণ্যে ডিসকাউন্ট মূল্যই ফেরত দেওয়া হবে",
];

const warnings = [
  "Change of Mind সহ যেকোনো রিফান্ডের ক্ষেত্রে গেটওয়ে, সার্ভিস ও ব্যাংক চার্জ বাবদ ১০% কেটে বাকি টাকা ফেরত দেওয়া হবে।",
  "রিফান্ডের ক্ষেত্রে ব্যাংক কর্তৃক আরোপিত যেকোনো ফি বা চার্জ ক্রেতাকে বহন করতে হবে।",
  "প্রোডাক্ট ব্যবহারকালীন সমস্যার সমাধানে সর্বোচ্চ ৩ কর্মদিবস সময় প্রযোজ্য। গ্রাহক ক্রয়ের মাধ্যমে এই শর্তে সম্মতি প্রদান করছেন।",
];

const steps = [
  {
    icon: ClipboardList,
    title: "আবেদন জমা",
    time: "২৪ ঘণ্টার মধ্যে",
    desc: "অর্ডার নম্বর, সমস্যার বিবরণ ও স্ক্রিনশট সহ ফর্ম পূরণ করুন।",
  },
  {
    icon: Search,
    title: "যাচাই",
    time: "১–৬ ঘণ্টা",
    desc: "আমাদের টিম সমস্যাটি যাচাই করে সমাধান বা রিফান্ড অনুমোদন করবে।",
  },
  {
    icon: Wallet,
    title: "রিফান্ড প্রদান",
    time: "১–২৪ ঘণ্টা",
    desc: "bKash/Online: ১–২৪ ঘণ্টা। Gateway রিফান্ড সাধারণত ৩–৭ কার্যদিবস।",
  },
];

export default function RefundRequestPage() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: user?.email ?? "",
    phone: "",
    orderId: "",
    reason: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("leads").insert({
      name: form.name,
      email: form.email,
      phone: form.phone,
      service_interested: "Refund Request",
      project_description: `Order/Invoice ID: ${form.orderId || "N/A"}\n\nReason:\n${form.reason}`,
      source: "contact_form",
    });
    setLoading(false);
    if (error) {
      toast.error("জমা দিতে সমস্যা হয়েছে");
      return;
    }
    setSubmitted(true);
    toast.success("রিফান্ড অনুরোধ পাঠানো হয়েছে");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Refund Request — Shahed IT"
        description="অর্ডারের জন্য রিফান্ড অনুরোধ জমা দিন। আমাদের পলিসি পড়ুন এবং নিরাপদে রিফান্ড আবেদন করুন।"
      />
      <SiteHeader />

      <main className="container mx-auto px-4 py-12 md:py-16 max-w-5xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-5">
            <RefreshCcw className="w-4 h-4" /> Refund Request
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4">
            Refund Request
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            রিফান্ড আবেদনের আগে আমাদের পলিসি মনোযোগ দিয়ে পড়ুন এবং নিচের ফর্মটি পূরণ করুন।
          </p>
        </motion.div>

        {/* Policy Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl border border-border bg-card/60 backdrop-blur p-6 md:p-8 mb-8"
        >
          <Collapsible open={policyOpen} onOpenChange={setPolicyOpen}>
            <CollapsibleTrigger className="w-full flex items-center justify-between gap-4 group">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <RefreshCcw className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg md:text-xl font-bold">Refund & Return Policy</h2>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    আবেদনের আগে পলিসিটি পড়ুন
                  </p>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "w-5 h-5 text-muted-foreground transition-transform",
                  policyOpen && "rotate-180"
                )}
              />
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-6 space-y-6">
              {/* Two summary cards */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <h3 className="font-semibold">রিফান্ড পাবেন</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    পণ্য কাজ না করলে বা ভুল ডেলিভারি হলে ২৪ ঘণ্টার মধ্যে রিপোর্ট করুন।
                  </p>
                </div>
                <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <h3 className="font-semibold">রিফান্ড পাবেন না</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    পণ্য ব্যবহারের পরে বা ২৪ ঘণ্টার পরে সাধারণত রিফান্ড প্রযোজ্য নয়।
                  </p>
                </div>
              </div>

              {/* Eligible */}
              <div className="rounded-2xl border border-border bg-background/40 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold">রিফান্ড পাওয়ার যোগ্য পরিস্থিতি</h3>
                </div>
                <ul className="space-y-2 pl-2">
                  {eligibleList.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                      <span className="text-foreground/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Not eligible */}
              <div className="rounded-2xl border border-border bg-background/40 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-red-500" />
                  </div>
                  <h3 className="font-semibold">রিফান্ড প্রযোজ্য নয় যখন</h3>
                </div>
                <ul className="space-y-2 pl-2">
                  {notEligibleList.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      <span className="text-foreground/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Special rules */}
              <div className="rounded-2xl border border-border bg-background/40 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                  </div>
                  <h3 className="font-semibold">বিশেষ গুরুত্বপূর্ণ নিয়ম</h3>
                </div>
                <ul className="space-y-2 pl-2">
                  {specialRules.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      <span className="text-foreground/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Warnings */}
              <div className="space-y-3">
                {warnings.map((w, i) => (
                  <div
                    key={i}
                    className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"
                  >
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground/90">{w}</p>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </motion.section>

        {/* Process timeline */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-border bg-card/60 backdrop-blur p-6 md:p-8 mb-8"
        >
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">
            রিফান্ড প্রক্রিয়া ও সময়সীমা
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  className="relative rounded-2xl border border-border bg-background/40 p-5"
                >
                  <div className="absolute -top-3 -left-3 w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center font-bold text-sm shadow-lg">
                    {i + 1}
                  </div>
                  <Icon className="w-7 h-7 text-primary mb-3" />
                  <h3 className="font-semibold mb-1">{s.title}</h3>
                  <p className="text-xs text-primary font-medium mb-2">{s.time}</p>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Form / Login gate */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl border border-border bg-card/60 backdrop-blur p-6 md:p-10"
        >
          {!user ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <LogIn className="w-7 h-7 text-primary-foreground" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold mb-2">লগইন আবশ্যক</h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                রিফান্ড রিকোয়েস্ট করতে আপনাকে অবশ্যই লগইন করতে হবে। এটি আপনার অর্ডার যাচাই
                এবং রিফান্ড প্রক্রিয়া নিরাপদ করতে সাহায্য করে।
              </p>
              <Button asChild size="lg">
                <Link to={`/login?redirect=/refund-request`}>
                  <LogIn className="w-4 h-4 mr-2" /> লগইন করুন
                </Link>
              </Button>
            </div>
          ) : submitted ? (
            <div className="text-center py-10">
              <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">অনুরোধ পাঠানো হয়েছে ✅</h2>
              <p className="text-muted-foreground mb-6">
                আমাদের টিম ২৪ ঘণ্টার মধ্যে যোগাযোগ করবে।
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild variant="outline">
                  <Link to="/">Home</Link>
                </Button>
                <Button asChild>
                  <Link to="/refund-policy">Refund Policy</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <RefreshCcw className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">রিফান্ড আবেদন ফর্ম</h2>
                  <p className="text-sm text-muted-foreground">নিচের তথ্যগুলো পূরণ করুন</p>
                </div>
              </div>
              <form onSubmit={submit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>নাম *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="আপনার নাম"
                    />
                  </div>
                  <div>
                    <Label>ফোন *</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                </div>
                <div>
                  <Label>ইমেইল *</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <Label>Order / Invoice ID</Label>
                  <Input
                    value={form.orderId}
                    onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                    placeholder="যদি জানা থাকে"
                  />
                </div>
                <div>
                  <Label>রিফান্ডের কারণ *</Label>
                  <Textarea
                    rows={5}
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    placeholder="বিস্তারিত লিখুন..."
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full" size="lg">
                  {loading ? "পাঠানো হচ্ছে..." : "Submit Request"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  আমাদের{" "}
                  <Link to="/refund-policy" className="underline">
                    Refund Policy
                  </Link>{" "}
                  অনুসরণ করে অনুরোধ প্রসেস হবে।
                </p>
              </form>
            </>
          )}
        </motion.section>
      </main>
      <SiteFooter />
    </div>
  );
}
