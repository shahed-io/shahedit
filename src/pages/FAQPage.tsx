import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
import type { FAQ } from "@/lib/supabase-types";

const FAQPage = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("faqs").select("*").eq("is_published", true).order("sort_order").then(({ data }) => {
      setFaqs(data ?? []);
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
          ) : faqs.length === 0 ? (
            <div className="text-center py-20"><p className="text-muted-foreground">FAQ coming soon...</p></div>
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
