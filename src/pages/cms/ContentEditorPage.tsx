import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Eye, ArrowLeft, Clock, Image as ImageIcon, Tag, ChevronDown } from 'lucide-react';
import CmsLayout from '@/components/cms/CmsLayout';
import MediaPickerModal from '@/components/cms/MediaPickerModal';
import {
  useContentItem, useSaveContent, useLatestVersion,
  useContentVersion, useTerms, useContentTerms, useSaveContentTerms, useSeoMeta, useSaveSeoMeta
} from '@/hooks/useCms';
import { slugify } from '@/lib/cms-utils';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface Props { type: 'post' | 'page' }

export default function ContentEditorPage({ type }: Props) {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: item } = useContentItem(isNew ? undefined : id);
  const { data: latestVersion } = useLatestVersion(isNew ? undefined : id);
  const { data: versions = [] } = useContentVersion(isNew ? undefined : id);
  const { data: categories = [] } = useTerms();
  const { data: selectedTermIds = [] } = useContentTerms(isNew ? undefined : id);
  const { data: seoMeta } = useSeoMeta(isNew ? undefined : id);

  const saveContent = useSaveContent();
  const saveTerms = useSaveContentTerms();
  const saveSeo = useSaveSeoMeta();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<string>('draft');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [featuredMediaId, setFeaturedMediaId] = useState<string>('');
  const [featuredMediaUrl, setFeaturedMediaUrl] = useState<string>('');
  const [publishedAt, setPublishedAt] = useState('');
  const [termIds, setTermIds] = useState<string[]>([]);
  const [mediaPicker, setMediaPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'revisions'>('content');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [robots, setRobots] = useState('index,follow');
  const [showRevisions, setShowRevisions] = useState(false);

  // Load existing data
  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setSlug(item.slug);
      setStatus(item.status);
      setExcerpt(item.excerpt ?? '');
      setFeaturedMediaId(item.featured_media_id ?? '');
      setPublishedAt(item.published_at ?? '');
    }
  }, [item]);

  useEffect(() => {
    if (latestVersion) setBody(latestVersion.body_html ?? '');
  }, [latestVersion]);

  useEffect(() => {
    setTermIds(selectedTermIds);
  }, [selectedTermIds]);

  useEffect(() => {
    if (seoMeta) {
      setMetaTitle(seoMeta.meta_title ?? '');
      setMetaDesc(seoMeta.meta_desc ?? '');
      setRobots(seoMeta.robots ?? 'index,follow');
    }
  }, [seoMeta]);

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (isNew) setSlug(slugify(val));
  };

  const handleSave = async () => {
    if (!title.trim()) { toast({ title: 'Title is required', variant: 'destructive' }); return; }
    try {
      const contentId = await saveContent.mutateAsync({
        id: isNew ? undefined : id,
        type,
        title,
        slug: slug || slugify(title),
        status,
        excerpt: excerpt || undefined,
        featured_media_id: featuredMediaId || undefined,
        published_at: status === 'scheduled' ? publishedAt : (status === 'published' ? new Date().toISOString() : undefined),
        body_html: body,
      });

      // Save terms and SEO
      if (contentId) {
        await saveTerms.mutateAsync({ contentId: contentId as string, termIds });
        await saveSeo.mutateAsync({ content_id: contentId as string, meta_title: metaTitle || undefined, meta_desc: metaDesc || undefined, robots });
      }

      toast({ title: 'Saved successfully!' });
      if (isNew && contentId) navigate(`/cms/${type}s/${contentId}`);
    } catch (err: any) {
      toast({ title: err.message ?? 'Save failed', variant: 'destructive' });
    }
  };

  const cats = categories.filter(t => (t as any).taxonomy?.slug === 'category');
  const tags = categories.filter(t => (t as any).taxonomy?.slug === 'tag');

  const toggleTerm = (id: string) => setTermIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <CmsLayout title={isNew ? `New ${type === 'post' ? 'Post' : 'Page'}` : title || 'Edit'}>
      <MediaPickerModal
        open={mediaPicker}
        onClose={() => setMediaPicker(false)}
        onSelect={(url, id) => { setFeaturedMediaUrl(url); setFeaturedMediaId(id); }}
        selectedId={featuredMediaId}
      />

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main Editor */}
        <div className="flex-1 space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1" />
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="private">Private</option>
            </select>
            {status === 'scheduled' && (
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={e => setPublishedAt(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none"
              />
            )}
            <button
              onClick={handleSave}
              disabled={saveContent.isPending}
              className="flex items-center gap-2 px-4 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm rounded-lg transition"
            >
              <Save className="w-4 h-4" />
              {saveContent.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>

          {/* Title */}
          <input
            type="text"
            placeholder="Post title..."
            value={title}
            onChange={e => handleTitleChange(e.target.value)}
            className="w-full px-4 py-3 text-2xl font-bold bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
          />

          {/* Slug */}
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-500">Slug:</span>
            <input
              type="text"
              value={slug}
              onChange={e => setSlug(slugify(e.target.value))}
              className="flex-1 text-xs text-slate-300 bg-transparent focus:outline-none"
            />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-800 gap-4">
            {(['content', 'seo', 'revisions'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn('pb-2 text-sm capitalize border-b-2 -mb-px transition', activeTab === tab ? 'border-violet-500 text-violet-400' : 'border-transparent text-slate-500 hover:text-slate-300')}
              >
                {tab} {tab === 'revisions' && versions.length > 0 && `(${versions.length})`}
              </button>
            ))}
          </div>

          {activeTab === 'content' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              {/* Simple toolbar */}
              <div className="flex flex-wrap gap-1 p-2 border-b border-slate-800 bg-slate-800/50">
                {[['B', 'bold'],['I', 'italic'],['U', 'underline']].map(([lbl, cmd]) => (
                  <button
                    key={cmd}
                    onMouseDown={e => { e.preventDefault(); document.execCommand(cmd, false); }}
                    className="w-7 h-7 text-xs font-bold text-slate-300 hover:bg-slate-700 rounded transition"
                  >{lbl}</button>
                ))}
                <div className="w-px bg-slate-700 mx-1" />
                {[['H2', 'h2'],['H3', 'h3'],['P', 'p']].map(([lbl, tag]) => (
                  <button
                    key={tag}
                    onMouseDown={e => {
                      e.preventDefault();
                      document.execCommand('formatBlock', false, tag);
                    }}
                    className="px-2 h-7 text-xs text-slate-300 hover:bg-slate-700 rounded transition"
                  >{lbl}</button>
                ))}
                <div className="w-px bg-slate-700 mx-1" />
                <button onMouseDown={e => { e.preventDefault(); document.execCommand('insertUnorderedList', false); }} className="px-2 h-7 text-xs text-slate-300 hover:bg-slate-700 rounded transition">• List</button>
                <button onMouseDown={e => { e.preventDefault(); document.execCommand('insertOrderedList', false); }} className="px-2 h-7 text-xs text-slate-300 hover:bg-slate-700 rounded transition">1. List</button>
              </div>
              <div
                contentEditable
                suppressContentEditableWarning
                onInput={e => setBody((e.target as HTMLDivElement).innerHTML)}
                dangerouslySetInnerHTML={{ __html: body }}
                className="min-h-[400px] p-4 text-slate-200 focus:outline-none prose prose-invert max-w-none"
                style={{ lineHeight: '1.8' }}
              />
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">SEO Settings</h3>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Meta Title</label>
                <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder={title}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500" />
                <p className="text-xs text-slate-500 mt-1">{metaTitle.length}/60 chars</p>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Meta Description</label>
                <textarea value={metaDesc} onChange={e => setMetaDesc(e.target.value)} rows={3} placeholder="Brief description..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500 resize-none" />
                <p className="text-xs text-slate-500 mt-1">{metaDesc.length}/160 chars</p>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Robots</label>
                <select value={robots} onChange={e => setRobots(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none">
                  <option value="index,follow">index, follow</option>
                  <option value="noindex,follow">noindex, follow</option>
                  <option value="index,nofollow">index, nofollow</option>
                  <option value="noindex,nofollow">noindex, nofollow</option>
                </select>
              </div>
              {/* Preview */}
              <div className="bg-slate-800 rounded-lg p-4 mt-2">
                <p className="text-xs text-slate-500 mb-2">Search Preview</p>
                <p className="text-blue-400 text-sm">{metaTitle || title || 'Page Title'}</p>
                <p className="text-green-400 text-xs">yoursite.com/{slug || 'post-slug'}</p>
                <p className="text-slate-400 text-xs mt-1">{metaDesc || excerpt || 'Meta description will appear here...'}</p>
              </div>
            </div>
          )}

          {activeTab === 'revisions' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Revision History</h3>
              {versions.length === 0 ? (
                <p className="text-slate-500 text-sm">No revisions yet.</p>
              ) : (
                <div className="space-y-2">
                  {versions.map((v, idx) => (
                    <div key={v.id} className="flex items-center justify-between py-2 border-b border-slate-800/50">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <div>
                          <p className="text-sm text-white">Version {v.version_no}</p>
                          <p className="text-xs text-slate-500">{new Date(v.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      {idx === 0 && <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Current</span>}
                      {idx > 0 && (
                        <button
                          onClick={() => { setBody(v.body_html ?? ''); setActiveTab('content'); }}
                          className="text-xs text-violet-400 hover:text-violet-300"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Excerpt */}
          {activeTab === 'content' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <label className="text-xs font-medium text-slate-400 mb-2 block">Excerpt (optional)</label>
              <textarea
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                rows={2}
                placeholder="Brief summary..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500 resize-none"
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="xl:w-72 space-y-4">
          {/* Featured Image */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-white">Featured Image</span>
            </div>
            {featuredMediaUrl ? (
              <div className="relative">
                <img src={featuredMediaUrl} alt="" className="w-full aspect-video object-cover rounded-lg" />
                <button
                  onClick={() => { setFeaturedMediaUrl(''); setFeaturedMediaId(''); }}
                  className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                onClick={() => setMediaPicker(true)}
                className="w-full aspect-video bg-slate-800 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center text-slate-500 hover:border-violet-500 hover:text-violet-400 transition"
              >
                <div className="text-center">
                  <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-xs">Set Featured Image</p>
                </div>
              </button>
            )}
            {!featuredMediaUrl && featuredMediaId && (
              <button onClick={() => setMediaPicker(true)} className="w-full mt-2 text-xs text-violet-400 hover:text-violet-300">Change Image</button>
            )}
            {featuredMediaUrl && (
              <button onClick={() => setMediaPicker(true)} className="w-full mt-2 text-xs text-violet-400 hover:text-violet-300">Change Image</button>
            )}
          </div>

          {/* Categories */}
          {type === 'post' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-white">Categories</span>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {cats.map(cat => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termIds.includes(cat.id)}
                      onChange={() => toggleTerm(cat.id)}
                      className="accent-violet-600"
                    />
                    <span className="text-sm text-slate-300">{cat.name}</span>
                  </label>
                ))}
                {cats.length === 0 && <p className="text-xs text-slate-500">No categories. Create some first.</p>}
              </div>
            </div>
          )}

          {/* Tags */}
          {type === 'post' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-white">Tags</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTerm(tag.id)}
                    className={cn(
                      'px-2 py-0.5 text-xs rounded-full border transition',
                      termIds.includes(tag.id)
                        ? 'bg-violet-600/20 text-violet-400 border-violet-500/40'
                        : 'text-slate-400 border-slate-700 hover:border-slate-500'
                    )}
                  >
                    {tag.name}
                  </button>
                ))}
                {tags.length === 0 && <p className="text-xs text-slate-500">No tags. Create some first.</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </CmsLayout>
  );
}
