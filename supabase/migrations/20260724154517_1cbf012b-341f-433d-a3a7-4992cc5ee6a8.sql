
-- audit_logs: restrict INSERT to admins/service_role only
DROP POLICY IF EXISTS "Authenticated insert audit logs" ON public.audit_logs;
CREATE POLICY "Admins insert audit logs"
  ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()) AND actor_id = auth.uid());

-- coupon_redemptions: restrict INSERT to admins only (client should use redeem_coupon RPC)
DROP POLICY IF EXISTS "Authenticated users insert own redemptions" ON public.coupon_redemptions;
CREATE POLICY "Admins insert redemptions"
  ON public.coupon_redemptions FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- refund_requests: prevent identity spoofing on insert
DROP POLICY IF EXISTS "Anyone can submit refund requests" ON public.refund_requests;
CREATE POLICY "Anon submit refund requests"
  ON public.refund_requests FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);
CREATE POLICY "Authenticated submit refund requests"
  ON public.refund_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
