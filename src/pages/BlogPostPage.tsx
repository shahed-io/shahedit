import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, Tag, Share2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SEO } from "@/components/SEO";
import { sanitizeHtml } from "@/lib/sanitize";
import { toast } from "sonner";
import type { BlogPost } from "@/lib/supabase-types";

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (!data) { setNotFound(true); setLoading(false); return; }
      setPost(data as BlogPost);

      const { data: rel } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .neq("id", (data as BlogPost).id)
        .order("published_at", { ascending: false })
        .limit(3);
      setRelated((rel ?? []) as BlogPost[]);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    })();
  }, [slug]);

  if (notFound) return <Navigate to="/blog" replace />;

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: post?.title, url }); } catch { /* user cancelled */ }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("লিংক কপি হয়েছে!");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {post && (
        <SEO
          title={post.meta_title || `${post.title} — Shahed IT Blog`}
          description={(post.meta_description || post.excerpt || "").slice(0, 160)}
          image={post.og_image || post.featured_image || undefined}
          type="article"
          schema={{
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            image: post.featured_image,
            datePublished: post.published_at,
            author: { "@type": "Organization", name: "Shahed IT" },
            publisher: { "@type": "Organization", name: "Shahed IT" },
          }}
        />
      )}
      <SiteHeader />

      <article className="pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-foreground/55 hover:text-foreground mb-6">
            <ArrowLeft size={14} /> সব ব্লগ
          </Link>

          {loading || !post ? (
            <div className="space-y-4">
              <div className="h-8 bg-white/5 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-white/5 rounded animate-pulse w-1/2" />
              <div className="h-72 bg-white/5 rounded-2xl animate-pulse mt-6" />
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.slice(0, 4).map(t => (
                    <span key={t} className="text-[11px] font-bold uppercase tracking-wider bg-primary/15 text-primary px-2.5 py-1 rounded-full">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-3xl md:text-5xl font-black text-foreground leading-tight mb-4">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/55 mb-8">
                {post.published_at && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {new Date(post.published_at).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                )}
                {post.read_time_minutes && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} /> {post.read_time_minutes} মিনিট পড়ার সময়
                  </span>
                )}
                <button onClick={share} className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs font-semibold">
                  <Share2 size={13} /> শেয়ার করুন
                </button>
              </div>

              {post.featured_image && (
                <div className="rounded-2xl overflow-hidden mb-8 border border-white/10">
                  <img src={post.featured_image} alt={post.title} loading="lazy" decoding="async" className="w-full h-auto object-cover" />
                </div>
              )}

              {post.excerpt && (
                <p className="text-lg text-foreground/75 leading-relaxed mb-6 italic border-l-4 border-primary/40 pl-4">
                  {post.excerpt}
                </p>
              )}

              {post.content && (
                <div
                  className="prose prose-invert prose-lg max-w-none prose-headings:font-black prose-headings:text-foreground prose-a:text-primary prose-strong:text-foreground prose-li:text-foreground/80 prose-p:text-foreground/80 prose-p:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
                />
              )}
            </motion.div>
          )}

          {related.length > 0 && (
            <div className="mt-16 pt-10 border-t border-white/10">
              <h2 className="text-2xl font-black text-foreground mb-6 flex items-center gap-2">
                <Tag size={20} className="text-primary" /> আরও পড়ুন
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {related.map(r => (
                  <Link key={r.id} to={`/blog/${r.slug}`} className="group rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:border-primary/40 transition-all">
                    <div className="h-32 bg-gradient-to-br from-primary/15 to-accent/10 overflow-hidden">
                      {r.featured_image
                        ? <img src={r.featured_image} alt={r.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        : <div className="w-full h-full flex items-center justify-center text-4xl">📝</div>}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-sm text-foreground line-clamp-2 group-hover:text-primary">{r.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      <SiteFooter />
    </div>
  );
};

export default BlogPostPage;
