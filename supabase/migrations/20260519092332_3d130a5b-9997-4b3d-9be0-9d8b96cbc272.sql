
CREATE TABLE public.bkash_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id text UNIQUE,
  payer_reference text,
  customer_msisdn text,
  trx_id text,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BDT',
  intent text DEFAULT 'sale',
  merchant_invoice_number text,
  status text NOT NULL DEFAULT 'initiated',
  mode text NOT NULL DEFAULT 'sandbox',
  payment_create_time timestamptz,
  payment_execute_time timestamptz,
  user_email text,
  customer_name text,
  service text,
  note text,
  raw_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bkash_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage bkash transactions"
ON public.bkash_transactions FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can insert bkash transactions"
ON public.bkash_transactions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update by payment_id"
ON public.bkash_transactions FOR UPDATE
USING (true);

CREATE POLICY "Public read bkash transactions by payment_id"
ON public.bkash_transactions FOR SELECT
USING (true);

CREATE TRIGGER update_bkash_transactions_updated_at
BEFORE UPDATE ON public.bkash_transactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_settings (key, value, label, group_name, type)
VALUES ('bkash_pgw_mode', 'sandbox', 'bKash PGW Mode', 'payment', 'text')
ON CONFLICT (key) DO NOTHING;
