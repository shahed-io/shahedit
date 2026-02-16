import { Star, ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface Product {
  name: string;
  category: string;
  originalPrice?: number;
  currentPrice?: number;
  discount?: number;
  inStock: boolean;
}

const products: Product[] = [
  { name: "Advanced Plan", category: "Web Development", originalPrice: 45000, currentPrice: 14999, discount: 67, inStock: true },
  { name: "Basic Plan", category: "Business Solutions, Web Development", inStock: true },
  { name: "Enterprise Plan", category: "Business Solutions, Web Development", originalPrice: 399999, currentPrice: 149999, discount: 63, inStock: true },
  { name: "Premium Plan", category: "Web Development", originalPrice: 75999, currentPrice: 34999, discount: 54, inStock: true },
  { name: "Standard Plan", category: "Business Solutions, Web Development", originalPrice: 40000, currentPrice: 9999, discount: 75, inStock: true },
];

const formatPrice = (price: number) => `৳ ${price.toLocaleString("en-BD")}.00`;

const bgGradients = [
  "from-primary/8 via-accent/4 to-transparent",
  "from-accent/8 via-primary/4 to-transparent",
  "from-violet-500/8 via-primary/4 to-transparent",
  "from-primary/8 via-pink-500/4 to-transparent",
  "from-accent/8 via-violet-500/4 to-transparent",
];

const ProductCard = ({ product, index }: { product: Product; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, type: "spring", stiffness: 120 }}
    whileHover={{ y: -6 }}
    className="group glossy-card border border-border rounded-2xl overflow-hidden hover:border-primary/25 transition-all duration-500"
  >
    <div className={`relative aspect-square bg-gradient-to-br ${bgGradients[index]} flex items-center justify-center`}>
      <motion.div
        className="text-6xl font-bold text-primary/10 group-hover:text-primary/20 transition-all duration-500"
        whileHover={{ scale: 1.2, rotate: 5 }}
      >
        {product.name.charAt(0)}
      </motion.div>
      {product.discount && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          whileInView={{ scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
        >
          <Badge className="absolute top-3 left-3 badge-discount text-xs rounded-full px-2.5 py-0.5 font-bold shadow-lg glossy-btn">
            -{product.discount}%
          </Badge>
        </motion.div>
      )}
    </div>
    <div className="p-5 relative">
      <p className="text-xs text-muted-foreground mb-1.5 truncate">{product.category}</p>
      <h3 className="font-bold text-foreground text-base mb-2 group-hover:text-primary transition-colors duration-300">
        {product.name}
      </h3>
      <div className="flex items-center gap-0.5 mb-2">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={12} className="text-border" fill="hsl(var(--border))" />
        ))}
      </div>
      {product.inStock && (
        <p className="text-xs font-medium text-[hsl(var(--success-green))] mb-3 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--success-green))] animate-pulse" /> In stock
        </p>
      )}
      <div className="flex items-baseline gap-2 mb-4">
        {product.originalPrice && (
          <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
        )}
        {product.currentPrice ? (
          <span className="text-lg font-bold text-foreground">{formatPrice(product.currentPrice)}</span>
        ) : (
          <span className="text-sm font-medium text-muted-foreground">Contact us</span>
        )}
      </div>
      {product.currentPrice ? (
        <Button
          size="sm"
          className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-full text-xs font-semibold h-9 glossy-btn group/btn hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
        >
          <ShoppingCart size={14} className="mr-1.5 group-hover/btn:animate-bounce" /> Add to cart
        </Button>
      ) : (
        <Button size="sm" variant="outline" className="w-full rounded-full text-xs font-semibold h-9 hover:border-primary hover:text-primary transition-all duration-300">
          Read more
        </Button>
      )}
    </div>
  </motion.div>
);

const ProductsSection = () => {
  return (
    <section id="services" className="py-20 bg-secondary/30 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-accent/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative">
        <div className="flex items-end justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-accent text-sm font-semibold uppercase tracking-widest">Our Plans</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">Web Development</h2>
            <div className="mt-3 w-16 h-1 rounded-full bg-gradient-to-r from-primary to-accent" />
          </motion.div>
          <motion.a
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            href="#"
            className="text-sm text-primary hover:text-accent font-semibold flex items-center gap-1 transition-colors duration-300 group"
          >
            More Products <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {products.map((product, i) => (
            <ProductCard key={product.name} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
