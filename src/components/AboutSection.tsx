import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const highlights = [
  "Responsive, user-friendly websites",
  "Clean, visually consistent design",
  "Cross-device & cross-platform delivery",
  "Quality-driven digital solutions",
];

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-secondary/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 text-accent text-sm font-semibold uppercase tracking-widest"
            >
              <Sparkles size={14} /> About Us
            </motion.span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-2">
              <span className="gradient-text">Shahed IT</span>
            </h2>
            <div className="w-16 h-1 rounded-full bg-gradient-to-r from-primary to-accent mb-6" />

            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong className="text-foreground">Shahed IT</strong> is a professional digital service agency focused on{" "}
              <strong className="text-foreground">web development and graphic design</strong> for modern businesses and growing brands.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We specialize in building responsive, user-friendly websites and creating clean, visually consistent design solutions that help businesses establish a strong and credible online presence. Every project we take on is approached with attention to detail, clarity, and long-term value.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Our strength lies in understanding client goals and translating them into practical digital solutions. From business websites to brand visuals, we combine thoughtful design with reliable development to deliver results that work across devices and platforms.
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-full px-8 shadow-lg shadow-primary/20 glossy-btn group">
                Read More <ArrowRight size={16} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>

          <div className="space-y-4">
            {highlights.map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: 40, rotate: 2 }}
                whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, type: "spring", stiffness: 120 }}
                whileHover={{ x: 8, scale: 1.02 }}
                className="flex items-center gap-4 p-5 glossy-card rounded-2xl border border-border hover:border-primary/20 transition-all duration-500 cursor-pointer"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center shrink-0"
                >
                  <CheckCircle2 size={22} className="text-accent" />
                </motion.div>
                <span className="font-medium text-foreground">{item}</span>
              </motion.div>
            ))}

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-sm text-muted-foreground pt-4 leading-relaxed"
            >
              If you are looking for a trusted partner for professional{" "}
              <strong className="text-foreground">web development and graphic design services</strong>, Shahed IT is here to support your business with quality-driven solutions.
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
