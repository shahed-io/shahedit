import { useState, useRef } from 'react';
import { Upload, Search, Trash2, Image as ImageIcon, Film, X } from 'lucide-react';
import CmsLayout from '@/components/cms/CmsLayout';
import { useMediaAssets, useUploadMedia, useDeleteMedia } from '@/hooks/useCms';
import { formatBytes, timeAgo } from '@/lib/cms-utils';
import { useToast } from '@/components/ui/use-toast';

export default function MediaLibraryPage() {
  const { data: assets = [], isLoading } = useMediaAssets();
  const upload = useUploadMedia();
  const deleteMedia = useDeleteMedia();
  const fileRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const { toast } = useToast();

  const filtered = assets.filter(a =>
    !search || (a.title ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const handleUpload = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      try {
        await upload.mutateAsync(file);
      } catch {
        toast({ title: `Failed to upload ${file.name}`, variant: 'destructive' });
      }
    }
    toast({ title: 'Upload complete!' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this media file?')) return;
    try {
      await deleteMedia.mutateAsync(id);
      setSelected(null);
      toast({ title: 'Deleted' });
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const selectedAsset = selected ? assets.find(a => a.id === selected) : null;
  const isImage = (type: string) => type?.startsWith('image');

  return (
    <CmsLayout title="Media Library">
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Main */}
        <div className="flex-1 space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" placeholder="Search media..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500" />
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={upload.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm rounded-lg transition"
            >
              <Upload className="w-4 h-4" />
              {upload.isPending ? 'Uploading...' : 'Upload'}
            </button>
            <input ref={fileRef} type="file" multiple accept="image/*,video/*,application/pdf" className="hidden" onChange={e => handleUpload(e.target.files)} />
          </div>

          {/* Drop zone */}
          <div
            onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
            onDragOver={e => e.preventDefault()}
            className="border-2 border-dashed border-slate-700 hover:border-violet-500 rounded-xl p-6 text-center transition cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Drop files here or <span className="text-violet-400">browse</span></p>
            <p className="text-xs text-slate-600 mt-1">Images, Videos, PDFs supported</p>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No media files yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filtered.map(asset => (
                <button
                  key={asset.id}
                  onClick={() => setSelected(selected === asset.id ? null : asset.id)}
                  className={`relative rounded-xl overflow-hidden aspect-square border-2 transition group ${
                    selected === asset.id ? 'border-violet-500' : 'border-transparent hover:border-slate-600'
                  }`}
                >
                  {isImage(asset.file_type) ? (
                    <img src={asset.file_url} alt={asset.alt_text ?? ''} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                      <Film className="w-8 h-8 text-slate-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <p className="text-xs text-white text-center px-2 truncate">{asset.title}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Panel */}
        {selectedAsset && (
          <div className="lg:w-72 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shrink-0 h-fit">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">File Details</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            {isImage(selectedAsset.file_type) && (
              <img src={selectedAsset.file_url} alt="" className="w-full rounded-lg" />
            )}
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-slate-500 text-xs">Filename</p>
                <p className="text-slate-200 truncate">{selectedAsset.title}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Type</p>
                <p className="text-slate-200">{selectedAsset.file_type}</p>
              </div>
              {selectedAsset.file_size && (
                <div>
                  <p className="text-slate-500 text-xs">Size</p>
                  <p className="text-slate-200">{formatBytes(selectedAsset.file_size)}</p>
                </div>
              )}
              {selectedAsset.width && (
                <div>
                  <p className="text-slate-500 text-xs">Dimensions</p>
                  <p className="text-slate-200">{selectedAsset.width} × {selectedAsset.height}</p>
                </div>
              )}
              <div>
                <p className="text-slate-500 text-xs">Uploaded</p>
                <p className="text-slate-200">{timeAgo(selectedAsset.created_at)}</p>
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">URL</p>
              <div className="flex gap-2">
                <input readOnly value={selectedAsset.file_url} className="flex-1 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 truncate focus:outline-none" />
                <button onClick={() => navigator.clipboard.writeText(selectedAsset.file_url)}
                  className="px-2 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded transition">
                  Copy
                </button>
              </div>
            </div>
            <button
              onClick={() => handleDelete(selectedAsset.id)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg text-sm transition"
            >
              <Trash2 className="w-4 h-4" /> Delete File
            </button>
          </div>
        )}
      </div>
    </CmsLayout>
  );
}
