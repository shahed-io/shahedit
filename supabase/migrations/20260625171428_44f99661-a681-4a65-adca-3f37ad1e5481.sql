
-- Customer Reward Points
CREATE TABLE public.customer_reward_points (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  points integer NOT NULL DEFAULT 0,
  lifetime_earned integer NOT NULL DEFAULT 0,
  lifetime_redeemed integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.customer_reward_points TO authenticated;
GRANT ALL ON public.customer_reward_points TO service_role;
ALTER TABLE public.customer_reward_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_view_own_points" ON public.customer_reward_points FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "admin_manage_points" ON public.customer_reward_points FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.reward_points_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points integer NOT NULL,
  type text NOT NULL CHECK (type IN ('earn','redeem','adjust_credit','adjust_debit','expire')),
  reason text,
  order_id uuid,
  admin_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reward_points_log TO authenticated;
GRANT ALL ON public.reward_points_log TO service_role;
ALTER TABLE public.reward_points_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_view_own_reward_log" ON public.reward_points_log FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "admin_manage_reward_log" ON public.reward_points_log FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Login History
CREATE TABLE public.customer_login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip text,
  user_agent text,
  device text,
  browser text,
  os text,
  country text,
  city text,
  logged_in_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_login_history_user ON public.customer_login_history(user_id, logged_in_at DESC);
GRANT SELECT, INSERT ON public.customer_login_history TO authenticated;
GRANT ALL ON public.customer_login_history TO service_role;
ALTER TABLE public.customer_login_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_insert_own_login" ON public.customer_login_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_view_own_login" ON public.customer_login_history FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "admin_manage_login_history" ON public.customer_login_history FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Active Devices
CREATE TABLE public.customer_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_fingerprint text NOT NULL,
  device_name text,
  browser text,
  os text,
  ip text,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  is_trusted boolean NOT NULL DEFAULT false,
  UNIQUE(user_id, device_fingerprint)
);
GRANT SELECT, INSERT, UPDATE ON public.customer_devices TO authenticated;
GRANT ALL ON public.customer_devices TO service_role;
ALTER TABLE public.customer_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_manage_own_devices" ON public.customer_devices FOR ALL TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid())) WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Block / Unblock status
CREATE TABLE public.customer_status (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_blocked boolean NOT NULL DEFAULT false,
  blocked_reason text,
  blocked_by uuid,
  blocked_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.customer_status TO authenticated;
GRANT ALL ON public.customer_status TO service_role;
ALTER TABLE public.customer_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_view_own_status" ON public.customer_status FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "admin_manage_status" ON public.customer_status FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Customer Notes (admin only)
CREATE TABLE public.customer_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note text NOT NULL,
  admin_id uuid,
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.customer_notes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_notes TO authenticated;
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_manage_notes" ON public.customer_notes FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER tr_customer_status_updated_at BEFORE UPDATE ON public.customer_status FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_customer_notes_updated_at BEFORE UPDATE ON public.customer_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_customer_reward_points_updated_at BEFORE UPDATE ON public.customer_reward_points FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Admin RPC: adjust reward points safely
CREATE OR REPLACE FUNCTION public.adjust_reward_points(_user_id uuid, _delta integer, _reason text, _type text DEFAULT 'adjust_credit', _order_id uuid DEFAULT NULL)
RETURNS public.customer_reward_points
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  rec public.customer_reward_points;
  caller uuid := auth.uid();
BEGIN
  IF caller IS NULL OR NOT public.is_admin(caller) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  INSERT INTO public.customer_reward_points(user_id, points) VALUES (_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.customer_reward_points
     SET points = GREATEST(0, points + _delta),
         lifetime_earned = lifetime_earned + GREATEST(_delta, 0),
         lifetime_redeemed = lifetime_redeemed + GREATEST(-_delta, 0),
         updated_at = now()
   WHERE user_id = _user_id
   RETURNING * INTO rec;

  INSERT INTO public.reward_points_log(user_id, points, type, reason, order_id, admin_id)
  VALUES (_user_id, _delta, _type, _reason, _order_id, caller);
  RETURN rec;
END $$;

-- Auto award points on order verified (1 point per 100 BDT)
CREATE OR REPLACE FUNCTION public.award_points_on_order()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  pts integer;
BEGIN
  IF NEW.status = 'in_progress' AND OLD.status IS DISTINCT FROM 'in_progress' AND NEW.user_id IS NOT NULL THEN
    pts := floor(COALESCE(NEW.amount,0) / 100)::integer;
    IF pts > 0 THEN
      INSERT INTO public.customer_reward_points(user_id, points, lifetime_earned)
      VALUES (NEW.user_id, pts, pts)
      ON CONFLICT (user_id) DO UPDATE
        SET points = customer_reward_points.points + pts,
            lifetime_earned = customer_reward_points.lifetime_earned + pts,
            updated_at = now();
      INSERT INTO public.reward_points_log(user_id, points, type, reason, order_id)
      VALUES (NEW.user_id, pts, 'earn', 'Order completed: ' || NEW.order_number, NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER tr_award_points_on_order
AFTER UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.award_points_on_order();
