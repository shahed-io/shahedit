import { lazy, Suspense } from "react";
import SiteHeader from "@/components/SiteHeader";
import HeroBanner from "@/components/HeroBanner";
import ProductsSection from "@/components/ProductsSection";

const RecentlyViewedSection = lazy(() => import("@/components/RecentlyViewedSection"));
const PortfolioSection = lazy(() => import("@/components/PortfolioSection"));
const TechStack = lazy(() => import("@/components/TechStack"));
const AboutSection = lazy(() => import("@/components/AboutSection"));
const HowWeHelp = lazy(() => import("@/components/HowWeHelp"));
const IndustrySolutions = lazy(() => import("@/components/IndustrySolutions"));
const FaqSection = lazy(() => import("@/components/FaqSection"));
const SiteFooter = lazy(() => import("@/components/SiteFooter"));

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="relative z-10">
        <SiteHeader />
        <HeroBanner />
        <div style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 1000px' }}>
          <ProductsSection />
        </div>
        <Suspense fallback={null}>
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
        </Suspense>
      </div>
    </div>
  );
};

export default Index;
