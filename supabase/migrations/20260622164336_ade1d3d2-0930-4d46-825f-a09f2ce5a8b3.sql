DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'products','service_packages','services','hero_slides','team_members',
    'testimonials','faqs','blog_posts','blog_categories','pricing_plans',
    'clients','popular_searches','site_settings','cms_site_settings',
    'tech_details','careers','payment_methods'
  ] LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    EXCEPTION
      WHEN duplicate_object THEN NULL;
      WHEN undefined_table THEN NULL;
    END;
  END LOOP;
END $$;