
CREATE TABLE public.notices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notice_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  recipient_name TEXT,
  recipient_address TEXT,
  recipient_email TEXT,
  recipient_phone TEXT,
  issued_by TEXT,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference TEXT,
  category TEXT DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'draft',
  ai_prompt TEXT,
  language TEXT DEFAULT 'bn',
  tone TEXT DEFAULT 'formal',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE SEQUENCE IF NOT EXISTS public.notice_seq START 1001;

CREATE OR REPLACE FUNCTION public.set_notice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.notice_number IS NULL OR NEW.notice_number = '' THEN
    NEW.notice_number := 'NTC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.notice_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_notice_number BEFORE INSERT ON public.notices
FOR EACH ROW EXECUTE FUNCTION public.set_notice_number();

CREATE TRIGGER trg_notices_updated_at BEFORE UPDATE ON public.notices
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notices TO authenticated;
GRANT ALL ON public.notices TO service_role;

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage notices" ON public.notices
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'editor'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'editor'));
