import { motion } from "framer-motion";
import { Smartphone, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";

const PaymentSection = () => {
  const { methods } = usePaymentMethods();
  return (
  <section className="py-20 relative">
    <div className="container mx-auto px-4 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-widest mb-5">
          <Smartphone size={13} />
          পেমেন্ট পদ্ধতি
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          সহজেই <span className="gradient-text">পেমেন্ট করুন</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm">
          আমাদের পছন্দের যেকোনো মোবাইল ব্যাংকিং মেথডে পেমেন্ট করুন এবং Transaction ID জমা দিন।
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {methods.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="glossy-card rounded-2xl border border-border p-5 text-center hover:border-primary/40 transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-xl mx-auto mb-3 flex items-center justify-center text-white font-bold text-sm overflow-hidden"
              style={{ background: m.logo_url ? "#fff" : m.color }}>
              {m.logo_url
                ? <img src={m.logo_url} alt={m.label} className="w-full h-full object-contain p-1.5" />
                : m.short_code}
            </div>
            <p className="font-bold text-foreground text-sm">{m.label}</p>
            <p className="text-xs text-muted-foreground mb-2">{m.sublabel}</p>
            <p className="text-primary font-mono text-sm font-semibold">{m.number}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center">
        <Link to="/payment">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white font-semibold glossy-btn"
            style={{ background: "linear-gradient(135deg, hsl(270,92%,65%), hsl(320,90%,48%))" }}
          >
            পেমেন্ট করুন ও Transaction ID জমা দিন
            <ArrowRight size={16} />
          </motion.button>
        </Link>
      </motion.div>
    </div>
  </section>
  );
};

export default PaymentSection;
