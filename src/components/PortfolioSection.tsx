import { motion } from "framer-motion";
import { ExternalLink, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Project } from "@/lib/supabase-types";

const PortfolioSection = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .order("sort_order")
      .limit(6)
      .then(({ data }) => {
        setProjects(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <section id="portfolio" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 tech-grid-bg opacity-35 pointer-events-none" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(270,92%,65%) 0%, transparent 65%)', opacity: 0.07 }} />
      <div className="absolute right-0 bottom-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(320,90%,48%) 0%, transparent 65%)', opacity: 0.07 }} />

      <div className="container mx-auto px-4 relative">
        <div className="flex items-end justify-between mb-16">
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4"
              style={{ background: 'rgba(315,80%,65%,0.10)', border: '1px solid rgba(236,72,153,0.25)', color: 'hsl(315,80%,70%)' }}
            >
              ◈ Our Work
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-black text-foreground mt-2">
              Recent <span className="gradient-text-pink">Projects</span>
            </h2>
            <div className="mt-4 w-20 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(315,80%,65%), hsl(270,92%,65%))' }} />
          </motion.div>
          <motion.a
            href="/portfolio"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden md:flex items-center gap-2 text-sm font-semibold transition-all duration-300 group px-5 py-2.5 rounded-xl"
            style={{ background: 'rgba(168,85,247,0.10)', border: '1px solid rgba(168,85,247,0.22)', color: 'hsl(270,92%,75%)' }}
          >
            View All Projects <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl animate-pulse"
                style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.12)' }} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-foreground/40">কোনো প্রজেক্ট নেই। Admin থেকে যোগ করুন।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {projects.map((project, i) => (
              <motion.a
                key={project.id}
                href={project.project_url ?? "/portfolio"}
                target={project.project_url ? "_blank" : undefined}
                rel={project.project_url ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.09, type: "spring", stiffness: 120 }}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.97, y: 0, transition: { duration: 0.12 } }}
                className="group relative block aspect-[16/11] overflow-hidden rounded-3xl cursor-pointer border border-white/[0.06] hover:border-[hsl(320,90%,60%)]/40 transition-all duration-700"
                style={{
                  background: 'linear-gradient(180deg, #1a0b2e 0%, #0f0620 100%)',
                  boxShadow: '0 24px 60px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
                }}
              >
                {/* Background image */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  {project.image_url ? (
                    <motion.img
                      src={project.image_url}
                      alt={project.title}
                      className="h-full w-full object-cover"
                      whileHover={{ scale: 1.1, rotate: 1 }}
                      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-6xl bg-gradient-to-br from-primary/15 to-accent/15">🖥️</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0212] via-[#0a0212]/40 to-transparent opacity-90 group-hover:opacity-75 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[hsl(320,90%,55%)]/12 via-transparent to-transparent mix-blend-overlay" />
                </div>

                {/* Top glass badge */}
                {project.category && (
                  <div className="absolute top-5 left-5 z-10">
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 shadow-lg group-hover:bg-[hsl(320,90%,55%)]/20 group-hover:border-[hsl(320,90%,60%)]/40 transition-all duration-500">
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ background: 'hsl(320,90%,60%)', boxShadow: '0 0 8px hsl(320,90%,60%)' }}
                      />
                      <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/90">
                        {project.category}
                      </span>
                    </div>
                  </div>
                )}

                {/* Bottom kinetic content */}
                <div className="absolute inset-x-0 bottom-0 z-10 p-6 md:p-7">
                  <div className="flex flex-col gap-1.5 transform transition-transform duration-700 group-hover:-translate-y-1">
                    <span className="text-[10px] font-medium tracking-[0.35em] uppercase opacity-80" style={{ color: 'hsl(320,90%,68%)' }}>
                      Featured Work
                    </span>
                    <div className="flex justify-between items-end gap-4">
                      <h3 className="text-2xl md:text-[26px] font-extrabold leading-tight tracking-tight font-syne">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/55">
                          {project.title}
                        </span>
                      </h3>
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: -6 }}
                        transition={{ type: 'spring', stiffness: 280 }}
                        className="relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl shrink-0 text-white"
                        style={{
                          background: 'hsl(320,90%,55%)',
                          boxShadow: '0 10px 40px -10px hsla(320,90%,55%,0.55)',
                        }}
                      >
                        <ArrowRight size={20} className="transition-transform duration-500 group-hover:translate-x-0.5" />
                        <div className="absolute inset-1 border border-white/20 rounded-xl pointer-events-none" />
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Bottom reveal edge */}
                <div
                  className="absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-700 z-10"
                  style={{ background: 'linear-gradient(90deg, hsl(320,90%,55%), hsl(270,92%,55%))' }}
                />
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PortfolioSection;
