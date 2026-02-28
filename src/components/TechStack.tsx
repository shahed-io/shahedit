import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const techs = [
  { name: "React", color: "#61DAFB" },
  { name: "Next.js", color: "#000000" },
  { name: "Node.js", color: "#339933" },
  { name: "TypeScript", color: "#3178C6" },
  { name: "WordPress", color: "#21759B" },
  { name: "PHP", color: "#777BB4" },
  { name: "Laravel", color: "#FF2D20" },
  { name: "MongoDB", color: "#47A248" },
  { name: "MySQL", color: "#4479A1" },
  { name: "Figma", color: "#F24E1E" },
  { name: "Flutter", color: "#02569B" },
  { name: "Python", color: "#3776AB" },
];

const TechStack = () => {
  return (
    <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(222,50%,7%) 0%, hsl(230,50%,9%) 50%, hsl(245,40%,8%) 100%)' }}>
      {/* Tech grid overlay */}
      <div className="absolute inset-0 tech-grid-bg opacity-50" />
      {/* Glow orbs */}
      <div className="absolute top-10 left-10 w-[400px] h-[400px] rounded-full float-anim" style={{ background: 'radial-gradient(circle, hsl(245,80%,65%) 0%, transparent 65%)', filter: 'blur(100px)', opacity: 0.12 }} />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] rounded-full float-anim" style={{ background: 'radial-gradient(circle, hsl(170,80%,45%) 0%, transparent 65%)', filter: 'blur(80px)', opacity: 0.10, animationDelay: '3s' }} />

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-accent text-sm font-semibold uppercase tracking-widest">Our Stack</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              Powered by{" "}
              <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                Best-in-Class Technology
              </span>
            </h2>
            <div className="w-16 h-1 rounded-full bg-gradient-to-r from-primary to-accent mb-6" />
            <p className="text-muted-foreground leading-relaxed mb-4">
              We leverage the latest and most powerful technologies to build scalable, high-performance solutions for your business. Our tech stack is carefully selected to deliver reliability, speed, and flexibility.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              From frontend frameworks to backend infrastructure, we use industry-leading tools that ensure your project is built on a solid foundation ready for growth.
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className="bg-gradient-to-r from-accent to-primary text-primary-foreground rounded-full px-8 glossy-btn shadow-lg shadow-accent/20 group">
                Explore Our Tech <ArrowRight size={16} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Tech grid */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-3 sm:grid-cols-4 gap-4"
          >
            {techs.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, type: "spring" }}
                whileHover={{ y: -6, scale: 1.08 }}
                className="glass-card rounded-2xl p-5 flex flex-col items-center gap-3 cursor-pointer group hover:border-accent/40 transition-all duration-300"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shimmer"
                  style={{ backgroundColor: `${tech.color}20`, color: tech.color }}
                >
                  {tech.name.charAt(0)}
                </div>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center">
                  {tech.name}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TechStack;
