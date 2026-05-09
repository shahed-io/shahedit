import { motion } from "framer-motion";
import { Award, Users, Code2, Headphones, ShieldCheck, Rocket } from "lucide-react";

const stats = [
  { icon: Code2, value: "১০০+", label: "Successful Projects", color: "hsl(258,90%,66%)" },
  { icon: Users, value: "৮০+", label: "Happy Clients", color: "hsl(185,100%,48%)" },
  { icon: Award, value: "৫+", label: "Years of Excellence", color: "hsl(315,80%,65%)" },
  { icon: Headphones, value: "২৪/৭", label: "Dedicated Support", color: "hsl(45,93%,58%)" },
  { icon: ShieldCheck, value: "১০০%", label: "Secure & Reliable", color: "hsl(165,80%,50%)" },
  { icon: Rocket, value: "৯৫+", label: "PageSpeed Score", color: "hsl(258,90%,66%)" },
];

const TrustStatsBar = () => {
  return (
    <section className="relative py-16 md:py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-foreground/40 mb-3">
            Why Industry Leaders Choose Us
          </p>
          <h2 className="text-2xl md:text-4xl font-bold">
            <span className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, hsl(258,90%,72%), hsl(185,100%,55%))" }}>
              Bangladesh's Most Trusted
            </span>{" "}
            IT Solutions Partner
          </h2>
        </motion.div>

        <div
          className="rounded-3xl backdrop-blur-xl p-6 md:p-8"
          style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.06), rgba(6,182,212,0.06))",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  whileHover={{ y: -4 }}
                  className="flex flex-col items-center text-center group"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-all"
                    style={{
                      background: `${s.color}18`,
                      border: `1px solid ${s.color}33`,
                      boxShadow: `0 4px 20px ${s.color}22`,
                    }}
                  >
                    <Icon size={26} style={{ color: s.color }} />
                  </div>
                  <div className="text-2xl md:text-3xl font-black mb-1" style={{ color: s.color }}>
                    {s.value}
                  </div>
                  <div className="text-xs text-foreground/60 font-medium leading-tight">
                    {s.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Tech badges row */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-xs md:text-sm text-foreground/50"
        >
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            ISO 27001 Security Standards
          </span>
          <span className="text-foreground/20">•</span>
          <span>OWASP Best Practices</span>
          <span className="text-foreground/20">•</span>
          <span>GDPR Compliant</span>
          <span className="text-foreground/20">•</span>
          <span>SLA-Backed Delivery</span>
          <span className="text-foreground/20">•</span>
          <span>Code Ownership Guaranteed</span>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustStatsBar;
