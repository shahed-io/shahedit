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

const gradients = [
  "from-primary/10 to-accent/5",
  "from-accent/10 to-primary/5",
  "from-violet-500/10 to-primary/5",
  "from-primary/10 to-pink-500/5",
  "from-accent/10 to-violet-500/5",
];

const ProductCard = ({ product, index }: { product: Product; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.08 }}
    className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300"
  >
    <div className={`relative aspect-square bg-gradient-to-br ${gradients[index]} flex items-center justify-center`}>
      <div className="text-5xl font-bold text-primary/15 group-hover:text-primary/25 transition-colors">
        {product.name.charAt(0)}
      </div>
      {product.discount && (
        <Badge className="absolute top-3 left-3 badge-discount text-xs rounded-full px-2.5 py-0.5 font-bold">
          -{product.discount}%
        </Badge>
      )}
    </div>
    <div className="p-5">
      <p className="text-xs text-muted-foreground mb-1 truncate">{product.category}</p>
      <h3 className="font-bold text-foreground text-base mb-2 group-hover:text-primary transition-colors">
        {product.name}
      </h3>
      <div className="flex items-center gap-0.5 mb-2">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={12} className="text-border" fill="hsl(var(--border))" />
        ))}
      </div>
      {product.inStock && (
        <p className="text-xs font-medium text-[hsl(var(--success-green))] mb-3">● In stock</p>
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
        <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full text-xs font-semibold h-9">
          <ShoppingCart size={14} className="mr-1.5" /> Add to cart
        </Button>
      ) : (
        <Button size="sm" variant="outline" className="w-full rounded-full text-xs font-semibold h-9">
          Read more
        </Button>
      )}
    </div>
  </motion.div>
);

const ProductsSection = () => {
  return (
    <section id="services" className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-accent text-sm font-semibold uppercase tracking-widest">Our Plans</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">Web Development</h2>
          </div>
          <a href="#" className="text-sm text-primary hover:text-primary/80 font-semibold flex items-center gap-1 transition-colors">
            More Products <ArrowRight size={14} />
          </a>
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
