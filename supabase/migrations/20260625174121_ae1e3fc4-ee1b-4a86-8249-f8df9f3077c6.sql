
CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text UNIQUE NOT NULL,
  label text NOT NULL,
  subject text NOT NULL DEFAULT '',
  body_html text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  description text,
  variables jsonb DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.email_templates TO authenticated;
GRANT ALL ON public.email_templates TO service_role;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin manage email templates" ON public.email_templates;
CREATE POLICY "admin manage email templates" ON public.email_templates
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.email_system_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  from_name text DEFAULT 'Shahed IT',
  from_email text DEFAULT 'noreply@shahedit.com',
  reply_to text,
  order_confirmation_enabled boolean DEFAULT true,
  order_status_enabled boolean DEFAULT true,
  order_delivery_enabled boolean DEFAULT true,
  password_reset_enabled boolean DEFAULT true,
  welcome_email_enabled boolean DEFAULT true,
  newsletter_enabled boolean DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.email_system_settings TO authenticated;
GRANT ALL ON public.email_system_settings TO service_role;
ALTER TABLE public.email_system_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin manage email settings" ON public.email_system_settings;
CREATE POLICY "admin manage email settings" ON public.email_system_settings
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "anyone read email settings" ON public.email_system_settings;
CREATE POLICY "anyone read email settings" ON public.email_system_settings
  FOR SELECT TO authenticated USING (true);

INSERT INTO public.email_system_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.email_templates (template_key, label, subject, body_html, description, variables) VALUES
  ('order_confirmation', 'Order Confirmation', 'অর্ডার নিশ্চিত — {{order_number}}', '<p>প্রিয় {{customer_name}},</p><p>আপনার অর্ডার <b>{{order_number}}</b> গ্রহণ করা হয়েছে। মোট: ৳{{amount}}</p><p>— Shahed IT</p>', 'Sent when an order is placed.', '["customer_name","order_number","amount","product_title"]'::jsonb),
  ('order_status', 'Order Status Update', 'অর্ডার আপডেট — {{order_number}}', '<p>আপনার অর্ডার {{order_number}} এর নতুন স্ট্যাটাস: <b>{{status}}</b></p>', 'Sent when an order status changes.', '["order_number","status","customer_name"]'::jsonb),
  ('order_delivery', 'Order Delivered', 'আপনার অর্ডার ডেলিভার হয়েছে — {{order_number}}', '<p>প্রিয় {{customer_name}},<br/>আপনার অর্ডার {{order_number}} সফলভাবে ডেলিভার হয়েছে।</p>', 'Sent on delivery.', '["customer_name","order_number"]'::jsonb),
  ('password_reset', 'Password Reset', 'পাসওয়ার্ড রিসেট লিঙ্ক', '<p>আপনার পাসওয়ার্ড রিসেট করতে এই লিঙ্কে ক্লিক করুন:</p><p><a href="{{reset_url}}">{{reset_url}}</a></p>', 'Password reset email.', '["reset_url","email"]'::jsonb),
  ('welcome', 'Welcome Email', 'স্বাগতম Shahed IT-এ!', '<p>হ্যালো {{name}},</p><p>আমাদের সাথে যোগ দেওয়ার জন্য ধন্যবাদ!</p>', 'Sent to new users.', '["name","email"]'::jsonb),
  ('newsletter', 'Newsletter Default', '{{subject}}', '<div>{{content}}</div>', 'Default newsletter wrapper.', '["subject","content"]'::jsonb)
ON CONFLICT (template_key) DO NOTHING;
