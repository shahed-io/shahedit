import { motion } from "framer-motion";
import { CheckCircle, Users, Award, Clock, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";

const stats = [
  { icon: Users, label: "সন্তুষ্ট গ্রাহক", value: "500+" },
  { icon: Award, label: "সম্পন্ন প্রজেক্ট", value: "1000+" },
  { icon: Clock, label: "বছরের অভিজ্ঞতা", value: "10+" },
  { icon: Globe, label: "দেশে সার্ভিস", value: "20+" },
];

const values = [
  "১০০% স্বচ্ছ লেনদেন নিশ্চিত করা হয়",
  "দ্রুত ও সময়মতো ডেলিভারি",
  "গ্রাহক সন্তুষ্টি সর্বোচ্চ অগ্রাধিকার",
  "নিরাপদ ও নির্ভরযোগ্য সার্ভিস প্রদান",
  "সাশ্রয়ী মূল্যে মানসম্পন্ন ডিজিটাল সেবা",
  "২৪/৭ গ্রাহক সহায়তা ও সাপোর্ট",
];

const AboutPage = () => (
  <div className="min-h-screen bg-background">
    <SiteHeader />
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">আমাদের সম্পর্কে</span>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">About <span className="gradient-text">Shahed IT</span></h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">বিশ্বস্ত ডিজিটাল সার্ভিস প্রদানকারী প্রতিষ্ঠান — ২০১৪ সাল থেকে</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-3xl font-bold text-foreground mb-4">আমরা প্রদান করি <span className="gradient-text">বিশ্বস্ত ডিজিটাল সেবা</span></h2>
            <p className="text-muted-foreground leading-relaxed mb-6">Shahed IT একটি বিশ্বস্ত ডিজিটাল সার্ভিস প্রদানকারী প্রতিষ্ঠান। আমরা বিভিন্ন ধরনের আইটি সেবা, ডিজিটাল সাবস্ক্রিপশন, সফটওয়্যার সল্যুশন এবং অনলাইন সার্ভিস প্রদান করে থাকি। আমাদের লক্ষ্য হলো গ্রাহকদের নিরাপদ, দ্রুত এবং সাশ্রয়ী মূল্যে ডিজিটাল সেবা প্রদান করা।</p>
            <ul className="space-y-3">
              {values.map((v, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-start gap-3 text-muted-foreground"
                >
                  <CheckCircle size={18} className="text-accent flex-shrink-0 mt-0.5" />
                  {v}
                </motion.li>
              ))}
            </ul>
            <Link to="/get-quote" className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1">
              Start a Project
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="glossy-card rounded-3xl p-8 border border-border"
          >
            <div className="grid grid-cols-2 gap-6">
              {stats.map((s, i) => (
                <motion.div key={s.label} initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.4 + i * 0.1 }}
                  className="text-center p-5 bg-secondary/50 rounded-2xl"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <s.icon size={22} className="text-primary" />
                  </div>
                  <p className="text-3xl font-bold gradient-text">{s.value}</p>
                  <p className="text-muted-foreground text-sm mt-1">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
    <SiteFooter />
    <WhatsAppButton />
  </div>
);

export default AboutPage;
