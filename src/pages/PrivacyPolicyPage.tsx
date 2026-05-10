import { motion } from "framer-motion";
import { Lock, Clock } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const items = [
  "আমরা কারো কোনো ব্যক্তিগত তথ্য আমাদের সার্ভারে সংরক্ষণ করি না।",
  "আমরা কোনো গ্রাহকের তথ্য কোনো তৃতীয় পক্ষের সাথে শেয়ার করি না।",
  "আপনার দেওয়া যেকোনো তথ্য (নাম, ইমেইল, ফোন) শুধুমাত্র আপনার সাথে যোগাযোগের উদ্দেশ্যে ব্যবহার করা হয় এবং কোথাও সংরক্ষিত থাকে না।",
  "পেমেন্ট তথ্য সম্পূর্ণ নিরাপদ পেমেন্ট গেটওয়ের মাধ্যমে প্রক্রিয়াজাত হয় — আমরা কোনো পেমেন্ট তথ্য সংগ্রহ বা সংরক্ষণ করি না।",
  "আমাদের কাছে আপনার কোনো ডাটা জমা থাকে না, তাই ডাটা মুছে ফেলার প্রশ্নও আসে না।",
  "ওয়েবসাইট উন্নয়নের জন্য সীমিত পরিসরে কুকি ব্যবহার হতে পারে, তবে তা কোনো ব্যক্তিগত তথ্য ট্র্যাক করে না।",
  "আমরা সম্পূর্ণ স্বচ্ছতায় বিশ্বাসী — আপনার গোপনীয়তা আমাদের কাছে সর্বোচ্চ অগ্রাধিকার।",
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
  </div>
);

export default PrivacyPolicyPage;
