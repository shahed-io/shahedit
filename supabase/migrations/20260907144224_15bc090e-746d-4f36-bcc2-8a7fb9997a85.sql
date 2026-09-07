CREATE OR REPLACE FUNCTION public.claim_admin_role()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  em text;
BEGIN
  IF uid IS NULL THEN RETURN false; END IF;
  SELECT email INTO em FROM auth.users WHERE id = uid;
  IF lower(coalesce(em,'')) <> 'info.shahedit@gmail.com' THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (uid, 'super_admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_admin_role() FROM public;
GRANT EXECUTE ON FUNCTION public.claim_admin_role() TO authenticated;