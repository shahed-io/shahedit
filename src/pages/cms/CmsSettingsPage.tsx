import { useState, useEffect } from 'react';
import { Save, Palette } from 'lucide-react';
import CmsLayout from '@/components/cms/CmsLayout';
import { useCmsSiteSettings, useSaveCmsSiteSettings } from '@/hooks/useCms';
import { useToast } from '@/components/ui/use-toast';

export default function CmsSettingsPage() {
  const { data: settings } = useCmsSiteSettings();
  const saveSettings = useSaveCmsSiteSettings();
  const { toast } = useToast();

  const [siteTitle, setSiteTitle] = useState('');
  const [siteTagline, setSiteTagline] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');

  useEffect(() => {
    if (settings) {
      setSiteTitle(settings.site_title ?? '');
      setSiteTagline(settings.site_tagline ?? '');
      setPrimaryColor(settings.primary_color ?? '#6366f1');
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await saveSettings.mutateAsync({ site_title: siteTitle, site_tagline: siteTagline, primary_color: primaryColor });
      toast({ title: 'Settings saved!' });
    } catch { toast({ title: 'Save failed', variant: 'destructive' }); }
  };

  return (
    <CmsLayout title="Site Settings">
      <div className="max-w-2xl space-y-6">
        {/* General Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <h2 className="text-base font-semibold text-white">General Settings</h2>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Site Title</label>
            <input value={siteTitle} onChange={e => setSiteTitle(e.target.value)} placeholder="My Website"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Site Tagline</label>
            <input value={siteTagline} onChange={e => setSiteTagline(e.target.value)} placeholder="Just another website"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block flex items-center gap-2">
              <Palette className="w-3.5 h-3.5" /> Primary Color
            </label>
            <div className="flex items-center gap-3">
              <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-slate-700 bg-slate-800 cursor-pointer" />
              <input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500" />
            </div>
          </div>
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={saveSettings.isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition">
          <Save className="w-4 h-4" />
          {saveSettings.isPending ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </CmsLayout>
  );
}
