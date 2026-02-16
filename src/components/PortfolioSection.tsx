import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import portfolio1 from "@/assets/portfolio-1.jpg";
import portfolio2 from "@/assets/portfolio-2.jpg";
import portfolio3 from "@/assets/portfolio-3.jpg";
import portfolio4 from "@/assets/portfolio-4.jpg";
import portfolio5 from "@/assets/portfolio-5.jpg";
import portfolio6 from "@/assets/portfolio-6.jpg";

const samples = [
  { image: portfolio1, alt: "Vegetables Store" },
  { image: portfolio2, alt: "T-Shirts Store" },
  { image: portfolio3, alt: "Electronics Marketplace" },
  { image: portfolio4, alt: "Accessories Store" },
  { image: portfolio5, alt: "Gaming Store" },
  { image: portfolio6, alt: "Organic Food Store" },
];

const PortfolioSection = () => {
  return (
    <section id="portfolio" className="py-20 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-accent text-sm font-semibold uppercase tracking-widest">New Projects</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
            Some of Our Web Design Sample List
          </h2>
          <div className="mt-3 mx-auto w-16 h-1 rounded-full bg-gradient-to-r from-primary to-accent" />
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {samples.map((sample, i) => (
            <motion.a
              key={i}
              href="#"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 120 }}
              whileHover={{ y: -6 }}
              className="group relative glossy-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-500"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <motion.img
                  src={sample.image}
                  alt={sample.alt}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.12 }}
                  transition={{ duration: 0.6 }}
                />
              </div>
              {/* Glossy overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-6">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  className="flex items-center justify-between w-full"
                >
                  <span className="text-primary-foreground font-semibold text-sm">{sample.alt}</span>
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 90 }}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg glossy-btn"
                  >
                    <ExternalLink size={16} className="text-primary-foreground" />
                  </motion.div>
                </motion.div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
