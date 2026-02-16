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
    <section id="portfolio" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-accent text-sm font-semibold uppercase tracking-widest">New Projects</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
            Some of Our Web Design Sample List
          </h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {samples.map((sample, i) => (
            <motion.a
              key={i}
              href="#"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group relative rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/30 transition-all duration-300"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={sample.image}
                  alt={sample.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                <div className="flex items-center justify-between w-full">
                  <span className="text-primary-foreground font-semibold text-sm">{sample.alt}</span>
                  <div className="w-9 h-9 rounded-full bg-primary/80 flex items-center justify-center">
                    <ExternalLink size={16} className="text-primary-foreground" />
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
