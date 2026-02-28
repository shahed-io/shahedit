import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
import { SectionHeader, CTASection } from "@/components/ui/section-components";
import { GridSkeleton } from "@/components/ui/skeleton-loaders";
import type { Project } from "@/lib/supabase-types";

const PortfolioPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    supabase.from("projects").select("*").eq("is_published", true).order("sort_order")
      .then(({ data }) => { setProjects(data ?? []); setLoading(false); });
  }, []);

  const categories = ["All", ...Array.from(new Set(projects.map(p => p.category).filter(Boolean) as string[]))];
  const filtered = filter === "All" ? projects : projects.filter(p => p.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="section-py hero-gradient relative overflow-hidden" aria-labelledby="portfolio-heading">
        <div className="absolute inset-0 subtle-grid opacity-40" aria-hidden="true" />
        <div className="container mx-auto px-4 relative text-center">
          <SectionHeader
            label="Our Work"
            title={<>Portfolio & <span className="gradient-text">Projects</span></>}
            description="Explore our successful projects across various industries and technologies."
          />
        </div>
      </section>

      <section className="section-py" aria-label="Portfolio projects">
        <div className="container mx-auto px-4">
          {/* Filter tabs */}
          {!loading && categories.length > 1 && (
            <div className="flex gap-2 justify-center flex-wrap mb-10" role="group" aria-label="Filter projects by category">
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  aria-pressed={filter === c}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring ${
                    filter === c
                      ? "bg-primary text-primary-foreground shadow-primary-glow"
                      : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <GridSkeleton count={6} />
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-4xl mb-4" aria-hidden="true">🎨</p>
              <p className="text-muted-foreground text-lg">No projects found. Check back soon!</p>
            </div>
          ) : (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
              {filtered.map((project, i) => (
                <motion.li
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  <article className="tech-card overflow-hidden group h-full flex flex-col" aria-labelledby={`proj-${project.id}`}>
                    <div className="relative overflow-hidden rounded-lg h-48 bg-secondary mb-4 flex-shrink-0">
                      {project.image_url ? (
                        <img
                          src={project.image_url}
                          alt={`${project.title} preview`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl" aria-hidden="true">🖥️</div>
                      )}
                      {project.project_url && (
                        <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <a
                            href={project.project_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View live project: ${project.title}`}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-foreground rounded-lg text-sm font-semibold hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white"
                            onClick={e => e.stopPropagation()}
                          >
                            <ExternalLink size={14} aria-hidden="true" /> View Live
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 id={`proj-${project.id}`} className="font-semibold text-foreground group-hover:text-primary transition-colors">{project.title}</h3>
                      {project.category && (
                        <span className="tag-accent ml-2 flex-shrink-0">{project.category}</span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed flex-1">{project.short_description}</p>
                    {project.tech_stack && project.tech_stack.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mt-3" role="list" aria-label="Technologies used">
                        {project.tech_stack.slice(0, 4).map(t => (
                          <span key={t} role="listitem" className="tag-muted">{t}</span>
                        ))}
                      </div>
                    )}
                  </article>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <CTASection
        title="Have a project in mind?"
        description="Let's build something amazing together. Get a free consultation today."
        primaryLabel="Start a Project"
        primaryHref="/get-quote"
        secondaryLabel="View Services"
        secondaryHref="/services"
      />

      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
};

export default PortfolioPage;
