
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tracking_carrier text,
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS tracking_url text,
  ADD COLUMN IF NOT EXISTS cancel_reason text;

CREATE TABLE IF NOT EXISTS public.order_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  event text NOT NULL,
  message text,
  actor text NOT NULL DEFAULT 'system',
  actor_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_timeline TO authenticated;
GRANT ALL ON public.order_timeline TO service_role;

ALTER TABLE public.order_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage timeline" ON public.order_timeline
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Users view own order timeline" ON public.order_timeline
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_timeline.order_id AND o.user_id = auth.uid()
  ));

CREATE INDEX IF NOT EXISTS idx_order_timeline_order_id ON public.order_timeline(order_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.log_order_timeline()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.order_timeline(order_id, event, message, actor, metadata)
    VALUES (NEW.id, 'created', 'Order created — ' || NEW.product_title, 'system',
      jsonb_build_object('amount', NEW.amount, 'status', NEW.status));
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.order_timeline(order_id, event, message, actor, actor_id, metadata)
    VALUES (NEW.id, 'status_change',
      'Status: ' || COALESCE(OLD.status,'?') || ' → ' || NEW.status,
      CASE WHEN auth.uid() IS NULL THEN 'system' ELSE 'admin' END,
      auth.uid(),
      jsonb_build_object('from', OLD.status, 'to', NEW.status));
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_log_order_timeline ON public.orders;
CREATE TRIGGER trg_log_order_timeline
AFTER INSERT OR UPDATE OF status ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.log_order_timeline();
