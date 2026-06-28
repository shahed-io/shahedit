
-- Campaigns
CREATE TABLE public.offer_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  banner_url text,
  prize_description text,
  fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  google_form_url text,
  use_google_form boolean NOT NULL DEFAULT false,
  winners_count integer NOT NULL DEFAULT 1,
  winner_prizes jsonb NOT NULL DEFAULT '[]'::jsonb,
  selection_method text NOT NULL DEFAULT 'random',
  winners_announced boolean NOT NULL DEFAULT false,
  winners_announce_at timestamptz,
  status text NOT NULL DEFAULT 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  max_entries integer,
  require_login boolean NOT NULL DEFAULT false,
  thank_you_message text,
  redirect_url text,
  meta_title text,
  meta_description text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.offer_campaigns TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.offer_campaigns TO authenticated;
GRANT ALL ON public.offer_campaigns TO service_role;
ALTER TABLE public.offer_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published offers" ON public.offer_campaigns
  FOR SELECT USING (status IN ('published','closed') OR public.is_admin(auth.uid()));
CREATE POLICY "Admins manage offers" ON public.offer_campaigns
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_offer_campaigns_updated BEFORE UPDATE ON public.offer_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Submissions
CREATE TABLE public.offer_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.offer_campaigns(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text,
  email text,
  phone text,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  is_disqualified boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_offer_submissions_campaign ON public.offer_submissions(campaign_id);
GRANT INSERT ON public.offer_submissions TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.offer_submissions TO authenticated;
GRANT ALL ON public.offer_submissions TO service_role;
ALTER TABLE public.offer_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit to active offers" ON public.offer_submissions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.offer_campaigns c
      WHERE c.id = campaign_id AND c.status='published'
        AND (c.starts_at IS NULL OR c.starts_at <= now())
        AND (c.ends_at IS NULL OR c.ends_at >= now())
    )
  );
CREATE POLICY "Users view own submissions" ON public.offer_submissions
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Admins manage submissions" ON public.offer_submissions
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Winners
CREATE TABLE public.offer_winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.offer_campaigns(id) ON DELETE CASCADE,
  submission_id uuid NOT NULL REFERENCES public.offer_submissions(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 1,
  prize text,
  reason text,
  selected_by text NOT NULL DEFAULT 'ai',
  selected_at timestamptz NOT NULL DEFAULT now(),
  is_published boolean NOT NULL DEFAULT false,
  notified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, submission_id)
);
GRANT SELECT ON public.offer_winners TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.offer_winners TO authenticated;
GRANT ALL ON public.offer_winners TO service_role;
ALTER TABLE public.offer_winners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view published winners" ON public.offer_winners
  FOR SELECT USING (is_published OR public.is_admin(auth.uid()));
CREATE POLICY "Admins manage winners" ON public.offer_winners
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
