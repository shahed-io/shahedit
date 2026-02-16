import { motion } from "framer-motion";
import { Code, Cloud, ShieldCheck, Smartphone, Database, Headphones } from "lucide-react";

const services = [
  {
    icon: Code,
    title: "ওয়েব ডেভেলপমেন্ট",
    description: "আধুনিক ও রেসপন্সিভ ওয়েবসাইট তৈরি করি যা আপনার বিজনেসকে অনলাইনে শক্তিশালী করবে।",
  },
  {
    icon: Smartphone,
    title: "অ্যাপ ডেভেলপমেন্ট",
    description: "iOS ও Android প্ল্যাটফর্মের জন্য কাস্টম মোবাইল অ্যাপ্লিকেশন।",
  },
  {
    icon: Cloud,
    title: "ক্লাউড সার্ভিস",
    description: "ক্লাউড মাইগ্রেশন, হোস্টিং এবং ম্যানেজমেন্ট সলিউশন।",
  },
  {
    icon: ShieldCheck,
    title: "সাইবার সিকিউরিটি",
    description: "আপনার ডেটা ও সিস্টেমকে সুরক্ষিত রাখতে উন্নত সিকিউরিটি সমাধান।",
  },
  {
    icon: Database,
    title: "সফটওয়্যার সলিউশন",
    description: "কাস্টম সফটওয়্যার, ERP, CRM এবং বিজনেস অটোমেশন সিস্টেম।",
  },
  {
    icon: Headphones,
    title: "আইটি সাপোর্ট",
    description: "২৪/৭ টেকনিক্যাল সাপোর্ট এবং মেইনটেন্যান্স সার্ভিস।",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider">আমাদের সার্ভিস</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 font-['Space_Grotesk']">
            যেসব সেবা আমরা প্রদান করি
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            আধুনিক প্রযুক্তি ব্যবহার করে আপনার বিজনেসকে এগিয়ে নিয়ে যাওয়ার জন্য আমাদের বিশেষায়িত সেবাসমূহ।
          </p>
        </div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {services.map((service) => (
            <motion.div
              key={service.title}
              variants={item}
              className="group p-8 rounded-xl bg-card border border-border card-hover cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-5 group-hover:bg-secondary/20 transition-colors">
                <service.icon className="text-secondary" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 font-['Space_Grotesk']">{service.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
