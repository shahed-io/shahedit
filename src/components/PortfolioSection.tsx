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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                whileHover={{ y: -8 }}
                className="group relative rounded-3xl cursor-pointer"
                style={{ padding: '1px', background: 'linear-gradient(135deg, rgba(168,85,247,0.50), rgba(236,72,153,0.32) 50%, rgba(99,102,241,0.40))' }}
              >
                <div
                  className="relative rounded-[calc(1.5rem-1px)] overflow-hidden h-full"
                  style={{
                    background: 'linear-gradient(180deg, rgba(20,12,40,0.92), rgba(12,6,28,0.96))',
                    boxShadow: '0 18px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)',
                  }}
                >
                  <div className="aspect-[4/3] overflow-hidden relative bg-gradient-to-br from-primary/10 to-accent/10">
                    {project.image_url ? (
                      <motion.img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.10 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">🖥️</div>
                    )}

                    {/* Persistent legibility gradient */}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
                      style={{ background: 'linear-gradient(to top, rgba(8,4,20,0.95) 0%, rgba(8,4,20,0.55) 45%, transparent 100%)' }} />

                    {/* Hover sheen sweep */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ background: 'linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.12) 50%, transparent 65%)' }} />

                    {/* Category chip */}
                    {project.category && (
                      <div className="absolute top-3.5 left-3.5 px-3 py-1.5 text-[11px] font-bold rounded-full inline-flex items-center gap-1.5"
                        style={{
                          background: 'linear-gradient(135deg, rgba(168,85,247,0.28), rgba(236,72,153,0.22))',
                          border: '1px solid rgba(168,85,247,0.50)',
                          color: '#f0d4ff',
                          backdropFilter: 'blur(14px)',
                          WebkitBackdropFilter: 'blur(14px)',
                          boxShadow: '0 4px 14px rgba(124,58,237,0.30)',
                        }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', boxShadow: '0 0 8px rgba(236,72,153,0.8)' }} />
                        {project.category}
                      </div>
                    )}

                    {/* Title overlay (always visible) */}
                    <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-[0.18em] font-semibold mb-1" style={{ color: 'rgba(240,212,255,0.6)' }}>
                          Featured Work
                        </p>
                        <h3 className="text-white font-bold text-base leading-snug truncate">
                          {project.title}
                        </h3>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.15, rotate: 45 }}
                        transition={{ type: 'spring', stiffness: 280 }}
                        className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, hsl(270,92%,65%), hsl(320,90%,55%))',
                          boxShadow: '0 8px 22px rgba(168,85,247,0.55), inset 0 1px 0 rgba(255,255,255,0.25)',
                        }}
                      >
                        <ArrowRight size={16} className="text-white" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Outer hover glow */}
                  <div className="absolute -inset-px rounded-[calc(1.5rem-1px)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ boxShadow: '0 30px 80px -20px rgba(168,85,247,0.55)' }} />
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PortfolioSection;
