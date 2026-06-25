
DO $$ BEGIN
  CREATE TYPE public.publish_status AS ENUM ('draft','scheduled','published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.license_key_status AS ENUM ('available','assigned','revoked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 1) product_categories
CREATE TABLE IF NOT EXISTS public.product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  parent_id uuid REFERENCES public.product_categories(id) ON DELETE SET NULL,
  description text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_categories TO authenticated;
GRANT ALL ON public.product_categories TO service_role;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active categories" ON public.product_categories;
DROP POLICY IF EXISTS "Admins manage categories" ON public.product_categories;
CREATE POLICY "Public read active categories" ON public.product_categories FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admins manage categories" ON public.product_categories FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP TRIGGER IF EXISTS trg_product_categories_updated ON public.product_categories;
CREATE TRIGGER trg_product_categories_updated BEFORE UPDATE ON public.product_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) product_brands
CREATE TABLE IF NOT EXISTS public.product_brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  description text,
  website_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_brands TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_brands TO authenticated;
GRANT ALL ON public.product_brands TO service_role;
ALTER TABLE public.product_brands ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active brands" ON public.product_brands;
DROP POLICY IF EXISTS "Admins manage brands" ON public.product_brands;
CREATE POLICY "Public read active brands" ON public.product_brands FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admins manage brands" ON public.product_brands FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP TRIGGER IF EXISTS trg_product_brands_updated ON public.product_brands;
CREATE TRIGGER trg_product_brands_updated BEFORE UPDATE ON public.product_brands FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) product_tags + relation
CREATE TABLE IF NOT EXISTS public.product_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_tags TO authenticated;
GRANT ALL ON public.product_tags TO service_role;
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read tags" ON public.product_tags;
DROP POLICY IF EXISTS "Admins manage tags" ON public.product_tags;
CREATE POLICY "Public read tags" ON public.product_tags FOR SELECT USING (true);
CREATE POLICY "Admins manage tags" ON public.product_tags FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.product_tag_relations (
  package_id uuid NOT NULL REFERENCES public.service_packages(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.product_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (package_id, tag_id)
);
GRANT SELECT ON public.product_tag_relations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_tag_relations TO authenticated;
GRANT ALL ON public.product_tag_relations TO service_role;
ALTER TABLE public.product_tag_relations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read tag relations" ON public.product_tag_relations;
DROP POLICY IF EXISTS "Admins manage tag relations" ON public.product_tag_relations;
CREATE POLICY "Public read tag relations" ON public.product_tag_relations FOR SELECT USING (true);
CREATE POLICY "Admins manage tag relations" ON public.product_tag_relations FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 4) product_images
CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.service_packages(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text text,
  sort_order int NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read product images" ON public.product_images;
DROP POLICY IF EXISTS "Admins manage product images" ON public.product_images;
CREATE POLICY "Public read product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admins manage product images" ON public.product_images FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 5) product_variants + options
CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.service_packages(id) ON DELETE CASCADE,
  sku text UNIQUE,
  price numeric(12,2),
  sale_price numeric(12,2),
  stock_quantity int NOT NULL DEFAULT 0,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_variants TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_variants TO authenticated;
GRANT ALL ON public.product_variants TO service_role;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active variants" ON public.product_variants;
DROP POLICY IF EXISTS "Admins manage variants" ON public.product_variants;
CREATE POLICY "Public read active variants" ON public.product_variants FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admins manage variants" ON public.product_variants FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP TRIGGER IF EXISTS trg_product_variants_updated ON public.product_variants;
CREATE TRIGGER trg_product_variants_updated BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.product_variant_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  option_name text NOT NULL,
  option_value text NOT NULL
);
GRANT SELECT ON public.product_variant_options TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_variant_options TO authenticated;
GRANT ALL ON public.product_variant_options TO service_role;
ALTER TABLE public.product_variant_options ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read variant options" ON public.product_variant_options;
DROP POLICY IF EXISTS "Admins manage variant options" ON public.product_variant_options;
CREATE POLICY "Public read variant options" ON public.product_variant_options FOR SELECT USING (true);
CREATE POLICY "Admins manage variant options" ON public.product_variant_options FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 6) digital_files
CREATE TABLE IF NOT EXISTS public.digital_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.service_packages(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  file_size_bytes bigint,
  mime_type text,
  version text,
  download_limit int NOT NULL DEFAULT 5,
  expiry_days int NOT NULL DEFAULT 30,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.digital_files TO authenticated;
GRANT ALL ON public.digital_files TO service_role;
ALTER TABLE public.digital_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage digital files" ON public.digital_files;
CREATE POLICY "Admins manage digital files" ON public.digital_files FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP TRIGGER IF EXISTS trg_digital_files_updated ON public.digital_files;
CREATE TRIGGER trg_digital_files_updated BEFORE UPDATE ON public.digital_files FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7) license_keys
CREATE TABLE IF NOT EXISTS public.license_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.service_packages(id) ON DELETE CASCADE,
  key_value text NOT NULL UNIQUE,
  status public.license_key_status NOT NULL DEFAULT 'available',
  assigned_to_user_id uuid,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  assigned_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.license_keys TO authenticated;
