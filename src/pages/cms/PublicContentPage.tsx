import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';


function usePublicContent(type: string, slug: string) {
  return useQuery({
    queryKey: ['public_content', type, slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('type', type)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      if (error) throw error;
      return data;
    },
  });
}

function useContentSeo(contentId?: string) {
  return useQuery({
    queryKey: ['public_seo', contentId],
    enabled: !!contentId,
    queryFn: async () => {
      const { data } = await supabase.from('seo_meta').select('*').eq('content_id', contentId!).maybeSingle();
      return data;
    },
  });
}

function useLatestBodyHtml(contentId?: string) {
  return useQuery({
    queryKey: ['public_body', contentId],
    enabled: !!contentId,
    queryFn: async () => {
      const { data } = await supabase
        .from('content_versions')
        .select('body_html')
        .eq('content_id', contentId!)
        .order('version_no', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data?.body_html ?? '';
    },
  });
}

interface Props { type: 'post' | 'page' }

export default function PublicContentPage({ type }: Props) {
  const { slug } = useParams<{ slug: string }>();
  const { data: content, isLoading, error } = usePublicContent(type, slug ?? '');
  const { data: seo } = useContentSeo(content?.id);
  const { data: bodyHtml = '' } = useLatestBodyHtml(content?.id);

  if (isLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !content) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl mb-4">404</p>
        <p className="text-slate-400 mb-6">Content not found</p>
        <Link to="/" className="text-violet-400 hover:underline">← Back to Home</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 py-16">
        {type === 'post' && (
          <Link to="/blog" className="flex items-center gap-2 text-sm text-slate-400 hover:text-violet-400 mb-8 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        )}

        <article>
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">{content.title}</h1>
            {content.excerpt && <p className="text-lg text-slate-400 mb-4">{content.excerpt}</p>}
            {type === 'post' && (
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Calendar className="w-4 h-4" />
                <span>{new Date(content.published_at ?? content.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            )}
          </header>

          <div
            className="prose prose-invert prose-violet max-w-none text-slate-300"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
