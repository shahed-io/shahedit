import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';

function usePublishedPosts() {
  return useQuery({
    queryKey: ['public_posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('type', 'post')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export default function CmsBlogPage() {
  const { data: posts = [], isLoading } = usePublishedPosts();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Blog</h1>
          <p className="text-slate-400">Latest articles and insights</p>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-slate-500">No published posts yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <Link key={post.id} to={`/post/${post.slug}`} className="group bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden hover:border-violet-500/50 transition-all hover:-translate-y-1">
                <div className="p-5">
                  <h2 className="text-lg font-semibold text-white group-hover:text-violet-400 transition line-clamp-2 mb-2">
                    {post.title}
                  </h2>
                  {post.excerpt && <p className="text-slate-400 text-sm line-clamp-3 mb-4">{post.excerpt}</p>}
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(post.published_at ?? post.created_at).toLocaleDateString()}
                    <span className="flex-1" />
                    <span className="flex items-center gap-1 text-violet-400">Read <ArrowRight className="w-3 h-3" /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
