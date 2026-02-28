INSERT INTO public.site_settings (key, label, group_name, type, value)
VALUES
  ('ga4_measurement_id', 'Google Analytics 4 Measurement ID (G-XXXXXXXXXX)', 'analytics', 'text', ''),
  ('gsc_verification_code', 'Google Search Console Verification Code', 'analytics', 'text', ''),
  ('gsc_sitemap_url', 'Sitemap URL', 'analytics', 'text', 'https://shahedit.com/sitemap.xml')
ON CONFLICT (key) DO NOTHING;