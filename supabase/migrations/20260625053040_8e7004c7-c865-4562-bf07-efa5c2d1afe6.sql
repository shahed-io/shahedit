
CREATE TABLE IF NOT EXISTS public.welcome_popups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  subtitle text DEFAULT '',
  image_url text DEFAULT '',
  cta_label text DEFAULT '',
  cta_link text DEFAULT '',
  bg_color text DEFAULT '#0a0510',
  text_color text DEFAULT '#ffffff',
  button_bg_color text DEFAULT '#7c3aed',
  button_text_color text DEFAULT '#ffffff',
  overlay_opacity numeric DEFAULT 0.7,
  border_radius integer DEFAULT 24,
  is_active boolean NOT NULL DEFAULT false,
  starts_at timestamptz,
  ends_at timestamptz,
  targeting text NOT NULL DEFAULT 'all',
  target_paths text[] DEFAULT ARRAY[]::text[],
  show_once boolean NOT NULL DEFAULT true,
  delay_seconds integer DEFAULT 2,
  priority integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.welcome_popups TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.welcome_popups TO authenticated;
GRANT ALL ON public.welcome_popups TO service_role;

ALTER TABLE public.welcome_popups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active welcome popups"
  ON public.welcome_popups FOR SELECT
  USING (
    is_active = true
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at >= now())
  );

CREATE POLICY "Admins can view all welcome popups"
  ON public.welcome_popups FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert welcome popups"
  ON public.welcome_popups FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update welcome popups"
  ON public.welcome_popups FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete welcome popups"
  ON public.welcome_popups FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER welcome_popups_updated_at
  BEFORE UPDATE ON public.welcome_popups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_welcome_popups_active ON public.welcome_popups(is_active, priority DESC);
