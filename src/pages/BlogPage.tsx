import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
import { SectionHeader } from "@/components/ui/section-components";
import { GridSkeleton } from "@/components/ui/skeleton-loaders";
import type { BlogPost } from "@/lib/supabase-types";

const BlogPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("blog_posts").select("*").eq("is_published", true).order("published_at", { ascending: false })
      .then(({ data }) => { setPosts(data ?? []); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="section-py hero-gradient relative overflow-hidden" aria-labelledby="blog-heading">
        <div className="absolute inset-0 subtle-grid opacity-40" aria-hidden="true" />
        <div className="container mx-auto px-4 relative text-center">
          <SectionHeader
            label="Knowledge Hub"
            title={<>Tech <span className="gradient-text">Blog</span></>}
            description="Insights, tutorials and industry news from our expert team."
          />
        </div>
      </section>

      <section className="section-py" aria-label="Blog posts">
        <div className="container mx-auto px-4">
          {loading ? (
            <GridSkeleton count={6} />
          ) : posts.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-4xl mb-4" aria-hidden="true">📝</p>
              <p className="text-muted-foreground text-lg">Blog posts coming soon...</p>
            </div>
          ) : (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
              {posts.map((post, i) => (
                <motion.li
                  key={post.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  <article className="tech-card overflow-hidden group h-full flex flex-col" aria-labelledby={`post-${post.id}`}>
                    <div className="relative overflow-hidden rounded-lg h-44 bg-secondary mb-4 flex-shrink-0">
                      {post.featured_image ? (
                        <img
                          src={post.featured_image}
                          alt={`Featured image for ${post.title}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-5xl"
                          style={{ background: "linear-gradient(135deg, hsl(var(--primary-light)), hsl(var(--accent-light)))" }}
                          aria-hidden="true"
                        >📝</div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2.5">
                      {post.published_at && (
                        <time dateTime={post.published_at} className="flex items-center gap-1">
                          <Calendar size={11} aria-hidden="true" />
                          {new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </time>
                      )}
                      {post.read_time_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} aria-hidden="true" />
                          {post.read_time_minutes} min read
                        </span>
                      )}
                    </div>
                    <h3 id={`post-${post.id}`} className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2 flex-1">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mt-3" role="list" aria-label="Post tags">
                        {post.tags.slice(0, 3).map(t => (
                          <span key={t} role="listitem" className="tag-muted">#{t}</span>
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

      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
};

export default BlogPage;
