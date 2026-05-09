import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
import type { FAQ } from "@/lib/supabase-types";

const fallbackFaqs: FAQ[] = [
  { id: "1", question: "আপনাদের সার্ভিস কত দিনের মধ্যে ডেলিভারি পাওয়া যায়?", answer: "সার্ভিস অনুযায়ী ৫ মিনিট থেকে ২৪ ঘন্টার মধ্যে ডেলিভারি দেওয়া হয়। জরুরি ডেলিভারির জন্য আলাদাভাবে যোগাযোগ করুন।", category: null, sort_order: 1, is_published: true, created_at: "", updated_at: "" },
  { id: "2", question: "পেমেন্ট করার পর কীভাবে সার্ভিস পাবো?", answer: "পেমেন্ট নিশ্চিত হওয়ার পর Email / WhatsApp / Client Panel-এর মাধ্যমে ডেলিভারি দেওয়া হয়। আপনাকে নোটিফিকেশন পাঠানো হবে।", category: null, sort_order: 2, is_published: true, created_at: "", updated_at: "" },
  { id: "3", question: "রিফান্ড পাওয়া কি সম্ভব?", answer: "ডিজিটাল সার্ভিস ডেলিভারির পূর্বে সমস্যা হলে রিফান্ড বিবেচনা করা হয়। অনুমোদিত হলে ৩-৭ কার্যদিবসের মধ্যে রিফান্ড সম্পন্ন হবে।", category: null, sort_order: 3, is_published: true, created_at: "", updated_at: "" },
  { id: "4", question: "সাপোর্ট কখন পাওয়া যায়?", answer: "আমাদের সাপোর্ট সময় সকাল ১০:০০ থেকে রাত ১০:০০ পর্যন্ত, সপ্তাহের ৭ দিন। ফোন, ইমেইল বা WhatsApp-এ যোগাযোগ করুন।", category: null, sort_order: 4, is_published: true, created_at: "", updated_at: "" },
  { id: "5", question: "কোন কোন পেমেন্ট মেথড গ্রহণ করা হয়?", answer: "Bkash, Nagad, Rocket, ব্যাংক ট্রান্সফার এবং অনলাইন পেমেন্ট গেটওয়ে গ্রহণ করা হয়।", category: null, sort_order: 5, is_published: true, created_at: "", updated_at: "" },
  { id: "6", question: "ওয়েবসাইট ডিজাইনের জন্য কত টাকা লাগে?", answer: "ওয়েবসাইটের ধরন ও ফিচার অনুযায়ী মূল্য নির্ধারিত হয়। বিস্তারিত জানতে আমাদের সাথে যোগাযোগ করুন বা Get a Quote ফর্ম পূরণ করুন।", category: null, sort_order: 6, is_published: true, created_at: "", updated_at: "" },
  { id: "7", question: "আপনাদের সার্ভিস কি বাংলাদেশের বাইরে পাওয়া যায়?", answer: "হ্যাঁ, আমরা বিশ্বের যেকোনো দেশে ডিজিটাল সার্ভিস প্রদান করি। ডেলিভারি সম্পূর্ণ অনলাইনে করা হয়।", category: null, sort_order: 7, is_published: true, created_at: "", updated_at: "" },
  { id: "8", question: "সার্ভিস নেওয়ার পর কোনো সমস্যা হলে কী করবো?", answer: "সমস্যা হলে আমাদের সাপোর্টে যোগাযোগ করুন। অভিযোগ যাচাই করে ২৪ ঘন্টার মধ্যে সমাধান প্রদান করা হবে।", category: null, sort_order: 8, is_published: true, created_at: "", updated_at: "" },
];

const FAQPage = () => {
  const [faqs, setFaqs] = useState<FAQ[]>(fallbackFaqs);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("faqs").select("*").eq("is_published", true).order("sort_order").then(({ data }) => {
      if (data && data.length > 0) setFaqs(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">Need Help?</span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">Frequently Asked <span className="gradient-text">Questions</span></h1>
          </motion.div>

          {loading ? (
            <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-card rounded-2xl animate-pulse" />)}</div>
          ) : (
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.div key={faq.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`glossy-card rounded-2xl border overflow-hidden transition-all duration-300 ${open === faq.id ? "border-primary/40 shadow-lg shadow-primary/5" : "border-border"}`}
                >
                  <button onClick={() => setOpen(open === faq.id ? null : faq.id)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="font-semibold text-foreground pr-4">{faq.question}</span>
                    <motion.div animate={{ rotate: open === faq.id ? 180 : 0 }} transition={{ duration: 0.3 }}>
                      <ChevronDown size={18} className="text-primary flex-shrink-0" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {open === faq.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                        <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed border-t border-border/50 pt-3">{faq.answer}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
};

export default FAQPage;
