
UPDATE public.site_settings
SET value = replace(replace(value, '"Sopura, Rajshahi"', '"Rajshahi"'), '"streetAddress":"Sopura",', '')
WHERE value ILIKE '%sopura%';

UPDATE public.service_packages
SET description = replace(description, 'Sopura, Rajshahi, Bangladesh', 'Rajshahi, Bangladesh')
WHERE description ILIKE '%sopura%';

UPDATE public.service_packages
SET description = replace(description, 'Sopura, Rajshahi', 'Rajshahi')
WHERE description ILIKE '%sopura%';

UPDATE public.seo_pages
SET meta_description = replace(replace(meta_description, 'Sopura, Rajshahi', 'Rajshahi'), 'Sopura,Rajshahi', 'Rajshahi')
WHERE meta_description ILIKE '%sopura%';

UPDATE public.seo_pages
SET schema_json = replace(replace(schema_json::text, '"Sopura, Rajshahi"', '"Rajshahi"'), '"streetAddress":"Sopura",', '')::jsonb
WHERE schema_json::text ILIKE '%sopura%';
