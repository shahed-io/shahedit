
-- 1. Add delivery_days to packages and services
ALTER TABLE public.service_packages ADD COLUMN IF NOT EXISTS delivery_days integer;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS default_delivery_days integer;

-- 2. Site-wide default delivery days
INSERT INTO public.site_settings (key, value, type, label, group_name)
VALUES ('default_delivery_days', '7', 'number', 'Default Delivery Days', 'delivery')
ON CONFLICT DO NOTHING;

-- 3. Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL DEFAULT ('ORD-' || to_char(now(),'YYMMDD') || '-' || substr(replace(gen_random_uuid()::text,'-',''),1,6)),
  user_id uuid,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  package_id uuid REFERENCES public.service_packages(id) ON DELETE SET NULL,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  product_title text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BDT',
  payment_id uuid REFERENCES public.payment_submissions(id) ON DELETE SET NULL,
  payment_method text,
  status text NOT NULL DEFAULT 'pending', -- pending, in_progress, delivered, cancelled
  delivery_days integer,
  expected_delivery_at timestamptz,
  delivered_at timestamptz,
  delivery_notes text,
  delivery_files jsonb DEFAULT '[]'::jsonb,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage orders" ON public.orders
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Users view own orders by email" ON public.orders
  FOR SELECT USING (
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
    OR user_id = auth.uid()
  );

CREATE TRIGGER orders_set_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Helper: resolve delivery days (package -> service -> global default)
CREATE OR REPLACE FUNCTION public.resolve_delivery_days(_package_id uuid, _service_id uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  d integer;
BEGIN
  IF _package_id IS NOT NULL THEN
    SELECT delivery_days INTO d FROM public.service_packages WHERE id = _package_id;
    IF d IS NOT NULL THEN RETURN d; END IF;
  END IF;
  IF _service_id IS NOT NULL THEN
    SELECT default_delivery_days INTO d FROM public.services WHERE id = _service_id;
    IF d IS NOT NULL THEN RETURN d; END IF;
  END IF;
  SELECT NULLIF(value,'')::integer INTO d FROM public.site_settings WHERE key = 'default_delivery_days';
  RETURN COALESCE(d, 7);
END;
$$;

-- 5. Auto-create order from payment_submissions
CREATE OR REPLACE FUNCTION public.create_order_from_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  matched_pkg uuid;
  matched_svc uuid;
  d integer;
  uid uuid;
BEGIN
  -- Try to match package by exact title (best-effort)
  IF NEW.service IS NOT NULL THEN
    SELECT id, service_id INTO matched_pkg, matched_svc
    FROM public.service_packages
    WHERE lower(title) = lower(NEW.service)
    LIMIT 1;
  END IF;

  d := public.resolve_delivery_days(matched_pkg, matched_svc);

  IF NEW.email IS NOT NULL THEN
    SELECT id INTO uid FROM auth.users WHERE email = NEW.email LIMIT 1;
  END IF;

  INSERT INTO public.orders (
    user_id, customer_name, customer_email, customer_phone,
    package_id, service_id, product_title, amount, currency,
    payment_id, payment_method, status, delivery_days
  ) VALUES (
    uid, NEW.name, COALESCE(NEW.email, ''), NEW.phone,
    matched_pkg, matched_svc, COALESCE(NEW.service, 'Custom Order'),
    NEW.amount, 'BDT', NEW.id, NEW.payment_method, 'pending', d
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_payment_submitted_create_order ON public.payment_submissions;
CREATE TRIGGER on_payment_submitted_create_order
AFTER INSERT ON public.payment_submissions
FOR EACH ROW EXECUTE FUNCTION public.create_order_from_payment();

-- 6. When payment status changes to verified -> move order to in_progress + set ETA
CREATE OR REPLACE FUNCTION public.sync_order_with_payment_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'verified' AND OLD.status IS DISTINCT FROM 'verified' THEN
    UPDATE public.orders
    SET status = 'in_progress',
        expected_delivery_at = now() + (COALESCE(delivery_days,7) || ' days')::interval
    WHERE payment_id = NEW.id AND status = 'pending';
  ELSIF NEW.status = 'rejected' AND OLD.status IS DISTINCT FROM 'rejected' THEN
    UPDATE public.orders SET status = 'cancelled' WHERE payment_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_payment_status_sync_order ON public.payment_submissions;
CREATE TRIGGER on_payment_status_sync_order
AFTER UPDATE ON public.payment_submissions
FOR EACH ROW EXECUTE FUNCTION public.sync_order_with_payment_status();

-- 7. When order status/delivery changes -> create in-app notification for the user
CREATE OR REPLACE FUNCTION public.notify_order_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  msg text;
  ttl text;
BEGIN
  IF NEW.user_id IS NULL THEN RETURN NEW; END IF;

  IF TG_OP = 'INSERT' THEN
    ttl := 'নতুন অর্ডার গ্রহণ করা হয়েছে';
    msg := 'অর্ডার ' || NEW.order_number || ' (' || NEW.product_title || ') পেমেন্ট ভেরিফাইয়ের জন্য অপেক্ষমান।';
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    ttl := 'অর্ডার স্ট্যাটাস আপডেট';
    msg := 'অর্ডার ' || NEW.order_number || ' এখন: ' || NEW.status;
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, title, body, type, link)
  VALUES (NEW.user_id, ttl, msg, 'order', '/dashboard?tab=orders');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_order_change_notify ON public.orders;
CREATE TRIGGER on_order_change_notify
AFTER INSERT OR UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.notify_order_change();
