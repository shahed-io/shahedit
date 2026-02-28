import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
import { SectionHeader, CTASection } from "@/components/ui/section-components";
import { GridSkeleton } from "@/components/ui/skeleton-loaders";
import type { Service } from "@/lib/supabase-types";

const serviceIcons = ["💻", "📱", "🛒", "📊", "🎨", "🔐", "☁️", "🤖", "📧", "🔧"];

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("services").select("*").eq("is_published", true).order("sort_order")
      .then(({ data }) => { setServices(data ?? []); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="section-py hero-gradient relative overflow-hidden" aria-labelledby="services-heading">
        <div className="absolute inset-0 subtle-grid opacity-40" aria-hidden="true" />
        <div className="container mx-auto px-4 relative text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <SectionHeader
              label="What We Offer"
              title={<>Our <span className="gradient-text">Services</span></>}
              description="Professional IT solutions tailored to your business needs — from idea to deployment."
            />
          </motion.div>
        </div>
      </section>

      {/* Services grid */}
      <section className="section-py" aria-label="Services list">
        <div className="container mx-auto px-4">
          {loading ? (
            <GridSkeleton count={6} />
          ) : services.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-4xl mb-4" aria-hidden="true">🚀</p>
              <p className="text-muted-foreground text-lg">Services coming soon. Check back later!</p>
            </div>
          ) : (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
              {services.map((service, i) => (
                <motion.li
                  key={service.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  <article className="tech-card h-full flex flex-col group" aria-labelledby={`svc-${service.id}`}>
                    {service.image_url && (
                      <div className="mb-4 overflow-hidden rounded-lg h-40 bg-secondary">
                        <img
                          src={service.image_url}
                          alt={`${service.title} illustration`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl bg-primary/8 flex-shrink-0"
                      aria-hidden="true"
                    >
                      {service.icon || serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 id={`svc-${service.id}`} className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">{service.short_description}</p>
                    {service.features && service.features.length > 0 && (
                      <ul className="space-y-1 mb-5" role="list" aria-label="Key features">
                        {service.features.slice(0, 3).map((f, j) => (
                          <li key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" aria-hidden="true" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link
                      to="/get-quote"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all mt-auto"
                      aria-label={`Get a quote for ${service.title}`}
                    >
                      Get a Quote <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </article>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <CTASection
        title="Ready to start your project?"
        description="Get a free consultation and custom quote within 24 hours."
        primaryLabel="Get Free Quote"
        primaryHref="/get-quote"
        secondaryLabel="Contact Us"
        secondaryHref="/contact"
      />

      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
};

export default ServicesPage;
