import { motion } from "framer-motion";
import { CheckCircle, Users, Award, Clock, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";

const stats = [
  { icon: Users, label: "Happy Clients", value: "500+" },
  { icon: Award, label: "Projects Done", value: "1000+" },
  { icon: Clock, label: "Years Experience", value: "10+" },
  { icon: Globe, label: "Countries Served", value: "20+" },
];

const values = [
  "Customer-first approach in every project",
  "Transparent pricing with no hidden fees",
  "On-time delivery with quality guarantee",
  "24/7 dedicated support for all clients",
  "Latest technology stack implementation",
  "Security-first development practices",
];

const AboutPage = () => (
  <div className="min-h-screen bg-background">
    <SiteHeader />
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">Our Story</span>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">About <span className="gradient-text">Shahed IT</span></h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Building digital excellence since 2014 with passion and precision</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-3xl font-bold text-foreground mb-4">We craft digital solutions that <span className="gradient-text">transform businesses</span></h2>
            <p className="text-muted-foreground leading-relaxed mb-6">Shahed IT is a leading software development company based in Dhaka, Bangladesh. We specialize in web development, mobile app development, digital marketing, and enterprise software solutions. Our team of 50+ experts has helped 500+ businesses achieve their digital goals.</p>
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
