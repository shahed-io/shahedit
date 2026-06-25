
-- Add 'support' value to the app_role enum (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'public.app_role'::regtype AND enumlabel = 'support') THEN
    ALTER TYPE public.app_role ADD VALUE 'support';
  END IF;
END $$;

-- Custom roles defined by admins
CREATE TABLE IF NOT EXISTS public.custom_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  color text DEFAULT 'violet',
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.custom_roles TO authenticated;
GRANT ALL ON public.custom_roles TO service_role;
ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth read custom roles" ON public.custom_roles;
CREATE POLICY "auth read custom roles" ON public.custom_roles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "admin manage custom roles" ON public.custom_roles;
CREATE POLICY "admin manage custom roles" ON public.custom_roles FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP TRIGGER IF EXISTS trg_custom_roles_updated ON public.custom_roles;
CREATE TRIGGER trg_custom_roles_updated BEFORE UPDATE ON public.custom_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Assignments linking auth users to custom roles
CREATE TABLE IF NOT EXISTS public.custom_role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  custom_role_id uuid NOT NULL REFERENCES public.custom_roles(id) ON DELETE CASCADE,
  assigned_by uuid,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, custom_role_id)
);
GRANT SELECT ON public.custom_role_assignments TO authenticated;
GRANT ALL ON public.custom_role_assignments TO service_role;
ALTER TABLE public.custom_role_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth read assignments" ON public.custom_role_assignments;
CREATE POLICY "auth read assignments" ON public.custom_role_assignments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "admin manage assignments" ON public.custom_role_assignments;
CREATE POLICY "admin manage assignments" ON public.custom_role_assignments FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Admin-callable: list staff with role info
CREATE OR REPLACE FUNCTION public.admin_list_staff()
RETURNS TABLE(user_id uuid, email text, full_name text, avatar_url text, roles app_role[], custom_role_slugs text[], created_at timestamptz, last_sign_in_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  RETURN QUERY
  SELECT u.id, u.email::text, p.full_name, p.avatar_url,
    COALESCE(ARRAY(SELECT ur.role FROM public.user_roles ur WHERE ur.user_id = u.id), ARRAY[]::app_role[]),
    COALESCE(ARRAY(SELECT cr.slug FROM public.custom_role_assignments cra
                    JOIN public.custom_roles cr ON cr.id = cra.custom_role_id
                    WHERE cra.user_id = u.id), ARRAY[]::text[]),
    u.created_at, u.last_sign_in_at
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.user_id = u.id
  WHERE EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = u.id)
     OR EXISTS (SELECT 1 FROM public.custom_role_assignments cra WHERE cra.user_id = u.id)
  ORDER BY u.created_at DESC;
END $$;
