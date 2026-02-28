import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import CmsLayout from '@/components/cms/CmsLayout';
import ContentTable from '@/components/cms/ContentTable';
import { useContentItems, useDeleteContent } from '@/hooks/useCms';
import { useToast } from '@/components/ui/use-toast';

interface Props { type: 'post' | 'page' }

export default function ContentListPage({ type }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { data: items = [], isLoading } = useContentItems(type);
  const deleteContent = useDeleteContent();
  const { toast } = useToast();

  const label = type === 'post' ? 'Posts' : 'Pages';

  const filtered = items.filter(i => {
    const matchSearch = !search || i.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteContent.mutateAsync(id);
      toast({ title: 'Deleted successfully' });
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  return (
    <CmsLayout title={label}>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder={`Search ${label.toLowerCase()}...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="pl-9 pr-8 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500 appearance-none"
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
          <Link
            to={`/cms/${type}s/new`}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg transition shrink-0"
          >
            <Plus className="w-4 h-4" /> Add {type === 'post' ? 'Post' : 'Page'}
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <p className="text-sm text-slate-400">{filtered.length} {label.toLowerCase()}</p>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ContentTable rows={filtered} type={type} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </CmsLayout>
  );
}
