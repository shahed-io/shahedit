CREATE TABLE IF NOT EXISTS public.tech_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Frontend',
  tagline TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#a78bfa',
  symbol TEXT NOT NULL DEFAULT '•',
  what_is_it TEXT NOT NULL DEFAULT '',
  history TEXT NOT NULL DEFAULT '',
  pros JSONB NOT NULL DEFAULT '[]'::jsonb,
  cons JSONB NOT NULL DEFAULT '[]'::jsonb,
  best_for JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tech_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tech details are viewable by everyone when published"
  ON public.tech_details FOR SELECT
  USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert tech details"
  ON public.tech_details FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tech details"
  ON public.tech_details FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tech details"
  ON public.tech_details FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_tech_details_updated_at
  BEFORE UPDATE ON public.tech_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_tech_details_sort ON public.tech_details(sort_order, name);