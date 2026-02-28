import { useState } from 'react';
import { Plus, Trash2, Edit, Check, X } from 'lucide-react';
import CmsLayout from '@/components/cms/CmsLayout';
import { useTerms, useTaxonomies, useSaveTerm, useDeleteTerm } from '@/hooks/useCms';
import { slugify, timeAgo } from '@/lib/cms-utils';
import { useToast } from '@/components/ui/use-toast';

interface Props { taxonomySlug: 'category' | 'tag' }

export default function TaxonomyPage({ taxonomySlug }: Props) {
  const { data: taxonomies = [] } = useTaxonomies();
  const tax = taxonomies.find(t => t.slug === taxonomySlug);
  const { data: terms = [], isLoading } = useTerms(tax?.id);
  const saveTerm = useSaveTerm();
  const deleteTerm = useDeleteTerm();
  const { toast } = useToast();

  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [showForm, setShowForm] = useState(false);

  const label = taxonomySlug === 'category' ? 'Categories' : 'Tags';

  const handleSave = async () => {
    if (!name.trim() || !tax) return;
    try {
      await saveTerm.mutateAsync({ id: editId ?? undefined, taxonomy_id: tax.id, name, slug: slug || slugify(name) });
      toast({ title: 'Saved!' });
      setName(''); setSlug(''); setEditId(null); setShowForm(false);
    } catch (err: any) {
      toast({ title: err.message ?? 'Save failed', variant: 'destructive' });
    }
  };

  const handleEdit = (t: any) => { setEditId(t.id); setName(t.name); setSlug(t.slug); setShowForm(true); };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    try { await deleteTerm.mutateAsync(id); toast({ title: 'Deleted' }); }
    catch { toast({ title: 'Delete failed', variant: 'destructive' }); }
  };

  const myTerms = terms.filter(t => (t as any).taxonomy?.slug === taxonomySlug);

  return (
    <CmsLayout title={label}>
      <div className="grid md:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-fit">
          <h2 className="text-sm font-semibold text-white mb-4">{editId ? `Edit ${taxonomySlug}` : `Add New ${taxonomySlug}`}</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Name</label>
              <input value={name} onChange={e => { setName(e.target.value); if (!editId) setSlug(slugify(e.target.value)); }}
                placeholder={`${label} name`}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Slug</label>
              <input value={slug} onChange={e => setSlug(slugify(e.target.value))} placeholder="auto-generated"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saveTerm.isPending}
                className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm rounded-lg transition">
                {editId ? 'Update' : 'Add'}
              </button>
              {editId && (
                <button onClick={() => { setEditId(null); setName(''); setSlug(''); }}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="p-4 border-b border-slate-800">
            <p className="text-sm text-slate-400">{myTerms.length} {label.toLowerCase()}</p>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : myTerms.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No {label.toLowerCase()} yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-3 px-4 text-slate-500 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium hidden sm:table-cell">Slug</th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium hidden md:table-cell">Created</th>
                  <th className="text-right py-3 px-4 text-slate-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myTerms.map(term => (
                  <tr key={term.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 text-white font-medium">{term.name}</td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <code className="text-xs text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">{term.slug}</code>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-slate-500 text-xs">{timeAgo(term.created_at)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(term)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-violet-400 transition">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(term.id)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </CmsLayout>
  );
}
