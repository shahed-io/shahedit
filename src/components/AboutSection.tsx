import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Sparkles, Star, Award, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const highlights = [
  "Responsive, user-friendly websites built to convert",
  "Clean, visually consistent brand design",
  "Cross-device & cross-platform delivery",
  "Quality-driven digital solutions with ROI focus",
];

const badges = [
  { icon: Star, label: "5★ Rated", color: "hsl(45,93%,58%)" },
  { icon: Award, label: "Award Winning", color: "hsl(42,70%,65%)" },
  { icon: Users, label: "150+ Clients", color: "hsl(45,85%,48%)" },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-20" />
      <div className="absolute top-0 right-0 w-[600px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(ellipse, hsl(42,70%,65%) 0%, transparent 65%)', filter: 'blur(130px)', opacity: 0.09 }} />
      <div className="absolute bottom-0 left-0 w-[500px] h-[400px] rounded-full"
        style={{ background: 'radial-gradient(ellipse, hsl(45,85%,48%) 0%, transparent 65%)', filter: 'blur(110px)', opacity: 0.08 }} />

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.65 }}>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-5"
              style={{ background: 'rgba(244,215,122,0.10)', border: '1px solid rgba(244,215,122,0.25)', color: 'hsl(45,85%,55%)' }}
            >
              <Sparkles size={12} /> About Shahed IT
            </motion.span>

            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-2">
              We Build <span className="gradient-text">Digital</span><br />Experiences
            </h2>
            <div className="w-20 h-1 rounded-full mb-7" style={{ background: 'linear-gradient(90deg, hsl(45,85%,48%), hsl(42,70%,65%))' }} />

            <p className="text-foreground/50 leading-relaxed mb-4 text-base">
              <strong className="text-foreground/90">Shahed IT</strong> is a professional digital service agency focused on <strong className="text-foreground/80">web development and graphic design</strong> for modern businesses and growing brands.
            </p>
            <p className="text-foreground/50 leading-relaxed mb-9 text-base">
              We specialize in building responsive, conversion-focused websites and creating clean, visually consistent design solutions that help businesses establish a strong and credible online presence.
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-3 mb-9">
              {badges.map((badge, i) => (
                <motion.div
                  key={badge.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                  style={{ background: `${badge.color}15`, border: `1px solid ${badge.color}30`, color: badge.color }}
                >
                  <badge.icon size={14} />
                  {badge.label}
                </motion.div>
              ))}
            </div>

            <Link to="/about">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-base font-bold text-white group glossy-btn"
                style={{ background: 'linear-gradient(135deg, hsl(42,70%,65%), hsl(45,85%,45%))', boxShadow: '0 6px 25px rgba(201,161,74,0.40)' }}
              >
                Learn More About Us <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Right */}
          <div className="space-y-4">
            {highlights.map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, type: "spring", stiffness: 120 }}
                whileHover={{ x: 6 }}
                className="flex items-center gap-4 p-5 rounded-2xl group cursor-pointer transition-all duration-400"
                style={{ background: 'rgba(201,161,74,0.07)', border: '1px solid rgba(201,161,74,0.15)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, rgba(201,161,74,0.25), rgba(244,215,122,0.15))' }}>
                  <CheckCircle2 size={20} style={{ color: 'hsl(45,85%,55%)' }} />
                </div>
                <span className="font-medium text-foreground/75 group-hover:text-foreground transition-colors">{item}</span>
              </motion.div>
            ))}

            {/* Stats card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-4 p-6 rounded-2xl mt-6"
              style={{ background: 'linear-gradient(135deg, rgba(201,161,74,0.10), rgba(244,215,122,0.06))', border: '1px solid rgba(201,161,74,0.20)' }}
            >
              {[
                { val: "150+", label: "Projects" },
                { val: "5+", label: "Years" },
                { val: "98%", label: "Satisfied" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-black gradient-text">{s.val}</div>
                  <div className="text-xs text-foreground/40 mt-0.5">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
