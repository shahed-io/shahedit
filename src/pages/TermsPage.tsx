import { motion } from "framer-motion";
import { Shield, Clock } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";

const sections = [
  {
    title: "ব্যবহারের শর্তাবলী",
    items: [
      "আমাদের ওয়েবসাইট ব্যবহার করার মাধ্যমে আপনি আমাদের শর্তাবলীতে সম্মত হচ্ছেন।",
      "প্রদত্ত সার্ভিস শুধুমাত্র বৈধ ও নৈতিক ব্যবহারের জন্য প্রযোজ্য।",
      "কোনো প্রকার অবৈধ কার্যক্রমের জন্য Shahed IT দায়ী থাকবে না।",
      "ভুল তথ্য প্রদান করলে সার্ভিস বাতিল করা হতে পারে।",
      "আমরা প্রয়োজন অনুযায়ী শর্তাবলী পরিবর্তনের অধিকার সংরক্ষণ করি।",
    ],
  },
  {
    title: "গোপনীয়তা নীতি (Privacy Policy)",
    items: [
      "আমরা গ্রাহকের ব্যক্তিগত তথ্য নিরাপদভাবে সংরক্ষণ করি।",
      "কোনো তথ্য তৃতীয় পক্ষের কাছে বিক্রি বা শেয়ার করা হয় না (আইনগত প্রয়োজন ছাড়া)।",
      "পেমেন্ট তথ্য নিরাপদ পেমেন্ট গেটওয়ের মাধ্যমে প্রক্রিয়াজাত হয়।",
      "কুকি ব্যবহার করা হতে পারে ওয়েবসাইট উন্নয়নের জন্য।",
    ],
  },
  {
    title: "রিফান্ড নীতি (Refund Policy)",
    items: [
      "ডিজিটাল সার্ভিস ডেলিভারির পর সাধারণত রিফান্ড প্রযোজ্য নয়।",
      "ডেলিভারির পূর্বে পেমেন্ট সংক্রান্ত সমস্যায় রিফান্ড বিবেচনা করা হবে।",
      "ভুল বা অসম্পূর্ণ ডেলিভারি হলে যাচাই সাপেক্ষে সমাধান প্রদান করা হবে।",
      "রিফান্ড অনুমোদিত হলে ৩-৭ কার্যদিবসের মধ্যে সম্পন্ন করা হবে।",
    ],
  },
  {
    title: "ডেলিভারি নীতি (Delivery Policy)",
    items: [
      "পেমেন্ট নিশ্চিত হওয়ার পর সার্ভিস ডেলিভারি করা হয়।",
      "ডেলিভারি সময়: ৫ মিনিট – ২৪ ঘন্টার মধ্যে (সার্ভিস অনুযায়ী)।",
      "ডেলিভারি মাধ্যম: Email / WhatsApp / Client Panel।",
      "গ্রাহকের ভুল তথ্যের কারণে বিলম্ব হলে Shahed IT দায়ী নয়।",
    ],
  },
  {
    title: "অভিযোগ ও সাপোর্ট নীতি (Complaint & Support)",
    items: [
      "যেকোনো সমস্যা হলে আমাদের সাপোর্টে যোগাযোগ করুন।",
      "অভিযোগ যাচাই করে ২৪ ঘন্টার মধ্যে উত্তর প্রদান করা হবে।",
      "প্রমাণ ছাড়া অভিযোগ গ্রহণযোগ্য হবে না।",
      "আমরা গ্রাহকের সন্তুষ্টিকে সর্বোচ্চ গুরুত্ব দেই।",
    ],
  },
];

const TermsPage = () => (
  <div className="min-h-screen bg-background">
    <SiteHeader />
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">Legal</span>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">
            শর্তাবলী ও <span className="gradient-text">নীতিমালা</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Shahed IT-এর সকল নীতিমালা ও শর্তাবলী এখানে বিস্তারিতভাবে উল্লেখ করা হয়েছে।</p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
            <Clock size={14} />
            <span>সাপোর্ট সময়: সকাল ১০:০০ – রাত ১০:০০</span>
          </div>
        </motion.div>

        <div className="space-y-8">
          {sections.map((sec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glossy-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield size={16} className="text-primary" />
                </div>
                <h2 className="text-lg font-bold text-foreground">{sec.title}</h2>
              </div>
              <ul className="space-y-2.5">
                {sec.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-muted-foreground text-sm leading-relaxed">
                    <span className="text-primary mt-1 flex-shrink-0">✔️</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 p-5 rounded-2xl border border-border text-center"
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

export default TermsPage;
