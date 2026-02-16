import { motion } from "framer-motion";
import { Code, Facebook, BarChart3, Palette, Wrench, Briefcase } from "lucide-react";

const categories = [
  { name: "Web Development", products: 6, icon: Code, color: "from-primary to-primary/70" },
  { name: "Facebook Services", products: 0, icon: Facebook, color: "from-blue-500 to-blue-400" },
  { name: "Digital Marketing", products: 0, icon: BarChart3, color: "from-accent to-accent/70" },
  { name: "Graphics Design", products: 0, icon: Palette, color: "from-pink-500 to-pink-400" },
  { name: "Website Maintenance", products: 4, icon: Wrench, color: "from-amber-500 to-amber-400" },
  { name: "Business Solutions", products: 3, icon: Briefcase, color: "from-violet-500 to-violet-400" },
];

const PopularCategories = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-accent text-sm font-semibold uppercase tracking-widest">Browse</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
            Popular Categories
          </h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {categories.map((cat, i) => (
            <motion.a
              key={cat.name}
              href="#"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <cat.icon size={24} className="text-primary-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-foreground text-center leading-tight">
                {cat.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {cat.products} products
              </p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCategories;
