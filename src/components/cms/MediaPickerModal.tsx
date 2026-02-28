import { useRef } from 'react';
import { X, Upload, Check } from 'lucide-react';
import { useMediaAssets, useUploadMedia } from '@/hooks/useCms';
import { formatBytes } from '@/lib/cms-utils';
import { useToast } from '@/components/ui/use-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string, id: string) => void;
  selectedId?: string;
}

export default function MediaPickerModal({ open, onClose, onSelect, selectedId }: Props) {
  const { data: assets = [] } = useMediaAssets();
  const upload = useUploadMedia();
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  if (!open) return null;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await upload.mutateAsync(file);
      toast({ title: 'Uploaded successfully' });
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' });
    }
  };

  const images = assets.filter(a => a.file_type?.startsWith('image'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">Media Library</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg transition"
            >
              <Upload className="w-4 h-4" /> Upload
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleUpload} />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {images.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No images yet. Upload one above.</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map(asset => (
                <button
                  key={asset.id}
                  onClick={() => { onSelect(asset.file_url, asset.id); onClose(); }}
                  className={`relative rounded-lg overflow-hidden aspect-square border-2 transition ${
                    selectedId === asset.id ? 'border-violet-500' : 'border-transparent hover:border-slate-600'
                  }`}
                >
                  <img src={asset.file_url} alt={asset.alt_text ?? ''} className="w-full h-full object-cover" />
                  {selectedId === asset.id && (
                    <div className="absolute inset-0 bg-violet-600/30 flex items-center justify-center">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                    <p className="text-[10px] text-white truncate">{asset.title}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
