
CREATE TABLE IF NOT EXISTS public.maintenance_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  auto_backup_enabled boolean DEFAULT false,
  auto_backup_frequency text DEFAULT 'daily',
  auto_backup_time text DEFAULT '02:00',
  auto_backup_retention_days int DEFAULT 30,
  last_auto_backup_at timestamptz,
  maintenance_mode boolean DEFAULT false,
  maintenance_message text DEFAULT 'আমরা শীঘ্রই ফিরে আসছি। সাময়িক অসুবিধার জন্য দুঃখিত।',
  maintenance_allow_admin boolean DEFAULT true,
  cache_version int DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.maintenance_settings TO anon, authenticated;
GRANT ALL ON public.maintenance_settings TO service_role;
ALTER TABLE public.maintenance_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read maintenance" ON public.maintenance_settings;
CREATE POLICY "public read maintenance" ON public.maintenance_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin manage maintenance" ON public.maintenance_settings;
CREATE POLICY "admin manage maintenance" ON public.maintenance_settings
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
INSERT INTO public.maintenance_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.backup_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  table_count int,
  row_count int,
  size_bytes bigint,
  file_name text,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.backup_jobs TO authenticated;
GRANT ALL ON public.backup_jobs TO service_role;
ALTER TABLE public.backup_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin manage backup jobs" ON public.backup_jobs;
CREATE POLICY "admin manage backup jobs" ON public.backup_jobs
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
