import { Star, ArrowRight, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface Product {
  name: string;
  category: string;
  originalPrice?: number;
  currentPrice?: number;
  discount?: number;
  inStock: boolean;
  badge?: "hot" | "new";
}

const products: Product[] = [
  { name: "Advanced Plan", category: "Web Development", originalPrice: 45000, currentPrice: 14999, discount: 67, inStock: true, badge: "hot" },
  { name: "Basic Plan", category: "Business Solutions", inStock: true, badge: "new" },
  { name: "Enterprise Plan", category: "Business Solutions", originalPrice: 399999, currentPrice: 149999, discount: 63, inStock: true },
  { name: "Premium Plan", category: "Web Development", originalPrice: 75999, currentPrice: 34999, discount: 54, inStock: true },
  { name: "Standard Plan", category: "Web Development", originalPrice: 40000, currentPrice: 9999, discount: 75, inStock: true, badge: "hot" },
];

const formatPrice = (price: number) => `৳ ${price.toLocaleString("en-BD")}`;

const cardColors = [
  { color: "hsl(258,90%,66%)", bg: "rgba(139,92,246,0.10)", border: "rgba(139,92,246,0.22)" },
  { color: "hsl(185,100%,48%)", bg: "rgba(6,182,212,0.10)", border: "rgba(6,182,212,0.22)" },
  { color: "hsl(315,80%,65%)", bg: "rgba(236,72,153,0.10)", border: "rgba(236,72,153,0.22)" },
  { color: "hsl(258,90%,66%)", bg: "rgba(139,92,246,0.10)", border: "rgba(139,92,246,0.22)" },
  { color: "hsl(45,93%,58%)", bg: "rgba(234,179,8,0.10)", border: "rgba(234,179,8,0.22)" },
];

const ProductCard = ({ product, index }: { product: Product; index: number }) => {
  const c = cardColors[index % cardColors.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 120 }}
      whileHover={{ y: -8 }}
      className="group rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 flex flex-col"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      {/* Top visual area */}
      <div className="relative h-36 flex items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${c.color}15, ${c.color}05)` }}>
        {/* Glowing initial */}
        <motion.div
          whileHover={{ scale: 1.2, rotate: 10 }}
          className="text-7xl font-black select-none"
          style={{ color: `${c.color}20`, fontFamily: "'Syne', sans-serif" }}
        >
          {product.name.charAt(0)}
        </motion.div>

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: `${c.color}18`, border: `1px solid ${c.color}30`, boxShadow: `0 0 25px ${c.color}20` }}>
            <Zap size={22} style={{ color: c.color }} />
          </div>
        </div>

        {/* Badges */}
        {product.discount && (
          <div className="absolute top-3 left-3 px-2.5 py-1 text-xs font-black rounded-full text-white"
            style={{ background: 'linear-gradient(135deg, hsl(0,84%,60%), hsl(15,90%,55%))', boxShadow: '0 0 12px rgba(239,68,68,0.4)' }}>
            -{product.discount}%
          </div>
        )}
        {product.badge === "hot" && (
          <div className="absolute top-3 right-3 px-2.5 py-1 text-xs font-black rounded-full text-white badge-hot">
            🔥 HOT
          </div>
        )}
        {product.badge === "new" && (
          <div className="absolute top-3 right-3 px-2.5 py-1 text-xs font-black rounded-full badge-new">
            ✨ NEW
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-xs text-foreground/40 mb-1.5 font-medium">{product.category}</p>
        <h3 className="font-bold text-foreground/90 text-sm mb-2.5 group-hover:text-white transition-colors">
          {product.name}
        </h3>

        {/* Stars */}
        <div className="flex items-center gap-0.5 mb-2.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={11} style={{ color: 'hsl(45,93%,58%)' }} fill="hsl(45,93%,58%)" />
          ))}
        </div>

        {product.inStock && (
          <p className="text-xs font-semibold mb-3 flex items-center gap-1.5" style={{ color: 'hsl(155,70%,50%)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'hsl(155,70%,50%)' }} />
            In Stock
          </p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4 mt-auto">
          {product.originalPrice && (
            <span className="text-xs text-foreground/35 line-through">{formatPrice(product.originalPrice)}</span>
          )}
          {product.currentPrice ? (
            <span className="text-lg font-black" style={{ color: c.color }}>{formatPrice(product.currentPrice)}</span>
          ) : (
            <span className="text-sm font-semibold text-foreground/50">Contact us</span>
          )}
        </div>

        <Link to="/get-quote">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white glossy-btn transition-all duration-300"
            style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}BB)`, boxShadow: `0 4px 15px ${c.color}35` }}
          >
            {product.currentPrice ? "Get Started" : "Get a Quote"}
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
};

const ProductsSection = () => {
  return (
    <section id="services" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-20" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] rounded-full"
        style={{ background: 'radial-gradient(ellipse, hsl(185,100%,48%) 0%, transparent 65%)', filter: 'blur(120px)', opacity: 0.08 }} />

      <div className="container mx-auto px-4 relative">
        <div className="flex items-end justify-between mb-16">
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4"
              style={{ background: 'rgba(45,93%,58%,0.10)', border: '1px solid rgba(234,179,8,0.25)', color: 'hsl(45,93%,65%)' }}
            >
              ◈ Pricing Plans
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-black text-foreground mt-2">
              Web <span className="gradient-text">Development</span> Plans
            </h2>
            <div className="mt-4 w-20 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(258,90%,66%), hsl(45,93%,58%))' }} />
          </motion.div>
          <motion.a
            href="/pricing"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden md:flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl group transition-all"
            style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.22)', color: 'hsl(258,90%,75%)' }}
          >
            All Plans <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map((product, i) => (
            <ProductCard key={product.name} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
