
-- Extend license_keys
ALTER TABLE public.license_keys
  ADD COLUMN IF NOT EXISTS activation_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_activations integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_activated_at timestamptz,
  ADD COLUMN IF NOT EXISTS revoked_at timestamptz,
  ADD COLUMN IF NOT EXISTS revoked_reason text,
  ADD COLUMN IF NOT EXISTS assigned_to_email text;

-- History table
CREATE TABLE IF NOT EXISTS public.license_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key_id uuid NOT NULL REFERENCES public.license_keys(id) ON DELETE CASCADE,
  event text NOT NULL, -- created | assigned | manually_assigned | revoked | resent | activated | deactivated | unassigned
  message text,
  actor text, -- system | admin | user
  actor_id uuid,
  user_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_license_history_key ON public.license_history(license_key_id, created_at DESC);

GRANT SELECT ON public.license_history TO authenticated;
GRANT ALL ON public.license_history TO service_role;
ALTER TABLE public.license_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read license history" ON public.license_history;
CREATE POLICY "Admins read license history" ON public.license_history
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users read own license history" ON public.license_history;
CREATE POLICY "Users read own license history" ON public.license_history
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Trigger to log license events
CREATE OR REPLACE FUNCTION public.log_license_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  actor_kind text := CASE WHEN auth.uid() IS NULL THEN 'system' ELSE (CASE WHEN public.is_admin(auth.uid()) THEN 'admin' ELSE 'user' END) END;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.license_history(license_key_id, event, message, actor, actor_id, user_id, metadata)
    VALUES (NEW.id, 'created', 'License key added to pool', actor_kind, auth.uid(), NEW.assigned_to_user_id,
            jsonb_build_object('package_id', NEW.package_id, 'status', NEW.status));
    RETURN NEW;
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.license_history(license_key_id, event, message, actor, actor_id, user_id, metadata)
    VALUES (NEW.id,
      CASE NEW.status WHEN 'assigned' THEN 'assigned' WHEN 'revoked' THEN 'revoked' ELSE 'status_change' END,
      'Status: ' || COALESCE(OLD.status::text,'?') || ' → ' || NEW.status::text,
      actor_kind, auth.uid(), NEW.assigned_to_user_id,
      jsonb_build_object('from', OLD.status, 'to', NEW.status, 'reason', NEW.revoked_reason));
  ELSIF NEW.assigned_to_user_id IS DISTINCT FROM OLD.assigned_to_user_id THEN
    INSERT INTO public.license_history(license_key_id, event, message, actor, actor_id, user_id, metadata)
    VALUES (NEW.id, 'reassigned', 'Reassigned user', actor_kind, auth.uid(), NEW.assigned_to_user_id,
            jsonb_build_object('from', OLD.assigned_to_user_id, 'to', NEW.assigned_to_user_id));
  ELSIF NEW.activation_count IS DISTINCT FROM OLD.activation_count THEN
    INSERT INTO public.license_history(license_key_id, event, message, actor, actor_id, user_id, metadata)
    VALUES (NEW.id, 'activated', 'Activation count: ' || OLD.activation_count || ' → ' || NEW.activation_count,
            actor_kind, auth.uid(), NEW.assigned_to_user_id,
            jsonb_build_object('count', NEW.activation_count, 'max', NEW.max_activations));
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_license_event_log ON public.license_keys;
CREATE TRIGGER trg_license_event_log
AFTER INSERT OR UPDATE ON public.license_keys
FOR EACH ROW EXECUTE FUNCTION public.log_license_event();

-- Pool stats RPC
CREATE OR REPLACE FUNCTION public.license_pool_stats(_package_id uuid DEFAULT NULL)
RETURNS TABLE(package_id uuid, package_title text, total bigint, available bigint, assigned bigint, revoked bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT lk.package_id,
         sp.title,
         COUNT(*)::bigint AS total,
         COUNT(*) FILTER (WHERE lk.status='available')::bigint AS available,
         COUNT(*) FILTER (WHERE lk.status='assigned')::bigint AS assigned,
         COUNT(*) FILTER (WHERE lk.status='revoked')::bigint AS revoked
    FROM public.license_keys lk
    LEFT JOIN public.service_packages sp ON sp.id = lk.package_id
   WHERE (_package_id IS NULL OR lk.package_id = _package_id)
     AND public.is_admin(auth.uid())
   GROUP BY lk.package_id, sp.title
   ORDER BY sp.title NULLS LAST;
$$;

-- Manual assign RPC
CREATE OR REPLACE FUNCTION public.admin_assign_license(_key_id uuid, _user_id uuid DEFAULT NULL, _user_email text DEFAULT NULL, _order_id uuid DEFAULT NULL, _note text DEFAULT NULL)
RETURNS public.license_keys
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  rec public.license_keys;
  uid uuid := _user_id;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF uid IS NULL AND _user_email IS NOT NULL THEN
    SELECT id INTO uid FROM auth.users WHERE email = _user_email LIMIT 1;
  END IF;
  UPDATE public.license_keys
     SET status = 'assigned',
         assigned_to_user_id = uid,
         assigned_to_email = COALESCE(_user_email, assigned_to_email),
         order_id = COALESCE(_order_id, order_id),
         assigned_at = now(),
         notes = COALESCE(_note, notes)
   WHERE id = _key_id
   RETURNING * INTO rec;
  INSERT INTO public.license_history(license_key_id, event, message, actor, actor_id, user_id, metadata)
  VALUES (_key_id, 'manually_assigned', 'Manually assigned by admin', 'admin', auth.uid(), uid,
          jsonb_build_object('email', _user_email, 'order_id', _order_id, 'note', _note));
  RETURN rec;
END $$;

-- Resend logging RPC (email send is in edge function; this just logs)
CREATE OR REPLACE FUNCTION public.admin_log_license_resend(_key_id uuid, _to_email text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  INSERT INTO public.license_history(license_key_id, event, message, actor, actor_id, metadata)
  VALUES (_key_id, 'resent', 'License email resent', 'admin', auth.uid(), jsonb_build_object('to', _to_email));
END $$;

-- Activation RPC (for product callbacks)
CREATE OR REPLACE FUNCTION public.activate_license(_key_value text)
RETURNS public.license_keys
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE rec public.license_keys;
BEGIN
  UPDATE public.license_keys
     SET activation_count = activation_count + 1,
         last_activated_at = now()
   WHERE key_value = _key_value
     AND status = 'assigned'
     AND activation_count < max_activations
   RETURNING * INTO rec;
  IF rec.id IS NULL THEN RAISE EXCEPTION 'License invalid or activation limit reached'; END IF;
  RETURN rec;
END $$;

GRANT EXECUTE ON FUNCTION public.license_pool_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_assign_license(uuid, uuid, text, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_log_license_resend(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.activate_license(text) TO authenticated, anon;
