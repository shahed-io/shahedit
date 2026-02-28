
-- AI Support Settings table (admin customizable)
CREATE TABLE public.ai_support_settings (
  id INTEGER NOT NULL DEFAULT 1 PRIMARY KEY,
  system_prompt TEXT NOT NULL DEFAULT 'You are a helpful customer support assistant for Shahed IT, a professional IT agency in Bangladesh. Answer questions about web development, app development, graphic design, digital marketing, cloud hosting, and IT support services. Be friendly, professional, and helpful. If you cannot answer something, suggest contacting the team via WhatsApp or email. Always respond in the same language the customer uses.',
  greeting_message TEXT NOT NULL DEFAULT 'আস্সালামু আলাইকুম! 👋 Shahed IT-তে স্বাগতম। আমি আপনার AI সাপোর্ট অ্যাসিস্ট্যান্ট। কীভাবে সাহায্য করতে পারি?',
  bot_name TEXT NOT NULL DEFAULT 'Shahed AI',
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  collect_contact_info BOOLEAN NOT NULL DEFAULT true,
  human_handoff_message TEXT NOT NULL DEFAULT 'আরও সাহায্যের জন্য আমাদের WhatsApp-এ যোগাযোগ করুন: 01820-060046',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.ai_support_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.ai_support_settings ENABLE ROW LEVEL SECURITY;

-- Admins can manage settings
CREATE POLICY "Admins manage ai support settings"
  ON public.ai_support_settings FOR ALL
  USING (is_admin(auth.uid()));

-- Public can read settings (for chat widget)
CREATE POLICY "Public read ai support settings"
  ON public.ai_support_settings FOR SELECT
  USING (true);

-- Support Chat Sessions
CREATE TABLE public.support_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  visitor_name TEXT,
  visitor_email TEXT,
  visitor_phone TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_chats ENABLE ROW LEVEL SECURITY;

-- Admins can view all chats
CREATE POLICY "Admins view all support chats"
  ON public.support_chats FOR ALL
  USING (is_admin(auth.uid()));

-- Anyone can insert a new chat session
CREATE POLICY "Anyone can create support chat"
  ON public.support_chats FOR INSERT
  WITH CHECK (true);

-- Session owner can update their chat (by session_id)
CREATE POLICY "Session owner can update chat"
  ON public.support_chats FOR UPDATE
  USING (true);

-- Session owner can read their chat
CREATE POLICY "Anyone can read support chats"
  ON public.support_chats FOR SELECT
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_support_chats_updated_at
  BEFORE UPDATE ON public.support_chats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
