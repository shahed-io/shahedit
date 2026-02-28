import { motion } from "framer-motion";
import { ExternalLink, ArrowRight } from "lucide-react";
import portfolio1 from "@/assets/portfolio-1.jpg";
import portfolio2 from "@/assets/portfolio-2.jpg";
import portfolio3 from "@/assets/portfolio-3.jpg";
import portfolio4 from "@/assets/portfolio-4.jpg";
import portfolio5 from "@/assets/portfolio-5.jpg";
import portfolio6 from "@/assets/portfolio-6.jpg";

const samples = [
  { image: portfolio1, alt: "Vegetables Store", tag: "E-Commerce" },
  { image: portfolio2, alt: "T-Shirts Store", tag: "Fashion" },
  { image: portfolio3, alt: "Electronics Marketplace", tag: "Electronics" },
  { image: portfolio4, alt: "Accessories Store", tag: "Accessories" },
  { image: portfolio5, alt: "Gaming Store", tag: "Gaming" },
  { image: portfolio6, alt: "Organic Food Store", tag: "Food & Health" },
];

const PortfolioSection = () => {
  return (
    <section id="portfolio" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 tech-grid-bg opacity-35" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, hsl(258,90%,66%) 0%, transparent 65%)', filter: 'blur(120px)', opacity: 0.07 }} />
      <div className="absolute right-0 bottom-0 w-[400px] h-[400px] rounded-full"
        style={{ background: 'radial-gradient(circle, hsl(185,100%,48%) 0%, transparent 65%)', filter: 'blur(100px)', opacity: 0.07 }} />

      <div className="container mx-auto px-4 relative">
        <div className="flex items-end justify-between mb-16">
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4"
              style={{ background: 'rgba(315,80%,65%,0.10)', border: '1px solid rgba(236,72,153,0.25)', color: 'hsl(315,80%,70%)' }}
            >
              ◈ Our Work
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-black text-foreground mt-2">
              Recent <span className="gradient-text-pink">Projects</span>
            </h2>
            <div className="mt-4 w-20 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(315,80%,65%), hsl(258,90%,66%))' }} />
          </motion.div>
          <motion.a
            href="/portfolio"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden md:flex items-center gap-2 text-sm font-semibold transition-all duration-300 group px-5 py-2.5 rounded-xl"
            style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.22)', color: 'hsl(258,90%,75%)' }}
          >
            View All Projects <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {samples.map((sample, i) => (
            <motion.a
              key={i}
              href="/portfolio"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.09, type: "spring", stiffness: 120 }}
              whileHover={{ y: -6 }}
              className="group relative rounded-2xl overflow-hidden cursor-pointer"
              style={{ border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <motion.img
                  src={sample.image}
                  alt={sample.alt}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Tag */}
              <div className="absolute top-3 left-3 px-3 py-1 text-xs font-bold rounded-full"
                style={{ background: 'rgba(10,8,20,0.80)', border: '1px solid rgba(139,92,246,0.30)', color: 'hsl(258,90%,75%)', backdropFilter: 'blur(10px)' }}>
                {sample.tag}
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-400 flex items-end p-5"
                style={{ background: 'linear-gradient(to top, rgba(10,8,20,0.92) 0%, rgba(10,8,20,0.50) 50%, transparent 100%)' }}>
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="text-xs text-foreground/50 mb-1">{sample.tag}</p>
                    <span className="text-white font-bold">{sample.alt}</span>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 45 }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, hsl(258,90%,66%), hsl(185,100%,48%))' }}
                  >
                    <ExternalLink size={15} className="text-white" />
                  </motion.div>
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
