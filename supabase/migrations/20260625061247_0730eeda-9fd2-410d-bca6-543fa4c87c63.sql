
DROP POLICY IF EXISTS "Admins manage digital-products objects" ON storage.objects;
CREATE POLICY "Admins manage digital-products objects"
ON storage.objects FOR ALL
USING (bucket_id = 'digital-products' AND public.is_admin(auth.uid()))
WITH CHECK (bucket_id = 'digital-products' AND public.is_admin(auth.uid()));
