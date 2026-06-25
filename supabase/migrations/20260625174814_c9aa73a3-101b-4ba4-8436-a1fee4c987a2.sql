
CREATE TABLE IF NOT EXISTS public.security_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  twofa_required_for_admins boolean DEFAULT false,
  twofa_required_for_all boolean DEFAULT false,
  recaptcha_enabled boolean DEFAULT false,
  recaptcha_site_key text,
  recaptcha_secret_key text,
  ip_whitelist_enabled boolean DEFAULT false,
  failed_login_lockout_threshold int DEFAULT 5,
  failed_login_lockout_minutes int DEFAULT 15,
  session_idle_timeout_minutes int DEFAULT 60,
  session_absolute_timeout_hours int DEFAULT 24,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.security_settings TO authenticated;
GRANT ALL ON public.security_settings TO service_role;
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin manage security settings" ON public.security_settings;
CREATE POLICY "admin manage security settings" ON public.security_settings
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "auth read security settings" ON public.security_settings;
CREATE POLICY "auth read security settings" ON public.security_settings FOR SELECT TO authenticated USING (true);
INSERT INTO public.security_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.ip_whitelist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  label text,
  is_active boolean DEFAULT true,
  applies_to text DEFAULT 'admin',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ip_whitelist TO authenticated;
GRANT ALL ON public.ip_whitelist TO service_role;
ALTER TABLE public.ip_whitelist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin manage ip whitelist" ON public.ip_whitelist;
CREATE POLICY "admin manage ip whitelist" ON public.ip_whitelist
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.failed_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  ip_address text,
  user_agent text,
  reason text,
  attempted_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.failed_login_attempts TO authenticated;
GRANT INSERT ON public.failed_login_attempts TO anon;
GRANT ALL ON public.failed_login_attempts TO service_role;
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anyone log failed attempt" ON public.failed_login_attempts;
CREATE POLICY "anyone log failed attempt" ON public.failed_login_attempts
  FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin read failed attempts" ON public.failed_login_attempts;
CREATE POLICY "admin read failed attempts" ON public.failed_login_attempts
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_failed_login_email ON public.failed_login_attempts (email, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_failed_login_ip ON public.failed_login_attempts (ip_address, attempted_at DESC);
