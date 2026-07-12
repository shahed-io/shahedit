DROP POLICY IF EXISTS "Public read safe ai support fields" ON public.ai_support_settings;
REVOKE SELECT ON public.ai_support_settings FROM anon, authenticated;
GRANT SELECT ON public.ai_support_settings_public TO anon, authenticated;