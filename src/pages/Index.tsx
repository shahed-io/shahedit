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
      {/* Static background orbs (no animation, fixed = painted once) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" style={{ contain: 'strict', transform: 'translateZ(0)' }}>
        <div className="orb orb-primary absolute" style={{ width: 600, height: 600, top: '-150px', left: '-150px', opacity: 0.12, willChange: 'transform' }} />
        <div className="orb orb-accent absolute" style={{ width: 500, height: 500, top: '-100px', right: '-150px', opacity: 0.10, willChange: 'transform' }} />
        <div className="orb orb-primary absolute" style={{ width: 500, height: 500, bottom: '10%', left: '-100px', opacity: 0.09, willChange: 'transform' }} />
      </div>

      <div className="relative z-10">
        <SiteHeader />
        <HeroBanner />
        <div style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 800px' }}>
          <PopularCategories />
        </div>
        <div style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 1000px' }}>
          <ProductsSection />
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
