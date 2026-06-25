
CREATE TABLE IF NOT EXISTS public.notification_channels (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  email_enabled boolean DEFAULT true,
  sms_enabled boolean DEFAULT false,
  sms_provider text DEFAULT 'twilio',
  sms_from text,
  whatsapp_enabled boolean DEFAULT true,
  whatsapp_number text DEFAULT '+8801820060046',
  whatsapp_default_message text DEFAULT 'হ্যালো Shahed IT, আমি একটি প্রশ্ন জিজ্ঞেস করতে চাই।',
  push_enabled boolean DEFAULT false,
  push_provider text DEFAULT 'web-push',
  push_vapid_public text,
  admin_alert_emails text DEFAULT 'info.shahedit@gmail.com',
  admin_alert_on_new_order boolean DEFAULT true,
  admin_alert_on_new_lead boolean DEFAULT true,
  admin_alert_on_refund boolean DEFAULT true,
  admin_alert_on_failed_payment boolean DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.notification_channels TO authenticated;
GRANT ALL ON public.notification_channels TO service_role;
ALTER TABLE public.notification_channels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin manage channels" ON public.notification_channels;
CREATE POLICY "admin manage channels" ON public.notification_channels
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "auth read channels" ON public.notification_channels;
CREATE POLICY "auth read channels" ON public.notification_channels
  FOR SELECT TO authenticated USING (true);
INSERT INTO public.notification_channels (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.notification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL,
  template_key text NOT NULL,
  label text NOT NULL,
  subject text,
  body text NOT NULL DEFAULT '',
  is_active boolean DEFAULT true,
  variables jsonb DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (channel, template_key)
);
GRANT SELECT ON public.notification_templates TO authenticated;
GRANT ALL ON public.notification_templates TO service_role;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin manage notif templates" ON public.notification_templates;
CREATE POLICY "admin manage notif templates" ON public.notification_templates
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

INSERT INTO public.notification_templates (channel, template_key, label, subject, body, variables) VALUES
  ('sms','order_confirmation','SMS — Order Confirmation',NULL,'Shahed IT: Order {{order_number}} received. Amount ৳{{amount}}. Thank you!','["order_number","amount"]'::jsonb),
  ('sms','order_delivery','SMS — Order Delivered',NULL,'Shahed IT: Order {{order_number}} has been delivered. Thank you!','["order_number"]'::jsonb),
  ('whatsapp','order_confirmation','WhatsApp — Order Confirmation',NULL,'প্রিয় {{customer_name}}, আপনার অর্ডার {{order_number}} গ্রহণ করা হয়েছে। মোট: ৳{{amount}}','["customer_name","order_number","amount"]'::jsonb),
  ('whatsapp','support_intro','WhatsApp — Support Intro',NULL,'হ্যালো Shahed IT! আমি একটি প্রশ্ন জিজ্ঞেস করতে চাই।','[]'::jsonb),
  ('push','new_order','Push — New Order','New Order Received','Order {{order_number}} for ৳{{amount}}','["order_number","amount"]'::jsonb),
  ('push','order_update','Push — Order Update','Order Update','Your order {{order_number}} is now {{status}}','["order_number","status"]'::jsonb),
  ('admin_alert','new_order','Admin — New Order','🛒 New Order: {{order_number}}','Customer: {{customer_name}} ({{customer_email}})\nProduct: {{product_title}}\nAmount: ৳{{amount}}','["order_number","customer_name","customer_email","product_title","amount"]'::jsonb),
  ('admin_alert','new_lead','Admin — New Lead','📩 New Lead from {{name}}','From: {{name}} ({{email}})\nMessage: {{message}}','["name","email","message"]'::jsonb),
  ('admin_alert','refund','Admin — Refund Request','💸 Refund Request: {{order_number}}','Customer: {{customer_name}}\nReason: {{reason}}\nAmount: ৳{{amount}}','["order_number","customer_name","reason","amount"]'::jsonb)
ON CONFLICT (channel, template_key) DO NOTHING;
