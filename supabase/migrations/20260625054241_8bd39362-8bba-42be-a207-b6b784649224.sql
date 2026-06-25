
-- 1. Remove public SELECT on ai_support_settings; admins already have ALL via existing policy
DROP POLICY IF EXISTS "Public read ai support settings" ON public.ai_support_settings;

-- Public view exposing only safe fields for the chat widget
CREATE OR REPLACE VIEW public.ai_support_settings_public
WITH (security_invoker = true)
AS SELECT id, bot_name, greeting_message, is_enabled
FROM public.ai_support_settings;

-- Allow anon/authenticated to read the public view; underlying table still requires admin RLS for sensitive cols.
-- Add SELECT policy on base table restricted to the safe columns via the view's security_invoker context.
CREATE POLICY "Public read safe ai support fields"
  ON public.ai_support_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Revoke direct column access to sensitive fields from anon/authenticated; allow only safe columns
REVOKE SELECT ON public.ai_support_settings FROM anon, authenticated;
GRANT SELECT (id, bot_name, greeting_message, is_enabled) ON public.ai_support_settings TO anon, authenticated;

GRANT SELECT ON public.ai_support_settings_public TO anon, authenticated;

-- 2. Remove team_members from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.team_members;
