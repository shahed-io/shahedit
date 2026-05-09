import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Copy, Smartphone, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";

const paymentMethods = [
  { id: "bkash_send", label: "বিকাশ (Send Money)", number: "01820060046", color: "#E2136E", logo: "Bkash" },
  { id: "nagad_send", label: "নগদ (Send Money)", number: "01820060046", color: "#F6821F", logo: "নগদ" },
  { id: "rocket_send", label: "রকেট (Send Money)", number: "01820060046", color: "#8B1FA8", logo: "Rocket" },
  { id: "upay_send", label: "উপায় (Send Money)", number: "01820060046", color: "#00A651", logo: "উপায়" },
  { id: "bkash_merchant", label: "বিকাশ মার্চেন্ট", number: "01820060046", color: "#E2136E", logo: "Bkash" },
];

const PaymentPage = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", service: "", amount: "", transaction_id: "", note: ""
  });

  const selectedMethod = paymentMethods.find(m => m.id === selected);

  const copyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    toast.success("নম্বর কপি করা হয়েছে!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) { toast.error("পেমেন্ট মেথড সিলেক্ট করুন"); return; }
    if (!form.transaction_id.trim()) { toast.error("Transaction ID দিন"); return; }
    if (!form.amount || isNaN(Number(form.amount))) { toast.error("সঠিক পরিমাণ দিন"); return; }

    setLoading(true);
    const { error } = await supabase.from("payment_submissions" as any).insert({
      name: form.name,
      phone: form.phone,
      email: form.email || null,
      service: form.service || null,
      amount: Number(form.amount),
      payment_method: selectedMethod?.label,
      transaction_id: form.transaction_id,
      note: form.note || null,
      status: "pending",
    });
    setLoading(false);

    if (error) { toast.error("সমস্যা হয়েছে, আবার চেষ্টা করুন"); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <section className="py-32 flex items-center justify-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">সফলভাবে জমা হয়েছে! ✅</h2>
            <p className="text-muted-foreground mb-2">আপনার পেমেন্ট তথ্য পাওয়া গেছে।</p>
            <p className="text-muted-foreground text-sm mb-8">আমরা যাচাই করে <strong className="text-foreground">২৪ ঘন্টার মধ্যে</strong> WhatsApp/Email-এ কনফার্ম করব।</p>
            <Button onClick={() => { setSubmitted(false); setSelected(null); setForm({ name: "", phone: "", email: "", service: "", amount: "", transaction_id: "", note: "" }); }} className="glossy-btn">
              নতুন পেমেন্ট করুন
            </Button>
          </motion.div>
        </section>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">Payment</span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">
              পেমেন্ট <span className="gradient-text">করুন</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">নিচের যেকোনো মেথডে পেমেন্ট করুন এবং Transaction ID জমা দিন।</p>
          </motion.div>

          {/* Step 1: Select method */}
          <div className="mb-10">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold">১</span>
              পেমেন্ট মেথড বেছে নিন
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {paymentMethods.map((m) => (
                <motion.button
                  key={m.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelected(m.id)}
                  className={`glossy-card rounded-2xl border p-4 text-center transition-all duration-200 ${selected === m.id ? "border-primary shadow-lg shadow-primary/20" : "border-border hover:border-primary/40"}`}
                >
                  <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: m.color }}>
                    {m.logo.slice(0, 2)}
                  </div>
                  <p className="text-xs font-semibold text-foreground leading-tight">{m.label}</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Step 2: Show number */}
          <AnimatePresence>
            {selectedMethod && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-10">
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold">২</span>
                  এই নম্বরে পেমেন্ট করুন
                </h2>
                <div className="glossy-card rounded-2xl border border-primary/30 p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ background: selectedMethod.color }}>
                      <Smartphone size={22} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{selectedMethod.label}</p>
                      <p className="text-2xl font-bold text-foreground tracking-wider">{selectedMethod.number}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => copyNumber(selectedMethod.number)} className="gap-2">
                    <Copy size={14} /> কপি করুন
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 3: Form */}
          <AnimatePresence>
            {selected && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold">৩</span>
                  পেমেন্ট তথ্য জমা দিন
                </h2>
                <form onSubmit={handleSubmit} className="glossy-card rounded-2xl border border-border p-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>আপনার নাম *</Label>
                      <Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="পূর্ণ নাম" className="mt-1" />
                    </div>
                    <div>
                      <Label>মোবাইল নম্বর *</Label>
                      <Input required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="01XXXXXXXXX" className="mt-1" />
                    </div>
                    <div>
                      <Label>ইমেইল (ঐচ্ছিক)</Label>
                      <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="example@email.com" className="mt-1" />
                    </div>
                    <div>
                      <Label>সার্ভিসের নাম (ঐচ্ছিক)</Label>
                      <Input value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value }))} placeholder="যেমন: Web Design" className="mt-1" />
                    </div>
                    <div>
                      <Label>পেমেন্টের পরিমাণ (টাকা) *</Label>
                      <Input required type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="500" className="mt-1" />
                    </div>
                    <div>
                      <Label>Transaction ID *</Label>
                      <Input required value={form.transaction_id} onChange={e => setForm(f => ({ ...f, transaction_id: e.target.value }))} placeholder="যেমন: 8JK2FT1X9P" className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label>অতিরিক্ত তথ্য (ঐচ্ছিক)</Label>
                    <Input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="কোনো বিশেষ তথ্য থাকলে লিখুন" className="mt-1" />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full glossy-btn gap-2 h-12">
                    {loading ? "জমা হচ্ছে..." : <><Send size={16} /> পেমেন্ট জমা দিন</>}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">পেমেন্ট যাচাই হলে ২৪ ঘন্টার মধ্যে WhatsApp/Email-এ কনফার্মেশন পাবেন।</p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
};

export default PaymentPage;
