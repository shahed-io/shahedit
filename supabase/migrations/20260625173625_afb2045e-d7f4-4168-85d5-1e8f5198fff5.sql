
ALTER TABLE public.product_reviews
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','spam')),
  ADD COLUMN IF NOT EXISTS is_spam boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS spam_score numeric(4,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS spam_reasons text[],
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS admin_reply text,
  ADD COLUMN IF NOT EXISTS replied_at timestamptz,
  ADD COLUMN IF NOT EXISTS replied_by uuid;

CREATE INDEX IF NOT EXISTS product_reviews_status_idx ON public.product_reviews(status);
CREATE INDEX IF NOT EXISTS product_reviews_package_idx ON public.product_reviews(package_id);

UPDATE public.product_reviews SET status = 'approved' WHERE status = 'pending';

DROP FUNCTION IF EXISTS public.get_package_reviews(uuid);

CREATE FUNCTION public.get_package_reviews(_package_id uuid)
 RETURNS TABLE(id uuid, package_id uuid, rating integer, comment text, created_at timestamptz, reviewer_name text, reviewer_avatar text, title text, admin_reply text)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.id, r.package_id, r.rating, r.comment, r.created_at,
         p.full_name, p.avatar_url, r.title, r.admin_reply
  FROM public.product_reviews r
  LEFT JOIN public.profiles p ON p.user_id = r.user_id
  WHERE r.package_id = _package_id AND r.status = 'approved'
  ORDER BY r.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.review_rating_summary(_package_id uuid DEFAULT NULL)
 RETURNS TABLE(package_id uuid, package_title text, total bigint, approved bigint, pending bigint, spam bigint, avg_rating numeric, r5 bigint, r4 bigint, r3 bigint, r2 bigint, r1 bigint)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.package_id, sp.title,
         count(*)::bigint,
         count(*) FILTER (WHERE r.status='approved')::bigint,
         count(*) FILTER (WHERE r.status='pending')::bigint,
         count(*) FILTER (WHERE r.status='spam')::bigint,
         round(avg(r.rating) FILTER (WHERE r.status='approved')::numeric, 2),
         count(*) FILTER (WHERE r.rating=5 AND r.status='approved')::bigint,
         count(*) FILTER (WHERE r.rating=4 AND r.status='approved')::bigint,
         count(*) FILTER (WHERE r.rating=3 AND r.status='approved')::bigint,
         count(*) FILTER (WHERE r.rating=2 AND r.status='approved')::bigint,
         count(*) FILTER (WHERE r.rating=1 AND r.status='approved')::bigint
  FROM public.product_reviews r
  LEFT JOIN public.service_packages sp ON sp.id = r.package_id
  WHERE (_package_id IS NULL OR r.package_id = _package_id)
    AND public.is_admin(auth.uid())
  GROUP BY r.package_id, sp.title
  ORDER BY count(*) DESC;
$$;

CREATE OR REPLACE FUNCTION public.score_review_spam()
 RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  c text := lower(coalesce(NEW.comment, ''));
  score numeric := 0;
  reasons text[] := ARRAY[]::text[];
  link_count int := 0;
BEGIN
  link_count := array_length(regexp_split_to_array(c, 'https?://'), 1) - 1;
  IF link_count >= 2 THEN score := score + 0.5; reasons := reasons || 'multiple_links'; END IF;
  IF length(c) > 0 AND length(c) < 8 THEN score := score + 0.2; reasons := reasons || 'too_short'; END IF;
  IF c ~ '(viagra|casino|porn|crypto airdrop|free money|click here|buy now cheap)' THEN
    score := score + 0.6; reasons := reasons || 'blocklist_term';
  END IF;
  IF c ~ '(.)\1{6,}' THEN score := score + 0.3; reasons := reasons || 'repeated_chars'; END IF;
  IF NEW.rating IS NOT NULL AND NEW.rating NOT BETWEEN 1 AND 5 THEN
    score := score + 0.4; reasons := reasons || 'bad_rating';
  END IF;
  NEW.spam_score := least(score, 1);
  NEW.spam_reasons := reasons;
  IF NEW.spam_score >= 0.7 THEN NEW.is_spam := true; NEW.status := 'spam'; END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_review_spam ON public.product_reviews;
CREATE TRIGGER trg_review_spam BEFORE INSERT ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.score_review_spam();
