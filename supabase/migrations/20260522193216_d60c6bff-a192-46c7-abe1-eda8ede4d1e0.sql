CREATE TABLE public.page_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published sections" ON public.page_sections
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins manage page sections" ON public.page_sections
  FOR ALL USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER update_page_sections_updated_at
  BEFORE UPDATE ON public.page_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.page_sections (section_key, label, content) VALUES
('faq_section', 'FAQ Section (Homepage)', jsonb_build_object(
  'badge', 'সচরাচর জিজ্ঞাসা',
  'title_prefix', 'আপনার',
  'title_highlight', 'প্রশ্নের উত্তর',
  'description', 'আমাদের সার্ভিস সম্পর্কে সবচেয়ে বেশি জিজ্ঞাসিত প্রশ্নগুলোর উত্তর এখানে পাবেন।',
  'cta_text', 'সব প্রশ্ন দেখুন →',
  'cta_link', '/faq'
));