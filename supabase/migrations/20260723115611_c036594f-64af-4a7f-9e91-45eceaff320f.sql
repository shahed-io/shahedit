
-- Fix blog_comments user_id spoofing
DROP POLICY IF EXISTS "comments insert authed" ON public.blog_comments;
CREATE POLICY "comments insert authed" ON public.blog_comments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()));

-- Fix offer_submissions user_id spoofing
DROP POLICY IF EXISTS "Anyone can submit to active offers" ON public.offer_submissions;
CREATE POLICY "Anyone can submit to active offers" ON public.offer_submissions
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.offer_campaigns c WHERE c.id = offer_submissions.campaign_id AND c.status = 'active')
    AND (user_id IS NULL OR user_id = auth.uid())
  );
