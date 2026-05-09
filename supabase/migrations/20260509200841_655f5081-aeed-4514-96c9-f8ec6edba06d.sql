CREATE TABLE public.popular_searches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  term text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.popular_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Popular searches public read"
  ON public.popular_searches FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage popular searches"
  ON public.popular_searches FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE TRIGGER update_popular_searches_updated_at
  BEFORE UPDATE ON public.popular_searches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.popular_searches (term, sort_order) VALUES
  ('Windows 11', 1),
  ('Office 365', 2),
  ('Netflix', 3),
  ('Adobe', 4),
  ('Antivirus', 5),
  ('VPN', 6),
  ('Spotify', 7),
  ('Canva Pro', 8);