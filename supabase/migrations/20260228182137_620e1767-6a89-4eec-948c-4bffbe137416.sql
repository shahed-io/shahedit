
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== ROLES ====================
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'editor');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('super_admin','admin','editor'))
$$;

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Super admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- ==================== PROFILES ====================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by admins" ON public.profiles FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==================== SERVICES ====================
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  features TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Services public read" ON public.services FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage services" ON public.services FOR ALL USING (public.is_admin(auth.uid()));

-- ==================== PORTFOLIO / PROJECTS ====================
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  client_name TEXT,
  description TEXT,
  short_description TEXT,
  image_url TEXT,
  gallery_urls TEXT[],
  tech_stack TEXT[],
  category TEXT,
  project_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  meta_title TEXT,
  meta_description TEXT,
  completed_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projects public read" ON public.projects FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage projects" ON public.projects FOR ALL USING (public.is_admin(auth.uid()));

-- ==================== BLOG CATEGORIES ====================
CREATE TABLE public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Blog categories public read" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Admins manage blog categories" ON public.blog_categories FOR ALL USING (public.is_admin(auth.uid()));

-- ==================== BLOG POSTS ====================
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES auth.users(id),
  category_id UUID REFERENCES public.blog_categories(id),
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  meta_title TEXT,
  meta_description TEXT,
  og_image TEXT,
  read_time_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Blog posts public read" ON public.blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage blog posts" ON public.blog_posts FOR ALL USING (public.is_admin(auth.uid()));

-- ==================== TESTIMONIALS ====================
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_title TEXT,
  client_company TEXT,
  client_avatar TEXT,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  is_published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Testimonials public read" ON public.testimonials FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage testimonials" ON public.testimonials FOR ALL USING (public.is_admin(auth.uid()));

-- ==================== TEAM MEMBERS ====================
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  email TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  is_published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members public read" ON public.team_members FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage team" ON public.team_members FOR ALL USING (public.is_admin(auth.uid()));

-- ==================== CLIENTS / PARTNERS ====================
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  is_published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients public read" ON public.clients FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage clients" ON public.clients FOR ALL USING (public.is_admin(auth.uid()));

-- ==================== PRICING PLANS ====================
CREATE TABLE public.pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_monthly NUMERIC(10,2),
  price_yearly NUMERIC(10,2),
  currency TEXT DEFAULT 'BDT',
  features TEXT[],
  is_popular BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pricing plans public read" ON public.pricing_plans FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage pricing" ON public.pricing_plans FOR ALL USING (public.is_admin(auth.uid()));

-- ==================== FAQ ====================
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "FAQs public read" ON public.faqs FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage faqs" ON public.faqs FOR ALL USING (public.is_admin(auth.uid()));

-- ==================== LEADS ====================
CREATE TYPE public.lead_status AS ENUM ('new', 'in_progress', 'contacted', 'converted', 'closed');
CREATE TYPE public.lead_source AS ENUM ('quote_form', 'contact_form', 'whatsapp', 'other');

CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  service_interested TEXT,
  budget_range TEXT,
  project_description TEXT,
  timeline TEXT,
  source lead_source DEFAULT 'contact_form',
  status lead_status DEFAULT 'new',
  notes TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all leads" ON public.leads FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update leads" ON public.leads FOR UPDATE USING (public.is_admin(auth.uid()));

-- ==================== SITE SETTINGS ====================
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  type TEXT DEFAULT 'text',
  group_name TEXT DEFAULT 'general',
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings public read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON public.site_settings FOR ALL USING (public.is_admin(auth.uid()));

-- ==================== CAREERS ====================
CREATE TABLE public.careers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department TEXT,
  location TEXT DEFAULT 'Dhaka, Bangladesh',
  type TEXT DEFAULT 'Full-time',
  description TEXT,
  requirements TEXT[],
  is_published BOOLEAN DEFAULT true,
  deadline DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Careers public read" ON public.careers FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage careers" ON public.careers FOR ALL USING (public.is_admin(auth.uid()));

-- ==================== UPDATE TRIGGERS ====================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pricing_plans_updated_at BEFORE UPDATE ON public.pricing_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_careers_updated_at BEFORE UPDATE ON public.careers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==================== AUTO CREATE PROFILE ON SIGNUP ====================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==================== DEFAULT SITE SETTINGS ====================
INSERT INTO public.site_settings (key, value, type, group_name, label) VALUES
  ('company_name', 'Shahed IT', 'text', 'general', 'Company Name'),
  ('company_tagline', 'Professional IT Solutions', 'text', 'general', 'Tagline'),
  ('company_email', 'info@shahedit.com', 'text', 'general', 'Email'),
  ('company_phone', '+880 1234-567890', 'text', 'general', 'Phone'),
  ('company_address', 'Dhaka, Bangladesh', 'text', 'general', 'Address'),
  ('whatsapp_number', '8801234567890', 'text', 'general', 'WhatsApp Number'),
  ('facebook_url', '', 'text', 'social', 'Facebook URL'),
  ('linkedin_url', '', 'text', 'social', 'LinkedIn URL'),
  ('twitter_url', '', 'text', 'social', 'Twitter URL'),
  ('instagram_url', '', 'text', 'social', 'Instagram URL'),
  ('youtube_url', '', 'text', 'social', 'YouTube URL'),
  ('logo_url', '', 'text', 'branding', 'Logo URL'),
  ('favicon_url', '', 'text', 'branding', 'Favicon URL'),
  ('og_image', '', 'text', 'seo', 'OG Default Image'),
  ('meta_description', 'Shahed IT - Professional IT Solutions for your business', 'text', 'seo', 'Meta Description');
