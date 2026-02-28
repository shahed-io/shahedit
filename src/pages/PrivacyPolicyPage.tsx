import { motion } from "framer-motion";
import { Lock, Clock } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";

const items = [
  "আমরা গ্রাহকের ব্যক্তিগত তথ্য (নাম, ইমেইল, ফোন) নিরাপদভাবে সংরক্ষণ করি।",
  "কোনো তথ্য তৃতীয় পক্ষের কাছে বিক্রি বা শেয়ার করা হয় না (আইনগত প্রয়োজন ছাড়া)।",
  "পেমেন্ট তথ্য নিরাপদ পেমেন্ট গেটওয়ের মাধ্যমে প্রক্রিয়াজাত হয়।",
  "ওয়েবসাইট উন্নয়নের জন্য কুকি ব্যবহার করা হতে পারে।",
  "ফর্ম সাবমিশনের মাধ্যমে প্রদত্ত তথ্য শুধুমাত্র সার্ভিস প্রদানের জন্য ব্যবহার করা হয়।",
  "ব্যবহারকারী চাইলে তাদের ডাটা মুছে ফেলার অনুরোধ করতে পারেন।",
];

const PrivacyPolicyPage = () => (
  <div className="min-h-screen bg-background">
    <SiteHeader />
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">Legal</span>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">
            গোপনীয়তা <span className="gradient-text">নীতি</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">আপনার ডাটা, কুকি এবং ফর্ম সাবমিশন সংক্রান্ত আমাদের সম্পূর্ণ গোপনীয়তা নীতি।</p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
            <Clock size={14} />
            <span>সর্বশেষ আপডেট: ফেব্রুয়ারি ২০২৬</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glossy-card rounded-2xl border border-border p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Lock size={16} className="text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Privacy Policy (গোপনীয়তা নীতি)</h2>
          </div>
          <ul className="space-y-2.5">
            {items.map((item, j) => (
              <li key={j} className="flex items-start gap-2.5 text-muted-foreground text-sm leading-relaxed">
                <span className="text-primary mt-1 flex-shrink-0">✔️</span>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
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

export default PrivacyPolicyPage;
