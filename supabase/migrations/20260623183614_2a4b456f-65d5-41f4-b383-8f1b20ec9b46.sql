
-- Remove the public SELECT policy that exposes phone/email
DROP POLICY IF EXISTS "Public can view published team members" ON public.team_members;

-- Public-safe view (no phone, email, joining_date, is_owner-only flags exposed selectively)
CREATE OR REPLACE VIEW public.team_members_public
WITH (security_invoker = true) AS
SELECT
  id, name, role, bio, avatar_url, linkedin_url, twitter_url,
  is_published, sort_order, created_at, updated_at,
  designation, department, is_active, is_owner
FROM public.team_members
WHERE is_published = true AND is_active = true;

GRANT SELECT ON public.team_members_public TO anon, authenticated;

-- Keep an authenticated SELECT path for admins on the base table (admin ALL policy still applies via is_admin)
-- No further policy needed; non-admins now get zero rows from base table.
