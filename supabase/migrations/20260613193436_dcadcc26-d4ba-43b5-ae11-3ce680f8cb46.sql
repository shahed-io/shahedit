DROP POLICY IF EXISTS "Authenticated insert audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated insert audit logs" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = actor_id);