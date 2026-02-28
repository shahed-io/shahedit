import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
import { SectionHeader, CTASection } from "@/components/ui/section-components";
import { GridSkeleton } from "@/components/ui/skeleton-loaders";
import type { PricingPlan } from "@/lib/supabase-types";

const PricingPage = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearly, setYearly] = useState(false);

  useEffect(() => {
    supabase.from("pricing_plans").select("*").eq("is_published", true).order("sort_order")
      .then(({ data }) => { setPlans(data ?? []); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="section-py hero-gradient relative overflow-hidden" aria-labelledby="pricing-heading">
        <div className="absolute inset-0 subtle-grid opacity-40" aria-hidden="true" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-8">
            <SectionHeader
              label="Transparent Pricing"
              title={<>Simple <span className="gradient-text">Pricing Plans</span></>}
              description="No hidden fees. Choose the plan that fits your business best."
            />
          </div>
          {/* Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${!yearly ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
            <button
              role="switch"
              aria-checked={yearly}
              aria-label="Toggle yearly pricing"
              onClick={() => setYearly(!yearly)}
              className={`w-12 h-6 rounded-full transition-colors relative focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${yearly ? "bg-primary" : "bg-border"}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${yearly ? "left-7" : "left-1"}`} aria-hidden="true" />
            </button>
            <span className={`text-sm font-medium ${yearly ? "text-foreground" : "text-muted-foreground"}`}>
              Yearly <span className="tag-accent ml-1">Save 20%</span>
            </span>
          </div>
        </div>
      </section>

      <section className="section-py" aria-label="Pricing plans">
        <div className="container mx-auto px-4">
          {loading ? (
            <GridSkeleton count={3} />
          ) : plans.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-muted-foreground text-lg">Pricing plans coming soon...</p>
            </div>
          ) : (
            <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto" role="list">
              {plans.map((plan, i) => (
                <motion.li
                  key={plan.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <article
                    className={`tech-card h-full flex flex-col relative overflow-hidden ${plan.is_popular ? "border-primary" : ""}`}
                    aria-label={`${plan.name} plan${plan.is_popular ? " — most popular" : ""}`}
                  >
                    {plan.is_popular && (
                      <div
                        className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-bl-xl flex items-center gap-1"
                        aria-hidden="true"
                      >
                        <Zap size={11} /> Most Popular
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm mb-5">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold gradient-text" aria-label={`${yearly ? ((plan.price_yearly ?? 0) / 12).toLocaleString() : (plan.price_monthly ?? 0).toLocaleString()} taka per month`}>
                        ৳{yearly
                          ? ((plan.price_yearly ?? 0) / 12).toLocaleString()
                          : (plan.price_monthly ?? 0).toLocaleString()}
                      </span>
                      <span className="text-muted-foreground text-sm">/month</span>
                      {yearly && <p className="text-accent text-xs mt-1">Billed yearly: ৳{(plan.price_yearly ?? 0).toLocaleString()}</p>}
                    </div>
                    {plan.features && plan.features.length > 0 && (
                      <ul className="space-y-2.5 mb-7 flex-1" role="list" aria-label="Plan features">
                        {plan.features.map((f, j) => (
                          <li key={j} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                            <Check size={14} className="text-accent flex-shrink-0" aria-hidden="true" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link
                      to="/get-quote"
                      className={plan.is_popular ? "btn-primary justify-center text-sm" : "btn-secondary justify-center text-sm"}
                      aria-label={`Get started with ${plan.name} plan`}
                    >
                      Get Started
                    </Link>
                  </article>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <CTASection
        title="Need a custom plan?"
        description="We build bespoke solutions. Let's discuss your unique requirements."
        primaryLabel="Contact Sales"
        primaryHref="/contact"
      />

      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
};

export default PricingPage;
