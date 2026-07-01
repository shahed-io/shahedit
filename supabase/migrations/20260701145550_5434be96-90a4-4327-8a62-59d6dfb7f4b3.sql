
-- 1. Tighten coupon_redemptions INSERT policy
DROP POLICY IF EXISTS "System inserts redemptions" ON public.coupon_redemptions;
CREATE POLICY "Authenticated users insert own redemptions"
  ON public.coupon_redemptions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

-- 2. Drop reCAPTCHA secret key column from security_settings (must live in edge function secrets)
ALTER TABLE public.security_settings DROP COLUMN IF EXISTS recaptcha_secret_key;
