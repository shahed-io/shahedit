import { motion } from "framer-motion";
import { Truck, Clock } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const items = [
  "পেমেন্ট নিশ্চিত হওয়ার পর সার্ভিস ডেলিভারি শুরু হয়।",
  "ডেলিভারি সময়: ৫ মিনিট – ২৪ ঘন্টার মধ্যে (সার্ভিস অনুযায়ী)।",
  "ডেলিভারি মাধ্যম: Email / WhatsApp / Client Panel।",
  "গ্রাহকের ভুল তথ্যের কারণে বিলম্ব হলে Shahed IT দায়ী নয়।",
  "জরুরি ডেলিভারির প্রয়োজনে আলাদাভাবে যোগাযোগ করুন।",
  "ডেলিভারি সম্পন্ন হলে গ্রাহককে ইমেইল বা WhatsApp-এ নোটিফিকেশন দেওয়া হবে।",
];

const DeliveryPolicyPage = () => (
  <div className="min-h-screen bg-background">
    <SiteHeader />
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">Legal</span>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">
            ডেলিভারি <span className="gradient-text">নীতি</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">সার্ভিস ডেলিভারির সময়, পদ্ধতি এবং প্রক্রিয়া সম্পর্কে বিস্তারিত জানুন।</p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
            <Clock size={14} />
            <span>ডেলিভারি সময়: ৫ মিনিট – ২৪ ঘন্টা</span>
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
              <Truck size={16} className="text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Delivery Policy (ডেলিভারি নীতি)</h2>
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

export default DeliveryPolicyPage;
