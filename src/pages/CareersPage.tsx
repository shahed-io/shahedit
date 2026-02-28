import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { MapPin, Clock, Briefcase, Calendar } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
import type { Career } from "@/lib/supabase-types";

const CareersPage = () => {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("careers").select("*").eq("is_published", true).order("created_at", { ascending: false }).then(({ data }) => {
      setCareers(data ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">Join Our Team</span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">Career <span className="gradient-text">Opportunities</span></h1>
            <p className="text-muted-foreground max-w-xl mx-auto">Build your future with Shahed IT. We're always looking for talented people!</p>
          </motion.div>

          {loading ? (
            <div className="space-y-4 max-w-4xl mx-auto">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-card rounded-2xl animate-pulse" />)}</div>
          ) : careers.length === 0 ? (
            <div className="text-center py-20">
              <Briefcase size={48} className="text-muted mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No open positions right now. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {careers.map((job, i) => (
                <motion.div key={job.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  whileHover={{ x: 4 }} className="glossy-card rounded-2xl border border-border hover:border-primary/40 p-6 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-1">{job.title}</h3>
                      <p className="text-muted-foreground text-sm mb-3">{job.department}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin size={12} />{job.location}</span>
                        <span className="flex items-center gap-1"><Clock size={12} />{job.type}</span>
                        {job.deadline && <span className="flex items-center gap-1"><Calendar size={12} />Deadline: {new Date(job.deadline).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <a href={`mailto:info@shahedit.com?subject=Application: ${job.title}`}
                      className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20"
                    >
                      Apply Now
                    </a>
                  </div>
                  {job.description && <p className="text-muted-foreground text-sm mt-3 line-clamp-2">{job.description}</p>}
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

export default CareersPage;
