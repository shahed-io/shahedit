import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ClickEffectConfig {
  enabled: boolean;
  type: 'logo' | 'custom_sticker' | 'apple' | 'ripple';
  customStickerUrl?: string;
  opacity: number;
  scale: number;
}

const DEFAULT_CONFIG: ClickEffectConfig = {
  enabled: true,
  type: 'logo',
  opacity: 0.25,
  scale: 1.2
};

export function useClickEffectSettings() {
  const [config, setConfig] = useState<ClickEffectConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'click_effect_config')
          .maybeSingle();

        if (data?.value) {
          try {
            const parsed = JSON.parse(data.value);
            setConfig({ ...DEFAULT_CONFIG, ...parsed });
          } catch (e) {
            console.error('Error parsing click effect config', e);
          }
        }
      } catch (err) {
        console.error('Error fetching click effect settings', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();

    // Listen for local changes (from Admin Panel saves)
    const handleUpdate = () => {
      const stored = localStorage.getItem('click_effect_config');
      if (stored) {
        try {
          setConfig(JSON.parse(stored));
        } catch (e) {}
      }
    };

    window.addEventListener('click-effect-settings-updated', handleUpdate);
    return () => window.removeEventListener('click-effect-settings-updated', handleUpdate);
  }, []);

  return { config, loading };
}
