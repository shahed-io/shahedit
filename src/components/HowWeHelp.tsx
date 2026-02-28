import { Headset, LayoutGrid, Hammer, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: Headset,
    step: "01",
    title: "Consultation",
    desc: "Our team of experienced professionals will work with you to gain a comprehensive understanding of your business needs, goals, and challenges.",
    gradient: "from-primary to-primary/70",
  },
  {
    icon: LayoutGrid,
    step: "02",
    title: "Customization",
    desc: "Based on the information gathered during the consultation phase, we develop customized IT solutions that are tailored to your specific needs.",
    gradient: "from-accent to-accent/70",
  },
  {
    icon: Hammer,
    step: "03",
    title: "Implementation",
    desc: "Once we have developed a solution that meets your requirements, our team of skilled engineers will work tirelessly to implement it seamlessly.",
    gradient: "from-violet-500 to-violet-400",
  },
  {
    icon: ShieldCheck,
    step: "04",
    title: "Ongoing Support",
    desc: "Shahed IT is committed to providing ongoing support and maintenance to ensure that your IT solutions continue to meet your evolving business needs.",
    gradient: "from-amber-500 to-amber-400",
  },
];

const HowWeHelp = () => {
  return (
    <section className="py-20 relative overflow-hidden section-glow">
      {/* Tech dot grid */}
      <div className="absolute inset-0 dot-grid opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222,47%,6%)] via-transparent to-[hsl(222,47%,6%)]" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full -translate-y-1/2" style={{ background: 'radial-gradient(circle, hsl(170,80%,45%) 0%, transparent 65%)', filter: 'blur(120px)', opacity: 0.08 }} />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-accent text-sm font-semibold uppercase tracking-widest">Our Process</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
            How we can help your business grow
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Here are 4 key steps that Shahed IT takes to help your business grow
          </p>
          <div className="mt-4 mx-auto w-16 h-1 rounded-full bg-gradient-to-r from-primary to-accent" />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, type: "spring", stiffness: 100 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="glossy-card rounded-2xl border border-border p-7 text-center group hover:border-primary/20 transition-all duration-500"
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
                transition={{ duration: 0.5 }}
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mx-auto mb-5 shadow-lg shimmer`}
              >
                <step.icon size={28} className="text-primary-foreground drop-shadow-md" />
              </motion.div>

              <span className="text-xs font-bold text-accent uppercase tracking-widest">Step {step.step}</span>
              <h3 className="text-lg font-bold text-foreground mt-2 mb-3 group-hover:text-primary transition-colors duration-300">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowWeHelp;
