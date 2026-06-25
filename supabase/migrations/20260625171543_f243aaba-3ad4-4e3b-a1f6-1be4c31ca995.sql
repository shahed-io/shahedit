
CREATE OR REPLACE FUNCTION public.admin_list_customers()
RETURNS TABLE(
  user_id uuid, email text, full_name text, avatar_url text, phone text, created_at timestamptz,
  total_spent numeric, order_count integer, wallet_balance numeric,
  reward_points integer, is_blocked boolean, last_login_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  RETURN QUERY
  SELECT
    u.id,
    u.email::text,
    p.full_name,
    p.avatar_url,
    p.phone,
    u.created_at,
    COALESCE((SELECT SUM(o.amount) FROM public.orders o WHERE o.user_id = u.id AND o.status IN ('in_progress','completed','delivered')), 0)::numeric,
    COALESCE((SELECT COUNT(*) FROM public.orders o WHERE o.user_id = u.id), 0)::integer,
    COALESCE((SELECT w.balance FROM public.wallets w WHERE w.user_id = u.id), 0)::numeric,
    COALESCE((SELECT rp.points FROM public.customer_reward_points rp WHERE rp.user_id = u.id), 0)::integer,
    COALESCE((SELECT cs.is_blocked FROM public.customer_status cs WHERE cs.user_id = u.id), false),
    (SELECT MAX(lh.logged_in_at) FROM public.customer_login_history lh WHERE lh.user_id = u.id)
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.user_id = u.id
  ORDER BY u.created_at DESC
  LIMIT 1000;
END $$;

GRANT EXECUTE ON FUNCTION public.admin_list_customers() TO authenticated;

-- Admin: set block status
CREATE OR REPLACE FUNCTION public.admin_set_block_status(_user_id uuid, _blocked boolean, _reason text DEFAULT NULL)
RETURNS public.customer_status
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE rec public.customer_status;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  INSERT INTO public.customer_status(user_id, is_blocked, blocked_reason, blocked_by, blocked_at)
  VALUES (_user_id, _blocked, _reason, auth.uid(), CASE WHEN _blocked THEN now() ELSE NULL END)
  ON CONFLICT (user_id) DO UPDATE
    SET is_blocked = _blocked,
        blocked_reason = CASE WHEN _blocked THEN _reason ELSE NULL END,
        blocked_by = CASE WHEN _blocked THEN auth.uid() ELSE NULL END,
        blocked_at = CASE WHEN _blocked THEN now() ELSE NULL END,
        updated_at = now()
  RETURNING * INTO rec;
  RETURN rec;
END $$;
GRANT EXECUTE ON FUNCTION public.admin_set_block_status(uuid, boolean, text) TO authenticated;
