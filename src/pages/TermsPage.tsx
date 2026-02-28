import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, RefreshCw, Truck, MessageSquare, Clock } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";

const sections = [
  {
    id: "terms",
    tab: "Terms & Conditions",
    banglaTab: "সেবা ব্যবহারের শর্ত",
    icon: Shield,
    title: "Terms & Conditions",
    subtitle: "সেবা ব্যবহারের শর্তাবলী",
    items: [
      "আমাদের ওয়েবসাইট ব্যবহার করার মাধ্যমে আপনি আমাদের শর্তাবলীতে সম্মত হচ্ছেন।",
      "প্রদত্ত সার্ভিস শুধুমাত্র বৈধ ও নৈতিক ব্যবহারের জন্য প্রযোজ্য।",
      "কোনো প্রকার অবৈধ কার্যক্রমের জন্য Shahed IT দায়ী থাকবে না।",
      "ভুল তথ্য প্রদান করলে সার্ভিস বাতিল করা হতে পারে।",
      "আমরা প্রয়োজন অনুযায়ী শর্তাবলী পরিবর্তনের অধিকার সংরক্ষণ করি।",
    ],
  },
  {
    id: "privacy",
    tab: "Privacy Policy",
    banglaTab: "ডাটা/কুকি/ফর্ম সাবমিশন",
    icon: Lock,
    title: "Privacy Policy",
    subtitle: "গোপনীয়তা নীতি",
    items: [
      "আমরা গ্রাহকের ব্যক্তিগত তথ্য নিরাপদভাবে সংরক্ষণ করি।",
      "কোনো তথ্য তৃতীয় পক্ষের কাছে বিক্রি বা শেয়ার করা হয় না (আইনগত প্রয়োজন ছাড়া)।",
      "পেমেন্ট তথ্য নিরাপদ পেমেন্ট গেটওয়ের মাধ্যমে প্রক্রিয়াজাত হয়।",
      "ফর্ম সাবমিশনের মাধ্যমে প্রদত্ত তথ্য শুধুমাত্র সার্ভিস প্রদানের জন্য ব্যবহৃত হয়।",
      "কুকি ব্যবহার করা হতে পারে ওয়েবসাইট উন্নয়নের জন্য।",
    ],
  },
  {
    id: "refund",
    tab: "Refund & Return Policy",
    banglaTab: "রিফান্ড নীতি",
    icon: RefreshCw,
    title: "Refund & Return Policy",
    subtitle: "রিফান্ড ও ফেরত নীতি",
    items: [
      "ডিজিটাল সার্ভিস ডেলিভারির পর সাধারণত রিফান্ড প্রযোজ্য নয়।",
      "ডেলিভারির পূর্বে পেমেন্ট সংক্রান্ত সমস্যায় রিফান্ড বিবেচনা করা হবে।",
      "ভুল বা অসম্পূর্ণ ডেলিভারি হলে যাচাই সাপেক্ষে সমাধান প্রদান করা হবে।",
      "রিফান্ড অনুমোদিত হলে ৩-৭ কার্যদিবসের মধ্যে সম্পন্ন করা হবে।",
    ],
  },
  {
    id: "delivery",
    tab: "Delivery Policy",
    banglaTab: "ডেলিভারি টাইম/মেথড",
    icon: Truck,
    title: "Delivery Policy",
    subtitle: "ডেলিভারি নীতি",
    items: [
      "পেমেন্ট নিশ্চিত হওয়ার পর সার্ভিস ডেলিভারি করা হয়।",
      "ডেলিভারি সময়: ৫ মিনিট – ২৪ ঘন্টার মধ্যে (সার্ভিস অনুযায়ী)।",
      "ডেলিভারি মাধ্যম: WhatsApp / Email / Client Panel।",
      "গ্রাহকের ভুল তথ্যের কারণে বিলম্ব হলে Shahed IT দায়ী নয়।",
    ],
  },
  {
    id: "complaint",
    tab: "Complaint/Dispute Policy",
    banglaTab: "সমস্যা সমাধান পদ্ধতি",
    icon: MessageSquare,
    title: "Complaint & Dispute Policy",
    subtitle: "অভিযোগ ও বিরোধ নিষ্পত্তি নীতি",
    items: [
      "যেকোনো সমস্যা হলে আমাদের সাপোর্টে যোগাযোগ করুন।",
      "অভিযোগ যাচাই করে ২৪ ঘন্টার মধ্যে উত্তর প্রদান করা হবে।",
      "প্রমাণ ছাড়া অভিযোগ গ্রহণযোগ্য হবে না।",
      "আমরা গ্রাহকের সন্তুষ্টিকে সর্বোচ্চ গুরুত্ব দেই।",
    ],
  },
];

const TermsPage = () => {
  const [active, setActive] = useState(0);
  const sec = sections[active];
  const Icon = sec.icon;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">Legal</span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">
              শর্তাবলী ও <span className="gradient-text">নীতিমালা</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">Shahed IT-এর সকল নীতিমালা ও শর্তাবলী এখানে বিস্তারিতভাবে উল্লেখ করা হয়েছে।</p>
            <div className="flex items-center justify-center gap-2 mt-3 text-sm text-muted-foreground">
              <Clock size={14} />
              <span>সাপোর্ট সময়: সকাল ১০:০০ – রাত ১০:০০</span>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap gap-2 mb-8 p-1.5 glossy-card rounded-2xl border border-border"
          >
            {sections.map((s, i) => {
              const TabIcon = s.icon;
              const isActive = active === i;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(i)}
                  className={`flex-1 min-w-[140px] flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  <TabIcon size={15} />
                  <span className="text-center leading-tight">{s.tab}</span>
                  <span className={`text-[10px] font-normal leading-tight text-center ${isActive ? "text-primary-foreground/70" : "text-muted-foreground/60"}`}>{s.banglaTab}</span>
                </button>
              );
            })}
          </motion.div>

          {/* Content Panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={sec.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="glossy-card rounded-2xl border border-border p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={22} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{sec.title}</h2>
                  <p className="text-sm text-muted-foreground">{sec.subtitle}</p>
                </div>
              </div>
              <ul className="space-y-3">
                {sec.items.map((item, j) => (
                  <motion.li
                    key={j}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: j * 0.07 }}
                    className="flex items-start gap-3 text-muted-foreground text-sm leading-relaxed"
                  >
                    <span className="text-primary flex-shrink-0 mt-0.5">✔️</span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 p-5 rounded-2xl border border-border text-center"
          >
            <p className="text-muted-foreground text-sm">
              যোগাযোগ:{" "}
              <a href="tel:01820060046" className="text-primary hover:underline font-medium">01820-060046</a>
              {" · "}
              <a href="mailto:info@shahedit.com" className="text-primary hover:underline font-medium">info@shahedit.com</a>
            </p>
          </motion.div>
        </div>
      </section>
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
};

export default TermsPage;
