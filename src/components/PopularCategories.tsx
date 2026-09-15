import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Code2, Smartphone, Palette, BarChart3, Cloud, ShieldCheck } from "lucide-react";

const categories = [
  { name: "Web Development", icon: Code2, href: "/services/web-development", color: "#8b5cf6", count: 18 },
  { name: "Website Maintenance", icon: Smartphone, href: "/services/website-maintenance", color: "#60a5fa", count: 12 },
  { name: "Graphics Design", icon: Palette, href: "/services/graphics-design", color: "#f472b6", count: 2 },
  { name: "Digital Marketing", icon: BarChart3, href: "/services/digital-marketing", color: "#34d399", count: 8 },
  { name: "Facebook Services", icon: Cloud, href: "/services/facebook-services", color: "#f59e0b", count: 1 },
  { name: "Business Solutions", icon: ShieldCheck, href: "/services/business-solutions", color: "#2dd4bf", count: 1 },
];

const PopularCategories = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.18),_transparent_65%)]" />

      <div className="container relative mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-violet-200/80">
            Popular Solutions
          </p>
          <h2 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
            Explore Our <span className="gradient-text">Categories</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="premium-category-shell mx-auto max-w-3xl"
        >
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                to={cat.href}
                aria-label={`Explore ${cat.name}`}
                title={cat.name}
                className="premium-category-item group"
              >
                <div className="premium-category-main">
                  <div
                    className="premium-category-icon"
                    style={{
                      background: `linear-gradient(135deg, ${cat.color}22, ${cat.color}0d)`,
                      borderColor: `${cat.color}66`,
                      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18), 0 0 24px ${cat.color}25`,
                    }}
                  >
                    <cat.icon size={18} strokeWidth={2.1} style={{ color: cat.color }} />
                  </div>

                  <span className="premium-category-name">{cat.name}</span>
                </div>

                <span className="premium-category-count">{cat.count}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PopularCategories;
