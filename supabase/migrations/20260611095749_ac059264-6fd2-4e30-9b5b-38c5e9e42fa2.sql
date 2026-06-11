
-- 1. bkash_transactions: drop public INSERT policy, remove from realtime
DROP POLICY IF EXISTS "Anyone can insert bkash transactions" ON public.bkash_transactions;
ALTER PUBLICATION supabase_realtime DROP TABLE public.bkash_transactions;

-- 2. team_members: drop the table-level public SELECT (the public_team_members view exists for safe access)
DROP POLICY IF EXISTS "Public can read published team via view" ON public.team_members;
REVOKE SELECT ON public.team_members FROM anon, authenticated;

-- 3. coupons: drop public SELECT; expose only safe fields via a view
DROP POLICY IF EXISTS "Public read active coupons" ON public.coupons;

CREATE OR REPLACE VIEW public.public_coupons
WITH (security_invoker = true) AS
SELECT
  id,
  code,
  description,
  discount_type,
  discount_value,
  min_order_amount,
  valid_until,
  applies_to,
  applies_id
FROM public.coupons
WHERE is_active = true
  AND (valid_until IS NULL OR valid_until > now())
  AND (valid_from  IS NULL OR valid_from  <= now())
  AND (max_uses IS NULL OR used_count < max_uses);

GRANT SELECT ON public.public_coupons TO anon, authenticated;

-- 4. orders: restrict the per-email lookup policy to authenticated users
DROP POLICY IF EXISTS "Users view own orders by email" ON public.orders;
CREATE POLICY "Users view own orders by email"
ON public.orders
FOR SELECT
TO authenticated
USING (
  (customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text)
  OR (user_id = auth.uid())
);

-- 5. wallet_apply_transaction: admin-only caller check; revoke from authenticated/anon
CREATE OR REPLACE FUNCTION public.wallet_apply_transaction(
  _user_id uuid,
  _type text,
  _amount numeric,
  _description text DEFAULT NULL::text,
  _reference_type text DEFAULT NULL::text,
  _reference_id text DEFAULT NULL::text,
  _product_title text DEFAULT NULL::text,
  _payment_method text DEFAULT NULL::text,
  _metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS public.wallet_transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  w public.wallets;
  new_balance numeric(14,2);
  dir text;
  tx public.wallet_transactions;
  caller uuid := auth.uid();
BEGIN
  -- Only admins may apply wallet transactions
  IF caller IS NULL OR NOT public.is_admin(caller) THEN
    RAISE EXCEPTION 'Forbidden: admin role required';
  END IF;

  IF _amount IS NULL OR _amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  dir := CASE
    WHEN _type IN ('topup','refund','adjustment_credit','bonus') THEN 'credit'
    WHEN _type IN ('purchase','adjustment_debit','withdrawal') THEN 'debit'
    ELSE NULL
  END;
  IF dir IS NULL THEN RAISE EXCEPTION 'Invalid type %', _type; END IF;

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
$function$;

REVOKE EXECUTE ON FUNCTION public.wallet_apply_transaction(uuid,text,numeric,text,text,text,text,text,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.wallet_apply_transaction(uuid,text,numeric,text,text,text,text,text,jsonb) TO authenticated, service_role;
