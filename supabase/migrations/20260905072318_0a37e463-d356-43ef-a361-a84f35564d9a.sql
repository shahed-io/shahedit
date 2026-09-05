ALTER TABLE public.product_categories ADD COLUMN IF NOT EXISTS icon text;

UPDATE public.product_categories c
SET icon = s.icon
FROM public.services s
WHERE s.slug = c.slug AND c.icon IS NULL;