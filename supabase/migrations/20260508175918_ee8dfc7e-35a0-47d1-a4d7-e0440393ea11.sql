-- ========== SEO PAGES TABLE ==========
CREATE TABLE IF NOT EXISTS public.seo_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_path TEXT NOT NULL UNIQUE,
  page_label TEXT,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  canonical_url TEXT,
  robots TEXT DEFAULT 'index,follow',
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  twitter_card TEXT DEFAULT 'summary_large_image',
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,
  schema_json JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SEO pages public read"
  ON public.seo_pages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage SEO pages"
  ON public.seo_pages FOR ALL
  USING (is_admin(auth.uid()));

CREATE TRIGGER trg_seo_pages_updated_at
  BEFORE UPDATE ON public.seo_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_seo_pages_route ON public.seo_pages(route_path);

-- ========== SEED DEFAULT SEO ROWS for main routes ==========
INSERT INTO public.seo_pages (route_path, page_label, meta_title, meta_description, meta_keywords, canonical_url) VALUES
  ('/', 'Home', 'Shahed IT — Professional IT Solutions Bangladesh', 'Shahed IT offers professional web development, mobile app, e-commerce, digital marketing and software solutions in Bangladesh. Get a free quote today!', 'web development Bangladesh, software company Dhaka, mobile app development, e-commerce solution, digital marketing Bangladesh, IT company', 'https://shahedit.com/'),
  ('/services', 'Services', 'Our Services — Shahed IT', 'Web Development, Mobile Apps, Graphic Design, Digital Marketing, Cloud Hosting & IT Support — explore all Shahed IT services.', 'IT services Bangladesh, web development service, app development', 'https://shahedit.com/services'),
  ('/portfolio', 'Portfolio', 'Portfolio — Shahed IT Projects', 'Browse our portfolio of completed web, mobile and design projects across Bangladesh.', 'portfolio, projects, IT projects Bangladesh', 'https://shahedit.com/portfolio'),
  ('/about', 'About', 'About Us — Shahed IT', 'Learn about Shahed IT — a Rajshahi-based professional IT agency serving clients across Bangladesh.', 'about Shahed IT, IT company Rajshahi', 'https://shahedit.com/about'),
  ('/contact', 'Contact', 'Contact — Shahed IT', 'Contact Shahed IT for IT solutions. Phone: 01820-060046. Address: Sopura, Rajshahi, Bangladesh.', 'contact Shahed IT, IT support Bangladesh', 'https://shahedit.com/contact'),
  ('/blog', 'Blog', 'Blog — Shahed IT', 'Latest articles on web development, design, marketing and tech in Bangladesh.', 'IT blog, tech blog Bangladesh', 'https://shahedit.com/blog'),
  ('/pricing', 'Pricing', 'Pricing Plans — Shahed IT', 'Affordable IT service packages and pricing in BDT.', 'pricing, packages, BDT pricing', 'https://shahedit.com/pricing'),
  ('/faq', 'FAQ', 'FAQ — Shahed IT', 'Frequently asked questions about our services and process.', 'FAQ, questions', 'https://shahedit.com/faq'),
  ('/careers', 'Careers', 'Careers — Shahed IT', 'Open positions and career opportunities at Shahed IT.', 'careers, jobs Bangladesh', 'https://shahedit.com/careers'),
  ('/get-quote', 'Get Quote', 'Get a Free Quote — Shahed IT', 'Request a free quote for your IT project from Shahed IT.', 'free quote, IT quote', 'https://shahedit.com/get-quote')
ON CONFLICT (route_path) DO NOTHING;

-- ========== SEED GLOBAL SEO/ANALYTICS SETTINGS ==========
INSERT INTO public.site_settings (key, value, type, group_name, label) VALUES
  ('site_url', 'https://shahedit.com', 'text', 'seo', 'Site URL (no trailing slash)'),
  ('default_meta_title', 'Shahed IT — Professional IT Solutions Bangladesh', 'text', 'seo', 'Default Meta Title'),
  ('default_meta_description', 'Shahed IT offers professional web, app, design and marketing solutions in Bangladesh.', 'textarea', 'seo', 'Default Meta Description'),
  ('default_meta_keywords', 'IT company Bangladesh, web development, mobile app, digital marketing', 'text', 'seo', 'Default Keywords'),
  ('default_og_image', '', 'text', 'seo', 'Default Open Graph Image URL'),
  ('twitter_handle', '@shahedit', 'text', 'seo', 'Twitter Handle'),
  ('organization_schema', '{"@context":"https://schema.org","@type":"Organization","name":"Shahed IT","url":"https://shahedit.com","logo":"https://shahedit.com/favicon.png","telephone":"+8801820060046","address":{"@type":"PostalAddress","addressLocality":"Sopura, Rajshahi","addressCountry":"BD"}}', 'textarea', 'seo', 'Organization JSON-LD'),
  ('facebook_pixel_id', '', 'text', 'analytics', 'Facebook Pixel ID'),
  ('bing_verification_code', '', 'text', 'analytics', 'Bing Webmaster Verification')
ON CONFLICT (key) DO NOTHING;