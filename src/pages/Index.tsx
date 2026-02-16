import SiteHeader from "@/components/SiteHeader";
import HeroBanner from "@/components/HeroBanner";
import PopularCategories from "@/components/PopularCategories";
import ProductsSection from "@/components/ProductsSection";
import PortfolioSection from "@/components/PortfolioSection";
import AboutSection from "@/components/AboutSection";
import SiteFooter from "@/components/SiteFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <HeroBanner />
      <PopularCategories />
      <ProductsSection />
      <PortfolioSection />
      <AboutSection />
      <SiteFooter />
    </div>
  );
};

export default Index;
