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
import TrustStatsBar from "@/components/TrustStatsBar";

import SiteFooter from "@/components/SiteFooter";

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="orb orb-primary absolute" style={{ width: 600, height: 600, top: '-150px', left: '-150px', opacity: 0.12 }} />
        <div className="orb orb-accent absolute" style={{ width: 500, height: 500, top: '-100px', right: '-150px', opacity: 0.10 }} />
        <div className="orb orb-blue absolute" style={{ width: 400, height: 400, top: '40%', left: '60%', opacity: 0.08 }} />
        <div className="orb orb-primary absolute" style={{ width: 500, height: 500, bottom: '10%', left: '-100px', opacity: 0.09 }} />
        <div className="orb orb-accent absolute" style={{ width: 350, height: 350, bottom: '-50px', right: '5%', opacity: 0.08 }} />
        <div
          className="absolute rounded-full"
          style={{
            width: 300, height: 300,
            top: '25%', left: '45%',
            background: 'radial-gradient(circle, hsl(245,80%,65%) 0%, transparent 70%)',
            opacity: 0.06,
            filter: 'blur(60px)',
            animation: 'float 8s ease-in-out infinite',
          }}
        />
      </div>

      <div className="relative z-10">
        <SiteHeader />
        <HeroBanner />
        <PopularCategories />
        <HowWeHelp />
        <IndustrySolutions />
        <ProductsSection />
        <PortfolioSection />
        <TechStack />
        <AboutSection />
        
        <FaqSection />
        <SiteFooter />
      </div>
    </div>
  );
};

export default Index;
