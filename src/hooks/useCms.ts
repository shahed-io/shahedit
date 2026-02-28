import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { slugify } from '@/lib/cms-utils';

// ---- Content Items ----
export function useContentItems(type?: string, status?: string) {
  return useQuery({
    queryKey: ['content_items', type, status],
    queryFn: async () => {
      let q = supabase.from('content_items').select('*').order('created_at', { ascending: false });
      if (type) q = q.eq('type', type);
      if (status) q = q.eq('status', status);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useContentItem(id?: string) {
  return useQuery({
    queryKey: ['content_item', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from('content_items').select('*').eq('id', id!).single();
      if (error) throw error;
      return data;
    },
  });
}

export function useContentVersion(contentId?: string) {
  return useQuery({
    queryKey: ['content_versions', contentId],
    enabled: !!contentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_versions')
        .select('*')
        .eq('content_id', contentId!)
        .order('version_no', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useLatestVersion(contentId?: string) {
  return useQuery({
    queryKey: ['content_version_latest', contentId],
    enabled: !!contentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_versions')
        .select('*')
        .eq('content_id', contentId!)
        .order('version_no', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useSaveContent() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (payload: {
      id?: string;
      type: string;
      title: string;
      slug: string;
      status: string;
      excerpt?: string;
      featured_media_id?: string;
      published_at?: string;
      body_html: string;
    }) => {
      const { body_html, id, ...rest } = payload;
      let contentId = id;
      if (id) {
        const { error } = await supabase.from('content_items').update({ ...rest, updated_at: new Date().toISOString() }).eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('content_items').insert({ ...rest, author_id: user!.id }).select().single();
        if (error) throw error;
        contentId = data.id;
      }
      // Save version
      const { data: versions } = await supabase.from('content_versions').select('version_no').eq('content_id', contentId!).order('version_no', { ascending: false }).limit(1);
      const nextVersion = (versions?.[0]?.version_no ?? 0) + 1;
      await supabase.from('content_versions').insert({ content_id: contentId!, body_html, version_no: nextVersion, created_by: user!.id });
      // Audit log
      await supabase.from('audit_logs').insert({ actor_id: user!.id, action: id ? 'update' : 'create', entity: 'content_items', entity_id: contentId! });
      return contentId;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['content_items'] }); qc.invalidateQueries({ queryKey: ['content_item'] }); },
  });
}

export function useDeleteContent() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('audit_logs').insert({ actor_id: user!.id, action: 'delete', entity: 'content_items', entity_id: id });
      const { error } = await supabase.from('content_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['content_items'] }),
  });
}

// ---- Media ----
export function useMediaAssets() {
  return useQuery({
    queryKey: ['media_assets'],
    queryFn: async () => {
      const { data, error } = await supabase.from('media_assets').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useUploadMedia() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split('.').pop();
      const path = `${user!.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('cms-media').upload(path, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('cms-media').getPublicUrl(path);
      const { data, error } = await supabase.from('media_assets').insert({
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        title: file.name,
        uploaded_by: user!.id,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media_assets'] }),
  });
}

export function useDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('media_assets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media_assets'] }),
  });
}

// ---- Taxonomies / Terms ----
export function useTaxonomies() {
  return useQuery({
    queryKey: ['taxonomies'],
    queryFn: async () => {
      const { data, error } = await supabase.from('taxonomies').select('*');
      if (error) throw error;
      return data;
    },
  });
}

export function useTerms(taxonomyId?: string) {
  return useQuery({
    queryKey: ['terms', taxonomyId],
    queryFn: async () => {
      let q = supabase.from('terms').select('*, taxonomy:taxonomies(name,slug)').order('name');
      if (taxonomyId) q = q.eq('taxonomy_id', taxonomyId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useSaveTerm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id?: string; taxonomy_id: string; name: string; slug: string; parent_id?: string }) => {
      const { id, ...rest } = payload;
      if (id) {
        const { error } = await supabase.from('terms').update(rest).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('terms').insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['terms'] }),
  });
}

export function useDeleteTerm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('terms').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['terms'] }),
  });
}

// ---- Content Terms ----
export function useContentTerms(contentId?: string) {
  return useQuery({
    queryKey: ['term_relations', contentId],
    enabled: !!contentId,
    queryFn: async () => {
      const { data, error } = await supabase.from('term_relations').select('term_id').eq('content_id', contentId!);
      if (error) throw error;
      return data?.map(r => r.term_id) ?? [];
    },
  });
}

export function useSaveContentTerms() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ contentId, termIds }: { contentId: string; termIds: string[] }) => {
      await supabase.from('term_relations').delete().eq('content_id', contentId);
      if (termIds.length > 0) {
        await supabase.from('term_relations').insert(termIds.map(tid => ({ content_id: contentId, term_id: tid })));
      }
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['term_relations', v.contentId] }),
  });
}

// ---- Menus ----
export function useCmsMenus() {
  return useQuery({
    queryKey: ['cms_menus'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cms_menus').select('*');
      if (error) throw error;
      return data;
    },
  });
}

export function useMenuItems(menuId?: string) {
  return useQuery({
    queryKey: ['menu_items', menuId],
    enabled: !!menuId,
    queryFn: async () => {
      const { data, error } = await supabase.from('menu_items').select('*').eq('menu_id', menuId!).order('sort_order');
      if (error) throw error;
      return data;
    },
  });
}

export function useSaveMenu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id?: string; name: string; location: string }) => {
      const { id, ...rest } = payload;
      if (id) {
        const { error } = await supabase.from('cms_menus').update(rest).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('cms_menus').insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cms_menus'] }),
  });
}

export function useDeleteMenu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cms_menus').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cms_menus'] }),
  });
}

export function useSaveMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id?: string; menu_id: string; label: string; item_type: string; target?: string; sort_order?: number }) => {
      const { id, ...rest } = payload;
      if (id) {
        const { error } = await supabase.from('menu_items').update(rest).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('menu_items').insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['menu_items', v.menu_id] }),
  });
}

export function useDeleteMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, menuId }: { id: string; menuId: string }) => {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) throw error;
      return menuId;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['menu_items', v.menuId] }),
  });
}

// ---- SEO ----
export function useSeoMeta(contentId?: string) {
  return useQuery({
    queryKey: ['seo_meta', contentId],
    enabled: !!contentId,
    queryFn: async () => {
      const { data } = await supabase.from('seo_meta').select('*').eq('content_id', contentId!).maybeSingle();
      return data;
    },
  });
}

export function useSaveSeoMeta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { content_id: string; meta_title?: string; meta_desc?: string; canonical_url?: string; robots?: string }) => {
      const { error } = await supabase.from('seo_meta').upsert(payload, { onConflict: 'content_id' });
      if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['seo_meta', v.content_id] }),
  });
}

// ---- Site Settings ----
export function useCmsSiteSettings() {
  return useQuery({
    queryKey: ['cms_site_settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cms_site_settings').select('*').eq('id', 1).single();
      if (error) throw error;
      return data;
    },
  });
}

export function useSaveCmsSiteSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { site_title: string; site_tagline?: string; primary_color?: string }) => {
      const { error } = await supabase.from('cms_site_settings').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', 1);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cms_site_settings'] }),
  });
}

// ---- Audit Logs ----
export function useAuditLogs() {
  return useQuery({
    queryKey: ['audit_logs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data;
    },
  });
}

// ---- Users (from user_roles + profiles) ----
export function useCmsUsers() {
  return useQuery({
    queryKey: ['cms_users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_roles').select('*, profile:profiles(full_name, avatar_url)');
      if (error) throw error;
      return data;
    },
  });
}
