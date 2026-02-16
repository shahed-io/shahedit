import { ShoppingCart, UtensilsCrossed, Building2, Monitor, Ticket, FileText, Settings, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

const solutions = [
  { icon: ShoppingCart, title: "Ecommerce", desc: "Powerful online store platforms tailored for growth and sales optimization.", gradient: "from-primary to-accent" },
  { icon: UtensilsCrossed, title: "Restaurant", desc: "Digital menu, ordering, and kitchen management systems for hospitality.", gradient: "from-orange-500 to-amber-400" },
  { icon: Building2, title: "ERP Systems", desc: "Integrated management of main business processes to streamline operations.", gradient: "from-violet-500 to-purple-400" },
  { icon: Monitor, title: "POS Solutions", desc: "Reliable and fast Point of Sale systems for modern retail environments.", gradient: "from-cyan-500 to-blue-400" },
  { icon: Ticket, title: "Ticketing", desc: "Efficient booking, reservation, and event management tools.", gradient: "from-pink-500 to-rose-400" },
  { icon: FileText, title: "Content Platforms", desc: "Custom blogs and dynamic content management systems for publishers.", gradient: "from-emerald-500 to-green-400" },
  { icon: Settings, title: "Management Solutions", desc: "Bespoke software to optimize complex workflows and team productivity.", gradient: "from-amber-500 to-yellow-400" },
  { icon: Smartphone, title: "Mobile Apps", desc: "High-performance iOS and Android applications for seamless experiences.", gradient: "from-indigo-500 to-blue-400" },
];

const IndustrySolutions = () => {
  return (
    <section className="py-20 bg-secondary/30 relative overflow-hidden">
      <div className="absolute top-0 left-1/3 w-[500px] h-[300px] bg-primary/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-accent text-sm font-semibold uppercase tracking-widest">Solutions</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
            Comprehensive IT Solutions for Every Industry
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            We deliver robust, scalable, and innovative technology services tailored to modernize your business operations across various sectors.
          </p>
          <div className="mt-4 mx-auto w-16 h-1 rounded-full bg-gradient-to-r from-primary to-accent" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {solutions.map((sol, i) => (
            <motion.div
              key={sol.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 120 }}
              whileHover={{ y: -8, scale: 1.03 }}
              className="glossy-card rounded-2xl border border-border p-6 group hover:border-primary/20 transition-all duration-500 cursor-pointer"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${sol.gradient} flex items-center justify-center mb-4 shadow-lg shimmer`}
              >
                <sol.icon size={24} className="text-primary-foreground drop-shadow-md" />
              </motion.div>
              <h3 className="font-bold text-foreground text-base mb-2 group-hover:text-primary transition-colors duration-300">
                {sol.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {sol.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndustrySolutions;
