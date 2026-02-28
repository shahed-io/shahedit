import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
import { SectionHeader, CTASection } from "@/components/ui/section-components";
import { GridSkeleton } from "@/components/ui/skeleton-loaders";
import type { FAQ } from "@/lib/supabase-types";

const FAQPage = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("faqs").select("*").eq("is_published", true).order("sort_order")
      .then(({ data }) => { setFaqs(data ?? []); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="section-py hero-gradient relative overflow-hidden" aria-labelledby="faq-heading">
        <div className="absolute inset-0 subtle-grid opacity-40" aria-hidden="true" />
        <div className="container mx-auto px-4 relative text-center">
          <SectionHeader
            label="Need Help?"
            title={<>Frequently Asked <span className="gradient-text">Questions</span></>}
            description="Find quick answers to common questions about our services and process."
          />
        </div>
      </section>

      <section className="section-py" aria-label="FAQ accordion">
        <div className="container mx-auto px-4 max-w-3xl">
          {loading ? (
            <GridSkeleton count={5} variant="list" />
          ) : faqs.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-4xl mb-4" aria-hidden="true">💬</p>
              <p className="text-muted-foreground">FAQ coming soon...</p>
            </div>
          ) : (
            <div role="list" className="space-y-3">
              {faqs.map((faq, i) => {
                const isOpen = open === faq.id;
                return (
                  <motion.div
                    key={faq.id}
                    role="listitem"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className={`tech-card rounded-xl overflow-hidden transition-all duration-200 ${isOpen ? "border-primary/40" : ""}`}
                  >
                    <button
                      onClick={() => setOpen(isOpen ? null : faq.id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${faq.id}`}
                      id={`faq-question-${faq.id}`}
                      className="w-full flex items-center justify-between p-5 text-left gap-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset rounded-xl"
                    >
                      <span className="font-medium text-foreground text-sm md:text-base">{faq.question}</span>
                      <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex-shrink-0 text-primary"
                        aria-hidden="true"
                      >
                        <ChevronDown size={18} />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={`faq-answer-${faq.id}`}
                          role="region"
                          aria-labelledby={`faq-question-${faq.id}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed border-t border-border/50 pt-3">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <CTASection
        title="Still have questions?"
        description="Our team is ready to help. Reach out and we'll respond within a few hours."
        primaryLabel="Contact Us"
        primaryHref="/contact"
      />

      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
};

export default FAQPage;
