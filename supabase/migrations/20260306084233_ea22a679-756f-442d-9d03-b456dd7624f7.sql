
-- ===== 1. Notifications Table =====
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage notifications"
  ON public.notifications FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- ===== 2. Client Documents Table =====
CREATE TABLE IF NOT EXISTS public.client_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_email TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'document',
  file_size BIGINT,
  uploaded_by UUID NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage client documents"
  ON public.client_documents FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Clients view own documents by email"
  ON public.client_documents FOR SELECT
  USING (
    is_visible = true AND
    client_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- ===== 3. Storage bucket for client documents =====
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'client-docs',
  'client-docs',
  false,
  52428800,
  ARRAY['application/pdf','image/jpeg','image/png','image/webp','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/zip']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admins can manage client-docs bucket"
  ON storage.objects FOR ALL
  USING (bucket_id = 'client-docs' AND is_admin(auth.uid()));

CREATE POLICY "Clients can read own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'client-docs' AND
    auth.uid() IS NOT NULL
  );
