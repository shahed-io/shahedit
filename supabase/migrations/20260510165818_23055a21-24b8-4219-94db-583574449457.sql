
ALTER TABLE public.refund_requests
ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '[]'::jsonb;

INSERT INTO storage.buckets (id, name, public)
VALUES ('refund-attachments', 'refund-attachments', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own refund attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'refund-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users read own refund attachments"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'refund-attachments' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin(auth.uid())));

CREATE POLICY "Users delete own refund attachments"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'refund-attachments' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin(auth.uid())));

CREATE POLICY "Admins manage refund attachments"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'refund-attachments' AND public.is_admin(auth.uid()))
WITH CHECK (bucket_id = 'refund-attachments' AND public.is_admin(auth.uid()));
