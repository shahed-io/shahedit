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
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top-left primary orb */}
        <div className="orb orb-primary absolute" style={{ width: 600, height: 600, top: '-150px', left: '-150px', opacity: 0.12 }} />
        {/* Top-right accent orb */}
        <div className="orb orb-accent absolute" style={{ width: 500, height: 500, top: '-100px', right: '-150px', opacity: 0.10 }} />
        {/* Mid blue orb */}
        <div className="orb orb-blue absolute" style={{ width: 400, height: 400, top: '40%', left: '60%', opacity: 0.08 }} />
        {/* Bottom-left orb */}
        <div className="orb orb-primary absolute" style={{ width: 500, height: 500, bottom: '10%', left: '-100px', opacity: 0.09 }} />
        {/* Bottom-right accent */}
        <div className="orb orb-accent absolute" style={{ width: 350, height: 350, bottom: '-50px', right: '5%', opacity: 0.08 }} />

        {/* Subtle animated moving orb */}
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
        <SiteFooter />
        <WhatsAppButton />
      </div>
    </div>
  );
};

export default Index;
