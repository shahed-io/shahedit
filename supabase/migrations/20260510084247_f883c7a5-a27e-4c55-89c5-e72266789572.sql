-- Add slug column to services
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS slug TEXT;

-- Update the 6 services to match the navigation categories with proper slugs
UPDATE public.services SET title='Web Development', slug='web-development', icon='💻', sort_order=1
  WHERE id='a81c0c93-8a3c-496b-bac1-d4d617c6decb';
UPDATE public.services SET title='Website Maintenance', slug='website-maintenance', icon='🔧', sort_order=2
  WHERE id='89e3f70f-9a81-40eb-897f-02c0a78dee60';
UPDATE public.services SET title='Graphics Design', slug='graphics-design', icon='🎨', sort_order=3
  WHERE id='b6c79fbc-593b-49a1-8268-77f19ad81dad';
UPDATE public.services SET title='Facebook Services', slug='facebook-services', icon='📘', sort_order=4
  WHERE id='92ca96d4-3151-4517-b666-9e021e1580a7';
UPDATE public.services SET title='Digital Marketing', slug='digital-marketing', icon='📊', sort_order=5
  WHERE id='cc044a76-699d-4aa7-8f69-3ea0b558dde0';
UPDATE public.services SET title='Business Solutions', slug='business-solutions', icon='🏢', sort_order=6
  WHERE id='94cd5603-ff77-4b74-bd36-3c72e263880d';

-- Add unique constraint on slug
CREATE UNIQUE INDEX IF NOT EXISTS services_slug_unique ON public.services(slug);