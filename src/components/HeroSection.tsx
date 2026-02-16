import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 hero-bg opacity-80" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 backdrop-blur-sm text-primary-foreground/80 text-sm mb-8">
            <Zap size={14} className="text-secondary" />
            আপনার বিজনেসকে ডিজিটাল করুন
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight mb-6 font-['Space_Grotesk']">
            আইটি সলিউশনে{" "}
            <span className="text-gradient">
              নতুন মাত্রা
            </span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10">
            ওয়েব ডেভেলপমেন্ট, সফটওয়্যার সলিউশন, সাইবার সিকিউরিটি এবং ক্লাউড সার্ভিস — সবকিছু এক জায়গায়।
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-base px-8 glow"
            >
              শুরু করুন <ArrowRight className="ml-2" size={18} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-primary-foreground hover:bg-white/10 text-base px-8"
            >
              আমাদের সার্ভিস দেখুন
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-3 gap-6 max-w-xl mx-auto mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          {[
            { icon: Shield, label: "ক্লায়েন্ট", value: "২৫০+" },
            { icon: Globe, label: "প্রজেক্ট সম্পন্ন", value: "৫০০+" },
            { icon: Zap, label: "বছরের অভিজ্ঞতা", value: "১০+" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="mx-auto mb-2 text-secondary" size={24} />
              <div className="text-2xl md:text-3xl font-bold text-primary-foreground font-['Space_Grotesk']">
                {stat.value}
              </div>
              <div className="text-sm text-primary-foreground/60">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
