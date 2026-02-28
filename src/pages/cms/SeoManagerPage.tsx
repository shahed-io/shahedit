import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import CmsLayout from '@/components/cms/CmsLayout';
import { useContentItems, useSeoMeta, useSaveSeoMeta } from '@/hooks/useCms';
import { useToast } from '@/components/ui/use-toast';

export default function SeoManagerPage() {
  const { data: items = [] } = useContentItems();
  const [selectedId, setSelectedId] = useState<string>('');
  const [search, setSearch] = useState('');

  const filtered = items.filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()));
  const selected = items.find(i => i.id === selectedId);

  return (
    <CmsLayout title="SEO Manager">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Content List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl">
          <div className="p-4 border-b border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" placeholder="Search content..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500" />
            </div>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            {filtered.map(item => (
              <button key={item.id} onClick={() => setSelectedId(item.id)}
                className={`w-full text-left p-3 border-b border-slate-800/50 hover:bg-slate-800/50 transition ${selectedId === item.id ? 'bg-slate-800/70 border-l-2 border-l-violet-500' : ''}`}>
                <p className="text-sm text-white font-medium truncate">{item.title}</p>
                <p className="text-xs text-slate-500 capitalize">{item.type} · {item.status}</p>
              </button>
            ))}
          </div>
        </div>

        {/* SEO Form */}
        <div className="md:col-span-2">
          {selected ? (
            <SeoForm contentId={selected.id} title={selected.title} slug={selected.slug} />
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center h-64">
              <p className="text-slate-500 text-sm">Select a content item to edit SEO</p>
            </div>
          )}
        </div>
      </div>
    </CmsLayout>
  );
}

function SeoForm({ contentId, title, slug }: { contentId: string; title: string; slug: string }) {
  const { data: seo } = useSeoMeta(contentId);
  const saveSeo = useSaveSeoMeta();
  const { toast } = useToast();

  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [canonical, setCanonical] = useState('');
  const [robots, setRobots] = useState('index,follow');

  useEffect(() => {
    if (seo) {
      setMetaTitle(seo.meta_title ?? '');
      setMetaDesc(seo.meta_desc ?? '');
      setCanonical(seo.canonical_url ?? '');
      setRobots(seo.robots ?? 'index,follow');
    } else {
      setMetaTitle(''); setMetaDesc(''); setCanonical(''); setRobots('index,follow');
    }
  }, [seo, contentId]);

  const handleSave = async () => {
    try {
      await saveSeo.mutateAsync({ content_id: contentId, meta_title: metaTitle || undefined, meta_desc: metaDesc || undefined, canonical_url: canonical || undefined, robots });
      toast({ title: 'SEO saved!' });
    } catch { toast({ title: 'Save failed', variant: 'destructive' }); }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <code className="text-xs text-slate-500">/{slug}</code>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Meta Title <span className="text-slate-600">({metaTitle.length}/60)</span></label>
          <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder={title}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500" />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Meta Description <span className="text-slate-600">({metaDesc.length}/160)</span></label>
          <textarea value={metaDesc} onChange={e => setMetaDesc(e.target.value)} rows={3} placeholder="Describe this page..."
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500 resize-none" />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Canonical URL</label>
          <input value={canonical} onChange={e => setCanonical(e.target.value)} placeholder={`https://yoursite.com/${slug}`}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500" />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Robots</label>
          <select value={robots} onChange={e => setRobots(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none">
            <option value="index,follow">index, follow</option>
            <option value="noindex,follow">noindex, follow</option>
            <option value="noindex,nofollow">noindex, nofollow</option>
          </select>
        </div>

        {/* SERP Preview */}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-slate-500 mb-3 font-medium">SERP Preview</p>
          <p className="text-blue-400 text-base hover:underline cursor-pointer">{metaTitle || title}</p>
          <p className="text-green-400 text-xs mt-0.5">yoursite.com › {slug}</p>
          <p className="text-slate-400 text-sm mt-1 leading-relaxed">{metaDesc || 'No description set. Add a meta description to improve your SEO.'}</p>
        </div>

        <button onClick={handleSave} disabled={saveSeo.isPending}
          className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition">
          {saveSeo.isPending ? 'Saving...' : 'Save SEO Settings'}
        </button>
      </div>
    </div>
  );
}
