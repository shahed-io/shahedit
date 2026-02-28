import { motion } from "framer-motion";
import { RefreshCw, Clock } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";

const items = [
  "ডিজিটাল সার্ভিস ডেলিভারির পর সাধারণত রিফান্ড প্রযোজ্য নয়।",
  "ডেলিভারির পূর্বে পেমেন্ট সংক্রান্ত সমস্যায় রিফান্ড বিবেচনা করা হবে।",
  "ভুল বা অসম্পূর্ণ ডেলিভারি হলে যাচাই সাপেক্ষে সমাধান প্রদান করা হবে।",
  "রিফান্ড অনুমোদিত হলে ৩-৭ কার্যদিবসের মধ্যে সম্পন্ন করা হবে।",
  "রিফান্ড আবেদনের জন্য অর্ডার আইডি ও পেমেন্টের প্রমাণ প্রয়োজন হবে।",
  "কোনো প্রকার টেকনিক্যাল ত্রুটির ক্ষেত্রে বিকল্প সমাধান প্রদান করা হবে।",
];

const RefundPolicyPage = () => (
  <div className="min-h-screen bg-background">
    <SiteHeader />
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">Legal</span>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">
            রিফান্ড ও <span className="gradient-text">রিটার্ন নীতি</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">ডিজিটাল সার্ভিসের জন্য আমাদের রিফান্ড ও রিটার্ন পলিসি সম্পর্কে বিস্তারিত জানুন।</p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
            <Clock size={14} />
            <span>রিফান্ড প্রক্রিয়া: ৩-৭ কার্যদিবস</span>
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
              <RefreshCw size={16} className="text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Refund & Return Policy (রিফান্ড নীতি)</h2>
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
            রিফান্ড সংক্রান্ত যোগাযোগ:{" "}
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

export default RefundPolicyPage;
