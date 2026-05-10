import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCcw, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SEO from "@/components/SEO";

const schema = z.object({
  name: z.string().trim().min(2, "নাম লিখুন"),
  email: z.string().trim().email("সঠিক ইমেইল দিন"),
  phone: z.string().trim().min(8, "ফোন নাম্বার দিন"),
  orderId: z.string().trim().optional(),
  reason: z.string().trim().min(10, "কারণ বিস্তারিত লিখুন"),
});

export default function RefundRequestPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", orderId: "", reason: "" });

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
        description="অর্ডারের জন্য রিফান্ড অনুরোধ জমা দিন। আমাদের টিম ২৪ ঘণ্টার মধ্যে যোগাযোগ করবে।"
      />
      <SiteHeader />
      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border bg-card/60 backdrop-blur p-8 md:p-10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <RefreshCcw className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Refund Request</h1>
              <p className="text-sm text-muted-foreground">রিফান্ডের অনুরোধ জমা দিন</p>
            </div>
          </div>

          {submitted ? (
            <div className="text-center py-10">
              <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">অনুরোধ পাঠানো হয়েছে ✅</h2>
              <p className="text-muted-foreground mb-6">আমাদের টিম ২৪ ঘণ্টার মধ্যে যোগাযোগ করবে।</p>
              <div className="flex gap-3 justify-center">
                <Button asChild variant="outline"><Link to="/">Home</Link></Button>
                <Button asChild><Link to="/refund-policy">Refund Policy</Link></Button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>নাম *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="আপনার নাম" />
                </div>
                <div>
                  <Label>ফোন *</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" />
                </div>
              </div>
              <div>
                <Label>ইমেইল *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
              </div>
              <div>
                <Label>Order / Invoice ID</Label>
                <Input value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} placeholder="যদি জানা থাকে" />
              </div>
              <div>
                <Label>রিফান্ডের কারণ *</Label>
                <Textarea rows={5} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="বিস্তারিত লিখুন..." />
              </div>
              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? "পাঠানো হচ্ছে..." : "Submit Request"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                আমাদের <Link to="/refund-policy" className="underline">Refund Policy</Link> অনুসরণ করে অনুরোধ প্রসেস হবে।
              </p>
            </form>
          )}
        </motion.div>
      </main>
      <SiteFooter />
    </div>
  );
}
