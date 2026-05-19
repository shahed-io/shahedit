
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  method_id TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  sublabel TEXT,
  number TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#E2136E',
  short_code TEXT NOT NULL DEFAULT 'PM',
  instructions TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active payment methods" ON public.payment_methods
  FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert payment methods" ON public.payment_methods
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update payment methods" ON public.payment_methods
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete payment methods" ON public.payment_methods
  FOR DELETE USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.payment_methods (method_id, label, sublabel, number, color, short_code, sort_order) VALUES
  ('bkash_send', 'বিকাশ', 'Send Money', '01820060046', '#E2136E', 'bK', 1),
  ('nagad_send', 'নগদ', 'Send Money', '01820060046', '#F6821F', 'NG', 2),
  ('rocket_send', 'রকেট', 'Send Money', '01820060046', '#8B1FA8', 'RK', 3),
  ('upay_send', 'উপায়', 'Send Money', '01820060046', '#00A651', 'UP', 4),
  ('bkash_merchant', 'বিকাশ মার্চেন্ট', 'Merchant', '01820060046', '#E2136E', 'bM', 5);
