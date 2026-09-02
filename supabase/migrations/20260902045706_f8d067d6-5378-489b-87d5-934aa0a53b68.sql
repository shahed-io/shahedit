CREATE TABLE IF NOT EXISTS public.invoice_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL DEFAULT 'Shahed IT',
  company_email text,
  company_phone text,
  company_address text,
  company_website text,
  logo_url text,
  signature_url text,
  signature_name text,
  brand_color text NOT NULL DEFAULT '#7c3aed',
  currency text NOT NULL DEFAULT 'BDT',
  invoice_prefix text NOT NULL DEFAULT 'INV',
  default_tax_rate numeric NOT NULL DEFAULT 0,
  default_discount numeric NOT NULL DEFAULT 0,
  default_due_days integer NOT NULL DEFAULT 7,
  default_terms text,
  default_notes text,
  footer_note text,
  bank_details text,
  payment_instructions text,
  show_qr boolean NOT NULL DEFAULT true,
  auto_create_order boolean NOT NULL DEFAULT false,
  order_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_settings TO authenticated;
GRANT ALL ON public.invoice_settings TO service_role;
ALTER TABLE public.invoice_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage invoice settings" ON public.invoice_settings
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER trg_invoice_settings_updated BEFORE UPDATE ON public.invoice_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.invoice_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'item',
  name text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_presets TO authenticated;
GRANT ALL ON public.invoice_presets TO service_role;
ALTER TABLE public.invoice_presets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage invoice presets" ON public.invoice_presets
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER trg_invoice_presets_updated BEFORE UPDATE ON public.invoice_presets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL;

INSERT INTO public.invoice_settings (company_name) SELECT 'Shahed IT'
WHERE NOT EXISTS (SELECT 1 FROM public.invoice_settings);