import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const highlights = [
  "Responsive, user-friendly websites",
  "Clean, visually consistent design",
  "Cross-device & cross-platform delivery",
  "Quality-driven digital solutions",
];

const AboutSection = () => {
  return (
    <section id="about" className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-accent text-sm font-semibold uppercase tracking-widest">About Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">
              <span className="gradient-text">Shahed IT</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong className="text-foreground">Shahed IT</strong> is a professional digital service agency focused on{" "}
              <strong className="text-foreground">web development and graphic design</strong> for modern businesses and growing brands.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We specialize in building responsive, user-friendly websites and creating clean, visually consistent design solutions that help businesses establish a strong and credible online presence. Every project we take on is approached with attention to detail, clarity, and long-term value.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Our strength lies in understanding client goals and translating them into practical digital solutions. From business websites to brand visuals, we combine thoughtful design with reliable development to deliver results that work across devices and platforms.
            </p>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8">
              Read More <ArrowRight size={16} className="ml-1.5" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {highlights.map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-5 bg-card rounded-2xl border border-border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={20} className="text-accent" />
                </div>
                <span className="font-medium text-foreground">{item}</span>
              </motion.div>
            ))}
            <p className="text-sm text-muted-foreground pt-4 leading-relaxed">
              If you are looking for a trusted partner for professional{" "}
              <strong className="text-foreground">web development and graphic design services</strong>, Shahed IT is here to support your business with quality-driven solutions.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
