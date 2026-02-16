import catWebDev from "@/assets/cat-web-dev.jpg";
import catFacebook from "@/assets/cat-facebook.jpg";
import catDigitalMarketing from "@/assets/cat-digital-marketing.jpg";
import catGraphics from "@/assets/cat-graphics.jpg";
import catMaintenance from "@/assets/cat-maintenance.jpg";
import catBusiness from "@/assets/cat-business.jpg";

const categories = [
  { name: "Web Development", products: 6, image: catWebDev },
  { name: "Facebook Services", products: 0, image: catFacebook },
  { name: "Digital Marketing", products: 0, image: catDigitalMarketing },
  { name: "Graphics Design", products: 0, image: catGraphics },
  { name: "Website Maintenance", products: 4, image: catMaintenance },
  { name: "Business Solutions", products: 3, image: catBusiness },
];

const PopularCategories = () => {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-8">
          Popular Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <a
              key={cat.name}
              href="#"
              className="group flex flex-col items-center p-4 rounded-lg bg-muted hover:shadow-md transition-all"
            >
              <div className="w-20 h-20 rounded-full bg-card overflow-hidden mb-3 group-hover:scale-105 transition-transform">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-sm font-semibold text-foreground text-center">
                {cat.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {cat.products} products
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCategories;
