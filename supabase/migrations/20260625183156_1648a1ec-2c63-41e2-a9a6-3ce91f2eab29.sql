
-- client_error_logs
CREATE TABLE public.client_error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  message text NOT NULL,
  stack text,
  url text,
  user_agent text,
  severity text NOT NULL DEFAULT 'error',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.client_error_logs TO anon, authenticated;
GRANT ALL ON public.client_error_logs TO service_role;
ALTER TABLE public.client_error_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert errors" ON public.client_error_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read errors" ON public.client_error_logs FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete errors" ON public.client_error_logs FOR DELETE USING (public.is_admin(auth.uid()));

-- api_tokens
CREATE TABLE public.api_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  prefix text NOT NULL,
  token_hash text NOT NULL,
  scopes text[] NOT NULL DEFAULT ARRAY['read']::text[],
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_tokens TO authenticated;
GRANT ALL ON public.api_tokens TO service_role;
ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage api tokens" ON public.api_tokens FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- webhooks
CREATE TABLE public.webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  secret text,
  events text[] NOT NULL DEFAULT ARRAY[]::text[],
  is_active boolean NOT NULL DEFAULT true,
  last_status int,
  last_fired_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.webhooks TO authenticated;
GRANT ALL ON public.webhooks TO service_role;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage webhooks" ON public.webhooks FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER trg_webhooks_updated BEFORE UPDATE ON public.webhooks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- webhook_deliveries
CREATE TABLE public.webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid REFERENCES public.webhooks(id) ON DELETE CASCADE,
  event text NOT NULL,
  payload jsonb,
  response_status int,
  response_body text,
  attempted_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.webhook_deliveries TO authenticated;
GRANT ALL ON public.webhook_deliveries TO service_role;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read webhook deliveries" ON public.webhook_deliveries FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins delete webhook deliveries" ON public.webhook_deliveries FOR DELETE USING (public.is_admin(auth.uid()));

-- admin_dashboard_layout
CREATE TABLE public.admin_dashboard_layout (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  widgets jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_dashboard_layout TO authenticated;
GRANT ALL ON public.admin_dashboard_layout TO service_role;
ALTER TABLE public.admin_dashboard_layout ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own layout" ON public.admin_dashboard_layout FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_dashboard_layout_updated BEFORE UPDATE ON public.admin_dashboard_layout FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
