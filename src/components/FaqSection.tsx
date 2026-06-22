import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import type { FAQ } from "@/lib/supabase-types";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";


const fallbackFaqs = [
  { id: "1", question: "আপনাদের সার্ভিস কত দিনের মধ্যে ডেলিভারি পাওয়া যায়?", answer: "সার্ভিস অনুযায়ী ৫ মিনিট থেকে ২৪ ঘন্টার মধ্যে ডেলিভারি দেওয়া হয়।" },
  { id: "2", question: "পেমেন্ট করার পর কীভাবে সার্ভিস পাবো?", answer: "পেমেন্ট নিশ্চিত হওয়ার পর Email / WhatsApp / Client Panel-এর মাধ্যমে ডেলিভারি দেওয়া হয়।" },
  { id: "3", question: "রিফান্ড পাওয়া কি সম্ভব?", answer: "ডিজিটাল সার্ভিস ডেলিভারির পূর্বে সমস্যা হলে রিফান্ড বিবেচনা করা হয়। বিস্তারিত আমাদের Refund Policy দেখুন।" },
  { id: "4", question: "সাপোর্ট কখন পাওয়া যায়?", answer: "আমাদের সাপোর্ট সময় সকাল ১০:০০ থেকে রাত ১০:০০ পর্যন্ত, সপ্তাহের ৭ দিন।" },
];

const defaultContent = {
  badge: "সচরাচর জিজ্ঞাসা",
  title_prefix: "আপনার",
  title_highlight: "প্রশ্নের উত্তর",
  description: "আমাদের সার্ভিস সম্পর্কে সবচেয়ে বেশি জিজ্ঞাসিত প্রশ্নগুলোর উত্তর এখানে পাবেন।",
  cta_text: "সব প্রশ্ন দেখুন →",
  cta_link: "/faq",
};

const FaqSection = () => {
  const [faqs, setFaqs] = useState<{ id: string; question: string; answer: string }[]>(fallbackFaqs);
  const [content, setContent] = useState(defaultContent);
  const [visible, setVisible] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  const loadFaqs = () => {
    supabase.from("faqs").select("id, question, answer").eq("is_published", true).order("sort_order").limit(6).then(({ data }) => {
      if (data && data.length > 0) setFaqs(data);
    });
    supabase.from("page_sections").select("content, is_published").eq("section_key", "faq_section").maybeSingle().then(({ data }) => {
      if (data) {
        setVisible(data.is_published);
        if (data.content) setContent({ ...defaultContent, ...(data.content as any) });
      }
    });
  };
  useEffect(() => { loadFaqs(); }, []);
  useRealtimeSync(["faqs", "page_sections"], loadFaqs);


  if (!visible) return null;

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-widest mb-5">
            <HelpCircle size={13} />
            {content.badge}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {content.title_prefix} <span className="gradient-text">{content.title_highlight}</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            {content.description}
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={`glossy-card rounded-2xl border overflow-hidden transition-all duration-300 ${open === faq.id ? "border-primary/40 shadow-lg shadow-primary/5" : "border-border"}`}
            >
              <button
                onClick={() => setOpen(open === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-semibold text-foreground pr-4 text-sm md:text-base">{faq.question}</span>
                <motion.div animate={{ rotate: open === faq.id ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  <ChevronDown size={18} className="text-primary flex-shrink-0" />
                </motion.div>
              </button>
              <AnimatePresence>
                {open === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed border-t border-border/50 pt-3">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-10"
        >
          <Link
            to={content.cta_link}
            className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
          >
            {content.cta_text}
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FaqSection;
