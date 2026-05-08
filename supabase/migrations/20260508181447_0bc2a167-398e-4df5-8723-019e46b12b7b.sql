-- Auto-assign super_admin role to the designated admin email on signup/login
CREATE OR REPLACE FUNCTION public.assign_admin_role_for_known_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'info.shahedit@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_assign_admin ON auth.users;
CREATE TRIGGER on_auth_user_assign_admin
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.assign_admin_role_for_known_email();

-- Backfill: if the admin email already exists, ensure the role is present
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role
FROM auth.users
WHERE email = 'info.shahedit@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;