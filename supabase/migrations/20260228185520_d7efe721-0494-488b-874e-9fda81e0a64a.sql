
-- CMS: content_items table
CREATE TABLE IF NOT EXISTS public.content_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'post' CHECK (type IN ('post','page')),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','scheduled','private')),
  excerpt TEXT,
  featured_media_id UUID,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_content_items_slug ON public.content_items(slug);
CREATE INDEX idx_content_items_status ON public.content_items(status);
CREATE INDEX idx_content_items_author ON public.content_items(author_id);

-- CMS: content_versions (revisions)
CREATE TABLE IF NOT EXISTS public.content_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  version_no INT NOT NULL DEFAULT 1,
  body_html TEXT,
  editor_state_json JSONB,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_content_versions_content ON public.content_versions(content_id);

-- CMS: media_assets
CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  width INT,
  height INT,
  alt_text TEXT,
  title TEXT,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- Add FK constraint from content_items to media_assets
ALTER TABLE public.content_items ADD CONSTRAINT fk_featured_media FOREIGN KEY (featured_media_id) REFERENCES public.media_assets(id) ON DELETE SET NULL;

-- CMS: taxonomies
CREATE TABLE IF NOT EXISTS public.taxonomies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.taxonomies ENABLE ROW LEVEL SECURITY;

-- CMS: terms
CREATE TABLE IF NOT EXISTS public.terms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  taxonomy_id UUID NOT NULL REFERENCES public.taxonomies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  parent_id UUID REFERENCES public.terms(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(taxonomy_id, slug)
);
ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;

-- CMS: term_relations
CREATE TABLE IF NOT EXISTS public.term_relations (
  content_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES public.terms(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, term_id)
);
ALTER TABLE public.term_relations ENABLE ROW LEVEL SECURITY;

-- CMS: menus
CREATE TABLE IF NOT EXISTS public.cms_menus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'header' CHECK (location IN ('header','footer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cms_menus ENABLE ROW LEVEL SECURITY;

-- CMS: menu_items
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id UUID NOT NULL REFERENCES public.cms_menus(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'url' CHECK (item_type IN ('url','content','term')),
  target TEXT,
  parent_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- CMS: seo_meta
CREATE TABLE IF NOT EXISTS public.seo_meta (
  content_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE PRIMARY KEY,
  meta_title TEXT,
  meta_desc TEXT,
  canonical_url TEXT,
  og_image_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
  robots TEXT DEFAULT 'index,follow',
  schema_json JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.seo_meta ENABLE ROW LEVEL SECURITY;

-- CMS: cms_site_settings
CREATE TABLE IF NOT EXISTS public.cms_site_settings (
  id INT NOT NULL DEFAULT 1 PRIMARY KEY CHECK (id = 1),
  site_title TEXT NOT NULL DEFAULT 'My Website',
  site_tagline TEXT,
  logo_media_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
  favicon_media_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
  primary_color TEXT DEFAULT '#6366f1',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cms_site_settings ENABLE ROW LEVEL SECURITY;

-- Insert default site settings row
INSERT INTO public.cms_site_settings (id, site_title, site_tagline) VALUES (1, 'Shahed IT CMS', 'Powered by Shahed IT') ON CONFLICT (id) DO NOTHING;

-- CMS: audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ===================== TRIGGERS =====================
CREATE OR REPLACE TRIGGER update_content_items_updated_at
  BEFORE UPDATE ON public.content_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_seo_meta_updated_at
  BEFORE UPDATE ON public.seo_meta
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===================== RLS POLICIES =====================

-- content_items
CREATE POLICY "Public can read published content" ON public.content_items FOR SELECT USING (status = 'published');
CREATE POLICY "Admins manage all content" ON public.content_items FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authors manage own content" ON public.content_items FOR ALL USING (auth.uid() = author_id);

-- content_versions
CREATE POLICY "Admins read all versions" ON public.content_versions FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Authors read own versions" ON public.content_versions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.content_items ci WHERE ci.id = content_id AND ci.author_id = auth.uid())
);
CREATE POLICY "Admins manage versions" ON public.content_versions FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authors insert own versions" ON public.content_versions FOR INSERT WITH CHECK (
  auth.uid() = created_by AND EXISTS (SELECT 1 FROM public.content_items ci WHERE ci.id = content_id AND ci.author_id = auth.uid())
);

-- media_assets
CREATE POLICY "Public read media" ON public.media_assets FOR SELECT USING (true);
CREATE POLICY "Admins manage all media" ON public.media_assets FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated users upload media" ON public.media_assets FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Users delete own media" ON public.media_assets FOR DELETE USING (auth.uid() = uploaded_by);

-- taxonomies
CREATE POLICY "Public read taxonomies" ON public.taxonomies FOR SELECT USING (true);
CREATE POLICY "Admins manage taxonomies" ON public.taxonomies FOR ALL USING (is_admin(auth.uid()));

-- terms
CREATE POLICY "Public read terms" ON public.terms FOR SELECT USING (true);
CREATE POLICY "Admins manage terms" ON public.terms FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Editors manage terms" ON public.terms FOR ALL USING (has_role(auth.uid(), 'editor'::app_role));

-- term_relations
CREATE POLICY "Public read term relations" ON public.term_relations FOR SELECT USING (true);
CREATE POLICY "Admins manage term relations" ON public.term_relations FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authors manage own term relations" ON public.term_relations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.content_items ci WHERE ci.id = content_id AND ci.author_id = auth.uid())
);

-- menus
CREATE POLICY "Public read menus" ON public.cms_menus FOR SELECT USING (true);
CREATE POLICY "Admins manage menus" ON public.cms_menus FOR ALL USING (is_admin(auth.uid()));

-- menu_items
CREATE POLICY "Public read menu items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Admins manage menu items" ON public.menu_items FOR ALL USING (is_admin(auth.uid()));

-- seo_meta
CREATE POLICY "Public read seo" ON public.seo_meta FOR SELECT USING (true);
CREATE POLICY "Admins manage seo" ON public.seo_meta FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authors manage own seo" ON public.seo_meta FOR ALL USING (
  EXISTS (SELECT 1 FROM public.content_items ci WHERE ci.id = content_id AND ci.author_id = auth.uid())
);

-- cms_site_settings
CREATE POLICY "Public read settings" ON public.cms_site_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON public.cms_site_settings FOR ALL USING (is_admin(auth.uid()));

-- audit_logs
CREATE POLICY "Admins read audit logs" ON public.audit_logs FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() = actor_id);

-- ===================== STORAGE BUCKET =====================
INSERT INTO storage.buckets (id, name, public) VALUES ('cms-media', 'cms-media', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read cms media" ON storage.objects FOR SELECT USING (bucket_id = 'cms-media');
CREATE POLICY "Authenticated upload cms media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cms-media' AND auth.role() = 'authenticated');
CREATE POLICY "Users delete own cms media" ON storage.objects FOR DELETE USING (bucket_id = 'cms-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ===================== SEED DEFAULT TAXONOMIES =====================
INSERT INTO public.taxonomies (name, slug) VALUES ('Category', 'category'), ('Tag', 'tag') ON CONFLICT (slug) DO NOTHING;
