ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS is_owner boolean NOT NULL DEFAULT false;

GRANT SELECT ON public.team_members TO anon, authenticated;
GRANT ALL ON public.team_members TO service_role;

DROP POLICY IF EXISTS "Public can view published team members" ON public.team_members;
CREATE POLICY "Public can view published team members"
ON public.team_members
FOR SELECT
TO anon, authenticated
USING (is_published = true AND is_active = true);