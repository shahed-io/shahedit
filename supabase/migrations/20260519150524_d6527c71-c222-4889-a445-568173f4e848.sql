
-- PROJECT MANAGEMENT
CREATE TABLE IF NOT EXISTS public.mgmt_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planning',
  priority TEXT NOT NULL DEFAULT 'medium',
  budget NUMERIC DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BDT',
  progress INTEGER NOT NULL DEFAULT 0,
  start_date DATE,
  deadline DATE,
  completed_at TIMESTAMPTZ,
  assigned_to UUID,
  tags TEXT[],
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mgmt_projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage mgmt_projects" ON public.mgmt_projects;
CREATE POLICY "Admins manage mgmt_projects" ON public.mgmt_projects FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP TRIGGER IF EXISTS trg_mgmt_projects_updated ON public.mgmt_projects;
CREATE TRIGGER trg_mgmt_projects_updated BEFORE UPDATE ON public.mgmt_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.mgmt_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.mgmt_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  assignee_id UUID,
  assignee_name TEXT,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mgmt_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage mgmt_tasks" ON public.mgmt_tasks;
CREATE POLICY "Admins manage mgmt_tasks" ON public.mgmt_tasks FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP TRIGGER IF EXISTS trg_mgmt_tasks_updated ON public.mgmt_tasks;
CREATE TRIGGER trg_mgmt_tasks_updated BEFORE UPDATE ON public.mgmt_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TEAM MEMBERS additions
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS designation TEXT;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS joining_date DATE;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE DEFAULT ('INV-' || to_char(now(), 'YYMMDD') || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_address TEXT,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BDT',
  status TEXT NOT NULL DEFAULT 'draft',
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  notes TEXT,
  terms TEXT,
  project_id UUID,
  order_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage invoices" ON public.invoices;
CREATE POLICY "Admins manage invoices" ON public.invoices FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP TRIGGER IF EXISTS trg_invoices_updated ON public.invoices;
CREATE TRIGGER trg_invoices_updated BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  amount NUMERIC NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage invoice_items" ON public.invoice_items;
CREATE POLICY "Admins manage invoice_items" ON public.invoice_items FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- EXPENSES
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BDT',
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  vendor TEXT,
  payment_method TEXT,
  receipt_url TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage expenses" ON public.expenses;
CREATE POLICY "Admins manage expenses" ON public.expenses FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP TRIGGER IF EXISTS trg_expenses_updated ON public.expenses;
CREATE TRIGGER trg_expenses_updated BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- QUOTATIONS
CREATE TABLE IF NOT EXISTS public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number TEXT NOT NULL UNIQUE DEFAULT ('QT-' || to_char(now(), 'YYMMDD') || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_company TEXT,
  subject TEXT,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BDT',
  status TEXT NOT NULL DEFAULT 'draft',
  converted_order_id UUID,
  notes TEXT,
  terms TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage quotations" ON public.quotations;
CREATE POLICY "Admins manage quotations" ON public.quotations FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP TRIGGER IF EXISTS trg_quotations_updated ON public.quotations;
CREATE TRIGGER trg_quotations_updated BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  amount NUMERIC NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage quotation_items" ON public.quotation_items;
CREATE POLICY "Admins manage quotation_items" ON public.quotation_items FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- NEWSLETTER
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  source TEXT,
  tags TEXT[],
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage newsletter_subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins manage newsletter_subscribers" ON public.newsletter_subscribers FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
DROP TRIGGER IF EXISTS trg_newsletter_updated ON public.newsletter_subscribers;
CREATE TRIGGER trg_newsletter_updated BEFORE UPDATE ON public.newsletter_subscribers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- KNOWLEDGE BASE
CREATE TABLE IF NOT EXISTS public.knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  category TEXT,
  tags TEXT[],
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  meta_title TEXT,
  meta_description TEXT,
  author_id UUID,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage knowledge_articles" ON public.knowledge_articles;
CREATE POLICY "Admins manage knowledge_articles" ON public.knowledge_articles FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Public read published kb" ON public.knowledge_articles;
CREATE POLICY "Public read published kb" ON public.knowledge_articles FOR SELECT USING (is_published = true);
DROP TRIGGER IF EXISTS trg_kb_updated ON public.knowledge_articles;
CREATE TRIGGER trg_kb_updated BEFORE UPDATE ON public.knowledge_articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_mgmt_tasks_project ON public.mgmt_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation ON public.quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_mgmt_projects_status ON public.mgmt_projects(status);
