
GRANT SELECT ON public.offer_campaigns TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.offer_campaigns TO authenticated;
GRANT ALL ON public.offer_campaigns TO service_role;

GRANT INSERT ON public.offer_submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.offer_submissions TO authenticated;
GRANT ALL ON public.offer_submissions TO service_role;

GRANT SELECT ON public.offer_winners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.offer_winners TO authenticated;
GRANT ALL ON public.offer_winners TO service_role;
