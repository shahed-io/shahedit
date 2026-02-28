import { Phone, Mail, ArrowRight, ArrowUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const SiteFooter = () => {
  return (
    <footer className="relative overflow-hidden">
      {/* Gradient top line */}
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />

      <div className="relative" style={{ background: 'linear-gradient(180deg, hsl(222,50%,5%) 0%, hsl(225,55%,4%) 100%)' }}>
        {/* Background orbs */}
        <div className="absolute top-10 right-10 w-[400px] h-[300px] rounded-full" style={{ background: 'radial-gradient(ellipse, hsl(245,80%,65%) 0%, transparent 70%)', filter: 'blur(100px)', opacity: 0.07 }} />
        <div className="absolute bottom-10 left-10 w-[300px] h-[250px] rounded-full" style={{ background: 'radial-gradient(ellipse, hsl(170,80%,45%) 0%, transparent 70%)', filter: 'blur(80px)', opacity: 0.06 }} />
        {/* Tech grid */}
        <div className="absolute inset-0 tech-grid-bg opacity-20" />

        <div className="container mx-auto px-4 pt-16 pb-8 relative">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <h3 className="text-xl font-bold mb-4">
                <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">Shahed</span>
                <span className="text-background"> IT</span>
              </h3>
              <p className="text-muted-foreground text-sm mb-5">
                Professional digital service agency for web development and graphic design.
              </p>
              <div className="space-y-3 text-sm">
                <motion.a
                  whileHover={{ x: 4 }}
                  href="tel:+8801820060046"
                  className="flex items-center gap-2.5 text-muted-foreground hover:text-accent transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Phone size={14} className="text-primary" />
                  </div>
                  <span>01820-060046</span>
                </motion.a>
                <motion.a
                  whileHover={{ x: 4 }}
                  href="mailto:info@shahedit.com"
                  className="flex items-center gap-2.5 text-muted-foreground hover:text-accent transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Mail size={14} className="text-accent" />
                  </div>
                  <span>info@shahedit.com</span>
                </motion.a>
              </div>
            </motion.div>

            {/* Link columns */}
            {[
              { title: "Services", items: ["Web Development", "Graphics Design", "UI/UX Design", "Digital Marketing", "IT Support", "Facebook"] },
              { title: "Information", items: ["About Us", "Our Services", "Portfolio", "Blog", "FAQs", "Contact Us"] },
              { title: "Policies", items: ["Privacy Policy", "Terms & Conditions", "Refund Policy", "Support Center", "Delivery Policy", "Order & Cancellation"] },
            ].map((col, ci) => (
              <motion.div
                key={col.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: ci * 0.1 }}
              >
                <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">{col.title}</h4>
                <ul className="space-y-2.5 text-sm">
                  {col.items.map((item) => (
                    <li key={item}>
                      <motion.a
                        whileHover={{ x: 4 }}
                        href="#"
                        className="text-muted-foreground hover:text-accent transition-all duration-300 flex items-center gap-1.5"
                      >
                        <span className="w-0 h-px bg-accent group-hover:w-3 transition-all" />
                        {item}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}

            {/* Newsletter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">
                Subscribe for Updates
              </h4>
              <p className="text-xs text-muted-foreground mb-4">
                Will be used in accordance with our{" "}
                <a href="#" className="text-accent hover:underline">Privacy Policy</a>
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Your email"
                  type="email"
                  className="text-sm bg-secondary border-border text-foreground placeholder:text-muted-foreground rounded-full h-10"
                />
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button size="icon" className="bg-gradient-to-r from-accent to-primary text-accent-foreground rounded-full h-10 w-10 shrink-0 glossy-btn shadow-lg shadow-accent/20">
                    <ArrowRight size={16} />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>

          <div className="border-t border-border pt-6 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">© 2026 Shahed IT. All rights reserved.</p>
            <motion.button
              whileHover={{ y: -3, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center glossy-btn shadow-lg shadow-primary/20"
            >
              <ArrowUp size={16} className="text-primary-foreground" />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
