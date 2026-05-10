
-- Redirects
CREATE TABLE public.redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_path text NOT NULL UNIQUE,
  to_path text NOT NULL,
  status_code integer NOT NULL DEFAULT 301,
  is_active boolean NOT NULL DEFAULT true,
  hits integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active redirects" ON public.redirects FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage redirects" ON public.redirects FOR ALL USING (is_admin(auth.uid()));
CREATE TRIGGER trg_redirects_updated BEFORE UPDATE ON public.redirects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Coupons
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  discount_type text NOT NULL DEFAULT 'percent', -- percent | flat
  discount_value numeric NOT NULL DEFAULT 0,
  min_order_amount numeric DEFAULT 0,
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  applies_to text DEFAULT 'all', -- all | category | package
  applies_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active coupons" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage coupons" ON public.coupons FOR ALL USING (is_admin(auth.uid()));
CREATE TRIGGER trg_coupons_updated BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Email campaigns
CREATE TABLE public.email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  body_html text NOT NULL,
  audience text NOT NULL DEFAULT 'leads', -- leads | clients | custom
  custom_emails text[],
  status text NOT NULL DEFAULT 'draft', -- draft | scheduled | sending | sent | failed
  scheduled_at timestamptz,
  sent_at timestamptz,
  recipients_count integer DEFAULT 0,
  delivered_count integer DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage campaigns" ON public.email_campaigns FOR ALL USING (is_admin(auth.uid()));
CREATE TRIGGER trg_campaigns_updated BEFORE UPDATE ON public.email_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Broken link logs
CREATE TABLE public.broken_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  referrer text,
  user_agent text,
  hits integer NOT NULL DEFAULT 1,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX broken_links_path_idx ON public.broken_links(path);
ALTER TABLE public.broken_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log broken links" ON public.broken_links FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update broken links" ON public.broken_links FOR UPDATE USING (true);
CREATE POLICY "Admins read broken links" ON public.broken_links FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins delete broken links" ON public.broken_links FOR DELETE USING (is_admin(auth.uid()));

-- Site analytics events (lightweight)
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL, -- pageview | click | conversion
  path text,
  referrer text,
  session_id text,
  user_agent text,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX analytics_events_created_idx ON public.analytics_events(created_at DESC);
CREATE INDEX analytics_events_path_idx ON public.analytics_events(path);
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert analytics" ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read analytics" ON public.analytics_events FOR SELECT USING (is_admin(auth.uid()));
