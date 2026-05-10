CREATE TABLE public.refund_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_number text NOT NULL UNIQUE DEFAULT ('REF-' || to_char(now(), 'YYMMDD') || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
  user_id uuid,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  order_id text,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit refund requests"
ON public.refund_requests FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users view own refund requests"
ON public.refund_requests FOR SELECT
USING (auth.uid() = user_id OR email = (SELECT u.email FROM auth.users u WHERE u.id = auth.uid())::text);

CREATE POLICY "Admins manage refund requests"
ON public.refund_requests FOR ALL
USING (is_admin(auth.uid()));

CREATE TRIGGER update_refund_requests_updated_at
BEFORE UPDATE ON public.refund_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();