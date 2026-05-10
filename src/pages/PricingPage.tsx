import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import type { PricingPlan } from "@/lib/supabase-types";

const PricingPage = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearly, setYearly] = useState(false);

  useEffect(() => {
    supabase.from("pricing_plans").select("*").eq("is_published", true).order("sort_order").then(({ data }) => {
      setPlans(data ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">Transparent Pricing</span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">Simple <span className="gradient-text">Pricing Plans</span></h1>
            <p className="text-muted-foreground max-w-xl mx-auto">No hidden fees. Choose the plan that works for your business.</p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className={`text-sm font-medium ${!yearly ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
              <button onClick={() => setYearly(!yearly)} className={`w-12 h-6 rounded-full transition-colors relative ${yearly ? "bg-primary" : "bg-secondary"}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${yearly ? "left-7" : "left-1"}`} />
              </button>
              <span className={`text-sm font-medium ${yearly ? "text-foreground" : "text-muted-foreground"}`}>Yearly <span className="text-accent text-xs">Save 20%</span></span>
            </div>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">{[...Array(3)].map((_, i) => <div key={i} className="h-96 bg-card rounded-3xl animate-pulse" />)}</div>
          ) : plans.length === 0 ? (
            <div className="text-center py-20"><p className="text-muted-foreground">Pricing plans coming soon...</p></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {plans.map((plan, i) => (
                <motion.div key={plan.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`glossy-card rounded-3xl p-7 border relative overflow-hidden transition-all duration-300 ${
                    plan.is_popular ? "border-primary shadow-xl shadow-primary/20" : "border-border hover:border-primary/40"
                  }`}
                >
                  {plan.is_popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-primary to-accent text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl flex items-center gap-1">
                      <Zap size={12} /> Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-5">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold gradient-text">
                      ৳{yearly ? ((plan.price_yearly ?? 0) / 12).toLocaleString("en-IN") : (plan.price_monthly ?? 0).toLocaleString("en-IN")}
                    </span>
                    <span className="text-muted-foreground text-sm">/month</span>
                    {yearly && <p className="text-accent text-xs mt-1">Billed yearly: ৳{(plan.price_yearly ?? 0).toLocaleString("en-IN")}</p>}
                  </div>
                  {plan.features && plan.features.length > 0 && (
                    <ul className="space-y-3 mb-7">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                          <Check size={15} className="text-accent flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link to="/get-quote" className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 ${
                    plan.is_popular ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30" : "bg-secondary text-foreground hover:bg-primary/10"
                  }`}>
                    Get Started
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
};

export default PricingPage;
