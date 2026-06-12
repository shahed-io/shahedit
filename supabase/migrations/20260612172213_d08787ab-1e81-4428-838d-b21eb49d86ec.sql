
-- Restrict product_reviews user_id exposure to public
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.product_reviews;
DROP POLICY IF EXISTS "Public can read reviews" ON public.product_reviews;

-- Allow only owners and admins to read raw rows (with user_id)
CREATE POLICY "Owners and admins can read raw reviews"
  ON public.product_reviews FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Public-safe view (no user_id exposed) joined with profile display info
CREATE OR REPLACE VIEW public.product_reviews_public
WITH (security_invoker = true) AS
SELECT
  r.id,
  r.package_id,
  r.rating,
  r.comment,
  r.created_at,
  p.full_name AS reviewer_name,
  p.avatar_url AS reviewer_avatar
FROM public.product_reviews r
LEFT JOIN public.profiles p ON p.user_id = r.user_id;

-- Allow public read of the safe view; underlying RLS still applies, so we expose via a SECURITY DEFINER function for anonymous access
CREATE OR REPLACE FUNCTION public.get_package_reviews(_package_id uuid)
RETURNS TABLE (
  id uuid,
  package_id uuid,
  rating integer,
  comment text,
  created_at timestamptz,
  reviewer_name text,
  reviewer_avatar text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id, r.package_id, r.rating, r.comment, r.created_at,
         p.full_name, p.avatar_url
  FROM public.product_reviews r
  LEFT JOIN public.profiles p ON p.user_id = r.user_id
  WHERE r.package_id = _package_id
  ORDER BY r.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_package_reviews(uuid) TO anon, authenticated;