GRANT ALL ON public.license_keys TO service_role;
ALTER TABLE public.license_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage license keys" ON public.license_keys;
DROP POLICY IF EXISTS "Users read own license keys" ON public.license_keys;
CREATE POLICY "Admins manage license keys" ON public.license_keys FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Users read own license keys" ON public.license_keys FOR SELECT USING (assigned_to_user_id = auth.uid());
DROP TRIGGER IF EXISTS trg_license_keys_updated ON public.license_keys;
CREATE TRIGGER trg_license_keys_updated BEFORE UPDATE ON public.license_keys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_license_keys_pkg_status ON public.license_keys(package_id, status);

-- 8) digital_downloads
CREATE TABLE IF NOT EXISTS public.digital_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  package_id uuid NOT NULL REFERENCES public.service_packages(id) ON DELETE CASCADE,
  file_id uuid REFERENCES public.digital_files(id) ON DELETE SET NULL,
  license_key_id uuid REFERENCES public.license_keys(id) ON DELETE SET NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  download_count int NOT NULL DEFAULT 0,
  download_limit int NOT NULL DEFAULT 5,
  expires_at timestamptz,
  last_downloaded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.digital_downloads TO authenticated;
GRANT ALL ON public.digital_downloads TO service_role;
ALTER TABLE public.digital_downloads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own downloads" ON public.digital_downloads;
DROP POLICY IF EXISTS "Admins manage downloads" ON public.digital_downloads;
CREATE POLICY "Users read own downloads" ON public.digital_downloads FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Admins manage downloads" ON public.digital_downloads FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP TRIGGER IF EXISTS trg_digital_downloads_updated ON public.digital_downloads;
CREATE TRIGGER trg_digital_downloads_updated BEFORE UPDATE ON public.digital_downloads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9) Extend service_packages
ALTER TABLE public.service_packages
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.product_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES public.product_brands(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sku text UNIQUE,
  ADD COLUMN IF NOT EXISTS barcode text,
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS meta_keywords text,
  ADD COLUMN IF NOT EXISTS og_image text,
  ADD COLUMN IF NOT EXISTS canonical_url text,
  ADD COLUMN IF NOT EXISTS scheduled_publish_at timestamptz,
  ADD COLUMN IF NOT EXISTS publish_status public.publish_status NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS is_digital boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS weight_grams int;

-- 10) Auto-assign license key on order in_progress
CREATE OR REPLACE FUNCTION public.assign_license_on_order_verify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_key_id uuid;
  v_file public.digital_files;
  v_expiry timestamptz;
BEGIN
  IF NEW.status = 'in_progress' AND OLD.status IS DISTINCT FROM 'in_progress'
     AND NEW.user_id IS NOT NULL AND NEW.package_id IS NOT NULL THEN

    SELECT id INTO v_key_id FROM public.license_keys
     WHERE package_id = NEW.package_id AND status = 'available'
     ORDER BY created_at ASC
     LIMIT 1 FOR UPDATE SKIP LOCKED;

    IF v_key_id IS NOT NULL THEN
      UPDATE public.license_keys
        SET status='assigned', assigned_to_user_id=NEW.user_id, order_id=NEW.id, assigned_at=now()
        WHERE id=v_key_id;
    END IF;

    SELECT * INTO v_file FROM public.digital_files
     WHERE package_id = NEW.package_id AND is_active = true
     ORDER BY created_at DESC LIMIT 1;

    IF v_file.id IS NOT NULL THEN
      v_expiry := now() + (COALESCE(v_file.expiry_days,30) || ' days')::interval;
      INSERT INTO public.digital_downloads (user_id, package_id, file_id, license_key_id, order_id, download_limit, expires_at)
      VALUES (NEW.user_id, NEW.package_id, v_file.id, v_key_id, NEW.id, COALESCE(v_file.download_limit,5), v_expiry);
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_assign_license_on_order_verify ON public.orders;
CREATE TRIGGER trg_assign_license_on_order_verify
AFTER UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.assign_license_on_order_verify();

-- 11) Scheduled publish (use is_published column on service_packages)
CREATE OR REPLACE FUNCTION public.run_scheduled_publish()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.service_packages
     SET publish_status='published', is_published=true
   WHERE publish_status='scheduled'
     AND scheduled_publish_at IS NOT NULL
     AND scheduled_publish_at <= now();
$$;
