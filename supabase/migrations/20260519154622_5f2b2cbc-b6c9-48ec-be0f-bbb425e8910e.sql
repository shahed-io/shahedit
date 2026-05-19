
INSERT INTO public.site_settings (key, value, type, group_name, label)
VALUES
  ('theme_glow_intensity', '1', 'number', 'appearance', 'Background Glow Intensity (0 - 2)'),
  ('theme_dot_opacity', '0.18', 'number', 'appearance', 'Dotted Pattern Opacity (0 - 1)')
ON CONFLICT (key) DO NOTHING;
