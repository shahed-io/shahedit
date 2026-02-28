
CREATE TABLE public.payment_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service TEXT,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit payment" ON public.payment_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all payments" ON public.payment_submissions
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update payment status" ON public.payment_submissions
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE TRIGGER update_payment_submissions_updated_at
  BEFORE UPDATE ON public.payment_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
