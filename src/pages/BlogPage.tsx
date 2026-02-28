import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
import type { BlogPost } from "@/lib/supabase-types";

const BlogPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("blog_posts").select("*").eq("is_published", true).order("published_at", { ascending: false }).then(({ data }) => {
      setPosts(data ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">Knowledge Hub</span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">Tech <span className="gradient-text">Blog</span></h1>
            <p className="text-muted-foreground max-w-xl mx-auto">Insights, tutorials and industry news from our expert team</p>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{[...Array(6)].map((_, i) => <div key={i} className="h-72 bg-card rounded-2xl animate-pulse" />)}</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20"><p className="text-muted-foreground text-lg">Blog posts coming soon...</p></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <motion.article key={post.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -6 }} className="glossy-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
                    {post.featured_image
                      ? <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center text-5xl">📝</div>
                    }
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      {post.published_at && <span className="flex items-center gap-1"><Calendar size={12} />{new Date(post.published_at).toLocaleDateString()}</span>}
                      {post.read_time_minutes && <span className="flex items-center gap-1"><Clock size={12} />{post.read_time_minutes} min read</span>}
                    </div>
                    <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-3">{post.excerpt}</p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mt-3">
                        {post.tags.slice(0, 3).map(t => <span key={t} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">#{t}</span>)}
                      </div>
                    )}
                  </div>
                </motion.article>
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

export default BlogPage;
