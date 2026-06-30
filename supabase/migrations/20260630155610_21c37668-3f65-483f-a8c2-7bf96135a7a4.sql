
DROP POLICY IF EXISTS "Anyone can view active coupons" ON public.coupons;
DROP POLICY IF EXISTS "auth read custom roles" ON public.custom_roles;
DROP POLICY IF EXISTS "auth read assignments" ON public.custom_role_assignments;
DROP POLICY IF EXISTS "anyone read email settings" ON public.email_system_settings;
DROP POLICY IF EXISTS "auth read channels" ON public.notification_channels;
DROP POLICY IF EXISTS "auth read security settings" ON public.security_settings;
