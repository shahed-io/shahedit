import SiteHeader from "@/components/SiteHeader";
import HeroBanner from "@/components/HeroBanner";
import PopularCategories from "@/components/PopularCategories";
import HowWeHelp from "@/components/HowWeHelp";
import IndustrySolutions from "@/components/IndustrySolutions";
import ProductsSection from "@/components/ProductsSection";
import PortfolioSection from "@/components/PortfolioSection";
import TechStack from "@/components/TechStack";
import AboutSection from "@/components/AboutSection";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <HeroBanner />
      <PopularCategories />
      <HowWeHelp />
      <IndustrySolutions />
      <ProductsSection />
      <PortfolioSection />
      <TechStack />
      <AboutSection />
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
