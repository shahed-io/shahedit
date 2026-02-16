import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Product {
  name: string;
  category: string;
  originalPrice?: number;
  currentPrice?: number;
  discount?: number;
  inStock: boolean;
}

const products: Product[] = [
  {
    name: "Advanced Plan",
    category: "Web Development",
    originalPrice: 45000,
    currentPrice: 14999,
    discount: 67,
    inStock: true,
  },
  {
    name: "Basic Plan",
    category: "Business Solutions, Web Development",
    inStock: true,
  },
  {
    name: "Enterprise Plan",
    category: "Business Solutions, Web Development",
    originalPrice: 399999,
    currentPrice: 149999,
    discount: 63,
    inStock: true,
  },
  {
    name: "Premium Plan",
    category: "Web Development",
    originalPrice: 75999,
    currentPrice: 34999,
    discount: 54,
    inStock: true,
  },
  {
    name: "Standard Plan",
    category: "Business Solutions, Web Development",
    originalPrice: 40000,
    currentPrice: 9999,
    discount: 75,
    inStock: true,
  },
];

const formatPrice = (price: number) => {
  return `৳ ${price.toLocaleString("en-BD")}.00`;
};

const ProductCard = ({ product }: { product: Product }) => (
  <div className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
    {/* Image placeholder */}
    <div className="relative aspect-square bg-muted flex items-center justify-center">
      <div className="text-4xl font-bold text-muted-foreground/20">
        {product.name.charAt(0)}
      </div>
      {product.discount && (
        <Badge className="absolute top-2 left-2 badge-discount text-xs">
          -{product.discount}%
        </Badge>
      )}
    </div>

    {/* Content */}
    <div className="p-4">
      <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">
        {product.name}
      </h3>
      <p className="text-xs text-muted-foreground mb-2">{product.category}</p>

      {/* Rating */}
      <div className="flex items-center gap-0.5 mb-2">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={12} className="text-muted-foreground/30" />
        ))}
      </div>

      {/* Stock */}
      {product.inStock && (
        <p className="text-xs text-[hsl(var(--success-green))] mb-2">In stock</p>
      )}

      {/* Price */}
      <div className="flex items-center gap-2 mb-3">
        {product.originalPrice && (
          <span className="text-xs text-muted-foreground line-through">
            {formatPrice(product.originalPrice)}
          </span>
        )}
        {product.currentPrice ? (
          <span className="text-sm font-bold text-foreground">
            {formatPrice(product.currentPrice)}
          </span>
        ) : (
          <span className="text-sm font-medium text-muted-foreground">Contact us</span>
        )}
      </div>

      {/* Actions */}
      {product.currentPrice ? (
        <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs">
          <ShoppingCart size={14} className="mr-1" /> Add to cart
        </Button>
      ) : (
        <Button size="sm" variant="outline" className="w-full text-xs">
          Read more
        </Button>
      )}
    </div>
  </div>
);

const ProductsSection = () => {
  return (
    <section id="services" className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            Web Development
          </h2>
          <a href="#" className="text-sm text-primary hover:underline">
            More Products →
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard key={product.name} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
