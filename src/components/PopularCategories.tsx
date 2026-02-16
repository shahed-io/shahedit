import { motion } from "framer-motion";
import { Code, Facebook, BarChart3, Palette, Wrench, Briefcase } from "lucide-react";

const categories = [
  { name: "Web Development", products: 6, icon: Code, gradient: "from-primary via-primary/80 to-accent" },
  { name: "Facebook Services", products: 0, icon: Facebook, gradient: "from-blue-500 via-blue-400 to-blue-300" },
  { name: "Digital Marketing", products: 0, icon: BarChart3, gradient: "from-accent via-accent/80 to-emerald-400" },
  { name: "Graphics Design", products: 0, icon: Palette, gradient: "from-pink-500 via-rose-400 to-pink-300" },
  { name: "Website Maintenance", products: 4, icon: Wrench, gradient: "from-amber-500 via-amber-400 to-yellow-300" },
  { name: "Business Solutions", products: 3, icon: Briefcase, gradient: "from-violet-500 via-purple-400 to-violet-300" },
];

const PopularCategories = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Subtle bg glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-accent text-sm font-semibold uppercase tracking-widest">Browse</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
            Popular Categories
          </h2>
          <div className="mt-3 mx-auto w-16 h-1 rounded-full bg-gradient-to-r from-primary to-accent" />
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {categories.map((cat, i) => (
            <motion.a
              key={cat.name}
              href="#"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 120 }}
              whileHover={{ y: -8, scale: 1.03 }}
              className="group glossy-card flex flex-col items-center p-6 rounded-2xl border border-border hover:border-primary/30 transition-all duration-500"
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
                transition={{ duration: 0.5 }}
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center mb-4 shadow-lg shimmer`}
              >
                <cat.icon size={26} className="text-primary-foreground drop-shadow-md" />
              </motion.div>
              <h3 className="text-sm font-semibold text-foreground text-center leading-tight group-hover:text-primary transition-colors duration-300">
                {cat.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 group-hover:text-accent transition-colors duration-300">
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
