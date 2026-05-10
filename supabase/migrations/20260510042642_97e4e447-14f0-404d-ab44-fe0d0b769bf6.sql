-- Add slug column to service_packages for clean URLs
ALTER TABLE public.service_packages ADD COLUMN IF NOT EXISTS slug TEXT;

-- Slugify helper (Bengali-aware: keeps unicode letters/digits, replaces other chars with -)
CREATE OR REPLACE FUNCTION public.slugify(input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  result TEXT;
BEGIN
  IF input IS NULL OR length(trim(input)) = 0 THEN
    RETURN NULL;
  END IF;
  result := lower(trim(input));
  -- replace any non letter/digit (unicode-aware) with hyphen
  result := regexp_replace(result, '[^\w\u0980-\u09FF]+', '-', 'g');
  result := regexp_replace(result, '-+', '-', 'g');
  result := regexp_replace(result, '(^-|-$)', '', 'g');
  RETURN result;
END;
$$;

-- Trigger: auto-generate unique slug from title on insert/update if blank
CREATE OR REPLACE FUNCTION public.set_service_package_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base TEXT;
  candidate TEXT;
  counter INT := 1;
BEGIN
  IF NEW.slug IS NULL OR length(trim(NEW.slug)) = 0 THEN
    base := public.slugify(NEW.title);
  ELSE
    base := public.slugify(NEW.slug);
  END IF;

  IF base IS NULL OR length(base) = 0 THEN
    base := 'package';
  END IF;

  candidate := base;
  WHILE EXISTS (
    SELECT 1 FROM public.service_packages
    WHERE slug = candidate AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) LOOP
    counter := counter + 1;
    candidate := base || '-' || counter;
  END LOOP;

  NEW.slug := candidate;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS service_packages_set_slug ON public.service_packages;
CREATE TRIGGER service_packages_set_slug
  BEFORE INSERT OR UPDATE OF title, slug ON public.service_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.set_service_package_slug();

-- Backfill existing rows
UPDATE public.service_packages SET slug = NULL WHERE slug IS NULL;
-- trigger fires on update; force recompute
UPDATE public.service_packages SET title = title WHERE slug IS NULL;

-- Add unique index
CREATE UNIQUE INDEX IF NOT EXISTS service_packages_slug_unique ON public.service_packages(slug);