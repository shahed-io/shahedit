import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
import type { Service } from "@/lib/supabase-types";

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("services").select("*").eq("is_published", true).order("sort_order").then(({ data }) => {
      setServices(data ?? []);
      setLoading(false);
    });
  }, []);

  const icons = ["💻", "📱", "🎨", "📊", "🔐", "☁️", "🤖", "📧"];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">What We Offer</span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">Our <span className="gradient-text">Services</span></h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">Professional IT solutions tailored for your business growth</p>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-card rounded-2xl animate-pulse" />)}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">Services coming soon...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, i) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="glossy-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="text-4xl mb-4">{service.icon || icons[i % icons.length]}</div>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{service.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">{service.short_description}</p>
                  {service.features && service.features.length > 0 && (
                    <ul className="space-y-1 mb-4">
                      {service.features.slice(0, 3).map((f, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link to="/get-quote" className="text-primary text-sm font-semibold hover:underline">Get a Quote →</Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
};

export default ServicesPage;
