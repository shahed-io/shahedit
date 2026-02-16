import portfolio1 from "@/assets/portfolio-1.jpg";
import portfolio2 from "@/assets/portfolio-2.jpg";
import portfolio3 from "@/assets/portfolio-3.jpg";
import portfolio4 from "@/assets/portfolio-4.jpg";
import portfolio5 from "@/assets/portfolio-5.jpg";
import portfolio6 from "@/assets/portfolio-6.jpg";

const samples = [
  { image: portfolio1, alt: "Vegetables Store" },
  { image: portfolio2, alt: "T-Shirts Store" },
  { image: portfolio3, alt: "Electronics Marketplace" },
  { image: portfolio4, alt: "Accessories Store" },
  { image: portfolio5, alt: "Gaming Store" },
  { image: portfolio6, alt: "Organic Food Store" },
];

const PortfolioSection = () => {
  return (
    <section id="portfolio" className="py-12 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
            New Projects
          </h3>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            Some of Our Web Design Sample List
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {samples.map((sample, i) => (
            <a
              key={i}
              href="#"
              className="group rounded-lg overflow-hidden border border-border bg-card"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={sample.image}
                  alt={sample.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
