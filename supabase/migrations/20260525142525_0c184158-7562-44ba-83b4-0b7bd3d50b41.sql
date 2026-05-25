
-- bkash_transactions: drop public read/update
DROP POLICY IF EXISTS "Public read bkash transactions by payment_id" ON public.bkash_transactions;
DROP POLICY IF EXISTS "Anyone can update by payment_id" ON public.bkash_transactions;

-- support_chats: drop public read/update
DROP POLICY IF EXISTS "Anyone can read support chats" ON public.support_chats;
DROP POLICY IF EXISTS "Session owner can update chat" ON public.support_chats;

-- broken_links: drop public update
DROP POLICY IF EXISTS "Anyone can update broken links" ON public.broken_links;

-- team_members: drop fully public read (PII exposed). Admins can still manage.
DROP POLICY IF EXISTS "Team members public read" ON public.team_members;
-- Provide a safe public view without email/phone for future public usage
CREATE OR REPLACE VIEW public.public_team_members
WITH (security_invoker = true) AS
SELECT id, name, role, bio, avatar_url, linkedin_url, twitter_url,
       designation, department, sort_order, is_published, is_active
FROM public.team_members
WHERE is_published = true;
GRANT SELECT ON public.public_team_members TO anon, authenticated;
-- Allow the view to read underlying rows via a permissive SELECT for published rows on safe columns:
-- Since RLS still applies on base table, add a policy limited to published rows but only for SELECT through view.
CREATE POLICY "Public can read published team via view"
  ON public.team_members FOR SELECT
  USING (is_published = true);
-- Note: this re-exposes base table columns. To truly restrict, revoke column privileges from anon/auth:
REVOKE SELECT ON public.team_members FROM anon, authenticated;
GRANT SELECT (id, name, role, bio, avatar_url, linkedin_url, twitter_url,
              designation, department, sort_order, is_published, is_active)
  ON public.team_members TO anon, authenticated;

-- Storage: client-docs ownership enforcement (folder = user id)
DROP POLICY IF EXISTS "Authenticated users can read client-docs" ON storage.objects;
CREATE POLICY "Users read own client-docs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'client-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Tighten is_admin: only true admins and super_admins
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin'::app_role, 'super_admin'::app_role)
  )
$$;

-- Fix function search_path on remaining helpers
ALTER FUNCTION public.slugify(text) SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- Revoke public/anonymous EXECUTE on SECURITY DEFINER functions not meant for client calls
REVOKE EXECUTE ON FUNCTION public.assign_admin_role_for_known_email() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_order_from_payment() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_order_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.resolve_delivery_days(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_service_package_slug() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_order_with_payment_status() FROM PUBLIC, anon, authenticated;
