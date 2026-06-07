
-- WALLETS
CREATE TABLE public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  balance numeric(14,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BDT',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.wallets TO authenticated;
GRANT ALL ON public.wallets TO service_role;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own wallet" ON public.wallets
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'manager'));

CREATE POLICY "Admins manage wallets" ON public.wallets
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- WALLET TRANSACTIONS (ledger)
CREATE TABLE public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('topup','purchase','refund','adjustment_credit','adjustment_debit','withdrawal','bonus')),
  direction text NOT NULL CHECK (direction IN ('credit','debit')),
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  balance_after numeric(14,2) NOT NULL,
  description text,
  reference_type text,         -- e.g. 'order','payment','manual'
  reference_id text,           -- order_number / payment id / etc
  product_title text,          -- what was bought (if purchase)
  payment_method text,         -- bkash_online etc (if topup)
  performed_by uuid,           -- admin user_id who triggered (null for self/system)
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.wallet_transactions TO authenticated;
GRANT ALL ON public.wallet_transactions TO service_role;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE INDEX wallet_tx_wallet_idx  ON public.wallet_transactions(wallet_id, created_at DESC);
CREATE INDEX wallet_tx_user_idx    ON public.wallet_transactions(user_id, created_at DESC);
CREATE INDEX wallet_tx_type_idx    ON public.wallet_transactions(type);
CREATE INDEX wallet_tx_created_idx ON public.wallet_transactions(created_at DESC);

CREATE POLICY "Users view own wallet tx" ON public.wallet_transactions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'manager'));

CREATE POLICY "Admins insert wallet tx" ON public.wallet_transactions
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- Safe apply function: updates balance + inserts ledger row atomically
CREATE OR REPLACE FUNCTION public.wallet_apply_transaction(
  _user_id uuid,
  _type text,
  _amount numeric,
  _description text DEFAULT NULL,
  _reference_type text DEFAULT NULL,
  _reference_id text DEFAULT NULL,
  _product_title text DEFAULT NULL,
  _payment_method text DEFAULT NULL,
  _metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS public.wallet_transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  w public.wallets;
  new_balance numeric(14,2);
  dir text;
  tx public.wallet_transactions;
  caller uuid := auth.uid();
BEGIN
  IF _amount IS NULL OR _amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  dir := CASE
    WHEN _type IN ('topup','refund','adjustment_credit','bonus') THEN 'credit'
    WHEN _type IN ('purchase','adjustment_debit','withdrawal') THEN 'debit'
    ELSE NULL
  END;
  IF dir IS NULL THEN RAISE EXCEPTION 'Invalid type %', _type; END IF;

  -- Ensure wallet exists, lock row
  INSERT INTO public.wallets(user_id) VALUES (_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO w FROM public.wallets WHERE user_id = _user_id FOR UPDATE;

  IF dir = 'credit' THEN
    new_balance := w.balance + _amount;
  ELSE
    new_balance := w.balance - _amount;
    IF new_balance < 0 THEN RAISE EXCEPTION 'Insufficient wallet balance'; END IF;
  END IF;

  UPDATE public.wallets SET balance = new_balance, updated_at = now() WHERE id = w.id;

  INSERT INTO public.wallet_transactions(
    wallet_id, user_id, type, direction, amount, balance_after,
    description, reference_type, reference_id, product_title, payment_method,
    performed_by, metadata
  ) VALUES (
    w.id, _user_id, _type, dir, _amount, new_balance,
    _description, _reference_type, _reference_id, _product_title, _payment_method,
    caller, COALESCE(_metadata,'{}'::jsonb)
  ) RETURNING * INTO tx;

  RETURN tx;
END;
$$;

REVOKE ALL ON FUNCTION public.wallet_apply_transaction(uuid,text,numeric,text,text,text,text,text,jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.wallet_apply_transaction(uuid,text,numeric,text,text,text,text,text,jsonb) TO authenticated, service_role;
