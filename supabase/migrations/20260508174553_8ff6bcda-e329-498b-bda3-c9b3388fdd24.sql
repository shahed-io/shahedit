
-- Product reviews table
CREATE TABLE public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID NOT NULL REFERENCES public.service_packages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (package_id, user_id)
);

CREATE INDEX idx_product_reviews_package ON public.product_reviews(package_id);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews public read"
  ON public.product_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users insert own review"
  ON public.product_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own review"
  ON public.product_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own review"
  ON public.product_reviews FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage reviews"
  ON public.product_reviews FOR ALL
  USING (is_admin(auth.uid()));

CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Aggregate view for fast average rating lookups
CREATE OR REPLACE VIEW public.product_review_stats AS
SELECT
  package_id,
  ROUND(AVG(rating)::numeric, 1) AS average_rating,
  COUNT(*)::int AS review_count
FROM public.product_reviews
GROUP BY package_id;

GRANT SELECT ON public.product_review_stats TO anon, authenticated;
