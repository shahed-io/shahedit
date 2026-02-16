import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const features = [
  "অভিজ্ঞ ও দক্ষ ডেভেলপার টিম",
  "আন্তর্জাতিক মানের সেবা",
  "সময়মতো প্রজেক্ট ডেলিভারি",
  "২৪/৭ কাস্টমার সাপোর্ট",
  "সাশ্রয়ী মূল্যে প্রিমিয়াম সেবা",
  "আধুনিক টেকনোলজি ব্যবহার",
];

const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-muted/50">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-semibold text-secondary uppercase tracking-wider">আমাদের সম্পর্কে</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-6 font-['Space_Grotesk']">
              আপনার বিশ্বস্ত আইটি পার্টনার
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              আমরা একটি অভিজ্ঞ আইটি কোম্পানি যা গত ১০ বছরেরও বেশি সময় ধরে দেশ-বিদেশের বিভিন্ন প্রতিষ্ঠানকে ডিজিটাল সমাধান দিয়ে আসছি। আমাদের লক্ষ্য হলো প্রযুক্তির মাধ্যমে আপনার বিজনেসকে আরও এগিয়ে নিয়ে যাওয়া।
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              আমাদের টিমে রয়েছে বিভিন্ন ক্ষেত্রে অভিজ্ঞ প্রফেশনাল যারা সর্বদা আপনার বিজনেসের জন্য সেরা সমাধান খুঁজে বের করতে প্রস্তুত।
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-secondary shrink-0" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "২৫০+", label: "সন্তুষ্ট ক্লায়েন্ট" },
                { value: "৫০০+", label: "সম্পন্ন প্রজেক্ট" },
                { value: "৫০+", label: "টিম মেম্বার" },
                { value: "৯৯%", label: "সাফল্যের হার" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-card border border-border rounded-xl p-6 text-center card-hover"
                >
                  <div className="text-3xl font-bold text-gradient font-['Space_Grotesk']">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
