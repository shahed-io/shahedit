import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
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
      <SiteHeader />
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">Our Work</span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">Portfolio & <span className="gradient-text">Projects</span></h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">Explore our successful projects across various industries</p>
          </motion.div>

          <div className="flex gap-2 justify-center flex-wrap mb-10">
            {categories.map(c => (
              <button key={c} onClick={() => setFilter(c)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${filter === c ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
              >{c}</button>
            ))}
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-card rounded-2xl animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20"><p className="text-muted-foreground">No projects yet. Check back soon!</p></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((project, i) => (
                <motion.div key={project.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
                  whileHover={{ y: -8 }} className="group glossy-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-2xl transition-all duration-400"
                >
                  <div className="relative overflow-hidden h-48 bg-gradient-to-br from-primary/10 to-accent/10">
                    {project.image_url ? (
                      <img src={project.image_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">🖥️</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      {project.project_url && <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="text-white text-sm bg-white/20 backdrop-blur px-3 py-1.5 rounded-full hover:bg-white/30">View Live →</a>}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{project.title}</h3>
                      {project.category && <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full">{project.category}</span>}
                    </div>
                    <p className="text-muted-foreground text-sm">{project.short_description}</p>
                    {project.tech_stack && project.tech_stack.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mt-3">
                        {project.tech_stack.slice(0, 4).map(t => <span key={t} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">{t}</span>)}
                      </div>
                    )}
                  </div>
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

export default PortfolioPage;
