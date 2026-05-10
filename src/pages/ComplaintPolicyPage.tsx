import { motion } from "framer-motion";
import { MessageSquare, Clock } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const items = [
  "যেকোনো সমস্যা হলে আমাদের সাপোর্টে যোগাযোগ করুন।",
  "অভিযোগ যাচাই করে ২৪ ঘন্টার মধ্যে উত্তর প্রদান করা হবে।",
  "প্রমাণ ছাড়া অভিযোগ গ্রহণযোগ্য হবে না।",
  "আমরা গ্রাহকের সন্তুষ্টিকে সর্বোচ্চ গুরুত্ব দেই।",
  "বিরোধ নিষ্পত্তিতে উভয় পক্ষের মতামত বিবেচনা করা হবে।",
  "প্রয়োজনে মধ্যস্থতার মাধ্যমে সমস্যার সমাধান করা হবে।",
];

const ComplaintPolicyPage = () => (
  <div className="min-h-screen bg-background">
    <SiteHeader />
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">Legal</span>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">
            অভিযোগ ও <span className="gradient-text">বিরোধ নীতি</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">সমস্যা হলে কীভাবে অভিযোগ করবেন এবং কীভাবে সমাধান পাবেন তা জানুন।</p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
            <Clock size={14} />
            <span>সাপোর্ট সময়: সকাল ১০:০০ – রাত ১০:০০</span>
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
              <MessageSquare size={16} className="text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Complaint & Dispute Policy (অভিযোগ নীতি)</h2>
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
            অভিযোগ জানাতে:{" "}
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

export default ComplaintPolicyPage;
