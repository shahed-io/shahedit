
-- Fix overly permissive policies

-- Fix notifications INSERT policy (only authenticated users can insert)
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "Admins insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Fix storage.objects policies - tighten the client read policy
DROP POLICY IF EXISTS "Clients can read own files" ON storage.objects;
CREATE POLICY "Authenticated users can read client-docs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'client-docs' AND
    auth.role() = 'authenticated'
  );
