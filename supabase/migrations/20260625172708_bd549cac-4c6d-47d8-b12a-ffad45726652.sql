
-- Extend coupons with first-order, user-specific, per-user limit, free shipping support
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS first_order_only boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS per_user_limit integer,
  ADD COLUMN IF NOT EXISTS user_email text,
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS free_shipping boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS max_discount_amount numeric;

-- Allow 'free_shipping' as discount_type alongside percent/flat
-- (No CHECK constraint exists; type is free text — UI restricts values.)

-- Allow authenticated users to read active coupons for client-side validation lookups
DROP POLICY IF EXISTS "Anyone can view active coupons" ON public.coupons;
CREATE POLICY "Anyone can view active coupons" ON public.coupons
  FOR SELECT TO authenticated, anon
  USING (is_active = true);

GRANT SELECT ON public.coupons TO anon;

-- Redemption ledger
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id uuid,
  user_email text,
  order_id uuid,
  discount_amount numeric NOT NULL DEFAULT 0,
  order_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.coupon_redemptions TO authenticated;
GRANT ALL ON public.coupon_redemptions TO service_role;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view all redemptions" ON public.coupon_redemptions
  FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Users view their own redemptions" ON public.coupon_redemptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System inserts redemptions" ON public.coupon_redemptions
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon ON public.coupon_redemptions(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user ON public.coupon_redemptions(user_id);

-- Validate + compute discount for a coupon code
CREATE OR REPLACE FUNCTION public.validate_coupon(
  _code text,
  _order_amount numeric,
  _user_id uuid DEFAULT NULL,
  _user_email text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  c public.coupons;
  user_uses int := 0;
  prior_orders int := 0;
  discount numeric := 0;
BEGIN
  SELECT * INTO c FROM public.coupons WHERE upper(code) = upper(_code) LIMIT 1;
  IF c.id IS NULL THEN RETURN jsonb_build_object('valid', false, 'reason', 'Coupon not found'); END IF;
  IF NOT c.is_active THEN RETURN jsonb_build_object('valid', false, 'reason', 'Coupon inactive'); END IF;
  IF c.valid_from IS NOT NULL AND now() < c.valid_from THEN RETURN jsonb_build_object('valid', false, 'reason', 'Not yet valid'); END IF;
  IF c.valid_until IS NOT NULL AND now() > c.valid_until THEN RETURN jsonb_build_object('valid', false, 'reason', 'Expired'); END IF;
  IF c.max_uses IS NOT NULL AND c.used_count >= c.max_uses THEN RETURN jsonb_build_object('valid', false, 'reason', 'Usage limit reached'); END IF;
  IF c.min_order_amount IS NOT NULL AND _order_amount < c.min_order_amount THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'Minimum order ৳' || c.min_order_amount);
  END IF;
  IF c.user_id IS NOT NULL AND c.user_id <> COALESCE(_user_id, '00000000-0000-0000-0000-000000000000'::uuid) THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'Not eligible for this user');
  END IF;
  IF c.user_email IS NOT NULL AND lower(c.user_email) <> lower(COALESCE(_user_email,'')) THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'Not eligible for this user');
  END IF;
  IF c.first_order_only THEN
    IF _user_id IS NOT NULL THEN
      SELECT count(*) INTO prior_orders FROM public.orders WHERE user_id = _user_id AND status IN ('in_progress','completed','delivered');
    ELSIF _user_email IS NOT NULL THEN
      SELECT count(*) INTO prior_orders FROM public.orders WHERE lower(customer_email) = lower(_user_email) AND status IN ('in_progress','completed','delivered');
    END IF;
    IF prior_orders > 0 THEN RETURN jsonb_build_object('valid', false, 'reason', 'First-order coupon only'); END IF;
  END IF;
  IF c.per_user_limit IS NOT NULL THEN
    SELECT count(*) INTO user_uses FROM public.coupon_redemptions
      WHERE coupon_id = c.id AND (
        (_user_id IS NOT NULL AND user_id = _user_id)
        OR (_user_email IS NOT NULL AND lower(user_email) = lower(_user_email))
      );
    IF user_uses >= c.per_user_limit THEN RETURN jsonb_build_object('valid', false, 'reason', 'Per-user limit reached'); END IF;
  END IF;

  IF c.discount_type = 'percent' THEN
    discount := round(_order_amount * c.discount_value / 100.0, 2);
    IF c.max_discount_amount IS NOT NULL AND discount > c.max_discount_amount THEN
      discount := c.max_discount_amount;
    END IF;
  ELSIF c.discount_type = 'flat' THEN
    discount := least(c.discount_value, _order_amount);
  ELSIF c.discount_type = 'free_shipping' THEN
    discount := 0;
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'coupon_id', c.id,
    'code', c.code,
    'discount_type', c.discount_type,
    'discount_value', c.discount_value,
    'discount_amount', discount,
    'free_shipping', (c.free_shipping OR c.discount_type = 'free_shipping'),
    'description', c.description
  );
END $$;

-- Redeem (increment used_count + insert redemption row)
CREATE OR REPLACE FUNCTION public.redeem_coupon(
  _code text,
  _order_amount numeric,
  _discount_amount numeric,
  _order_id uuid DEFAULT NULL,
  _user_id uuid DEFAULT NULL,
  _user_email text DEFAULT NULL
) RETURNS coupon_redemptions
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE c public.coupons; rec public.coupon_redemptions;
BEGIN
  SELECT * INTO c FROM public.coupons WHERE upper(code) = upper(_code) FOR UPDATE;
  IF c.id IS NULL THEN RAISE EXCEPTION 'Coupon not found'; END IF;
  UPDATE public.coupons SET used_count = used_count + 1 WHERE id = c.id;
  INSERT INTO public.coupon_redemptions(coupon_id, user_id, user_email, order_id, discount_amount, order_amount)
  VALUES (c.id, _user_id, _user_email, _order_id, _discount_amount, _order_amount)
  RETURNING * INTO rec;
  RETURN rec;
END $$;
