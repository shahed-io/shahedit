import SiteHeader from "@/components/SiteHeader";
import HeroBanner from "@/components/HeroBanner";
import PopularCategories from "@/components/PopularCategories";
import HowWeHelp from "@/components/HowWeHelp";
import IndustrySolutions from "@/components/IndustrySolutions";
import ProductsSection from "@/components/ProductsSection";
import PortfolioSection from "@/components/PortfolioSection";
import TechStack from "@/components/TechStack";
import AboutSection from "@/components/AboutSection";
import FaqSection from "@/components/FaqSection";


import RecentlyViewedSection from "@/components/RecentlyViewedSection";
import SiteFooter from "@/components/SiteFooter";

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="relative z-10">
        <SiteHeader />
        <HeroBanner />
        <div style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 800px' }}>
          <PopularCategories />
        </div>
        <div style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 1000px' }}>
          <ProductsSection />
        </div>
        <div style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 600px' }}>
          <RecentlyViewedSection limit={4} />
        </div>
        <div style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 800px' }}>
          <PortfolioSection />
        </div>
        <div style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 600px' }}>
          <TechStack />
        </div>
        <div style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 700px' }}>
          <AboutSection />
        </div>
        <div style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 800px' }}>
          <HowWeHelp />
        </div>
        <div style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 800px' }}>
          <IndustrySolutions />
        </div>
        <div style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 600px' }}>
          <FaqSection />
        </div>
        <SiteFooter />
      </div>
    </div>
  );
};

export default Index;
