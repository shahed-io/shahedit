import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SEO } from "@/components/SEO";
import KineticGlassCard from "@/components/KineticGlassCard";
import type { Project } from "@/lib/supabase-types";

const PortfolioPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const categories = ["All", ...Array.from(new Set(projects.map(p => p.category).filter(Boolean)))];

  useEffect(() => {
    supabase.from("projects").select("*").eq("is_published", true).order("sort_order").then(({ data }) => {
      setProjects(data ?? []);
      setLoading(false);
    });
  }, []);

  const filtered = filter === "All" ? projects : projects.filter(p => p.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Portfolio — SHAHED IT Projects & Case Studies"
        description="Explore SHAHED IT's portfolio of websites, branding, marketing campaigns and IT projects delivered for clients across Bangladesh."
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "SHAHED IT Portfolio",
          description: "Selected projects and case studies by SHAHED IT.",
          url: "https://shahedit.com/portfolio",
          itemListElement: projects.slice(0, 20).map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: p.title,
            url: `https://shahedit.com/portfolio#${p.id}`,
          })),
        }}
      />
      <SiteHeader />
      <section
        className="relative py-24 overflow-hidden"
        style={{
          background:
            "radial-gradient(1200px 600px at 50% -10%, hsla(320,90%,55%,0.10), transparent 60%), radial-gradient(800px 500px at 90% 30%, hsla(270,92%,55%,0.08), transparent 60%)",
        }}
      >
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-14"
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[10px] font-medium tracking-[0.3em] uppercase text-[hsl(320,90%,68%)]">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "hsl(320,90%,60%)", boxShadow: "0 0 8px hsl(320,90%,60%)" }} />
              Selected Works
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mt-5 mb-4 font-syne tracking-tight">
              Portfolio &{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[hsl(320,90%,60%)] to-[hsl(270,92%,60%)]">
                Case Studies
              </span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our successful projects across various industries
            </p>
          </motion.div>

          {/* Glass filter bar */}
          <div className="flex justify-center mb-12">
            <div
              className="inline-flex gap-1.5 p-1.5 rounded-full border border-white/10 backdrop-blur-xl"
              style={{ background: "rgba(20,8,40,0.55)" }}
            >
              {categories.map(c => {
                const active = filter === c;
                return (
                  <motion.button
                    key={c}
                    onClick={() => setFilter(c)}
                    whileTap={{ scale: 0.96 }}
                    className={`relative px-5 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                      active ? "text-white" : "text-white/60 hover:text-white"
                    }`}
                    style={
                      active
                        ? {
                            background:
                              "linear-gradient(135deg, hsl(320,90%,55%), hsl(270,92%,55%))",
                            boxShadow:
                              "0 10px 30px -10px hsla(320,90%,55%,0.55)",
                          }
                        : undefined
                    }
                  >
                    {c}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[16/11] rounded-3xl animate-pulse"
                  style={{
                    background: "rgba(168,85,247,0.06)",
                    border: "1px solid rgba(168,85,247,0.12)",
                  }}
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No projects yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filtered.map((project, i) => (
                <KineticGlassCard
                  key={project.id}
                  href={project.project_url ?? `/portfolio`}
                  target={project.project_url ? "_blank" : undefined}
                  rel={project.project_url ? "noopener noreferrer" : undefined}
                  image={project.image_url}
                  badge={project.category}
                  eyebrow="Featured Work"
                  title={project.title}
                  subtitle={project.short_description ?? undefined}
                  index={i}
                  meta={
                    project.tech_stack && project.tech_stack.length > 0 ? (
                      <div className="flex gap-1.5 flex-wrap">
                        {project.tech_stack.slice(0, 4).map(t => (
                          <span
                            key={t}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/80"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : null
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
};

export default PortfolioPage;
